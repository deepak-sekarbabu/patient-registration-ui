import { Check } from 'lucide-react';
import React from 'react';

const AppointmentSuccess = ({ appointmentId, navigate }) => (
  <div className="appointment-success">
    <div className="success-icon">
      <Check size={48} />
    </div>
    <h3>Appointment {appointmentId} Booked Successfully!</h3>
    <p>Your appointment has been scheduled successfully.</p>
    <button className="btn btn-primary" onClick={() => navigate('/view-appointments')}>
      View Appointments
    </button>
  </div>
);

export default AppointmentSuccess;
