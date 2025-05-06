import React, { useState, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import UserContext from "../auth/UserContext";
import FlixlyApi from "../api/api";
import Alert from "../common/Alert";

/** Add Rating form.
 *
 * Shows form and manages update to state on changes.
 * On submission:
 * 
 * - redirects to /movies/:movieId route
 *
 * Routes -> AddRatingForm 
 * Routed as /movies/:movieId/addRating
 */

function AddRatingForm() {
    const history = useHistory();
    const { movieId } = useParams();
    const { currentUser } = useContext(UserContext);

    const INITIAL_STATE = { userId: currentUser.id, movieId: +movieId, rating: 0 };
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [formErrors, setFormErrors] = useState([]);

    console.debug(
        "AddRatingForm",
        "formData=", formData,
        "formErrors=", formErrors,
    );

    /** Handle form submit:
     *
     * Calls addRating function in API and, if successful, redirects to /movies/movieId.
     */

    async function handleSubmit(evt) {
        evt.preventDefault();
        let result = await FlixlyApi.addRating(formData);

        (result) 
          ? history.push(`/movies/${movieId}`) 
          : setFormErrors(result.errors);
    }

    /** Update form data field */
    function handleChange(evt) {
      const { name, value } = evt.target;
      setFormData(data => ({ ...data, [name]: +value }));
    }

    return (
      <div className="SignupForm">
        <div className="container col-md-6 offset-md-3 col-lg-4 offset-lg-4">
          <h1 className="mb-3 mt-3 text-light text-center">Rate Movie</h1>
          <div className="card">
            <div className="card-body">
              <form onSubmit={ handleSubmit }>

                <div className="form-group">
                  <label>Rate (0 to 5)</label>
                  <input
                    type="range"
                    name="rating"
                    className="form-control"
                    min={0}
                    max={5}
                    step={0.5}
                    list="markers"
                    value={ +formData.rating }
                    style={{ accentColor: "red" }}
                    onChange={ handleChange }
                  />
                  <datalist id="markers">
                    <option value={0}></option>
                    <option value={1}></option>
                    <option value={2}></option>
                    <option value={3}></option>
                    <option value={4}></option>
                    <option value={5}></option>
                  </datalist>
                  <p>{ `${ formData.rating }` }</p>
                </div>

                { formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
                    : null
                }

                <button
                    type="submit"
                    className="btn btn-danger float-right"
                    onSubmit={ handleSubmit }
                >
                  Submit
                </button>    
              </form>
            </div>
          </div>
        </div>
      </div>
    );
}

export default AddRatingForm;