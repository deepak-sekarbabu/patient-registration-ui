import { AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';

const BookSlotStep = ({
  formData,
  errors,
  handleChange,
  availableDates,
  availableSlots,
  isFetchingDates,
  dateError,
  currentTime,
  setErrors,
}) => (
  <div className="form-step">
    <h3>Select Date & Time</h3>
    {isFetchingDates ? (
      <div className="d-flex align-items-center p-3">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading available dates...</span>
      </div>
    ) : dateError ? (
      <div className="alert alert-danger">
        <AlertCircle className="mr-2 h-4 w-4" />
        {dateError}
      </div>
    ) : (
      <div className="form-group">
        <label>Available Dates</label>
        {availableDates.length > 0 ? (
          <div className="date-selection">
            <div className="available-dates-grid">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <button
                    key={date}
                    type="button"
                    className={`date-option-btn ${formData.appointmentDate === date ? 'selected' : ''}`}
                    onClick={() => {
                      handleChange('appointmentDate', date);
                      handleChange('slotId', '');
                    }}
                  >
                    <div className="date-display">
                      <span className="date-day">{formattedDate}</span>
                      <span className="date-full">{date}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <label className="form-label">Or select date:</label>
              <input
                type="date"
                className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                value={formData.appointmentDate}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (availableDates.includes(selectedDate)) {
                    handleChange('appointmentDate', selectedDate);
                    handleChange('slotId', '');
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      appointmentDate:
                        'This date is not available. Please select from available dates above.',
                    }));
                  }
                }}
                min={
                  availableDates.length > 0
                    ? availableDates[0]
                    : new Date().toISOString().split('T')[0]
                }
                max={
                  availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined
                }
              />
            </div>
          </div>
        ) : (
          <div className="no-dates-available">
            <AlertCircle className="mr-2 h-4 w-4" />
            <p>No available dates for this doctor. Please select a different doctor.</p>
          </div>
        )}
        {errors.appointmentDate && (
          <div className="invalid-feedback d-block">{errors.appointmentDate}</div>
        )}
      </div>
    )}
    <div className="form-group">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label>Available Time Slots</label>
        <div className="current-time">
          <strong>Current time:</strong>{' '}
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {availableSlots.length > 0 ? (
        <div className="time-slots">
          {availableSlots
            .filter((slot) => {
              const [hours, minutes] = slot.time.split(':').map(Number);
              const slotDateTime = new Date(formData.appointmentDate);
              slotDateTime.setHours(hours, minutes, 0, 0);
              const isToday = slotDateTime.toDateString() === currentTime.toDateString();
              return !isToday || slotDateTime > currentTime;
            })
            .sort((a, b) => {
              const [aHours, aMinutes] = a.time.split(':').map(Number);
              const [bHours, bMinutes] = b.time.split(':').map(Number);
              return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
            })
            .map((slot) => {
              const isBaseDisabled = slot.booked || slot.isExpired;
              const isOtherSlotSelected = formData.slotId && formData.slotId !== slot.slotId;
              const finalIsDisabled = isBaseDisabled || isOtherSlotSelected;
              const buttonClassName = `time-slot-btn ${formData.slotId === slot.slotId ? 'selected' : ''} ${slot.booked ? 'booked' : ''} ${slot.isExpired ? 'expired' : ''}`;
              return (
                <button
                  key={slot.slotId}
                  type="button"
                  className={buttonClassName}
                  onClick={() => !finalIsDisabled && handleChange('slotId', slot.slotId)}
                  disabled={finalIsDisabled}
                  title={
                    slot.isExpired
                      ? 'This time slot has passed'
                      : slot.booked
                        ? 'Already booked'
                        : ''
                  }
                >
                  {slot.time}
                  {slot.booked && <span className="badge">Booked</span>}
                  {slot.isExpired && !slot.booked && <span className="badge">Expired</span>}
                </button>
              );
            })}
        </div>
      ) : (
        <div className="no-slots">
          {isFetchingDates
            ? 'Loading time slots...'
            : dateError
              ? 'Cannot load time slots due to date fetch error.'
              : formData.appointmentDate
                ? availableDates.length === 0
                  ? 'No available dates for this doctor.'
                  : 'No available slots for this date. Please select another date.'
                : 'Please select a date to see available time slots.'}
        </div>
      )}
      {errors.slotId && <div className="invalid-feedback d-block">{errors.slotId}</div>}
    </div>
  </div>
);

export default BookSlotStep;
