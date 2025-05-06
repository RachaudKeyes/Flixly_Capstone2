import React from "react";
import "./MovieUnavailable.css";

/** Loading message used by components that fetch API data. */

function MovieUnavailable() {
  return (
      <div className="MovieUnavailable">
        Sorry, this movie is unavailable.
      </div>
  );
}

export default MovieUnavailable;