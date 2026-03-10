import React from 'react'

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 group">
            <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
                <img
                    src={product.images[0]?.url || 'https://via.placeholder.com/150'}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
                {product.stock < 1 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
                )}
            </div>
            <h3 className="font-bold text-gray-800 truncate">{product.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">
                    {product.price.currency === 'INR' ? '₹' : '$'}{product.price.amount}
                </span>
                <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                    🛒
                </button>
            </div>
        </div>
    );
};

export default ProductCard