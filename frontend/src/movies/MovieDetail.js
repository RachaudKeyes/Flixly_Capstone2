import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import FlixlyApi from "../api/api";
import UserContext from "../auth/UserContext";
import LoadingSpinner from "../common/LoadingSpinner";
import "./MovieDetail.css"

/** Movie Detail page.
 *
 * Renders information about the movie.
 * Routed at /movies/:movieId
 *
 * Routes -> { AddRatingForm, EditRatingForm, MoviePlay }
 */

function MovieDetail() {
    const { currentUser } = useContext(UserContext);
    const userId = currentUser.id;
    const { movieId } = useParams();

    console.debug("MovieDetail", "movieId=", movieId);

    const [movie, setMovie] = useState(null);
    const [rating, setRating] = useState(null);
    const [favorite, setFavorite] = useState();

    useEffect(function getMovieDetailsOnMount() {
        async function fetchMovie() {
          setMovie(await FlixlyApi.getMovie(movieId));
        }
        async function fetchRating() {
          setRating(await FlixlyApi.getRating(userId, movieId));
        }
        async function fetchIsFavorite() {
          setFavorite(await FlixlyApi.isFavorite(userId, movieId));
        }
        
        fetchMovie();
        fetchRating();
        fetchIsFavorite();
    }, [movieId, userId]);

    // toggle favorite
    async function toggle() {
      await FlixlyApi.toggleFavorite(userId, movieId);
      setFavorite(!favorite);
    }

    // delete rating
    async function removeRating() {
      await FlixlyApi.deleteRating(userId, movieId);
      setRating(null);
    }

    if (!movie) return <LoadingSpinner />

    return (
      <div className="MovieDetail col-md-8 offset-md-2 mt-4 d-flex justify-content-between pl-0"
           style={{ backgroundImage: `url("http://image.tmdb.org/t/p/w500/${ movie.backdrop_path }")`}}>
        
        <div>
          <Link className="" to={`/movies/${ movieId }/play`}>
            { movie.poster_path && <img src={ `http://image.tmdb.org/t/p/w500/${movie.poster_path }`}
                                        alt={ movie.title }/> }
          </Link>
        </div>   

        <div className="ml-4">
          <h1 className="text-center font-weight-bold">{ movie.title } ({ movie.release_date.slice(0,4)})</h1>

          <p className="text-center">
            <span>{ movie.release_date } &#183;</span>
            {/*loop over genres */}
            { movie.genres.map(g => (
              <span key={ g.id }> { g.name } </span>
            ))} &#183;
            {/* runtime hours and minutes */}
            <span> { Math.floor(movie.runtime / 60) }h </span>
            <span>{ movie.runtime % 60 }min</span>
          </p>

          <p className="text-center">Overall Rating: { Math.round(movie.vote_average * 10) }%</p>

          <div className="font-italic mb-3">
            { movie.tagline }
            <span className="text-center mb-2 float-right">  
              {(favorite === true)
                  ? <button className="btn btn-md " onClick={() => toggle()}>
                      <i className="fa-solid fa-star" style={{ color: "black" }}></i>
                      <span className=""> Favorite</span>
                    </button>
                  : <button className="btn btn-md " onClick={() => toggle()}>
                      <i className="fa-regular fa-star" style={{ color: "black" }}></i>
                      <span className=""> Add to favorites</span> 
                    </button>     
              }
            </span>
          </div>

          <h5 className="">Overview</h5>
          <p className="">{ movie.overview }</p>

          {(rating)
            ? <div className="text-center">
                <h4 className="mb-3">{ currentUser.firstName }'s Rating: { rating.rating } / 5</h4>
                <Link to={{ pathname: `/movies/${ movieId }/editRating`, state: { rating } }}
                >
                  <button className="btn btn-md btn-danger mr-5">Edit</button>
                </Link> 
                  <button className="btn btn-md btn-danger" 
                          onClick={() => removeRating()}>
                            Delete
                  </button>

              </div> 

            : <div className="text-center mt-5">
                <Link to={`/movies/${ movieId }/addRating`}>
                  <button className="btn btn-lg btn-danger">Rate Now!</button>
                </Link>
              </div>
          }

          <div className="text-center mt-5">
            <Link to={`/movies/${ movieId }/play`}>
              <button className="btn btn-lg btn-success">Play Movie!</button>
            </Link>
          </div>

        </div>
      </div>
    );
}

export default MovieDetail;