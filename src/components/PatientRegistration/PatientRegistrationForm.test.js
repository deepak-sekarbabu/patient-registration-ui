import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientRegistrationForm from './PatientRegistrationForm';
import authService from '../../services/auth';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock src/services/auth.js
jest.mock('../../services/auth');

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: (html) => html,
}));

describe('PatientRegistrationForm', () => {
  test('successful registration calls authService.register and navigates', async () => {
    authService.register = jest.fn().mockResolvedValue({
      patient: { id: '1', name: 'Test User', phone: '1234567890' }, // Added phone for localStorage
      token: 'fake-token',
    });
    const mockOnRegisterSuccess = jest.fn();
    mockNavigate.mockClear();

    render(<PatientRegistrationForm onRegisterSuccess={mockOnRegisterSuccess} />);

    // Step 1: Personal Details
    fireEvent.change(screen.getByLabelText(/primary phone number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/Sex/i), {
      target: { value: 'Male' },
    });
    fireEvent.change(screen.getByLabelText(/Street\/House No./i), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Chennai' },
    });
    fireEvent.change(screen.getByLabelText(/State/i), {
      target: { value: 'Tamil Nadu' },
    });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), {
      target: { value: '600001' },
    });
    fireEvent.change(screen.getByLabelText(/Country/i), {
      target: { value: 'India' },
    });

    // Navigate through steps
    fireEvent.click(screen.getByRole('button', { name: /next \(requires phone & name\)/i })); // Step 1 to 2
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 2 to 3
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 3 to 4
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 4 to 5
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 5 to 6 (Review)

    // Step 6: Review and Submit
    fireEvent.click(screen.getByRole('button', { name: /submit registration/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });

    // Check the first argument of the first call to authService.register
    const submittedData = authService.register.mock.calls[0][0];
    expect(submittedData.personalDetails.name).toBe('Test User');
    expect(submittedData.phoneNumber).toBe('1234567890');
    expect(submittedData.personalDetails.email).toBe('test@example.com');
    expect(submittedData.personalDetails.birthdate).toBe('1990-01-01');

    expect(mockNavigate).toHaveBeenCalledWith('/info');
    expect(mockOnRegisterSuccess).toHaveBeenCalled();
  });

  test('displays error message on registration failure', async () => {
    authService.register = jest
      .fn()
      .mockRejectedValue(new Error('Failed to register patient. Please try again.'));
    const mockOnRegisterSuccess = jest.fn();
    mockNavigate.mockClear();

    render(<PatientRegistrationForm onRegisterSuccess={mockOnRegisterSuccess} />);

    // Step 1: Personal Details - Fill mandatory fields to pass validation
    fireEvent.change(screen.getByLabelText(/primary phone number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText(/Sex/i), { target: { value: 'Male' } }); // Changed to 'Male' to match typical dropdowns
    fireEvent.change(screen.getByLabelText(/Street\/House No./i), {
      target: { value: '123 Main St' },
    });
    // Ensure City and State are filled as they are often mandatory or have validation
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Chennai' } });
    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Tamil Nadu' } });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: '600001' } });
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'India' } });
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Engineer' } });

    // Navigate through steps
    fireEvent.click(screen.getByRole('button', { name: /next \(requires phone & name\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Reach step 6

    // Step 6: Review and Submit
    fireEvent.click(screen.getByRole('button', { name: /submit registration/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to register patient. Please try again.')).toBeInTheDocument();
    });

    expect(authService.register).toHaveBeenCalled();
    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('defaults preferred language to Tamil', async () => {
    const mockOnRegisterSuccess = jest.fn();
    render(<PatientRegistrationForm onRegisterSuccess={mockOnRegisterSuccess} />);

    // Step 1: Fill mandatory fields to allow navigation
    fireEvent.change(screen.getByLabelText(/primary phone number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test Name' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'testpref@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1995-01-01' } });
    fireEvent.change(screen.getByLabelText(/Sex/i), { target: { value: 'Female' } });
    fireEvent.change(screen.getByLabelText(/Street\/House No./i), {
      target: { value: '456 Test St' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Chennai' } });
    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Tamil Nadu' } });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: '600002' } });
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'India' } });
    // Occupation is not strictly mandatory for nextStep validation but good to have if form logic changes
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Tester' } });

    // Navigate to Step 5 (Clinic Preferences)
    // Button text for first step is "Next (Requires Phone & Name)"
    fireEvent.click(screen.getByRole('button', { name: /next \(requires phone & name\)/i }));
    // Subsequent "Next" buttons
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 2 to 3
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 3 to 4
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 4 to 5

    // Step 5: Clinic Preferences
    const preferredLanguageSelect = screen.getByLabelText(/Preferred Language/i);
    expect(preferredLanguageSelect.value).toBe('Tamil');
  });

  test('auto-fills emergency contact details when relationship is Self', async () => {
    const mockOnRegisterSuccess = jest.fn();
    const testPatientName = 'John Doe';
    const testPatientPhone = '9876543210';
    render(<PatientRegistrationForm onRegisterSuccess={mockOnRegisterSuccess} />);

    // Step 1: Personal Details
    fireEvent.change(screen.getByLabelText(/primary phone number/i), {
      target: { value: testPatientPhone },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: testPatientName } });
    // Fill other mandatory fields to allow navigation
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1985-06-15' } });
    fireEvent.change(screen.getByLabelText(/Sex/i), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText(/Street\/House No./i), {
      target: { value: '789 Self St' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Chennai' } });
    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Tamil Nadu' } });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: '600003' } });
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'India' } });
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Developer' } });

    // Navigate to Step 3 (Emergency Contact)
    fireEvent.click(screen.getByRole('button', { name: /next \(requires phone & name\)/i })); // Step 1 to 2
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Step 2 to 3

    // Step 3: Emergency Contact
    const relationshipSelect = screen.getByLabelText(/Relationship to Patient/i);
    fireEvent.change(relationshipSelect, { target: { value: 'Self' } });

    // Wait for state updates to reflect in the input fields
    await waitFor(() => {
      const emergencyNameInput = screen.getByLabelText(/^Full Name$/i, {
        selector: '#emergencyName',
      });
      expect(emergencyNameInput.value).toBe(testPatientName);
    });

    // Phone number might update without needing another waitFor, but good practice if issues arise
    const emergencyPhoneInput = screen.getByLabelText(/^Phone Number$/i, {
      selector: '#emergencyPhone',
    });
    expect(emergencyPhoneInput.value).toBe(testPatientPhone);
  });
});
