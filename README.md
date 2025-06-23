# Patient Journey App

A modern, multi-step patient registration and management application built with React 18 for web. This repository is for the web application only. React Native/mobile is planned for the future but not present in this repository.

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![React Router](https://img.shields.io/badge/React%20Router-6.x-CA4245?style=flat&logo=react-router)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.x-7952B3?style=flat&logo=bootstrap)
![Axios](https://img.shields.io/badge/Axios-1.6.x-5A29E4?style=flat&logo=axios)

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
npm run dev
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
├── public/ # Static files
├── src/ # Source code
│   ├── components/
│   │   ├── Appointment/
│   │   ├── Login/
│   │   ├── Navbar/
│   │   ├── PasswordChange/
│   │   ├── PatientInfo/
│   │   ├── PatientRegistration/
│   │   └── shared/
│   ├── context/
│   ├── services/
│   ├── styles/
│   └── utils/
├── package.json
├── server.js
├── Dockerfile
├── README.md
├── README-Project.md
└── DEVELOPMENT.md
```

For more detailed documentation, please refer to the [comprehensive project README](./README-Project.md).

## 💅 Styling

The project's styling is managed within the `src/styles/` directory, following a structured approach to organize CSS files. This structure helps maintain a clean and scalable stylesheet architecture.

- **`base/`**: Contains foundational styles like resets, typography, and global variables.
- **`components/`**: Houses styles specific to individual React components.
- **`layouts/`**: Includes styles for overall page layouts and structural elements.
- **`media-queries.css`**: Centralizes responsive design rules.
- **`mixins/`**: Contains reusable CSS patterns.
- **`themes/`**: Holds styles for different application themes.
- **`utils/`**: Provides utility classes for common styling needs.

## 🧹 Code Formatting

This project uses [Prettier](https://prettier.io/) for code formatting to ensure consistent style across the codebase.

### Setup for Development

1. Install Prettier in your development environment:

   ```bash
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
npm run format
```

- You can also integrate Prettier with your code editor for automatic formatting on save.

## Dockerization

This application has been containerized using Docker.

### Building the Docker Image

To build the Docker image, navigate to the project's root directory (where the `Dockerfile` is located) and run the following command:

```sh
docker build -t patient-registration-ui .
```

### Running the Docker Container

Once the image is built, you can run the application in a Docker container using:

```sh
docker run -p 3000:80 -d patient-registration-ui
```

This command will:

- Run the container in detached mode (`-d`).
- Map port 3000 on your host to port 80 in the container (`-p 3000:80`). The application inside the container listens on port 80 by default.

If you want to run the application on a different host port, you can change the first part of the port mapping. For example, to map host port 8080 to container port 80:

```sh
docker run -p 8080:80 -d patient-registration-ui
```

## 🏗️ Project Architecture

This project follows a modular, feature-based architecture. Major features are organized into folders under `src/components/`, with shared logic and UI in `shared/`. State management is handled via React Context and local state. API calls are centralized in `src/services/`. For a detailed breakdown, see [README-Project.md](./README-Project.md).

## 🤝 Contributing

We welcome contributions! Please read the [DEVELOPMENT.md](./DEVELOPMENT.md) for coding standards, branch strategy, and pull request guidelines. To contribute:

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Commit your changes with clear messages
4. Open a pull request and request review
5. Update documentation and tests as needed

For bug reports or feature requests, please open an issue with clear steps to reproduce or a detailed description.

## 🛠️ Troubleshooting & FAQ

- **App won't start?** Ensure Node.js v14+ and npm v6+ are installed. Delete `node_modules` and run `npm install` again.
- **API errors?** Check your `.env` file for correct `REACT_APP_API_URL`.
- **Docker issues?** Make sure Docker is running and ports are not in use.
- **Other issues?** See [README-Project.md](./README-Project.md) for more details or open an issue.
