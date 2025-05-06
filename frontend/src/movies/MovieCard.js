import React from "react";
import { Link } from "react-router-dom";
import "./MovieCard.css";

/** Show limited information about a movie
 *
 * Is rendered by MovieList and FavoriteList to show a "card" for each movie.
 *
 * { MovieList, FavoriteList } -> MovieCard
 */

function MovieCard( { id, title, releaseDate, poster, voteAverage}  ) {
    console.debug("MovieCard");

    return (
      <div className="MovieCardBody">
        <Link className="MovieCard" to={`/movies/${id}`}>
          <div>
            { poster && <img src={`http://image.tmdb.org/t/p/w500/${poster}`}
                              alt={ title }
                              className="" /> }
          </div>
        </Link>
        <div className="font-weight-bold mb-4"> { title } </div> 
        <div className="mt-3 mb-0">
          { releaseDate }
          <span className="float-right">{ Math.round(voteAverage) }%</span>
        </div>     
      </div> 
    );
}

export default MovieCard;