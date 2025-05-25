# Patient Journey App

A modern, multi-step patient registration and management application built with React 19 for web and planned React Native implementation for mobile platforms. This cross-platform solution provides a seamless user experience across devices while maintaining consistent business logic.

## Project Overview

The Patient Journey App is a comprehensive healthcare portal that allows patients to:

- Register with detailed personal and medical information
- Log in using phone number and password
- View and edit their information
- Manage medical history, emergency contacts, and insurance details

The application provides a user-friendly interface with responsive design, input validation, and a step-by-step registration process to enhance user experience.

## Technology Stack

### Web Platform
- **Frontend Framework**: React 19.1.0
- **Routing**: React Router DOM 7.6.1
- **HTTP Client**: Axios 1.9.0
- **UI Components**: Bootstrap 5.3.6
- **Animations**: React Transition Group 4.4.5
- **State Management**: React Context API
- **Development Environment**: Create React App

### Mobile Platform (Planned)
- **Framework**: React Native
- **Navigation**: React Navigation
- **UI Components**: React Native components with platform-specific adaptations
- **State Synchronization**: Shared business logic with web version

## Project Structure

```plaintext
patient-registration-ui/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Login/          # Login components
│   │   │   ├── LoginForm.css
│   │   │   └── LoginForm.js
│   │   ├── PasswordChange/ # Password management
│   │   │   ├── ChangePasswordModal.css
│   │   │   └── ChangePasswordModal.jsx
│   │   ├── PatientInfo/    # Patient dashboard
│   │   │   ├── PatientInfo.css
│   │   │   └── PatientInfo.js
│   │   ├── PatientRegistration/  # Registration form components
│   │   │   ├── PatientRegistrationForm.js  # Main form container
│   │   │   ├── PatientRegistrationForm.css
│   │   │   ├── PersonalDetailsForm.js      # Personal info step
│   │   │   ├── MedicalInfoForm.js          # Medical info step
│   │   │   ├── EmergencyContactForm.js     # Emergency contact step
│   │   │   ├── InsuranceDetailsForm.js     # Insurance details step
│   │   │   ├── ClinicPreferencesForm.js    # Clinic preferences step
│   │   │   └── index.js                    # Component exports
│   │   └── shared/         # Shared UI components and data
│   │       ├── CitiesData.js
│   │       ├── LoadingSpinner.css
│   │       ├── LoadingSpinner.js
│   │       ├── RelationshipsData.js
│   │       ├── StatesData.js
│   │       └── ErrorAlert/  # Error handling components
│   ├── context/            # React Context providers
│   │   └── AuthContext.js  # Authentication context
│   ├── services/           # API services
│   │   ├── api.js          # API communication with backend
│   │   └── auth.js         # Authentication services
│   ├── utils/              # Utility functions
│   │   └── debugUtils.js   # Debugging utilities
│   ├── App.css             # Main app styles
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

The application uses a combination of React Context API and local state management:

- **Authentication State**: Managed through AuthContext for app-wide access to user authentication state
- **Form State**: Managed within individual form components using React's `useState` hook
- **Component State**: Local component state managed with `useState` and `useEffect` hooks
- **Persistence**: Authentication state and user data persisted through localStorage and cookies
- **API State**: Loading states, errors, and API responses handled within service functions

## UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop screens
- **Progress Indicator**: Shows users their progress during registration
- **Form Step Navigation**: Allows users to move back and forth between steps
- **Input Validation**: Provides immediate feedback on input errors
- **Animations**: Smooth transitions between form steps
- **Loading Indicators**: Shows loading state during API calls

## Cross-Platform Development

The application is built with cross-platform support in mind:

- **Current Status**: Fully functional web application with responsive design
- **Mobile Development**: React Native implementation planned for both iOS and Android
- **Code Sharing**: Business logic, API services, and validation code designed for reuse
- **Platform-Specific Components**:
  - Files with `.web.js` extension for web-specific components
  - Files with `.native.js` extension for shared mobile components
  - Files with `.ios.js`/`.android.js` for platform-specific implementations
- **Consistency**: Shared design system across platforms while respecting native UX conventions

## Development and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm start
```

The application will be available at <http://localhost:3000>

### Building for Production

Create a production build:

```bash
npm run build
```

## Backend API Requirements

The application communicates with a RESTful backend API through the following endpoints:

```http
# Patient Registration
POST /v1/api/patients

# Patient Authentication
POST /v1/api/patients/login

# Update Patient Information
PUT /v1/api/patients/:id

# Check Phone Number Availability
GET /v1/api/patients/exists-by-phone
```

## Future Enhancements

Planned improvements for upcoming versions include:

- **Cross-Platform Support**:
  - Complete React Native implementation for iOS and Android
  - Platform-specific UI optimizations

- **Enhanced Features**:
  - Multilanguage support with i18n
  - Dark mode implementation
  - Appointment scheduling and calendar integration
  - Medical report uploads and document management
  - Video consultation through telemedicine integration

- **Security Enhancements**:
  - Two-factor authentication (2FA)
  - Biometric authentication for mobile applications
  - Enhanced data encryption

- **Performance Optimizations**:
  - Code splitting and lazy loading
  - Offline support with data synchronization
  - Progressive Web App (PWA) capabilities
