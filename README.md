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

### Environment Variables

This project uses a `.env` file for environment-specific configuration. Create a `.env` file in the root of the project and add the following variables:

- `PORT`: Specifies the port on which the development server will run.
  - Example: `PORT=3000`
- `REACT_APP_API_URL`: Sets the base URL for the API endpoints.
  - Example: `REACT_APP_API_URL=http://localhost:8081/v1/api`

These variables allow you to customize the application's behavior without modifying the codebase.

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
├── .github/ # GitHub workflows and configurations
├── public/ # Static files
├── src/ # Source code
│ ├── components/ # React components
│ │ ├── Appointment/ # Appointment scheduling components
│ │ ├── Login/ # Login components
│ │ ├── PasswordChange/ # Password change components
│ │ ├── PatientInfo/ # Patient dashboard and info components
│ │ ├── PatientRegistration/ # Registration flow components
│ │ └── shared/ # Shared components
│ │ └── ErrorAlert/ # Error alert component
│ ├── context/ # React Context providers
│ ├── services/ # API services
│ ├── styles/ # Application styles
│ │ ├── base/ # Foundational styles
│ │ ├── components/ # Component-specific styles
│ │ ├── layouts/ # Layout styles
│ │ ├── mixins/ # CSS mixins
│ │ ├── themes/ # Color themes
│ │ └── utils/ # Utility styles
│ └── utils/ # Utility functions
├── .cursorignore # Files and directories ignored by Cursor
├── .env # Environment variables
├── .gitignore # Git ignored files
├── .prettierignore # Prettier ignored files
├── .prettierrc # Prettier configuration
├── package-lock.json # Dependency lock file
├── package.json # Dependencies and scripts
├── README-Project.md # Detailed project documentation
├── README.md # Project overview and quick start
└── server.js # Development server setup
```

For more detailed documentation, please refer to the [comprehensive project README](./README-Project.md).

## 💅 Styling

The project's styling is managed within the `src/styles/` directory, following a structured approach to organize CSS files. This structure helps maintain a clean and scalable stylesheet architecture.

- **`base/`**: Contains foundational styles like resets, typography, and global variables.
- **`components/`**: Houses styles specific to individual React components.
- **`layouts/`**: Includes styles for overall page layouts and structural elements.
- **`media-queries.css`**: Centralizes responsive design rules.
- **`mixins/`**: (If applicable) Contains reusable CSS patterns.
- **`themes/`**: Holds styles for different application themes.
- **`utils/`**: Provides utility classes for common styling needs.

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

## Dockerization

This application has been containerized using Docker.

### Building the Docker Image

To build the Docker image, navigate to the project's root directory (where the `Dockerfile` is located) and run the following command:

```sh
docker build -t patient-registration-ui .
```

Replace `patient-registration-ui` with your desired image name if needed.

### Running the Docker Container

Once the image is built, you can run the application in a Docker container using:

```sh
docker run -p 3000:3000 -d patient-registration-ui
```

This command will:
- Run the container in detached mode (`-d`).
- Map port 3000 on your host to port 3000 in the container (`-p 3000:3000`). The application inside the container listens on the port specified by the `PORT` environment variable, which defaults to 3000 in the `Dockerfile`.

If you want to run the application on a different host port, you can change the first part of the port mapping. For example, to map host port 8080 to container port 3000:

```sh
docker run -p 8080:3000 -d patient-registration-ui
```

You can also override the port the application inside the container listens on by setting the `PORT` environment variable:

```sh
docker run -p <host_port>:<container_port> -e PORT=<container_port> -d patient-registration-ui
```
For example, to make the application listen on port 4000 inside the container and map it to host port 8080:
```sh
docker run -p 8080:4000 -e PORT=4000 -d patient-registration-ui
```
