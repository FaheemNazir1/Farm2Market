# Automated Test Suite

Automated CLI test scripts for validating backend authentication, role preservation, and GPS calculations.

## Test Scripts

- `test-4-features.js`: Validates i18n locales (`en`, `hi`, `mr`), Haversine distance calculations, and live `GET /api/crops` near-me endpoint.
- `test-role-controller-logic.js`: Unit tests for Google role selection, new registrations, and database role preservation.
- `test-google-role-auth.js`: Integration tests for `/api/auth/google`, `/api/auth/login`, and `/api/auth/me`.
- `test-google-auth.js`: Integration test for token validation.

## How to Run

```bash
# Run 4-feature test suite
node tests/automated/test-4-features.js

# Run role selection unit tests
node tests/automated/test-role-controller-logic.js

# Run server integration tests (requires dev server running)
node tests/automated/test-google-role-auth.js
```
