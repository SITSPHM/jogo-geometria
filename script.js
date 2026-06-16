// =============================================================================
//  BANCO DE PERGUNTAS
// =============================================================================
const originalQuestionBank = [
    { question: "Usando a Relação de Euler (V + F = A + 2): Se um poliedro convexo tem 15 vértices e 27 arestas, quantas FACES (F) ele possui?", answer: "14" },
    { question: "Qual é o nome de um poliedro que possui exatamente 6 faces?", answer: "hexaedro" },
    { question: "Complete a fórmula do Volume de um Prisma: V = A_b * ...? (O que significa a letra 'h'?)", answer: "altura" },
    { question: "Em um poliedro, como se chama o segmento de reta onde duas faces se encontram?", answer: "aresta" },
    { question: "Se as bases de um prisma são pentágonos, qual é o nome específico desse prisma?", answer: "prisma pentagonal" },
    { question: "De acordo com a página 142, a Relação de Euler funciona perfeitamente para TODOS os poliedros não convexos? (sim ou não)", answer: "não" },
    { question: "Qual é o nome do poliedro que possui exatamente 20 faces?", answer: "icosaedro" },
    { question: "Quantas bases tem uma pirâmide?", answer: "1" },
    { question: "O cilindro, o cone e a esfera são exemplos de corpos...?", answer: "redondos" },
    { question: "Se uma pirâmide tem uma base quadrada, quantas faces laterais ela possui?", answer: "4" },
    { question: "Qual é o nome do ponto mais alto de uma pirâmide, onde todas as faces laterais triangulares se encontram?", answer: "vértice" },
    { question: "Um prisma que possui todas as suas faces quadradas é chamado de...?", answer: "cubo" }
];

const deathMessages = {
    timeout: [
        "O tempo acabou! Você dormiu na conta ou o quê? Que lerdo!",
        "Pensou tanto que o cérebro pifou? Que coisa triste de se ver!",
        "Muito devagar! Desse jeito tu não vai chegar em nenhum lugar!"
    ],
    wrongAnswer: [
        "Errou feio, presta atenção cara, minha vó é mais esperta!",
        "Sério que você digitou isso? Meu gato andando no teclado responderia melhor!",
        "Resposta totalmente incorreta! Você claramente não escutou nada."
    ],
    bulletHell: [
        "Que ruim! Não aguentou o jogo mais fácil desse tipo!",
        "Nossa, que horrível! Foi obliterado completamente!",
        "Desistiu de viver? Suas vidas sumiram mais rápido que a minha paciência!"
    ]
};

// =============================================================================
//  SPRITESHEET LOGIC (image_0.png)
// =============================================================================
const explosionImg = new Image();
explosionImg.src = 'explosion.png';
const EXPLOSION_COLS = 5;
const EXPLOSION_ROWS = 5;
const EXPLOSION_FRAME_COUNT = 23; // User requested 23 frames out of 25

function getExplosionFrameRect(frameIndex) {
    if (frameIndex < 0 || frameIndex >= EXPLOSION_FRAME_COUNT) return null;
    if (!explosionImg.complete || explosionImg.naturalWidth === 0) return null;

    const frameWidth = explosionImg.naturalWidth / EXPLOSION_COLS;
    const frameHeight = explosionImg.naturalHeight / EXPLOSION_ROWS;
    
    const col = frameIndex % EXPLOSION_COLS;
    const row = Math.floor(frameIndex / EXPLOSION_COLS);
    
    return {
        sx: col * frameWidth,
        sy: row * frameHeight,
        sw: frameWidth,
        sh: frameHeight
    };
}

// =============================================================================
//  AUDIO BALANCING
// =============================================================================
const audioObjects = {
    'musica.mp3': document.getElementById('bg-music'),
    'boss-theme.mp3': document.getElementById('boss-music'),
    'boss-theme-hard.mp3': document.getElementById('boss-music-heavy'),
    'hover.mp3': new Audio('hover.mp3'),
    'clique.mp3': new Audio('clique.mp3'),
    'error.mp3': new Audio('error.mp3'),
    'correct.mp3': new Audio('correct.mp3'),
    'wrong.mp3': new Audio('wrong.mp3'),
    'laser.mp3': new Audio('laser.mp3'),
    'hit-enemy.mp3': new Audio('hit-enemy.mp3'),
    'explosion.mp3': new Audio('explosion.mp3'),
    'player-damage.mp3': new Audio('player-damage.mp3'),
    'aplausos.mp3': new Audio('aplausos.mp3'),
    'som-caos.mp3': new Audio('som-caos.mp3'),
    'sans.mp3': new Audio('sans.mp3'), // For cheat #9
};

// User requests: balanced sounds, hit and laser lower, explosion louder.
audioObjects['explosion.mp3'].volume = 1.0;  // Max volume for explosions
audioObjects['correct.mp3'].volume = 1.0;
audioObjects['aplausos.mp3'].volume = 1.0;
audioObjects['som-caos.mp3'].volume = 1.0;
audioObjects['wrong.mp3'].volume = 0.9;
audioObjects['player-damage.mp3'].volume = 0.9;
audioObjects['laser.mp3'].volume = 0.6;      // Shot is quieter
audioObjects['hit-enemy.mp3'].volume = 0.6;  // Enemy hit is quieter
audioObjects['musica.mp3'].volume = 0.5;
audioObjects['boss-theme.mp3'].volume = 0.6;
audioObjects['boss-theme-hard.mp3'].volume = 0.7;
audioObjects['sans.mp3'].volume = 1.0;        // SECRET!

function playAudio(filename) {
    if (!audioObjects[filename]) return;
    const audio = audioObjects[filename];
    audio.currentTime = 0; // Rewind to play again immediately
    audio.play().catch(e => {});
}

// Special case for hit sound, as it should play with the explosion
function playHitSound() {
    playAudio('hit-enemy.mp3');
}

// =============================================================================
//  CHEATS SYSTEM (Both PC KeyCombos and Mobile Input)
// =============================================================================
let cheatState = {
    pcBuffer: [],
    pcTimer: null,
    mobileBuffer: "",
    lastCheatTime: 0,
    godModeOn: false,
    infiniteDamageOn: false,
    minCooldownOn: false,
    isSansCodeTriggered: false,
};

const CHEATS = {
    'god': { id: 1, action: activateGodMode },
    'normal': { id: 2, action: resetWeapon },
    'shotgun': { id: 3, action: setWeaponShotgun },
    'smg': { id: 4, action: setWeaponSmg },
    'sniper': { id: 5, action: setWeaponSniper },
    'speed': { id: 6, action: giveSpeedBoostStack },
    'infdmg': { id: 7, action: activateInfiniteDamage },
    'fast': { id: 8, action: activateMinCooldown },
    'sans': { id: 9, action: triggerSansSequence },
};

function activateGodMode() {
    cheatState.godModeOn = !cheatState.godModeOn;
    triggerCheatHudUpdate(`GOD MODE: [${cheatState.godModeOn ? 'ATIVADO' : 'DESATIVADO'}]`);
    playAudio('som-caos.mp3');
    lives = 999;
    updateLivesDisplay();
}

function resetWeapon() {
    player.activeWeapon = 'normal';
    triggerCheatHudUpdate('ARMA: [NORMAL]');
    playAudio('som-caos.mp3');
}

function setWeaponShotgun() {
    player.activeWeapon = 'shotgun';
    triggerCheatHudUpdate('ARMA: [DOZE]');
    playAudio('som-caos.mp3');
}

function setWeaponSmg() {
    player.activeWeapon = 'smg';
    triggerCheatHudUpdate('ARMA: [SMG]');
    playAudio('som-caos.mp3');
}

function setWeaponSniper() {
    player.activeWeapon = 'sniper';
    triggerCheatHudUpdate('ARMA: [SNIPER]');
    playAudio('som-caos.mp3');
}

function giveSpeedBoostStack() {
    player.speedBoostLevel = (player.speedBoostLevel || 0) + 1;
    player.speedBoostEndTime = Date.now() + 30000;
    triggerCheatHudUpdate(`SPEED BOOST: [Lvl ${player.speedBoostLevel}]`);
    playAudio('som-caos.mp3');
}

function activateInfiniteDamage() {
    cheatState.infiniteDamageOn = !cheatState.infiniteDamageOn;
    triggerCheatHudUpdate(`DANO INFINITO: [${cheatState.infiniteDamageOn ? 'ATIVADO' : 'DESATIVADO'}]`);
    playAudio('som-caos.mp3');
}

function activateMinCooldown() {
    cheatState.minCooldownOn = !cheatState.minCooldownOn;
    triggerCheatHudUpdate(`RECARGA 0.01: [${cheatState.minCooldownOn ? 'ATIVADO' : 'DESATIVADO'}]`);
    playAudio('som-caos.mp3');
}

function triggerCheatHudUpdate(msg) {
    if (!bossArenaWrapper) return;
    let cheatHud = document.getElementById('cheat-hud');
    if (!cheatHud) {
        cheatHud = document.createElement('div');
        cheatHud.id = 'cheat-hud';
        cheatHud.style.cssText = "position: absolute; bottom: 5px; right: 5px; font-size: 11px; font-family: monospace; color: #ffcc00; text-shadow: 0 0 2px #000; pointer-events: none;";
        bossArenaWrapper.appendChild(cheatHud);
    }
    cheatHud.innerText = `CHEAT ACTIVADO: ${msg}`;
    setTimeout(() => { if(cheatHud) cheatHud.innerText = ''; }, 3000);
}

// --- SANS SEQUENCE (Cheat 9) ---
function triggerSansSequence() {
    if (cheatState.isSansCodeTriggered) return;
    cheatState.isSansCodeTriggered = true;
    clearInterval(timerInterval);
    endGame(); // Call endgame first to pause sounds and show screens

    playAudio('sans.mp3');
    const bgMusic = audioObjects['musica.mp3'];
    if (bgMusic) bgMusic.pause(); // Just in case it's on

    const sansScreen = document.getElementById('sans-screen');
    sansScreen.classList.add('show');
    gameBox.classList.add('hidden'); // Hide the standard final score screen

    setTimeout(() => {
        // Cut off sound and fade image to black
        const sansAudio = audioObjects['sans.mp3'];
        if (sansAudio) sansAudio.pause();
        sansScreen.innerHTML = ''; // Remote the image to fade to just black
        
        // Final score for SANS is -67
        score = -67;
        finalScoreEl.innerText = score;
        lives = 0; // Game over state for messaging
        causeOfDeath = "sans";
        
        // Show the standard final screen over the black
        gameBox.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');
        
        // Update messaging and hide save area
        endTitleEl.innerText = "💀 GAME OVER";
        endMessageEl.innerText = "You have activated SANS... a bad time awaits.";
        if (saveScoreArea) saveScoreArea.classList.add('hidden');
        
        // Reset cheat flag after a complete loop
        cheatState.isSansCodeTriggered = false; 

    }, 3000); // Sequence lasts 3 seconds
}

// Add DOM for SANS screens
const sansScreen = document.createElement('div');
sansScreen.id = 'sans-screen';
sansScreen.className = 'full-black-screen';
const sansImg = new Image();
sansImg.src = 'sans.png';
sansScreen.appendChild(sansImg);
document.body.appendChild(sansScreen);

// =============================================================================
//  ESTADO DO QUIZ
// =============================================================================
let questionBank = [];
let currentIndex = 0;
let score = 0;
let lives = 3;
let timeLeft = 15;
let timerInterval = null;
let canAnswer = true;
let isChaosMode = false;
let handClicksRequired = 5;
let currentDifficulty = 'medium';
let scoreMultiplier = 1.5;
let baseTimeLimit = 15;
let isPopupActive = false;
let isHandActive = false;
let causeOfDeath = "wrongAnswer";

// =============================================================================
//  ESTADO DA BOSS FIGHT E UPGRADES (Loot Drop System)
// =============================================================================
let isBossFightActive = false;
let bossFightAnimationId = null;
let currentWave = 1;
let bossPhase = 0;
let bossHp = 100;
let maxBossHp = 100;

let isInvincible = false;
let invincibleTimer = 0;
const INVINCIBLE_DURATION = 120;
let blinkTimer = 0;

let isCountdownActive = false;
let countdownNumber = 3;
let countdownTimer = 0;

let isWaveTransitionActive = false;
let transitionText = "";
let transitionTimer = 0;

let isBossFleeing = false;
let bossFleeTimer = 0;

let isDyingSequence = false;
let dyingTimer = 0;
let bossDyingY = 30;
let whiteFadeAlpha = 0;
let isWhiteFadeActive = false;

// Estado customizado do Jogador e Buffs temporários
let player = { 
    x: 280, y: 340, width: 18, height: 18, speed: 5.2, activeWeapon: 'normal',
    speedBoostLevel: 0, speedBoostEndTime: 0 
};
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let explosions = [];
let drops = []; 

let keys = {};
let touchKeys = { up: false, down: false, left: false, right: false, shoot: false };
let lastShotTime = 0;
let diffSpeedMultiplier = 1;

let bossAttackPattern = 0;
let bossPatternTimer = 0;
let bossBurstCount = 0;
let bossBurstInterval = 0;

// =============================================================================
//  CANVAS E ELEMENTOS DOM
// =============================================================================
const canvas = document.getElementById('boss-canvas');
const ctx = canvas.getContext('2d');

const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const gameBox = document.getElementById('game-box');
const quizArea = document.getElementById('quiz-area');
const bossArenaWrapper = document.getElementById('boss-arena-wrapper');

const questionEl = document.getElementById('question');
const inputEl = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const speechEl = document.getElementById('speech-bubble');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timerEl = document.getElementById('timer');
const timerLabel = document.getElementById('timer-label');
const timerUnit = document.getElementById('timer-unit');
const endTitleEl = document.getElementById('end-title');
const endMessageEl = document.getElementById('end-message');
const finalScoreEl = document.getElementById('final-score-val');

const chaosBtn = document.getElementById('chaos-btn');
const handContainer = document.getElementById('hand-container');
const handObstacle = document.getElementById('hand-obstacle');

const leaderboardList = document.getElementById('leaderboard-list');
const saveScoreArea = document.getElementById('save-score-area');
const playerNameInput = document.getElementById('player-name-input');
const saveScoreBtn = document.getElementById('save-score-btn');
const fakePopup = document.getElementById('fake-popup');
const popupOverlay = document.getElementById('popup-overlay');
const popupCloseTop = document.getElementById('popup-close-top');
const popupCloseBtn = document.getElementById('popup-close-btn');
const charImg = document.getElementById('character-img');
const mobileControls = document.getElementById('mobile-controls');

// Graphics Assets
const bossNormalImg = new Image(); bossNormalImg.src = 'character-boss-normal.png';
const bossNormalBrokenImg = new Image(); bossNormalBrokenImg.src = 'character-boss-normal-broken.png';
const bossMadImg = new Image(); bossMadImg.src = 'character-boss-mad.png';
const bossMadBrokenImg = new Image(); bossMadBrokenImg.src = 'character-boss-mad-broken.png';
// explosionImg (image_0.png) is declared in the SPRITESHEET section

let bossX = 230;
let bossY = 30;
let bossDirection = 1;
let bossSpeed = 2;

// Estilos dinâmicos do HUD integrados
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes acidTrip {
        0%   { background-color: #ff0055; filter: hue-rotate(0deg);   }
        100% { background-color: #ff0055; filter: hue-rotate(360deg); }
    }
    .chaos-background-active {
        animation: acidTrip 0.15s infinite linear !important;
    }
    #upgrade-hud {
        position: absolute; top: 5px; left: 5px;
        font-size: 13px; font-weight: bold; font-family: 'Courier New', monospace;
        text-shadow: 0 0 4px #000; z-index: 100; pointer-events: none;
    }
`;
document.head.appendChild(styleSheet);

// =============================================================================
//  SISTEMA DE ÁUDIO & CONTROLE
// =============================================================================
function setupButtonSounds(btn) {
    if (!btn) return;
    btn.addEventListener('mouseenter', () => { if (!isPopupActive && !isBossFightActive) playAudio('hover.mp3'); });
    btn.addEventListener('click', () => { playAudio('clique.mp3'); });
}
setupButtonSounds(submitBtn);
setupButtonSounds(restartBtn);
setupButtonSounds(saveScoreBtn);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// =============================================================================
//  EVENTO: BOTÃO CAOS
// =============================================================================
chaosBtn.addEventListener('click', () => {
    if (isPopupActive || isBossFightActive || isChaosMode) return;
    isChaosMode = true;
    playAudio('som-caos.mp3');
    chaosBtn.classList.add('hidden');
    speechEl.innerText = "🚨 MODO CAOS ATIVADO! PREPARA O SEU CAPACETE QUE O NEGÓCIO FICOU DOIDO!";
    gameBox.classList.add('crazy-spin');
    document.body.classList.add('chaos-background-active');
    const bgMusic = audioObjects['musica.mp3'];
    if (bgMusic) bgMusic.playbackRate = 2.0;
    clearInterval(timerInterval);
    startTimer();
});

// =============================================================================
//  TECLADO E TOUCH (And Cheats detection)
// =============================================================================
window.addEventListener('keydown', (e) => {
    // 1. Core Logic
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && isBossFightActive) e.preventDefault();
    if (canAnswer && inputEl.disabled === false) return; // Ignore cheats if quiz input is typing

    // 2. PC Cheat Code Detection (GTA San Andreas style)
    if (cheatState.pcTimer) clearTimeout(cheatState.pcTimer);
    cheatState.pcBuffer.push(e.key.toLowerCase());
    
    // Convert current buffer to string for checking
    const currentCode = cheatState.pcBuffer.join('');
    
    // Find all cheats that could start with this code
    const possibleCheat = Object.entries(CHEATS).find(([key, val]) => key === currentCode);
    
    if (possibleCheat) {
        // Full cheat matched!
        possibleCheat[1].action();
        cheatState.pcBuffer = []; // Reset on activation
    } else {
        // Could it still be a valid prefix for another cheat?
        const isPrefix = Object.keys(CHEATS).some(key => key.startsWith(currentCode));
        if (!isPrefix) {
            // Buffer is trash, check if the *last* key starts another cheat
            cheatState.pcBuffer = [e.key.toLowerCase()];
        }
    }
    
    // Clear buffer if user stops typing for 1.5 seconds
    cheatState.pcTimer = setTimeout(() => { cheatState.pcBuffer = []; }, 1500);
});

window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Mobile Cheat Detection in quiz box
inputEl.addEventListener('input', (e) => {
    if (!canAnswer || inputEl.disabled) return;
    const currentVal = inputEl.value.trim().toLowerCase();
    
    // GTA Style: The cheat triggers *while* typing, no enter needed.
    for (const [code, cheat] of Object.entries(CHEATS)) {
        if (currentVal.endsWith(code)) {
            cheat.action();
            // Clear input box so they know something happened
            inputEl.value = inputVal.substring(0, inputVal.length - code.length); 
            break; // Max 1 cheat at a time
        }
    }
});

function bindTouchBtn(elementId, targetKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const activate   = (e) => { e.preventDefault(); touchKeys[targetKey] = true; };
    const deactivate = (e) => { e.preventDefault(); touchKeys[targetKey] = false; };
    el.addEventListener('touchstart', activate);
    el.addEventListener('touchend', deactivate);
    el.addEventListener('mousedown', activate);
    el.addEventListener('mouseup', deactivate);
    el.addEventListener('mouseleave', deactivate);
}
bindTouchBtn('btn-up',    'up');
bindTouchBtn('btn-down',  'down');
bindTouchBtn('btn-left',  'left');
bindTouchBtn('btn-right', 'right');
bindTouchBtn('btn-shoot', 'shoot');

handObstacle.addEventListener('click', () => {
    if (isPopupActive) return;
    handClicksRequired--;
    playAudio('clique.mp3'); // A batter sound would be better, using clique as placeholder
    if (handClicksRequired <= 0) {
        isHandActive = false;
        handContainer.classList.add('hidden');
    }
});
handObstacle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handObstacle.click();
});

function triggerFakePopup() {
    if (!canAnswer || isHandActive || isPopupActive || isBossFightActive) return;
    isPopupActive = true;
    playAudio('error.mp3');
    if (fakePopup && popupOverlay) {
        fakePopup.classList.remove('hidden');
        popupOverlay.classList.remove('hidden');
    }
    inputEl.disabled = true;
}

function closeFakePopup() {
    isPopupActive = false;
    if (fakePopup && popupOverlay) {
        fakePopup.classList.add('hidden');
        popupOverlay.classList.add('hidden');
    }
    if (canAnswer && !isBossFightActive) {
        inputEl.disabled = false;
        inputEl.focus();
    }
}
if (popupCloseTop) popupCloseTop.addEventListener('click', closeFakePopup);
if (popupCloseBtn) popupCloseBtn.addEventListener('click', closeFakePopup);

function startTimer() {
    let speed = isChaosMode ? 500 : 1000;
    timerEl.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (isPopupActive || isBossFightActive) return;
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            causeOfDeath = "timeout";
            handleLoss();
        }
    }, speed);
}

function updateLivesDisplay() {
    if (cheatState.godModeOn) {
        livesEl.innerText = "👑 INFINITO";
    } else {
        livesEl.innerText = "❤️".repeat(Math.max(0, lives)) || "💀 Vazio";
    }
}

document.querySelectorAll('.diff-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        currentDifficulty = e.target.getAttribute('data-diff');
        if (currentDifficulty === 'easy')   { scoreMultiplier = 1;   baseTimeLimit = 20; }
        else if (currentDifficulty === 'medium') { scoreMultiplier = 1.5; baseTimeLimit = 15; }
        else if (currentDifficulty === 'hard')   { scoreMultiplier = 2;   baseTimeLimit = 10; }
        playAudio('clique.mp3');
        startGame();
    });
});

function showMainMenu() {
    const bgMusic = audioObjects['musica.mp3'];
    const bossMusic = audioObjects['boss-theme.mp3'];
    const bossMusicHeavy = audioObjects['boss-theme-hard.mp3'];
    
    if (bgMusic)        { bgMusic.pause(); bgMusic.currentTime = 0; bgMusic.playbackRate = 1.0; }
    if (bossMusic)      { bossMusic.pause(); bossMusic.currentTime = 0; }
    if (bossMusicHeavy) { bossMusicHeavy.pause(); bossMusicHeavy.currentTime = 0; }
    cancelAnimationFrame(bossFightAnimationId);

    isBossFightActive = false;
    isDyingSequence = false;
    isWhiteFadeActive = false;
    isWaveTransitionActive = false;
    isCountdownActive = false;
    isInvincible = false;
    isBossFleeing = false;
    closeFakePopup();

    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');

    if (charImg) charImg.src = 'character-idle.png';
    speechEl.innerText = "Acha que sabe tudo do Capítulo 4? Vamos ver.";

    quizArea.classList.remove('hidden');
    bossArenaWrapper.classList.add('hidden');
    if (mobileControls) mobileControls.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    
    // Clear cheats on returning to menu
    Object.values(CHEATS).forEach(cheat => {
        if (cheat.active) { // Some cheats don't store state this way, just manual clear
            // ... add specific clear logic if needed ...
        }
    });
    cheatState.godModeOn = false;
    cheatState.infiniteDamageOn = false;
    cheatState.minCooldownOn = false;
    triggerCheatHudUpdate(''); // Clear hud

    updateLeaderboardDisplay();
}

function startGame() {
    currentIndex = 0; score = 0; lives = 3; causeOfDeath = "wrongAnswer";
    scoreEl.innerText = score; updateLivesDisplay();
    canAnswer = true; isChaosMode = false; isPopupActive = false; isHandActive = false;
    isBossFightActive = false; isDyingSequence = false; isWhiteFadeActive = false;
    isWaveTransitionActive = false; isCountdownActive = false; isInvincible = false;
    isBossFleeing = false; drops = []; player.activeWeapon = 'normal';
    player.speedBoostLevel = 0; player.speedBoostEndTime = 0;

    timerLabel.innerText = "Tempo:"; timerUnit.innerText = "s";
    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');

    if (charImg) charImg.src = 'character-idle.png';
    speechEl.innerText = "Boa sorte... você vai precisar.";

    let shuffled = shuffleArray([...originalQuestionBank]);
    questionBank = shuffled.slice(0, 7);

    menuScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    quizArea.classList.remove('hidden');
    bossArenaWrapper.classList.add('hidden');
    if (mobileControls) mobileControls.classList.add('hidden');
    chaosBtn.classList.remove('hidden');

    const bgMusic = audioObjects['musica.mp3'];
    bgMusic.currentTime = 0;
    bgMusic.playbackRate = 1.0;
    bgMusic.play().catch(e => {});

    loadQuestion();
}

function loadQuestion() {
    canAnswer = true; inputEl.value = ''; inputEl.disabled = false; submitBtn.disabled = false;
    timeLeft = baseTimeLimit;
    closeFakePopup();
    inputEl.focus();

    if (charImg) charImg.src = 'character-idle.png';
    speechEl.innerText = isChaosMode ? "🚨 RESPONDE LOGO NO MEIO DESSE CAOS!!" : "Pensa rápido aí!";

    questionEl.innerText = questionBank[currentIndex].question;

    if (currentIndex === 1 || currentIndex === 4) {
        handClicksRequired = 5; isHandActive = true; handContainer.classList.remove('hidden');
    } else {
        isHandActive = false; handContainer.classList.add('hidden');
    }

    if (!isHandActive && !isChaosMode) {
        let popupChance = currentDifficulty === 'hard' ? 0.5 : 0.25;
        if (currentIndex > 0 && Math.random() < popupChance) {
            setTimeout(() => {
                if (!isBossFightActive && canAnswer) triggerFakePopup();
            }, 1500);
        }
    }
    startTimer();
}

function checkAnswer() {
    if (!canAnswer || isPopupActive) return;
    canAnswer = false;
    clearInterval(timerInterval);
    inputEl.disabled = true;
    submitBtn.disabled = true;

    const playerAnswer  = inputEl.value.trim().toLowerCase();
    const correctAnswer = questionBank[currentIndex].answer.toLowerCase();

    if (playerAnswer === correctAnswer) {
        score += Math.round(10 * scoreMultiplier);
        scoreEl.innerText = score;
        playAudio('correct.mp3');
        if (charImg) charImg.src = 'character-laughing.png';
        speechEl.innerText = "Olha só, acertou! Não fez mais que sua obrigação.";
        nextStepSequence(true);
    } else {
        playAudio('wrong.mp3');
        causeOfDeath = "wrongAnswer";
        if (charImg) charImg.src = 'character-annoyed.png';
        speechEl.innerText = "Caramba, que resposta horrível! Errou feio.";
        lives--;
        updateLivesDisplay();
        if (lives <= 0 && !cheatState.godModeOn) {
            setTimeout(endGame, 1500);
        } else {
            if (cheatState.godModeOn && lives <= 0) lives = 1; // Prevent death in quiz
            nextStepSequence(false);
        }
    }
}

function handleLoss() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0 && !cheatState.godModeOn) {
        setTimeout(endGame, 1500);
    } else {
        if (cheatState.godModeOn && lives <= 0) lives = 1; // Prevent death in quiz
        nextStepSequence(false);
    }
}

function nextStepSequence(correct) {
    setTimeout(() => {
        if (lives <= 0 && !cheatState.godModeOn) return;
        currentIndex++;
        if (currentIndex < questionBank.length) {
            loadQuestion();
        } else {
            startBossFightTransition();
        }
    }, 2000);
}

// =============================================================================
//  TRANSIÇÃO PARA BOSS FIGHT
// =============================================================================
function startBossFightTransition() {
    clearInterval(timerInterval);
    closeFakePopup();

    const bgMusic = audioObjects['musica.mp3'];
    const bossMusic = audioObjects['boss-theme.mp3'];
    const bossMusicHeavy = audioObjects['boss-theme-hard.mp3'];

    bgMusic.pause();
    bossMusic.currentTime = 0;
    bossMusic.play().catch(e => {});

    playAudio('som-caos.mp3');
    speechEl.innerText = "💥 CANSEI DE PERGUNTAS! HORA DO BULLET HELL!";

    currentWave = 1;
    bossPhase = 0;
    if (!cheatState.godModeOn) lives = 3; // Refill only if not cheating
    updateLivesDisplay();

    if (currentDifficulty === 'easy')        diffSpeedMultiplier = 0.85; 
    else if (currentDifficulty === 'medium') diffSpeedMultiplier = 1.1;
    else if (currentDifficulty === 'hard')   { diffSpeedMultiplier = 1.35; }

    player.x = 280; player.y = 340; 
    // Do not reset player weapon if cheating
    player.x = 280; player.y = 340;
    playerBullets = []; enemyBullets = []; enemies = []; explosions = []; drops = [];
    bossX = 230; bossY = 30; bossDyingY = 30;
    isInvincible = false; isBossFleeing = false;

    quizArea.classList.add('hidden');
    bossArenaWrapper.classList.remove('hidden');
    if (mobileControls) mobileControls.classList.remove('hidden');
    chaosBtn.classList.add('hidden');

    timerLabel.innerText = "Onda:";
    timerEl.innerText = "1 / 6";
    timerUnit.innerText = "";

    isBossFightActive = true;
    isCountdownActive = true;
    countdownNumber = 3;
    countdownTimer = 180;

    createUpgradeHud();
    bossFightLoop();
}

function createUpgradeHud() {
    let existing = document.getElementById('upgrade-hud');
    if (existing) existing.remove();
    let hud = document.createElement('div');
    hud.id = 'upgrade-hud';
    bossArenaWrapper.appendChild(hud);
    updateUpgradeHud();
}

function updateUpgradeHud() {
    let hud = document.getElementById('upgrade-hud');
    if (!hud) return;
    let label = player.activeWeapon.toUpperCase();
    let txt = `ARMA ATIVA: [${label}]`;
    
    if (player.speedBoostLevel > 0 && player.speedBoostEndTime > Date.now()) {
        let timeLeftSec = Math.ceil((player.speedBoostEndTime - Date.now()) / 1000);
        txt += ` | ⚡ VELOCIDADE: Lvl ${player.speedBoostLevel} (${timeLeftSec}s)`;
    }
    
    hud.innerText = txt;
    if (player.activeWeapon === 'normal') hud.style.color = '#ffffff';
    else if (player.activeWeapon === 'shotgun') hud.style.color = '#ffa502';
    else if (player.activeWeapon === 'smg') hud.style.color = '#1e90ff';
    else if (player.activeWeapon === 'sniper') hud.style.color = '#9900ff';
}

function triggerWaveTransition(text) {
    isWaveTransitionActive = true;
    transitionText = text;
    transitionTimer = 110;
    enemyBullets = [];
    playerBullets = [];
}

function spawnWave() {
    player.x = 280; player.y = 340;
    enemies = [];
    let count = currentDifficulty === 'hard' ? 7 : currentDifficulty === 'medium' ? 5 : 4;

    if (currentWave === 1) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: 50 + i * (500 / count), y: -40 - (i * 45), type: 'cubo',     hp: 2, speedY: 1.5 * diffSpeedMultiplier, speedX: 0, lastShot: 0 });
        }
    } else if (currentWave === 2) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: 40 + i * (500 / count), y: -50 - (i * 30), type: 'cilindro', hp: 3, speedY: 0.5 * diffSpeedMultiplier, speedX: 1.8 * diffSpeedMultiplier, lastShot: Date.now() + (i * 300) });
        }
    } else if (currentWave === 3) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: Math.random() * 520 + 20, y: -40 - (i * 50), type: 'piramide', hp: 2, speedY: 2.5 * diffSpeedMultiplier, speedX: (Math.random() - 0.5) * 2 * diffSpeedMultiplier, lastShot: 0 });
        }
    } else if (currentWave === 4) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: Math.random() * 500 + 30, y: -40 - (i * 50), type: 'cone', hp: 2, speedY: 2.2 * diffSpeedMultiplier, speedX: 2.5 * (i % 2 === 0 ? 1 : -1), lastShot: 0 });
        }
    } else if (currentWave === 5) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: 60 + i * (450 / count), y: -60 - (i * 20), type: 'esfera', hp: 4, speedY: 0.8 * diffSpeedMultiplier, speedX: 0, lastShot: Date.now() + (i * 400) });
        }
    } else if (currentWave === 6) {
        for (let i = 0; i < count * 2; i++) {
            enemies.push({ x: Math.random() * 560, y: -20 - (i * 35), type: 'fragmento', hp: 1, speedY: 3.5 * diffSpeedMultiplier, speedX: (Math.random() - 0.5) * 1.5, lastShot: 0 });
        }
    }
}

// Fixed function for Spritesheet animation
function addExplosion(x, y, size, isEnemyKill = false) {
    if (isEnemyKill) {
        // User requested: hit sound first, then explosion when enemy dies.
        // Also balanced audio, explosion is louder.
        playHitSound(); 
        playAudio('explosion.mp3'); 
    }
    explosions.push({ 
        x, y, size, 
        currentFrame: 0, // Current index in spritesheet (0-22)
        timer: 0 // Used to control frame rate of animation
    });
}

function initBossEntity(phase) {
    bossPhase = phase;
    bossAttackPattern = 1;
    bossPatternTimer = 0;
    bossBurstCount = 0;

    if (phase === 1) {
        bossHp    = currentDifficulty === 'hard' ? 160 : currentDifficulty === 'medium' ? 120 : 85;
        maxBossHp = bossHp;
        timerLabel.innerText = "FASE:";
        timerEl.innerText = "CHEFE";
    } else if (phase === 3) {
        bossHp    = currentDifficulty === 'hard' ? 190 : currentDifficulty === 'medium' ? 140 : 95;
        maxBossHp = bossHp;
        timerLabel.innerText = "FINAL:";
        timerEl.innerText = "GEOMETRIA";
    }
    updateBossHpBar();
}

function updateBossHpBar() {
    const pct = Math.max(0, (bossHp / maxBossHp) * 100);
    const hpBar = document.getElementById('boss-hp-bar');
    if (hpBar) hpBar.style.width = `${pct}%`;
    const hpText = document.getElementById('boss-hp-text');
    if (hpText) {
        if (bossPhase === 0) {
            hpText.innerText = `LIMPE AS FORMAS (ONDA ${currentWave}/6)`;
        } else {
            hpText.innerText = `CHEFE: FASE ${bossPhase} (${bossHp} HP)`;
        }
    }
}

function bossFightLoop() {
    if (!isBossFightActive) return;
    updateBfLogic();
    renderBfGraphics();
    bossFightAnimationId = requestAnimationFrame(bossFightLoop);
}

// =============================================================================
//  LÓGICA PRINCIPAL DA BATALHA
// =============================================================================
function updateBfLogic() {
    // Dynamic HUD updates (active cheats etc)
    updateUpgradeHud();
    
    // GTA Cheats: Also check PC combos here in case they were typed over menu
    // ... logic handled by keydown already ...

    // GTA Cheats: Clear Hud after a while
    if (cheatState.cheatMsgTimer > 0) {
        cheatState.cheatMsgTimer--;
        if(cheatState.cheatMsgTimer <= 0) triggerCheatHudUpdate('');
    }

    // --- Fixed Spritesheet Explosions ---
    // Update animation frames based on timers
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        exp.timer++;
        
        // Change frame every 2 updates (speed)
        if (exp.timer % 2 === 0) { 
            exp.currentFrame++;
        }

        // Delete when sequence is complete
        if (exp.currentFrame >= EXPLOSION_FRAME_COUNT) {
            explosions.splice(i, 1);
        }
    }

    // --- Controle do Buff de Velocidade Temporário (Stackable) ---
    if (player.speedBoostEndTime) {
        if (Date.now() > player.speedBoostEndTime) {
            player.speedBoostLevel = 0;
            player.speedBoostEndTime = 0;
        }
    } else {
        player.speedBoostLevel = 0;
    }

    // --- Movimentação e Coleta dos Loot Drops ---
    for (let i = drops.length - 1; i >= 0; i--) {
        let d = drops[i];
        d.y += 1.5; 
        
        if (d.y > 410) {
            drops.splice(i, 1);
            continue;
        }

        if (checkCollision(player, d)) {
            if (d.type === 'heart') {
                if (lives < 3 || cheatState.godModeOn) { 
                    lives++;
                    if(!cheatState.godModeOn && lives > 3) lives = 3; // Caps heart collections if not cheating
                    updateLivesDisplay();
                    playAudio('correct.mp3');
                }
            } else if (d.type === 'speed') {
                player.speedBoostLevel = (player.speedBoostLevel || 0) + 1;
                player.speedBoostEndTime = Date.now() + 30000; // Define/Reseta para 30 segundos
                playAudio('som-caos.mp3');
            } else {
                player.activeWeapon = d.type;
                playAudio('som-caos.mp3');
            }
            drops.splice(i, 1);
        }
    }

    if (isBossFleeing) {
        bossFleeTimer++;
        if (bossFleeTimer < 65) {
            bossX += Math.sin(bossFleeTimer * 2.5) * 4.5;
        } else {
            bossY -= 8;
        }
        if (bossY < -140) {
            isBossFleeing = false;
            bossPhase = 0;
            bossY = 30;
            currentWave = 4;
            triggerWaveTransition("FUGIU LÁ PRA CIMA! PREPARA!");
        }
        return;
    }

    if (isCountdownActive) {
        countdownTimer--;
        if (countdownTimer === 120) { countdownNumber = 2; playAudio('clique.mp3'); }
        if (countdownTimer === 60)  { countdownNumber = 1; playAudio('clique.mp3'); }
        if (countdownTimer <= 0) {
            isCountdownActive = false;
            playAudio('som-caos.mp3');
            triggerWaveTransition("ONDA 1");
        }
        return;
    }

    if (isWaveTransitionActive) {
        transitionTimer--;
        if (transitionTimer <= 0) {
            isWaveTransitionActive = false;
            if (bossPhase === 0) spawnWave();
        }
        return;
    }

    if (isDyingSequence) return;

    if (isInvincible) {
        invincibleTimer--;
        blinkTimer++;
        if (invincibleTimer <= 0) isInvincible = false;
    }

    // --- Movimento do jogador (Modificado pelo Upgrade de Velocidade) ---
    let currentSpeed = player.speed + (player.speedBoostLevel * 0.9);
    // GTA Cheat check: Don't cap if speed hack activated
    const isSpeedHacking = player.speedBoostLevel > 5;
    if (isSpeedHacking && !cheatState.isSansCodeTriggered) currentSpeed = player.speed + (5 * 0.9); 

    if (keys['w'] || keys['arrowup']    || touchKeys.up)    player.y = Math.max(120, player.y - currentSpeed);
    if (keys['s'] || keys['arrowdown']  || touchKeys.down)  player.y = Math.min(370, player.y + currentSpeed);
    if (keys['a'] || keys['arrowleft']  || touchKeys.left)  player.x = Math.max(0,   player.x - currentSpeed);
    if (keys['d'] || keys['arrowright'] || touchKeys.right) player.x = Math.min(580, player.x + currentSpeed);

    // --- Atirar com base nas Armas Adquiridas e Cheats ---
    if (keys[' '] || keys['spacebar'] || touchKeys.shoot) {
        let now = Date.now();
        let fireRate = 160; 
        
        // GTA Cheats: weapon type selection overrides default logic
        if (player.activeWeapon === 'smg') fireRate = 55;        
        if (player.activeWeapon === 'shotgun') fireRate = 380;   
        if (player.activeWeapon === 'sniper') fireRate = 650;    

        // GTA Cheats: min cooldown override
        if (cheatState.minCooldownOn) fireRate = 1; // essentially immediate

        // Aplicação da melhoria de cadência de tiro do Upgrade de Velocidade
        let fireRateMultiplier = Math.max(0.35, 1 - (player.speedBoostLevel * 0.14));
        // GTA Cheat: Speed upgrade boosts are already balanced, maybe don't multiply? User didn't request a change.
        fireRate = Math.round(fireRate * fireRateMultiplier);

        if (now - lastShotTime > fireRate) {
            lastShotTime = now;
            playAudio('laser.mp3');

            // Apply Infinite Damage Cheat Flag to projectiles
            let damage = cheatState.infiniteDamageOn ? 999 : 1; 

            if (player.activeWeapon === 'normal') {
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedY: -9, speedX: 0, damage: damage, width: 4, height: 10 });
            } 
            else if (player.activeWeapon === 'smg') {
                // SMG shoots faster, lower damage per shot
                let smgDamage = cheatState.infiniteDamageOn ? 999 : 0.5;
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedY: -12, speedX: 0, damage: smgDamage, width: 4, height: 8 });
            } 
            else if (player.activeWeapon === 'shotgun') {
                // Shotgun shoots 3 projectiles
                let sgDamage = cheatState.infiniteDamageOn ? 999 : 1.2;
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedY: -5.5, speedX: 0, damage: sgDamage, width: 6, height: 10 });
                playerBullets.push({ x: player.x + 5, y: player.y - 5, speedY: -5.2, speedX: -1.8, damage: sgDamage, width: 6, height: 10 });
                playerBullets.push({ x: player.x + 9, y: player.y - 5, speedY: -5.2, speedX: 1.8, damage: sgDamage, width: 6, height: 10 });
            } 
            else if (player.activeWeapon === 'sniper') {
                // Sniper is slower, homing, high damage
                let sniperDamage = cheatState.infiniteDamageOn ? 999 : 5;
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedVal: 7, damage: sniperDamage, width: 6, height: 14, isHoming: true, speedX: 0, speedY: -7 });
            }
        }
    }

    // --- Movimento dos Projéteis Aliados ---
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        
        if (b.isHoming) {
            let target = null;
            if (bossPhase > 0) {
                target = { x: bossX + 70, y: bossY + 45 };
            } else if (enemies.length > 0) {
                let minDist = 999999;
                enemies.forEach(e => {
                    let d = Math.pow(e.x - b.x, 2) + Math.pow(e.y - b.y, 2);
                    if (d < minDist) { minDist = d; target = { x: e.x + 12, y: e.y + 12 }; }
                });
            }
            if (target) {
                let dx = target.x - b.x;
                let dy = target.y - b.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                b.speedX = (dx / dist) * b.speedVal;
                b.speedY = (dy / dist) * b.speedVal;
            }
            b.x += b.speedX;
            b.y += b.speedY;
        } else {
            b.y += b.speedY;
            if (b.speedX) b.x += b.speedX;
        }

        if (b.y < -20 || b.y > 420 || b.x < -20 || b.x > 620) {
            playerBullets.splice(i, 1);
        }
    }

    // ==========================================================================
    //  FASE 0 — ONDAS DE INIMIGOS
    // ==========================================================================
    if (bossPhase === 0) {
        updateBossHpBar();
        timerEl.innerText = `${currentWave} / 6`;

        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            e.y += e.speedY;
            e.x += e.speedX;

            if ((e.type === 'cilindro' || e.type === 'cone') && (e.x < 10 || e.x > 560)) e.speedX *= -1;
            if (e.y > 400) { e.y = -40; e.x = Math.random() * 540; }

            let shootInterval = currentDifficulty === 'hard' ? 1200 : currentDifficulty === 'medium' ? 1700 : 2500;
            if ((e.type === 'cilindro' || e.type === 'esfera') && Date.now() - e.lastShot > shootInterval) {
                enemyBullets.push({ x: e.x + 12, y: e.y + 20, speedY: 3 * diffSpeedMultiplier, speedX: 0, width: 10, height: 10, type: 'basic' });
                e.lastShot = Date.now();
            }

            if (checkCollision(player, { x: e.x, y: e.y, width: 25, height: 25 })) {
                // ProperSpritesheet Explosion on enemy collision
                addExplosion(e.x - 10, e.y - 10, 50); // Just explosion sound, not kill yet.
                enemies.splice(i, 1);
                playerHit();
                continue;
            }

            for (let j = playerBullets.length - 1; j >= 0; j--) {
                let b = playerBullets[j];
                if (checkCollision(b, { x: e.x, y: e.y, width: 25, height: 25 })) {
                    // Update: Play hit sound *before* damage is checked, every single hit.
                    playHitSound(); 
                    e.hp -= b.damage;
                    playerBullets.splice(j, 1);
                    
                    if (e.hp <= 0) {
                        // User request: Play hit sound, THEN play explosion when enemy dies. Balanced audio.
                        addExplosion(e.x - 15, e.y - 15, 60, true); // enemyKill = true -> plays hit THEN explosion and louder. Proper Spritesheet
                        enemies.splice(i, 1);
                        score += Math.round(5 * scoreMultiplier);
                        scoreEl.innerText = score;

                        // Balanceamento de Loot Drops: Chance reduzida para 15% (Mais difícil)
                        // GTA Cheats: Drops logic is not changed by cheats, it is already balanced. User didn't request a change.
                        if (Math.random() < 0.15) {
                            let rng = Math.random();
                            let dropType = 'heart';
                            if (rng < 0.30) dropType = 'heart';
                            else if (rng < 0.65) dropType = 'speed';   // 35% de chance de speed boost
                            else if (rng < 0.80) dropType = 'shotgun'; // 15% de chance
                            else if (rng < 0.92) dropType = 'smg';     // 12% de chance
                            else dropType = 'sniper';                  // 8% de chance

                            drops.push({ x: e.x + 4, y: e.y + 4, width: 18, height: 18, type: dropType });
                        }
                    }
                    break; // Bullet already processed
                }
            }
        }

        if (enemies.length === 0 && !isWaveTransitionActive) {
            if (currentWave === 3) {
                initBossEntity(1);
                triggerWaveTransition("O BOSS APARECEU!");
            } else if (currentWave === 6) {
                initBossEntity(3);
                triggerWaveTransition("CONFRONTO FINAL!");
                const bossMusic = audioObjects['boss-theme.mp3'];
                const bossMusicHeavy = audioObjects['boss-theme-hard.mp3'];
                if (bossMusic) bossMusic.pause();
                if (bossMusicHeavy) { bossMusicHeavy.currentTime = 0; bossMusicHeavy.play().catch(e => {}); }
            } else {
                currentWave++;
                triggerWaveTransition(`ONDA ${currentWave}`);
            }
        }

    // ==========================================================================
    //  PADRÕES DO CHEFE
    // ==========================================================================
    } else {
        bossSpeed = (bossPhase === 1 ? 2.0 : bossPhase === 2 ? 3.2 : 5.0) * (diffSpeedMultiplier * 0.85);
        bossX += bossSpeed * bossDirection;
        if (bossX < 20 || bossX > 440) bossDirection *= -1;

        bossPatternTimer++;
        let originY = bossY + 80;
        let originX = bossX + 70;

        if (bossAttackPattern === 1) {
            let fireRate = currentDifficulty === 'hard' ? 28 : currentDifficulty === 'medium' ? 38 : 55;
            let duration = currentDifficulty === 'hard' ? 180 : 220;
            if (bossPatternTimer % fireRate === 0) {
                let numBeams = currentDifficulty === 'hard' ? 5 : currentDifficulty === 'medium' ? 4 : 3;
                let spread = currentDifficulty === 'hard' ? 52 : 60;
                for (let b = 0; b < numBeams; b++) {
                    let offsetX = (b - Math.floor(numBeams / 2)) * spread;
                    enemyBullets.push({
                        x: bossX + 70 + offsetX, y: originY,
                        speedY: 3.8 * diffSpeedMultiplier, speedX: 0,
                        width: 10, height: 30, type: 'beam'
                    });
                }
            }
            if (bossPatternTimer > duration) { bossAttackPattern = 2; bossPatternTimer = 0; bossBurstCount = 0; }
        }

        else if (bossAttackPattern === 2) {
            let maxBursts = currentDifficulty === 'hard' ? 3 : currentDifficulty === 'medium' ? 2 : 1;
            let plasmaInterval = currentDifficulty === 'hard' ? 12 : 16;
            let plasmaSpeed = (currentDifficulty === 'hard' ? 4.8 : currentDifficulty === 'medium' ? 4.0 : 3.0) * diffSpeedMultiplier;

            if (bossBurstCount < maxBursts) {
                bossBurstInterval++;
                if (bossBurstInterval % plasmaInterval === 0 && bossBurstInterval < 80) {
                    let dx = player.x - originX;
                    let dy = player.y - originY;
                    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    enemyBullets.push({
                        x: originX, y: originY,
                        speedY: (dy / dist) * plasmaSpeed,
                        speedX: (dx / dist) * plasmaSpeed,
                        width: 14, height: 14, type: 'plasma'
                    });
                }
                if (bossBurstInterval >= 110) { bossBurstCount++; bossBurstInterval = 0; }
            } else {
                bossAttackPattern = 3; bossPatternTimer = 0;
            }
        }

        else if (bossAttackPattern === 3) {
            let spawnRate = currentDifficulty === 'hard' ? 50 : currentDifficulty === 'medium' ? 65 : 85;
            let bombTimer = currentDifficulty === 'hard' ? 55 : currentDifficulty === 'medium' ? 70 : 90;

            if (bossPatternTimer % spawnRate === 0 && bossPatternTimer < 150) {
                let spawnX = 40 + Math.random() * 500;
                let spawnY = 130 + Math.random() * 110;
                enemyBullets.push({
                    x: spawnX, y: spawnY, speedX: 0, speedY: 0.2,
                    width: 26, height: 26, type: 'bomb', timer: bombTimer, maxTimer: bombTimer
                });
            }

            let duration3 = currentDifficulty === 'hard' ? 180 : 200;
            if (bossPatternTimer > duration3) {
                bossAttackPattern = (bossPhase === 3) ? 4 : 1;
                bossPatternTimer = 0;
            }
        }

        else if (bossAttackPattern === 4) {
            let beamInterval = currentDifficulty === 'hard' ? 15 : currentDifficulty === 'medium' ? 22 : 35;
            if (bossPatternTimer % beamInterval === 0) {
                enemyBullets.push({
                    x: Math.random() * 570, y: originY - 10,
                    speedY: (3.5 + Math.random() * 3.5) * diffSpeedMultiplier,
                    speedX: (Math.random() - 0.5) * 1.5,
                    width: 8, height: 22, type: 'beam'
                });
            }
            if (bossPatternTimer > 200) { bossAttackPattern = 1; bossPatternTimer = 0; }
        }

        for (let j = playerBullets.length - 1; j >= 0; j--) {
            let b = playerBullets[j];
            if (checkCollision(b, { x: bossX, y: bossY, width: 140, height: 90 })) {
                // Boss Hit: Also plays the balanced hit sound
                playHitSound();
                bossHp -= b.damage;
                playerBullets.splice(j, 1);
                updateBossHpBar();

                if (bossPhase === 1 && bossHp <= Math.round(maxBossHp * 0.5)) {
                    bossPhase = 2;
                } else if (bossPhase === 2 && bossHp <= 0) {
                    isBossFleeing = true; bossFleeTimer = 0;
                    enemyBullets = []; playerBullets = []; drops = [];
                    break;
                } else if (bossPhase === 3 && bossHp <= 0) {
                    triggerDyingSequence();
                    break;
                }
                break;
            }
        }
    }

    // ==========================================================================
    //  PROCESSAMENTO DE PROJÉTEIS INIMIGOS E MATEMÁTICA ESPIRAL
    // ==========================================================================
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];

        if (eb.type === 'bomb') {
            eb.timer--;
            eb.y += eb.speedY;

            if (eb.timer <= 0) {
                // Alerta de bomba: Adiciona explosão limpa (branca transparente, sem sprite)
                addExplosion(eb.x - 10, eb.y - 10, 45); // ProperSpritesheet explosion sound not kills
                
                let baseAngle = Math.random() * Math.PI; 
                for (let arm = 0; arm < 4; arm++) {
                    let startAngle = baseAngle + (arm * (Math.PI / 2)); 
                    enemyBullets.push({
                        cx: eb.x + 13, cy: eb.y + 13,
                        x: eb.x + 13,  y: eb.y + 13,
                        radius: 0, angle: startAngle,
                        radialSpeed: 2.2 * diffSpeedMultiplier, 
                        angularSpeed: 0.04,                    
                        width: 10, height: 10, type: 'spiral_arm',
                        color: arm % 2 === 0 ? '#ff9900' : '#ff4444'
                    });
                }
                enemyBullets.splice(i, 1);
                continue;
            }
        } 
        else if (eb.type === 'spiral_arm') {
            eb.radius += eb.radialSpeed;
            eb.angle += eb.angularSpeed;
            eb.x = eb.cx + Math.cos(eb.angle) * eb.radius;
            eb.y = eb.cy + Math.sin(eb.angle) * eb.radius;
        } 
        else {
            eb.y += eb.speedY;
            eb.x += eb.speedX;
        }

        if (eb.y > 410 || eb.y < -60 || eb.x < -50 || eb.x > 650) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (!isInvincible && checkCollision(eb, { x: player.x, y: player.y, width: player.width, height: player.height })) {
            if (eb.type !== 'bomb') { 
                enemyBullets.splice(i, 1);
                playerHit();
            }
        }
    }
}

// =============================================================================
//  RENDERIZAÇÃO GERAL DO CANVAS
// =============================================================================
function renderBfGraphics() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Desenhar Loot Drops de Upgrades ---
    drops.forEach(d => {
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(d.x, d.y, d.width, d.height);
        ctx.strokeRect(d.x, d.y, d.width, d.height);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (d.type === 'heart') {
            ctx.font = '12px sans-serif';
            ctx.fillText('❤️', d.x + d.width/2, d.y + d.height/2);
        } else if (d.type === 'speed') {
            ctx.fillStyle = '#fffa65';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('⚡', d.x + d.width/2, d.y + d.height/2);
        } else {
            ctx.fillStyle = d.type === 'shotgun' ? '#ffa502' : d.type === 'smg' ? '#1e90ff' : '#9900ff';
            ctx.font = 'bold 9px monospace';
            let txt = d.type === 'shotgun' ? 'SG' : d.type === 'smg' ? 'MG' : 'SP';
            ctx.fillText(txt, d.x + d.width/2, d.y + d.height/2);
        }
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; 

    // --- Jogador ---
    if (!isInvincible || (Math.floor(blinkTimer / 4) % 2 === 0)) {
        // GTA God Mode Visual override
        ctx.fillStyle = cheatState.godModeOn ? '#f9ca24' : isInvincible ? '#ffcc00' : '#2ed573';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = '#fff'; ctx.fillRect(player.x + 7, player.y + 7, 4, 4);
    }

    // --- Projéteis Aliados ---
    playerBullets.forEach(b => {
        ctx.fillStyle = player.activeWeapon === 'shotgun' ? '#ffa502' : player.activeWeapon === 'smg' ? '#1e90ff' : player.activeWeapon === 'sniper' ? '#9900ff' : '#00ffff';
        if(cheatState.infiniteDamageOn) ctx.fillStyle = '#ff0000'; // Make infinite damage red for distinction
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // --- Inimigos das Ondas Normais ---
    if (bossPhase === 0 && !isWaveTransitionActive && !isCountdownActive) {
        ctx.lineWidth = 2;
        enemies.forEach(e => {
            ctx.strokeStyle = '#fff';
            if (e.type === 'cubo') {
                ctx.fillStyle = '#ffa502'; ctx.fillRect(e.x, e.y, 25, 25); ctx.strokeRect(e.x, e.y, 25, 25);
            } else if (e.type === 'cilindro') {
                ctx.fillStyle = '#1e90ff'; ctx.beginPath(); ctx.arc(e.x + 12, e.y + 12, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (e.type === 'piramide') {
                ctx.fillStyle = '#ff4757'; ctx.beginPath();
                ctx.moveTo(e.x + 12, e.y); ctx.lineTo(e.x, e.y + 25); ctx.lineTo(e.x + 25, e.y + 25);
                ctx.closePath(); ctx.fill(); ctx.stroke();
            } else if (e.type === 'cone') {
                ctx.fillStyle = '#eccc68'; ctx.fillRect(e.x, e.y, 20, 20); ctx.strokeRect(e.x, e.y, 20, 20);
            } else if (e.type === 'esfera') {
                ctx.fillStyle = '#747d8c'; ctx.beginPath(); ctx.arc(e.x + 12, e.y + 12, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (e.type === 'fragmento') {
                ctx.fillStyle = '#ff6b81'; ctx.fillRect(e.x, e.y, 10, 10);
            }
        });
        ctx.lineWidth = 1;
    }

    // --- Sprite do Chefe ---
    else if (bossPhase > 0 && (!isDyingSequence || dyingTimer < 35)) {
        let activeBossImg = bossNormalImg;
        let hpPercentage = bossHp / maxBossHp;
        if (bossPhase === 1) activeBossImg = bossNormalImg;
        else if (bossPhase === 2) activeBossImg = bossNormalBrokenImg;
        else if (bossPhase === 3) activeBossImg = hpPercentage > 0.15 ? bossMadImg : bossMadBrokenImg;

        let renderY = isDyingSequence ? bossDyingY : bossY;
        if (activeBossImg.complete && activeBossImg.naturalWidth !== 0) {
            ctx.imageSmoothingEnabled = false;
            let aspect = activeBossImg.naturalHeight / activeBossImg.naturalWidth;
            let h = 140 * aspect;
            ctx.drawImage(activeBossImg, bossX, renderY + (90 - h) / 2, 140, h);
        } else {
            ctx.fillStyle = (bossPhase === 3) ? '#ff3838' : '#57606f';
            ctx.fillRect(bossX, renderY, 140, 90);
        }
    }

    // --- Projéteis Inimigos e Balas Espirais ---
    ctx.lineWidth = 2;
    enemyBullets.forEach(eb => {
        if (eb.type === 'bomb') {
            let col = Math.floor(eb.timer / 6) % 2 === 0;
            ctx.strokeStyle = col ? '#ff3838' : '#ffcc00';
            ctx.fillStyle   = col ? 'rgba(255,56,56,0.2)' : 'rgba(255,204,0,0.2)';
            ctx.strokeRect(eb.x, eb.y, eb.width, eb.height);
            ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
            
            ctx.fillStyle = ctx.strokeStyle; ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center'; ctx.fillText('!', eb.x + 13, eb.y + 18); ctx.textAlign = 'left';
        } 
        else if (eb.type === 'spiral_arm') {
            ctx.fillStyle = eb.color || '#ffcc00';
            ctx.beginPath(); ctx.arc(eb.x, eb.y, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; 
            ctx.beginPath(); ctx.arc(eb.x, eb.y, 1.8, 0, Math.PI * 2); ctx.fill();
        } 
        else if (eb.type === 'beam') {
            ctx.fillStyle = '#ff3838'; ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(eb.x + 2, eb.y, eb.width - 4, eb.height);
        } 
        else if (eb.type === 'plasma') {
            ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(eb.x, eb.y, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(eb.x, eb.y, 3, 0, Math.PI * 2); ctx.fill();
        } 
        else {
            ctx.fillStyle = '#ff4757'; ctx.fillRect(eb.x, eb.y, 8, 8);
        }
    });
    ctx.lineWidth = 1;

    // --- Fixed proper Spritesheet Explosions ---
    explosions.forEach(exp => {
        const frameData = getExplosionFrameRect(exp.currentFrame);
        if (frameData && explosionImg.complete && explosionImg.naturalWidth !== 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - exp.currentFrame / EXPLOSION_FRAME_COUNT); // Fade out
            ctx.imageSmoothingEnabled = false; // Keep pixelated look
            ctx.drawImage(
                explosionImg,
                frameData.sx, frameData.sy, frameData.sw, frameData.sh, // Source Rect
                exp.x, exp.y, exp.size, exp.size // Destination Rect
            );
            ctx.restore();
        } else {
            // Fallback clear circle, not needed now properly fixed but kept for bomb spiral triggers which don't use sprites
            if (!exp.isKill) {
                ctx.fillStyle = `rgba(255, 255, 255, ${1 - exp.currentFrame / EXPLOSION_FRAME_COUNT})`;
                ctx.beginPath();
                ctx.arc(exp.x + exp.size / 2, exp.y + exp.size / 2, (exp.size / 2) * (1 + exp.currentFrame / (EXPLOSION_FRAME_COUNT/2)), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    if (isCountdownActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff3838'; ctx.font = 'bold 22px "Courier New"'; ctx.textAlign = 'center';
        ctx.fillText("PREPARE-SE PARA DETONAR...", 300, 160);
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 70px "Courier New"'; ctx.fillText(countdownNumber, 300, 245);
        ctx.textAlign = 'left';
    }

    if (isWaveTransitionActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 30px "Courier New"'; ctx.textAlign = 'center';
        ctx.fillText(transitionText, 300, 195);
        ctx.fillStyle = '#ffffff'; ctx.font = '14px "Courier New"'; ctx.fillText("PREPARE-SE...", 300, 235);
        ctx.textAlign = 'left';
    }

    if (isWhiteFadeActive) {
        ctx.fillStyle = `rgba(255, 255, 255, ${whiteFadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function checkCollision(rect1, rect2) {
    let r1w = rect1.width || 8;
    let r1h = rect1.height || 8;
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + r1w > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + r1h > rect2.y;
}

function playerHit() {
    // GTA God Mode Check
    if (cheatState.godModeOn) {
        playAudio('hit-enemy.mp3'); // Play sound to indicate hit, but no damage
        return; 
    }
    
    if (isInvincible || isDyingSequence || isBossFleeing) return;
    playAudio('player-damage.mp3');
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        causeOfDeath = "bulletHell";
        endGame();
    } else {
        isInvincible = true;
        invincibleTimer = INVINCIBLE_DURATION;
        blinkTimer = 0;
    }
}

function triggerDyingSequence() {
    isDyingSequence = true;
    const bossMusicHeavy = audioObjects['boss-theme-hard.mp3'];
    if (bossMusicHeavy) bossMusicHeavy.pause();
    enemyBullets = []; playerBullets = []; drops = [];
    gameBox.classList.add('crazy-spin');

    let dyingInterval = setInterval(() => {
        dyingTimer++; bossDyingY -= 1.4;
        // User requested: kill enemy = hit sound THEN explosion, balanced louder. Proper Spritesheet
        addExplosion(bossX + Math.random() * 100, bossDyingY + Math.random() * 50, 65, true); 
        if (dyingTimer >= 35) {
            clearInterval(dyingInterval);
            addExplosion(bossX - 40, bossDyingY - 40, 220, true); // Grande detonação final
            setTimeout(() => {
                gameBox.classList.remove('crazy-spin');
                isWhiteFadeActive = true;
                let fadeInterval = setInterval(() => {
                    whiteFadeAlpha += 0.15;
                    if (whiteFadeAlpha >= 1.0) {
                        clearInterval(fadeInterval);
                        setTimeout(() => { bossDefeated(); }, 800);
                    }
                }, 60);
            }, 400);
        }
    }, 80);
}

function bossDefeated() {
    isBossFightActive = false;
    cancelAnimationFrame(bossFightAnimationId);
    score += Math.round(250 * scoreMultiplier);
    scoreEl.innerText = score;
    endGame();
}

function endGame() {
    // 1. Core State
    clearInterval(timerInterval);
    isBossFightActive = false;
    cancelAnimationFrame(bossFightAnimationId);
    closeFakePopup();

    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');

    // User: Pause all game music
    Object.values(audioObjects).forEach(audio => {
        if (audio.loop) { audio.pause(); audio.currentTime = 0; }
    });
    const bgMusic = audioObjects['musica.mp3'];
    const bossMusicHeavy = audioObjects['boss-theme-hard.mp3'];
    if (bgMusic) { bgMusic.pause(); bgMusic.playbackRate = 1.0; }
    if (bossMusicHeavy) bossMusicHeavy.pause();

    // 2. Hide In-game Screens
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreEl.innerText = score;

    if (handContainer) handContainer.classList.add('hidden');
    if (mobileControls) mobileControls.classList.add('hidden');
    isHandActive = false; isBossFleeing = false;

    // If SANS triggered, standard final score handling is hidden by triggerSansSequence DOM changes

    // 3. Final State Messaging (Standard handling, skipped if SANS triggered)
    if (!cheatState.isSansCodeTriggered) {
        // God Mode Check: user cannot lose bullet hell if active, cap is Refilled in quiz step too.
        if (cheatState.godModeOn && lives <= 0) lives = 1;

        if (lives <= 0) {
            playAudio('wrong.mp3');
            endTitleEl.innerText = "💀 GAME OVER";
            let pool = deathMessages[causeOfDeath] || deathMessages.wrongAnswer;
            endMessageEl.innerText = pool[Math.floor(Math.random() * pool.length)];
        } else {
            playAudio('aplausos.mp3');
            endTitleEl.innerText = "👑 MITO SUPREMO!";
            endMessageEl.innerText = `Você destruiu tudo na dificuldade ${currentDifficulty.toUpperCase()}! A sala inteira está de pé aplaudindo você!`;
        }

        if (score > 0) {
            if (saveScoreArea)   saveScoreArea.classList.remove('hidden');
            if (playerNameInput) playerNameInput.value = '';
        } else {
            if (saveScoreArea) saveScoreArea.classList.add('hidden');
        }
    }
}

function safeGetScores() {
    try { return JSON.parse(localStorage.getItem('geometryQuizScores')) || []; } catch (e) { return []; }
}

function safeSaveScores(scores) {
    try { localStorage.setItem('geometryQuizScores', JSON.stringify(scores)); return true; } catch (e) { return false; }
}

if (saveScoreBtn) {
    saveScoreBtn.addEventListener('click', () => {
        let name = playerNameInput.value.trim() || "Anônimo";
        let diffLabel = currentDifficulty === 'easy' ? 'Fácil' : currentDifficulty === 'medium' ? 'Médio' : 'Difícil';
        let scores = safeGetScores();
        // Skip SANS score -67, not valid for leaderboard
        if(score > 0) {
            scores.push({ name, score, diff: diffLabel });
            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 5);
            if (safeSaveScores(scores)) {
                saveScoreArea.classList.add('hidden');
                updateLeaderboardDisplay();
                alert("Pontuação salva com sucesso!");
            } else {
                alert("Não foi possível salvar.");
            }
        }
    });
}

function updateLeaderboardDisplay() {
    if (!leaderboardList) return;
    let scores = safeGetScores();
    leaderboardList.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        let li = document.createElement('li');
        li.innerText = scores[i] ? `${scores[i].name} — ${scores[i].score} pts (${scores[i].diff})` : `Ninguém — 0 pts`;
        leaderboardList.appendChild(li);
    }
}

if (submitBtn)  submitBtn.addEventListener('click', checkAnswer);
if (inputEl)    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
if (restartBtn) restartBtn.addEventListener('click', showMainMenu);

// Initial Display
updateLeaderboardDisplay();
