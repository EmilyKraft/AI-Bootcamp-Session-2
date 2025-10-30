import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import './App.css';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch all TODO items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setItems(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new TODO item
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const result = await response.json();
      setItems([...items, result]);
      setNewItem('');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  // Start editing a TODO item
  const handleEdit = (item) => {
    setEditId(item.id);
    setEditText(item.name);
  };

  // Save edited TODO item
  const handleEditSave = async (itemId) => {
    if (!editText.trim()) return;
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editText }),
      });
      if (!response.ok) throw new Error('Failed to edit item');
      const updated = await response.json();
      setItems(items.map(item => item.id === itemId ? updated : item));
      setEditId(null);
      setEditText('');
      setError(null);
    } catch (err) {
      setError('Error editing item: ' + err.message);
    }
  };

  // Toggle completed status for a TODO item
  const handleComplete = async (itemId, completed) => {
    try {
      const response = await fetch(`/api/items/${itemId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      const updated = await response.json();
      setItems(items.map(item => item.id === itemId ? updated : item));
      setError(null);
    } catch (err) {
      setError('Error updating item: ' + err.message);
    }
  };

  // Clear all completed TODO items
  const handleClearCompleted = async () => {
    try {
      const response = await fetch('/api/items/clear-completed', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to clear completed items');
      await fetchItems();
      setError(null);
    } catch (err) {
      setError('Error clearing completed items: ' + err.message);
    }
  };

  // Delete a TODO item
  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setItems(items.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  // Filter TODO items by status
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" tabIndex={0}>
          To Do App
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" tabIndex={0}>
          Keep track of your tasks
        </Typography>
      </Paper>

      <Box component="section" sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom tabIndex={0}>
          Add New Item
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
          aria-label="Add new todo item form"
        >
          <TextField
            label="Item Name"
            variant="outlined"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter item name"
            fullWidth
            inputProps={{ 'aria-label': 'Enter item name' }}
            autoFocus
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ minWidth: 120, bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#1565c0' } }}
            aria-label="Add Item"
            disabled={loading}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      <Box component="section" aria-label="Todo items list">
        <Typography variant="h6" component="h2" gutterBottom tabIndex={0}>
          Items from Database
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')} aria-label="Show all items">All</Button>
          <Button variant={filter === 'active' ? 'contained' : 'outlined'} onClick={() => setFilter('active')} aria-label="Show active items">Active</Button>
          <Button variant={filter === 'completed' ? 'contained' : 'outlined'} onClick={() => setFilter('completed')} aria-label="Show completed items">Completed</Button>
          <Button startIcon={<ClearAllIcon />} color="secondary" onClick={handleClearCompleted} aria-label="Clear completed items">Clear Completed</Button>
        </Box>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress aria-label="Loading data" /></Box>}
        {error && <Alert severity="error" sx={{ mt: 2 }} role="alert">{error}</Alert>}
        {!loading && !error && (
          <List sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => handleEdit(item)}
                        color="primary"
                        tabIndex={0}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label={item.completed ? `Mark ${item.name} as active` : `Mark ${item.name} as completed`}
                        onClick={() => handleComplete(item.id, item.completed)}
                        color={item.completed ? 'success' : 'default'}
                        tabIndex={0}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => handleDelete(item.id)}
                        color="error"
                        tabIndex={0}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                  divider
                  sx={{
                    bgcolor: item.completed ? '#e0e0e0' : idx % 2 === 0 ? '#e3f2fd' : '#f5f5f5',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    '&:focus': { outline: '2px solid #1976d2' },
                  }}
                  tabIndex={0}
                >
                  {editId === item.id ? (
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                      <TextField
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        size="small"
                        fullWidth
                        aria-label="Edit item text"
                      />
                      <Button onClick={() => handleEditSave(item.id)} variant="contained" color="primary" size="small" aria-label="Save edit">Save</Button>
                      <Button onClick={() => { setEditId(null); setEditText(''); }} variant="outlined" color="secondary" size="small" aria-label="Cancel edit">Cancel</Button>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={item.name}
                      sx={{ color: item.completed ? '#757575' : '#212121' }}
                    />
                  )}
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No items found. Add some!
              </Typography>
            )}
          </List>
        )}
      </Box>
    </Container>
  );
}

export default App;