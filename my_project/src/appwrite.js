import { Client, Account, Databases, Query } from 'appwrite'; // Import required modules

const client = new Client();

// Initialize Appwrite client with endpoint and project ID
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Use your project ID from environment variables

export const account = new Account(client); // Use the imported Account class
export const databases = new Databases(client); // Use the imported Databases class

// Validate environment variables
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

if (!DATABASE_ID || !APPWRITE_COLLECTION_ID) {
  console.error('Missing required environment variables: DATABASE_ID or APPWRITE_COLLECTION_ID');
  throw new Error('Environment variables not properly configured.');
}

// Debugging: Log the database and collection IDs
console.log('DATABASE_ID:', DATABASE_ID);
console.log('APPWRITE_COLLECTION_ID:', APPWRITE_COLLECTION_ID);

// Function to update search count for a movie
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const results = await databases.listDocuments(DATABASE_ID, APPWRITE_COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ]);

    if (results.documents.length > 0) {
      const documentId = results.documents[0].$id;
      const updatedDocument = await databases.updateDocument(DATABASE_ID, APPWRITE_COLLECTION_ID, documentId, {
        searchTerm: searchTerm,
        count: results.documents[0].count + 1,
        movies: [...results.documents[0].movies, movie],
      });
      console.log('Updated document:', updatedDocument);
    } else {
      // Only create a new document if the movie has a valid poster_path
      if (movie.poster_path) {
        const newDocument = await databases.createDocument(DATABASE_ID, APPWRITE_COLLECTION_ID, 'unique()', {
          searchTerm: searchTerm,
          count: 1,
          movies_ID: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
          title: movie.title || 'Unknown Title',
        });
        console.log('Created new document:', newDocument);
      } else {
        console.warn('Movie skipped due to missing poster_path:', movie);
      }
    }
  } catch (error) {
    console.error('Error updating search count:', error.message, error);
  }
};

// Function to fetch trending movies
export const getTrendingMovies = async () => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, APPWRITE_COLLECTION_ID);

    // Filter movies to include only those with a valid poster_path
    const filteredMovies = response.documents.filter((movie) => movie.poster_url && movie.poster_url !== '');

    console.log('Trending Movies:', filteredMovies); // Debugging log
    return filteredMovies;
  } catch (error) {
    console.error('Error fetching trending movies:', error.message, error);
    throw error;
  }
};