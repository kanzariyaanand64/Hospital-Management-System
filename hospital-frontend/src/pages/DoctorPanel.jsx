import React, { useEffect, useState } from 'react';
import api from '../api';

const DoctorPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const [statusForm, setStatusForm] = useState({
    status: 'Scheduled',
    doctorRemarks: ''
  });

  // Fetch all doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/api/doctors');
        setDoctors(res.data);
        if (res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching doctors", error);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch appointments whenever the selected doctor changes
  useEffect(() => {
    if (!selectedDoctorId) return;

    const fetchDoctorAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/appointments');
        // Filter appointments for the selected doctor
        const filtered = res.data.filter(
          appt => appt.doctor && appt.doctor.id.toString() === selectedDoctorId
        );
        setAppointments(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments", error);
        setLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, [selectedDoctorId]);

  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
  };

  const handleOpenStatusModal = (appt) => {
    setSelectedAppt(appt);
    setStatusForm({
      status: appt.status || 'Scheduled',
      doctorRemarks: appt.doctorRemarks || ''
    });
    setShowStatusModal(true);
  };

  const handleStatusFormChange = (e) => {
    const { name, value } = e.target;
    setStatusForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      setUpdating(true);
      const payload = {
        id: selectedAppt.id,
        patient: { id: selectedAppt.patient.id },
        doctor: { id: selectedAppt.doctor.id },
        appointmentDate: selectedAppt.appointmentDate,
        appointmentTime: selectedAppt.appointmentTime,
        status: statusForm.status,
        reason: selectedAppt.reason,
        doctorRemarks: statusForm.doctorRemarks
      };

      await api.put(`/api/appointments/${selectedAppt.id}`, payload);
      
      // Refresh local list
      const res = await api.get('/api/appointments');
      const filtered = res.data.filter(
        appt => appt.doctor && appt.doctor.id.toString() === selectedDoctorId
      );
      setAppointments(filtered);
      
      setShowStatusModal(false);
      setSelectedAppt(null);
      setUpdating(false);
    } catch (error) {
      console.error("Error updating appointment status", error);
      alert("Failed to update status. Please try again.");
      setUpdating(false);
    }
  };

  // Helper to compare dates
  const getTodayISOString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayISOString();

  // Categorize & sort appointments
  // 1. Today's active queue: Date is today. Sorted chronologically.
  // 2. Upcoming queue: Date is in the future. Sorted chronologically.
  // 3. Past/Completed queue: Date is in the past, or status is Completed/Cancelled.
  
  const todayQueue = appointments
    .filter(appt => appt.appointmentDate === todayStr && appt.status !== 'Completed' && appt.status !== 'Cancelled')
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const upcomingQueue = appointments
    .filter(appt => appt.appointmentDate > todayStr && appt.status !== 'Completed' && appt.status !== 'Cancelled')
    .sort((a, b) => {
      const dateDiff = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateDiff !== 0) return dateDiff;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    });

  const historyQueue = appointments
    .filter(appt => appt.appointmentDate < todayStr || appt.status === 'Completed' || appt.status === 'Cancelled')
    .sort((a, b) => {
      const dateDiff = b.appointmentDate.localeCompare(a.appointmentDate);
      if (dateDiff !== 0) return dateDiff;
      return b.appointmentTime.localeCompare(a.appointmentTime);
    });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      case 'In Progress': return 'badge-info';
      case 'Absent': return 'badge-secondary';
      default: return 'badge-warning';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Doctor Queue & Panel</h1>
          <p>Select your name to check active patient queues, update consulting statuses, and write prescriptions.</p>
        </div>
        <div className="page-actions" style={{ minWidth: '250px' }}>
          <label className="form-label" style={{ marginBottom: '4px', fontWeight: 'bold' }}>Select Doctor</label>
          <select 
            className="form-control" 
            value={selectedDoctorId} 
            onChange={handleDoctorChange}
            style={{ width: '100%', padding: '10px' }}
          >
            {doctors.length === 0 ? (
              <option value="">No doctors registered</option>
            ) : (
              doctors.map(doc => (
                <option key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.specialization})</option>
              ))
            )}
          </select>
        </div>
      </div>

      {!selectedDoctorId ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-user-md"></i>
            <h3>No Doctor Selected</h3>
            <p>Please register a doctor first or select a doctor from the top dropdown list.</p>
          </div>
        </div>
      ) : loading ? (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '20px' }}>Loading appointment queue...</p>
        </div>
      ) : (
        <div className="doctor-queue-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* 1. TODAY'S ACTIVE QUEUE */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }}></i>
                Today's Active Queue (Chronological)
              </h2>
              <span className="badge badge-info">{todayQueue.length} Pending Today</span>
            </div>
            
            {todayQueue.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <p className="text-secondary">No active appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Time</th>
                      <th>Patient Details</th>
                      <th>Reason for Visit</th>
                      <th style={{ width: '120px' }}>Status</th>
                      <th style={{ width: '140px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayQueue.map(appt => (
                      <tr key={appt.id} style={{ backgroundColor: appt.status === 'In Progress' ? 'rgba(15, 118, 110, 0.05)' : 'inherit' }}>
                        <td>
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {appt.appointmentTime.substring(0, 5)}
                          </span>
                        </td>
                        <td>
                          <div className="patient-info-mini">
                            <span className="patient-name">{appt.patient.name}</span>
                            <span className="patient-details">Age: {appt.patient.age} | {appt.patient.gender} | Contact: {appt.patient.contactNumber}</span>
                          </div>
                        </td>
                        <td>{appt.reason || '-'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenStatusModal(appt)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <i className="fa-solid fa-stethoscope"></i> Consult
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. UPCOMING QUEUE */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-calendar-days" style={{ color: '#8b5cf6' }}></i>
                Upcoming Bookings
              </h2>
            </div>
            
            {upcomingQueue.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <p className="text-secondary">No future appointments scheduled.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Date / Time</th>
                      <th>Patient</th>
                      <th>Reason for Visit</th>
                      <th style={{ width: '120px' }}>Status</th>
                      <th style={{ width: '140px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingQueue.map(appt => (
                      <tr key={appt.id}>
                        <td>
                          <strong>{appt.appointmentDate}</strong>
                          <br />
                          <span className="text-secondary">{appt.appointmentTime.substring(0, 5)}</span>
                        </td>
                        <td>
                          <div className="patient-info-mini">
                            <span className="patient-name">{appt.patient.name}</span>
                            <span className="patient-details">Age: {appt.patient.age} | {appt.patient.gender}</span>
                          </div>
                        </td>
                        <td>{appt.reason || '-'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenStatusModal(appt)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Update Notes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. HISTORY / PAST CONSULTATIONS */}
          <div className="card" style={{ opacity: 0.9 }}>
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-folder-open" style={{ color: '#64748b' }}></i>
                Consultation History & Completed Sessions
              </h2>
            </div>
            
            {historyQueue.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <p className="text-secondary">No past consultation records.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Date / Time</th>
                      <th>Patient</th>
                      <th>Status</th>
                      <th>Diagnosis / Doctor's Remarks</th>
                      <th style={{ width: '100px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQueue.map(appt => (
                      <tr key={appt.id}>
                        <td>
                          <span>{appt.appointmentDate}</span>
                          <br />
                          <span className="text-secondary">{appt.appointmentTime.substring(0, 5)}</span>
                        </td>
                        <td>
                          <div className="patient-info-mini">
                            <span className="patient-name">{appt.patient.name}</span>
                            <span className="patient-details">Age: {appt.patient.age} | {appt.patient.gender}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px', fontSize: '0.9rem', fontStyle: 'italic', color: '#0f766e' }}>
                            <strong>Remarks:</strong> {appt.doctorRemarks || <span className="text-secondary">No notes written.</span>}
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenStatusModal(appt)}
                          >
                            Edit Notes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consultation & Remarks Modal */}
      {showStatusModal && selectedAppt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Consultation: {selectedAppt.patient.name} (ID: #{selectedAppt.id})</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(15, 118, 110, 0.05)', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 5px 0' }}><strong>Patient Reason:</strong> {selectedAppt.reason || 'None provided'}</p>
                  <p style={{ margin: '0' }}><strong>Scheduled Time:</strong> {selectedAppt.appointmentDate} at {selectedAppt.appointmentTime.substring(0, 5)}</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Consultation Status *</label>
                    <select 
                      name="status" 
                      required 
                      className="form-control"
                      value={statusForm.status}
                      onChange={handleStatusFormChange}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Absent">Absent (Missed)</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="form-label">Doctor's Diagnosis & Prescription (Remarks)</label>
                    <textarea 
                      name="doctorRemarks" 
                      className="form-control"
                      rows={5}
                      placeholder="Enter prescription, diagnosis, follow-up advice, and notes here..."
                      value={statusForm.doctorRemarks}
                      onChange={handleStatusFormChange}
                      style={{ height: 'auto' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)} disabled={updating}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Consultation Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPanel;
