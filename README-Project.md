# Patient Registration UI

A modern, multi-step patient registration and management web application built with React.

## Project Overview

The Patient Registration UI is a comprehensive healthcare portal that allows patients to:

- Register with detailed personal and medical information
- Log in using phone number and password
- View and edit their information
- Manage medical history, emergency contacts, and insurance details

The application provides a user-friendly interface with responsive design, input validation, and a step-by-step registration process to enhance user experience.

## Technology Stack

- **Frontend Framework**: React 19.1.0
- **Routing**: React Router DOM 6.30.1
- **HTTP Client**: Axios 1.9.0
- **UI Components**: Bootstrap 5.3.6
- **Animations**: React Transition Group 4.4.5
- **Development Environment**: Create React App

## Project Structure

```
patient-registration-ui/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── PatientRegistration/  # Registration form components
│   │   │   ├── PatientRegistrationForm.js  # Main form container
│   │   │   ├── PersonalDetailsForm.js      # Personal info step
│   │   │   ├── MedicalInfoForm.js          # Medical info step
│   │   │   ├── EmergencyContactForm.js     # Emergency contact step
│   │   │   ├── InsuranceDetailsForm.js     # Insurance details step
│   │   │   ├── ClinicPreferencesForm.js    # Clinic preferences step
│   │   │   └── index.js                    # Component exports
│   │   ├── LoginForm.js    # Login page
│   │   ├── PatientInfo.js  # Patient dashboard
│   │   └── shared/         # Shared UI components and data
│   ├── services/           # API services
│   │   └── api.js          # API communication with backend
│   ├── assets/             # Images, icons, etc.
│   └── App.js              # Main application component with routing
└── package.json            # Dependencies and scripts
```

## Key Features

### Multi-step Registration Process

The registration form consists of 6 steps:

1. **Personal Details**: Basic information including name, phone, email, and address
2. **Medical Information**: Medical history, blood group, allergies, and family health history
3. **Emergency Contact**: Information for emergency situations
4. **Insurance Details**: Health insurance provider and policy information
5. **Clinic Preferences**: Communication preferences and language settings
6. **Review**: Final summary of all information before submission

### Authentication Flow

- **Registration**: Users register with their phone number and personal details
- **Login**: Users can log in using their phone number and password
- **Session Management**: Authentication state is preserved using localStorage
- **Logout**: Users can securely log out, clearing their session data

### Patient Dashboard

Once logged in, patients can:

- View a summary of their personal information
- Use "Quick Edit" for simple changes to personal details
- Use "Full Edit" to navigate through the complete information form
- Log out of their account

### Form Validation

The application includes comprehensive validation:

- Phone number format validation
- Email format validation
- Required field validation
- Date validation (e.g., birthdate cannot be in the future)
- Character limit validations
- Field type validations (numeric, text, etc.)

### API Integration

The application communicates with a RESTful backend API:

- Patient registration
- Authentication
- Patient information retrieval and updates
- Phone number availability check

## State Management

The application uses React's built-in state management with `useState` and `useEffect` hooks:

- Form data is managed within individual form components
- Authentication state is maintained in the App component
- LocalStorage is used to persist authentication between sessions

## UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop screens
- **Progress Indicator**: Shows users their progress during registration
- **Form Step Navigation**: Allows users to move back and forth between steps
- **Input Validation**: Provides immediate feedback on input errors
- **Animations**: Smooth transitions between form steps
- **Loading Indicators**: Shows loading state during API calls

## Development and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```

### Running the Application

Start the development server:

```
npm start
```

The application will be available at <http://localhost:3000>

### Building for Production

Create a production build:

```
npm run build
```

## Backend API Requirements

The application expects a backend API with the following endpoints:

- `POST /v1/api/patients` - Register a new patient
- `POST /v1/api/patients/login` - Authenticate a patient
- `PUT /v1/api/patients/:id` - Update patient information
- `GET /v1/api/patients/exists-by-phone` - Check if a phone number is already registered

## Future Enhancements

Potential improvements for future versions:

- Support for multiple languages
- Dark mode
- Appointment scheduling
- Medical report uploads
- Integration with telemedicine services
- Enhanced security features (2FA, biometric authentication)
