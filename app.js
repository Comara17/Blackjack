"use strict";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Assign an empty deck array
let deck = [];

function startGame() {
  //Create new Deck object, create new starting hands, re-enable hit and stand button, hide reset button
  deck = new Deck();
  Player.startingHand();
  Dealer.startingHand();

  document.getElementById("hit").disabled = false;
  document.getElementById("reset").hidden = true;
  document.getElementById("hit").hidden = false;
  document.getElementById("stay").hidden = false;
  document.getElementById("results").textContent = "";
}
//Run startGame() on window load
window.addEventListener("load", function () {
  startGame();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Deck {
  //Create deck class, which constructs a deck with reset() and shuffle()
  constructor() {
    this.deck = [];
    this.reset();
    this.shuffle();
  }
  reset() {
    //Empty the current deck array
    this.deck = [];

    //C-Clubs D-Diamonds H-Hearts S-Spades
    const suit = ["C", "D", "H", "S"];

    //A-Ace J-Jack Q-Queen K-King
    const value = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

    //Creates an array with values like ["C-A", "C-2"], etc. This deck is sequential and not shuffled.
    for (let i = 0; i < suit.length; i++) {
      for (let j = 0; j < value.length; j++) {
        this.deck.push(`${suit[i]}-${value[j]}`);
      }
    }
  }
  shuffle() {
    //This is the unsuffled deck created by reset();
    let deck = this.deck;
    let deckLength = deck.length; //51
    let randomCardIndex;

    //Selects a random card within the array, assigns it a new array index, then removes that index from the next iteration
    while (deckLength) {
      //Creates a value between 0 and 51
      randomCardIndex = Math.floor(Math.random() * deckLength--);

      //Last card in array is "S-K", or deck[51]. Set deck[51] equal to deck[random], and set deck[random] to deck[51]
      //deckLength-- removes deck[51] from the next iteration, so deck[50] is randomized next
      [deck[deckLength], deck[randomCardIndex]] = [
        deck[randomCardIndex],
        deck[deckLength],
      ];
    }
    return this;
  }
  deal() {
    //Deals a card off the top of the deck, by choosing the last array value
    return this.deck.pop();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let Player = {
  //Player object

  //Point value of current hand
  value: 0,
  currentHand: [],

  //Element for populating card .png's
  cardElement: document.getElementById("your-cards"),

  //Element for displaying player score
  pointElement: document.getElementById("your-sum"),

  startingHand() {
    //Reset current hand, score-value, image element, score element
    this.currentHand = [];
    this.value = 0;
    this.cardElement.innerHTML = "";
    this.pointElement.innerHTML = "";

    //Deal two cards, and create a new image for each
    for (let i = 0; i < 2; i++) {
      const card = new Image();
      const cardValue = deck.deal();

      //Add card to current hand
      this.currentHand.push(cardValue);

      //Set image source to the string value of dealt card
      card.src = `cards/${cardValue}.png`;

      //Add card to the card element
      this.cardElement.appendChild(card);
    }
    //updateValue resets and reiterates through the currentHand[] to return a total score-value
    this.value = updateValue(this);
    this.pointElement.textContent = this.value;
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let Dealer = {
  //Dealer Object

  //Score value of Dealer currentHand[] including the face-down card
  value: 0,
  currentHand: [],

  //Image value and score-value of the face-down card
  revealedCard: "",
  hiddenValue: 0,

  //Element for populating card images
  cardElement: document.getElementById("dealer-cards"),

  //Element for updating Dealer score
  pointElement: document.getElementById("dealer-sum"),

  startingHand() {
    //Reset current hand, score-value, face-down card score-value, image element, and score element
    this.currentHand = [];
    this.value = 0;
    this.hiddenValue = 0;
    this.cardElement.innerHTML = "";
    this.pointElement.innerHTML = "";

    //Deal one card and create a new image
    const hiddenCard = new Image();
    let hiddenValue = deck.deal();

    //Add value of face-down card to the currentHand and set it's image source to a face-down card
    this.currentHand.push(hiddenValue);
    hiddenCard.src = "cards/BACK.png";

    //Store the image source string of the dealt card to be revealed later
    this.revealedCard = `cards/${hiddenValue}.png`;

    //Set element ID to 'hidden-card' and add face-down card image to image element
    hiddenCard.setAttribute("id", "hidden-card");
    this.cardElement.appendChild(hiddenCard);
    hiddenValue = updateValue(this);

    //Create a new image element, then deal one card
    const card = new Image();
    let value = deck.deal();

    //Add card to current hand, set image source to the string value of dealt card, and dd card to the card element
    this.currentHand.push(value);
    card.src = `cards/${value}.png`;
    this.cardElement.appendChild(card);

    //value represents the total hand value, converted by using updateValue()
    value = updateValue(this);
    this.value = value;

    //The dealer score element should not show the value of the hidden card
    this.pointElement.textContent = value - hiddenValue;

    //This conditional checks for a dealer win on starting hand
    if (this.value === 21 && Player.value < 21) {
      postResult("lose");
    }
  },

  revealCard() {
    //Changes the image source of the face-down card to the revealedCard string, and then updates the score element
    const card = document.getElementById("hidden-card");
    card.src = this.revealedCard;
    this.pointElement.textContent = this.value;
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Resets the target player's total score to zero, then iterates through the target player's hand
let updateValue = function (player) {
  let hand = player.currentHand;
  let value = 0;
  player.value = 0;

  //array.slice is used to remove the suit (ex: "C" or "H") and the hyphen between the suit and value
  for (let i = 0; i < hand.length; i++) {
    let currentCard = hand[i].slice(2);
    currentCard = convertValue(currentCard, value);
    value += currentCard;
  }
  return value;
};

//Checks if a card is a non-integer value (ex. "J" or "K") and assigns it an integer value
let convertValue = function (card, player) {
  let value = player;

  if (card === "K" || card === "Q" || card === "J") {
    value = 10;
  }
  //Aces are evaluated by their value end-result. An ace should not = 11 when score + 11 > 21
  else if (card === "A") {
    if (value + 11 > 21) {
      value = 1;
    } else {
      value = 11;
    }
  } else {
    value = Number(card);
  }
  return value;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Identify the hit button element
const hit = document.getElementById("hit");

hit.addEventListener("click", function () {
  //Create a new image element and deal a new card
  let card = new Image();
  let value = deck.deal();

  //Add card to currentHand[], determine it's image source, and append the image to the card image element
  Player.currentHand.push(value);
  card.src = `cards/${value}.png`;
  Player.cardElement.appendChild(card);

  //updateValue resets the target player's total score to zero, then iterates through the target player's hand
  //Once the new total value has been returned, the score element and Player.value are updated
  value = updateValue(Player);
  Player.pointElement.innerHTML = value;
  Player.value = value;

  //checkWinner() evaluates Player.value and Dealer.value to determine a winner
  if (value > 21) {
    checkWinner();
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Indentify the stay button element
const stay = document.getElementById("stay");

stay.addEventListener("click", function () {
  //Disable the hit button
  document.getElementById("hit").disabled = true;

  //Reveal the face-down card and add it's value to the current hand and Dealer score
  Dealer.revealCard();
  let value = Dealer.value;
  let hand = Dealer.currentHand;

  //By blackjack rules, the Dealer must stand on a soft 17 and hit when score < 17
  while (value < 17) {
    //Create new image and deal a new card
    let card = new Image();
    let cardValue = deck.deal();

    //Add card to currentHand[], determine it's image source, and append the image to the card image element
    hand.push(cardValue);
    card.src = `cards/${cardValue}.png`;
    Dealer.cardElement.appendChild(card);

    //value represents the total hand value, converted by using updateValue()
    value = updateValue(Dealer);
    Dealer.value = value;
  }
  //Update Dealer score element
  Dealer.pointElement.textContent = value;

  //checkWinner() evaluates Player.value and Dealer.value to determine a winner
  checkWinner();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const checkWinner = function () {
  let playerValue = Player.value;
  let dealerValue = Dealer.value;

  //Evaluates Player score and Dealer score to determine a winner
  if (dealerValue === 21 && playerValue < 21) {
    postResult("lose");
  } else if (dealerValue <= 21 && playerValue < dealerValue) {
    postResult("lose");
  } else if (playerValue > 21) {
    postResult("lose");
  } else if (dealerValue === playerValue) {
    postResult("push");
  } else if (dealerValue > 21 && playerValue <= 21) {
    postResult("dealer-bust");
  } else {
    postResult("win");
  }
};

const postResult = function (result) {
  //Updates results element based on result argument
  if (result === "lose") {
    document.getElementById("results").textContent = "BUST";
  } else if (result === "push") {
    document.getElementById("results").textContent = "PUSH";
  } else if (result === "dealer-lose") {
    document.getElementById("results").textContent = "DEALER BUST!";
  } else {
    document.getElementById("results").textContent = "YOU WIN!";
  }

  //Hides the hit and stand buttons, reveals the reset button
  document.getElementById("reset").hidden = false;
  document.getElementById("hit").hidden = true;
  document.getElementById("stay").hidden = true;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Identify the reset button element
const reset = document.getElementById("reset");

reset.addEventListener("click", function () {
  //The reset button starts a new game
  startGame();
});
