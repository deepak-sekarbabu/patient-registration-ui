import React from 'react';
import DOMPurify from 'dompurify';
import cities from '../../components/shared/CitiesData';
import states from '../../components/shared/StatesData';

const PersonalDetailsForm = ({
  formData,
  handleChange,
  handleAddressChange,
  errors,
  disablePhoneNumber,
}) => {
  const { personalDetails } = formData;
  // Function to allow only numeric input
  const handleNumericInput = (e) => {
    // Allow: numbers, backspace, tab, delete, arrows, home, end
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter',
      'Escape',
      'Control',
      'Shift',
      'Alt',
      'Meta',
    ];

    // If it's not a number and not one of the allowed control keys, prevent default
    // but only if it's not a control key event (Ctrl+C, Ctrl+V, etc.)
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  // Function to handle name input validation - prevent symbols
  const handleNameInput = (e) => {
    // Allow: letters, spaces, backspace, tab, delete, arrows, home, end
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter',
      'Escape',
      'Control',
      'Shift',
      'Alt',
      'Meta',
      ' ', // Space
    ];

    // If it's not a letter and not one of the allowed control keys, prevent default
    // but only if it's not a control key event (Ctrl+C, Ctrl+V, etc.)
    if (!/^[a-zA-Z]$/.test(e.key) && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };
  return (
    <div className="form-section">
      <h3 className="form-section-title">{DOMPurify.sanitize('Personal Details')}</h3>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label required-field">
              {DOMPurify.sanitize('Primary Phone Number')}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(formData.phoneNumber)}
              onChange={(e) =>
                handleChange('root', 'phoneNumber', DOMPurify.sanitize(e.target.value))
              }
              onKeyDown={handleNumericInput}
              maxLength="10"
              placeholder={DOMPurify.sanitize('e.g., 9876543210')}
              required
              disabled={disablePhoneNumber}
            />
            {errors.phoneNumber ? (
              <div className="input-error">{DOMPurify.sanitize(errors.phoneNumber)}</div>
            ) : (
              <small className="form-text text-muted">
                <b>{DOMPurify.sanitize('Mandatory:')}</b>{' '}
                {DOMPurify.sanitize(
                  'Enter a 10-digit number without any spaces or special characters'
                )}
              </small>
            )}
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="name" className="form-label required-field">
              {DOMPurify.sanitize('Full Name')}
            </label>
            <input
              type="text"
              id="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.name)}
              onChange={(e) =>
                handleChange('personalDetails', 'name', DOMPurify.sanitize(e.target.value))
              }
              onKeyDown={handleNameInput}
              placeholder={DOMPurify.sanitize('e.g., Dinesh Kumar')}
              maxLength="50"
              required
            />
            {errors.name ? (
              <div className="input-error">{DOMPurify.sanitize(errors.name)}</div>
            ) : (
              <small className="form-text text-muted">
                <b>{DOMPurify.sanitize('Mandatory:')}</b>{' '}
                {DOMPurify.sanitize(
                  'Enter your full name (letters and spaces only, maximum 50 characters)'
                )}
              </small>
            )}
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="personalPhoneNumber" className="form-label required-field">
              {DOMPurify.sanitize('Contact Number (Auto-filled)')}
            </label>
            <input
              type="tel"
              id="personalPhoneNumber"
              className="form-control"
              value={DOMPurify.sanitize(personalDetails.phoneNumber)}
              readOnly
              disabled
              placeholder={DOMPurify.sanitize('Will be auto-filled from Primary Phone Number')}
            />
          </div>
        </div>
      </div>{' '}
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {DOMPurify.sanitize('Email Address')}
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.email)}
              onChange={(e) =>
                handleChange('personalDetails', 'email', DOMPurify.sanitize(e.target.value))
              }
              placeholder={DOMPurify.sanitize('e.g., dinesh@example.com')}
            />
            {errors.email ? (
              <div className="input-error">{DOMPurify.sanitize(errors.email)}</div>
            ) : (
              <small className="form-text text-muted">
                {DOMPurify.sanitize('Please enter a valid email address (e.g., name@example.com)')}
              </small>
            )}
          </div>
        </div>
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="birthdate" className="form-label">
              {DOMPurify.sanitize('Date of Birth')}
            </label>
            <input
              type="date"
              id="birthdate"
              className={`form-control ${errors.birthdate ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.birthdate)}
              onChange={(e) =>
                handleChange('personalDetails', 'birthdate', DOMPurify.sanitize(e.target.value))
              }
              max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates in the date picker
            />
            {errors.birthdate ? (
              <div className="input-error">{DOMPurify.sanitize(errors.birthdate)}</div>
            ) : (
              <small className="form-text text-muted">
                {DOMPurify.sanitize('Enter your date of birth (must not be a future date)')}
              </small>
            )}
          </div>
        </div>
      </div>{' '}
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label className="form-label">{DOMPurify.sanitize('Sex')}</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  id="male"
                  name="sex"
                  value="M"
                  checked={personalDetails.sex === 'M'}
                  onChange={(e) =>
                    handleChange('personalDetails', 'sex', DOMPurify.sanitize(e.target.value))
                  }
                />
                <label htmlFor="male">{DOMPurify.sanitize('Male')}</label>
              </div>

              <div className="radio-item">
                <input
                  type="radio"
                  id="female"
                  name="sex"
                  value="F"
                  checked={personalDetails.sex === 'F'}
                  onChange={(e) =>
                    handleChange('personalDetails', 'sex', DOMPurify.sanitize(e.target.value))
                  }
                />
                <label htmlFor="female">{DOMPurify.sanitize('Female')}</label>
              </div>

              <div className="radio-item">
                <input
                  type="radio"
                  id="other"
                  name="sex"
                  value="O"
                  checked={personalDetails.sex === 'O'}
                  onChange={(e) =>
                    handleChange('personalDetails', 'sex', DOMPurify.sanitize(e.target.value))
                  }
                />
                <label htmlFor="other">{DOMPurify.sanitize('Other')}</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="occupation" className="form-label">
              {DOMPurify.sanitize('Occupation')}
            </label>
            <input
              type="text"
              id="occupation"
              className="form-control"
              value={DOMPurify.sanitize(personalDetails.occupation)}
              onChange={(e) =>
                handleChange('personalDetails', 'occupation', DOMPurify.sanitize(e.target.value))
              }
              placeholder={DOMPurify.sanitize('e.g., Software Engineer')}
            />
          </div>
        </div>
      </div>{' '}
      <h4 className="form-section-title">{DOMPurify.sanitize('Address Information')}</h4>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="street" className="form-label">
              {DOMPurify.sanitize('Street/House No.')}
            </label>
            <input
              type="text"
              id="street"
              className={`form-control ${errors.street ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.address.street)}
              onChange={(e) => handleAddressChange('street', DOMPurify.sanitize(e.target.value))}
              placeholder={DOMPurify.sanitize('e.g., 123 Main St')}
              maxLength="100"
            />
            {errors.street ? (
              <div className="input-error">{DOMPurify.sanitize(errors.street)}</div>
            ) : (
              <small className="form-text text-muted">
                {DOMPurify.sanitize('Enter your street address (maximum 100 characters)')}
              </small>
            )}
          </div>
        </div>
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              {DOMPurify.sanitize('City')}
            </label>
            <select
              id="city"
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.address.city)}
              onChange={(e) => handleAddressChange('city', DOMPurify.sanitize(e.target.value))}
            >
              <option value="">{DOMPurify.sanitize('Select a city')}</option>
              {cities.map((city) => (
                <option key={city} value={DOMPurify.sanitize(city)}>
                  {DOMPurify.sanitize(city)}
                </option>
              ))}
            </select>
            {errors.city ? (
              <div className="input-error">{DOMPurify.sanitize(errors.city)}</div>
            ) : (
              <small className="form-text text-muted">
                {DOMPurify.sanitize('Select your city from the dropdown list')}
              </small>
            )}
          </div>
        </div>
      </div>{' '}
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="state" className="form-label">
              {DOMPurify.sanitize('State/Province')}
            </label>
            <select
              id="state"
              className={`form-control ${errors.state ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.address.state)}
              onChange={(e) => handleAddressChange('state', DOMPurify.sanitize(e.target.value))}
            >
              {states.map((state) => (
                <option key={state} value={DOMPurify.sanitize(state)}>
                  {DOMPurify.sanitize(state)}
                </option>
              ))}
            </select>
            {errors.state ? (
              <div className="input-error">{DOMPurify.sanitize(errors.state)}</div>
            ) : (
              <small className="form-text text-muted">
                {DOMPurify.sanitize('Select your state from the dropdown list')}
              </small>
            )}
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="postalCode" className="form-label">
              {DOMPurify.sanitize('Postal Code')}
            </label>
            <input
              type="text"
              id="postalCode"
              className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
              value={DOMPurify.sanitize(personalDetails.address.postalCode)}
              onChange={(e) =>
                handleAddressChange('postalCode', DOMPurify.sanitize(e.target.value))
              }
              onKeyDown={handleNumericInput}
              maxLength="6"
              placeholder={DOMPurify.sanitize('e.g., 600001')}
            />
            {errors.postalCode ? (
              <div className="input-error">{DOMPurify.sanitize(errors.postalCode)}</div>
            ) : (
              <small className="form-text text-muted">
                {DOMPurify.sanitize('Enter your postal code (numbers only, maximum 6 digits)')}
              </small>
            )}
          </div>
        </div>
      </div>{' '}
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="country" className="form-label">
              {DOMPurify.sanitize('Country')}
            </label>
            <input
              type="text"
              id="country"
              className="form-control"
              value={DOMPurify.sanitize(personalDetails.address.country)}
              readOnly
              disabled
              placeholder={DOMPurify.sanitize('India')}
            />
            <small className="form-text text-muted">
              {DOMPurify.sanitize('Country is set to India by default')}
            </small>
          </div>
        </div>
        <div className="form-col">{/* Empty column for balance */}</div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
