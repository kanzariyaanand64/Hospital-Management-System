import React, { useEffect, useState } from 'react';
import api from '../api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    status: 'Scheduled',
    reason: '',
    doctorRemarks: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/patients'),
        api.get('/api/doctors')
      ]);
      setAppointments(apptsRes.data);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setFormData({
      id: null,
      patientId: patients.length > 0 ? patients[0].id : '',
      doctorId: doctors.length > 0 ? doctors[0].id : '',
      appointmentDate: '',
      appointmentTime: '',
      status: 'Scheduled',
      reason: '',
      doctorRemarks: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (appt) => {
    setIsEdit(true);
    setFormData({
      id: appt.id,
      patientId: appt.patient.id,
      doctorId: appt.doctor.id,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      status: appt.status,
      reason: appt.reason || '',
      doctorRemarks: appt.doctorRemarks || ''
    });
    setShowModal(true);
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("Are you sure you want to cancel/delete this appointment?")) {
      try {
        await api.delete(`/api/appointments/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting appointment", error);
        alert("Failed to delete appointment.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate selections
    if (!formData.patientId || !formData.doctorId) {
      alert("Please select both a patient and a doctor.");
      return;
    }

    const payload = {
      id: formData.id,
      patient: { id: parseInt(formData.patientId) },
      doctor: { id: parseInt(formData.doctorId) },
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime.length === 5 ? `${formData.appointmentTime}:00` : formData.appointmentTime,
      status: formData.status,
      reason: formData.reason,
      doctorRemarks: formData.doctorRemarks
    };

    try {
      if (isEdit) {
        await api.put(`/api/appointments/${formData.id}`, payload);
      } else {
        await api.post('/api/appointments', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving appointment", error);
      alert("Error booking appointment. Ensure date, time and connections are correct.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Manage Appointments</h1>
          <p>Book new consultations, reschedule active sessions, and update statuses.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenAddModal} disabled={patients.length === 0 || doctors.length === 0}>
            <i className="fa-solid fa-plus"></i> Schedule Appointment
          </button>
        </div>
      </div>

      {patients.length === 0 || doctors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <h3>Prerequisites Missing</h3>
            <p>You must have at least one Patient and one Doctor registered before scheduling an appointment.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-calendar-days"></i>
              <h3>No Appointments Scheduled</h3>
              <p>Schedule your first consultation today.</p>
              <button className="btn btn-primary" onClick={handleOpenAddModal}>
                Schedule Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient Name</th>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Date / Time</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Doctor Remarks</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>#{appt.id}</td>
                      <td>
                        <div className="patient-info-mini">
                          <span className="patient-name">{appt.patient.name}</span>
                          <span className="patient-details">Age: {appt.patient.age} | {appt.patient.gender}</span>
                        </div>
                      </td>
                      <td>Dr. {appt.doctor.name}</td>
                      <td><span className="badge badge-info">{appt.doctor.specialization}</span></td>
                      <td><strong>{appt.appointmentDate}</strong><br /><span className="text-secondary">{appt.appointmentTime.substring(0, 5)}</span></td>
                      <td>
                        <span className={`badge ${
                          appt.status === 'Completed' ? 'badge-success' :
                          appt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{appt.reason || '-'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#0f766e', fontStyle: 'italic' }}>
                          {appt.doctorRemarks || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn btn-secondary btn-sm btn-icon-only" 
                            onClick={() => handleOpenEditModal(appt)}
                            title="Reschedule / Edit"
                          >
                            <i className="fa-solid fa-calendar-day"></i>
                          </button>
                          <button 
                            className="btn btn-danger btn-sm btn-icon-only" 
                            onClick={() => handleDeleteAppointment(appt.id)}
                            title="Cancel Appointment"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Book / Edit Appointment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEdit ? 'Modify Appointment Details' : 'Book New Consultation'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Select Patient *</label>
                    <select 
                      name="patientId" 
                      required 
                      className="form-control"
                      value={formData.patientId}
                      onChange={handleChange}
                      disabled={isEdit}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (ID: #{p.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Doctor *</label>
                    <select 
                      name="doctorId" 
                      required 
                      className="form-control"
                      value={formData.doctorId}
                      onChange={handleChange}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Appointment Date *</label>
                    <input 
                      type="date" 
                      name="appointmentDate" 
                      required 
                      className="form-control"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Appointment Time *</label>
                    <input 
                      type="time" 
                      name="appointmentTime" 
                      required 
                      className="form-control"
                      value={formData.appointmentTime}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Status *</label>
                    <select 
                      name="status" 
                      className="form-control"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Absent">Absent (Missed)</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Reason for Appointment / Diagnosis</label>
                    <textarea 
                      name="reason" 
                      className="form-control"
                      placeholder="e.g. Regular health checkup, Cardiac consultation..."
                      value={formData.reason}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Doctor Remarks (Diagnosis & Prescription)</label>
                    <textarea 
                      name="doctorRemarks" 
                      className="form-control"
                      placeholder="e.g. Prescribed Aspirin 75mg once daily..."
                      value={formData.doctorRemarks}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Save Changes' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
