import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Stethoscope, MapPin, AlertCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppointmentForm = ({ onAppointmentBooked }) => {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: 1, // This would come from your auth context
    appointmentType: '',
    appointmentFor: '',
    appointmentForName: '',
    appointmentForAge: '',
    symptom: '',
    otherSymptoms: '',
    appointmentDate: '',
    clinicId: '',
    doctorId: '',
    slotId: '',
  });

  const [errors, setErrors] = useState({});
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with your API calls
  const appointmentTypes = [
    { value: 'GENERAL_CHECKUP', label: 'General Checkup' },
    { value: 'DENTAL', label: 'Dental Checkup' },
    { value: 'VACCINATION', label: 'Vaccination' },
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up' },
  ];

  const appointmentForOptions = [
    { value: 'SELF', label: 'Self' },
    { value: 'FAMILY_MEMBER', label: 'Family Member' },
    { value: 'DEPENDENT', label: 'Dependent' },
  ];

  const symptoms = [
    { value: 'FEVER', label: 'Fever' },
    { value: 'HEADACHE', label: 'Headache' },
    { value: 'COUGH', label: 'Cough' },
    { value: 'NAUSEA', label: 'Nausea' },
    { value: 'FATIGUE', label: 'Fatigue' },
    { value: 'SORE_THROAT', label: 'Sore Throat' },
    { value: 'SHORTNESS_OF_BREATH', label: 'Shortness of Breath' },
    { value: 'BODY_ACHES', label: 'Body Aches' },
    { value: 'LOSS_OF_TASTE_OR_SMELL', label: 'Loss of Taste or Smell' },
    { value: 'RASH', label: 'Rash' },
    { value: 'OTHER', label: 'Other' },
  ];

  const clinics = [
    { id: 1, name: 'City General Hospital' },
    { id: 2, name: 'Downtown Medical Center' },
    { id: 3, name: 'Sunrise Clinic' },
  ];

  // Mock doctors data
  const mockDoctors = useMemo(
    () => [
      { id: 101, name: 'Dr. Sarah Johnson', specialization: 'General Medicine', clinicId: 1 },
      { id: 102, name: 'Dr. Michael Chen', specialization: 'Internal Medicine', clinicId: 1 },
      { id: 201, name: 'Dr. Emily Davis', specialization: 'Family Medicine', clinicId: 2 },
      { id: 202, name: 'Dr. Robert Wilson', specialization: 'Cardiology', clinicId: 2 },
    ],
    []
  );

  // Mock slots data
  const mockSlots = useMemo(
    () => [
      { id: 1, doctorId: 101, date: '2023-06-01', time: '09:00', booked: false },
      { id: 2, doctorId: 101, date: '2023-06-01', time: '10:00', booked: false },
      { id: 3, doctorId: 102, date: '2023-06-01', time: '11:00', booked: true },
    ],
    []
  );

  // Load doctors when clinic is selected
  useEffect(() => {
    if (formData.clinicId) {
      const filteredDoctors = mockDoctors.filter(
        (doctor) => doctor.clinicId.toString() === formData.clinicId
      );
      setAvailableDoctors(filteredDoctors);
      setFormData((prev) => ({ ...prev, doctorId: '', slotId: '' }));
    } else {
      setAvailableDoctors([]);
    }
  }, [formData.clinicId, mockDoctors]);

  // Load slots when clinic, doctor, and date are selected
  useEffect(() => {
    if (formData.clinicId && formData.doctorId && formData.appointmentDate) {
      // In real app, you'd make an API call here
      setAvailableSlots(mockSlots);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.clinicId, formData.doctorId, formData.appointmentDate, mockSlots]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for specific fields
    if (name === 'appointmentForName') {
      // Only allow letters and spaces
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (name === 'appointmentForAge') {
      // Only allow numbers
      if (!/^\d*$/.test(value)) return;
    }

    if (name === 'otherSymptoms') {
      // Limit to 100 characters
      if (value.length > 100) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.appointmentType) newErrors.appointmentType = 'Appointment type is required';
    if (!formData.appointmentFor) newErrors.appointmentFor = 'Appointment for is required';
    if (!formData.appointmentForName.trim()) newErrors.appointmentForName = 'Name is required';
    if (!formData.appointmentForAge) newErrors.appointmentForAge = 'Age is required';
    if (
      formData.appointmentForAge &&
      (parseInt(formData.appointmentForAge) < 1 || parseInt(formData.appointmentForAge) > 120)
    ) {
      newErrors.appointmentForAge = 'Age must be between 1 and 120';
    }
    if (!formData.symptom) newErrors.symptom = 'Symptom is required';
    if (formData.symptom === 'OTHER' && !formData.otherSymptoms.trim()) {
      newErrors.otherSymptoms = 'Please describe other symptoms';
    }
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!formData.clinicId) newErrors.clinicId = 'Clinic selection is required';
    if (!formData.doctorId) newErrors.doctorId = 'Doctor selection is required';
    if (!formData.slotId) newErrors.slotId = 'Time slot selection is required';

    // Check if appointment date is in the past
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Convert form data to the required format
      const appointmentData = {
        patientId: formData.patientId,
        appointmentType: formData.appointmentType,
        appointmentFor: formData.appointmentFor,
        appointmentForName: formData.appointmentForName,
        appointmentForAge: parseInt(formData.appointmentForAge),
        symptom: formData.symptom,
        otherSymptoms: formData.otherSymptoms,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        clinicId: parseInt(formData.clinicId),
        doctorId: parseInt(formData.doctorId),
        slotId: formData.slotId,
        active: true,
      };

      console.log('Submitting appointment data:', appointmentData);

      // Replace with your actual API call
      // const response = await fetch('/api/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appointmentData)
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      const successMessage = 'Appointment booked successfully!';
      alert(successMessage);
      handleSubmitSuccess();

      // Reset form
      setFormData({
        patientId: 1,
        appointmentType: '',
        appointmentFor: '',
        appointmentForName: '',
        appointmentForAge: '',
        symptom: '',
        otherSymptoms: '',
        appointmentDate: '',
        clinicId: '',
        doctorId: '',
        slotId: '',
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const handleNewAppointment = () => {
    setShowForm(true);
  };

  const handleSubmitSuccess = () => {
    setShowForm(false);
    if (onAppointmentBooked) {
      onAppointmentBooked();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Please log in to book an appointment
        </h2>
        <p className="text-gray-600">
          You need to be logged in to access the appointment booking system.
        </p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-blue-100 p-4 rounded-full mb-6">
            <PlusCircle className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Book a New Appointment</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Schedule your medical appointment with our qualified doctors at your convenience.
          </p>
          <button
            onClick={handleNewAppointment}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Medical Appointment</h2>
        <p className="text-gray-600">Fill in the details below to schedule your appointment</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Stethoscope className="inline w-4 h-4 mr-1" />
              Appointment Type *
            </label>
            <select
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointmentType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select appointment type</option>
              {appointmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.appointmentType && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.appointmentType}
              </p>
            )}
          </div>

          {/* Appointment For */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Appointment For *
            </label>
            <select
              name="appointmentFor"
              value={formData.appointmentFor}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointmentFor ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select who this appointment is for</option>
              {appointmentForOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.appointmentFor && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.appointmentFor}
              </p>
            )}
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
            <input
              type="text"
              name="appointmentForName"
              value={formData.appointmentForName}
              onChange={handleInputChange}
              placeholder="Enter patient name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointmentForName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.appointmentForName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.appointmentForName}
              </p>
            )}
          </div>

          {/* Patient Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Age *</label>
            <input
              type="text"
              name="appointmentForAge"
              value={formData.appointmentForAge}
              onChange={handleInputChange}
              placeholder="Enter age"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointmentForAge ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.appointmentForAge && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.appointmentForAge}
              </p>
            )}
          </div>

          {/* Symptom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Symptom *
            </label>
            <select
              name="symptom"
              value={formData.symptom}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.symptom ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select primary symptom</option>
              {symptoms.map((symptom) => (
                <option key={symptom.value} value={symptom.value}>
                  {symptom.label}
                </option>
              ))}
            </select>
            {errors.symptom && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.symptom}
              </p>
            )}
          </div>

          {/* Other Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Symptoms {formData.symptom === 'OTHER' && '*'}
            </label>
            <textarea
              name="otherSymptoms"
              value={formData.otherSymptoms}
              onChange={handleInputChange}
              placeholder="Describe other symptoms (max 100 characters)"
              rows="3"
              maxLength="100"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.otherSymptoms ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.otherSymptoms.length}/100 characters
            </div>
            {errors.otherSymptoms && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.otherSymptoms}
              </p>
            )}
          </div>

          {/* Appointment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Appointment Date *
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              min={today}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.appointmentDate && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.appointmentDate}
              </p>
            )}
          </div>

          {/* Clinic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Clinic *
            </label>
            <select
              name="clinicId"
              value={formData.clinicId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.clinicId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select clinic</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            {errors.clinicId && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.clinicId}
              </p>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              disabled={!formData.clinicId}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.doctorId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select doctor</option>
              {availableDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.doctorId}
              </p>
            )}
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Time Slot *
            </label>
            <select
              name="slotId"
              value={formData.slotId}
              onChange={handleInputChange}
              disabled={!formData.clinicId || !formData.doctorId || !formData.appointmentDate}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.slotId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select time slot</option>
              {availableSlots
                .filter((slot) => slot.available)
                .map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.time}
                  </option>
                ))}
            </select>
            {errors.slotId && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.slotId}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Booking Appointment...' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;

// Add this component to your routes or parent component like this:
// <Route path="/appointments" element={<AppointmentForm />} />
