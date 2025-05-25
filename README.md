# Patient Journey App

A modern, multi-step patient registration and management application built with React.

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)
![React Router](https://img.shields.io/badge/React%20Router-7.6.1-CA4245?style=flat&logo=react-router)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.6-7952B3?style=flat&logo=bootstrap)
![Axios](https://img.shields.io/badge/Axios-1.9.0-5A29E4?style=flat&logo=axios)

## 📑 About

This project provides a comprehensive healthcare portal for patients to register, manage their personal and medical information, and interact with healthcare providers. See [detailed documentation](./README-Project.md) for complete features and technical specifications.

**Key Features:**

- Multi-step registration process with comprehensive validation
- Secure authentication with phone number and password
- Patient dashboard for viewing and editing personal information
- Integration with healthcare provider APIs
- Responsive design for all device sizes

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- npm v6+

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
```

The application will be available at http://localhost:3000

### Production Build

```bash
# Create optimized build
npm run build
```

### Testing

```bash
# Run tests
npm test
```

## 🛠️ Development Tools

### Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code style:

```bash
# Format all project files
npm run format
```

## 📚 Project Structure

```
patient-registration-ui/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Login/          # Login components
│   │   ├── PasswordChange/ # Password change components
│   │   ├── PatientInfo/    # Patient dashboard
│   │   ├── PatientRegistration/ # Registration flow
│   │   └── shared/         # Shared components
│   ├── context/            # React Context providers
│   ├── services/           # API services
│   └── utils/              # Utility functions
└── package.json            # Dependencies and scripts
```

For more detailed documentation, please refer to the [comprehensive project README](./README-Project.md).

## 🧹 Code Formatting

This project uses [Prettier](https://prettier.io/) for code formatting to ensure consistent style across the codebase.

### Setup for Development

1. Install Prettier in your development environment:

   ```bash
   # Already included in devDependencies
   npm install
   ```

2. Configure your editor to use Prettier:
   - VS Code: Install Prettier extension
   - JetBrains IDEs: Install Prettier plugin
   - Other editors: See [Prettier Editor Integration](https://prettier.io/docs/en/editors.html)

3. The formatting rules are defined in the `.prettierrc` file in the project root.

### Usage

Format all project files:

```bash
# Using npm script (recommended)
npm run format

# Or directly with npx
npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,md}"
```

- You can also integrate Prettier with your code editor for automatic formatting on save.
