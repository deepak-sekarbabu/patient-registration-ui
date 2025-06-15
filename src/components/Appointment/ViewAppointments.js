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

  const getAppointmentTypeLabel = (type) => {
    switch (type?.toUpperCase()) {
      case 'GENERAL':
        return 'General Checkup';
      case 'SPECIALIST':
        return 'Specialist Consultation';
      case 'FOLLOW_UP':
        return 'Follow-up Visit';
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
                  <p className="appointment-date">
                    <i className="far fa-calendar"></i>
                    {formatDate(appointment.appointmentDate)}
                  </p>
                </div>
                <div className="appointment-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => {
                      /* TODO: Implement view details */
                    }}
                  >
                    View Details
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
