import { game } from './game.js';
import { Npc } from './npc.js';
import { System } from '../firebase/system.js';
import { get, ref } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';

class ShopNpc extends Npc {
  constructor(mapId, dialogue, left, top) {
    super(mapId, dialogue, left, top);
    // gets html element
    this.buyButton = document.getElementById("buy-button");
    this.sellButton = document.getElementById("sell-button");
    // manually positions the buy and sell buttons in relation to the speech bubble
    this.buyButton.style.left = this.incPixel(left, 24);
    this.buyButton.style.top = this.incPixel(top, 65);
    this.sellButton.style.left = this.incPixel(left, 76);
    this.sellButton.style.top = this.incPixel(top, 65);
    this.game = game;
  }

  interact() { // speak, and put up the buttons when applicable
    catNpc.clearMessage();
    this.speak()
    if (this.dialogue[this.dialogueCounter + 1] === "would you like to buy or sell?") {
      this.buyButton.style.visibility = "visible";
      this.sellButton.style.visibility = "visible";
    }
  }
}

class CatNpc extends Npc {
  constructor(mapId, dialogue, left, top, speechBubbleSelector, speechBubbleTextSelector) {
    super(mapId, dialogue, left, top, speechBubbleSelector, speechBubbleTextSelector);
  }
  interact() {
    shopNpc.clearMessage();
    shopNpc.buyButton.style.visibility = "hidden";
    shopNpc.sellButton.style.visibility = "hidden";
    this.speak();
  }
}

const shopNpc = new ShopNpc('attendantMap', ["hi! welcome to our shop.", "would you like to buy or sell?"],"250px", "40px" )

const catNpc = new CatNpc('sassyCat', ["*flips hair* i might be too punk rock for you","i'm so fab","i'm not cute, i'm punk rock","black is my colour","hello 911, the wifi went out.","leave me alone","why be normal?","i speak fluent sarcasm","idk, google it","wear something... black.","breaking news: i don't care","day dreamer","can you not","i do what i want, i'm punk rock"], "330px", "40px", '.catBubble', '.catBubbleText')

class Shop { // pass type distribution, an array of the number of stock for each type [background, food] e.g [2, 1] for 2 backgrounds and 1 food item
  // thinking like 100 for your average fish?
  #typeDistribution;
  #forSale;
  constructor(typeDistribution) {
    this.bindBuySell();
    this.bindMenuExit();
    this.shopMenu = document.getElementById('menu');
    this.game = game;
    this.system = new System();
    this.#typeDistribution = typeDistribution;
    this.shopItemContainer = document.querySelector('.shopItemContainer');
    // get the shop items from the db
    const saleFetch = get(ref(this.system.db, 'shop'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          this.#forSale = snapshot.val();
        } else {
          this.#forSale = [];
        }
      })
      .catch((error) => {
        window.alert(error);
        this.#forSale = [];
      });
  }
  exitMenu() {//exits the shop menu
    // hides menu
    this.shopMenu.style.visibility = 'hidden';
    // deletes all items from the container
    while (this.shopItemContainer.lastChild) {
      this.shopItemContainer.removeChild(this.shopItemContainer.lastChild);
    }
  }
  bindMenuExit() {//exits the shop when button clicked
    document.getElementById('exit-button').addEventListener('click', () => this.exitMenu());
  }

  
  purchase(item) { // purchases item
    this.game.tamagotchi.changeBal(item[1] * -1);//decreases the balance appropriately
    this.game.tamagotchi.statToDb('balance');
    this.game.tamagotchi.inventory.addInventory(item)//adds the item to inventory
  }

  attemptPurchase(item) { // tries to purchase. will prevent purchase if there are duplicates, or if the balance is not enough
    console.log(`trying to purchase for user ${this.system.authApp.user.uid}`)
    let bal = this.game.tamagotchi.dbToStat('balance')
    //let canPurchase = true;
    if (bal - item[1] >= 0) {  // if sufficient funds
      this.game.tamagotchi.inventory.itemInInventory(item);
      if (item[2] !== "food") { // if music/bg
        setTimeout(()=>{
        if (!this.game.tamagotchi.inventory.inInventory) { // and there are no other copies
          this.purchase(item) // buy
          
        } else {
          window.alert('you already own this item.') 
        }
        }, 1000)
      } else {
        this.purchase(item)
      }
    } else {
      window.alert('you do not have enough money to purchase this item!')
    }

  }
  bindBuySell() { // bind buy/sell buttons
    document.getElementById('buy-button').addEventListener('click', () => this.buyMenu());
    document.getElementById('sell-button').addEventListener('click', () => this.sellMenu());
  }
  menuPopup() { // display blank menu
    shopNpc.clearMessage();
    shopNpc.buyButton.style.visibility = "hidden";
    shopNpc.sellButton.style.visibility = "hidden";
    this.shopMenu.style.visibility = 'visible';
  }
  sellMenu() { // display sell menu
    this.menuPopup();
    this.game.tamagotchi.inventory.updateInventory((inventory) => { // get an updated inventory
      let fishImg = []; // a list of all fish elements to display
      let currItem;
      for (let item of Object.keys(inventory.fish)) { // for each fish in the inventory
        currItem = this.game.tamagotchi.inventory.getFishHtmlElement(item, inventory.fish[item]) // get the fish html elements
        fishImg.push(currItem); 
        this.shopItemContainer.innerHTML += currItem; // adds the html element to the container
      }

      for (let item of Object.keys(inventory.fish)) { // for each fish in the inventory (separate loops, as the event listeners will get overwritten otherise)
        let element = document.getElementById(item); // the html id is the same as the uid on the db, so there are no id overlaps
        element.addEventListener('click', () => { 
          this.sellFish(item, inventory.fish[item]); // add sell fish on click
        })


      }

    })

  }

  buyMenu() {  // display buy menu
    this.menuPopup(); // display blank container
    let itemCounter = 1; // used to display the proper type, based on the number of each type
    for (const itemName of this.#forSale) { // for every item name (was randomly generated in the node.js)
      const item = this.game.tamagotchi.inventory.getItemObjectFromName(itemName); // get the item array
      if (itemCounter <= this.#typeDistribution[0]) { // if a background
        this.shopItemContainer.innerHTML += // add to the container
          `<div id='${item[0]}' class="shopItem" style="background-image:url(../assets/background/${item[0]}.png)">
          <h1 class='shopMenuContent'>${this.game.tamagotchi.inventory.idToString(item[0])}</h1>
          <div class="price"><img src='../assets/ui/coin.png'><h1 class="shopMenuContent">${item[1]}</h1></div>
        </div>`
      } else if (itemCounter <= this.#typeDistribution[0] + this.#typeDistribution[1]) { // if a food item 
        this.shopItemContainer.innerHTML +=
          `<div id='${item[0]}' class="shopItem" style="background-image:url(../assets/food/${item[0]}-1.png)">
          <h1 class='shopMenuContent'>${this.game.tamagotchi.inventory.idToString(item[0])}</h1>
          <div class="price"><img src='../assets/ui/coin.png'><h1 class="shopMenuContent">${item[1]}</h1></div>
        </div>`
      } else { // if a song
        this.shopItemContainer.innerHTML +=
          `<div id='${item[0]}' class="shopItem" style="background-image:url(../assets/songs/music_disc.png)">
          <h1 class='shopMenuContent'>${this.game.tamagotchi.inventory.idToString(item[0])}</h1>
          <div class="price"><img src='../assets/ui/coin.png'><h1 class="shopMenuContent">${item[1]}</h1></div>
        </div>`
      }
      itemCounter++;
    }
    for (const itemName of this.#forSale) { // for each item name
      const item = this.game.tamagotchi.inventory.getItemObjectFromName(itemName); // get the item array
      document.getElementById(item[0]).addEventListener('click', () => this.attemptPurchase(item)); // add the attempt purchase on click
    }


  }

  sellFish(fishId, fishInfo) { // sells fish by incrementing balance, uploading to db, and then removing th efish from the menu and inventor
    this.game.tamagotchi.changeBal(fishInfo.price) // increments balance by the price f the fish
    this.game.tamagotchi.statToDb('balance', () => { // uploads to db
      this.game.tamagotchi.inventory.removeFishInventory(fishId); // removes the fish form the inventory
      this.exitMenu(); // refreshes the menu by exiting and then re-displaying
      this.sellMenu();
    })

  }

}
const shop = new Shop([1, 1, 1])