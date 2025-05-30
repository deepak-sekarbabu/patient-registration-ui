import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import authService from '../../services/auth';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: { from: { pathname: '/' } }, // Mock location state as needed
  }),
}));

// Mock src/services/auth.js
jest.mock('../../services/auth');

describe('LoginForm', () => {
  test('displays authentication error on 401', async () => {
    authService.login = jest.fn().mockRejectedValue({
      response: { status: 401 },
      message: 'Unauthorized: Invalid phone number or password',
    });

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => <LoginForm onLogin={context.login} />}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    // Simulate filling in the phone and password fields
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });

    // Simulate clicking the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          'Invalid phone number or password. Please check your credentials and try again.'
        )
      ).toBeInTheDocument();
    });
  });

  test('calls authService.login and navigates on successful login', async () => {
    authService.login = jest.fn().mockResolvedValue({
      patient: { id: '1', name: 'Test User', phone: '1234567890' },
      token: 'fake-token',
    });
    mockNavigate.mockClear();

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => <LoginForm onLogin={context.login} />}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('1234567890', 'password123');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/info', { replace: true });
  });
});
