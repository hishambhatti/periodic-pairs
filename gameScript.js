const rootStyles = getComputedStyle(document.documentElement);

// Title Screen
const selector = document.getElementById("grid-selector");

// Indices corresponding to cards that are chosen for the gameboard
let availableIndices = new Set([7, 8, 9, 10, 13, 14, 15, 16, 19, 20, 21, 22, 25, 26, 27, 28]);

// Adds each card in a 6x6 grid
for (let i = 0; i < 36; i++) {
  const card = document.createElement("div");
  card.classList.add("selector-tile");

  function updateCards() {
        if (availableIndices.has(i)) {
            card.style.backgroundColor = rootStyles.getPropertyValue('--card-back-color')
        } else {
            card.style.backgroundColor = rootStyles.getPropertyValue('--unavailable-card-color')
        }
    }

  updateCards()

  // Swaps card in our available set if clicked
  card.addEventListener("click", () => {
    if (availableIndices.has(i)) {
        availableIndices.delete(i)
    } else {
        availableIndices.add(i)
    }
    updateCards()
  })

    // Card grows larger and in front when hovering over it
    card.addEventListener('mouseover', () => {
        card.style.scale = 1.15
        card.style.zIndex = 1
    })

    card.addEventListener('mouseout', () => {
        card.style.scale = 1
        card.style.zIndex = 0
    })

  selector.appendChild(card);
}

evenAlert = document.getElementById("alert")
evenAlert.style.visibility = "hidden"

// Start button for game
document.getElementById("start-game").addEventListener("click", () => {
    // Prevents invalid boards: no cards selected or odd number
    if (availableIndices.size === 0) {
        evenAlert.textContent = "Too easy! Select at least 2 tiles."
        evenAlert.style.visibility = "visible"
        return;
    }
    if (availableIndices.size % 2 !== 0) {
        evenAlert.textContent = "Please select an even number of tiles!"
        evenAlert.style.visibility = "visible"
        return;
    }
  
  // Hide setup, show game
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  input = [...availableIndices].sort()
  initGame(input);
});

// Game Screen
function initGame(availableIndices) {
    // Max grid size is 6x6, so need 18 unique symbols
    const symbols = ["🧬", "🧲", "🧪", "🥼", "☕️", "🔬", "🦠", "🧫", "⚡️", "⚙️", "🔋", "⚛︎", "🔭", "🚀", "🧠", "🌱", "🥽", "🤓"]

    // Selects random symbols and randomizes them amongst the cards
    num_pairs = availableIndices.length / 2
    const randomSubset = getRandomSubsetIterative(symbols, num_pairs)
    const availableCards = shuffleArray([...randomSubset, ...randomSubset])
    const indexToCard = {} // index of card (0-35) --> symbol (e.g. ⚙️)

    for (let i = 0; i < availableIndices.length; i++) {
    indexToCard[availableIndices[i]] = availableCards[i];
    }

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

    // Initializes the timer
    let seconds = 0
    let minutes = 0
    const timerDisplay = document.getElementById("time")
    let timerInterval;

    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval)
        }
        resetTimer()
        timerInterval = setInterval(updateTimer, 1000)
    }

    function updateTimer() {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }

        // Format the time for display with leading zeros
        const formattedSeconds = String(seconds).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');

        timerDisplay.textContent = `Time: ${formattedMinutes}:${formattedSeconds}`;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTimer();
        seconds = 0;
        minutes = 0;
        hours = 0;
        timerDisplay.textContent = "Time: 00:00";
    }

    startTimer()

    const board = document.getElementById("game-board")
    let cards = [...symbols, ...symbols]

    let flipped = [] // Cards currently flipped
    let matched = [] // Cards currently matched

    let num_moves = 0

    let disableClick = false // Prevents clicks at certain times (e.g. when card is being flipped over)

    const moves = document.getElementById("moves")
    moves.textContent = `Moves: ${num_moves}`

    cards.forEach((symbol, symbolIndex) => {
        const card = document.createElement("div")
        card.classList.add("card");
        card.dataset.symbol = symbol;

        // Front (emoji side)
        const front = document.createElement("div");
        front.classList.add("card-face", "card-front");
        front.textContent = indexToCard[symbolIndex];

        // Back (hidden side)
        const back = document.createElement("div");
        back.classList.add("card-face", "card-back");
        back.textContent = "";

        card.appendChild(front);
        card.appendChild(back);

        // Cards that have been chosen in this gameboard are lighter than those unavailable
        if (availableIndices.includes(symbolIndex)) {
            back.style.backgroundColor = rootStyles.getPropertyValue('--card-back-color')
        } else {
            back.style.backgroundColor = rootStyles.getPropertyValue('--unavailable-card-color')
        }

        // Adds a border and pointer when hover over an available card
        card.addEventListener('mouseover', () => {
            if (availableIndices.includes(symbolIndex) && !matched.includes(card) && !flipped.includes(card) && !disableClick) {
                back.style.borderColor = rootStyles.getPropertyValue('--border-color')
                card.style.cursor = "pointer"
            } else {
                card.style.cursor = "default"
            }
        })

        card.addEventListener('mouseout', () => {
            back.style.borderColor = "transparent"
        })

        card.addEventListener('click', () => {
            // Ignores clicks if already matched/flipped or too many cards open or disableClick set
            if (flipped.length < 2 && !card.classList.contains("flipped") && !matched.includes(card) && availableIndices.includes(symbolIndex) && !disableClick) {
                card.classList.add("flipped")
                flipped.push(card)
            }
            
            if (flipped.length === 2 && !disableClick) {
                num_moves++
                moves.textContent = `Moves: ${num_moves}`

                if (flipped[0].innerText === flipped[1].innerText) {
                    // Match! Clear flipped
                    matched.push(flipped[0], flipped[1])
                    flipped = []
                    if (matched.length == availableCards.length) {
                        // Win! Cut timer and start win overlay
                        stopTimer()
                        setTimeout(() => {
                            document.body.classList.add("win-active")
                            const win = document.getElementById("win-text")
                            win.innerHTML = `Congrats! 🏆 <br> You matched all pairs in ${num_moves} ${num_moves == 1 ? "move" : "moves"} <br> It took you ${minutes == 0 ? "" : (minutes == 1 ? "1 minute" : minutes + " minutes")} ${minutes != 0 && seconds != 0 ? " and " : ""} ${seconds == 1 ? "1 second" : (seconds == 0 && minutes != 0 ? "" : seconds + " seconds")} `
                        }, 800);
                    }
                    console.log(matched)
                } else {
                    // Not a match, flip it back after a short delay
                    disableClick = true
                    setTimeout(() => {
                        flipped.forEach(c => {
                        c.classList.remove("flipped");
                        });
                        flipped = [];
                        disableClick = false
                    }, 800);
                }
            }
        })

        board.appendChild(card)
    });

    document.getElementById("play-again").addEventListener("click", () => {
        window.location.reload();
    });
}