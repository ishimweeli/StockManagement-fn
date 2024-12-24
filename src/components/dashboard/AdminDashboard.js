import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/Api';
import {
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
  Add
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', price: '' });
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Menu states
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const itemsPerPage = 7;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = items.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    loadItems();
    setUnreadNotifications(2); // Simulate initial notifications
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.getItems(token);
      if (response.success) {
        setItems(response.data);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.addItem(newItem, token);
      if (response.success) {
        setNewItem({ name: '', quantity: '', price: '' });
        loadItems();
        setOpenDialog(false);
        setNotifications([...notifications, 'Item added successfully']);
        setUnreadNotifications(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleEditItem = async (item) => {
    setEditItem(item);
    setOpenDialog(true);
  };

  const handleUpdateItem = async () => {
    try {
      const response = await api.updateItem(editItem.id, editItem, token);
      if (response.success) {
        loadItems();
        setOpenDialog(false);
        setEditItem(null);
        setNotifications([...notifications, 'Item updated successfully']);
        setUnreadNotifications(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await api.deleteItem(id, token);
      if (response.success) {
        loadItems();
        setDeleteConfirmation(null);
        setNotifications([...notifications, 'Item deleted successfully']);
        setUnreadNotifications(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    if (unreadNotifications > 0) {
      setUnreadNotifications(0);
    }
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
            <MenuItem onClick={handleProfileClose}>
              <Person sx={{ mr: 1 }} /> Profile
            </MenuItem>
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
            <Box sx={{ width: 300, p: 2 }}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <Typography key={index} sx={{ p: 1 }}>
                    {notification}
                  </Typography>
                ))
              ) : (
                <Typography color="text.secondary">No notifications</Typography>
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
                onClick={() => setOpenDialog(true)}
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
                      <TableCell>${item.price}</TableCell>
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
      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setEditItem(null);
      }}>
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditItem(null);
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
    </Box>
  );
};

export default AdminDashboard;