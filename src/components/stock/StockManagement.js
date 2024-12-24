// src/components/stock/StockManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper, 
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const isAdmin = user?.role === 0;

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSell = async (product) => {
    try {
      const response = await productService.sellProduct(product.id, sellQuantity);
      if (response.success) {
        showNotification('Sale completed successfully');
        if (response.data?.notification) {
          showNotification(response.data.notification, 'warning');
        }
        fetchProducts();
        setOpenDialog(false);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const response = await productService.addProduct(productData);
      if (response.success) {
        showNotification('Product added successfully');
        fetchProducts();
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="p-6">
      <Paper className="p-4">
        {isAdmin && (
          <div className="mb-6">
            <AddProductForm onAdd={handleAddProduct} />
          </div>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>
                  {!isAdmin && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedProduct(product);
                        setOpenDialog(true);
                      }}
                    >
                      Sell
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Sell Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={sellQuantity}
            onChange={(e) => setSellQuantity(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => handleSell(selectedProduct)} color="primary">
            Confirm Sale
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const AddProductForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', quantity: '', price: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="Price"
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        fullWidth
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Add Product
      </Button>
    </form>
  );
};