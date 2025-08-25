// Max grid size is 6x6, so need 18 unique symbols

// TODO: Right now symbols are just numbers -- update with science icons
const symbols = ["🧬", "🧲", "🧪", "🥼", "☕️", "🔬", "🦠", "🧫", "⚡️", "💡", "🔋", "⚛︎", "🔭", "🚀", "🧠", "🌱", "🥽", "🤓"]

availableIndices = [7, 8, 9, 10, 13, 14, 15, 16, 19, 20, 21, 22, 25, 26, 27, 28]
num_pairs = availableIndices.length / 2
const randomSubset = getRandomSubsetIterative(symbols, num_pairs)
const availableCards = shuffleArray([...randomSubset, ...randomSubset])
const indexToCard = {}

for (let i = 0; i < availableIndices.length; i++) {
  indexToCard[availableIndices[i]] = availableCards[i];
}

console.log(indexToCard)


function getRandomSubsetIterative(arr, size) {
  const subset = [];
  const tempArray = [...arr]; // Create a copy

  while (subset.length < size && tempArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    subset.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1); // Remove selected element
  }
  return subset;
}

function shuffleArray(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const board = document.getElementById("game-board")
const message = document.getElementById("message")
let cards = [...symbols, ...symbols]

let flipped = [] // cards currently flipped
let matched = [] // cards currently matched

cards.forEach((symbol, symbolIndex) => {
    const card = document.createElement("div")
    card.classList.add("card");
    card.dataset.symbol = symbol;
    card.textContent = symbolIndex
    card.textContent = ""

    if (availableIndices.includes(symbolIndex)) {
        card.style.backgroundColor = "gainsboro"
        card.style.cursor = "pointer"
    } else {
        card.style.backgroundColor = "darkgrey"
        card.style.cursor = "default"
    }

    card.addEventListener('mouseover', () => {
        if (availableIndices.includes(symbolIndex)) {
            card.style.border = "0.15rem solid black"
        } else {
            card.style.border = "0.15rem solid transparent"
        }
    })

    card.addEventListener('mouseout', () => {
        card.style.border = "0.15rem solid transparent"
    })

    card.addEventListener('click', () => {
        // ignores clicks if already matched/flipped or too many cards open
        if (flipped.length < 2 && !card.classList.contains("flipped") && !matched.includes(card)) {
            card.classList.add("flipped")
            card.textContent = indexToCard[symbolIndex]
            flipped.push(card)
        }
        
        if (flipped.length === 2) {
            // Check for a match
            if (flipped[0].innerText === flipped[1].innerText) {
                matched.push(flipped[0], flipped[1])
                flipped = []
                if (matched.length == availableCards.length) {
                    message.textContent = "Win"
                }
                console.log(matched)
            } else {
                // Not a match, flip it back after a short delay
                setTimeout(() => {
                    flipped.forEach(c => {
                    c.classList.remove("flipped");
                    c.textContent = "";
                    });
                    flipped = [];
                }, 800);
            }
        }
    })
    board.appendChild(card)
});