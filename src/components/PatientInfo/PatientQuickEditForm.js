import PropTypes from 'prop-types';
import React from 'react';

const PatientQuickEditForm = ({
  formData,
  handleNestedChange,
  handleAddressChange,
  onSubmit,
  onCancel,
  loading,
}) => (
  <form onSubmit={onSubmit} className="quick-edit-form">
    {/* Use Bootstrap's grid system with gutters (g-3) for spacing */}
    <div className="row g-3">
      {/* Row 1: Full Name and Phone Number */}
      <div className="col-md-6">
        <label htmlFor="quickEditName" className="form-label">
          Full Name
        </label>
        <input
          type="text"
          id="quickEditName"
          className="form-control"
          name="name"
          value={formData.personalDetails.name || ''}
          onChange={(e) => handleNestedChange('personalDetails', 'name', e.target.value)}
        />
      </div>
      <div className="col-md-6">
        <label htmlFor="quickEditPhone" className="form-label">
          Phone Number
        </label>
        <input
          type="text"
          id="quickEditPhone"
          className="form-control"
          name="phoneNumber"
          value={formData.personalDetails.phoneNumber || ''}
          onChange={(e) => handleNestedChange('personalDetails', 'phoneNumber', e.target.value)}
          disabled
        />
      </div>

      {/* Row 2: Email and Date of Birth */}
      <div className="col-md-6">
        <label htmlFor="quickEditEmail" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="quickEditEmail"
          className="form-control"
          name="email"
          value={formData.personalDetails.email || ''}
          onChange={(e) => handleNestedChange('personalDetails', 'email', e.target.value)}
        />
      </div>
      <div className="col-md-6">
        <label htmlFor="quickEditBirthdate" className="form-label">
          Date of Birth
        </label>
        <input
          type="date"
          id="quickEditBirthdate"
          className="form-control"
          name="birthdate"
          value={formData.personalDetails.birthdate || ''}
          onChange={(e) => handleNestedChange('personalDetails', 'birthdate', e.target.value)}
        />
      </div>

      {/* Row 3: Occupation and Sex */}
      <div className="col-md-6">
        <label htmlFor="quickEditOccupation" className="form-label">
          Occupation
        </label>
        <input
          type="text"
          id="quickEditOccupation"
          className="form-control"
          name="occupation"
          value={formData.personalDetails.occupation || ''}
          onChange={(e) => handleNestedChange('personalDetails', 'occupation', e.target.value)}
          placeholder="e.g., Software Engineer"
        />
      </div>
      <div className="col-md-6">
        {/* Use a fieldset for accessibility with radio buttons */}
        <fieldset>
          <legend className="form-label">Sex</legend>
          {/* Use flexbox for horizontal alignment of radio buttons */}
          <div className="d-flex flex-wrap gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="quickEditMale"
                name="quickEditSex"
                value="M"
                checked={formData.personalDetails.sex === 'M'}
                onChange={(e) => handleNestedChange('personalDetails', 'sex', e.target.value)}
              />
              <label className="form-check-label" htmlFor="quickEditMale">
                Male
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="quickEditFemale"
                name="quickEditSex"
                value="F"
                checked={formData.personalDetails.sex === 'F'}
                onChange={(e) => handleNestedChange('personalDetails', 'sex', e.target.value)}
              />
              <label className="form-check-label" htmlFor="quickEditFemale">
                Female
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="quickEditOther"
                name="quickEditSex"
                value="O"
                checked={formData.personalDetails.sex === 'O'}
                onChange={(e) => handleNestedChange('personalDetails', 'sex', e.target.value)}
              />
              <label className="form-check-label" htmlFor="quickEditOther">
                Other
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Address Section with a Nested Grid */}
      <div className="col-12">
        <label className="form-label">Address</label>
        {/* Use a nested row with smaller gaps (g-2) for address fields */}
        <div className="row g-2">
          <div className="col-12 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Street"
              name="street"
              value={formData.personalDetails.address.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
            />
          </div>
          <div className="col-md-5 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="City"
              name="city"
              value={formData.personalDetails.address.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="State / Province"
              name="state"
              value={formData.personalDetails.address.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Postal Code"
              name="postalCode"
              value={formData.personalDetails.address.postalCode || ''}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            />
          </div>
          <div className="col-12 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Country"
              name="country"
              value={formData.personalDetails.address.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* Push buttons to the end with a gap */}
      <div className="col-12 d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </form>
);

PatientQuickEditForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleNestedChange: PropTypes.func.isRequired,
  handleAddressChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default PatientQuickEditForm;
