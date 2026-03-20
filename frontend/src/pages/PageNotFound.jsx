// pages/PageNotFound.jsx
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">404</h1>
      <div className="bg-blue-600 text-white px-2 text-sm rounded rotate-12 absolute mb-20">
        Page Not Found
      </div>
      <p className="text-gray-500 mt-5 text-lg">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-8 px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-blue-600 transition-all shadow-lg"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default PageNotFound;