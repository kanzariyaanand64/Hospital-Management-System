import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    age: '',
    gender: 'Male',
    contactNumber: '',
    email: '',
    address: '',
    medicalHistory: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/patients');
      setPatients(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching patients", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setFormData({
      id: null,
      name: '',
      age: '',
      gender: 'Male',
      contactNumber: '',
      email: '',
      address: '',
      medicalHistory: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (patient) => {
    setIsEdit(true);
    setFormData({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      email: patient.email || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || ''
    });
    setShowModal(true);
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      try {
        await axios.delete(`http://localhost:8080/api/patients/${id}`);
        fetchPatients();
      } catch (error) {
        alert("Failed to delete patient. Ensure they have no active appointments.");
        console.error("Error deleting patient", error);
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
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/patients/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/patients', formData);
      }
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      console.error("Error saving patient details", error);
      alert("Error saving patient details. Please check the fields.");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.contactNumber.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Manage Patients</h1>
          <p>Register new patients, update records, and view profiles.</p>
        </div>
        <div className="page-actions">
          <div className="search-container">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Search by name or contact..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i> Add Patient
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading patient records...</p>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-user-injured"></i>
            <h3>No Patients Found</h3>
            <p>Try searching for another name or register a new patient.</p>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              Register Patient
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age / Gender</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Medical History</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>#{patient.id}</td>
                    <td><strong className="patient-name">{patient.name}</strong></td>
                    <td>{patient.age} Yrs / {patient.gender}</td>
                    <td>{patient.contactNumber}</td>
                    <td>{patient.email || '-'}</td>
                    <td>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {patient.medicalHistory ? (patient.medicalHistory.length > 40 ? patient.medicalHistory.substring(0, 40) + '...' : patient.medicalHistory) : 'No history recorded'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-secondary btn-sm btn-icon-only" 
                          onClick={() => handleOpenEditModal(patient)}
                          title="Edit Profile"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          className="btn btn-danger btn-sm btn-icon-only" 
                          onClick={() => handleDeletePatient(patient.id)}
                          title="Delete Record"
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

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Patient Profile' : 'Register New Patient'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      className="form-control" 
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <input 
                      type="number" 
                      name="age" 
                      required 
                      min="0"
                      max="150"
                      className="form-control" 
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select 
                      name="gender" 
                      className="form-control" 
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number *</label>
                    <input 
                      type="text" 
                      name="contactNumber" 
                      required 
                      className="form-control" 
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Home Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      className="form-control" 
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Medical History / Allergies / Notes</label>
                    <textarea 
                      name="medicalHistory" 
                      className="form-control" 
                      placeholder="e.g. Hypertension, Penicillin allergy..."
                      value={formData.medicalHistory}
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
                  {isEdit ? 'Save Changes' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
