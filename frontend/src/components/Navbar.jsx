import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, BotMessageSquare, LogOut, UserCircle, Menu, X, ChevronDown } from 'lucide-react'; // Lucide Icons
import { logoutUser } from '../features/auth/authSlice'; // Maan raha hoon logout action ready hai
import LogoutModal from './modals/LogoutModal.jsx'
const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); // Desktop Profile dropdown
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setShowLogoutModal(true); // Direct logout ki jagah modal dikhao
        setIsProfileOpen(false); // Dropdown band kar do
        setIsMobileMenuOpen(false); // Mobile menu band kar do
    };

    const confirmLogout = () => {
        dispatch(logoutUser());
        setShowLogoutModal(false);
        navigate('/login');
    };

    // NavLink CSS class logic (Active/Inactive)
    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
        }`;

    const navItems = [
        { name: 'Home', path: '/', icon: LayoutDashboard },
        { name: 'Products', path: '/products', icon: ShoppingBag },
        { name: 'AI Buddy', path: '/ai-buddy', icon: BotMessageSquare },
        { name: 'Cart', path: '/cart', icon: LayoutDashboard }, // Placeholder icon
        { name: 'Orders', path: '/orders', icon: LayoutDashboard }, // Placeholder icon
    ];

    return (
        <>
            <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

                    {/* LOGO */}
                    <div className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-blue-600">e</span>Store
                    </div>

                    {/* DESKTOP NAV ITEMS */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navItems.map((item) => (
                            <NavLink key={item.path} to={item.path} className={navLinkClass}>
                                <item.icon className="h-4.5 w-4.5" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* DESKTOP PROFILE/AUTH SECTION */}
                    <div className="hidden lg:flex items-center gap-4 relative">
                        {isAuthenticated && user ? (
                            <>
                                {/* Profile Dropdown Trigger */}
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 border border-gray-100"
                                >
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 uppercase">
                                        {user?.username?.[0] || 'U'}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {user?.username || 'User'}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute top-12 right-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 animate-in fade-in duration-200">
                                        <NavLink to="/profile" className={navLinkClass} onClick={() => setIsProfileOpen(false)}>
                                            <UserCircle className="h-4.5 w-4.5" /> Profile Settings
                                        </NavLink>
                                        <button onClick={handleLogoutClick} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                                            <LogOut className="h-4.5 w-4.5" /> Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-700 hover:text-blue-700">Login</button>
                                <button onClick={() => navigate('/register')} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm">Register</button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE MENU TOGGLE (Burger) */}
                    <button className="lg:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* MOBILE SLIDER MENU */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-100 animate-in fade-in duration-300">
                        {/* Overlay (Click to close) */}
                        <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setIsMobileMenuOpen(false)}></div>

                        {/* Menu Panel */}
                        <div className="absolute top-0 right-0 w-[80%] max-w-sm h-full bg-white shadow-xl animate-in slide-in-from-right duration-300 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="text-2xl font-bold text-gray-900"><span className="text-blue-600">e</span>Store</div>
                                <button className="text-gray-500 p-1" onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
                            </div>

                            {/* Nav Items */}
                            <div className="flex-1 space-y-3">
                                {navItems.map((item) => (
                                    <NavLink key={item.path} to={item.path} className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </NavLink>
                                ))}
                            </div>

                            {/* Auth Section (Mobile) */}
                            <div className="border-t border-gray-100 pt-6 mt-6 space-y-3">
                                {isAuthenticated ? (
                                    <>
                                        <NavLink to="/profile" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                                            <UserCircle className="h-5 w-5" /> Profile Settings
                                        </NavLink>
                                        <button onClick={handleLogoutClick} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                                            <LogOut className="h-5 w-5" /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full text-sm font-semibold text-gray-700 py-3 rounded-xl border border-gray-200">Login</button>
                                        <button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700">Register</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            {/* MODAL COMPONENT */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </>
    );
};

export default Navbar;