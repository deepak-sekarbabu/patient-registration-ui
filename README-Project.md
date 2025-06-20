# Patient Journey App

A modern, multi-step patient registration and management application built with React 18 for web. This repository is for the web application only. React Native/mobile is planned for the future but not present in this repository.

## Project Overview

The Patient Journey App is a comprehensive healthcare portal that allows patients to:

- Register with detailed personal and medical information
- Log in using phone number and password
- View and edit their information
- Manage medical history, emergency contacts, and insurance details

The application provides a user-friendly interface with responsive design, input validation, and a step-by-step registration process to enhance user experience.

## Technology Stack

### Web Platform

- **Frontend Framework**: React 18.x
- **Routing**: React Router DOM 6.x
- **HTTP Client**: Axios 1.6.x
- **UI Components**: Bootstrap 5.3.x, React Bootstrap, Lucide React, React Icons
- **State Management**: React Context API
- **Development Environment**: Create React App (react-scripts)

## Project Structure

```plaintext
patient-registration-ui/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Appointment/    # Appointment scheduling components
│   │   ├── Login/          # Login components
│   │   ├── Navbar/         # Navigation bar components
│   │   ├── PasswordChange/ # Password management
│   │   ├── PatientInfo/    # Patient dashboard
│   │   ├── PatientRegistration/  # Registration form components
│   │   └── shared/         # Shared UI components and data
│   ├── context/            # React Context providers
│   ├── services/           # API services
│   ├── styles/             # Application styles
│   └── utils/              # Utility functions
├── package.json            # Dependencies and scripts
├── server.js               # Development server setup
├── Dockerfile              # Docker containerization
├── README.md               # Project overview and quick start
├── README-Project.md       # Detailed project documentation
└── DEVELOPMENT.md          # Development guidelines
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

The application communicates with a RESTful backend API (not included in this repo):

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
npm run dev
```

The application will be available at <http://localhost:3000>

### Building for Production

Create a production build:

```bash
npm run build
```

### Running with Express (Production Build)

After building, you can serve the app using the included Express server:

```bash
npm start
```

### Docker

Build and run the Docker container:

```sh
docker build -t patient-registration-ui .
docker run -p 3000:80 -d patient-registration-ui
```

## Backend API Requirements

The application communicates with a RESTful backend API (not included in this repo) through the following endpoints:

```http
# Patient Registration
POST /v1/api/patients

# Patient Authentication
POST /v1/api/auth/login

# Update Patient Information
PUT /v1/api/patients/:id

# Check Phone Number Availability
GET /v1/api/patients/exists-by-phone
```

## Future Enhancements

Planned improvements for upcoming versions include:

- **Cross-Platform Support**:
  - Complete React Native implementation for iOS and Android (planned)
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
