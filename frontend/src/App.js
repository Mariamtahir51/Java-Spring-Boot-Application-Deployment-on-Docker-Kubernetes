import './App.css';
import api from './api/axiosConfig';
import {useState, useEffect} from 'react';
import Layout from './components/Layout';
import {Routes, Route} from 'react-router-dom';
import Home from './components/home/Home';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Trailer from './components/trailer/Trailer';
import Reviews from './components/review/Review';

function App() {

  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [movie, setMovie] = useState({});

  const getMovies = async () => {
    try {
      const response = await api.get('/api/v1/movies');
      console.log('Movies fetched:', response.data);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const getMovieData = async (movieId) => {
    try {
      const response = await api.get(`/api/v1/movies/${movieId}`);
      console.log('Movie data fetched:', response.data);
      const singleMovie = response.data;
      setMovie(singleMovie);
      setReviews(singleMovie.reviews);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return null;
    }
  }

  useEffect(() => {
    getMovies();
  }, []);

  return (
    <div className="App">
      <Header />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Layout />}> 
          <Route path="/" element={<Home movies={movies} />} />
          <Route path="/Trailer/:ytTrailerId" element={<Trailer />} />
          <Route path="/Reviews/:movieId" element={<Reviews getMovieData={getMovieData} movie={movie} reviews={reviews} setReviews={setReviews} />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
