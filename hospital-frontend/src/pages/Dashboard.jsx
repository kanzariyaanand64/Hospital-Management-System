import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    appointmentsCount: 0,
    scheduledCount: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/patients'),
          axios.get('http://localhost:8080/api/doctors'),
          axios.get('http://localhost:8080/api/appointments')
        ]);

        const appts = appointmentsRes.data;
        const scheduled = appts.filter(a => a.status === 'Scheduled').length;

        setStats({
          patientsCount: patientsRes.data.length,
          doctorsCount: doctorsRes.data.length,
          appointmentsCount: appts.length,
          scheduledCount: scheduled
        });

        // Get recent/upcoming appointments (sorted by date, time)
        const sortedAppts = [...appts].sort((a, b) => {
          const dateDiff = new Date(a.appointmentDate) - new Date(b.appointmentDate);
          if (dateDiff !== 0) return dateDiff;
          return a.appointmentTime.localeCompare(b.appointmentTime);
        });

        setAppointments(sortedAppts.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard statistics", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Welcome to Lifeline Dashboard</h1>
          <p>Real-time analytics and management for Lifeline Hospital.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card" style={{ '--accent': '#0f766e' }}>
          <div className="stat-icon">
            <i className="fa-solid fa-user-injured"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.patientsCount}</span>
            <span className="stat-label">Total Patients</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <i className="fa-solid fa-user-md"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.doctorsCount}</span>
            <span className="stat-label">Active Doctors</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.appointmentsCount}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.scheduledCount}</span>
            <span className="stat-label">Scheduled Appts</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upcoming Appointments</h2>
        </div>
        
        {loading ? (
          <p>Loading recent data...</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-calendar-times"></i>
            <h3>No Appointments</h3>
            <p>There are no appointments scheduled in the system.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="patient-info-mini">
                        <span className="patient-name">{appt.patient.name}</span>
                        <span className="patient-details">Age: {appt.patient.age} | {appt.patient.gender}</span>
                      </div>
                    </td>
                    <td>Dr. {appt.doctor.name} ({appt.doctor.specialization})</td>
                    <td>{appt.appointmentDate}</td>
                    <td>{appt.appointmentTime.substring(0, 5)}</td>
                    <td>
                      <span className={`badge ${
                        appt.status === 'Completed' ? 'badge-success' :
                        appt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
