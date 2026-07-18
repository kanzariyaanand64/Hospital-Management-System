import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <i className="fa-solid fa-heart-pulse"></i>
        <span>Lifeline</span>
      </NavLink>
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-user-injured"></i>
            <span>Patients</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/doctors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-user-md"></i>
            <span>Doctors</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-check"></i>
            <span>Appointments</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/doctor-panel" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-user-doctor"></i>
            <span>Doctor Panel</span>
          </NavLink>
        </li>
      </ul>
      <div className="sidebar-footer">
        <p>&copy; 2026 Lifeline HMS</p>
        <p>Internship Project</p>
      </div>
    </aside>
  );
};

export default Sidebar;
