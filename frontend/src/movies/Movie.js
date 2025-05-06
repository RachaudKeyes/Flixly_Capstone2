import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import MovieUnavailable from "../common/MovieUnavailable";
import FlixlyApi from "../api/api";

import "./Movie.css"

/** Display movie to watch based on movieId */

function MoviePlay() {
    const history = useHistory();
    const { movieId } = useParams();
    console.debug("MoviePlay", "movieId=", movieId);

    const [movie, setMovie] = useState(null);

    useEffect(function playMovieOnMount() {
        async function playMovie() {
          setMovie(await FlixlyApi.playMovie(movieId));
        }

        playMovie();
    }, [movieId]);

    function goBack() {
      history.push(`/movies/${movieId}`)
    }

    if (!movie) {
      return (
        <div className="text-center">
          <MovieUnavailable />
          <button className="btn btn-lg btn-danger mt-5" onClick={() => goBack()}>Back to Details</button>
        </div>
      )
    }

    return (
          <div className="MoviePlay mt-4">
            <h1 className="text-light mb-4 text-center">{ movie.name }</h1>

            <div className="MoviePlayBody">
            { (movie.site === "YouTube") 
                ? <iframe src={`https://www.youtube.com/embed/${ movie.key }`} title={ movie.name } allowFullScreen></iframe>
                : <iframe src={`https://player.vimeo.com/${ movie.key }`} title={ movie.name }></iframe>
            }
            </div>  

            <div className="text-center mt-5">
              <button className="btn btn-lg btn-danger" onClick={() => goBack()}>Back to Details</button>
            </div>
  
          </div>
    );
}

export default MoviePlay;