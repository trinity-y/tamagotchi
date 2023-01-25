import { Npc } from './npc.js';
import { lakeLootTable, riverLootTable, oceanLootTable, caveLootTable } from '../assets/fishing/fish/lootTables.js';
import { get, update, ref } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js';
import { game } from './game.js'

class Fishing {
  location = "lake";
  #activeLootTable = lakeLootTable;
  currentFish;  
  fishSize;
  #fishEnd = 120;
  #rodCast = false;
  #alert = document.getElementById("fishingAlert");
  #fishingRod = document.getElementById("fishingRod");
  #backgroundMusic = document.getElementById('fishingMusic')
  #progressHeight = -10;
  #playerY = 101; 
  #playerHeight = 30;
  #fishY = 120; 
  #fishHeight = 10;
  #canvas = document.createElement('canvas');
  #mouseDown = false;
  #alertVisible = false;
  #perfectFish = true;

  constructor() {

    this.system = game.tamagotchi.system;

    this.displayTamagotchi();
    this.bindLocation();
    this.bindFishing();
    this.reward2();

  }


  displayTamagotchi(){
    console.log(game.tamagotchi.level)
    let tamagotchi = document.getElementById('tamagotchi');
    tamagotchi.src = `../assets/character/${game.tamagotchi.level}/idle.gif`
  }
  
  bindLocation() { //binds buttons to switch background image
    const lake = document.getElementById('lake');
    const ocean = document.getElementById('ocean');
    const river = document.getElementById('river');
    const cave = document.getElementById('cave');


    lake.addEventListener("click", () => {
      this.setLootTable(lakeLootTable)
      this.changeLocation("lake")});
    ocean.addEventListener("click", () => {
      this.setLootTable(oceanLootTable);
      this.changeLocation("ocean")});
    river.addEventListener("click", () => {
      this.setLootTable(riverLootTable);
      this.changeLocation("river")});
    cave.addEventListener("click", () => {
      this.setLootTable(caveLootTable);
      this.changeLocation("cave")});
  }

  changeLocation(setting) { //change background image based on location
    if (this.#rodCast === false) {

      const location = document.getElementById("location-image");

      location.src = `assets/fishing/${setting}.png`

      this.#backgroundMusic.src = `../assets/fishing/music/${setting}-music.mp3`;

      this.location = setting;

      //hide messages and fish
      fishingNpc.speechBubble.style.visibility = "hidden";
      fishingNpc.speechBubbleText.style.visibility = "hidden";
      this.clearFish();
      this.#useMap();
    }
  }

  setLootTable(lootTable){ //select appropriate loot table
    this.#activeLootTable = lootTable;
  }

  #useMap() { //uses fishing teacher map if the location is set to lake
    const location = document.getElementById("location-image")
    if (this.location === 'lake') {
      location.setAttribute("usemap", "fishing-map");
    } else {
      
      location.setAttribute("usemap", null);
    }
  }

  bindFishing() { //binds fishing when click on background image
    const gameBoard = document.getElementById('location-image');

    gameBoard.addEventListener("click", () => {
      //clears screen
      fishingNpc.clearMessage(); 
      this.clearFish();

      if (this.#rodCast === false) { //cast rod if not already cast
        this.castRod();
      } else { //reels in if rod is cast
        console.log('reel in');
        clearTimeout(this.fishTimer); 
        clearTimeout(this.waiting);
        if (this.#alertVisible === true) { //if alert is active, plays minigame
          this.displayCanvas();
          this.playing = setInterval(() => { this.playMinigame() }, 20);
        }
        else { //if alert is not active, remove fishing rod
          this.#rodCast = false;
          this.#fishingRod.style.visibility = "hidden"
        }
        this.removeAlert();
      }
    });
  }

  clearFish() { //clear fish image
    const fishImg = document.getElementById("fish");
    fishImg.style.visibility = "hidden";
    const textBox = document.getElementById("textBox");
    textBox.style.visibility = "hidden";
    const textBoxMessage = document.getElementById("fishMessage");
    textBoxMessage.style.visibility = "hidden";
  }

  castRod() { //display fishing rod for a random amount of time
    console.log("start");
    this.#rodCast = true;
    this.#fishingRod.style.visibility = "visible"
    const time = Math.floor(Math.random() * 7000 + 3000);
    this.#waitForFish(time);
  }

  #waitForFish(time) { //wait out the random time to display alert
    this.fishTimer = setTimeout(() => {
      if (this.#rodCast === true) {
        this.chooseFish();
        this.fishAlert();
        this.#waitForCatch();
      }
    }, time);
  }

  chooseFish() { //choose a random fish from the loot table
    let randNum = Math.floor(Math.random() * 101);
    let sumRarity = 0;
    for (let i = 0; i < this.#activeLootTable.length; i++) {
      sumRarity += this.#activeLootTable[i].rarity;
      if (randNum <= sumRarity) {
        this.currentFish = this.#activeLootTable[i];
        break;
      }
    }
  }

  fishAlert() { // display alert

    this.#alert.style.visibility = "visible";

    this.#alertVisible = true;
    console.log("alert");

  }

  #waitForCatch() { // wait 2 seconds for the player to catch the fish
    this.waiting = setTimeout(() => {
      this.removeAlert();
      this.#rodCast = false;
      this.#fishingRod.style.visibility = "hidden"
      console.log("nice one, idiot")
      if (this.location === "lake") {
        fishingNpc.interact("nice one, idiot");
      }
    }, 2000)
  }

  removeAlert() { // removes alert
    this.#alert.style.visibility = "hidden";
    this.#alertVisible = false;
  }

  displayCanvas() { // display canvas for game
    document.getElementById('canvasDiv').appendChild(this.#canvas)
    this.#canvas.setAttribute("id", "fishingCanvas");
    this.#canvas.setAttribute("style", "image-rendering: pixelated;");
  }

  removeCanvas() { // remove canvas
    document.getElementById('canvasDiv').removeChild(this.#canvas)
  }

  drawCanvas() { // draw all elements on canvas

    const ctx = this.#canvas.getContext("2d");

    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    const interfaceImg = document.getElementById("fishingMeter");
    const fishImg = document.getElementById("fishImg");


    ctx.fillStyle = 'rgb(0,255,0)';
    ctx.drawImage(interfaceImg, 95, 14, 100, 125);
    ctx.fillRect(175, 131, 5, this.#progressHeight);
    ctx.globalAlpha = 0.7;
    ctx.fillRect(146, this.#playerY, 16, this.#playerHeight);
    ctx.globalAlpha = 1;
    ctx.drawImage(fishImg, 127, this.#fishY, 50, this.#fishHeight);

  }

  playMinigame() { // plays minigame


    this.drawCanvas();
    this.movePlayer();
    this.moveFish();
    this.updateProgress();
    if (this.#rodCast === false) {
      this.#resetValues();
      clearInterval(this.playing);
    }

  }

  movePlayer() { //move player based on mouse state

    this.#canvas.onmousedown = () => { this.#mouseDown = true; }
    this.#canvas.onmouseup = () => { this.#mouseDown = false; }


    if (this.#mouseDown === true && this.#playerY >= 22) {
      this.#playerY -= 1.5;
    } else if (this.#mouseDown === false && this.#playerY <= 100) {
      this.#playerY += 1.5;
    }
  }

  moveFish() { // moves the fish towards fishEnd

    if (this.#fishY <= this.#fishEnd + this.currentFish.speed && this.#fishY >= this.#fishEnd - this.currentFish.speed) {
      this.chooseFishEnd();
    }
    else if (this.#fishY > this.#fishEnd) {
      this.#fishY -= this.currentFish.speed;
    }
    else if (this.#fishY < this.#fishEnd) {
      this.#fishY += this.currentFish.speed;
    }
  }

  chooseFishEnd() { // chooses a random spot for 
    this.#fishEnd = Math.floor(Math.random() * 99 + 21);
  }

  updateProgress() { // updates the progress bar on side

    if (this.#playerY < (this.#fishY + this.#fishHeight) && (this.#playerY + this.#playerHeight) > this.#fishY) {
      this.#progressHeight--;
    } else {
      this.#progressHeight++;
      this.#perfectFish = false;
    }
    if (this.#progressHeight >= 0) { // check if the progress is a fail
      console.log("you lose bucko");
      if (this.location === "lake") {
        fishingNpc.interact("you lose bucko");
      }
      this.#rodCast = false;
      this.#fishingRod.style.visibility = "hidden"
    }
    else if (this.#progressHeight <= -112) { // check if the progress is a win

      if (this.#perfectFish === true) { // check if fish is perfect
        this.chooseFishLength(10);
        console.log("perfect!! proud of you bud! <3");
        if (this.location === "lake") {
          fishingNpc.interact("perfect!! proud of you bud! <3");
        }
      } else {
        this.chooseFishLength(0);
        console.log("nice job kid");
        if (this.location === "lake") {
          fishingNpc.interact("nice job kid");
        }
      }

      
      console.log(this.currentFish.name);
      this.drawFish(); 

      // update database
      game.tamagotchi.inventory.getInventoryCount(() => {
        let count = game.tamagotchi.inventory.inventoryCount;
        game.tamagotchi.inventory.incrementCounter(() => {
          this.updateInventory(count);
          this.updateJournal();
        }
        );
      })

      //reset values
      this.#rodCast = false;
      this.#fishingRod.style.visibility = "hidden"
    }
  }

  chooseFishLength(bonus = 0) { // choose a random fish size
    this.fishSize = Math.floor(Math.random() * 101 + 100 + bonus) / 10;
    console.log(this.fishSize);
  }

  drawFish() { //displays fish after catching it
    const fishImg = document.getElementById("fish");
    fishImg.setAttribute('src', `../assets/fishing/fish/${this.currentFish.src}`)
    fishImg.style.width = `${6 * this.fishSize}px`;
    fishImg.style.height = `${5 * this.fishSize}px`;
    fishImg.style.visibility = "visible";

    let sizeMessage = "";

    const textBox = document.getElementById("textBox");
    textBox.style.visibility = "visible";

    const textBoxMessage = document.getElementById("fishMessage");
    // display a message based on size of fish
    if (this.fishSize < 13) { 
      sizeMessage = "it's only";
    }
    else if (this.fishSize < 17) {
      sizeMessage = "it's";
    }
    else if (this.fishSize < 20) {
      sizeMessage = "a whole";
    }
    else if (this.fishSize < 21) {
      sizeMessage = "it's a whopping";
    }
    else {
      sizeMessage = "a perfect";
    }

   
   
      textBoxMessage.innerText = `you caught a ${this.currentFish.name} \n ${sizeMessage} ${this.fishSize} inches`;
 

    
    textBoxMessage.style.visibility = "visible";
  }

  updateInventory(count) { //adds fish to inventory
    let fish = {
      name: this.currentFish.name,
      size: this.fishSize,
      price: Math.round(this.fishSize * this.currentFish.value),
      src: this.currentFish.src
    }
    update(ref(this.system.db, `users/${this.system.authApp.user.uid}/inventory/fish`), {
      [fish.name + count]: fish,
    }).then(() => {
      console.log("added");
    }).catch((error) => {
      window.alert(error);
    })
  }

  updateJournal() { //adds fish to journal

    get(ref(this.system.db, `users/${this.system.authApp.user.uid}/journal/${this.currentFish.name}`)).then((snapshot) => {
      let fish = snapshot.val();
      this.updateFishingStats(fish);
      if (this.fishSize > fish.size){
        console.log('new record');
      }
    
      update(ref(this.system.db, `users/${this.system.authApp.user.uid}/journal/${this.currentFish.name}`), {
        caught: true,
        size: Math.max(this.fishSize, fish.size)
      }).then(() => {
        console.log("journal updated");
      }).catch((error) => {
        window.alert(error);
      })
    })


  }

  updateFishingStats(fish){ //updates players overall fishing stats
    if(fish.caught === false){ //if new fish, update unique fish stat
      get(ref(this.system.db, `users/${this.system.authApp.user.uid}`)).then((snapshot) => {
        let fishNum = snapshot.val().uniqueFish;
        update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), {
        uniqueFish: fishNum + 1
      }).catch((error) => {window.alert(error)})
        if(fishNum === 43){
          this.reward1();
        }
      }).catch((error) => {
        window.alert(error)
      }) 
    }

    if(this.fishSize >=20 && fish.size < 20){ //if fish is over 20 inches (and this is first time catching one this size), update big fish stat
      get(ref(this.system.db, `users/${this.system.authApp.user.uid}`)).then((snapshot) => {
        let bigFishNum = snapshot.val().bigFish;
        update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), {
        bigFish: bigFishNum + 1
      }).catch((error) => {window.alert(error)})
      }).catch((error) => {
        window.alert(error)
      }) 
    }

    if(this.fishSize === 21 && fish.size < 21){ //if fish is 21 inches (and this is first time catching one this size), update perfect fish stat
      get(ref(this.system.db, `users/${this.system.authApp.user.uid}`)).then((snapshot) => {
        let perfectFishNum = snapshot.val().perfectFish;
        update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), {
        perfectFish: perfectFishNum + 1
      }).catch((error) => {window.alert(error)})
        if(perfectFishNum === 43){
          this.reward3();
        }
      }).catch((error) => {
        window.alert(error)
      }) 
    }
    
  }

  #resetValues() { // resets values
    this.removeCanvas();
    this.#progressHeight = -10;
    this.#playerY = 106;
    this.#playerHeight = 25;
    this.#fishY = 120;
    this.#mouseDown = false;
    this.#perfectFish = true;
  }

  reward1(){ //adds unique background to inventory as reward for catching all the fish
      game.tamagotchi.inventory.addInventory(["fishing_house", 0, "background"])
    
  }

  reward2(){ //gives player gold fishing rod if they have caught every fish at a size of over 20 inches
    setTimeout(()=>{get(ref(this.system.db, `users/${this.system.authApp.user.uid}`)).then((snapshot) => {
        let bigFishNum = snapshot.val().bigFish;
        if(bigFishNum === 44){
          this.#fishingRod.src = `../assets/fishing/fishingRodGold.png`
        }
    }).catch((error) => {window.alert(error)})}, 500)
    
  }
  
  reward3(){ //turns player into a fish for catching the biggest possible fish for every fish (very difficult, technically possible)
       update(ref(this.system.db, `users/${this.system.authApp.user.uid}`), {
        level: 4,
        canLevelUp: false
      }).catch((error)=>{window.alert(error)})
    console.log('it has been done');
    if (this.location === "lake") {
          fishingNpc.interact("it has been done");
        }

   
  }

}





class FishingNpc extends Npc { //fishing teacher
  constructor(mapId, dialogue, left, top) {
    super(mapId, dialogue, left, top);
  }

  interact(message = "FISH!!!! i <3 fish xoxo") { //display message from NPC
    console.log('fish');
    this.speak(message);
  }
}

const fishingNpc = new FishingNpc('fishingMap', ['hi im the fisher guy'], "400px", "260px");

const fishing = new Fishing();