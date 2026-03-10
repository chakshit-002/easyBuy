// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAllProducts } from '../features/products/productSlice';
// import ProductCard from '../components/products/ProductCard';
// import { Search, Filter, X, ChevronDown } from 'lucide-react'; // Lucide Icons

// const ProductPage = () => {
//     const dispatch = useDispatch();
//     const { items, loading, hasMore } = useSelector(state => state.products);

//     // States for filters
//     const [searchTerm, setSearchTerm] = useState('');
//     const [minPrice, setMinPrice] = useState(0);
//     const [maxPrice, setMaxPrice] = useState(100000);
//     const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter toggle

//     // Local state for pagination
//     const [skip, setSkip] = useState(0);
//     const limit = 20;

//     useEffect(() => {
//         const delayDebounceFn = setTimeout(() => {
//             // Backend expects 'q', 'minprice', 'maxprice'
//             dispatch(fetchAllProducts({
//                 q: searchTerm,
//                 minprice: minPrice,
//                 maxprice: maxPrice
//             }));
//         }, 500);

//         return () => clearTimeout(delayDebounceFn);
//     }, [searchTerm, minPrice, maxPrice, dispatch]);


//     useEffect(() => {
//         dispatch(fetchAllProducts({ skip: 0, limit }));
//     }, [dispatch]);

//     const handleLoadMore = () => {
//         const nextSkip = skip + limit;
//         setSkip(nextSkip);
//         dispatch(fetchAllProducts({ skip: nextSkip, limit }));
//     };
//     return (
//         <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">

//             {/* Search Section */}
//             <div className="relative w-full max-w-2xl mx-auto mb-8">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                     type="text"
//                     value={searchTerm}
//                     placeholder="Search items..."
//                     className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//             </div>

//             <div className="flex flex-col md:flex-row gap-8">
//                 {/* Mobile Filter Button */}
//                 <button
//                     onClick={() => setIsFilterOpen(true)}
//                     className="md:hidden flex items-center justify-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100 font-medium text-gray-700"
//                 >
//                     <Filter className="h-4 w-4" /> Filters
//                 </button>

//                 {/* Sidebar Filters */}
//                 <aside className={`
//           fixed inset-0 z-50 bg-white p-6 transition-transform transform md:relative md:translate-x-0 md:z-0 md:bg-transparent md:p-0 md:w-64
//           ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
//         `}>
//                     <div className="flex items-center justify-between md:hidden mb-6">
//                         <h2 className="text-xl font-bold">Filters</h2>
//                         <X className="h-6 w-6 cursor-pointer" onClick={() => setIsFilterOpen(false)} />
//                     </div>

//                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
//                         <div className="flex items-center gap-2 mb-6 border-b pb-2">
//                             <Filter className="h-4 w-4 text-blue-600" />
//                             <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Filters</h2>
//                         </div>

//                         <div className="space-y-8">
//                             {/* Price Range Filter */}
//                             <div>
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Price Range</label>
//                                 <div className="mt-4 space-y-4">
//                                     <input
//                                         type="range"
//                                         className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
//                                         min="0"
//                                         max="100000"
//                                         value={maxPrice}
//                                         onChange={(e) => setMaxPrice(e.target.value)}
//                                     />
//                                     <div className="flex justify-between text-sm font-bold text-gray-700">
//                                         <span>₹0</span>
//                                         <span>₹{maxPrice}</span>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Add More Filters here like Category */}
//                             <div className="pt-4 border-t">
//                                 <button
//                                     onClick={() => { setSearchTerm(''); setMaxPrice(100000); }}
//                                     className="text-xs text-blue-600 font-bold hover:underline"
//                                 >
//                                     RESET ALL
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </aside>

//                 {/* Product Grid */}
//                 <main className="flex-1">
//                     {loading ? (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
//                             {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="bg-gray-200 h-80 rounded-3xl"></div>)}
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {items?.length > 0 ? (
//                                 items.map(product => <ProductCard key={product._id} product={product} />)
//                             ) : (
//                                 <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
//                                     <p className="text-gray-400 font-medium text-lg">No products found matching your criteria.</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* LOAD MORE BUTTON */}
//                     {hasMore && (
//                         <div className="flex justify-center mt-10 mb-10">
//                             <button
//                                 onClick={handleLoadMore}
//                                 disabled={loading}
//                                 className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
//                             >
//                                 {loading ? 'Loading...' : 'Load More Products'}
//                             </button>
//                         </div>
//                     )}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default ProductPage;


// import React, { useEffect, useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAllProducts } from '../features/products/productSlice';
// import ProductCard from '../components/products/ProductCard';
// import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

// const ProductPage = () => {
//     const dispatch = useDispatch();
//     const { items, loading, hasMore } = useSelector(state => state.products);

//     // States for filters
//     const [searchTerm, setSearchTerm] = useState('');
//     const [maxPrice, setMaxPrice] = useState(100000);
//     const [isFilterOpen, setIsFilterOpen] = useState(false);

//     // Pagination State
//     const [skip, setSkip] = useState(0);
//     const limit = 20;

//     // Common Fetch Function
//     const fetchProducts = useCallback((currentSkip, currentSearch, currentPrice) => {
//         dispatch(fetchAllProducts({
//             q: currentSearch,
//             minprice: 0,
//             maxprice: currentPrice,
//             skip: currentSkip,
//             limit: limit
//         }));
//     }, [dispatch]);

//     // Effect for Search & Price (with Debounce)
//     useEffect(() => {
//         const delayDebounceFn = setTimeout(() => {
//             setSkip(0); // Filter badalne par pehle page se shuru karo
//             fetchProducts(0, searchTerm, maxPrice);
//         }, 500);

//         return () => clearTimeout(delayDebounceFn);
//     }, [searchTerm, maxPrice, fetchProducts]);

//     // Pagination Handlers
//     const handleNext = () => {
//         const nextSkip = skip + limit;
//         setSkip(nextSkip);
//         fetchProducts(nextSkip, searchTerm, maxPrice);
//         window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
//     };

//     const handlePrev = () => {
//         const prevSkip = Math.max(0, skip - limit);
//         setSkip(prevSkip);
//         fetchProducts(prevSkip, searchTerm, maxPrice);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     const currentPage = Math.floor(skip / limit) + 1;

//     return (
//         <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">
//             {/* Search Section */}
//             <div className="relative w-full max-w-2xl mx-auto mb-8">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                     type="text"
//                     value={searchTerm}
//                     placeholder="Search premium products..."
//                     className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//             </div>

//             <div className="flex flex-col md:flex-row gap-8">
//                 {/* Sidebar Filters */}
//                 <aside className={`fixed inset-0 z-50 bg-white p-6 transition-transform transform md:relative md:translate-x-0 md:z-0 md:bg-transparent md:p-0 md:w-64 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//                     <div className="flex items-center justify-between md:hidden mb-6">
//                         <h2 className="text-xl font-bold">Filters</h2>
//                         <X className="h-6 w-6 cursor-pointer" onClick={() => setIsFilterOpen(false)} />
//                     </div>

//                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
//                         <div className="flex items-center gap-2 mb-6 border-b pb-2">
//                             <Filter className="h-4 w-4 text-blue-600" />
//                             <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Filters</h2>
//                         </div>

//                         <div className="space-y-8">
//                             <div>
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Price Range</label>
//                                 <div className="mt-4 space-y-4">
//                                     <input
//                                         type="range"
//                                         className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
//                                         min="0" max="100000" step="1000"
//                                         value={maxPrice}
//                                         onChange={(e) => setMaxPrice(e.target.value)}
//                                     />
//                                     <div className="flex justify-between text-sm font-bold text-gray-700">
//                                         <span>₹0</span>
//                                         <span>₹{maxPrice}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <button onClick={() => { setSearchTerm(''); setMaxPrice(100000); setSkip(0); }} className="text-xs text-blue-600 font-bold hover:underline">RESET ALL</button>
//                         </div>
//                     </div>
//                 </aside>

//                 {/* Main Content */}
//                 <main className="flex-1 flex flex-col">
//                     {loading ? (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
//                             {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="bg-gray-200 h-80 rounded-3xl"></div>)}
//                         </div>
//                     ) : (
//                         <>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                                 {items?.length > 0 ? (
//                                     items.map(product => <ProductCard key={product._id} product={product} />)
//                                 ) : (
//                                     <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed text-center">
//                                         <p className="text-gray-400">No products found.</p>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* PAGINATION CONTROLS */}
//                             <div className="flex items-center justify-center gap-4 mt-12 mb-8">
//                                 <button
//                                     onClick={handlePrev}
//                                     disabled={skip === 0 || loading}
//                                     className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
//                                 >
//                                     <ChevronLeft className="h-5 w-5 text-gray-700" />
//                                 </button>
                                
//                                 <span className="bg-white px-5 py-2 rounded-xl border border-gray-100 shadow-sm font-bold text-gray-700">
//                                     Page {currentPage}
//                                 </span>

//                                 <button
//                                     onClick={handleNext}
//                                     disabled={!hasMore || loading}
//                                     className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
//                                 >
//                                     <ChevronRight className="h-5 w-5 text-gray-700" />
//                                 </button>
//                             </div>
//                         </>
//                     )}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default ProductPage;


import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '../features/products/productSlice';
import ProductCard from '../components/products/ProductCard';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const ProductPage = () => {
    const dispatch = useDispatch();
    const { items, loading, hasMore } = useSelector(state => state.products);

    // States for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(100000);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // For Mobile View

    // Pagination State
    const [skip, setSkip] = useState(0);
    const limit = 20;

    const fetchProducts = useCallback((currentSkip, currentSearch, currentPrice) => {
        dispatch(fetchAllProducts({
            q: currentSearch,
            minprice: 0,
            maxprice: currentPrice,
            skip: currentSkip,
            limit: limit
        }));
    }, [dispatch]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSkip(0);
            fetchProducts(0, searchTerm, maxPrice);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, maxPrice, fetchProducts]);

    const handleNext = () => {
        const nextSkip = skip + limit;
        setSkip(nextSkip);
        fetchProducts(nextSkip, searchTerm, maxPrice);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        const prevSkip = Math.max(0, skip - limit);
        setSkip(prevSkip);
        fetchProducts(prevSkip, searchTerm, maxPrice);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentPage = Math.floor(skip / limit) + 1;

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 bg-gray-50 min-h-screen">
            
            {/* Header with Search & Mobile Filter Toggle */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            placeholder="Search premium products..."
                            className="w-full p-3.5 pl-12 rounded-2xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filter Button - Only Visible on Mobile */}
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="md:hidden p-3.5 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        <SlidersHorizontal className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative">
                
                {/* --- SIDEBAR FILTERS --- */}
                {/* Mobile Backdrop */}
                {isFilterOpen && (
                    <div 
                        className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsFilterOpen(false)}
                    />
                )}

                <aside className={`
                    fixed md:relative top-0 left-0 h-full md:h-auto z-50 md:z-0
                    w-[280px] md:w-64 bg-white md:bg-transparent
                    transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 transition-transform duration-300 ease-in-out
                    p-6 md:p-0 shadow-2xl md:shadow-none
                `}>
                    <div className="flex items-center justify-between md:hidden mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full">
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 border-b pb-3">
                            <Filter className="h-4 w-4 text-blue-600" />
                            <h2 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Shop Filters</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Range</label>
                                <div className="mt-4 space-y-4">
                                    <input
                                        type="range"
                                        className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        min="0" max="100000" step="1000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                    <div className="flex justify-between text-sm font-bold text-gray-700 font-mono">
                                        <span>₹0</span>
                                        <span className="text-blue-600">₹{maxPrice}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => { setSearchTerm(''); setMaxPrice(100000); setSkip(0); setIsFilterOpen(false); }} 
                                className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all"
                            >
                                RESET ALL FILTERS
                            </button>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="flex-1 flex flex-col min-h-[60vh]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
                                    <div className="bg-gray-200 h-48 rounded-2xl mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow">
                                {items?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {items.map(product => <ProductCard key={product._id} product={product} />)}
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 px-6 text-center">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 text-blue-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">No matches found</h3>
                                        <p className="text-gray-500 text-sm mt-1">We couldn't find any products matching "{searchTerm}"</p>
                                    </div>
                                )}
                            </div>

                            {/* PAGINATION */}
                            {items?.length > 0 && (
                                <div className="flex items-center justify-between sm:justify-center gap-4 mt-12 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                                    <button
                                        onClick={handlePrev}
                                        disabled={skip === 0 || loading}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-semibold disabled:opacity-30 transition-all hover:bg-gray-100"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Prev</span>
                                    </button>
                                    
                                    <span className="px-6 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl">
                                        {currentPage}
                                    </span>

                                    <button
                                        onClick={handleNext}
                                        disabled={!hasMore || loading}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-semibold disabled:opacity-30 transition-all hover:bg-gray-100"
                                    >
                                        <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductPage;