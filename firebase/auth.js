// auth.js

// imports
import { getAuth, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// main Auth class
class Auth {
  constructor() {
    this.auth = getAuth(); // get the authentication object from firebase
    this.user = null; // set the user variable for later
  }

  // bind the signout button so that users can sign out
  bindSignOut(id) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => signOut(this.auth).then(() => {
      window.location.assign("/");
    }).catch(error => {
      window.alert(error);
    }));

  }

  // delete a user from the firebase authentication database
  deleteUser() {
    const user = this.auth.currentUser;
    deleteUser(user)
      .then(() => {
        window.alert("deleted account successfully. please make a new one to continue playing the game.");
        window.location.assign('./signup.html');
      })
      .catch((error) => {
        window.alert(error);
      })
  }
}

export { Auth }