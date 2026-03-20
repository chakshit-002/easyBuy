import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProductAsync } from '../features/seller/sellerSlice';
import { fetchAllProducts } from '../features/products/productSlice';
import { Upload, X, PackagePlus, IndianRupee, Info, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProduct = () => {
    const dispatch = useDispatch();
    //1. local loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        // 2. Prevent multiple clicks immediately
        if (isSubmitting) return;

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('priceAmount', formData.priceAmount);
        data.append('stock', formData.stock);
        images.forEach(img => data.append('images', img));

        const loadToast = toast.loading("Creating product...");
        try {

            setIsSubmitting(true); // 3. Set loading to true

            await dispatch(createProductAsync(data)).unwrap();
            dispatch(fetchAllProducts({ skip: 0, limit: 20 }));
            toast.success("Product Listed Successfully!", { id: loadToast });
            // Reset form
            setFormData({ title: '', description: '', priceAmount: '', stock: '' });
            setImages([]); setPreview([]);
        } catch (err) {
            toast.error(err.message || "Failed to create", { id: loadToast });
        } finally {
            setIsSubmitting(false); // 4. Kaam khatam hone par loading false
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div className="flex items-center gap-5">
                    <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200">
                        <PackagePlus size={36} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">List New Product</h1>
                        <p className="text-gray-400 font-medium text-sm">Fill in the details to launch your item</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Side: Basic Info (Taking 7 cols) */}
                <div className="lg:col-span-7 space-y-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Info size={18} />
                        <span className="font-bold uppercase text-xs tracking-widest">General Information</span>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Product Title</label>
                        <input
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-gray-800 placeholder:text-gray-300"
                            placeholder="e.g. Sony WH-1000XM5 Headphones"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Price (INR)</label>
                            <input
                                type="number"
                                className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-gray-800"
                                value={formData.priceAmount}
                                onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Stock Inventory</label>
                            <input
                                type="number"
                                className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-gray-800"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Description</label>
                        <textarea
                            rows="6"
                            placeholder="Write something compelling about your product..."
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-gray-800"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Right Side: Image Upload (Taking 5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <ImageIcon size={18} />
                            <span className="font-bold uppercase text-xs tracking-widest">Media Assets</span>
                        </div>

                        <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center hover:border-blue-200 hover:bg-blue-50/30 transition-all relative cursor-pointer group">
                            <input
                                type="file" multiple accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleImageChange}
                            />
                            <Upload size={48} className="text-gray-300 group-hover:text-blue-600 group-hover:scale-110 transition-all mb-4" />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-tighter italic">Drop images here</p>
                        </div>

                        {/* Previews Grid */}
                        {preview.length > 0 && (
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                {preview.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-gray-50 relative group shadow-sm">
                                        <img src={url} className="w-full h-full object-cover" alt="preview" />
                                        <button
                                            type="button"
                                            className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setPreview(prev => prev.filter((_, idx) => idx !== i));
                                                setImages(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                        >
                                            <X size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Button Container */}
                    <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-6 cursor-pointer rounded-[2rem] font-black uppercase tracking-[0.2em] italic transition-all shadow-xl 
                            ${isSubmitting
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-blue-600 hover:-translate-y-1 active:scale-95 shadow-blue-100'
                                }`}
                        >
                            {isSubmitting ? "Processing..." : "Publish Product"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;