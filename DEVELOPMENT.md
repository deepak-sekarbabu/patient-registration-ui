# Development Guidelines for Patient Journey App

## 🚀 Project Overview

This project is a modern, multi-step patient registration and management web application built with React for the web. The goal is to provide a seamless user experience for patient onboarding and management. Mobile (React Native) is planned for the future but not present in this repository.

## 💻 Tech Stack

- **Core:** React 18.x (Web)
- **State Management:** React Context API (primary), useState for local component state
- **Navigation:** React Router DOM 6.x (Web)
- **UI Library:** Bootstrap 5.x, React Bootstrap, Lucide React, React Icons
- **API Interaction:** Axios for RESTful API calls
- **Testing:** Jest, React Testing Library
- **Linting/Formatting:** ESLint, Prettier

## ✍️ Coding Style & Conventions

### Language & Structure

- **Language:** JavaScript (ES6+)
- **Component Structure:**
  - Prefer functional components with Hooks
  - Keep components small and focused on a single responsibility
  - Organize files by feature or component type (e.g., `src/components/`, `src/services/`, `src/context/`)

### Naming Conventions

- **Components:** `PascalCase` (e.g., `UserProfile.js`)
- **Variables/Functions:** `camelCase` (e.g., `isLoading`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Styling

- **Web:** Standard CSS with component-specific CSS files in `src/styles/components/`
- Maintain consistent styling across the app using the structure in `src/styles/`

### State Management

- Use React Context API for global state (auth, user data)
- Use useState hook for local component state
- Avoid prop drilling by leveraging Context where appropriate

### API Calls

- Centralize API call logic in `src/services/`
- Handle loading states and errors gracefully

### Error Handling

- Implement comprehensive error handling for API requests and user interactions
- Use try-catch blocks for asynchronous operations

### Comments

- Write clear and concise comments for complex logic or non-obvious code
- Use JSDoc for function and component prop descriptions if using JavaScript

## ✅ Testing Guidelines

### Test Types

- **Unit Tests:** Write unit tests for individual functions, components, and hooks using Jest, React Testing Library
- **Integration Tests:** Test interactions between components and workflow processes

### Test Coverage & Organization

- Aim for 80%+ coverage on critical paths and business logic
- Co-locate test files with implementation files (e.g., `Component.js` and `Component.test.js`)
- Group tests using `describe` blocks for logical organization
- Use meaningful test descriptions that document the expected behavior

## 🧑‍🤝‍🧑 Collaboration & Git Workflow

### Branching Strategy

- Feature branches from `master`, using GitHub Flow
- Branch naming convention: `feature/feature-name` or `bugfix/issue-description`

### Commits

- Write clear and descriptive commit messages
- Start with a verb in present tense (e.g., "Add patient registration form")
- Reference issue numbers when applicable (e.g., "Fix form validation #42")

### Pull Requests

- All code changes must go through Pull Requests with at least one reviewer
- Include screenshots for UI changes
- Provide testing instructions

### Code Reviews

- Focus on constructive feedback regarding code quality and adherence to conventions
- Use GitHub's suggestion feature for small changes

### Documentation

- Update documentation (README, JSDoc comments) as part of the PR process
- Keep development guidelines updated with any new conventions or patterns

## ❌ Things to Avoid

- Avoid large, monolithic components
- Avoid direct DOM manipulation in React (use refs sparingly and correctly)
- Don't commit sensitive information (API keys, secrets) directly into the repository. Use environment variables

---

For more information about the project setup and features, please refer to the [README.md](./README.md) and [README-Project.md](./README-Project.md) files.
