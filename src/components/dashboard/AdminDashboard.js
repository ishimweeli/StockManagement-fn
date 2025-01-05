import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/Api';
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  ChevronLeft,
  ChevronRight,
  Logout,
  Person,
  Edit,
  Delete,
  Add,
  Warning,
  Info
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [viewedNotifications, setViewedNotifications] = useState(new Set());
  const [newItem, setNewItem] = useState({ name: '', quantity: '', price: '' });
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  // Menu states
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const itemsPerPage = 7;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = items.slice(startIndex, startIndex + itemsPerPage);
  const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
  const storedUsername = localStorage.getItem("username");


  const validateForm = (item) => {
    const errors = {};
    if (!item.name || item.name.trim() === '') {
      errors.name = 'Name is required';
    }
    if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) < 0) {
      errors.quantity = 'Valid quantity is required';
    }
    if (!item.price || isNaN(item.price) || Number(item.price) < 0) {
      errors.price = 'Valid price is required';
    }
    return errors;
  };

  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const newNotifications = data.data;
        setNotifications(newNotifications);
        
        const now = new Date();
        const newUnreadCount = newNotifications.filter(notification => {
          const notifDate = new Date(notification.created_at);
          const timeDiff = (now - notifDate) / 1000 / 60;
          return timeDiff < 1 && !viewedNotifications.has(notification.id);
        }).length;
        
        setUnreadNotifications(newUnreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setAlert({
        open: true,
        message: 'Failed to fetch notifications',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    loadItems();
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.getItems(token);
      if (response.success) {
        setItems(response.data);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
      setAlert({
        open: true,
        message: 'Failed to load items',
        severity: 'error'
      });
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const errors = validateForm(newItem);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await api.addItem(newItem, token);
      if (response.success) {
        setNewItem({ name: '', quantity: '', price: '' });
        setFormErrors({});
        loadItems();
        setOpenDialog(false);
        fetchNotifications();
        setAlert({
          open: true,
          message: 'Item added successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to add item:', err);
      setAlert({
        open: true,
        message: 'Failed to add item',
        severity: 'error'
      });
    }
  };

  const handleEditItem = async (item) => {
    setEditItem(item);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleUpdateItem = async () => {
    const errors = validateForm(editItem);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editItem.name,
          quantity: Number(editItem.quantity),
          price: Number(editItem.price)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const data = await response.json();
      
      if (data.success) {
        loadItems();
        setOpenDialog(false);
        setEditItem(null);
        setFormErrors({});
        fetchNotifications();
        setAlert({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to update item');
      }
    } catch (err) {
      console.error('Failed to update item:', err);
      setAlert({
        open: true,
        message: err.message || 'Failed to update item',
        severity: 'error'
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadItems();
        setDeleteConfirmation(null);
        fetchNotifications();
        setAlert({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      setAlert({
        open: true,
        message: err.message || 'Failed to delete item',
        severity: 'error'
      });
    }
  };

  const formatNotificationTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'low stock':
        return <Warning color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    const newViewedNotifications = new Set(viewedNotifications);
    notifications.forEach(notification => {
      newViewedNotifications.add(notification.id);
    });
    setViewedNotifications(newViewedNotifications);
    setUnreadNotifications(0);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    logout();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>

          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <h3>{storedUsername}</h3>
          <IconButton
            color="inherit"
            onClick={handleProfileClick}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
          >
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>

          <Popover
            open={Boolean(notificationAnchorEl)}
            anchorEl={notificationAnchorEl}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                Notifications
              </Typography>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Box key={notification.id} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getNotificationIcon(notification.type)}
                      <Typography variant="subtitle2" color="primary">
                        {notification.type}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatNotificationTime(notification.created_at)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ p: 2 }} color="text.secondary">
                  No notifications
                </Typography>
              )}
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Stock Items</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => {
                  setEditItem(null);
                  setFormErrors({});
                  setOpenDialog(true);
                }}
              >
                Add New Item
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteConfirmation(item)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
                <IconButton
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft />
                </IconButton>
                <Typography>
                  Page {currentPage} of {totalPages}
                </Typography>
                <IconButton
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Item Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditItem(null);
          setFormErrors({});
        }}
      >
       <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Item Name"
              margin="dense"
              value={editItem ? editItem.name : newItem.name}
              onChange={(e) => editItem 
                ? setEditItem({ ...editItem, name: e.target.value })
                : setNewItem({ ...newItem, name: e.target.value })
              }
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              margin="dense"
              value={editItem ? editItem.quantity : newItem.quantity}
              onChange={(e) => editItem
                ? setEditItem({ ...editItem, quantity: e.target.value })
                : setNewItem({ ...newItem, quantity: e.target.value })
              }
              error={Boolean(formErrors.quantity)}
              helperText={formErrors.quantity}
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              margin="dense"
              value={editItem ? editItem.price : newItem.price}
              onChange={(e) => editItem
                ? setEditItem({ ...editItem, price: e.target.value })
                : setNewItem({ ...newItem, price: e.target.value })
              }
              error={Boolean(formErrors.price)}
              helperText={formErrors.price}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditItem(null);
            setFormErrors({});
          }}>
            Cancel
          </Button>
          <Button
            onClick={editItem ? handleUpdateItem : handleAddItem}
            variant="contained"
            color="primary"
          >
            {editItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmation)}
        onClose={() => setDeleteConfirmation(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirmation?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteItem(deleteConfirmation.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;