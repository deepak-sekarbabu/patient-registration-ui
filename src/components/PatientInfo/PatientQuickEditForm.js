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
        onChange={(e) => handleNestedChange('personalDetails', 'phoneNumber', e.target.value)}
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
        onChange={(e) => handleNestedChange('personalDetails', 'occupation', e.target.value)}
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
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
      <button type="button" className="btn btn-danger" onClick={onCancel}>
        Cancel
      </button>
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
