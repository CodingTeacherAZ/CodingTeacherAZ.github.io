'use strict';

let xp = 0;
let health = 100;
let gold = 50;
let currentWeapon = 0;
let fighting;
let monsterHealth;
let inventory = ["stick"];
let easterEggGuessed = false; // Track if player has guessed in current easter egg event
let combatAnimationTimeout;
let fightStartHealth; // Track health at start of fight to cap dodge healing

const button1 = document.querySelector('#button1');
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const text = document.querySelector("#text");
const xpText = document.querySelector("#xpText");
const healthText = document.querySelector("#healthText");
const goldText = document.querySelector("#goldText");
const monsterStats = document.querySelector("#monsterStats");
const monsterName = document.querySelector("#monsterName");
const monsterHealthText = document.querySelector("#monsterHealth");
const monsterLevelText = document.querySelector("#monsterLevelText");
const imageEl = document.querySelector('#gameImage');
const gameEl = document.querySelector('#game');

const weapons = [
{ name: '🏏 Stick', power: () => rand(8)},
{ name: '🗡️ Dagger', power: () => rand(35)},
{ name: '🔨 War Hammer', power: () => rand(55)},
{ name: '⚔️ Legendary Sword', power: () => rand(110) }
];

const monsters = [
{
  name: "🐉 Ancient Dragon",
  level: () => Math.max(15, rand(25) + Math.floor(xp/10)),
  health: () => Math.max(200, rand(350) + Math.floor(xp/5)),
}
]; 

function createSlime() {
return {
  name: "🟢 Toxic Slime",
  level: rand(3) + 1,
  health: rand(20) + 10,
};
}

function createFangedBeast() {
return {
  name: "🐺 Shadow Wolf",
  level: rand(10) + 3,
  health: rand(70) + 30,
};
}

const locations = [
{
  name: "town square",
  "button text": ["🏪 Visit Store", "🕳️ Enter Cave", "🐉 Face Dragon"],
  "button functions": [goStore, goCave, fightDragon],
  text: "🏰 You stand in the town square. The cobblestones beneath your feet tell tales of ancient battles. Citizens whisper of the dragon's terror.",
  image: "town-612x612.jpg"
},
{
  name: "store",
  "button text": ["💉 Health Potion (10g)", "⚔️ Upgrade Weapon (30g)", "🏰 Return to Town"],
  "button functions": [buyHealth, buyWeapon, goTown],
  text: "🏪 The merchant's shop gleams with magical artifacts. The old shopkeeper eyes you knowingly.",
  image: "store-1024x1024.jpg"
},
{
  name: "cave",
  "button text": ["🟢 Hunt Slimes", "🐺 Battle Wolves", "🏰 Retreat to Town"],
  "button functions": [fightSlime, fightBeast, goTown],
  text: "🕳️ You venture into the mysterious cave. Shadows dance on the walls, and danger lurks in every corner.",
  image: "cave-612x612.jpg"
},
{
  name: "fight",
  "button text": ["⚔️ Attack", "🛡️ Dodge", "🏃 Flee"],
  "button functions": [attack, dodge, goTown],
  text: "⚔️ Battle has begun! Your heart pounds as you face your enemy.",
  image: "monster-612x612.jpg"
},
{
  name: "kill monster",
  "button text": ["🏰 Return Victorious", "🏰 Collect Rewards", "🏰 Head Back"],
  "button functions": [goTown, goTown, goTown],
  text: '🎉 Victory! The monster falls with a final roar. You feel stronger and discover treasure!',
  image: "win-612x612.jpg"
},
{
  name: "lose",
  "button text": ["🔄 Try Again", "🔄 Restart", "🔄 New Game"],
  "button functions": [restart, restart, restart],
  text: "💀 Your journey ends here... but heroes never truly die. Rise again!",
  image: "lose-612x612.jpg",
},
{ 
  name: "win", 
  "button text": ["🎊 Play Again", "🏆 New Game+", "🔄 Restart"], 
  "button functions": [restart, restart, restart], 
  text: "🏆 LEGENDARY VICTORY! You have slain the dragon and saved the realm! Your name will be remembered forever!" ,
  image: "victory-612x612.jpg",
},
{
  name: "easter egg",
  "button text": ["🎲 Pick 2", "🎰 Pick 8", "🏰 Leave"],
  "button functions": [pickTwo, pickEight, goTown],
  text: "✨ You discover an ancient gambling shrine! The spirits offer a game of chance. Choose wisely - you can only make one guess!",
  image: "easterEgg-612x612.jpg",
},
{
  name: "dragon fight",
  "button text": ["⚔️ Attack", "🛡️ Dodge", "🏃 Flee"],
  "button functions": [attack, dodge, goTown],
  text: "🐉 The ancient dragon rises before you! Its eyes burn with millennia of rage. This is the ultimate test!",
  image: "dragon-612x612.jpg"
}
];

// Initialize buttons
button1.onclick = goStore;
button2.onclick = goCave;
button3.onclick = fightDragon;

function update(location) {
monsterStats.style.display = "none";
button1.innerText = location["button text"][0];
button2.innerText = location["button text"][1];
button3.innerText = location["button text"][2];
button1.onclick = location["button functions"][0];
button2.onclick = location["button functions"][1];
button3.onclick = location["button functions"][2];
text.innerHTML = location.text;
imageEl.src = location.image;

// Add fade-in animation
text.style.animation = 'none';
setTimeout(() => {
  text.style.animation = 'textFadeIn 0.5s ease-out';
}, 10);
}

function rand(middle) {
return Math.round((Math.random() * 0.5 + 0.75) * middle);
}

function goTown() {
update(locations[0]);
}

function goStore() {
update(locations[1]);
}

function goCave() {
update(locations[2]);
}

function buyHealth() {
if (gold >= 10) {
  gold -= 10;
  health += 10;
  goldText.innerText = gold;
  healthText.innerText = health;
  text.innerText = "💉 You drink a refreshing health potion and feel rejuvenated!";
  
  // Add level up animation
  gameEl.classList.add('level-up');
  setTimeout(() => gameEl.classList.remove('level-up'), 2000);
} else {
  text.innerText = "💸 Your pockets are empty! You need more gold to buy health potions.";
}
}

function buyWeapon() {
if (currentWeapon < weapons.length - 1) {
  if (gold >= 30) {
    gold -= 30;
    currentWeapon++;
    goldText.innerText = gold;
    let newWeapon = weapons[currentWeapon].name;
    text.innerText = "⚔️ You acquire a " + newWeapon + "! You feel its power coursing through you.";
    inventory.push(newWeapon);
    text.innerText += "<br><br>🎒 Your arsenal: " + inventory.join(", ");
    
    // Add level up animation
    gameEl.classList.add('level-up');
    setTimeout(() => gameEl.classList.remove('level-up'), 2000);
  } else {
    text.innerText = "💸 This weapon is beyond your current means. Gather more gold!";
  }
} else {
  text.innerText = "⚔️ You wield the ultimate weapon! But you could sell one for quick cash...";
  button2.innerText = "💰 Sell Weapon (15g)";
  button2.onclick = sellWeapon;
}
}

function sellWeapon() {
if (inventory.length > 1) {
  gold += 15;
  goldText.innerText = gold;
  let soldWeapon = inventory.shift();
  text.innerText = "💰 You sold your " + soldWeapon + " to a collector.";
  text.innerText += "<br><br>🎒 Remaining weapons: " + inventory.join(", ");
  currentWeapon--;
} else {
  text.innerText = "🚫 A warrior never sells their last weapon!";
}
}

function fightSlime() {
fighting = createSlime();
goFight();
}

function fightBeast() {
fighting = createFangedBeast();
goFight();
}

function fightDragon() {
fighting = {
  name: monsters[0].name,
  level: monsters[0].level(),
  health: monsters[0].health()
};
goFight();
}

function goFight() {
update(locations[3]);
monsterHealth = fighting.health;
fightStartHealth = health; // Store health at start of fight
monsterStats.style.display = "block";
monsterName.innerText = fighting.name;
monsterLevelText.innerText = fighting.level;
monsterHealthText.innerText = monsterHealth;
}

function attack() {
const monsterHit = rand(getMonsterAttackValue(fighting.level));

// Add combat animation
gameEl.classList.add('combat-animation');
setTimeout(() => gameEl.classList.remove('combat-animation'), 500);

text.innerHTML = `💥 ${fighting.name} strikes with fury!<br>`;
text.innerHTML += `💔 You lose ${monsterHit} health points!<br>`;
text.innerHTML += `⚔️ You counter-attack with your ${weapons[currentWeapon].name}!<br>`;

health -= monsterHit;
healthText.innerText = health;

if (isMonsterHit()) {
  const yourHit = rand(weapons[currentWeapon].power() + rand(xp));
  text.innerHTML += `🎯 Critical hit! ${fighting.name} loses ${yourHit} health!`;
  monsterHealth -= yourHit;
  monsterHealthText.innerText = monsterHealth;    
} else {
  text.innerHTML += "💨 Your attack misses by inches!";
}

if (health <= 0) {
  lose();
} else if (monsterHealth <= 0) {
  if (fighting.name.includes("Dragon")) {
    winGame();
  } else {
    defeatMonster();
  }
}

if (Math.random() <= 0.1 && inventory.length !== 1) {
  text.innerHTML += `<br>💥 Your ${inventory.pop()} breaks from the intense battle!`;
  currentWeapon--;
}
}

function getMonsterAttackValue(level) {
const hit = level * 5 - rand(xp);
return hit > 0 ? hit : 0;
}

function isMonsterHit() {
return Math.random() > 0.2 || health < 20;
}

function dodge() {
const healthChangesBy = rand(getMonsterAttackValue(fighting.level));

if (Math.random() <= 0.25) {
  // Perfect dodge - can potentially heal, but cap at fight start health
  if (health < fightStartHealth) {
    const healAmount = Math.min(healthChangesBy, fightStartHealth - health);
    text.innerHTML = `🛡️ Perfect dodge! You evade ${fighting.name}'s attack completely!<br>`;
    text.innerHTML += `✨ Your agility allows you to recover ${healAmount} health!`;
    health += healAmount;
    healthText.innerText = health;
  } else {
    // Already at max fight health, no healing benefit
    text.innerHTML = `🛡️ Perfect dodge! You evade ${fighting.name}'s attack completely!<br>`;
    text.innerHTML += `⚡ You're at peak condition - no additional healing needed!`;
  }
} else {
  text.innerHTML = `💥 ${fighting.name} lands a glancing blow!<br>`;
  text.innerHTML += `💔 You lose ${healthChangesBy} health points!`;
  health -= healthChangesBy;
  healthText.innerText = health; 
  if (health <= 0) {
    lose();
  }
}
}

function defeatMonster() {
const goldGain = rand(fighting.level * 6);
const xpGain = rand(fighting.level * 2);
gold += goldGain;
xp += xpGain;
goldText.innerText = gold;
xpText.innerText = xp;

// Update victory text with rewards
let victoryLocation = {...locations[4]};
victoryLocation.text = `🎉 Victory! ${fighting.name} has been defeated!<br><br>💰 You found ${goldGain} gold!<br>⚡ You gained ${xpGain} experience!<br><br>🏆 You feel yourself growing stronger!`;
update(victoryLocation);

// Easter egg chance - different rates based on monster type
let easterEggChance;
if (fighting.name.includes("Shadow Wolf")) {
  easterEggChance = 0.45; // 45% chance for wolves
} else if (fighting.name.includes("Toxic Slime")) {
  easterEggChance = 0.25; // 25% chance for slimes
} else {
  easterEggChance = 0.35; // 35% chance for other monsters
}

if (Math.random() < easterEggChance) {
  easterEggGuessed = false; // Reset for new easter egg event
  
  // Randomly pick one button to be the easter egg trigger
  const easterEggButtonIndex = Math.floor(Math.random() * 3);
  
  // Create wrapper functions that trigger easter egg instead of going to town
  const easterEggWrapper = () => {
    easterEgg();
  };
  
  if (easterEggButtonIndex === 0) {
    button1.onclick = easterEggWrapper;
  } else if (easterEggButtonIndex === 1) {
    button2.onclick = easterEggWrapper;
  } else {
    button3.onclick = easterEggWrapper;
  }
}
}

function lose() {
update(locations[5]);
}

function winGame() {
update(locations[6]);
}

function restart() {
xp = 0;
health = 100;
gold = 50;
currentWeapon = 0;
inventory = ["🏏 Stick"];
easterEggGuessed = false; // Reset easter egg state
goldText.innerText = gold;
healthText.innerText = health;
xpText.innerText = xp;
goTown();
}

function easterEgg() {
update(locations[7]);
}

function pickTwo() {
pick(2);
}

function pickEight() {
pick(8);
}

function pick(guess) {
if (easterEggGuessed) {
  text.innerHTML = "✨ You have already made your guess for this shrine! The spirits await your next adventure.";
  return;
}

easterEggGuessed = true; // Mark that player has guessed in this event

const numbers = [];
while (numbers.length < 10) {
  numbers.push(Math.floor(Math.random() * 11));
}

text.innerHTML = `🎲 You chose ${guess}. The spirits reveal their numbers:<br><br>`;
text.innerHTML += numbers.join(" • ") + "<br><br>";

if (numbers.includes(guess)) {
  text.innerHTML += "🎊 AMAZING! The spirits favor you! You receive 30 gold!";
  gold += 30;
  goldText.innerText = gold;
  
  // Add level up animation
  gameEl.classList.add('level-up');
  setTimeout(() => gameEl.classList.remove('level-up'), 2000);
} else {
  text.innerHTML += "💫 The spirits are not pleased. You lose 15 health, but gain wisdom.";
  health -= 15;
  healthText.innerText = health;
  if (health <= 0) {
    lose();
  }
}

// Update button text to show they can't guess again
button1.innerText = "🚫 Already Guessed";
button2.innerText = "🚫 Already Guessed";
button1.onclick = () => {
  text.innerHTML = "✨ The shrine's magic is spent for this encounter. You must return to town.";
};
button2.onclick = () => {
  text.innerHTML = "✨ The shrine's magic is spent for this encounter. You must return to town.";
};
}