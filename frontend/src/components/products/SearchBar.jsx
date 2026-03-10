import React from 'react'

const SearchBar = ({ onSearch }) => {
    return (
        <div className="relative w-full max-w-2xl mx-auto mb-6">
            <input
                type="text"
                placeholder="Search for products..."
                className="w-full p-4 pl-12 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => onSearch(e.target.value)}
            />
            <span className="absolute left-4 top-4 grayscale opacity-50">🔍</span>
        </div>
    )
}

export default SearchBar