import React from 'react';
import search from '../assets/search.svg'; // Adjust the path as necessary

const Search = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="search">
            <div className="relative">
                <img 
                    src={search} 
                    alt="search" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                />
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input text-white w-full pl-10 py-2 bg-gray-800 rounded-2xl focus:outline-none"
                />
            </div>
        </div>
    );
}

export default Search;