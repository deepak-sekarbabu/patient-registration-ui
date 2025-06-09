import React from 'react';
import '../../styles/components/Appointment.css'; // Assuming some shared styling

const ViewAppointments = () => {
  return (
    <div className="view-appointments-container">
      <h3>Your Appointments</h3>
      <p>This page will display your current and past appointments.</p>
      {/* TODO: Implement logic to fetch and display appointments */}
    </div>
  );
};

export default ViewAppointments;
