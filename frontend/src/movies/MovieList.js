import React, { useState, useEffect } from "react";
import SearchForm from "../common/SearchForm";
import FlixlyApi from "../api/api";
import MovieCard from "./MovieCard";
import LoadingSpinner from "../common/LoadingSpinner";

/** Show page with list of movies.
 *
 * On mount, loads movies from API.
 * Re-loads movies with movies based on search form results on submit.
 *
 * This is routed to at /movies
 *
 * Routes -> { MovieCard, SearchForm }
 */

function MovieList() {
    console.debug("MovieList");

    const [movies, setMovies] = useState(null);

    useEffect(function getMoviesOnMount() {
      console.debug("MovieList useEffect getMoviesOnMount");    
      search();
    },[]);

    /** Triggered by search form submit; reloads movies. */
    async function search(title) {
      let moviesResp = await FlixlyApi.getMovies(title);
      setMovies(moviesResp);
    }

    if (!movies) return <LoadingSpinner />;

    return (
      <div className="MovieList col-md-8 offset-md-2">
        <SearchForm searchFor={search}/>
        {movies.length
          ?   <div className="MovieList-list d-flex flex-wrap justify-content-between">
                {movies.map(m => (
                  <MovieCard 
                    key={ m.id }
                    id= {m.id }
                    title={ m.title }
                    releaseDate={ m.release_date.slice(0,4) }
                    poster={ m.poster_path }
                    voteAverage={ m.vote_average * 10 }
                  />
                ))}
              </div>  
    
          :   <p className="lead">Sorry, no results were found.</p>
        }
      </div>
    );
}

export default MovieList;