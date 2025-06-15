'use strict';

// Game state
let scores, currentScore, activePlayer, playing;

// DOM elements
const player0El = document.getElementById('player--0');
const player1El = document.getElementById('player--1');
const score0El = document.getElementById('score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');
const name0El = document.getElementById('name--0');
const name1El = document.getElementById('name--1');

const diceEl = document.getElementById('dice');
const btnNew = document.getElementById('btn-new');
const btnRoll = document.getElementById('btn-roll');
const btnHold = document.getElementById('btn-hold');

const winnerModal = document.getElementById('winner-modal');
const winnerNameEl = document.getElementById('winner-name');

// Dice faces configuration
const diceFaces = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
};

// Sound effects (using Web Audio API for modern appeal)
const playSound = (frequency, duration = 100) => {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }
};

// Initialize game
const init = () => {
    scores = [0, 0];
    currentScore = 0;
    activePlayer = 0;
    playing = true;

    // Reset scores display
    score0El.textContent = '0';
    score1El.textContent = '0';
    current0El.textContent = '0';
    current1El.textContent = '0';

    // Reset player names
    name0El.textContent = 'Player 1';
    name1El.textContent = 'Player 2';

    // Hide dice and winner modal
    diceEl.classList.add('hidden');
    winnerModal.classList.add('hidden');

    // Reset player states
    player0El.classList.remove('player--winner');
    player1El.classList.remove('player--winner');
    player0El.classList.add('player--active');
    player1El.classList.remove('player--active');

    // Update player status
    updatePlayerStatus();
    
    // Play start sound
    playSound(440, 150);
};

// Update player status indicators
const updatePlayerStatus = () => {
    const status0 = player0El.querySelector('.player-status');
    const status1 = player1El.querySelector('.player-status');
    
    if (!playing) return;
    
    if (activePlayer === 0) {
        status0.textContent = 'ROLLING';
        status1.textContent = 'WAITING';
    } else {
        status0.textContent = 'WAITING';
        status1.textContent = 'ROLLING';
    }
};

// Switch player with smooth animations
const switchPlayer = () => {
    // Reset current score
    document.getElementById(`current--${activePlayer}`).textContent = '0';
    currentScore = 0;
    
    // Switch active player
    activePlayer = activePlayer === 0 ? 1 : 0;
    
    // Update UI
    player0El.classList.toggle('player--active');
    player1El.classList.toggle('player--active');
    
    // Update status
    updatePlayerStatus();
    
    // Play switch sound
    playSound(330, 100);
};

// Animate dice roll
const animateDiceRoll = (finalValue) => {
    const diceNumber = diceEl.querySelector('.dice-number');
    diceEl.classList.add('rolling');
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        diceNumber.textContent = diceFaces[randomValue];
        rollCount++;
        
        if (rollCount >= 10) {
            clearInterval(rollInterval);
            diceNumber.textContent = diceFaces[finalValue];
            diceEl.classList.remove('rolling');
        }
    }, 50);
};

// Add number animation
const animateScore = (element, newValue) => {
    const currentValue = parseInt(element.textContent);
    const increment = newValue > currentValue ? 1 : -1;
    const steps = Math.abs(newValue - currentValue);
    let step = 0;
    
    const animation = setInterval(() => {
        if (step >= steps) {
            clearInterval(animation);
            element.textContent = newValue;
            return;
        }
        
        element.textContent = currentValue + (increment * step);
        step++;
    }, 30);
};

// Show winner modal
const showWinner = (playerName) => {
    winnerNameEl.textContent = playerName;
    winnerModal.classList.remove('hidden');
    
    // Play winner sound sequence
    setTimeout(() => playSound(523, 200), 0);
    setTimeout(() => playSound(659, 200), 200);
    setTimeout(() => playSound(784, 300), 400);
};

// Roll dice functionality
btnRoll.addEventListener('click', () => {
    if (!playing) return;
    
    // Generate random dice roll
    const dice = Math.trunc(Math.random() * 6) + 1;
    
    // Show and animate dice
    diceEl.classList.remove('hidden');
    animateDiceRoll(dice);
    
    // Play roll sound
    playSound(200 + dice * 50, 200);
    
    // Check for rolled 1
    if (dice !== 1) {
        // Add dice to current score
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent = currentScore;
        
        // Add subtle success feedback
        const currentScoreEl = document.querySelector(`#player--${activePlayer} .current-score`);
        currentScoreEl.style.transform = 'scale(1.05)';
        setTimeout(() => {
            currentScoreEl.style.transform = 'scale(1)';
        }, 150);
        
    } else {
        // Play fail sound
        playSound(150, 400);
        
        // Add visual feedback for rolling 1
        const playerEl = document.getElementById(`player--${activePlayer}`);
        playerEl.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            playerEl.style.animation = '';
        }, 500);
        
        // Switch to next player after delay
        setTimeout(() => {
            switchPlayer();
        }, 1000);
    }
});

// Hold score functionality
btnHold.addEventListener('click', () => {
    if (!playing) return;
    
    // Add current score to active player's total
    scores[activePlayer] += currentScore;
    
    // Animate score update
    const scoreEl = document.getElementById(`score--${activePlayer}`);
    animateScore(scoreEl, scores[activePlayer]);
    
    // Play hold sound
    playSound(400, 250);
    
    // Check if player wins
    if (scores[activePlayer] >= 100) {
        // End game
        playing = false;
        diceEl.classList.add('hidden');
        
        // Add winner styling
        const winnerEl = document.getElementById(`player--${activePlayer}`);
        winnerEl.classList.add('player--winner');
        winnerEl.classList.remove('player--active');
        
        // Update status
        const winnerStatus = winnerEl.querySelector('.player-status');
        winnerStatus.textContent = 'WINNER!';
        winnerStatus.style.color = 'var(--success)';
        
        // Show winner modal
        const winnerName = document.getElementById(`name--${activePlayer}`).textContent;
        setTimeout(() => showWinner(winnerName), 500);
        
    } else {
        // Switch to next player
        switchPlayer();
    }
});

// New game functionality
const newGame = () => {
    init();
};

btnNew.addEventListener('click', newGame);

// Add CSS shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Add keyboard controls for better UX
document.addEventListener('keydown', (e) => {
    if (!playing) return;
    
    switch(e.key.toLowerCase()) {
        case 'r':
        case ' ':
            btnRoll.click();
            break;
        case 'h':
        case 'enter':
            btnHold.click();
            break;
        case 'n':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                newGame();
            }
            break;
    }
});

// Add button press effects
const addButtonEffect = (button) => {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'translateY(2px) scale(0.98)';
    });
    
    button.addEventListener('mouseup', () => {
        button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
};

// Apply button effects
[btnNew, btnRoll, btnHold].forEach(addButtonEffect);

// Add loading animation
document.addEventListener('DOMContentLoaded', () => {
    // Add stagger animation to elements
    const elements = document.querySelectorAll('.player, .center-section');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});

// Initialize game when page loads
init();

// Add mobile touch feedback
const addTouchFeedback = () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        });
    });
};

// Apply touch feedback for mobile
if ('ontouchstart' in window) {
    addTouchFeedback();
}

// Add particle effect for winner
const createParticles = () => {
    const colors = ['#10b981', '#6366f1', '#ec4899', '#f59e0b'];
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: 50%;
            top: 50%;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = 100 + Math.random() * 100;
        
        particle.animate([
            {
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * velocity - 50}px, ${Math.sin(angle) * velocity - 50}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
    }
};

// Enhanced winner display
const originalShowWinner = showWinner;
showWinner = (playerName) => {
    originalShowWinner(playerName);
    createParticles();
};

// Add game statistics tracking
let gameStats = {
    gamesPlayed: 0,
    player1Wins: 0,
    player2Wins: 0,
    totalRolls: 0,
    onesRolled: 0
};

// Update stats on game events
const originalInit = init;
init = () => {
    originalInit();
    gameStats.gamesPlayed++;
};

// Track dice rolls
btnRoll.addEventListener('click', () => {
    if (playing) {
        gameStats.totalRolls++;
    }
});

// Add visual feedback for buttons
const createRipple = (event) => {
    const button = event.target;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
};

// Add ripple effect CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Apply ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add progressive difficulty (optional feature)
let difficultyMode = false;

const toggleDifficulty = () => {
    difficultyMode = !difficultyMode;
    const subtitle = document.querySelector('.game-subtitle');
    
    if (difficultyMode) {
        subtitle.textContent = 'HARD MODE: First to 50 wins • Double or nothing!';
        subtitle.style.color = 'var(--danger)';
    } else {
        subtitle.textContent = 'First to 100 wins • Roll or risk it all!';
        subtitle.style.color = 'var(--text-secondary)';
    }
};

// Add Easter egg: Click title 5 times to toggle hard mode
let titleClicks = 0;
document.querySelector('.game-title').addEventListener('click', () => {
    titleClicks++;
    if (titleClicks >= 5) {
        toggleDifficulty();
        titleClicks = 0;
        playSound(800, 200);
    }
});

// Add win condition check for hard mode
const originalBtnHold = btnHold.cloneNode(true);
btnHold.parentNode.replaceChild(originalBtnHold, btnHold);

originalBtnHold.addEventListener('click', () => {
    if (!playing) return;
    
    scores[activePlayer] += currentScore;
    const scoreEl = document.getElementById(`score--${activePlayer}`);
    animateScore(scoreEl, scores[activePlayer]);
    playSound(400, 250);
    
    const winCondition = difficultyMode ? 50 : 100;
    
    if (scores[activePlayer] >= winCondition) {
        playing = false;
        diceEl.classList.add('hidden');
        
        const winnerEl = document.getElementById(`player--${activePlayer}`);
        winnerEl.classList.add('player--winner');
        winnerEl.classList.remove('player--active');
        
        const winnerStatus = winnerEl.querySelector('.player-status');
        winnerStatus.textContent = 'WINNER!';
        winnerStatus.style.color = 'var(--success)';
        
        const winnerName = document.getElementById(`name--${activePlayer}`).textContent;
        setTimeout(() => showWinner(winnerName), 500);
        
        // Update stats
        if (activePlayer === 0) {
            gameStats.player1Wins++;
        } else {
            gameStats.player2Wins++;
        }
        
    } else {
        switchPlayer();
    }
});


// go home button 
function goHome() {
  window.location.href = "index.html"; // or any home path
};