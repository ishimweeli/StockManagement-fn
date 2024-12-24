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
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  ChevronLeft,
  ChevronRight,
  Logout,
  Person,
  ShoppingCart,
  Warning,
  Info
} from '@mui/icons-material';

const StockOfficerDashboard = () => {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [viewedNotifications, setViewedNotifications] = useState(new Set());
  const [sellForm, setSellForm] = useState({ itemId: '', quantity: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  
  // Menu states
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const itemsPerPage = 7;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = items.slice(startIndex, startIndex + itemsPerPage);

  // Fetch notifications
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

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
        
        // Check for new notifications (less than 1 minute ago)
        const now = new Date();
        const newUnreadCount = newNotifications.filter(notification => {
          const notifDate = new Date(notification.created_at);
          const timeDiff = (now - notifDate) / 1000 / 60; // difference in minutes
          return timeDiff < 1 && !viewedNotifications.has(notification.id);
        }).length;
        
        setUnreadNotifications(newUnreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    loadItems();
    fetchNotifications();
    
    // Set up polling for notifications every 30 seconds
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
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    try {
      const response = await api.sellItem(sellForm.itemId, sellForm.quantity, token);
      if (response.success) {
        setSellForm({ itemId: '', quantity: '' });
        setSellDialogOpen(false);
        loadItems();
        fetchNotifications(); // Fetch notifications after selling
      }
    } catch (err) {
      console.error('Failed to sell item:', err);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    
    // Mark all current notifications as viewed
    const newViewedNotifications = new Set(viewedNotifications);
    notifications.forEach(notification => {
      newViewedNotifications.add(notification.id);
    });
    setViewedNotifications(newViewedNotifications);
    setUnreadNotifications(0);
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
            Stock Officer Dashboard
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
            <Box sx={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                Notifications
              </Typography>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
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
              <Typography variant="h6">Available Stock</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCart />}
                onClick={() => setSellDialogOpen(true)}
              >
                Sell Item
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price}</TableCell>
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

      <Dialog 
        open={sellDialogOpen} 
        onClose={() => setSellDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sell Item</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSell} sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="item-select-label">Select Item</InputLabel>
              <Select
                labelId="item-select-label"
                value={sellForm.itemId}
                label="Select Item"
                onChange={(e) => setSellForm({ ...sellForm, itemId: e.target.value })}
              >
                <MenuItem value="">
                  <em>Select an item</em>
                </MenuItem>
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} (Available: {item.quantity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Quantity"
              value={sellForm.quantity}
              onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSell}
            variant="contained" 
            color="primary"
          >
            Sell
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockOfficerDashboard;