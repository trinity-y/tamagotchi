// each NPC requires: mapid, dialogue in an array, and then the left and top position of the speech bubble
// the interact() function will be called on npc click, and the speak(msg) function can display a message or cycle through the default dialogue if msg is empty
class Npc {
  constructor(mapId, dialogue = ["hi i'm an npc", "2", "3"], left, top, speechBubbleSelector=".speechBubble", speechBubbleTextSelector=".speechBubbleText") {
    this.mapId = mapId;
    this.bindNpcClick(this.mapId);
    this.currentlyInteracting = false;
    this.dialogue = dialogue;
    this.dialogueCounter = 0;


    // html elements
    this.speechBubble = document.querySelector(speechBubbleSelector);
    this.speechBubbleText = document.querySelector(speechBubbleTextSelector);

    this.speechBubble.style.left = left;
    this.speechBubble.style.top = top;
    this.speechBubbleText.style.left = this.incPixel(left, 24);
    this.speechBubbleText.style.top = this.incPixel(top, 0);
  }
  // increases a pixel string value e.g 46px -> 48px
  incPixel(originalPixel, inc) {
    return String(Number(originalPixel.slice(0, -2)) + inc) + "px"; // slices the 'px', converts it to a number, increases, and then appends the 'px' back
  }
  bindNpcClick(mapId) { // given the id of the map, add an event listener for the abstract interact() function to the npc
    const clickArea = document.getElementById(mapId)
    clickArea.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentlyInteracting) {

      } else {
        this.interact();
      }

    })
  }
  getDefaultDialogue() { // cycles through the dialogue in the array. returns the appropriate dialogue
    const dialogue = this.dialogue[this.dialogueCounter]
    if (this.dialogueCounter === this.dialogue.length - 1) {
      this.dialogueCounter = 0;
    } else {
      this.dialogueCounter++;
    }
    return dialogue;
  }
  speak(message = null) { // speak a given message. if nothing is passed, grab from default dialogue
    this.speechBubble.style.visibility = "visible";
    this.speechBubbleText.style.visibility = "visible";
    if (message === null) {
      message = this.getDefaultDialogue();
    }
    this.speechBubbleText.innerText = message;
  }
  interact() {
    throw new Error('abstract method!');
  }

  clearMessage() { // hide the dialogue button
    this.speechBubble.style.visibility = "hidden";
    this.speechBubbleText.style.visibility = "hidden";
    this.currentlyInteracting = false;
  }
}
export { Npc }