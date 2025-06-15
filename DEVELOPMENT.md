# Development Guidelines for Patient Journey App

## 🚀 Project Overview

This project is a modern, multi-step patient registration and management web application built with React for the web and React Native for mobile (iOS and Android). The goal is to provide a seamless user experience across platforms.

## 💻 Tech Stack

- **Core:** React 19.x (Web), React Native (Mobile - planned)
- **State Management:** React Context API (primary), useState for local component state
- **Navigation:** React Router 7.x (Web), React Navigation (Mobile - planned)
- **UI Library:** Bootstrap 5.x, React Native components (for mobile)
- **API Interaction:** Axios for RESTful API calls
- **Backend:** Java Spring Boot RESTful API
- **Testing:** Jest, React Testing Library
- **Linting/Formatting:** ESLint, Prettier

## ✍️ Coding Style & Conventions

### Language & Structure
- **Language:** JavaScript (ES6+)
- **Component Structure:**
  - Prefer functional components with Hooks
  - Keep components small and focused on a single responsibility
  - Organize files by feature or component type (e.g., `src/components/`, `src/screens/`, `src/features/`)

### Naming Conventions
- **Components:** `PascalCase` (e.g., `UserProfile.js`, `SettingsScreen.tsx`)
- **Variables/Functions:** `camelCase` (e.g., `WorkspaceUserData`, `isLoading`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Styling
- **Web:** Standard CSS with component-specific CSS files
- **Mobile (React Native):** React Native StyleSheet API with platform-specific styling where needed
- Maintain consistent styling across platforms while respecting platform-specific UX conventions

### State Management
- Use React Context API for global state (auth, user data)
- Use useState hook for local component state
- Avoid prop drilling by leveraging Context where appropriate

### API Calls
- Centralize API call logic in services or hooks (e.g., `src/services/api.js` or `src/hooks/useApi.js`)
- Handle loading states and errors gracefully

### Error Handling
- Implement comprehensive error handling for API requests and user interactions
- Use try-catch blocks for asynchronous operations

### Comments
- Write clear and concise comments for complex logic or non-obvious code
- Use JSDoc for function and component prop descriptions if using JavaScript

## 📱 Platform-Specific Considerations

### Directory Structure for Platform-Specific Code
- Use `.web.js` / `.web.tsx` for web-specific components/logic
- Use `.native.js` / `.native.tsx` for mobile-specific (iOS & Android) components/logic
- Use `.ios.js` / `.ios.tsx` for iOS-specific components/logic
- Use `.android.js` / `.android.tsx` for Android-specific components/logic
- Shared components/logic should have no platform extension (e.g., `Button.js`)

### UI/UX
- While aiming for a consistent brand feel, respect platform conventions (e.g., navigation patterns, touch gestures)
- Test thoroughly on different screen sizes and devices

### Mobile-Specific Features
- **Permissions:** Handle permissions (e.g., camera, location) explicitly using React Native APIs
- **Offline Support:**
  - Implement local storage strategies for patient data
  - Queue API requests when offline and sync when connection is restored
  - Provide clear visual indicators of offline status
  - Prioritize critical functionality that should work offline

## ✅ Testing Guidelines

### Test Types
- **Unit Tests:** Write unit tests for individual functions, components, and hooks using Jest, React Testing Library
- **Integration Tests:** Test interactions between components and workflow processes
- **End-to-End (E2E) Tests (Mobile):** Use Detox for automated E2E testing on mobile simulators/devices

### Test Coverage & Organization
- Aim for 80%+ coverage on critical paths and business logic
- Co-locate test files with implementation files (e.g., `Component.js` and `Component.test.js`)
- Group tests using `describe` blocks for logical organization
- Use meaningful test descriptions that document the expected behavior

## 🧑‍🤝‍🧑 Collaboration & Git Workflow

### Branching Strategy
- Feature branches from `main`, using GitHub Flow
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
- Avoid writing platform-agnostic code that leads to a poor user experience on one or more platforms. If necessary, create separate implementations
- Don't commit sensitive information (API keys, secrets) directly into the repository. Use environment variables

---

For more information about the project setup and features, please refer to the [README.md](./README.md) and [README-Project.md](./README-Project.md) files. 