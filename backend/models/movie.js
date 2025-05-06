"use strict";

const axios = require("axios");

const { API_KEY } = require("../config.js")
const BASE_API_URL = "https://api.themoviedb.org/3";

/** Related functions for movies. */

class Movie {

  /** Find all movies.
   * 
   *  If a title is provided, use TMDB search to get movies.
   *  Otherwise, get popular movies from TMDB.
   *
   * Returns [{ movieData }, ...]
   * */

  static async findAll(title) {
    if (title !== undefined) {
      let moviesRes = await axios.get(`${BASE_API_URL}/search/movie?query=${title}`, 
        { headers: { Authorization: `Bearer ${API_KEY}` } });

      const movies = moviesRes.data.results;
      return movies;
    }
   
    let moviesRes = await axios.get(`${BASE_API_URL}/movie/popular`, 
      { headers: { Authorization: `Bearer ${API_KEY}` } });

    const movies = moviesRes.data.results;
    return movies;
  }

  /** Given a movie id from TMDB api, return data about that movie.
   *
   * Returns { movieData }
   *
   **/

  static async get(movieId) {

    const moviesDetailsRes = await axios.get(`${BASE_API_URL}/movie/${movieId}`, 
        { headers: { Authorization: `Bearer ${API_KEY}` } });

    return moviesDetailsRes.data;
  }

  /** Given a movie id from TMDB api, return movie to play.
   *
   * Returns { movie }
   *
   **/

  static async play(movieId) {

    const movieRes = await axios.get(`${BASE_API_URL}/movie/${movieId}/videos`, 
        { headers: { Authorization: `Bearer ${API_KEY}` } });
        
    // first entry will be most recent updated video
    return movieRes.data.results[0];
  }
}


module.exports = Movie;
