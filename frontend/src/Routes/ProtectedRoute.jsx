import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated,user, loading } = useSelector((state) => state.auth);

    // Agar authentication check ho raha hai toh loading dikhao
    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Agar role allowed list mein nahi hai, toh home bhej do
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }
    // Agar login hai toh child components dikhao (Outlet), nahi toh login par bhej do isko hamne upper handle kr liya hai ....
    return <Outlet /> ;
};

export default ProtectedRoute;