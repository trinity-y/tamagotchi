import { Tamagotchi } from "./tamagotchi.js";
import { update, get, ref } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

class Game {
  #inventoryIsOpen;
  constructor() {
    this.tamagotchi = new Tamagotchi();
    this.#inventoryIsOpen = false;

    try { // only going to run if on house. binds house buttons and plays house music.
      this.bindInventory();
      this.bindInventoryTabs();
      this.playMusic(['default']);
      this.tamagotchi.bindPet();
      this.bindGift();
      setTimeout(() => { this.loadCurrentBackground();this.displayUid();this.tamagotchi.performGiftAlert(); }, 500) // 
    } catch {
    }


  }
  exitMenu() {
    console.log('trying to exit menu')
    // hides menu
    this.tamagotchi.inventory.inventoryMenuElement.style.visibility = 'hidden';
    // deletes all items from the container
    const container = document.getElementById('inventoryItemContainer')
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
    this.#inventoryIsOpen = false;
  }

  playMusic(item) { // plays music from an item
    document.getElementById('houseMusic').src = `../assets/songs/${item[0]}.mp3`
  }
  loadCurrentBackground() { // loads the current background from the database
    get(ref(this.tamagotchi.system.db, `users/${this.tamagotchi.system.authApp.user.uid}`)).then((snapshot) => {
      document.getElementById('location-image').src = `../assets/background/${snapshot.val().currentBackground}.png`;
    }).catch((error) => {
      console.log(error)
    })
  }
  changeBackground(item) { // changes the current background and saves it to the database
    document.getElementById('location-image').src = `../assets/background/${item[0]}.png`
    update(ref(this.tamagotchi.system.db, `users/${this.tamagotchi.system.authApp.user.uid}`), {
      currentBackground: item[0],
    })
  }

  displayInventory(filter, divId, mode = "consume") { // displays all items that belong to the filter, adding into the div divId. mode determines the click event: consume consumes the clicked item, gift gifts the clicked item after bringing up a popup menu after asking for the owner name
    if (this.#inventoryIsOpen) {
    } else {
      this.tamagotchi.inventory.inventoryMenuElement.style.visibility = 'visible';
      this.tamagotchi.inventory.updateInventory((inventory) => {
        let itemsToDisplay = { "all": [], "food": [], "music": [], "background": [] }
        if (inventory.background) {
          for (let item of Object.keys(inventory.background)) { // loop through all backgrounds in the inventory
            itemsToDisplay.all.push(item);
            itemsToDisplay.background.push(item);
          }
        }
        if (inventory.food) {
          for (let item of Object.keys(inventory.food)) { // loop through all food items in the inventory
            itemsToDisplay.all.push(item);
            itemsToDisplay.food.push(item);
          }
        }
        if (inventory.music) {
          for (let item of Object.keys(inventory.music)) { // loop through all music items in the inventory
            itemsToDisplay.all.push(item);
            itemsToDisplay.music.push(item);
          }
        }
        itemsToDisplay = itemsToDisplay[filter]
        for (const item of itemsToDisplay) { // actually display items
          document.getElementById(divId).innerHTML += this.tamagotchi.inventory.getHtmlElement(item);
        }
        for (const id of itemsToDisplay) {
          if (mode === "consume") { // add click events to items that can be consumed.
            this.addConsumeClick(id)
          }
          else { // gift
            this.addGiftClick(id)
          }
        } 
      })
      this.#inventoryIsOpen = true;
    }
  }

  // bind the inventory button to the inventory
  bindInventory() {
    document.getElementById('openInventoryButton').addEventListener('click', () => {
      this.displayInventory("all", "inventoryItemContainer");
    })
    document.getElementById('exit-button').addEventListener('click', () => {
      this.exitMenu();
    });
  }

  // bind the inventory tabs to filter based on item type
  bindInventoryTabs() {
    document.getElementById('inventoryTabAll').addEventListener('click', () => { // adds event listeners for each tab
      this.exitMenu(); // close the menu to get rid of all of the items
      this.displayInventory("all", "inventoryItemContainer"); // re-opens the menu with the correct filter
    })
    document.getElementById('inventoryTabBackground').addEventListener('click', () => {
      this.exitMenu();
      this.displayInventory("background", "inventoryItemContainer");
    })
    document.getElementById('inventoryTabFood').addEventListener('click', () => {
      this.exitMenu();
      this.displayInventory("food", "inventoryItemContainer");
    })
    document.getElementById('inventoryTabMusic').addEventListener('click', () => {
      this.exitMenu();
      this.displayInventory("music", "inventoryItemContainer");
    })
  }

  addConsumeClick(id) { // adds the appropriate click action to an item in an inventory
    const element = document.getElementById(id);
    const item = this.tamagotchi.inventory.getItemObjectFromId(id); // gets item [name, price, type] from the uid in the database
    switch (item[2]) { // based on type, call the appropriate function
      case 'background':
        element.addEventListener('click', () => { // add the event listener to the elemnt
          this.changeBackground(item); // call the changeBackground function on background click
        })
        break;
      case 'food':
        element.addEventListener('click', () => {
          this.tamagotchi.eat(id);
          this.exitMenu();
        })
        break;
      case 'music':
        element.addEventListener('click', () => {
          this.playMusic(item);
        })
        break;
    }
  }
  // currently unfinished
  bindGift() {
    //document.getElementById('giftButton').addEventListener('click', () => { this.gift(this.tamagotchi.system.authApp.user.uid, document.getElementById('giftInput').value, 'noodles0038') })
    document.getElementById('giftButton').addEventListener('click', ()=> {
      this.displayInventory("all", "inventoryItemContainer", "gift");
    })
  }
  displayUid() {
    document.getElementById('uidDisplay').innerText = `user uid: ${this.tamagotchi.system.authApp.user.uid}`
  }
  addGiftClick(id) {
    const element = document.getElementById(id);

    element.addEventListener('click', ()=> {
      this.gift(this.tamagotchi.system.authApp.user.uid, document.getElementById('giftInput').value, id)
    })
  }
  gift(gifterUid, recipientUid, itemId) { // gifts one item from one user to another user
    const item = this.tamagotchi.inventory.getItemObjectFromId(itemId)
    // remove from gifter
    // this.tamagotchi.inventory.performIfIdInInventory(itemId, () => {
    //   this.tamagotchi.inventory.removeInventory(itemId, () => {

    //     // add to recipient
    //     this.tamagotchi.inventory.addInventory(item, recipientUid);
    //   }
    //   );
    // })
    this.tamagotchi.inventory.itemInInventory(item, ()=> {
      // remove from gifter
      this.tamagotchi.inventory.removeInventory(itemId, () => {
        //this.changeBackground(["default_house", 0, "background"])
        // add to recipient
        this.exitMenu();
        console.log(recipientUid);
        this.tamagotchi.inventory.addInventory(item, recipientUid);
        this.tamagotchi.updateGiftAlert(this.tamagotchi.inventory.idToString(item[0]), recipientUid);
      });      
    });
  }
}

const game = new Game();

export { Game, game }