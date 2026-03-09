import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useAuthCheck = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const executeAction = (actionCallback) => {
        if (isAuthenticated) {
            actionCallback(); // Agar login hai toh kaam hone do
        } else {
            // Agar login nahi hai, toh login page bhej do
            // Hum yahan current location save kar sakte hain taaki login ke baad wapas yahin aaye
            navigate('/login');
        }
    };

    return executeAction;
};

export default useAuthCheck;