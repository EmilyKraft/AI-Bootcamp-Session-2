# Coding Guidelines for TODO App

## General Formatting Rules
- Use consistent indentation (2 spaces for JavaScript/React).
- Prefer single quotes for strings, except when double quotes are required.
- Limit line length to 80-100 characters for readability.
- Add spaces around operators and after commas.
- Use trailing commas in multi-line objects and arrays.
- Always include semicolons at the end of statements.

## Import Organization
- Group imports by type: external libraries first, then internal modules, then styles.
- Use absolute imports for top-level modules when possible.
- Remove unused imports and variables.
- Sort imports alphabetically within each group.

## Linter Usage
- Use ESLint for JavaScript/React code and Prettier for formatting.
- Fix all linter and formatter warnings before committing code.
- Configure linter rules in the project to enforce style and catch errors early.

## Best Practices
- Follow the DRY (Don't Repeat Yourself) principle: avoid duplicating code and logic.
- Use clear, descriptive names for variables, functions, and components.
- Write small, focused functions and components.
- Prefer pure functions and stateless components when possible.
- Document complex logic with comments and JSDoc where appropriate.
- Avoid magic numbers and hardcoded values; use constants or configuration.
- Handle errors gracefully and provide user feedback.
- Write tests for all new code and refactorings.

---
These guidelines help maintain code quality, consistency, and readability throughout the project.
