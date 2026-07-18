import React, { useEffect, useState } from 'react';
import api from '../api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    specialization: '',
    contactNumber: '',
    email: '',
    department: ''
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/doctors');
      setDoctors(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctors", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setFormData({
      id: null,
      name: '',
      specialization: '',
      contactNumber: '',
      email: '',
      department: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (doctor) => {
    setIsEdit(true);
    setFormData({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      contactNumber: doctor.contactNumber,
      email: doctor.email || '',
      department: doctor.department || ''
    });
    setShowModal(true);
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor record?")) {
      try {
        await api.delete(`/api/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        alert("Failed to delete doctor. Ensure they have no scheduled appointments.");
        console.error("Error deleting doctor", error);
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
        await api.put(`/api/doctors/${formData.id}`, formData);
      } else {
        await api.post('/api/doctors', formData);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor details", error);
      alert("Error saving doctor details. Please check the fields.");
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Manage Doctors</h1>
          <p>Register new doctors, adjust departments, and manage specialties.</p>
        </div>
        <div className="page-actions">
          <div className="search-container">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Search specialty, name..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i> Add Doctor
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading doctor records...</p>
        ) : filteredDoctors.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-user-md"></i>
            <h3>No Doctors Found</h3>
            <p>Try searching for another specialty or register a new doctor.</p>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              Register Doctor
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>#{doctor.id}</td>
                    <td><strong>Dr. {doctor.name}</strong></td>
                    <td><span className="badge badge-info">{doctor.specialization}</span></td>
                    <td>{doctor.department || '-'}</td>
                    <td>{doctor.contactNumber}</td>
                    <td>{doctor.email || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn btn-secondary btn-sm btn-icon-only" 
                          onClick={() => handleOpenEditModal(doctor)}
                          title="Edit Profile"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          className="btn btn-danger btn-sm btn-icon-only" 
                          onClick={() => handleDeleteDoctor(doctor.id)}
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

      {/* Add / Edit Doctor Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Doctor Profile' : 'Register New Doctor'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Doctor Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="e.g. Anand Kanzariya"
                      className="form-control" 
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <input 
                      type="text" 
                      name="specialization" 
                      required 
                      placeholder="e.g. Cardiologist, Neurologist"
                      className="form-control" 
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      name="department" 
                      placeholder="e.g. Cardiology, Pediatrics"
                      className="form-control" 
                      value={formData.department}
                      onChange={handleChange}
                    />
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
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Save Changes' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
