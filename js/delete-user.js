// delete-user.js

// imports
import { game } from "./game.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

// main UserDeleter class
class UserDeleter {
  // in the constructor we need to assign the system variable to use the same app/db/authApp system
  constructor() {
    this.system = game.tamagotchi.system;
  }

  // delete the user data
  deleteData() {
    // to do this we'll assign the user data to null
    const updates = {};
    updates["/users/" + this.system.authApp.user.uid] = null;
    update(ref(this.system.db), updates)
      .then(() => {
        console.log("i reeeallllly hope it deleted the user data.");
      })
      .catch((error) => {
        window.alert(error);
        console.log("oopsie daisy there seems to have been an error");
      })
    // once we deleted the data from the database, let's delete the user itself
    this.system.authApp.deleteUser();
  }
}

const deleter = new UserDeleter(); // instantiate an instance of the class

// bind the delete function to the button on dead.html
document.getElementById("delete-button").addEventListener("click", (e) => deleter.deleteData());