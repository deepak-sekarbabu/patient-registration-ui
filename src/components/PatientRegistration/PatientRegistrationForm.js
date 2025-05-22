import React, { useState, useRef } from "react";
import patientService from "../../services/api";
import "./PatientRegistrationForm.css";
import PersonalDetailsForm from "./PersonalDetailsForm";
import MedicalInfoForm from "./MedicalInfoForm";
import EmergencyContactForm from "./EmergencyContactForm";
import InsuranceDetailsForm from "./InsuranceDetailsForm";
import ClinicPreferencesForm from "./ClinicPreferencesForm";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useNavigate } from "react-router-dom";

const PatientRegistrationForm = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    personalDetails: {
      name: "",
      phoneNumber: "",
      email: "",
      birthdate: "",
      sex: "",
      address: {
        street: "",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "",
        country: "India",
      },
      occupation: "",
      age: 0,
    },
    medicalInfo: {
      bloodGroup: "",
      allergies: [],
      existingConditions: [],
      currentMedications: [],
      familyHistory: {
        diabetes: false,
        hypertension: false,
        heartDisease: false,
      },
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
      address: "",
    },
    insuranceDetails: {
      provider: "",
      policyNumber: "",
      validTill: "",
    },
    clinicPreferences: {
      preferredLanguage: "",
      communicationMethod: [], // Will contain single value when selected
    },
  });
  const [errors, setErrors] = useState({
    phoneNumber: "",
    email: "",
    birthdate: "",
    name: "",
    street: "",
    postalCode: "",
    city: "",
    state: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showMissingFieldsError, setShowMissingFieldsError] = useState(false);
  const [phoneCheckTimeout, setPhoneCheckTimeout] = useState(null);
  const formContentRef = useRef(null);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (phoneCheckTimeout) {
        clearTimeout(phoneCheckTimeout);
      }
    };
  }, [phoneCheckTimeout]);

  const displayMandatoryFieldsError = () => {
    if (
      currentStep === 1 &&
      (showMissingFieldsError ||
        !formData.phoneNumber ||
        !formData.personalDetails.name)
    ) {
      return (
        <div
          className="error-message"
          style={{
            marginBottom: "20px",
            textAlign: "left",
            padding: "15px",
            border: "2px solid #e74c3c",
            animation: showMissingFieldsError ? "shake 0.5s" : "none",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#e74c3c" }}>
            Required Fields Missing
          </h4>
          <p>You must fill in the following mandatory fields to proceed:</p>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            {!formData.phoneNumber && (
              <li>
                <strong>Primary Phone Number</strong> - Please enter a valid
                10-digit phone number
              </li>
            )}
            {!formData.personalDetails.name && (
              <li>
                <strong>Full Name</strong> - Please enter your full name
              </li>
            )}
          </ul>
        </div>
      );
    }
    return null;
  };

  const handleChange = (section, field, value) => {
    if (section === "root") {
      if (field === "phoneNumber") {
        const digitsOnly = value.replace(/\D/g, "");
        let phoneError = "";
        if (digitsOnly && digitsOnly.length < 10) {
          phoneError = "Phone number must be at least 10 digits";
        }
        setErrors({
          ...errors,
          phoneNumber: phoneError,
        });
        setFormData((prevState) => ({
          ...prevState,
          [field]: digitsOnly,
          personalDetails: {
            ...prevState.personalDetails,
            phoneNumber: digitsOnly ? `+91${digitsOnly}` : "",
          },
        }));

        // Clear any existing timeout to prevent multiple API calls
        if (phoneCheckTimeout) {
          clearTimeout(phoneCheckTimeout);
        }

        // Check if phone number exists when it's exactly 10 digits
        if (digitsOnly && digitsOnly.length === 10) {
          // Delay API call a bit to make sure user has finished typing
          const timeout = setTimeout(() => {
            checkPhoneNumberExists(digitsOnly);
          }, 500);
          setPhoneCheckTimeout(timeout);
        }
      } else {
        setFormData({ ...formData, [field]: value });
      }
    } else {
      if (section === "personalDetails" && field === "name") {
        let nameError = "";
        if (value && value.length > 50) {
          nameError = "Full Name cannot exceed 50 characters";
        }
        const containsSymbolsOrNumbers = /[^a-zA-Z\s]/.test(value);
        if (value && containsSymbolsOrNumbers) {
          nameError = "Full Name can only contain letters and spaces";
        }
        setErrors({
          ...errors,
          name: nameError,
        });
      }
      if (section === "personalDetails" && field === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let emailError = "";
        if (value && !emailRegex.test(value)) {
          emailError = "Please enter a valid email address";
        }
        setErrors({
          ...errors,
          email: emailError,
        });
      }
      if (section === "personalDetails" && field === "birthdate") {
        let birthdateError = "";
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate > today) {
            birthdateError = "Date of Birth cannot be a future date";
          }
        }
        setErrors({
          ...errors,
          birthdate: birthdateError,
        });
      }
      if (section === "personalDetails" && field === "name") {
        const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: sanitizedValue,
          },
        });
      } else {
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: value,
          },
        });
      }
    }
  };

  const handleAddressChange = (field, value) => {
    if (field === "country") {
      return;
    }
    if (field === "street" && value.length > 100) {
      setErrors({
        ...errors,
        street: "Street/House No. cannot exceed 100 characters",
      });
      return;
    } else if (field === "street") {
      setErrors({
        ...errors,
        street: "",
      });
    }
    if (field === "postalCode") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 6) {
        setErrors({
          ...errors,
          postalCode: "Postal Code cannot exceed 6 digits",
        });
        return;
      } else {
        setErrors({
          ...errors,
          postalCode: "",
        });
      }
      setFormData({
        ...formData,
        personalDetails: {
          ...formData.personalDetails,
          address: {
            ...formData.personalDetails.address,
            [field]: digitsOnly,
          },
        },
      });
      return;
    }
    if (field === "city") {
      setErrors({
        ...errors,
        city: value ? "" : "Please select a city",
      });
    }
    setFormData({
      ...formData,
      personalDetails: {
        ...formData.personalDetails,
        address: {
          ...formData.personalDetails.address,
          [field]: value,
        },
      },
    });
  };

  const handleFamilyHistoryChange = (field, checked) => {
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        familyHistory: {
          ...formData.medicalInfo.familyHistory,
          [field]: checked,
        },
      },
    });
  };
  // Check if phone number exists in the database
  const checkPhoneNumberExists = async (phoneNumber) => {
    if (phoneNumber && phoneNumber.length === 10) {
      try {
        const exists = await patientService.checkPhoneExists(phoneNumber);
        if (exists) {
          // Use setTimeout to defer navigation to after the current render cycle
          setTimeout(() => {
            // Phone number already exists, redirect to login page
            navigate("/login", {
              state: {
                message:
                  "Your phone number is already registered. Please log in.",
                phoneNumber,
              },
            });
          }, 0);
        }
      } catch (error) {
        console.error("Error checking phone number:", error);
      }
    }
  };

  const handleArrayChange = (section, field, value) => {
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
  };

  const handleAddItem = (section, field, newItem) => {
    if (newItem.trim() !== "") {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: [...formData[section][field], newItem.trim()],
        },
      });
    }
  };

  const handleRemoveItem = (section, field, index) => {
    const newArray = [...formData[section][field]];
    newArray.splice(index, 1);
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: newArray,
      },
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      let hasErrors = false;
      const updatedErrors = { ...errors };
      if (!formData.phoneNumber) {
        updatedErrors.phoneNumber =
          "Primary Phone Number is mandatory and required to proceed";
        hasErrors = true;
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        updatedErrors.phoneNumber = "Phone number must be exactly 10 digits";
        hasErrors = true;
      }
      if (!formData.personalDetails.name) {
        updatedErrors.name = "Full Name is mandatory and required to proceed";
        hasErrors = true;
      } else if (formData.personalDetails.name.length > 50) {
        updatedErrors.name = "Full Name cannot exceed 50 characters";
        hasErrors = true;
      } else if (/[^a-zA-Z\s]/.test(formData.personalDetails.name)) {
        updatedErrors.name = "Full Name can only contain letters and spaces";
        hasErrors = true;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.personalDetails.email) {
        if (!emailRegex.test(formData.personalDetails.email)) {
          updatedErrors.email = "Please enter a valid email address";
          hasErrors = true;
        } else {
          updatedErrors.email = "";
        }
      } else {
        updatedErrors.email = "";
      }
      if (formData.personalDetails.birthdate) {
        const selectedDate = new Date(formData.personalDetails.birthdate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          updatedErrors.birthdate = "Date of Birth cannot be a future date";
          hasErrors = true;
        } else {
          updatedErrors.birthdate = "";
        }
      } else {
        updatedErrors.birthdate = "";
      }
      if (formData.personalDetails.address.street.length > 100) {
        updatedErrors.street = "Street/House No. cannot exceed 100 characters";
        hasErrors = true;
      } else {
        updatedErrors.street = "";
      }
      if (formData.personalDetails.address.postalCode) {
        if (!/^\d{1,6}$/.test(formData.personalDetails.address.postalCode)) {
          updatedErrors.postalCode =
            "Postal Code must be numeric and up to 6 digits";
          hasErrors = true;
        } else {
          updatedErrors.postalCode = "";
        }
      } else {
        updatedErrors.postalCode = "";
      }
      if (!formData.personalDetails.address.city) {
        updatedErrors.city = "Please select a city";
        hasErrors = true;
      } else {
        updatedErrors.city = "";
      }
      if (!formData.personalDetails.address.state) {
        updatedErrors.state = "Please select a state";
        hasErrors = true;
      } else {
        updatedErrors.state = "";
      }
      if (hasErrors) {
        setErrors(updatedErrors);
        if (!formData.phoneNumber || !formData.personalDetails.name) {
          setShowMissingFieldsError(true);
          window.scrollTo(0, 0);
          setTimeout(() => {
            setShowMissingFieldsError(false);
          }, 3000);
        }
        return;
      }
    }
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      personalDetails: {
        ...formData.personalDetails,
        age: calculateAge(formData.personalDetails.birthdate),
      },
    };
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await patientService.registerPatient(submissionData);

      // Normalize patient object similar to the login handler
      const normalizedPatient = {
        fullName: submissionData.personalDetails.name || "",
        phone: submissionData.personalDetails.phoneNumber || "",
        email: submissionData.personalDetails.email || "",
        birthdate: submissionData.personalDetails.birthdate || "",
        age: submissionData.personalDetails.age || 0,
        sex: submissionData.personalDetails.sex || "",
        address: submissionData.personalDetails.address || {},
        occupation: submissionData.personalDetails.occupation || "",
        medicalInfo: submissionData.medicalInfo || {},
        emergencyContact: submissionData.emergencyContact || {},
        insuranceDetails: submissionData.insuranceDetails || {},
        clinicPreferences: submissionData.clinicPreferences || {},
        ...response,
      }; // Store patient data in localStorage to maintain authentication
      localStorage.setItem("patient", JSON.stringify(normalizedPatient));
      if (response && response.token) {
        localStorage.setItem("token", response.token);
      }

      // Call the onRegisterSuccess callback to update auth state in parent App component
      if (onRegisterSuccess) {
        onRegisterSuccess(normalizedPatient);
      }

      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Navigate to info page immediately instead of waiting
      navigate("/info");

      // Reset form after navigation
      setTimeout(() => {
        setFormData({
          phoneNumber: "",
          personalDetails: {
            name: "",
            phoneNumber: "",
            email: "",
            birthdate: "",
            sex: "",
            address: {
              street: "",
              city: "Chennai",
              state: "Tamil Nadu",
              postalCode: "",
              country: "India",
            },
            occupation: "",
            age: 0,
          },
          medicalInfo: {
            bloodGroup: "",
            allergies: [],
            existingConditions: [],
            currentMedications: [],
            familyHistory: {
              diabetes: false,
              hypertension: false,
              heartDisease: false,
            },
          },
          emergencyContact: {
            name: "",
            relationship: "",
            phoneNumber: "",
            address: "",
          },
          insuranceDetails: {
            provider: "",
            policyNumber: "",
            validTill: "",
          },
          clinicPreferences: {
            preferredLanguage: "",
            communicationMethod: [],
          },
        });
        setCurrentStep(1);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setSubmitError("Failed to register patient. Please try again.");
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsForm
            formData={formData}
            handleChange={handleChange}
            handleAddressChange={handleAddressChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <MedicalInfoForm
            formData={formData}
            handleChange={handleChange}
            handleFamilyHistoryChange={handleFamilyHistoryChange}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
        );
      case 3:
        return (
          <EmergencyContactForm
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 4:
        return (
          <InsuranceDetailsForm
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 5:
        return (
          <ClinicPreferencesForm
            formData={formData}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
          />
        );
      case 6:
        return (
          <div className="form-summary">
            <h3>Review Your Information</h3>
            <div className="summary-section">
              <h4>Personal Details</h4>
              <p>
                <strong>Name:</strong> {formData.personalDetails.name}
              </p>
              <p>
                <strong>Phone:</strong> {formData.personalDetails.phoneNumber}
              </p>
              <p>
                <strong>Email:</strong> {formData.personalDetails.email}
              </p>
              <p>
                <strong>Birthdate:</strong> {formData.personalDetails.birthdate}
              </p>
              <p>
                <strong>Sex:</strong> {formData.personalDetails.sex}
              </p>
              <p>
                <strong>Occupation:</strong>{" "}
                {formData.personalDetails.occupation}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {formData.personalDetails.address.street},{" "}
                {formData.personalDetails.address.city},{" "}
                {formData.personalDetails.address.state},{" "}
                {formData.personalDetails.address.postalCode},{" "}
                {formData.personalDetails.address.country}
              </p>
            </div>

            <div className="summary-section">
              <h4>Medical Information</h4>
              <p>
                <strong>Blood Group:</strong> {formData.medicalInfo.bloodGroup}
              </p>
              <p>
                <strong>Allergies:</strong>{" "}
                {formData.medicalInfo.allergies.join(", ") || "None"}
              </p>
              <p>
                <strong>Existing Conditions:</strong>{" "}
                {formData.medicalInfo.existingConditions.join(", ") || "None"}
              </p>
              <p>
                <strong>Current Medications:</strong>{" "}
                {formData.medicalInfo.currentMedications.join(", ") || "None"}
              </p>
              <p>
                <strong>Family History:</strong>
              </p>
              <ul>
                <li>
                  Diabetes:{" "}
                  {formData.medicalInfo.familyHistory.diabetes ? "Yes" : "No"}
                </li>
                <li>
                  Hypertension:{" "}
                  {formData.medicalInfo.familyHistory.hypertension
                    ? "Yes"
                    : "No"}
                </li>
                <li>
                  Heart Disease:{" "}
                  {formData.medicalInfo.familyHistory.heartDisease
                    ? "Yes"
                    : "No"}
                </li>
              </ul>
            </div>

            <div className="summary-section">
              <h4>Emergency Contact</h4>
              <p>
                <strong>Name:</strong> {formData.emergencyContact.name}
              </p>
              <p>
                <strong>Relationship:</strong>{" "}
                {formData.emergencyContact.relationship}
              </p>
              <p>
                <strong>Phone:</strong> {formData.emergencyContact.phoneNumber}
              </p>
              <p>
                <strong>Address:</strong> {formData.emergencyContact.address}
              </p>
            </div>

            <div className="summary-section">
              <h4>Insurance Details</h4>
              <p>
                <strong>Provider:</strong> {formData.insuranceDetails.provider}
              </p>
              <p>
                <strong>Policy Number:</strong>{" "}
                {formData.insuranceDetails.policyNumber}
              </p>
              <p>
                <strong>Valid Till:</strong>{" "}
                {formData.insuranceDetails.validTill}
              </p>
            </div>

            <div className="summary-section">
              <h4>Clinic Preferences</h4>{" "}
              <p>
                <strong>Preferred Language:</strong>{" "}
                {formData.clinicPreferences.preferredLanguage ||
                  "None selected"}
              </p>
              <p>
                <strong>Communication Method:</strong>{" "}
                {Array.isArray(
                  formData.clinicPreferences.communicationMethod
                ) && formData.clinicPreferences.communicationMethod.length > 0
                  ? formData.clinicPreferences.communicationMethod[0]
                  : "None selected"}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="patient-registration-container">
      <div className="form-header">
        <h2>Patient Registration</h2>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`step-indicator ${
                currentStep >= step ? "active" : ""
              }`}
              onClick={() => step <= currentStep && setCurrentStep(step)}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="step-labels">
          <span className={currentStep === 1 ? "active" : ""}>Personal</span>
          <span className={currentStep === 2 ? "active" : ""}>Medical</span>
          <span className={currentStep === 3 ? "active" : ""}>Emergency</span>
          <span className={currentStep === 4 ? "active" : ""}>Insurance</span>
          <span className={currentStep === 5 ? "active" : ""}>Preferences</span>
          <span className={currentStep === 6 ? "active" : ""}>Review</span>
        </div>
      </div>
      {displayMandatoryFieldsError()}
      <form onSubmit={handleSubmit}>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentStep}
            classNames="fade-slide"
            timeout={400}
            nodeRef={formContentRef}
          >
            <div className="form-content" ref={formContentRef}>
              {renderStep()}
            </div>
          </CSSTransition>
        </SwitchTransition>

        {submitSuccess && (
          <div className="success-message">
            <p>Patient registration successful!</p>
          </div>
        )}

        {submitError && (
          <div className="error-message">
            <p>{submitError}</p>
          </div>
        )}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
          {currentStep < 6 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={nextStep}
              title={
                currentStep === 1
                  ? "Primary Phone Number and Full Name are mandatory to proceed"
                  : ""
              }
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >
              {currentStep === 1 ? "Next (Requires Phone & Name)" : "Next"}
              {currentStep === 1 &&
                (!formData.phoneNumber || !formData.personalDetails.name) && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      bottom: "0",
                      backgroundColor: "rgba(231, 76, 60, 0.15)",
                      pointerEvents: "none",
                    }}
                  />
                )}
            </button>
          )}
          {currentStep === 6 && (
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;
