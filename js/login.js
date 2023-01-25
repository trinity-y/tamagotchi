// login.js

// imports
import { System } from "../firebase/system.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// main Login class
class Login {
  constructor() {
    this.system = new System(); // let's instantiate the System class
    this.bindLogin(); // bind the login button too
  }

  // add the event listener to the login button
  bindLogin() {
    const login = document.getElementById("login");
    login.addEventListener('submit', (e) => this.handleLogin(e));
  }

  // actually handle a click on the login button to handle login events
  handleLogin(e) {
    e.preventDefault(); // we do not want the form to submit!!
    // grab the email/password values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email !== "" && password !== "") { // make sure the email and password are both not blank
      signInWithEmailAndPassword(this.system.authApp.auth, email, password).then(() => { // actually sign in
        window.location.assign("/game.html"); // we can go to the main game now
      }).catch(error => { // error handling
        window.alert(error);
      });
    }
  }
}

new Login();