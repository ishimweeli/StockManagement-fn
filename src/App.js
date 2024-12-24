import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/dashboard/AdminDashboard';
import StockOfficerDashboard from './components/dashboard/StockOfficerDashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/common/Navbar';
import PublicRoute from './components/auth/PublicRoute';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route
              path="/admin/*"
              element={
                <PrivateRoute roleRequired={0}>
                  <>
                    {/* <Navbar /> */}
                    <AdminDashboard />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/stock-officer/*"
              element={
                <PrivateRoute roleRequired={1}>
                  <>
                    {/* <Navbar /> */}
                    <StockOfficerDashboard />
                  </>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;