import React, { useState, useContext } from "react";
import Alert from "../common/Alert";
import FlixlyApi from "../api/api";
import UserContext from "../auth/UserContext";

/** Profile editing form.
 *
 * Displays profile form and handles changes to local form state.
 * Submitting the form calls the API to save, and triggers user reloading
 * throughout the site.
 *
 * Confirmation of a successful save is a simple <Alert>
 *
 * Routed as /profile
 * Routes -> ProfileForm -> Alert
 */

function ProfileForm() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    userId: currentUser.id,
    username: currentUser.username,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    profileImage: currentUser.profileImage,
    password: "",
  });
  const [formErrors, setFormErrors] = useState([]);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  console.debug(
      "ProfileForm",
      "currentUser=", currentUser,
      "formData=", formData,
      "formErrors=", formErrors,
      "saveConfirmed=", saveConfirmed,
  );

  /** on form submit:
   * - attempt save to backend & report any errors
   * - if successful
   *   - clear previous error messages and password
   *   - show save-confirmed message
   *   - set current user info throughout the site
   */
  
  async function handleSubmit(evt) {
    evt.preventDefault();

    let profileData = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      profileImage: formData.profileImage,
      password: formData.password,
    };

    let userId = formData.id;
    let updatedUser;

    try {
      updatedUser = await FlixlyApi.saveProfile(userId, profileData);
    }
    catch(errors) {
      debugger;
      setFormErrors(errors);
      return;
    }

    setFormData(fData => ({ ...fData, password: "" }));
    setFormErrors([]);
    setSaveConfirmed(true);

    // trigger reloading of user information throughout the site
    setCurrentUser(updatedUser);
  }

  /** Handle form data changing */
  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData(f => ({
      ...f,
      [name]: value,
    }));
    setFormErrors([]);
  }

  return (
      <div className="col-md-6 col-lg-4 offset-md-3 offset-lg-4 mt-4">
        <h3 className="text-center text-light mb-4">{formData.firstName}'s Profile</h3>
        <div className="card bg-dark text-light">
          <div className="card-body">
            <form>

              <div className="form-group">
                <label>Username</label>
                <p className="form-control-plaintext text-light">{formData.username}</p>
              </div>

              <div className="form-group">
                <label>First Name</label>
                <input
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Profile Image</label>
                <input
                    name="email"
                    className="form-control"
                    value={formData.profileImage}
                    onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Confirm password to make changes:</label>
                <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                />
              </div>

              {formErrors.length
                  ? <Alert type="danger" messages={formErrors} />
                  : null
              }

              {saveConfirmed
                  ?
                  <Alert type="success" messages={["Updated successfully."]} />
                  : null
              }

              <button
                  className="btn btn-danger btn-block mt-4"
                  onClick={handleSubmit}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}

export default ProfileForm;