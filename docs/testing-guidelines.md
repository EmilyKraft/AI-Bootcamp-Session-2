# Testing Guidelines for TODO App

## Principles

1. All code must be covered by automated tests.
2. The app should include:
   - Unit tests for individual functions, components, and modules
   - Integration tests for interactions between frontend and backend
   - End-to-end (E2E) tests for user flows and critical paths
3. Every new feature or bug fix must include appropriate tests before merging.
4. Tests should be easy to read, maintain, and update as the codebase evolves.
5. Use descriptive test names and clear assertions.
6. Mock external dependencies and APIs where possible to ensure test reliability.
7. Run all tests automatically in CI/CD pipelines before deployment.
8. Test coverage should be monitored and improved over time.
9. Avoid duplicating tests; prefer reusable test utilities and fixtures.
10. Document any complex test setups or custom utilities.
