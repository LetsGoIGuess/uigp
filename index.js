let healthbar = 2;
let previoushealthbar = 2;
let playerdamage = 1;
let saveplayerdamage;
let critchance = 1;
let gold = 0;
let goldgain;
let xp = 0;
let kills = 0;
let bossSpawned = false;
let questcompleted = false;
let enemyArray;

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

// Update the DOM with saved values
document.getElementById("xp").textContent = xp;
document.getElementById("gold").textContent = gold;
document.getElementById("healthbar").textContent = healthbar;


// Background areas
const areas = [
    'pic/meadow.jpeg',
    'pic/forest.jpeg',
    'pic/sewer.jpg'
];

// Enemies for quests
const questenemies = [
    'pic/slime.gif',
    'pic/gobby.gif'
];

// Enemies for quests
const bossenemies = [
    'pic/slime.gif',
    'pic/gobby.gif'
]

// Global object to store enemies for each area
const enemies = {
    meadowenemies: ['pic/slime.gif', 'pic/gobby.gif'],
    sewerenemies: ['pic/rat.gif'],
    allenemies: ['pic/rat.gif', 'pic/skel.gif', 'pic/skelhat.gif', 'pic/slimesword.gif', 'pic/slime.gif', 'pic/gobby.gif'],
};

function getrandomenemy() {
    var bodyStyle = window.getComputedStyle(document.body);
    let currentarea = bodyStyle.backgroundImage;
    
    //currentarea contains the correct URL format
    if (currentarea.includes('url(')) {
        currentarea = currentarea.slice(currentarea.indexOf('url(') + 4, currentarea.indexOf(')'));
    }
    
    let currentareasub = currentarea.substring(currentarea.lastIndexOf('pic/') + 4); //get only the chars after pic/
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
    if (healthbar > 0) {
        const crithit = calccritchance();

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
    if (healthbar <= 0) {
        previoushealthbar *= 1.05;
        localStorage.setItem("healthbar", healthbar);
        localStorage.setItem("previoushealthbar", previoushealthbar);
        healthbar = Math.ceil(previoushealthbar);

        //call quests function and store enemy sprite that was killed.
        let prevenemy = document.getElementById("enemysprite").src;
        let prevenemysub = prevenemy.substring(prevenemy.indexOf('pic')); // This just changes to the relative path
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

        //player gains gold
        goldgain = Math.trunc(Math.random() * 6) + 1;
        gold += goldgain;
        document.getElementById("gold").textContent = gold;
        document.getElementById("goldgain").textContent = "Gold gained: +" + goldgain;

        //save gold to localStorage
        localStorage.setItem("gold", gold);

        //player gains xp
        xp += Math.trunc(Math.random() * 3) + 1;
        document.getElementById("xp").textContent = xp;

        //save xp to localStorage
        localStorage.setItem("xp", xp);

        //kill count increases
        kills += 1;
        document.getElementById("kills").textContent = kills;
    }
}

//function to spawn a bigger enemy with more health
function spawnBiggerEnemy() {
    console.log("Spawning a bigger enemy");
    const biggerEnemy = 'pic/slimesword.gif'; // Replace with the path to your bigger enemy sprite
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
        questenemy = questenemies[questscomplete];
    } else {
        questenemy = undefined;
    }

    if (questenemy === undefined) {
        questscomplete = 0;
        questenemy = questenemies[questscomplete]; // Reset to the first enemy
    }

    let questenemyName = questenemy.substring(questenemy.indexOf('pic/') + 4);
    questenemyName = questenemyName.substring(0, questenemyName.lastIndexOf('.'));
    document.getElementById("questenemy").textContent = questenemyName + "s";
    document.getElementById("questenemyname").textContent = questenemyName;

    document.getElementById("questnum").textContent = "#" + questnum + ": ";

    if (questenemy === enemy) {
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

document.getElementById("fireball").onclick = function() {
    healthbar -= 50;
    document.getElementById("healthbar").textContent = Math.trunc(healthbar);
}

document.getElementById("frog").onclick = function() {
    healthbar = 1;
    prevenemy = document.getElementById("enemysprite").src;
    document.getElementById("enemysprite").src = 'pic/frog.png';
    document.getElementById("healthbar").textContent = Math.trunc(healthbar);
}
