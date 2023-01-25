// signup.js

// imports
import { System } from "../firebase/system.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { set, ref } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { lakeLootTable, riverLootTable, oceanLootTable, caveLootTable } from '../assets/fishing/fish/lootTables.js';

// main Signup class
class Signup {
  // initialize the loot table
  lootTable = [lakeLootTable, riverLootTable, oceanLootTable, caveLootTable];

  constructor() {
    this.system = new System(); // instantiate the System class
    this.bindRegister(); // bind the register button
  }

  // add the event listener to the register button to handle signups
  bindRegister() {
    const register = document.getElementById("register");
    register.addEventListener('submit', (e) => this.handleRegister(e));
  }

  // actually register an account
  handleRegister(e) {
    e.preventDefault(); // we do not want the form to submit

    // grab values from the html document
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const ownerName = document.getElementById("owner-name").value;
    const petName = document.getElementById("pet-name").value;

    // if any of these fields are blank we cannot continue onto the next step!
    if (ownerName !== "" && petName !== "" && email !== "" && password !== "") {
      createUserWithEmailAndPassword(this.system.authApp.auth, email, password).then((userCredential) => { // actually sign up, this only runs if successful
        const uid = userCredential.user.uid;
        set(ref(this.system.db, `users/${uid}`), { // add the database entry for the user
          petName: petName,
          ownerName: ownerName,
          ownerEmail: email,
          hp: 100,
          hunger: 100,
          level: 1,
          updateCount: 0,
          balance: 0,
          alive: true,
          canLevelUp: true,
          inventoryCount: 1,
          currentBackground: 'default_house',
          inventory: {
            'background': {
              'default_house0000': ["default_house", 0, "background"]
            },
            'food': {

            },
            'music': {

            }
          },
          times: {
            lastLogout: new Date().getTime(),
            lastUpdate: new Date().getTime(),
            creationTime: new Date().getTime()
          },
          friends: [],
          uniqueFish: 0,
          bigFish: 0,
          perfectFish: 0
        }).then(() => {
          window.location.assign("/game.html"); // take you to the main game now that you've signed up
        }).catch(error => { // error handling
          window.alert(error);
        })

        // add loot tables to the database for fishing!
        for (let j = 0; j < this.lootTable.length; j++) {
          for (let i = 0; i < this.lootTable[j].length; i++) {
            set(ref(this.system.db, `users/${this.system.authApp.user.uid}/journal/${this.lootTable[j][i].name}`), {
              name: this.lootTable[j][i].name,
              caught: false,
              size: 0
            }).then().catch((error) => {
              window.alert(error);
            })
          }
        }
      }).catch(error => { // only runs if an error occurs
        window.alert(error);
      })
    }
  }
}

new Signup();