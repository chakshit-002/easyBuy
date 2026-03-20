// components/HomeBanner.jsx
import { useNavigate } from 'react-router-dom';

const HomeBanner = ({ product, bgColor, title }) => {
  const navigate = useNavigate();

  console.log("homeBanner product",product);
  if (!product) return null;

  return (
    <div className={`relative w-full h-[350px] md:h-[450px] ${bgColor} rounded-3xl overflow-hidden my-8 flex items-center px-10 shadow-lg group`}>
      <div className="z-10 max-w-lg">
        <span className="text-sm font-bold tracking-widest uppercase opacity-70">Exclusive Deal</span>
        <h2 className="text-4xl md:text-5xl font-black mt-2 mb-6 leading-tight">{title || product.title}</h2>
        <button 
          onClick={() => navigate(`/product/${product._id}`)}
          className="bg-black text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          View Details — ₹{product.price.amount}
        </button>
      </div>
      
      {/* Product Image on Right */}
      <img 
        src={product.images[0]?.url} 
        alt="Banner Product"
        className="absolute right-0 bottom-0 h-[80%] md:h-[90%] object-contain group-hover:scale-110 transition-transform duration-700"
      />
    </div>
  );
};

export default HomeBanner;