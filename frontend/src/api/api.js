import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 */

class FlixlyApi {
  // the token for interactive with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);
  
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${FlixlyApi.token}` };
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  /** Get list of movies sorted by popularity. 
   *  If given a title, search for movies with that title in TMDB API.
   */

  static async getMovies(title) {
    try { 
      if (title) {
        let res = await this.request(`movies?query=${ title }`,);
        return res.movies;
      }

      let res = await this.request(`movies`);
      return res.movies;
    } 
    catch (error) {
      console.error("Error getting movies:", error);
      throw error;
    }
  }

  /** Get details on a movie by TMDB's movie id. */

  static async getMovie(movieId) {
    try {
      let res = await this.request(`movies/${ movieId }`);
      return res.movie;
    }
    catch (error) {
      console.error("Error getting movie details:", error);
      throw error;
    }
  }

  /** Show movie from by TMDB's movie id */

  static async playMovie(movieId) {
    try {
      let res = await this.request(`movies/${ movieId }/play`);
      return res.movie;
    }
    catch (error) {
      console.error("Error getting movie:", error);
      throw error;
    }
  }

  /** Add rating for movie. */

  static async addRating(ratingData) {
    // ratingData object must include { userId, movieId, rating }
    try {
      let res = await this.request(`ratings`, ratingData, "post");
      return res.rating;
    }
    catch (error) {
      console.error("Error adding rating:", error);
    }
  }

  /** Get user's rating details by TMDB's movie id. */

  static async getRating(userId, movieId) {
    try {
      let res = await this.request(`users/${ userId }/rating`, { "movieId": +movieId });
      return res.rating;
    }
    catch (error) {
      console.error("Error getting rating:", error);
      throw error;
    }
  }

  /** Edit user's rating by TMDB's movie id. */

  static async editRating(userId, ratingData) {
    // ratingData object must include { movieId, rating } 
    try {
      let res = await this.request(`users/${ userId }/rating`, ratingData, "patch" );
      return res.rating;
    }
    catch (error) {
      console.error("Error editing rating:", error);
      throw error;
    }
  }

  /** Delete user's rating by TMDB's movie id. */

  static async deleteRating(userId, movieId) {
    try {
      let res = await this.request(`users/${ userId }/rating`, { movieId }, "delete" );
      return res.rating;
    }
    catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  }

  /** Get token for login from username, password. Authenticate user */
  
  static async login(loginData) {
    // loginData object must include { username, password }
    try {
      let res = await this.request("auth/token", loginData, "post");
      return res.token;
    }
    catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    }
  }

  /** Signup for site / Register new user. */

  static async signup(signupData) {
    // signupData object must include { username, password, firstName, lastName, email, profileImage }
    try {
      let res = await this.request("auth/register", signupData, "post");
      return res.token;
    }
    catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  /** Get the current user. */

  static async getCurrentUser(userId) {
    if (!this.token) {
      console.error("No token available. Cannot fetch user.");
      return null;
    }

    if (!userId) {
      console.error("Please add user.");
      return null;
    }

    try {
      const res = await this.request(`users/${ userId }`);
      return res.user;
    }
    catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  /** Save user profile page upon editing. */

  static async saveProfile(userId, profileData) {
    // profileData object must include { firstName, lastName, email, password, profileImage }
    try {
      let res = await this.request(`users/${ userId }`, profileData, "patch");

      // Save updated token, will cause rerender from App.js useEffect
      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      return res.user;
    }
    catch (error) {
      console.error("Error editing profile:", error);
      throw error;
    }
  }

  /** Check if movie has been favorited by user.  */

  static async isFavorite(userId, movieId) {
    try {
      let res = await this.request(`users/${ userId }/isFavorite`, { movieId }, "get");
      return res.isFavorite;
    }
    catch (error) {
      console.error("Error getting isFavorite:", error);
      throw error;
    }
   }

  /** Toggle movie as isFavorite = true or false */

  static async toggleFavorite(userId, movieId) {
    try {
      let res = await this.request(`users/${ userId }/favorites`, { movieId }, "put");
      return res.isFavorite;
    }
    catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
   }

   /** Get user's favorites */

   static async getFavorites(userId) {
    try {
      let res = await this.request(`users/${ userId }/favorites`);
      return res.favorites
    }
    catch (error) {
      console.error("Error getting users favorites:", error);
      throw error;
    }
   }
}

// for now, put token ("testuser" / "password" on class)
FlixlyApi.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzQ1ODcyODAwfQ.t5n7dK9vmv38AfXTx6lFaweHjeUiWsr7Ce9k1E9kgM8";

export default FlixlyApi;