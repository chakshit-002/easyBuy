// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Section 1: Brand Info */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tighter">
                            MY <span className="text-blue-500">easy</span>Buy Store
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Your one-stop destination for premium tech and lifestyle essentials.
                            We deliver quality and trust right to your doorstep.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="hover:text-blue-500 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-gray-100 transition-colors"><Github size={20} /></a>
                        </div>
                    </div>

                    {/* Section 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Quick Links</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
                            <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                        </ul>
                    </div>

                    {/* Section 3: Customer Care & Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest  ">
                            Customer Support
                        </h4>
                        <ul className="space-y-4 text-sm ">
                            <li>
                                <Link to="/privacy-policy" className="hover:text-blue-500 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-conditions" className="hover:text-blue-500 transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/return-policy" className="hover:text-blue-500 transition-colors">
                                    Return & Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping-policy" className="hover:text-blue-500 transition-colors">
                                    Shipping Information
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Section 4: Contact & Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold uppercase text-sm tracking-widest">Contact Us</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-3">
                                <MapPin size={16} className="text-blue-500" />
                                <span>Jaipur, Rajasthan, India</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone size={16} className="text-blue-500" />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail size={16} className="text-blue-500" />
                                <span>Chakshit@easyBuy.com</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 text-center md:text-left">
                        © {new Date().getFullYear()} My easyBuy Store Inc. All rights reserved. Made with ❤️ for tech lovers.
                    </p>

                    {/* Payment Partners (Text/Small Icons) */}
                    <div className="flex items-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Secure Payments via</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="mastercard" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="paypal" />
                    </div>
                </div>
            </div>


        </footer>
    );
};

export default Footer;