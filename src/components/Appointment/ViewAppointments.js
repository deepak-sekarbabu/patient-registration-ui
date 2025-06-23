import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientAppointments } from '../../services/appointmentService';
import '../../styles/components/Appointment.css';

// ViewAppointments component displays a list of current and past appointments
// Enhanced for accessibility, responsiveness, and maintainability
const ViewAppointments = () => {
  const { patient, token, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated || !patient?.id || !token) {
        setError('Please login to view your appointments');
        setLoading(false);
        return;
      }

      try {
        const data = await getPatientAppointments(patient.id, token);
        setAppointments(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, patient, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getAppointmentTypeLabel = (type) => {
    switch (type?.toUpperCase()) {
      case 'CONSULTATION':
        return 'Consultation';
      case 'FOLLOW_UP':
        return 'Follow-up Visit';
      case 'ROUTINE_CHECKUP':
        return 'Routine Checkup';
      case 'EMERGENCY':
        return 'Emergency';
      case 'VACCINATION':
        return 'Vaccination';
      case 'DIAGNOSTIC_TEST':
        return 'Diagnostic Test';
      case 'PROCEDURE':
        return 'Procedure';
      case 'OTHER':
        return 'Other';
      default:
        return type || 'Not specified';
    }
  };

  const getAppointmentForLabel = (appointmentFor) => {
    switch (appointmentFor?.toUpperCase()) {
      case 'SELF':
        return 'Self';
      case 'FAMILY':
        return 'Family Member';
      default:
        return appointmentFor || 'Not specified';
    }
  };

  const getSymptomLabel = (symptom) => {
    switch (symptom?.toUpperCase()) {
      case 'FEVER':
        return 'Fever';
      case 'COLD':
        return 'Cold & Cough';
      case 'HEADACHE':
        return 'Headache';
      case 'STOMACH':
        return 'Stomach Pain';
      default:
        return symptom || 'Not specified';
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      // TODO: Implement appointment cancellation
      console.log('Cancelling appointment:', appointmentId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="appointment-container">
        <div className="error-message">Please login to view your appointments</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="appointment-container">
        <div className="loading-spinner">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <section
      className="appointment-container"
      aria-labelledby="appointments-heading"
      tabIndex={-1} // Allows section to be focused for accessibility
    >
      <header className="form-header">
        <h2 id="appointments-heading">Your Appointments</h2>
        <p className="text-muted" id="appointments-desc">
          View and manage your current and upcoming appointments
        </p>
      </header>

      <main className="appointments-content" aria-describedby="appointments-desc">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <p>You don't have any appointments scheduled.</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.map((appointment) => (
              <div key={appointment.appointmentId} className="appointment-card">
                <div className="appointment-header">
                  <h3>Appointment #{appointment.appointmentId}</h3>
                  <span
                    className={`status-badge ${appointment.active ? 'status-scheduled' : 'status-completed'}`}
                  >
                    {appointment.active ? 'Active' : 'Completed'}
                  </span>
                </div>
                <div className="appointment-details">
                  <div className="doctor-clinic-info">
                    <p className="doctor-name">
                      <i className="fas fa-user-md"></i>
                      {appointment.doctorName || 'Doctor not assigned'}
                    </p>
                    <p className="clinic-name">
                      <i className="fas fa-hospital"></i>
                      {appointment.clinicName || 'Clinic not specified'}
                    </p>
                  </div>
                  <p className="appointment-type">
                    <i className="fas fa-stethoscope"></i>
                    {getAppointmentTypeLabel(appointment.appointmentType)}
                  </p>
                  <p className="appointment-for">
                    <i className="fas fa-user"></i>
                    {getAppointmentForLabel(appointment.appointmentFor)}
                    {appointment.appointmentForName && ` - ${appointment.appointmentForName}`}
                    {appointment.appointmentForAge && ` (${appointment.appointmentForAge} years)`}
                  </p>
                  <p className="appointment-symptom">
                    <i className="fas fa-notes-medical"></i>
                    {getSymptomLabel(appointment.symptom)}
                    {appointment.otherSymptoms && ` - ${appointment.otherSymptoms}`}
                  </p>
                  <div className="appointment-datetime">
                    <p className="appointment-date">
                      <i className="far fa-calendar"></i>
                      {formatDate(appointment.appointmentDate)}
                    </p>
                    <p className="appointment-time">
                      <i className="far fa-clock"></i>
                      {formatTime(appointment.slotTime)}
                    </p>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button
                    className="cancel-appointment-btn"
                    onClick={() => handleCancelAppointment(appointment.appointmentId)}
                    aria-label={`Cancel appointment with ID ${appointment.appointmentId}`}
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </section>
  );
};

export default ViewAppointments;
