import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';

/**
 * Custom hook for managing the multi-step patient registration form.
 * Handles form state, validation, navigation, and dynamic array fields.
 * @returns {object} Form state, handlers, and navigation helpers
 */
const usePatientRegistrationForm = (onRegisterSuccess) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    personalDetails: {
      name: '',
      phoneNumber: '',
      email: '',
      birthdate: '',
      sex: 'M',
      address: {
        street: '',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '',
        country: 'India',
      },
      occupation: '',
      age: 0,
    },
    medicalInfo: {
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
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
      address: '',
    },
    insuranceDetails: {
      provider: '',
      policyNumber: '',
      validTill: '',
    },
    clinicPreferences: {
      preferredLanguage: 'Tamil',
      communicationMethod: ['SMS'],
    },
  });
  const [errors, setErrors] = useState({
    phoneNumber: '',
    email: '',
    birthdate: '',
    name: '',
    street: '',
    postalCode: '',
    city: '',
    state: '',
    country: '',
    occupation: '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showMissingFieldsError, setShowMissingFieldsError] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const formContentRef = useRef(null);

  const handlePhoneNumberBlur = async () => {
    const phoneNumber = formData.phoneNumber;
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) return;
    setIsCheckingPhone(true);
    try {
      const exists = await authService.checkPhoneNumberExists(phoneNumber);
      if (exists) {
        alert('This phone number is already registered. Redirecting to login...');
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to check phone number existence:', error);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  /**
   * Handles changes to form fields, including validation for each field.
   * Updates error state as needed.
   * @param {string} section - The section of the form (e.g., 'personalDetails')
   * @param {string} field - The field name
   * @param {any} value - The new value
   */
  const handleChange = (section, field, value) => {
    if (section === 'root') {
      if (field === 'phoneNumber') {
        const digitsOnly = value.replace(/\D/g, '');
        let phoneError = '';
        if (digitsOnly && digitsOnly.length < 10) {
          phoneError = 'Phone number must be at least 10 digits';
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
            phoneNumber: digitsOnly ? `+91${digitsOnly}` : '',
          },
        }));
      } else {
        setFormData({ ...formData, [field]: value });
      }
    } else {
      if (section === 'personalDetails' && field === 'name') {
        let nameError = '';
        if (value && value.length > 100) {
          nameError = 'Full Name cannot exceed 100 characters';
        }
        const containsSymbolsOrNumbers = /[^a-zA-Z\s]/.test(value);
        if (value && containsSymbolsOrNumbers) {
          nameError = 'Full Name can only contain letters and spaces';
        }
        setErrors({
          ...errors,
          name: nameError,
        });
      }
      if (section === 'personalDetails' && field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let emailError = '';
        if (value && !emailRegex.test(value)) {
          emailError = 'Please enter a valid email address';
        }
        if (value && value.length > 100) {
          emailError = 'Email cannot exceed 100 characters';
        }
        setErrors({
          ...errors,
          email: emailError,
        });
      }
      if (section === 'personalDetails' && field === 'birthdate') {
        let birthdateError = '';
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate > today) {
            birthdateError = 'Date of Birth cannot be a future date';
          }
        }
        setErrors({
          ...errors,
          birthdate: birthdateError,
        });
      }
      if (section === 'personalDetails' && field === 'name') {
        const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: sanitizedValue,
          },
        });
      } else {
        let updatedSectionData = {
          ...formData[section],
          [field]: value,
        };
        if (section === 'emergencyContact' && field === 'relationship') {
          if (value === 'Self') {
            updatedSectionData.name = formData.personalDetails.name;
            updatedSectionData.phoneNumber = formData.phoneNumber;
          }
        }
        setFormData({
          ...formData,
          [section]: updatedSectionData,
        });
      }
    }
  };

  /**
   * Handles changes to address fields with validation.
   * @param {string} field - The address field name
   * @param {string} value - The new value
   */
  const handleAddressChange = (field, value) => {
    if (field === 'country') {
      if (value && value.length > 50) {
        setErrors({
          ...errors,
          country: 'Country cannot exceed 50 characters',
        });
        return;
      } else {
        setErrors({
          ...errors,
          country: '',
        });
      }
    }
    if (field === 'street' && value.length > 150) {
      setErrors({
        ...errors,
        street: 'Street/House No. cannot exceed 150 characters',
      });
      return;
    } else if (field === 'street') {
      setErrors({
        ...errors,
        street: '',
      });
    }
    if (field === 'postalCode') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 6) {
        setErrors({
          ...errors,
          postalCode: 'Postal Code cannot exceed 6 digits',
        });
        return;
      } else {
        setErrors({
          ...errors,
          postalCode: '',
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
    if (field === 'city') {
      if (value && value.length > 60) {
        setErrors({
          ...errors,
          city: 'City cannot exceed 60 characters',
        });
        return;
      } else {
        setErrors({
          ...errors,
          city: value ? '' : 'Please select a city',
        });
      }
    }
    if (field === 'state') {
      if (value && value.length > 60) {
        setErrors({
          ...errors,
          state: 'State cannot exceed 60 characters',
        });
        return;
      } else {
        setErrors({
          ...errors,
          state: '',
        });
      }
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

  /**
   * Handles changes to family history checkboxes.
   * @param {string} field - The family history field
   * @param {boolean} checked - The new checked state
   */
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

  /**
   * Handles adding/removing items in array fields (e.g., allergies).
   * @param {string} section - The section of the form
   * @param {string} field - The array field name
   * @param {string} newItem - The new item to add
   */
  const handleAddItem = (section, field, newItem) => {
    if (newItem.trim() !== '') {
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

  /**
   * Advances to the next step, running validation for the current step.
   * Updates error state and prevents navigation if errors are present.
   */
  const nextStep = () => {
    if (currentStep === 1) {
      let hasErrors = false;
      const updatedErrors = { ...errors };
      if (!formData.phoneNumber) {
        updatedErrors.phoneNumber = 'Primary Phone Number is mandatory and required to proceed';
        hasErrors = true;
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        updatedErrors.phoneNumber = 'Phone number must be exactly 10 digits';
        hasErrors = true;
      }
      if (!formData.personalDetails.name) {
        updatedErrors.name = 'Full Name is mandatory and required to proceed';
        hasErrors = true;
      } else if (formData.personalDetails.name.length > 100) {
        updatedErrors.name = 'Full Name cannot exceed 100 characters';
        hasErrors = true;
      } else if (/[^a-zA-Z\s]/.test(formData.personalDetails.name)) {
        updatedErrors.name = 'Full Name can only contain letters and spaces';
        hasErrors = true;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.personalDetails.email) {
        if (!emailRegex.test(formData.personalDetails.email)) {
          updatedErrors.email = 'Please enter a valid email address';
          hasErrors = true;
        } else if (formData.personalDetails.email.length > 100) {
          updatedErrors.email = 'Email cannot exceed 100 characters';
          hasErrors = true;
        } else {
          updatedErrors.email = '';
        }
      } else {
        updatedErrors.email = '';
      }
      if (formData.personalDetails.birthdate) {
        const selectedDate = new Date(formData.personalDetails.birthdate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          updatedErrors.birthdate = 'Date of Birth cannot be a future date';
          hasErrors = true;
        } else {
          updatedErrors.birthdate = '';
        }
      } else {
        updatedErrors.birthdate = '';
      }
      if (formData.personalDetails.address.street.length > 150) {
        updatedErrors.street = 'Street/House No. cannot exceed 150 characters';
        hasErrors = true;
      } else {
        updatedErrors.street = '';
      }
      if (formData.personalDetails.address.postalCode) {
        if (!/^\d{1,6}$/.test(formData.personalDetails.address.postalCode)) {
          updatedErrors.postalCode = 'Postal Code must be numeric and up to 6 digits';
          hasErrors = true;
        } else {
          updatedErrors.postalCode = '';
        }
      } else {
        updatedErrors.postalCode = '';
      }
      if (!formData.personalDetails.address.city) {
        updatedErrors.city = 'Please select a city';
        hasErrors = true;
      } else if (formData.personalDetails.address.city.length > 60) {
        updatedErrors.city = 'City cannot exceed 60 characters';
        hasErrors = true;
      } else {
        updatedErrors.city = '';
      }
      if (!formData.personalDetails.address.state) {
        updatedErrors.state = 'Please select a state';
        hasErrors = true;
      } else if (formData.personalDetails.address.state.length > 60) {
        updatedErrors.state = 'State cannot exceed 60 characters';
        hasErrors = true;
      } else {
        updatedErrors.state = '';
      }
      if (
        formData.personalDetails.address.country &&
        formData.personalDetails.address.country.length > 50
      ) {
        updatedErrors.country = 'Country cannot exceed 50 characters';
        hasErrors = true;
      } else {
        updatedErrors.country = '';
      }
      if (formData.personalDetails.occupation && formData.personalDetails.occupation.length > 100) {
        updatedErrors.occupation = 'Occupation cannot exceed 100 characters';
        hasErrors = true;
      } else {
        updatedErrors.occupation = '';
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
    setSubmitError('');
    try {
      await authService.register(submissionData);
      setSubmitSuccess(true);
      setIsSubmitting(false);
      navigate('/login', {
        state: {
          registrationSuccess: true,
          message: 'Registration successful! Please log in with your credentials.',
        },
      });
      setTimeout(() => {
        setFormData({
          phoneNumber: '',
          personalDetails: {
            name: '',
            phoneNumber: '',
            email: '',
            birthdate: '',
            sex: '',
            address: {
              street: '',
              city: 'Chennai',
              state: 'Tamil Nadu',
              postalCode: '',
              country: 'India',
            },
            occupation: '',
            age: 0,
          },
          medicalInfo: {
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
          emergencyContact: {
            name: '',
            relationship: '',
            phoneNumber: '',
            address: '',
          },
          insuranceDetails: {
            provider: '',
            policyNumber: '',
            validTill: '',
          },
          clinicPreferences: {
            preferredLanguage: '',
            communicationMethod: ['SMS'],
          },
        });
        setCurrentStep(1);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setSubmitError('Failed to register patient. Please try again.');
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    currentStep,
    setCurrentStep,
    isSubmitting,
    submitSuccess,
    submitError,
    showMissingFieldsError,
    setShowMissingFieldsError,
    formContentRef,
    handlePhoneNumberBlur,
    handleChange,
    handleAddressChange,
    handleFamilyHistoryChange,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    nextStep,
    prevStep,
    handleSubmit,
    isCheckingPhone,
  };
};

export default usePatientRegistrationForm;
