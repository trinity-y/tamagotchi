// time-logger.js

// imports
import { game } from "./game.js";
import { get, update, ref } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

// main TimeLogger class
class TimeLogger {
  constructor() {
    this.system = game.tamagotchi.system; // take the system from the game instance
    window.setInterval(() => this.update(), 5000); // update the database every 5 seconds
  }

  // update the database
  update() {
    const userFetch = get(ref(this.system.db, `users/${this.system.authApp.user.uid}`)) // get the user information to edt
      .then((snapshot) => {
        if (snapshot.exists()) {
          const user = snapshot.val(); // save user information
          user.times.lastLogout = new Date().getTime(); // edit the last logout time
          // ^ this updates last logout every 5 seconds so that if the tab is closed or the user improperly logs off, a time within 5 seconds of accuracy is saved as the last logout time and can be used for updating health and other statistics in the node app
          update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), user) // actually update the user entry in the database
            .then(() => {
              console.log("updated successfully");
            })
            .catch((error) => { // error handling
              window.alert(error);
            })
        }
      })
      .catch((error) => { // even more error handling
        window.alert(error);
      })
  }
}

new TimeLogger(); // instantiate the class
