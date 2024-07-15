let healthbar = 2;
let previoushealthbar = 2;
let playerdamage = 1;
let saveplayerdamage;
let critchance = 1;
let gold = 300;
let goldgain;
let xp = 0;
let kills = 0;
let bossSpawned = false;
let questcompleted = false;
let enemyArray;
let randomSlime = 0;
let xpNeeded = 50;
let level = 1;
let passivedamage = 0;

// Load saved xp and gold from localStorage
if (localStorage.getItem("xp")) {
    xp = parseInt(localStorage.getItem("xp"), 10);
}
if (localStorage.getItem("gold")) {
    gold = parseInt(localStorage.getItem("gold"), 10);
}
if (localStorage.getItem("healthbar")) {
    healthbar = parseInt(localStorage.getItem("previoushealthbar"), 10);
}
if (localStorage.getItem("healthbar")) {
    previoushealthbar = parseInt(localStorage.getItem("previoushealthbar"), 10);
}
if (localStorage.getItem("playerdamage")) {
    playerdamage = parseInt(localStorage.getItem("playerdamage"), 10);
}
if (localStorage.getItem("passivedamage")) {
    passivedamage = parseInt(localStorage.getItem("passivedamage"), 10);
}

//removes all chars after the last / and removes all chars after the first .
function enemyStringCleaner(text) {

    let lastSlashPos = text.lastIndexOf('/');    
    
    // If the first slash is not found, return null
    if (lastSlashPos === -1) {
      return null;
    }
    
    // Extract the substring starting from the first slash
    let substring = text.substring(lastSlashPos + 1);
    
    // Find the position of the first period in the substring
    let periodPos = substring.indexOf('.');
    
    // If the period is not found, return null
    if (periodPos === -1) {
      return null;
    }
    
    // Extract the desired string
    let result = substring.substring(0, periodPos).trim();
    
    return result;
  }

  // Update the DOM with saved values
document.getElementById("xp").textContent = xp;
document.getElementById("gold").textContent = gold;
document.getElementById("healthbar").textContent = healthbar;
document.getElementById("dmg").textContent = playerdamage;
document.getElementById("passivedmg").textContent = passivedamage;

function levelUp(lvlxp){
    if(lvlxp >= xpNeeded){
        level++;
        playerdamage++;
        xp = 0;
        xpNeeded *= 1.05;
        xpNeeded = Math.trunc(xpNeeded);
        document.getElementById("level").textContent = level;
        document.getElementById("dmg").textContent = Math.trunc(playerdamage);
    }
}

// Background areas
const areas = [
    'pic/backgrounds/meadow.jpeg',
    'pic/backgrounds/sewer.png',
    'pic/backgrounds/forest.png'
];

// Enemies for quests
const questenemies = [
    'pic/slime/slime.gif',
    'pic/enemies/gobby.gif'
];

// Enemies for quests
const bossenemies = [
    'pic/slime/slimesword.gif'
]

//mob variations
const slimeEnemies = ['pic/slime/black_slime.gif',
    'pic/slime/blue_slime.gif',
    'pic/slime/orange_slime.gif',
    'pic/slime/pink_slime.gif',
    'pic/slime/purple_slime.gif',
    'pic/slime/red_slime.gif',
    'pic/slime/slime.gif',
    'pic/slime/yellow_slime.gif' ]

// Global object to store enemies for each area
const enemies = {
    meadowenemies: ['pic/enemies/gobby.gif', slimeEnemies[randomSlime]],
    sewerenemies: ['pic/enemies/rat.gif']
};

function getrandomenemy() {
    var bodyStyle = window.getComputedStyle(document.body);
    let currentarea = bodyStyle.backgroundImage;
    
    //currentarea contains the correct URL format
    if (currentarea.includes('url(')) {
        currentarea = currentarea.slice(currentarea.indexOf('url(') + 4, currentarea.indexOf(')'));
    }
    
    let currentareasub = currentarea.substring(currentarea.lastIndexOf('pic/backgrounds') + 16); //get only the chars after pic/
    currentareasub = currentareasub.substring(0, currentareasub.lastIndexOf('.')); //remove the file extension
    
    let enemyindex = currentareasub + 'enemies';
    let enemyArray = enemies[enemyindex];
    
    if (!enemyArray) {
        console.error(`No enemies found for area: ${enemyindex}`);
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * enemyArray.length);
    return enemyArray[randomIndex];
}

//determines what enemy it should be when opening game
document.addEventListener('DOMContentLoaded', function() {
    let loadedenemy = getrandomenemy();
    document.getElementById("enemysprite").src = loadedenemy;
}, false);

//opens quests when opening game
document.addEventListener('DOMContentLoaded', function() {
    quests()
}, false);

//calculating critical hit chance:
function calccritchance() {
    let randomchance = Math.ceil(Math.random() * 10) - 1;
    return critchance > randomchance;
}

//function for the onclick event
function enemyClickHandler() {
    
    document.getElementById("dmg").textContent = Math.trunc(playerdamage);

    if (healthbar > 0) {
        const crithit = calccritchance();
        localStorage.setItem("playerdamage", playerdamage);
        //if the critical hit chance succeeds, we multiply the playerdamage variable
        if (crithit) {
            document.getElementById("crittext").style.visibility = "visible";
            saveplayerdamage = playerdamage;
            playerdamage *= 3.5;
            healthbar -= playerdamage;
            playerdamage = saveplayerdamage;
        } else {
            healthbar -= playerdamage;
            document.getElementById("crittext").style.visibility = "hidden";
        }

        //if the healthbar decreases past 0 after the click we do this:
        if(healthbar <= 0){
            handleEnemyDefeat();
            document.getElementById("healthbar").textContent = Math.trunc(healthbar);
        }

        //update healthbar display
        document.getElementById("healthbar").textContent = Math.trunc(healthbar);
        
    }
    else{
        console.log("ERROR: enemy health was below 0")
        handleEnemyDefeat();
        document.getElementById("healthbar").textContent = Math.trunc(healthbar);
    }
}

//function to handle enemy defeat
function handleEnemyDefeat() {
    
    randomSlime = Math.floor(Math.random() * slimeEnemies.length);
    enemies.meadowenemies.push(slimeEnemies[randomSlime], 'pic/enemies/gobby.gif');
    
    if (healthbar <= 0) {
        previoushealthbar *= 1.02;
        localStorage.setItem("healthbar", healthbar);
        localStorage.setItem("previoushealthbar", previoushealthbar);
        healthbar = Math.ceil(previoushealthbar);

        //call quests function and store enemy sprite that was killed.
        let prevenemy = document.getElementById("enemysprite").src;
        let prevenemysub = enemyStringCleaner(prevenemy);
        quests(prevenemysub);

        //check if a quest has been completed and spawn a bigger enemy if needed
        if (questcompleted === true) {
            spawnBiggerEnemy();
        } else {
            //change the enemy sprite
            const randomenemy = getrandomenemy();
            document.getElementById("enemysprite").src = randomenemy;
            document.getElementById("enemysprite").classList.remove('bigger'); // Remove the bigger class if it exists
        }

        //player gains gold from enemy (non-slot)
        if(slot == false){
            goldgain = Math.trunc(Math.random() * 6) + 1;
            gold += goldgain;
            document.getElementById("gold").textContent = gold;
            document.getElementById("goldgain").textContent = "Gold gained: +" + goldgain;
        }

        //player gains gold from beating slot machine
        if(slot == true){
            goldgain = 100;
            gold += goldgain;
            document.getElementById("gold").textContent = gold;
            document.getElementById("goldgain").textContent = "Gold gained: +" + goldgain;
            slot = false;

            fireball = true;
            document.getElementById("fireball").style.filter = "brightness(100%)";
            frogs = true;
            document.getElementById("frog").style.filter = "brightness(100%)";
            strength = true;
            document.getElementById("strength").style.filter = "brightness(100%)";
        }


        //save gold to localStorage
        localStorage.setItem("gold", gold);

        //player gains xp
        xp += Math.trunc(Math.random() * 3) + 1;
        levelUp(xp);
        document.getElementById("xp").textContent = xp + "/" + xpNeeded;

        //save xp to localStorage
        localStorage.setItem("xp", xp);

        //kill count increases
        kills += 1;
        document.getElementById("kills").textContent = kills;
    }
}

//function to spawn a bigger enemy with more health
function spawnBiggerEnemy() {
    const biggerEnemy = 'pic/slime/slimesword.gif'; // Replace with the path to your bigger enemy sprite
    let bosshealthbar = previoushealthbar*2; // Increase health significantly for the bigger enemy
    healthbar = bosshealthbar;

    //change the enemy sprite to the bigger enemy and make it larger
    const enemySprite = document.getElementById("enemysprite");
    enemySprite.src = biggerEnemy;
    enemySprite.classList.add('bigger'); // CSS class to make it larger
    document.getElementById("healthbar").textContent = Math.trunc(healthbar);
    bossSpawned = true; // indicate the boss has been spawned
}

let prevkillsneeded = 6.5;
let questnum = 1;
let questkill = 0; // Initialize questkill if not already defined
let questscomplete = 0; // Initialize questscomplete if not already defined
let questenemy = questenemies[0]; // Initial quest enemy

// Function to handle quest system
function quests(enemy) {
    questcompleted = false;
    let killsneeded = Math.ceil(prevkillsneeded * 1.5);
    document.getElementById("killsneeded").textContent = killsneeded;
    // Ensure questenemy is set based on questscomplete
    if (questscomplete < questenemies.length) {
        questenemy = enemyStringCleaner(questenemies[questscomplete]);
    } 
    else {
        questenemy = undefined;
    }

    if (questenemy === undefined) {
        questscomplete = 0;
        questenemy = enemyStringCleaner(questenemies[questscomplete]); // Reset to the first enemy
    }

    document.getElementById("questenemy").textContent = questenemy + "s";
    document.getElementById("questenemyname").textContent = questenemy + "s";
    document.getElementById("questkills").textContent = questkill;
    document.getElementById("challengekillsneeded").textContent = killsneeded;
    document.getElementById("questnum").textContent = "#" + questnum + ": ";
    let questEnemyContain = enemy.includes(questenemy);

    if (questEnemyContain === true) {
        questkill++;
        document.getElementById("questkills").textContent = questkill;
    }

    if (questkill == killsneeded) {
        questscomplete++;
        prevkillsneeded = killsneeded;
        questnum++;
        questkill = 0; // Reset questkill for the next quest
        document.getElementById("questkills").textContent = questkill;
        questcompleted = true;
    }
}

// When the player clicks we run this function
document.getElementById("enemysprite").onclick = enemyClickHandler;

// Sets spells to be true 
let fireball = true;
let frogs = true;
let strength = true;
let slots = true;

function fireballTrue(){
    fireball = true;
    document.getElementById("fireball").style.filter = "brightness(100%)";
}

document.getElementById("fireball").onclick = function() {

    if(fireball == true){
        healthbar -= 50;
        handleEnemyDefeat();
        document.getElementById("healthbar").textContent = Math.trunc(healthbar);
        document.getElementById("fireball").style.filter = "brightness(60%)";
        fireball = false;
        setTimeout(fireballTrue, 5000); //cooldown for the fireball spell
    }

}


function frogTrue(){
    frogs = true;
    document.getElementById("frog").style.filter = "brightness(100%)";
}

document.getElementById("frog").onclick = function() {

    if(frogs == true){
        healthbar = 1;
        prevenemy = document.getElementById("enemysprite").src;
        document.getElementById("enemysprite").src = 'pic/frog.png';
        document.getElementById("healthbar").textContent = Math.trunc(healthbar);
        document.getElementById("frog").style.filter = "brightness(60%)";
        frogs = false;
        setTimeout(frogTrue, 5000); //cooldown for the frog spell
    }
}



//returns player damage to 1 after 10 seconds of using the strength potion
function strengthDone(){
    document.getElementById("strength").style.filter = "brightness(100%)";
    playerdamage /= 1.5;
}

document.getElementById("strength").onclick = function() {

    if(strength == true){
        playerdamage *= 1.5;
        document.getElementById("strength").style.filter = "brightness(60%)";
        strength = false;
        setTimeout(strengthDone, 10000); //cooldown for the strength spell
    }
}



function slotTrue(){ //slot potion cooldown ready 
    slots = true;
    document.getElementById("slot").style.filter = "brightness(100%)";
}

document.getElementById("slot").onclick = function(){

    if(slots == true){
        healthbar = healthbar *= 1.5;
        prevenemy = document.getElementById("enemysprite").src;
        document.getElementById("enemysprite").src = 'pic/enemies/slot.gif';
        document.getElementById("healthbar").textContent = Math.trunc(healthbar);
        slot = true;
        slots = false;
        document.getElementById("slot").style.filter = "brightness(60%)";

        //other spells are disabled (temporary)
        if(slot == true){
            fireball = false;
            document.getElementById("fireball").style.filter = "brightness(60%)";
            frogs = false;
            document.getElementById("frog").style.filter = "brightness(60%)";
            strength = false;
            document.getElementById("strength").style.filter = "brightness(60%)";
        }
        }

        setTimeout(slotTrue, 120000); //cooldown for the slot spell
    }



document.getElementById("buydmg").onclick = function(){
    if(gold >= 50){
        playerdamage *= 1.2;
        gold -= 50;
        document.getElementById("gold").textContent = gold;
        document.getElementById("dmg").textContent = Math.trunc(playerdamage);
    }
}

document.getElementById("hiremember").onclick = function(){
    if(gold >= 250){
        passivedamage += 2;
        localStorage.setItem("passivedamage", passivedamage);
        gold -= 250;
        document.getElementById("gold").textContent = gold;
        document.getElementById("passivedmg").textContent = Math.trunc(passivedamage);
    }
}

function decreaseNumber() {
    healthbar -= passivedamage;
    if(healthbar <= 0){
        handleEnemyDefeat();
    }
    document.getElementById("healthbar").innerText = Math.trunc(healthbar);
}

setInterval(decreaseNumber, 1000);
