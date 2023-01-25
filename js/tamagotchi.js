import { System } from '../firebase/system.js'
import { get, update, ref, remove } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';

class Inventory {
  #allItems;
  inventoryCount;
  #inventory;
  inInventory;
  constructor(system) {
    this.system = system;
    // all 'item' objects, so that ids/names can be converted
    this.#allItems = { "fishing_house": ["fishing_house", 0, "background"], "default_house": ["default_house", 0, "background"], "animal_house": ["animal_house", 600, "background"], "bunny_house": ["bunny_house", 700, "background"], "egg_house": ["egg_house", 600, "background"], "forest_house": ["forest_house", 200, "background"], "ghost_house": ["ghost_house", 800, "background"], "mushroom_house": ["mushroom_house", 200, "background"], "sea_castle_house": ["sea_castle_house", 600, "background"], "weezer_house": ["weezer_house", 1000, "background"], "slush": ["slush", 50, "food"], "noodles": ["noodles", 200, "food"], "sushi": ["sushi", 200, "food"], "donuts":["donuts", 100, "food"], "ice_cream":["donuts", 100, "food"], "tea":["tea", 50, "food"], "before_the_line": ["before_the_line", 100, "music"], "buddy_holly": ["buddy_holly", 100, "music"], "drop_it": ["drop_it", 100, "music"], "fragile": ["fragile", 100, "music"], "my_name_is_jonas": ["my_name_is_jonas", 100, "music"], "no_other_one": ["no_other_one", 100, "music"], "pink_triangle": ["pink_triangle", 100, "music"], "special_girl": ["special_girl", 100, "music"], "city_girl":["city_girl", 100, "music"], "strawberry_house":["strawberry_house", 400, "background"], "cake_house":["cake_house", 700, "background"], "burger":["burger", 200, "food"] }
    this.inventoryCount = 1; // for uid, starts at 1 bc of default_house

    this.inventoryMenuElement = document.getElementById('inventoryMenu');

  }

  getInventoryCount(cb = () => { }, uid = this.system.authApp.user.uid) { // update field with how many items are in the inventory
    get(ref(this.system.db, `users/${uid}`)).then((snapshot) => {
      this.inventoryCount = snapshot.val()['inventoryCount'];
      cb();
    }).catch((error) => {
      console.log(error)
    })
  }
  getInventory() { // getter returns an array of item arrays [name, price, type] ?????????????
    return this.#inventory;
  }
  incrementCounter(cb = () => { }) { // increment the invetory count in the object and in the database
    this.inventoryCount++;
    update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), {
      inventoryCount: this.inventoryCount,
    }).then(() => { cb(); })
  }
  updateInventory(cb = () => { }) { // updates field with db inventory
    get(ref(this.system.db, `users/${this.system.authApp.user.uid}/inventory`)).then((snapshot) => {
      this.#inventory = snapshot.val();
      cb(this.#inventory);
    }).catch((error) => {
      console.log(error)
    })
  }
  removeFishInventory(fishId) { // remove fish from inventory
    remove(ref(this.system.db, `users/${this.system.authApp.user.uid}/inventory/fish/${fishId}`))
  }

  removeInventory(id, cb = () => { }) { // remove item from inventory
    const type = this.getItemObjectFromId(id)[2] // get the item array from the id, so that we can access the appropriate part of the db
    remove(ref(this.system.db, `users/${this.system.authApp.user.uid}/inventory/${type}/${id}`)).then(() => { cb(); }).catch((error)=>{console.log(error)})
  }
  getItemObjectFromName(name) { // return the object [name, price, type] from a name
    return this.#allItems[name]
  }
  getItemObjectFromId(id) { // gets item object from id (which is the key in the db)
    return this.#allItems[id.slice(0, -4)]
  }
  getUID(name, digits) { // because you can't have multiple of the same key. digits sets the number of digits at the end of the uid
    // there's a counter for each type, search for the section in inventory and increment the last entry
    this.updateInventory();
    return name + "0".repeat(digits - this.inventoryCount.toString().length) + this.inventoryCount.toString(); // name + trailing zeros + uid
  }

  addInventory(item, uid = this.system.authApp.user.uid) { // uploads item to inventory, remember item = [name, price, type]
    update(ref(this.system.db, `users/${uid}/inventory/${item[2]}`), {
      [this.getUID(item[0], 4)]: item,
    }).then((snapshot) => {
      this.incrementCounter();
    }).catch((error) => {
      window.alert(error);
    })
  }


  itemInInventory(item, cb = ()=>{}) { // returns true if the item is in the inventory, performs cb if item is in inventory
    this.updateInventory((inventory) => {
      if (Object.keys(inventory).includes(item[2])) { // checks if the category key exists (then, you wouldnt own any of that type)
        for (let itemFromInventory of Object.keys(inventory[item[2]])) { // loops through all items int hat category
          if (itemFromInventory.slice(0, -4) == item[0]) { // checks if the name is equal to thename of the item
            this.inInventory = true; // it's therefore in the inventory
            cb();
            return true;
          }
        }
      } else {console.log('none of this item type exist');}
      this.inInventory = false;
      return false;
    })
  }

  idToString(id) { // e.g bunny_house --> bunny house should it be capitalized 
    return id.split('_').join(' ')
  }
  
  getFishHtmlElement(fishId, fishInfo) { // gets the html element for the fish element
    return `<div id='${fishId}' class="item" style="background-image:url(../assets/fishing/fish/${fishInfo.src})">
                <h1 class='text inventoryMenuContent'>${fishInfo.name}</h1>
              </div>`
  }
  getHtmlElement(id) {  // generates an html element for an item array
    // html element
    const item = this.getItemObjectFromId(id)
    if (item[2] === 'food') {
      return `<div id='${id}' class="item" style="background-image:url(../assets/food/${item[0]}-1.png);">
                <p class='text inventoryMenuContent'>${this.idToString(item[0])}</p>
              </div>`
    } else if (item[2] === 'music') {

      return `<div id='${id}' class="item" style="background-image:url(../assets/songs/music_disc.png)">
                <p class='text inventoryMenuContent'>${this.idToString(item[0])}</p>
              </div>`
    } else if (item[2] === 'background') {

      return `<div id='${id}' class="item" style="background-image:url(../assets/background/${item[0]}.png)">
                <p class='text inventoryMenuContent'>${this.idToString(item[0])}</p>
              </div>`
    }
  }


}

class Tamagotchi {
  #balance;
  #health;
  #hunger;
  #ownerName;
  #giftAlert;
  level;
  constructor(balance, hunger, health, level) {
    this.system = new System(this);
    this.tamagotchiElement = document.getElementById('tamagotchi');
    this.inventory = new Inventory(this.system);
  }
  
  loadStats(cb = () => { }) { // downloads all the stats from the db
    this.dbToStat('balance', () => { // nested calllbacks so they all run one after the other
      this.dbToStat('hunger', () => {
        this.dbToStat('health', () => {
          this.dbToStat('level', () => {
            cb();
          });
        });
      });
    });
  }
  // update the db with the object's stat
  statToDb(stat, cb = () => { }) {
    let statValue;
    switch (stat) { // get the appropriate value to upload to the db
      case 'balance':
        statValue = this.#balance;
        cb();
        break;
      case 'health':
        statValue = this.#health;
        stat = 'hp' // oops
        cb();
        break;
      case 'hunger':
        statValue = this.#hunger;
        cb();
        break;
      case 'level':
        statValue = this.level;
        cb();
        break;

    }

    update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), { // upload to database
      [stat]: statValue,
    }).then(() => { }).catch((error) => { window.alert(error) })

  }
  changeBal(change) { // change balance and modify the balance ui element 
    this.#balance += change;
    this.updateBalanceCounter();
    return this.#balance;
  }
  updateBalanceCounter() { // modify balance counter element
    try {
      document.getElementById('balance').innerHTML = this.#balance;
    } catch {
      console.log('could not find the balance update');
    }
  }
  changeHealth(inc) { // changes health by inc capped at 100
    if (this.#health + inc > 100) {
      this.#health = 100;
    } else {
      this.#health += inc;
    }
    this.updateHealthCounter();
    return this.#health;
  }

  changeHunger(inc) { // changes hunger by inc capped at 100
    if (this.#hunger + inc > 100) {
      this.#hunger = 100;
    } else {
      this.#hunger += inc;
    }
    this.updateHungerCounter();
    return this.#hunger;
  }

  bindPet() { // bind petting the tamaogtchi on tamagotchi click
    this.tamagotchiElement.addEventListener('click', () => {
      this.anim('pet');
      this.changeHealth(2); // heals
      this.statToDb('health', () => {
        this.clearAnim(2000); // clears anim
      });
    })
  }
  updateHealthCounter() { // modify balance counter element
    try {
      document.getElementById('health').innerHTML = this.#health;
    } catch {
      console.log('could not find the health update');
    }
  }

  updateHungerCounter() { // modify balance counter element
    try {
      document.getElementById('hunger').innerHTML = this.#hunger;
    } catch {
      console.log('could not find the hunger update');
    }
  }

  dbToStat(stat, cb = () => { }) {  // updates the field with the data from the database, then calls the passed callback function
    let statValue;
    // gets the value of the desired stat
    get(ref(this.system.db, `users/${this.system.authApp.user.uid}`)).then((snapshot) => {
      statValue = snapshot.val();
      switch (stat) {
        case 'balance':
          this.#balance = statValue.balance;
        case 'health':
          this.#health = statValue.hp;
        case 'hunger':
          this.#hunger = statValue.hunger;
        case 'level':
          this.level = statValue.level;

      }

    }).then(() => {
      cb();
    })
    // sets the value of the desired stat
    switch (stat) {
      case 'balance':
        return this.#balance;
      case 'health':
        return this.#health;
      case 'hunger':
        return this.#hunger;
      case 'level':
        return this.level;
    }


  }
  clearAnim(time) { // resets the tamagotchi character to the idle animation after a passed time
    setTimeout(() => {
      try {
        this.tamagotchiElement.src = `../assets/character/${this.level}/idle.gif`;
        const foodElement = document.getElementById('food');
        foodElement.style.visibility = 'hidden';
      } catch { }
    }, time);
  }
  anim(anim) { // sets the tamagotchi charcater to passed animation
    this.tamagotchiElement.src = `../assets/character/${this.level}/${anim}.gif`;
  }

  eat(id) { // increases hunger on the tamagotchi and on the db, balance, animates the tamagotchi and food item
    // sync level for animations
    const item = this.inventory.getItemObjectFromId(id);
    this.dbToStat('level', () => {
      this.anim('eat');
      this.dbToStat('hunger', () => { // download from database
        // add hunger
        this.changeHunger(Math.floor(item[1] / 10));


        this.statToDb('hunger', () => { // upload to database
          this.clearAnim(3000); // clear animation after 3000 ms  
        })

        // this.changeBal(100) // add to money
        // this.statToDb('balance', () => { // upload to database
          // animation bit
          const foodElement = document.getElementById('food');
          foodElement.style.visibility = 'visible';
          foodElement.src = `./assets/food/${item[0]}.gif`;
          foodElement.classList.add('movingFood')
          this.inventory.removeInventory(id); // needs id not item

          // wait and then trigger gif

        // })
      })
    });
  }
  performGiftAlert(uid=this.system.authApp.user.uid) {
    get(ref(this.system.db, `users/${uid}`)).then((snapshot) => {
      this.#giftAlert= snapshot.val().giftAlert;
    }).catch((error) => {
      console.log(error)
    }).then(()=>{
      if (this.#giftAlert) {
        window.alert(`${this.#giftAlert[1]} has gifted you ${this.#giftAlert[0]}! go check it out in your inventory!`);
        this.updateGiftAlert(null, uid); // in this case, the current user is the recipient of the 'null'
      }
    })
  }
  getOwnerName(uid=this.system.authApp.user.uid, cb=()=>{}) {
    get(ref(this.system.db, `users/${uid}`)).then((snapshot) => {
      this.#ownerName = snapshot.val().ownerName;
    }).catch((error) => {
      console.log(error)
    }).then(()=>{cb(this.#ownerName)})
  }
  updateGiftAlert(giftName=null, recipientUid=null) {
    if (giftName) {
      this.getOwnerName(this.system.authApp.user.uid, (ownerName)=>{
        update(ref(this.system.db, `users/${recipientUid}`), { // upload to database
        giftAlert: [giftName, ownerName],
        }).then(() => { }).catch((error) => { window.alert(error) })
      })
    } else {
      this.getOwnerName(recipientUid, (ownerName)=>{
        update(ref(this.system.db, `users/${recipientUid}`), { // upload to database
        giftAlert: null,
        }).then(() => { }).catch((error) => { window.alert(error) })
      })
    }
    
    
  }
}

export { Tamagotchi }