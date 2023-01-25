// system.js

// imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getDatabase, get, ref } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";
import { Auth } from "./auth.js";

// main System class
class System {
  // takes in a tamagotchi object as an argument
  constructor(tamagotchi) {
    // set up the app, database, and authentication
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    this.authApp = new Auth();

    // ran when the authentication state is changed
    // here we check if the user is alive or logged in at all
    // we also load tamagotchi statistics here
    // if the user is dead, force them to delete their account
    // so that they can create a new one
    // if the user is not dead, allow them to pass
    // if the user is not logged in, force the user to index.html
    onAuthStateChanged(this.authApp.auth, (user) => {
      if (user) {
        this.authApp.user = user;
        // fetch user information
        const userFetch = get(ref(this.db, `users/${this.authApp.user.uid}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              if (userData.alive) { // check if user is alive
                if (tamagotchi) { // check if user has a tamagotchi
                  console.log(tamagotchi);
                  tamagotchi.loadStats(() => { // if they do, load statistics for the tamagotchi
                    tamagotchi.updateBalanceCounter();
                    tamagotchi.updateHealthCounter();
                    tamagotchi.updateHungerCounter();
                    tamagotchi.inventory.getInventoryCount();
                    tamagotchi.clearAnim(0);
                  });
                }
              } else { // if the user isn't alive
                if (window.location.pathname === "/dead.html") { // fix annoying bug where it loops
                  console.log("already dead");
                } else { // force them to dead.html
                  window.location.assign("./dead.html");
                }
              }
            }
          })
          .catch((error) => {
            window.alert(error);
          })
      }
      else { // they are not logged in
        this.authApp.user = null;
        if (window.location.pathname !== "/login.html" && window.location.pathname !== "/signup.html") { // make sure they're not already in the process of signing up or logging in
          window.location.assign("./index.html"); // force them to log in or sign up before experiencing the game
        }
      }
    })
  }
}

export { System };