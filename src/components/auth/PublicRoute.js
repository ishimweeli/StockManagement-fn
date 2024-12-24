
import { Navigate,useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
  
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
  
    if (user) {
      return <Navigate to={user.role === 0 ? '/admin' : '/stock-officer'} state={{ from: location }} replace />;
    }
  
    return children;
  };
  
  export default PublicRoute;