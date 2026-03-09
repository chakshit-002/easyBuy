import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);

    // Agar authentication check ho raha hai toh loading dikhao
    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    // Agar login hai toh child components dikhao (Outlet), nahi toh login par bhej do
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;