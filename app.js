"use strict";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Assign an empty deck array
let deck = [];

function startGame() {
  //Create new Deck object, create new starting hands, re-enable hit button
  deck = new Deck();
  Player.startingHand();
  Dealer.startingHand();

  document.getElementById("hit").disabled = false;

  document.getElementById("reset").hidden = true;
  document.getElementById("hit").hidden = false;
  document.getElementById("stay").hidden = false;

  document.getElementById("results").textContent = "";
}

window.addEventListener("load", function () {
  startGame();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Deck {
  constructor() {
    this.deck = [];
    this.reset();
    this.shuffle();
  }
  reset() {
    this.deck = [];

    const suit = ["C", "D", "H", "S"]; //C-Clubs D-Diamonds H-Hearts S-Spades
    const value = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

    for (let i = 0; i < suit.length; i++) {
      for (let j = 0; j < value.length; j++) {
        this.deck.push(`${suit[i]}-${value[j]}`); //Creates an array with values like ["C-A", "C-2"], etc.
      }
    }
  }
  shuffle() {
    let deck = this.deck;
    let deckLength = deck.length;
    let randomCardIndex;

    //Selects a random card within the array, then removes that index from the next iteration
    //Creates a non-biased shuffle
    while (deckLength) {
      randomCardIndex = Math.floor(Math.random() * deckLength);
      deckLength--;
      [deck[deckLength], deck[randomCardIndex]] = [
        deck[randomCardIndex],
        deck[deckLength],
      ];
    }
    return this;
  }
  deal() {
    return this.deck.pop(); //Deals a card off the top of the deck, by choosing the last array value
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let Player = {
  //Player object
  value: 0, //Point value of current hand
  currentHand: [],

  cardElement: document.getElementById("your-cards"), //Element for populating card .png's
  pointElement: document.getElementById("your-sum"), //Element for displaying player score

  startingHand() {
    this.currentHand = []; //Reset current hand
    this.value = 0; //Reset hand pont-value
    this.cardElement.innerHTML = ""; //Reset image element
    this.pointElement.innerHTML = ""; //Reset point score element

    for (let i = 0; i < 2; i++) {
      //Deal two cards
      let card = new Image();
      let cardValue = deck.deal();

      this.currentHand.push(cardValue); //Add card to current hand
      card.src = `cards/${cardValue}.png`; //Set image source to the string value of dealt card
      this.cardElement.appendChild(card); //Add card to the card element
    }
    this.value = updateValue(this);
    this.pointElement.textContent = this.value;
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let Dealer = {
  //Dealer Object
  value: 0, //Point value of current Dealer hand including hidden card
  hiddenValue: 0, //Point value of hidden card
  currentHand: [],
  revealedCard: "", //Image value of the hidden card

  cardElement: document.getElementById("dealer-cards"), //Element for populating card images
  pointElement: document.getElementById("dealer-sum"), //Element for updating Dealer score

  startingHand() {
    this.currentHand = []; //Reset current hand
    this.value = 0; //Reset total score
    this.hiddenValue = 0; //Reset hidden card score

    this.cardElement.innerHTML = ""; //Reset both image and score elements
    this.pointElement.innerHTML = "";

    let hiddenCard = new Image();
    let hiddenValue = deck.deal(); //Deal one card

    console.log(hiddenValue);
    this.currentHand.push(hiddenValue); //Push this card to the current hand array
    hiddenCard.src = "cards/BACK.png"; //Create a image src string to call the revealed card later
    this.revealedCard = `cards/${hiddenValue}.png`; //Set card image to cardback
    hiddenCard.setAttribute("id", "hidden-card"); //Set element ID to 'hidden-card' so we can alter the element later
    this.cardElement.appendChild(hiddenCard); //Add card image to element
    hiddenValue = updateValue(this); //updateValue converts hand array componenets to values and adds them together

    let card = new Image(); //Deal one card
    let value = deck.deal();

    this.currentHand.push(value); //Add this one card to the image element and hand array
    card.src = `cards/${value}.png`;
    this.cardElement.appendChild(card);
    value = updateValue(this);

    this.value = value;
    this.pointElement.textContent = value - hiddenValue;

    if (this.value === 21) {
      postResult("lose");
    }
  },

  revealCard() {
    let card = document.getElementById("hidden-card");
    card.src = this.revealedCard;
    this.pointElement.textContent = this.value;
  },
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let updateValue = function (player) {
  let hand = player.currentHand;
  player.value = 0;
  let value = 0;

  for (let i = 0; i < hand.length; i++) {
    let currentCard = hand[i].slice(2);
    currentCard = convertValue(currentCard, player);
    value += currentCard;
  }

  return value;
};

let convertValue = function (card, player) {
  let value = player.value;
  if (card === "K" || card === "Q" || card === "J") {
    value += 10;
  } else if (card === "A") {
    if (value + 11 > 21) {
      value += 1;
    } else {
      value += 11;
    }
  } else {
    value = Number(card);
  }
  return value;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const hit = document.getElementById("hit");

hit.addEventListener("click", function () {
  let card = new Image();
  let value = deck.deal();

  Player.currentHand.push(value);
  card.src = `cards/${value}.png`;
  Player.cardElement.appendChild(card);
  value = updateValue(Player);
  Player.pointElement.innerHTML = value;
  Player.value = value;
  if (value > 21) {
    checkWinner();
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const stay = document.getElementById("stay");

stay.addEventListener("click", function () {
  document.getElementById("hit").disabled = true;

  Dealer.revealCard();
  let value = Dealer.value;
  let hand = Dealer.currentHand;

  while (value < 17) {
    let card = new Image();
    let cardValue = deck.deal();
    hand.push(cardValue);
    card.src = `cards/${cardValue}.png`;
    Dealer.cardElement.appendChild(card);
    value = updateValue(Dealer);
    Dealer.value = value;
  }

  Dealer.pointElement.textContent = value;
  console.log(Dealer.value);
  checkWinner();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let checkWinner = function () {
  let playerValue = Player.value;
  console.log(playerValue);
  let dealerValue = Dealer.value;
  console.log(dealerValue);

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

let postResult = function (result) {
  if (result === "lose") {
    document.getElementById("results").textContent = "BUST";
  } else if (result === "push") {
    document.getElementById("results").textContent = "PUSH";
  } else if (result === "dealer-lose") {
    document.getElementById("results").textContent = "DEALER BUST!";
  } else {
    document.getElementById("results").textContent = "YOU WIN!";
  }

  document.getElementById("reset").hidden = false;
  document.getElementById("hit").hidden = true;
  document.getElementById("stay").hidden = true;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const reset = document.getElementById("reset");

reset.addEventListener("click", function () {
  startGame();
});
