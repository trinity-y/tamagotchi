import { lakeLootTable, riverLootTable, oceanLootTable, caveLootTable } from "../assets/fishing/fish/lootTables.js";
import { get, ref } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { game } from "./game.js";

class FishingJournal {

  #lake = document.getElementById("lake");
  #river = document.getElementById("river");
  #ocean = document.getElementById("ocean");
  #cave = document.getElementById("cave");
  #back = document.querySelectorAll('.back');
  #page1 = document.getElementById("page1");
  #page0 = document.getElementById("page0");
  #page2 = document.getElementById("page2");
  #page3 = document.getElementById("page3");
  #page4 = document.getElementById("page4");
  #currentPage;

  constructor() {
    this.system = game.tamagotchi.system;

    this.updateFishCounter();
    this.bindPageChange();
    this.drawFishPages();
  }

  bindPageChange() { // bind buttons for different pages
    this.#lake.addEventListener("click", () => {
      this.#page0.style.visibility = "hidden";
      this.#page1.style.visibility = "visible";
      this.#currentPage = this.#page1;
      this.drawFishPages(lakeLootTable);
    });

    this.#river.addEventListener("click", () => {
      this.#page0.style.visibility = "hidden";
      this.#page2.style.visibility = "visible";
      this.#currentPage = this.#page2;
      this.drawFishPages(riverLootTable);
    });

    this.#ocean.addEventListener("click", () => {
      this.#page0.style.visibility = "hidden";
      this.#page3.style.visibility = "visible";
      this.#currentPage = this.#page3;
      this.drawFishPages(oceanLootTable);
    });

    this.#cave.addEventListener("click", () => {
      this.#page0.style.visibility = "hidden";
      this.#page4.style.visibility = "visible";
      this.#currentPage = this.#page4;
      this.drawFishPages(caveLootTable);
    });

    for (let page in this.#back) { // bind all the back buttons
      this.#back[page].addEventListener("click", () => {
        this.#page0.style.visibility = "visible";
        let pageDiv = document.getElementById(`page${(Number(page) + 1).toString()}`)
        pageDiv.style.visibility = "hidden";
        this.#currentPage = this.#page0;

        fishImgDiv1.innerHTML = "";
        fishImgDiv2.innerHTML = "";
        fishImgDiv3.innerHTML = "";
        fishImgDiv4.innerHTML = "";
      })
    }
  }

  drawFishPages(lootTable) { // draw the specific pages
    let div;
    let fishImg;
    let fishName;

    for (let i = 0; i < lootTable.length; i++) { // draw each fish in page
      get(ref(this.system.db, `users/${this.system.authApp.user.uid}/journal/${lootTable[i].name}`)).then((snapshot) => {
        let fish = snapshot.val();


        div = document.createElement("div");

        // get correct page div based on which loot table you're looking at
        if (lootTable === lakeLootTable) {
          fishImgDiv1.appendChild(div);
        }
        else if (lootTable === riverLootTable) {
          fishImgDiv2.appendChild(div);
        }
        else if (lootTable === oceanLootTable) {
          fishImgDiv3.appendChild(div);
        }
        else if (lootTable === caveLootTable) {
          fishImgDiv4.appendChild(div);
        }


        // creates elements and adds them to a div
        fishImg = document.createElement("img");
        fishName = document.createElement("p");

        fishImg.src = `../assets/fishing/fish/${lootTable[i].src}`;
        fishImg.classList.add("fishImg");

        fishName.classList.add("fishName");

        div.appendChild(fishImg);
        div.appendChild(fishName);

        if (fish.caught === false) { // if the fish hasen't been caught, image is greyscale, and name is question marks
          fishImg.style.filter = "grayscale(1)";
          fishName.innerText = "???";
        } else {
          fishName.innerText = `${fish.name}`;

          // if the fish has been caught, create new page with information on the fish
          fishImg.addEventListener("click", () => {
            this.expandFishPage(fish, lootTable[i]);
          })
        }

      }).then(() => {
        console.log("good");
      }).catch((error) => {
        window.alert(error);
      })
    }
  }

  expandFishPage(fishJournal, fish) { // draw new page when clicked on a fish
    let star;
    if(this.#currentPage === this.#page1){
      star = document.getElementById(`star1`);
    }
    else if(this.#currentPage === this.#page2){
      star = document.getElementById(`star2`);
    }
    else if(this.#currentPage === this.#page3){
      star = document.getElementById(`star3`);
    }
    else if(this.#currentPage === this.#page4){
      star = document.getElementById(`star4`);
    }
    this.#currentPage.style.visibility = "hidden";
    const fishPage = document.getElementById(`${this.#currentPage.id}Fish`);
    const back = document.getElementById(`${this.#currentPage.id}BackFish`);
    const img = document.getElementById(`${this.#currentPage.id}Img`);
    const text = document.getElementById(`${this.#currentPage.id}Text`);


    img.src = `../assets/fishing/fish/${fish.src}`

    if (fishJournal.size === 21) {
      star.setAttribute('class', "fa-solid fa-star");
      star.style.visibility = "visible";
    }
    else if (fishJournal.size >= 20) {
      star.setAttribute('class', "fa-regular fa-star");
      star.style.visibility = "visible";
    }

    text.innerText = `name: ${fish.name} \n biggest caught: ${fishJournal.size} in.\n rarity: ${fish.rarity}%`;

    fishPage.style.visibility = "visible";

    back.addEventListener("click", () => this.bindFishBack(fishPage))

  }

  bindFishBack(fishPage) { // bind back on fish page
    fishPage.style.visibility = "hidden";
    this.#currentPage.style.visibility = "visible";
    let star;
    if(this.#currentPage === this.#page1){
      star = document.getElementById(`star1`);
    }
    else if(this.#currentPage === this.#page2){
      star = document.getElementById(`star2`);
    }
    else if(this.#currentPage === this.#page3){
      star = document.getElementById(`star3`);
    }
    else if(this.#currentPage === this.#page4){
      star = document.getElementById(`star4`);
    }
    star.style.visibility = 'hidden';
  }

  updateFishCounter() { // modify fish counter element
    setTimeout(() => {
      get(ref(this.system.db, `users/${this.system.authApp.user.uid}/uniqueFish`))
        .then((snapshot) => {
          let fishCaught = snapshot.val();
          const fishText = document.getElementById("fishCaught");
          if (fishCaught === 44) {
            fishText.innerText = `${fishCaught}★`
          }
          else {
            fishText.innerText = `${fishCaught}`;
          }
        })
        .catch((error) => {
          window.alert(error);
        })
    }, 500)

  }
}

const fishingJournal = new FishingJournal();

export { FishingJournal, fishingJournal }