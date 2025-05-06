import React, { useState } from "react";
import "./SearchForm.css";

/** Search widget.
 *
 * Appears on MovieList so that movies can be searched via TMDB API.
 *
 * This component doesn't *do* the searching, but it renders the search
 * form and calls the `searchFor` function prop that runs in the parent to do the
 * searching.
 *
 * { MovieList } -> SearchForm
 */

function SearchForm({ searchFor }) {
    console.debug("SearchForm",
        "searchFor=", typeof searchFor
    );

    const [searchTerm, setSearchTerm] = useState("");

    /** Tell parent to use searchTerm to search */
    function handleSubmit(evt) {
      // handle case of accidentally trying to search for just spaces
      evt.preventDefault();

      searchFor(searchTerm.trim() || undefined);
      setSearchTerm("");
    }

    /** Update form fields */
    function handleChange(evt) {
      setSearchTerm(evt.target.value);
  }

    return (
      <div className="SearchForm mb-5 mt-4">
        <form className="form-inline" onSubmit={handleSubmit}>
          <input 
            className="form-control form-control-lg flex-grow-1"
            type="text"
            name="searchTerm"
            placeholder="Search movies ..."
            value={searchTerm}
            onChange={handleChange}
          />
          <button type="submit" className="btn btn-lg btn-danger ml-2">
            Search
          </button>
        </form>
      </div>
    );
}

export default SearchForm;