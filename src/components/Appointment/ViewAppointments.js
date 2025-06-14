import React from 'react';
import '../../styles/components/Appointment.css';

const ViewAppointments = () => {
  return (
    <div className="appointment-container">
      <div className="form-header">
        <h2>Your Appointments</h2>
        <p className="text-muted">View and manage your current and upcoming appointments</p>
      </div>

      <div className="appointments-content">
        <p>This page will display your current and past appointments.</p>
        {/* TODO: Implement logic to fetch and display appointments */}
      </div>
    </div>
  );
};

export default ViewAppointments;
