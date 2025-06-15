'use strict';
// Game State
let secretNumber = Math.trunc(Math.random() * 20) + 1;
let score = 20;
let highscore = parseInt(localStorage.getItem('guessGameHighscore')) || 0;
let gameWon = false;

// DOM Elements
const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const message = document.getElementById('message');
const numberDisplay = document.getElementById('numberDisplay');
const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highscore');
const confettiContainer = document.getElementById('confetti');

// Initialize game
highscoreDisplay.textContent = highscore;

// Game functions
function displayMessage(msg, type = '') {
    message.textContent = msg;
    message.className = 'message ' + type;
}

function updateScore(newScore) {
    score = newScore;
    scoreDisplay.textContent = score;
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.className = 'confetti-piece';
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.animationDelay = Math.random() * 3 + 's';
        confettiPiece.style.backgroundColor = [
            '#6f42c1', '#e83e8c', '#20c997', '#ffc107', '#28a745'
        ][Math.floor(Math.random() * 5)];
        confettiContainer.appendChild(confettiPiece);

        // Remove confetti after animation
        setTimeout(() => {
            if (confettiPiece.parentNode) {
                confettiPiece.parentNode.removeChild(confettiPiece);
            }
        }, 3000);
    }
}

function checkGuess() {
    if (gameWon) return;

    const guess = Number(guessInput.value);

    // Validate input
    if (!guess || guess < 1 || guess > 20) {
        displayMessage('🤔 Please enter a number between 1 and 20!', 'cold');
        return;
    }

    // Correct guess
    if (guess === secretNumber) {
        displayMessage('🎉 BOOM! You cracked the code! You\'re a mind reader! 🧠✨', 'success');
        numberDisplay.textContent = secretNumber;
        numberDisplay.classList.add('correct');
        gameWon = true;
        
        // Update highscore
        if (score > highscore) {
            highscore = score;
            highscoreDisplay.textContent = highscore;
            localStorage.setItem('guessGameHighscore', highscore);
            displayMessage('🎉 NEW HIGH SCORE! You\'re absolutely legendary! 👑', 'success');
        }
        
        createConfetti();
        checkBtn.textContent = '🎊 You Won!';
    }
    // Guess too high
    else if (guess > secretNumber) {
        if (score > 1) {
            const diff = guess - secretNumber;
            if (diff <= 3) {
                displayMessage('🔥 So close! Go a bit lower... you\'re burning hot!', 'hot');
            } else {
                displayMessage('❄️ Too high! Chill out and go lower!', 'cold');
            }
            updateScore(score - 1);
        } else {
            displayMessage('💥 Game Over! The number was ' + secretNumber + '. Better luck next time!', 'cold');
            updateScore(0);
            gameWon = true;
        }
    }
    // Guess too low
    else if (guess < secretNumber) {
        if (score > 1) {
            const diff = secretNumber - guess;
            if (diff <= 3) {
                displayMessage('🔥 Almost there! Go a bit higher... you\'re on fire!', 'hot');
            } else {
                displayMessage('❄️ Too low! Aim higher and reach for the stars!', 'cold');
            }
            updateScore(score - 1);
        } else {
            displayMessage('💥 Game Over! The number was ' + secretNumber + '. You\'ll get it next time!', 'cold');
            updateScore(0);
            gameWon = true;
        }
    }

    // Clear input
    guessInput.value = '';
}

function resetGame() {
    secretNumber = Math.trunc(Math.random() * 20) + 1;
    score = 20;
    gameWon = false;
    
    displayMessage('🚀 New game started! What\'s your first guess?', '');
    numberDisplay.textContent = '?';
    numberDisplay.classList.remove('correct');
    updateScore(20);
    guessInput.value = '';
    checkBtn.textContent = '⚡ Check It!';
    
    // Clear any remaining confetti
    confettiContainer.innerHTML = '';
}

// Event Listeners
checkBtn.addEventListener('click', checkGuess);
resetBtn.addEventListener('click', resetGame);

// Enter key support
guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

// Navigation function
function goHome() {
    // For demo purposes, show alert. In real implementation, this would navigate to your portfolio
    alert('🚀 In a real implementation, this would take you back to the theSADTeacher portfolio!');
    // window.location.href = 'index.html'; // Uncomment this line when linking to actual portfolio
}

// Auto-focus input
guessInput.focus();

// Add some personality with random encouragement
const encouragements = [
    "🎯 You've got this! Trust your instincts!",
    "🧠 Think like a computer... but with style!",
    "⚡ Channel your inner code-breaking energy!",
    "🎮 Level up your guessing game!",
    "🚀 Blast off into the number dimension!"
];

// Show random encouragement every 10 seconds if no activity
let encouragementTimer;
function resetEncouragementTimer() {
    clearTimeout(encouragementTimer);
    encouragementTimer = setTimeout(() => {
        if (!gameWon && score === 20) {
            const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
            displayMessage(randomMsg, '');
        }
    }, 10000);
}

guessInput.addEventListener('input', resetEncouragementTimer);
resetEncouragementTimer();

// go home button 
function goHome() {
  window.location.href = "index.html"; // or any home path
}