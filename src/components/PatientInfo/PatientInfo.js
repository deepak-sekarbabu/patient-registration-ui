import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation
import '../../styles/components/PatientInfo.css';
import ChangePasswordModal from '../PasswordChange/ChangePasswordModal';
import LoadingSpinner from '../shared/LoadingSpinner';
// import patientService from '../../services/api'; // No longer used for changePassword
import authService from '../../services/auth'; // Added for changePassword
import { debugLog } from '../../utils/debugUtils';
import ErrorAlert from '../shared/ErrorAlert';
import PatientFullEditForm from './PatientFullEditForm';
import PatientInfoView from './PatientInfoView';
import PatientQuickEditForm from './PatientQuickEditForm';

const PatientInfo = ({ patient, onUpdate, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation

  const [quickEditMode, setQuickEditMode] = useState(false);
  const [fullEditMode, setFullEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [patientDataLoaded, setPatientDataLoaded] = useState(false); // To be removed
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [errors] = useState({});

  const stripCountryCode = (phone) => {
    if (typeof phone === 'string' && phone.startsWith('+91')) {
      return phone.replace(/^\+91/, '');
    }
    return phone;
  };

  useEffect(() => {
    debugLog('PATIENT_INFO', 'useEffect triggered. Patient prop:', patient);
    if (patient) {
      processPatientData(patient);
    } else {
      // If patient is null, AuthContext is still loading or user is not authenticated.
      // ProtectedRoute should handle redirection if not authenticated.
      // This component will show its own "Loading..." (from `if (!patient) return ...`)
      // or nothing if AuthContext.loading is true and ProtectedRoute handles that.
      debugLog('PATIENT_INFO', 'Patient prop is null. Relying on AuthContext and ProtectedRoute.');
      // setFormData({}); // Optionally clear form data if patient becomes null.
      // This might be useful if a session expires and patient info should not persist.
      // However, processPatientData already handles patientData being null.
    }
  }, [patient]); // navigate dependency removed as redirection logic is removed from this useEffect

  useEffect(() => {
    if (location.state?.action === 'quickEdit') {
      setQuickEditMode(true);
      setFullEditMode(false); // Ensure only one mode is active
      // Clear the action from state to prevent re-triggering on other state changes
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.action === 'fullEdit') {
      setFullEditMode(true);
      setQuickEditMode(false); // Ensure only one mode is active
      setCurrentStep(1); // Reset to first step for full edit
      // Clear the action from state
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.action === 'changePassword') {
      setShowPasswordModal(true);
      // Clear the action from state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.state,
    location.pathname,
    navigate,
    setQuickEditMode,
    setFullEditMode,
    setCurrentStep,
    setShowPasswordModal,
  ]);

  // Separate function to process patient data for consistent handling
  const processPatientData = (patientData) => {
    // Guard against null or undefined patientData early.
    // This is important if called directly or if patient prop could be transiently null.
    if (!patientData || Object.keys(patientData).length === 0) {
      debugLog(
        'PATIENT_INFO',
        'processPatientData called with null or empty patientData. Clearing formData.'
      );
      setFormData({}); // Clear form data if patient data is not valid
      return;
    }

    debugLog('PATIENT_INFO', 'Processing patient data:', patientData);
    const transformedData = {
      id: patientData.id, // Use patientData here, not patient from closure
      phoneNumber: patientData.phone || '',
      personalDetails: {
        ...patientData.personalDetails,
        name: patientData.personalDetails?.name || patientData.fullName || '',
        phoneNumber: patientData.personalDetails?.phoneNumber || patientData.phone || '',
        email: patientData.personalDetails?.email || patientData.email || '',
        birthdate: patientData.personalDetails?.birthdate || patientData.birthdate || '',
        sex: patientData.personalDetails?.sex || '',
        address: patientData.personalDetails?.address ||
          patientData.address || {
            street: '',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '',
            country: 'India',
          },
        occupation: patientData.personalDetails?.occupation || '',
        age: patientData.personalDetails?.age || patientData.age || '',
      },
      medicalInfo: patientData.medicalInfo || {
        bloodGroup: '',
        allergies: [],
        existingConditions: [],
        currentMedications: [],
        familyHistory: {
          diabetes: false,
          hypertension: false,
          heartDisease: false,
        },
      },
      emergencyContact: patientData.emergencyContact || {
        name: '',
        relationship: '',
        phoneNumber: '',
        address: '',
      },
      insuranceDetails: patientData.insuranceDetails || {
        provider: '',
        policyNumber: '',
        validTill: '',
      },
      clinicPreferences: patientData.clinicPreferences || {
        preferredLanguage: '',
        communicationMethod: [],
      },
      // Fallback direct properties from patientData if not nested
      fullName: patientData.fullName || patientData.personalDetails?.name || '',
      phone: patientData.phone || patientData.personalDetails?.phoneNumber || '',
      email: patientData.email || patientData.personalDetails?.email || '',
      birthdate: patientData.birthdate || patientData.personalDetails?.birthdate || '',
      age: patientData.age || patientData.personalDetails?.age || '',
      sex: patientData.sex || patientData.personalDetails?.sex || '',
      occupation: patientData.occupation || patientData.personalDetails?.occupation || '',
      address: patientData.address ||
        patientData.personalDetails?.address || {
          street: '',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '',
          country: 'India',
        },
    };
    setFormData(transformedData);
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      personalDetails: {
        ...prevData.personalDetails,
        address: {
          ...prevData.personalDetails.address,
          [field]: value,
        },
      },
    }));
  };

  // Handler for family history checkbox
  const handleFamilyHistoryChange = (field, checked) => {
    setFormData((prevData) => ({
      ...prevData,
      medicalInfo: {
        ...prevData.medicalInfo,
        familyHistory: {
          ...prevData.medicalInfo.familyHistory,
          [field]: checked,
        },
      },
    }));
  };

  // Handler for array fields (allergies, conditions, medications, communicationMethod)
  const handleArrayChange = (section, field, value) => {
    setFormData((prevData) => {
      const currentValues = prevData[section][field];
      if (currentValues.includes(value)) {
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            [field]: currentValues.filter((item) => item !== value),
          },
        };
      } else {
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            [field]: [...currentValues, value],
          },
        };
      }
    });
  };

  // Handler for adding an item to an array field
  const handleAddItem = (section, field, newItem) => {
    if (newItem.trim() !== '') {
      setFormData((prevData) => ({
        ...prevData,
        [section]: {
          ...prevData[section],
          [field]: [...prevData[section][field], newItem.trim()],
        },
      }));
    }
  };

  // Handler for removing an item from an array field
  const handleRemoveItem = (section, field, index) => {
    setFormData((prevData) => {
      const newArray = [...prevData[section][field]];
      newArray.splice(index, 1);
      return {
        ...prevData,
        [section]: {
          ...prevData[section],
          [field]: newArray,
        },
      };
    });
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const patientId = formData.id || patient?.id;
      if (!patientId) {
        throw new Error('Patient ID not found');
      }

      const updatedPatientData = {
        id: patientId, // Ensure ID is included
        phoneNumber: stripCountryCode(formData.personalDetails.phoneNumber),
        personalDetails: {
          ...formData.personalDetails,
          phoneNumber: stripCountryCode(formData.personalDetails.phoneNumber),
        },
        medicalInfo: formData.medicalInfo,
        emergencyContact: formData.emergencyContact,
        insuranceDetails: formData.insuranceDetails,
        clinicPreferences: formData.clinicPreferences,
      };

      await onUpdate(updatedPatientData);
      setMessage('Information updated successfully.');
      setQuickEditMode(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Failed to update information.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleFullSubmit = async () => {
    try {
      setLoading(true);
      const updatedPatientData = {
        id: formData.id,
        phoneNumber: stripCountryCode(formData.personalDetails.phoneNumber),
        personalDetails: {
          ...formData.personalDetails,
          phoneNumber: stripCountryCode(formData.personalDetails.phoneNumber),
        },
        medicalInfo: formData.medicalInfo,
        emergencyContact: formData.emergencyContact,
        insuranceDetails: formData.insuranceDetails,
        clinicPreferences: formData.clinicPreferences,
      };
      await onUpdate(updatedPatientData);
      setFormData({
        ...formData,
        fullName: updatedPatientData.personalDetails.name,
        phone: updatedPatientData.personalDetails.phoneNumber,
        email: updatedPatientData.personalDetails.email,
        birthdate: updatedPatientData.personalDetails.birthdate,
        age: updatedPatientData.personalDetails.age,
        sex: updatedPatientData.personalDetails.sex,
        occupation: updatedPatientData.personalDetails.occupation,
        address: updatedPatientData.personalDetails.address,
      });
      setMessage('Information updated successfully.');
      setFullEditMode(false);
      setCurrentStep(1);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err) {
      setMessage('Failed to update information.');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!patient) return <div>Loading...</div>;
  if (loading) return <LoadingSpinner text="Saving..." />;

  return (
    <div className="patient-info-container">
      {loading && <LoadingSpinner text="Saving..." />}
      <div className="patient-info-header">
        <h2>Patient Information</h2>
      </div>
      {message === 'Failed to update information.' && (
        <ErrorAlert type="server" message={message} onClose={() => setMessage('')} />
      )}
      {message === 'Information updated successfully.' && (
        <div className="fancy-alert">
          <p>
            <span style={{ color: '#1a7f37', fontWeight: 'bold', marginRight: 8 }}>&#9989;</span>
            {message}
          </p>
        </div>
      )}
      <div className="patient-info-content">
        {quickEditMode ? (
          <PatientQuickEditForm
            formData={formData}
            handleNestedChange={handleNestedChange}
            handleAddressChange={handleAddressChange}
            onSubmit={handleQuickSubmit}
            onCancel={() => setQuickEditMode(false)}
            loading={loading}
          />
        ) : fullEditMode ? (
          <div className="full-edit-container">
            <PatientFullEditForm
              formData={formData}
              handleNestedChange={handleNestedChange}
              handleAddressChange={handleAddressChange}
              handleFullSubmit={handleFullSubmit}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              nextStep={nextStep}
              prevStep={prevStep}
              errors={errors}
              loading={loading}
              setFullEditMode={setFullEditMode}
              handleFamilyHistoryChange={handleFamilyHistoryChange}
              handleArrayChange={handleArrayChange}
              handleAddItem={handleAddItem}
              handleRemoveItem={handleRemoveItem}
            />
          </div>
        ) : (
          <PatientInfoView patient={patient} />
        )}
      </div>
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onChangePassword={async (newPassword) => {
          if (!patient || !patient.id) {
            throw new Error('Patient information is not available.');
          }
          const patientId = patient.id;
          await authService.changePassword(patientId, newPassword);
        }}
      />
    </div>
  );
};

// Add prop types validation
PatientInfo.propTypes = {
  patient: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default PatientInfo;
