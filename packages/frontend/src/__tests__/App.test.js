import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Test Item 1', created_at: '2023-01-01T00:00:00.000Z', completed: false },
        { id: 2, name: 'Test Item 2', created_at: '2023-01-02T00:00:00.000Z', completed: false },
      ])
    );
  }),
  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    return res(
      ctx.status(201),
      ctx.json({
        id: Math.floor(Math.random() * 1000) + 3,
        name,
        created_at: new Date().toISOString(),
        completed: false,
      })
    );
  }),
  // PUT /api/items/:id/complete handler
  rest.put('/api/items/:id/complete', (req, res, ctx) => {
    const { id } = req.params;
    const { completed } = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name: `Test Item ${id}`,
        created_at: new Date().toISOString(),
        completed,
      })
    );
  }),
  // PUT /api/items/:id handler (edit)
  rest.put('/api/items/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { name } = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name,
        created_at: new Date().toISOString(),
        completed: false,
      })
    );
  }),
  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  // POST /api/items/clear-completed handler
  rest.post('/api/items/clear-completed', (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('edits an item', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    // Click edit icon
    await act(async () => {
      await user.click(screen.getByLabelText('Edit Test Item 1'));
    });
    // Change text and save
    const editInput = screen.getByLabelText('Edit item text');
    await act(async () => {
      await user.type(editInput, '{selectall}Edited Item');
      await user.click(screen.getByLabelText('Save edit'));
      // Override GET to return the edited item
      server.use(
        rest.get('/api/items', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json([
              { id: 1, name: 'Edited Item', created_at: '2023-01-01T00:00:00.000Z', completed: false },
              { id: 2, name: 'Test Item 2', created_at: '2023-01-02T00:00:00.000Z', completed: false },
            ])
          );
        })
      );
    });
    await waitFor(() => {
      expect(screen.queryByLabelText('Edit item text')).not.toBeInTheDocument();
    });
  });

  test('marks item as completed and active', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    // Mark as completed
    await act(async () => {
      await user.click(screen.getByLabelText('Mark Test Item 1 as completed'));
    });
    // Mark as active
    await act(async () => {
      await user.click(screen.getByLabelText('Mark Test Item 1 as active'));
    });
    // Should still be in the list
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
  });

  test('deletes an item', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    await act(async () => {
      await user.click(screen.getByLabelText('Delete Test Item 1'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });
  });

  test('clears completed items', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    // Mark as completed
    await act(async () => {
      await user.click(screen.getByLabelText('Mark Test Item 1 as completed'));
    });
    // Override GET to return only active items after clearing completed
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            { id: 2, name: 'Test Item 2', created_at: '2023-01-02T00:00:00.000Z', completed: false },
          ])
        );
      })
    );
    // Clear completed
    await act(async () => {
      await user.click(screen.getByLabelText('Clear completed items'));
    });
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('filters items by status', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
    // Mark first item as completed
    await act(async () => {
      await user.click(screen.getByLabelText('Mark Test Item 1 as completed'));
    });
    // Filter: active
    await act(async () => {
      await user.click(screen.getByLabelText('Show active items'));
    });
    expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    // Filter: completed
    await act(async () => {
      await user.click(screen.getByLabelText('Show completed items'));
    });
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    // Filter: all
    await act(async () => {
      await user.click(screen.getByLabelText('Show all items'));
    });
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });
    
  // Initially shows loading state
  expect(screen.getByLabelText('Loading data')).toBeInTheDocument();
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('adds a new item', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const input = screen.getByPlaceholderText('Enter item name');
    await act(async () => {
      await user.type(input, 'New Test Item');
    });
    
    const submitButton = screen.getByText('Add Item');
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new item appears
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });
});