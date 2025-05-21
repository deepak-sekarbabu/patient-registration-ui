import React, { useState } from "react";
import patientService from "../../services/api";
import "./PatientRegistrationForm.css";
import PersonalDetailsForm from "./PersonalDetailsForm";
import MedicalInfoForm from "./MedicalInfoForm";
import EmergencyContactForm from "./EmergencyContactForm";
import InsuranceDetailsForm from "./InsuranceDetailsForm";
import ClinicPreferencesForm from "./ClinicPreferencesForm";

const PatientRegistrationForm = () => {
  // Function to allow only numeric input
  const handleNumericInput = (e) => {
    // Allow only: numbers, backspace, tab, delete, arrows, home, end
    const allowedKeys = [
      "Backspace",
      "Tab",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    // If it's not a number and not one of the allowed control keys, prevent default
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Initial state with empty values for all fields
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
        city: "",
        state: "",
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
  const [errors, setErrors] = useState({
    phoneNumber: "",
    email: "",
    birthdate: "",
    name: "",
    street: "",
    postalCode: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Update form data for all fields
  const handleChange = (section, field, value) => {
    if (section === "root") {
      // If the primary phone number is updated, also update the contact number with +91 prefix
      if (field === "phoneNumber") {
        // Allow only digits in the phone number
        const digitsOnly = value.replace(/\D/g, "");

        // Clear any previous error initially
        let phoneError = "";

        // Set error message if not empty and less than 10 digits
        if (digitsOnly && digitsOnly.length < 10) {
          phoneError = "Phone number must be at least 10 digits";
        }

        // Update the error state
        setErrors({
          ...errors,
          phoneNumber: phoneError,
        });

        // Always update the form data with digits only
        setFormData((prevState) => ({
          ...prevState,
          [field]: digitsOnly,
          personalDetails: {
            ...prevState.personalDetails,
            phoneNumber: digitsOnly ? `+91${digitsOnly}` : "",
          },
        }));
      } else {
        setFormData({ ...formData, [field]: value });
      }
    } else {
      // Handle name validation
      if (section === "personalDetails" && field === "name") {
        let nameError = "";

        if (value && value.length > 50) {
          nameError = "Full Name cannot exceed 50 characters";
        }

        // Check for symbols or numbers in the name
        const containsSymbolsOrNumbers = /[^a-zA-Z\s]/.test(value);
        if (value && containsSymbolsOrNumbers) {
          nameError = "Full Name can only contain letters and spaces";
        }

        // Update the errors state with name validation result
        setErrors({
          ...errors,
          name: nameError,
        });
      }

      // Handle email validation for the personalDetails section
      if (section === "personalDetails" && field === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let emailError = "";

        if (value && !emailRegex.test(value)) {
          emailError = "Please enter a valid email address";
        }

        // Update the errors state with email validation result
        setErrors({
          ...errors,
          email: emailError,
        });
      }

      // Handle birthdate validation to prevent future dates
      if (section === "personalDetails" && field === "birthdate") {
        let birthdateError = "";

        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();

          // Set time to beginning of the day for accurate comparison
          today.setHours(0, 0, 0, 0);

          if (selectedDate > today) {
            birthdateError = "Date of Birth cannot be a future date";
          }
        }

        // Update the errors state with birthdate validation result
        setErrors({
          ...errors,
          birthdate: birthdateError,
        });
      } // Always update the form data
      if (section === "personalDetails" && field === "name") {
        // Only allow letters and spaces in the name field
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
  }; // Update nested address fields
  const handleAddressChange = (field, value) => {
    // Prevent changes to country field
    if (field === "country") {
      return; // Do nothing if attempting to change the country
    }

    // Validate street/house number - maximum 100 characters
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

    // Validate postal code - only numbers up to 6 digits
    if (field === "postalCode") {
      // Remove any non-numeric characters
      const digitsOnly = value.replace(/\D/g, "");

      // Check if it exceeds 6 digits
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

      // Update with digits only for postal code
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

    // For other fields
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

  // Update family history checkbox values
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

  // Handle array fields (allergies, conditions, medications, communication methods)
  const handleArrayChange = (section, field, value) => {
    const currentValues = formData[section][field];

    // If the value is already in the array, remove it (for checkboxes)
    if (currentValues.includes(value)) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: currentValues.filter((item) => item !== value),
        },
      });
    } else {
      // Otherwise add it to the array
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: [...currentValues, value],
        },
      });
    }
  };

  // Add a new item to an array field (for text inputs with add button)
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

  // Remove an item from an array field
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
  }; // Navigation between form steps
  const nextStep = () => {
    // For the first step, validate phone number, email, birthdate, and name
    if (currentStep === 1) {
      let hasErrors = false;
      const updatedErrors = { ...errors };

      // Validate phone number format and length
      if (!formData.phoneNumber) {
        updatedErrors.phoneNumber = "Phone number is required";
        hasErrors = true;
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        updatedErrors.phoneNumber = "Phone number must be exactly 10 digits";
        hasErrors = true;
      } // Validate name
      if (!formData.personalDetails.name) {
        updatedErrors.name = "Full Name is required";
        hasErrors = true;
      } else if (formData.personalDetails.name.length > 50) {
        updatedErrors.name = "Full Name cannot exceed 50 characters";
        hasErrors = true;
      } else if (/[^a-zA-Z\s]/.test(formData.personalDetails.name)) {
        updatedErrors.name = "Full Name can only contain letters and spaces";
        hasErrors = true;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.personalDetails.email) {
        updatedErrors.email = "Email address is required";
        hasErrors = true;
      } else if (!emailRegex.test(formData.personalDetails.email)) {
        updatedErrors.email = "Please enter a valid email address";
        hasErrors = true;
      } // Validate birthdate
      if (!formData.personalDetails.birthdate) {
        updatedErrors.birthdate = "Date of Birth is required";
        hasErrors = true;
      } else {
        const selectedDate = new Date(formData.personalDetails.birthdate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to beginning of the day

        if (selectedDate > today) {
          updatedErrors.birthdate = "Date of Birth cannot be a future date";
          hasErrors = true;
        }
      }

      // Validate street/house no
      if (formData.personalDetails.address.street.length > 100) {
        updatedErrors.street = "Street/House No. cannot exceed 100 characters";
        hasErrors = true;
      } // Validate postal code
      if (!formData.personalDetails.address.postalCode) {
        updatedErrors.postalCode = "Postal Code is required";
        hasErrors = true;
      } else if (
        !/^\d{1,6}$/.test(formData.personalDetails.address.postalCode)
      ) {
        updatedErrors.postalCode =
          "Postal Code must be numeric and up to 6 digits";
        hasErrors = true;
      }

      // If there are any errors, update the errors state and return
      if (hasErrors) {
        setErrors(updatedErrors);
        return;
      }
    }

    // If validation passes, move to the next step
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Calculate age from birthdate
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate age before submitting
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
      await patientService.registerPatient(submissionData);
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Reset form after successful submission
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
              city: "",
              state: "",
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

  // Render the appropriate form step
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
              <h4>Clinic Preferences</h4>
              <p>
                <strong>Preferred Language:</strong>{" "}
                {formData.clinicPreferences.preferredLanguage}
              </p>
              <p>
                <strong>Communication Methods:</strong>{" "}
                {formData.clinicPreferences.communicationMethod.join(", ") ||
                  "None selected"}
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

      <form onSubmit={handleSubmit}>
        <div className="form-content">{renderStep()}</div>

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
            >
              Next
            </button>
          )}{" "}
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
