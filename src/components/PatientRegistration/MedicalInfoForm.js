import React, { useState } from 'react';
import '../../styles/components/CheckboxGroup.css'; // <-- Add this line

const MedicalInfoForm = ({
  formData,
  handleChange,
  handleFamilyHistoryChange,
  handleArrayChange,
  handleAddItem,
  handleRemoveItem,
}) => {
  const { medicalInfo } = formData;

  // Local state for new items
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // Helper function to add an item and clear the input
  const addItemAndClear = (section, field, value, setterFunction) => {
    // Validation: max 100 characters for allergies, conditions, medications
    if (
      ['allergies', 'existingConditions', 'currentMedications'].includes(field) &&
      value.trim().length > 100
    ) {
      alert('Each entry must be 100 characters or less.');
      return;
    }
    handleAddItem(section, field, value);
    setterFunction('');
  };

  return (
    <div className="form-section">
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="bloodGroup" className="form-label">
              Blood Group
            </label>
            <select
              id="bloodGroup"
              className="form-control"
              value={medicalInfo.bloodGroup}
              onChange={(e) => handleChange('medicalInfo', 'bloodGroup', e.target.value)}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Allergies</label>
        <div className="add-item-row">
          <input
            type="text"
            className="form-control"
            value={newAllergy}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNewAllergy(e.target.value);
              }
            }}
            placeholder="e.g., Penicillin"
            maxLength={100}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addItemAndClear('medicalInfo', 'allergies', newAllergy, setNewAllergy)}
          >
            Add
          </button>
        </div>

        {medicalInfo.allergies.length > 0 && (
          <div className="tag-list">
            {medicalInfo.allergies.map((allergy, index) => (
              <span key={index} className="tag">
                {allergy}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => handleRemoveItem('medicalInfo', 'allergies', index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Existing Medical Conditions</label>
        <div className="add-item-row">
          <input
            type="text"
            className="form-control"
            value={newCondition}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNewCondition(e.target.value);
              }
            }}
            placeholder="e.g., Asthma"
            maxLength={100}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              addItemAndClear('medicalInfo', 'existingConditions', newCondition, setNewCondition)
            }
          >
            Add
          </button>
        </div>

        {medicalInfo.existingConditions.length > 0 && (
          <div className="tag-list">
            {medicalInfo.existingConditions.map((condition, index) => (
              <span key={index} className="tag">
                {condition}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => handleRemoveItem('medicalInfo', 'existingConditions', index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Current Medications</label>
        <div className="add-item-row">
          <input
            type="text"
            className="form-control"
            value={newMedication}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNewMedication(e.target.value);
              }
            }}
            placeholder="e.g., Salbutamol inhaler"
            maxLength={100}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              addItemAndClear('medicalInfo', 'currentMedications', newMedication, setNewMedication)
            }
          >
            Add
          </button>
        </div>

        {medicalInfo.currentMedications.length > 0 && (
          <div className="tag-list">
            {medicalInfo.currentMedications.map((medication, index) => (
              <span key={index} className="tag">
                {medication}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => handleRemoveItem('medicalInfo', 'currentMedications', index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <fieldset className="checkbox-group" role="group" aria-labelledby="family-history-legend">
          <legend id="family-history-legend" className="form-label">
            Family Medical History
          </legend>
          <p className="text-muted small" id="family-history-desc">
            Check all that apply in your immediate family
          </p>

          <div className="checkbox-list">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="diabetes"
                checked={medicalInfo.familyHistory.diabetes}
                onChange={(e) => handleFamilyHistoryChange('diabetes', e.target.checked)}
                aria-checked={medicalInfo.familyHistory.diabetes}
                aria-labelledby="family-history-legend diabetes-label"
              />
              <label id="diabetes-label" htmlFor="diabetes">
                Diabetes
              </label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="hypertension"
                checked={medicalInfo.familyHistory.hypertension}
                onChange={(e) => handleFamilyHistoryChange('hypertension', e.target.checked)}
                aria-checked={medicalInfo.familyHistory.hypertension}
                aria-labelledby="family-history-legend hypertension-label"
              />
              <label id="hypertension-label" htmlFor="hypertension">
                Hypertension (High Blood Pressure)
              </label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="heartDisease"
                checked={medicalInfo.familyHistory.heartDisease}
                onChange={(e) => handleFamilyHistoryChange('heartDisease', e.target.checked)}
                aria-checked={medicalInfo.familyHistory.heartDisease}
                aria-labelledby="family-history-legend heartDisease-label"
              />
              <label id="heartDisease-label" htmlFor="heartDisease">
                Heart Disease
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default MedicalInfoForm;
