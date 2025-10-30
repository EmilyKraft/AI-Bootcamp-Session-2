# Complex Logic and Utilities

## Frontend
### Edit Flow
- The edit feature uses local state to toggle between view and edit modes for each TODO item.
- On save, the updated text is sent to the backend and the UI updates accordingly.
- Tests assert the disappearance of the edit input to confirm the flow.

### Filtering
- Filtering is handled in the frontend state, with buttons to select 'All', 'Active', or 'Completed'.
- The UI updates to show only matching items.

### Clear Completed
- The 'Clear Completed' button triggers a backend call to delete all completed items.
- The UI updates to remove completed items from the list.

## Backend
### Persistence
- SQLite is used for persistent storage of TODO items.
- All CRUD operations are exposed via REST API endpoints.

### Error Handling
- API returns appropriate error codes and messages for invalid requests.
- Frontend displays error feedback to users.

## Testing
### MSW Mocking
- MSW handlers mock all backend endpoints for reliable frontend tests.
- Tests cover all user flows and edge cases.

---
See code comments and test files for further details.