# Copilot Instructions for [Patient Journey App]

## 🚀 Project Overview

This project is a modern, multi-step patient registration and management web application built with React for the web and React Native for mobile (iOS and Android). The goal is to provide a seamless user experience across platforms.

## 💻 Tech Stack

* **Core:** React, React Native
* **State Management:** [Redux, Zustand, Context API]
* **Navigation:** [React Navigation (for mobile), React Router (for web)]
* **UI Library (Optional):** [Bootstrap, Ant Design, NativeBase, Tailwind CSS (with platform-specific adaptations)]
* **API Interaction:** [Axios, Fetch API, GraphQL (Apollo Client/Relay)]
* **Backend (if relevant):** [Java Spring Boot]
* **Testing:** [Jest, React Testing Library, Detox (for E2E mobile)]
* **Linting/Formatting:** ESLint, Prettier

## ✍️ Coding Style & Conventions

* **Language:** JavaScript (ES6+)
* **Component Structure:**
    * Prefer functional components with Hooks.
    * Keep components small and focused on a single responsibility.
    * Organize files by feature or component type (e.g., `src/components/`, `src/screens/`, `src/features/`).
* **Naming Conventions:**
    * Components: `PascalCase` (e.g., `UserProfile.js`, `SettingsScreen.tsx`)
    * Variables/Functions: `camelCase` (e.g., `WorkspaceUserData`, `isLoading`)
    * Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
* **Styling:**
    * **Web:** [ Styled Components, CSS Modules, Tailwind CSS]
    * **Mobile (React Native):** StyleSheet API, [mention any specific styling libraries like Styled Components for React Native].
    * Aim for consistent styling across platforms, but adapt for platform-specific UI/UX best practices.
* **State Management:**
    * "Use Redux for global state, useState for local component state."
* **API Calls:**
    * Centralize API call logic in services or hooks (e.g., `src/services/api.js` or `src/hooks/useApi.js`).
    * Handle loading states and errors gracefully.
* **Error Handling:**
    * Implement comprehensive error handling for API requests and user interactions.
    * Use try-catch blocks for asynchronous operations.
* **Comments:**
    * Write clear and concise comments for complex logic or non-obvious code.
    * Use JSDoc for function and component prop descriptions if using JavaScript

## 📱 Platform-Specific Considerations

* **Directory Structure for Platform-Specific Code:**
    * Use `.web.js` / `.web.tsx` for web-specific components/logic.
    * Use `.native.js` / `.native.tsx` for mobile-specific (iOS & Android) components/logic.
    * Use `.ios.js` / `.ios.tsx` for iOS-specific components/logic.
    * Use `.android.js` / `.android.tsx` for Android-specific components/logic.
    * Shared components/logic should have no platform extension (e.g., `Button.js`).
* **UI/UX:**
    * While aiming for a consistent brand feel, respect platform conventions (e.g., navigation patterns, touch gestures).
    * Test thoroughly on different screen sizes and devices.
* **Permissions (Mobile):**
    * Handle permissions (e.g., camera, location) explicitly using React Native APIs.
* **Offline Support (Optional):**
    * [If applicable, mention strategies for offline data storage and synchronization.]

## ✅ Testing Guidelines

* **Unit Tests:** Write unit tests for individual functions, components, and hooks using [Jest, React Testing Library].
* **Integration Tests:** Test interactions between components.
* **End-to-End (E2E) Tests (Mobile):** Use [Detox] for automated E2E testing on mobile simulators/devices.
* **Aim for high test coverage.**

## 🧑‍🤝‍🧑 Collaboration & Git Workflow

* **Branching:** [e.g., Gitflow, feature branches from `develop`/`main`]
* **Commits:** Write clear and descriptive commit messages.
* **Pull Requests:** All code changes should go through Pull Requests with at least one reviewer.
* **Code Reviews:** Focus on constructive feedback regarding code quality, adherence to conventions, and functionality.
* **Documentation:** Update documentation (README, comments) as part of the PR process.


## ❌ Things to Avoid

* Avoid large, monolithic components.
* Avoid direct DOM manipulation in React (use refs sparingly and correctly).
* Avoid writing platform-agnostic code that leads to a poor user experience on one or more platforms. If necessary, create separate implementations.
* Don't commit sensitive information (API keys, secrets) directly into the repository. Use environment variables.

---
