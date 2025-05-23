import React, { useEffect, useState } from 'react';
import './PatientInfo.css';
import PersonalDetailsForm from './PatientRegistration/PersonalDetailsForm';
import MedicalInfoForm from './PatientRegistration/MedicalInfoForm';
import EmergencyContactForm from './PatientRegistration/EmergencyContactForm';
import InsuranceDetailsForm from './PatientRegistration/InsuranceDetailsForm';
import ClinicPreferencesForm from './PatientRegistration/ClinicPreferencesForm';
import LoadingSpinner from './shared/LoadingSpinner';

const PatientInfo = ({ patient, onUpdate, onLogout }) => {
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [fullEditMode, setFullEditMode] = useState(false);
  const [formData, setFormData] = useState(patient || {});
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // We're using errors in the PersonalDetailsForm, so keep the state but remove the ESLint warning
  const [errors] = useState({});

  const stripCountryCode = (phone) => {
    if (typeof phone === 'string' && phone.startsWith('+91')) {
      return phone.replace(/^\+91/, '');
    }
    return phone;
  };
  useEffect(() => {
    // Transform patient data to match the format expected by the registration forms
    if (patient) {
      const transformedData = {
        id: patient.id, // <-- include id
        phoneNumber: patient.phone || '',
        personalDetails: {
          ...patient.personalDetails,
          name: patient.personalDetails?.name || patient.fullName || '',
          phoneNumber: patient.personalDetails?.phoneNumber || patient.phone || '',
          email: patient.personalDetails?.email || patient.email || '',
          birthdate: patient.personalDetails?.birthdate || patient.birthdate || '',
          sex: patient.personalDetails?.sex || '',
          address: patient.personalDetails?.address ||
            patient.address || {
              street: '',
              city: 'Chennai',
              state: 'Tamil Nadu',
              postalCode: '',
              country: 'India',
            },
          occupation: patient.personalDetails?.occupation || '',
          age: patient.personalDetails?.age || patient.age || '',
        },
        medicalInfo: patient.medicalInfo || {
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
        emergencyContact: patient.emergencyContact || {
          name: '',
          relationship: '',
          phoneNumber: '',
          address: '',
        },
        insuranceDetails: patient.insuranceDetails || {
          provider: '',
          policyNumber: '',
          validTill: '',
        },
        clinicPreferences: patient.clinicPreferences || {
          preferredLanguage: '',
          communicationMethod: [],
        },
        // Include top-level fields for info page display
        fullName: patient.fullName || '',
        phone: patient.phone || '',
        email: patient.email || '',
        birthdate: patient.birthdate || '',
        age: patient.age || '',
        sex: patient.sex || '',
        occupation: patient.occupation || '',
        address: patient.address || {
          street: '',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '',
          country: 'India',
        },
      };
      setFormData(transformedData);
    }
  }, [patient]);

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

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Remove +91 from phoneNumber before sending
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
      // Update local formData so info page shows latest values
      setFormData({
        ...formData,
        phoneNumber: updatedPatientData.phoneNumber,
        personalDetails: {
          ...formData.personalDetails,
          ...updatedPatientData.personalDetails,
        },
        // Update top-level fields for info page
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
      setQuickEditMode(false);
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
  const handleFullSubmit = async () => {
    try {
      setLoading(true);
      // Remove +91 from phoneNumber before sending
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
      // Update local formData so info page shows latest values
      setFormData({
        ...formData,
        // Update top-level fields for info page
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
  if (loading) return <LoadingSpinner />;

  const renderFullEditForm = () => {
    const totalSteps = 5;
    const stepLabels = ['Personal', 'Medical', 'Emergency', 'Insurance', 'Preferences'];
    return (
      <div className="patient-registration-container full-edit-container">
        <div className="form-header">
          <h2>Edit Patient Information</h2>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`step-indicator ${currentStep >= step ? 'active' : ''}`}
              onClick={() => step <= currentStep && setCurrentStep(step)}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="step-labels">
          {stepLabels.map((label, idx) => (
            <span key={label} className={currentStep === idx + 1 ? 'active' : ''}>
              {label}
            </span>
          ))}
        </div>
        <div className="form-content">
          {(() => {
            switch (currentStep) {
              case 1:
                return (
                  <div className="form-step">
                    <h3>Personal Details</h3>
                    <PersonalDetailsForm
                      formData={formData}
                      handleChange={(section, field, value) => {
                        if (typeof section === 'object') {
                          // Handle event object for backward compatibility
                          const e = section;
                          const { name, value } = e.target;
                          handleNestedChange('personalDetails', name, value);
                        } else {
                          // Handle direct parameters
                          handleNestedChange(section, field, value);
                        }
                      }}
                      handleAddressChange={handleAddressChange}
                      errors={errors}
                      disablePhoneNumber={true}
                    />
                    <div className="form-navigation">
                      <div></div>
                      <button type="button" className="btn btn-primary" onClick={nextStep}>
                        Next
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          setFullEditMode(false);
                          setCurrentStep(1);
                        }}
                      >
                        Cancel Full Edit
                      </button>
                    </div>
                  </div>
                );
              case 2:
                return (
                  <div className="form-step">
                    <h3>Medical Information</h3>
                    <MedicalInfoForm
                      formData={formData}
                      handleChange={(section, field, value) => {
                        handleNestedChange(section, field, value);
                      }}
                      handleFamilyHistoryChange={(field, checked) => {
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
                      }}
                      handleArrayChange={(section, field, value) => {
                        const currentValues = formData[section][field];
                        if (currentValues.includes(value)) {
                          setFormData({
                            ...formData,
                            [section]: {
                              ...formData[section],
                              [field]: currentValues.filter((item) => item !== value),
                            },
                          });
                        } else {
                          setFormData({
                            ...formData,
                            [section]: {
                              ...formData[section],
                              [field]: [...currentValues, value],
                            },
                          });
                        }
                      }}
                      handleAddItem={(section, field, newItem) => {
                        if (newItem.trim() !== '') {
                          setFormData({
                            ...formData,
                            [section]: {
                              ...formData[section],
                              [field]: [...formData[section][field], newItem.trim()],
                            },
                          });
                        }
                      }}
                      handleRemoveItem={(section, field, index) => {
                        const newArray = [...formData[section][field]];
                        newArray.splice(index, 1);
                        setFormData({
                          ...formData,
                          [section]: {
                            ...formData[section],
                            [field]: newArray,
                          },
                        });
                      }}
                    />
                    <div className="form-navigation">
                      <button type="button" className="btn btn-secondary" onClick={prevStep}>
                        Previous
                      </button>
                      <button type="button" className="btn btn-primary" onClick={nextStep}>
                        Next
                      </button>
                    </div>
                  </div>
                );
              case 3:
                return (
                  <div className="form-step">
                    <h3>Emergency Contact</h3>
                    <EmergencyContactForm
                      formData={formData}
                      handleChange={(section, field, value) => {
                        handleNestedChange(section, field, value);
                      }}
                    />
                    <div className="form-navigation">
                      <button type="button" className="btn btn-secondary" onClick={prevStep}>
                        Previous
                      </button>
                      <button type="button" className="btn btn-primary" onClick={nextStep}>
                        Next
                      </button>
                    </div>
                  </div>
                );
              case 4:
                return (
                  <div className="form-step">
                    <h3>Insurance Details</h3>
                    <InsuranceDetailsForm
                      formData={formData}
                      handleChange={(section, field, value) => {
                        handleNestedChange(section, field, value);
                      }}
                    />
                    <div className="form-navigation">
                      <button type="button" className="btn btn-secondary" onClick={prevStep}>
                        Previous
                      </button>
                      <button type="button" className="btn btn-primary" onClick={nextStep}>
                        Next
                      </button>
                    </div>
                  </div>
                );
              case 5:
                return (
                  <div className="form-step">
                    <h3>Clinic Preferences</h3>
                    <ClinicPreferencesForm
                      formData={formData}
                      handleChange={(section, field, value) => {
                        handleNestedChange(section, field, value);
                      }}
                      handleArrayChange={(section, field, value) => {
                        const currentValues = formData[section][field];
                        if (currentValues.includes(value)) {
                          setFormData({
                            ...formData,
                            [section]: {
                              ...formData[section],
                              [field]: currentValues.filter((item) => item !== value),
                            },
                          });
                        } else {
                          setFormData({
                            ...formData,
                            [section]: {
                              ...formData[section],
                              [field]: [...currentValues, value],
                            },
                          });
                        }
                      }}
                    />
                    <div className="form-navigation">
                      <button type="button" className="btn btn-secondary" onClick={prevStep}>
                        Previous
                      </button>
                      <button type="button" className="btn btn-success" onClick={handleFullSubmit}>
                        Save All Changes
                      </button>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="patient-info-container">
      <div className="patient-info-header">
        <h2>Patient Information</h2>
        <div className="patient-info-actions header-actions">
          {!quickEditMode && !fullEditMode && (
            <>
              <button className="btn btn-primary" onClick={() => setQuickEditMode(true)}>
                Quick Edit
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  setFullEditMode(true);
                  setCurrentStep(1);
                }}
              >
                Full Edit
              </button>
            </>
          )}{' '}
          <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>{' '}
      </div>

      {message && (
        <div className="fancy-alert">
          <p>{message}</p>
        </div>
      )}

      <div className="patient-info-content">
        {quickEditMode ? (
          <form onSubmit={handleQuickSubmit} className="quick-edit-form">
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.personalDetails.name || ''}
                onChange={(e) => handleNestedChange('personalDetails', 'name', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                name="phoneNumber"
                value={formData.personalDetails.phoneNumber || ''}
                onChange={(e) =>
                  handleNestedChange('personalDetails', 'phoneNumber', e.target.value)
                }
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.personalDetails.email || ''}
                onChange={(e) => handleNestedChange('personalDetails', 'email', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="birthdate"
                value={formData.personalDetails.birthdate || ''}
                onChange={(e) => handleNestedChange('personalDetails', 'birthdate', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Sex</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    id="quickEditMale"
                    name="quickEditSex"
                    value="M"
                    checked={formData.personalDetails.sex === 'M'}
                    onChange={(e) => handleNestedChange('personalDetails', 'sex', e.target.value)}
                  />
                  <label htmlFor="quickEditMale">Male</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    id="quickEditFemale"
                    name="quickEditSex"
                    value="F"
                    checked={formData.personalDetails.sex === 'F'}
                    onChange={(e) => handleNestedChange('personalDetails', 'sex', e.target.value)}
                  />
                  <label htmlFor="quickEditFemale">Female</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    id="quickEditOther"
                    name="quickEditSex"
                    value="O"
                    checked={formData.personalDetails.sex === 'O'}
                    onChange={(e) => handleNestedChange('personalDetails', 'sex', e.target.value)}
                  />
                  <label htmlFor="quickEditOther">Other</label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Occupation</label>
              <input
                type="text"
                className="form-control"
                name="occupation"
                value={formData.personalDetails.occupation || ''}
                onChange={(e) =>
                  handleNestedChange('personalDetails', 'occupation', e.target.value)
                }
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Street"
                name="street"
                value={formData.personalDetails.address.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="City"
                name="city"
                value={formData.personalDetails.address.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="State"
                name="state"
                value={formData.personalDetails.address.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Postal Code"
                name="postalCode"
                value={formData.personalDetails.address.postalCode || ''}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Country"
                name="country"
                value={formData.personalDetails.address.country || ''}
                onChange={(e) => handleAddressChange('country', e.target.value)}
              />
            </div>
            <div className="patient-info-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setQuickEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : fullEditMode ? (
          <div className="full-edit-container">{renderFullEditForm()}</div>
        ) : (
          <div className="patient-info-view">
            <div className="info-section">
              <h3>Personal Details</h3>
              <div className="patient-info-detail">
                <strong>Full Name:</strong> {patient.fullName}
              </div>
              <div className="patient-info-detail">
                <strong>Phone Number:</strong> {patient.phone}
              </div>
              <div className="patient-info-detail">
                <strong>Email:</strong> {patient.email || 'Not provided'}
              </div>
              <div className="patient-info-detail">
                <strong>Date of Birth:</strong> {patient.birthdate || 'Not provided'}
              </div>{' '}
              <div className="patient-info-detail">
                <strong>Age:</strong> {patient.age || 'Not calculated'}
              </div>
              <div className="patient-info-detail">
                <strong>Sex:</strong>{' '}
                {patient.personalDetails?.sex === 'M'
                  ? 'Male'
                  : patient.personalDetails?.sex === 'F'
                    ? 'Female'
                    : patient.personalDetails?.sex === 'O'
                      ? 'Other'
                      : 'Not specified'}
              </div>
              <div className="patient-info-detail">
                <strong>Occupation:</strong> {patient.personalDetails?.occupation || 'Not provided'}
              </div>
              {patient.address && (
                <div className="patient-info-detail">
                  <strong>Address:</strong>{' '}
                  {`${patient.address.street || ''}, ${
                    patient.address.city || ''
                  }, ${patient.address.state || ''} ${
                    patient.address.postalCode || ''
                  }, ${patient.address.country || ''}`}
                </div>
              )}
            </div>

            <div className="info-section">
              <h3>Medical Information</h3>
              {patient.medicalInfo ? (
                <>
                  <div className="patient-info-detail">
                    <strong>Blood Group:</strong> {patient.medicalInfo.bloodGroup || 'Not provided'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Allergies:</strong>{' '}
                    {patient.medicalInfo.allergies && patient.medicalInfo.allergies.length > 0
                      ? patient.medicalInfo.allergies.join(', ')
                      : 'None'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Existing Conditions:</strong>{' '}
                    {patient.medicalInfo.existingConditions &&
                    patient.medicalInfo.existingConditions.length > 0
                      ? patient.medicalInfo.existingConditions.join(', ')
                      : 'None'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Current Medications:</strong>{' '}
                    {patient.medicalInfo.currentMedications &&
                    patient.medicalInfo.currentMedications.length > 0
                      ? patient.medicalInfo.currentMedications.join(', ')
                      : 'None'}
                  </div>
                </>
              ) : (
                <div className="patient-info-detail">No medical information provided</div>
              )}
            </div>

            <div className="info-section">
              <h3>Emergency Contact</h3>
              {patient.emergencyContact ? (
                <>
                  <div className="patient-info-detail">
                    <strong>Name:</strong> {patient.emergencyContact.name || 'Not provided'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Relationship:</strong>{' '}
                    {patient.emergencyContact.relationship || 'Not provided'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Phone Number:</strong>{' '}
                    {patient.emergencyContact.phoneNumber || 'Not provided'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Address:</strong> {patient.emergencyContact.address || 'Not provided'}
                  </div>
                </>
              ) : (
                <div className="patient-info-detail">No emergency contact information provided</div>
              )}
            </div>

            <div className="info-section">
              <h3>Insurance Details</h3>
              {patient.insuranceDetails ? (
                <>
                  <div className="patient-info-detail">
                    <strong>Provider:</strong> {patient.insuranceDetails.provider || 'Not provided'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Policy Number:</strong>{' '}
                    {patient.insuranceDetails.policyNumber || 'Not provided'}
                  </div>
                  <div className="patient-info-detail">
                    <strong>Valid Till:</strong>{' '}
                    {patient.insuranceDetails.validTill || 'Not provided'}
                  </div>
                </>
              ) : (
                <div className="patient-info-detail">No insurance information provided</div>
              )}
            </div>

            <div className="info-section">
              <h3>Clinic Preferences</h3>
              {patient.clinicPreferences ? (
                <>
                  <div className="patient-info-detail">
                    <strong>Preferred Language:</strong>{' '}
                    {patient.clinicPreferences.preferredLanguage || 'Not provided'}
                  </div>{' '}
                  <div className="patient-info-detail">
                    <strong>Communication Method:</strong>{' '}
                    {patient.clinicPreferences.communicationMethod &&
                    Array.isArray(patient.clinicPreferences.communicationMethod) &&
                    patient.clinicPreferences.communicationMethod.length > 0
                      ? patient.clinicPreferences.communicationMethod[0]
                      : 'Not provided'}
                  </div>
                </>
              ) : (
                <div className="patient-info-detail">No clinic preferences provided</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientInfo;
