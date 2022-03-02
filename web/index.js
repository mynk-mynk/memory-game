
// Constants

const gameField = document.querySelector('.game-field');
const memoryGame = document.querySelector('.memory-game');
const cards = document.querySelectorAll('.memory-card');
const gameBtn = document.querySelector('.game-btn');
const score = document.querySelector('.score-table');
const cross = document.querySelector('.close-btn');


// Variables for functions

let oneCardFlipped = false;
let lockBoard = true;
let firstCard, secondCard;
let moves;
let date;
let start;
let end;
let currentResult;


// Open all cards before game, start new game 

cards.forEach(card => card.classList.add('flip'));

function newGame() {
    hideScore();
    score.classList.remove('active');
    moves = 0;
    date = new Date();
    start = new Date().getTime();
    setTimeout(() => {
        cards.forEach(card => card.classList.remove('flip'));
        shuffle();
        lockBoard = false;
    }, 900)
}

gameBtn.addEventListener('click', newGame);

function shuffle() {
    cards.forEach(card => card.style.order = Math.floor(Math.random() * 12));
}


// Flipping cards, game logic

function flipCard(card) {
    
    let flippedCards;
     
    if (lockBoard) return;
    if (card === firstCard) return;

    card.classList.add('flip');
    moves++;

    
    if (!oneCardFlipped) {
        firstCard = card;
        oneCardFlipped = true;
        return;
    }
    
    secondCard = card;
    checkForMatch();
    
    flippedCards = document.querySelectorAll('.flip');
    if (flippedCards.length === cards.length) {
        end = new Date().getTime();
        gameFinish();
    }
}

function openCards() {
    firstCard.removeEventListener('click',  () => flipCard(card));
    secondCard.removeEventListener('click',  () => flipCard(card));
    resetBoard();
}

function closeCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function checkForMatch() {
    if (firstCard.dataset.picture === secondCard.dataset.picture) {
        openCards();
    } else {
        closeCards();
    }
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    [oneCardFlipped, lockBoard] = [false, false];
}

cards.forEach(card => card.addEventListener('click', () => flipCard(card)));


// Game results

function showScore() {
    gameField.classList.add('flip');

    setTimeout (() => {
        memoryGame.style.display = 'none';
    }, 1200);

    gameField.querySelector('.moves').textContent = `Moves: ${moves}`;
    gameField.querySelector('.time').textContent = 'Time: ' + convertTime(end - start);
    currentResult = {
        'date': getDate(date),
        'moves': moves,
        'time': end - start,
    }
    updateLocalStorage();
}

function convertTime(msec) {
    const min = Math.floor((msec)/60000);
    const sec = Math.round((msec - Math.floor((msec)/60000) * 60000)/1000);
    return `${min}:` + ('0' + `${sec}`).slice(-2);
}

function getDate(a) {
    const date = ('0'+a.getDate()).slice(-2)+'/'+('0'+(a.getMonth()+1)).slice(-2)+'/'+a.getFullYear();
    const time = ('0'+a.getHours()).slice(-2) + ":" + ('0'+a.getMinutes()).slice(-2) + ":" + ('0'+a.getSeconds()).slice(-2);
    return date + ' ' + time;
}

function hideScore() {
    memoryGame.style.display = 'flex';
    gameField.classList.remove('flip');
}

cross.addEventListener('click', hideScore);

function showBestScore() {
    score.classList.toggle('active');
}

score.querySelector('h1').addEventListener('click', showBestScore);


// Game finish

function finalAnimation() {
    const flippedCards = document.querySelectorAll('.flip');
    flippedCards.forEach(card => card.style.animation = 'wiggle 2s linear');
    setTimeout(() => {
        flippedCards.forEach(card => card.style.animation = '');
    }, 1000);
}

function gameFinish() {
    lockBoard = true;
    finalAnimation();
    setTimeout(() => {
        showScore();
    }, 1200);
}


// Best games

function updateLocalStorage() {
    let games = localStorage.getItem('games') === null ? [] : JSON.parse(localStorage.getItem('games'));
    games.push(currentResult);
    games.sort((a, b) => {
        return a.moves > b.moves ? 1 : a.moves === b.moves ? (a.time > b.time ? 1 : -1) : -1;
    });
    games = games.slice(0, 10)
    updateBestResults(games);
    localStorage.setItem('games', JSON.stringify(games));
}

function updateBestResults(arr) {
    const table = score.querySelector('table');
    table.querySelectorAll('tr').forEach(el => el.classList.remove('current-result'));
    table.querySelectorAll('td').forEach(el => el.textContent = '');

    for (let i = 0; i < arr.length; i++) {
        table.rows[i + 1].cells[0].textContent = arr[i].date;
        table.rows[i + 1].cells[1].textContent = arr[i].moves;
        table.rows[i + 1].cells[2].textContent = convertTime(arr[i].time);

        if (arr[i].date === currentResult.date) table.rows[i + 1].classList.add('current-result');
    }
}