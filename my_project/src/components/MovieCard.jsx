import React from "react";
import star from "../assets/Rating.svg"; // Adjust the path as necessary
import poster from "../assets/No-Poster.png"; // Adjust the path as necessary

const MovieCard = ({ movie: { title, vote_average, poster_path, original_language, release_date } }) => {
  return (
    <div className="movie-card bg-[#12121e]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-md hover:shadow-purple-500/20 transition-shadow duration-300 p-4 text-white"> 
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : poster} // Fixed fallback image
        alt={title || "No Poster Available"} // Added fallback alt text
        className="w-full h-auto rounded-lg mb-4"
      />
      <h3 className="content text-lg font-bold mt-4">{title || "Unknown Title"}</h3>
      <div className="content flex items-center text-sm mt-2">
        <div className="rating flex items-center">
          <img src={star} alt="star Icon" className="w-4 h-4 mr-1" />
          <p>{vote_average?.toFixed(1) || "N/A"}</p>
        </div>
        <span>.</span>
        <p>{original_language?.toUpperCase() || "N/A"}</p>
        <span>.</span>
        <p>{release_date?.split("-")[0] || "N/A"}</p>
      </div>
    </div>
  );
};

export default MovieCard;