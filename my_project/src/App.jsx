import { Client, Account, Databases, Query } from 'appwrite'; // Import Query from appwrite
import React, { useEffect, useState } from 'react';
import './index.css';
import './App.css';
import Search from './components/search.jsx';
import bgimg from './assets/BG.png';
import heroimg from './assets/hero-img.png';
import Spinner from './spinner.jsx'; // Spinner component for loading state
import MovieCard from './components/MovieCard'; // Component to display individual movies
import { useDebounce } from 'use-debounce'; // Hook to debounce search input
import { getTrendingMovies, databases, DATABASE_ID, APPWRITE_COLLECTION_ID } from './appwrite.js'; // Import `databases` from appwrite.js

const API_BASE_URL = 'https://api.themoviedb.org/3'; // Base URL for the movie API

function App() {
  // State variables
  const [searchTerm, setSearchTerm] = useState(''); // User's search input
  const [errorMessage, setErrorMessage] = useState(''); // Error messages
  const [movies, setMovies] = useState([]); // List of movies fetched from the API
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [debounceSearchTerm] = useDebounce(searchTerm, 600); // Set debounce delay to 300ms
  const [trendingMovies, setTrendingMovies] = useState([]); // List of trending movies

  // Function to fetch movies based on a search query or fetch popular movies by default
  const fetchMovies = async (query = '') => {
    setErrorMessage('');
    setIsLoading(true);

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjgwMzI4MGRlZWE3ZDRhNzA2NGY5YmQzNDg4ZTllMyIsIm5iZiI6MTc0NjI2ODIwMi4yNTYsInN1YiI6IjY4MTVmMDJhZjhjYjdmYzgzMzk1OTM1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._kLuwEYYHxMaAhh3covyXuaxPCup13wtgBIIFeRCb5c`, // Replace with your actual API key
      },
    };

    try {
      // Determine the endpoint based on whether a query is provided
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      console.log('Fetching from endpoint:', endpoint); // Debugging log
      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Debugging log
      setMovies(data.results || []); // Update the movies state

      // Update search count in Appwrite if a query and results exist
      if (query && data.results.length > 0) {
        await updateSearchCount(query, loadTrendingMovies); // Use the locally defined function
      }
    } catch (error) {
      setErrorMessage(`Failed to fetch movies: ${error.message}`);
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to load trending movies
  const loadTrendingMovies = async () => {
    setIsLoading(true);
    try {
      // Fetch all trending movies from Appwrite
      const results = await databases.listDocuments(DATABASE_ID, APPWRITE_COLLECTION_ID);

      // Sort movies by count in descending order and take the top 10
      const sortedMovies = results.documents
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Update the trendingMovies state with the top 10 movies
      setTrendingMovies(sortedMovies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Effect to fetch movies when the search term changes
  useEffect(() => {
    if (debounceSearchTerm && debounceSearchTerm.trim() !== '') {
      fetchMovies(debounceSearchTerm); // Fetch movies based on the search term
    } else {
      fetchMovies(); // Fetch popular movies by default
    }
  }, [debounceSearchTerm]);

  // Effect to load trending movies on component mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main className="bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${bgimg})` }}>
      <div className="pattern" />
      <div className="wrapper">
        {/* Header Section */}
        <header className="text-white text-center py-10">
          <img src={heroimg} alt="hero" className="banner mx-auto" />
          <h1 className="text-4xl font-bold">
            Find{' '}
            <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Movies
            </span>{' '}
            You'll Enjoy <br /> Without any Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className="text-white text-3xl font-bold text-center mt-10 mb-6">Trending Movies</h2>
            {isLoading ? (
              <Spinner /> // Show spinner while loading
            ) : (
              <ul className="flex flex-row overflow-y-auto gap-5 -mt-10 w-full hide-scrollbar">
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id} className="min-w-[230px] flex flex-row items-center">
                    {/* Display the number */}
                    <p className="fancy-text mt-[22px] text-nowrap">{index + 1}</p>
                    <img
                      src={movie.poster_url}
                      alt="Trending Movie Poster"
                      className="w-[127px] h-[163px] rounded-lg object-cover -ml-3.5"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* All Movies Section */}
        <section className="all-movies">
          <h2 className="text-white text-3xl font-bold text-center mt-10">All Movies</h2>
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          {isLoading ? (
            <Spinner /> // Show spinner while loading
          ) : (
            <ul className="movies-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {movies.map((movie) => (
                <li key={movie.id}>
                  <MovieCard movie={movie} /> {/* Use the MovieCard component */}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;

// Locally defined updateSearchCount function
export const updateSearchCount = async (searchTerm, loadTrendingMovies) => {
  try {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const results = await databases.listDocuments(DATABASE_ID, APPWRITE_COLLECTION_ID, [
      Query.equal('searchTerm', lowerCaseSearchTerm),
    ]);

    if (results.documents.length > 0) {
      const documentId = results.documents[0].$id;
      const currentCount = results.documents[0].count || 0;

      const updatedDocument = await databases.updateDocument(DATABASE_ID, APPWRITE_COLLECTION_ID, documentId, {
        searchTerm: lowerCaseSearchTerm,
        count: currentCount + 1,
        poster_url: results.documents[0].poster_url,
      });

      console.log('Updated document:', updatedDocument);
    } else {
      const movieDetails = await fetchMovieDetails(searchTerm);

      if (!movieDetails.poster_path) throw new Error('Movie details do not include a poster URL');
      if (!movieDetails.id) throw new Error('Movie details do not include a movie ID');
      if (!movieDetails.title) throw new Error('Movie details do not include a title');

      const newDocument = await databases.createDocument(DATABASE_ID, APPWRITE_COLLECTION_ID, 'unique()', {
        searchTerm: lowerCaseSearchTerm,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
        movie_id: movieDetails.id,
        title: movieDetails.title,
      });

      console.log('Created new document:', newDocument);
    }

    // Call the passed loadTrendingMovies function
    await loadTrendingMovies();
  } catch (error) {
    console.error('Error updating search count:', error);
  }
};

// Locally defined fetchMovieDetails function
const fetchMovieDetails = async (searchTerm) => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjgwMzI4MGRlZWE3ZDRhNzA2NGY5YmQzNDg4ZTllMyIsIm5iZiI6MTc0NjI2ODIwMi4yNTYsInN1YiI6IjY4MTVmMDJhZjhjYjdmYzgzMzk1OTM1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._kLuwEYYHxMaAhh3covyXuaxPCup13wtgBIIFeRCb5c`, // Replace with your actual API key
    },
  };

  const endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}`;
  const response = await fetch(endpoint, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch movie details: ${response.status}`);
  }

  const data = await response.json();
  if (data.results.length > 0) {
    return data.results[0]; // Return the first movie result
  }

  throw new Error('No movie details found for the given search term');
};

