import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProductAsync } from '../features/seller/sellerSlice';
import { fetchAllProducts } from '../features/products/productSlice';
import { Upload, X, PackagePlus, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProduct = () => {
    const dispatch = useDispatch();
    const [images, setImages] = useState([]);
    const [preview, setPreview] = useState([]);
    const [formData, setFormData] = useState({
        title: '', description: '', priceAmount: '', stock: ''
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            return toast.error("Max 5 images allowed");
        }
        setImages([...images, ...files]);
        
        // Preview generation
        const urls = files.map(file => URL.createObjectURL(file));
        setPreview([...preview, ...urls]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('priceAmount', formData.priceAmount);
        data.append('stock', formData.stock);
        images.forEach(img => data.append('images', img));

        const loadToast = toast.loading("Creating product...");
        try {
            await dispatch(createProductAsync(data)).unwrap();
            dispatch(fetchAllProducts({ skip: 0, limit: 20 }));
            toast.success("Product Listed Successfully!", { id: loadToast });
            // Reset form
            setFormData({ title: '', description: '', priceAmount: '', stock: '' });
            setImages([]); setPreview([]);
        } catch (err) {
            toast.error(err.message || "Failed to create", { id: loadToast });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100">
                    <PackagePlus size={32} />
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">List New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Basic Info */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Product Title</label>
                        <input 
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold"
                            placeholder="e.g. Sony WH-1000XM5"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Price (INR)</label>
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold"
                                value={formData.priceAmount}
                                onChange={(e) => setFormData({...formData, priceAmount: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Stock Qty</label>
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Description</label>
                        <textarea 
                            rows="4"
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Right Side: Image Upload */}
                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Product Images (Max 5)</label>
                    <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-all relative cursor-pointer group">
                        <input 
                            type="file" multiple accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                        />
                        <Upload size={48} className="text-gray-200 group-hover:text-blue-600 transition-colors mb-4" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-tighter italic">Click or drag to upload</p>
                    </div>

                    {/* Previews */}
                    <div className="grid grid-cols-5 gap-2 mt-4">
                        {preview.map((url, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 relative group">
                                <img src={url} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        setPreview(prev => prev.filter((_, idx) => idx !== i));
                                        setImages(prev => prev.filter((_, idx) => idx !== i));
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] italic hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200"
                    >
                        Publish Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;