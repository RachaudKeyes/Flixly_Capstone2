import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Alert from "../common/Alert";

/** Login form.
 *
 * Shows form and manages update to state on changes.
 * On submission:
 * - calls login function prop
 * - redirects to /movies route
 *
 * Routes -> LoginForm -> Alert
 * Routed as /login
 */

function LoginForm({ login }) {
    const history = useHistory();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [formErrors, setFormErrors] = useState([]);

    console.debug(
      "LoginForm",
      "login=", typeof login,
      "formData=", formData,
      "formErrors", formErrors,
    ); 

    /** Handle form submit:
     *
     * Calls login func prop and, if successful, redirect to /movies.
     */

    async function handleSubmit(evt) {
      evt.preventDefault();
      let result = await login(formData);

      (result.success) 
        ? history.push("/movies") 
        : setFormErrors(result.errors);
    }

    /** Update form data field */
    function handleChange(evt) {
      const { name, value } = evt.target;
      setFormData(data => ({ ...data, [name]: value }));
    }

    return (
      <div className="LoginForm">
        <div className="container col-md-6 offset-md-3 col-lg-4 offset-lg-4">
          <h1 className="mb-3 mt-4 text-center text-light">Log In</h1>
          <div className="card bg-dark text-light">
            <div className="card-body">
              <form onSubmit={ handleSubmit }>

                <div className="form-group">
                  <label>Username</label>
                  <input
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={ handleChange }
                      autoComplete="username"
                      required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={ handleChange }
                      autoComplete="current-password"
                      required
                  />
                </div>

                {formErrors.length
                    ? <Alert type="danger" messages={formErrors} />
                    : null
                }

                <button
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

export default LoginForm;