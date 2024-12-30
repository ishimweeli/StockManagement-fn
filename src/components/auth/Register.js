import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Box,
  Typography,
  Container,
  Paper
} from '@mui/material';
import { api } from '../../services/Api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '1'
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    general: ''
  });
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      general: ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ username: '', email: '', password: '', general: '' });
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.register(formData);
      if (response.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrors({
          ...errors,
          general: response.error.message || 'Registration failed. Please try again.'
        });
      }
    } catch (err) {
      setErrors({
        ...errors,
        general: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #bbdefb, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ padding: 4, borderRadius: 2 }}>
          {/* Logo/Brand Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <svg 
                style={{ width: 40, height: 40, color: 'white' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join Stock Management System
            </Typography>
          </Box>

          {/* Alert Messages */}
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                required
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isLoading}
                error={!!errors.username}
                helperText={errors.username}
                placeholder="Choose a username"
              />

              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="Enter your email"
              />

              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Create a password"
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={isLoading}
                >
                  <MenuItem value="1">Stock Officer</MenuItem>
                  <MenuItem value="0">Admin</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
                size="large"
                sx={{ mt: 2 }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Creating Account...
                  </Box>
                ) : (
                  'Create Account'
                )}
              </Button>
            </Box>
          </form>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 500 
                }}
              >
                Sign in instead
              </Link>
            </Typography>
          </Box>

          {/* Additional Info */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;