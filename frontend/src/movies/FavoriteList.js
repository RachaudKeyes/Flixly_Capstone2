import React, { useState, useEffect, useContext } from "react";
import UserContext from "../auth/UserContext";
import FlixlyApi from "../api/api";
import MovieCard from "./MovieCard";
import LoadingSpinner from "../common/LoadingSpinner";

/** Show page with list of user's favorited movies.
 *
 * On mount, loads movies from API.
 * Re-loads movies from API response on submit.
 *
 * This is routed to at /favorites
 *
 * Routes -> { MovieCard }
 */

function FavoriteList() {
    console.debug("FavoriteList");

    const { currentUser } = useContext(UserContext);
    const userId = currentUser.id;

    const [movies, setMovies] = useState(null);

    useEffect(function getFavoritesOnMount() {
      console.debug("FavoriteList useEffect getFavoritesOnMount");    
      getMovies();
    },[]);

    async function getMovies() {
      let moviesResp = await FlixlyApi.getFavorites(userId);
      setMovies(moviesResp);
    }

    if (!movies) return <LoadingSpinner />;

    return (
      <div className="FavoriteList col-md-8 offset-md-2 mt-4">
        <h1 className="text-center text-light mb-5">{ currentUser.firstName }'s Favorites</h1>
        {movies.length
          ? (
              <div className="FavoriteList-list d-flex flex-wrap justify-content-between">
                {movies.map(m => (
                  <MovieCard 
                    key={ m.id }
                    id={ m.id }
                    title={ m.title }
                    releaseDate={ m.release_date.slice(0,4) }
                    poster= {m.poster_path }
                    voteAverage={ m.vote_average * 10 }
                  />
                ))}
              </div>  
            )
          : (
              <p className="lead">Sorry, no results were found.</p>
            )
        }
      </div>
    );
}

export default FavoriteList;