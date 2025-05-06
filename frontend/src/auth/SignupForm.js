import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Alert from "../common/Alert";

/** Signup form.
 *
 * Shows form and manages update to state on changes.
 * On submission:
 * - calls signup function prop
 * - redirects to /movies route
 *
 * Routes -> SignupForm -> Alert
 * Routed as /signup
 */

function SignupForm({ signup }) {
    const history = useHistory();
    const INITIAL_STATE = { username: "", password: "", firstName: "", 
                            lastName: "", email: "", profileImage: ""};
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [formErrors, setFormErrors] = useState([]);

    console.debug(
        "SignupForm",
        "signup=", typeof signup,
        "formData=", formData,
        "formErrors=", formErrors,
    );

    /** Handle form submit:
     *
     * Calls login func prop and, if successful, redirect to /movies.
     */

    async function handleSubmit(evt) {
        evt.preventDefault();
        let result = await signup(formData);

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
      <div className="SignupForm">
        <div className="container col-md-6 offset-md-3 col-lg-4 offset-lg-4">
          <h1 className="mb-3 mt-4 text-center text-light">Signup</h1>
          <div className="card bg-dark text-light">
            <div className="card-body">
              <form onSubmit={ handleSubmit }>

                <div className="form-group">
                  <label>Username</label>
                  <input
                    name="username"
                    className="form-control"
                    value={ formData.username }
                    onChange={ handleChange }
                    required
                  />  
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={ formData.password }
                    onChange={ handleChange }
                    required
                  />  
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    className="form-control"
                    value={ formData.firstName }
                    onChange={ handleChange }
                    required
                  />  
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    className="form-control"
                    value={ formData.lastName }
                    onChange={ handleChange }
                    required
                  />  
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    className="form-control"
                    value={ formData.email }
                    onChange={ handleChange }
                    required
                  />  
                </div>

                <div className="form-group">
                  <label>Profile Image</label>
                  <input
                    name="profileImage"
                    className="form-control"
                    value={ formData.profileImage }
                    onChange={ handleChange }
                    required
                  />  
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

export default SignupForm;