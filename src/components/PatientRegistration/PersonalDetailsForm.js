import React from "react";
import cities from "../../components/shared/CitiesData";

const PersonalDetailsForm = ({
  formData,
  handleChange,
  handleAddressChange,
  errors,
}) => {
  const { personalDetails } = formData;
  // Function to allow only numeric input
  const handleNumericInput = (e) => {
    // Allow: numbers, backspace, tab, delete, arrows, home, end
    const allowedKeys = [
      "Backspace",
      "Tab",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      "Escape",
      "Control",
      "Shift",
      "Alt",
      "Meta",
    ];

    // If it's not a number and not one of the allowed control keys, prevent default
    // but only if it's not a control key event (Ctrl+C, Ctrl+V, etc.)
    if (
      !/^\d$/.test(e.key) &&
      !allowedKeys.includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  // Function to handle name input validation - prevent symbols
  const handleNameInput = (e) => {
    // Allow: letters, spaces, backspace, tab, delete, arrows, home, end
    const allowedKeys = [
      "Backspace",
      "Tab",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      "Escape",
      "Control",
      "Shift",
      "Alt",
      "Meta",
      " ", // Space
    ];

    // If it's not a letter and not one of the allowed control keys, prevent default
    // but only if it's not a control key event (Ctrl+C, Ctrl+V, etc.)
    if (
      !/^[a-zA-Z]$/.test(e.key) &&
      !allowedKeys.includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Personal Details</h3>

      <div className="form-row">
        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label required-field">
              Primary Phone Number
            </label>{" "}
            <input
              type="tel"
              id="phoneNumber"
              className={`form-control ${
                errors.phoneNumber ? "is-invalid" : ""
              }`}
              value={formData.phoneNumber}
              onChange={(e) =>
                handleChange("root", "phoneNumber", e.target.value)
              }
              onKeyDown={handleNumericInput}
              maxLength="10"
              placeholder="e.g., 9876543210"
              required
            />
            {errors.phoneNumber ? (
              <div className="input-error">{errors.phoneNumber}</div>
            ) : (
              <small className="form-text text-muted">
                Enter a 10-digit number without any spaces or special characters
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="name" className="form-label required-field">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={personalDetails.name}
              onChange={(e) =>
                handleChange("personalDetails", "name", e.target.value)
              }
              onKeyDown={handleNameInput}
              placeholder="e.g., Dinesh Kumar"
              maxLength="50"
              required
            />
            {errors.name ? (
              <div className="input-error">{errors.name}</div>
            ) : (
              <small className="form-text text-muted">
                Enter your full name (letters and spaces only, maximum 50
                characters)
              </small>
            )}
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            {" "}
            <label
              htmlFor="personalPhoneNumber"
              className="form-label required-field"
            >
              Contact Number (Auto-filled)
            </label>
            <input
              type="tel"
              id="personalPhoneNumber"
              className="form-control"
              value={personalDetails.phoneNumber}
              readOnly
              disabled
              placeholder="Will be auto-filled from Primary Phone Number"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="email" className="form-label required-field">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={personalDetails.email}
              onChange={(e) =>
                handleChange("personalDetails", "email", e.target.value)
              }
              placeholder="e.g., dinesh@example.com"
              required
            />
            {errors.email ? (
              <div className="input-error">{errors.email}</div>
            ) : (
              <small className="form-text text-muted">
                Please enter a valid email address (e.g., name@example.com)
              </small>
            )}
          </div>
        </div>{" "}
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="birthdate" className="form-label required-field">
              Date of Birth
            </label>
            <input
              type="date"
              id="birthdate"
              className={`form-control ${errors.birthdate ? "is-invalid" : ""}`}
              value={personalDetails.birthdate}
              onChange={(e) =>
                handleChange("personalDetails", "birthdate", e.target.value)
              }
              required
              max={new Date().toISOString().split("T")[0]} // Prevent selecting future dates in the date picker
            />
            {errors.birthdate ? (
              <div className="input-error">{errors.birthdate}</div>
            ) : (
              <small className="form-text text-muted">
                Enter your date of birth (must not be a future date)
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label className="form-label required-field">Sex</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  id="male"
                  name="sex"
                  value="M"
                  checked={personalDetails.sex === "M"}
                  onChange={(e) =>
                    handleChange("personalDetails", "sex", e.target.value)
                  }
                  required
                />
                <label htmlFor="male">Male</label>
              </div>

              <div className="radio-item">
                <input
                  type="radio"
                  id="female"
                  name="sex"
                  value="F"
                  checked={personalDetails.sex === "F"}
                  onChange={(e) =>
                    handleChange("personalDetails", "sex", e.target.value)
                  }
                />
                <label htmlFor="female">Female</label>
              </div>

              <div className="radio-item">
                <input
                  type="radio"
                  id="other"
                  name="sex"
                  value="O"
                  checked={personalDetails.sex === "O"}
                  onChange={(e) =>
                    handleChange("personalDetails", "sex", e.target.value)
                  }
                />
                <label htmlFor="other">Other</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="occupation" className="form-label">
              Occupation
            </label>
            <input
              type="text"
              id="occupation"
              className="form-control"
              value={personalDetails.occupation}
              onChange={(e) =>
                handleChange("personalDetails", "occupation", e.target.value)
              }
              placeholder="e.g., Software Engineer"
            />
          </div>
        </div>
      </div>

      <h4 className="form-section-title">Address Information</h4>

      <div className="form-row">
        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="street" className="form-label required-field">
              Street/House No.
            </label>
            <input
              type="text"
              id="street"
              className={`form-control ${errors.street ? "is-invalid" : ""}`}
              value={personalDetails.address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              placeholder="e.g., 123 Main St"
              maxLength="100"
              required
            />
            {errors.street ? (
              <div className="input-error">{errors.street}</div>
            ) : (
              <small className="form-text text-muted">
                Enter your street address (maximum 100 characters)
              </small>
            )}
          </div>
        </div>{" "}
        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="city" className="form-label required-field">
              City
            </label>
            <select
              id="city"
              className={`form-control ${errors.city ? "is-invalid" : ""}`}
              value={personalDetails.address.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              required
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city ? (
              <div className="input-error">{errors.city}</div>
            ) : (
              <small className="form-text text-muted">
                Select your city from the dropdown list
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="state" className="form-label required-field">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              className="form-control"
              value={personalDetails.address.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              placeholder="e.g., Tamil Nadu"
              required
            />
          </div>
        </div>

        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="postalCode" className="form-label required-field">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              className={`form-control ${
                errors.postalCode ? "is-invalid" : ""
              }`}
              value={personalDetails.address.postalCode}
              onChange={(e) =>
                handleAddressChange("postalCode", e.target.value)
              }
              onKeyDown={handleNumericInput}
              maxLength="6"
              placeholder="e.g., 600001"
              required
            />
            {errors.postalCode ? (
              <div className="input-error">{errors.postalCode}</div>
            ) : (
              <small className="form-text text-muted">
                Enter your postal code (numbers only, maximum 6 digits)
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          {" "}
          <div className="form-group">
            <label htmlFor="country" className="form-label required-field">
              Country
            </label>
            <input
              type="text"
              id="country"
              className="form-control"
              value={personalDetails.address.country}
              readOnly
              disabled
              placeholder="India"
              required
            />
            <small className="form-text text-muted">
              Country is set to India by default
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
