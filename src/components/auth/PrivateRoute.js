import { Navigate,useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, roleRequired }) => {
    const { user, token, isLoading } = useAuth();
    const location = useLocation();
  
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
  
    if (!token || !user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  
    if (user.role !== roleRequired) {
      return <Navigate to={user.role === 0 ? '/admin' : '/stock-officer'} replace />;
    }
  
    return children;
  };
export default PrivateRoute;