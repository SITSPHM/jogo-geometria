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
//  ESTADO DA BOSS FIGHT
// =============================================================================
let isBossFightActive = false;
let bossFightAnimationId = null;
let currentWave = 1;
let bossPhase = 0;
let bossHp = 100;
let maxBossHp = 100;

let isInvincible = false;
let invincibleTimer = 0;
const INVINCIBLE_DURATION = 180;
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

// =============================================================================
//  SISTEMA DE UPGRADES
// =============================================================================
// Upgrades disponíveis no shop entre ondas
const UPGRADE_DEFS = [
    { id: 'double_shot',   label: '🔫 Tiro Duplo',     desc: 'Atira 2 projéteis ao mesmo tempo',          cost: 30 },
    { id: 'triple_shot',   label: '🔱 Tiro Triplo',    desc: 'Atira 3 projéteis ao mesmo tempo',          cost: 60 },
    { id: 'rapid_fire',    label: '⚡ Cadência +',      desc: 'Intervalo entre tiros reduzido em 40ms',    cost: 25 },
    { id: 'piercing',      label: '🌀 Perfurante',      desc: 'Projéteis atravessam 1 inimigo extra',      cost: 50 },
    { id: 'shield',        label: '🛡️ Escudo',          desc: '+1 vida extra (máx 6)',                    cost: 45 },
    { id: 'speed_boost',   label: '💨 Velocidade +',   desc: 'Jogador fica mais rápido',                  cost: 20 },
    { id: 'bomb_delay',    label: '⏱️ Temporizador +', desc: 'Bombas explodem mais devagar (+15 ticks)',  cost: 35 },
    { id: 'damage_up',     label: '💥 Dano +',          desc: 'Cada tiro causa 2 de dano ao boss',        cost: 55 },
];

let unlockedUpgrades = {};    // { upgrade_id: count }
let upgradeShopActive = false;
let upgradeShopOptions = [];   // 3 opções aleatórias mostradas ao jogador
let upgradePoints = 0;         // moeda de upgrade = score acumulado / 10 ao entrar na onda
let upgradePointsSpent = 0;

// Loja de upgrade é mostrada a cada início de onda (bossPhase === 0) antes de spawnar
let pendingWaveSpawn = false;

// =============================================================================
//  CANVAS E ELEMENTOS DOM
// =============================================================================
const canvas = document.getElementById('boss-canvas');
const ctx = canvas.getContext('2d');

let player = { x: 280, y: 340, width: 18, height: 18, speed: 5 };
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let explosions = [];
let keys = {};
let touchKeys = { up: false, down: false, left: false, right: false, shoot: false };
let lastShotTime = 0;
let diffSpeedMultiplier = 1;

let bossAttackPattern = 0;
let bossPatternTimer = 0;
let bossBurstCount = 0;
let bossBurstInterval = 0;

// Variável de state do tiro duplo/triplo
let shotFireTimer = 0;

// Estado das bombas espirais
// Cada "spiral emitter" é um objeto independente: { x, y, angle, timer, speed, numArms, phaseOffset }
let spiralEmitters = [];

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

const bgMusic = document.getElementById('bg-music');
const bossMusic = document.getElementById('boss-music');
const bossMusicHeavy = document.getElementById('boss-music-heavy');

const bossNormalImg = new Image(); bossNormalImg.src = 'character-boss-normal.png';
const bossNormalBrokenImg = new Image(); bossNormalBrokenImg.src = 'character-boss-normal-broken.png';
const bossMadImg = new Image(); bossMadImg.src = 'character-boss-mad.png';
const bossMadBrokenImg = new Image(); bossMadBrokenImg.src = 'character-boss-mad-broken.png';

const explosionImg = new Image(); explosionImg.src = 'explosion.png';
const EXPLOSION_COLS = 5;
const EXPLOSION_ROWS = 5;
const EXPLOSION_TOTAL_FRAMES = 23;

let bossX = 230;
let bossY = 30;
let bossDirection = 1;
let bossSpeed = 2;

// =============================================================================
//  ESTILOS DINÂMICOS (MODO CAOS)
// =============================================================================
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes acidTrip {
        0%   { background-color: #ff0055; filter: hue-rotate(0deg);   }
        20%  { background-color: #00ffcc; }
        40%  { background-color: #9900ff; }
        60%  { background-color: #ffff00; }
        80%  { background-color: #ff00ff; filter: hue-rotate(180deg); }
        100% { background-color: #ff0055; filter: hue-rotate(360deg); }
    }
    .chaos-background-active {
        animation: acidTrip 0.15s infinite linear !important;
    }
    /* ---- UPGRADE SHOP OVERLAY ---- */
    #upgrade-shop-overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.88);
        z-index: 5000;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        color: #fff; font-family: 'Courier New', monospace;
        border-radius: 20px;
    }
    #upgrade-shop-overlay h2 {
        color: #ffcc00; font-size: 22px; margin-bottom: 4px; letter-spacing: 2px;
    }
    #upgrade-shop-overlay .shop-pts {
        font-size: 14px; color: #aaffaa; margin-bottom: 14px;
    }
    .upgrade-card {
        background: #1a1a2e; border: 2px solid #444;
        border-radius: 10px; padding: 10px 18px;
        margin: 6px; cursor: pointer; min-width: 220px; text-align: left;
        transition: border-color 0.15s, background 0.15s;
    }
    .upgrade-card:hover { border-color: #ffcc00; background: #2a2a4e; }
    .upgrade-card .ucard-title { font-size: 16px; font-weight: bold; }
    .upgrade-card .ucard-desc  { font-size: 12px; color: #aaa; margin-top: 2px; }
    .upgrade-card .ucard-cost  { font-size: 13px; color: #ffcc00; margin-top: 4px; }
    .upgrade-card.unaffordable { opacity: 0.45; cursor: not-allowed; }
    #shop-skip-btn {
        margin-top: 12px; background: #333; border: 2px solid #666;
        color: #aaa; padding: 6px 20px; border-radius: 8px;
        cursor: pointer; font-size: 13px; font-family: 'Courier New', monospace;
    }
    #shop-skip-btn:hover { border-color: #fff; color: #fff; }
    /* ---- HUD DE UPGRADES ATIVOS ---- */
    #upgrade-hud {
        position: absolute; top: 5px; left: 5px;
        font-size: 13px; color: #ffcc00;
        text-shadow: 0 0 4px #000;
        z-index: 100; pointer-events: none;
        line-height: 1.5;
    }
`;
document.head.appendChild(styleSheet);

// =============================================================================
//  SISTEMA DE ÁUDIO
// =============================================================================
// Controle do som de warning para não spammar
let lastWarningSound = 0;
let lastBombColorState = -1; // controla quando a bomba muda de cor para tocar warning

function playAudio(filename) {
    const audio = new Audio(filename);
    audio.play().catch(e => {});
}

function setupButtonSounds(btn) {
    if (!btn) return;
    btn.addEventListener('mouseenter', () => { if (!isPopupActive && !isBossFightActive) playAudio('hover.mp3'); });
    btn.addEventListener('click', () => { playAudio('clique.mp3'); });
}
setupButtonSounds(submitBtn);
setupButtonSounds(restartBtn);
setupButtonSounds(saveScoreBtn);

// =============================================================================
//  UTILITÁRIOS
// =============================================================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function hasUpgrade(id) {
    return (unlockedUpgrades[id] || 0) > 0;
}

function upgradeCount(id) {
    return unlockedUpgrades[id] || 0;
}

function getShotFireInterval() {
    // Base 120ms, cada rapid_fire tira 40ms, mínimo 40ms
    return Math.max(40, 120 - upgradeCount('rapid_fire') * 40);
}

function getPlayerDamage() {
    return 1 + upgradeCount('damage_up');
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
    bgMusic.playbackRate = 2.0;
    clearInterval(timerInterval);
    startTimer();
});

// =============================================================================
//  TECLADO E TOUCH
// =============================================================================
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    // Previne scroll da página com espaço durante boss fight
    if (e.key === ' ' && isBossFightActive) e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

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

// =============================================================================
//  MÃO OBSTÁCULO
// =============================================================================
handObstacle.addEventListener('click', () => {
    if (isPopupActive) return;
    handClicksRequired--;
    playAudio('bater-mao.mp3');
    if (handClicksRequired <= 0) {
        isHandActive = false;
        handContainer.classList.add('hidden');
    }
});
handObstacle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handObstacle.click();
});

// =============================================================================
//  POPUP FALSO
// =============================================================================
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

// =============================================================================
//  TIMER DO QUIZ
// =============================================================================
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
    livesEl.innerText = "❤️".repeat(Math.max(0, lives)) || "💀 Vazio";
}

// =============================================================================
//  DIFICULDADE
// =============================================================================
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

// =============================================================================
//  TELA PRINCIPAL
// =============================================================================
function showMainMenu() {
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
    upgradeShopActive = false;
    closeFakePopup();

    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');

    // Remove shop overlay se existir
    const shopOverlay = document.getElementById('upgrade-shop-overlay');
    if (shopOverlay) shopOverlay.remove();

    if (charImg) charImg.src = 'character-idle.png';
    speechEl.innerText = "Acha que sabe tudo do Capítulo 4? Vamos ver.";

    quizArea.classList.remove('hidden');
    bossArenaWrapper.classList.add('hidden');
    if (mobileControls) mobileControls.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    updateLeaderboardDisplay();
}

// =============================================================================
//  INÍCIO DO JOGO
// =============================================================================
function startGame() {
    currentIndex = 0; score = 0; lives = 3; causeOfDeath = "wrongAnswer";
    scoreEl.innerText = score; updateLivesDisplay();
    canAnswer = true; isChaosMode = false; isPopupActive = false; isHandActive = false;
    isBossFightActive = false; isDyingSequence = false; isWhiteFadeActive = false;
    isWaveTransitionActive = false; isCountdownActive = false; isInvincible = false;
    isBossFleeing = false; upgradeShopActive = false;
    unlockedUpgrades = {}; upgradePoints = 0; upgradePointsSpent = 0;
    spiralEmitters = [];

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

    bgMusic.currentTime = 0;
    bgMusic.playbackRate = 1.0;
    bgMusic.play().catch(e => {});

    loadQuestion();
}

// =============================================================================
//  PERGUNTAS DO QUIZ
// =============================================================================
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

// =============================================================================
//  VERIFICAÇÃO DE RESPOSTA — CORRIGIDO double-decrement
// =============================================================================
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
        // BUG FIX: apenas decrementamos vida aqui, não em handleLoss também
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
            setTimeout(endGame, 1500);
        } else {
            nextStepSequence(false);
        }
    }
}

// handleLoss agora é SOMENTE para timeout — não desconta vida duas vezes
function handleLoss() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        setTimeout(endGame, 1500);
    } else {
        nextStepSequence(false);
    }
}

function nextStepSequence(correct) {
    setTimeout(() => {
        if (lives <= 0) return;
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

    bgMusic.pause();
    bossMusic.currentTime = 0;
    bossMusic.play().catch(e => {});

    playAudio('som-caos.mp3');
    speechEl.innerText = "💥 CANSEI DE PERGUNTAS! HORA DO BULLET HELL!";

    currentWave = 1;
    bossPhase = 0;
    lives = Math.max(lives, 3);
    updateLivesDisplay();

    if (currentDifficulty === 'easy')        diffSpeedMultiplier = 0.75;
    else if (currentDifficulty === 'medium') diffSpeedMultiplier = 1.1;
    else if (currentDifficulty === 'hard')   diffSpeedMultiplier = 1.6;

    // Reset de upgrades para a boss fight
    unlockedUpgrades = {}; upgradePoints = 0; upgradePointsSpent = 0;
    spiralEmitters = [];

    player.x = 280; player.y = 340;
    playerBullets = []; enemyBullets = []; enemies = []; explosions = [];
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

    // Cria HUD de upgrades
    createUpgradeHud();

    bossFightLoop();
}

// =============================================================================
//  SISTEMA DE UPGRADES — SHOP
// =============================================================================
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
    let parts = [];
    if (hasUpgrade('double_shot') || hasUpgrade('triple_shot')) {
        parts.push(hasUpgrade('triple_shot') ? '🔱x3' : '🔫x2');
    }
    if (hasUpgrade('rapid_fire'))   parts.push(`⚡x${upgradeCount('rapid_fire')}`);
    if (hasUpgrade('piercing'))     parts.push('🌀');
    if (hasUpgrade('speed_boost'))  parts.push(`💨x${upgradeCount('speed_boost')}`);
    if (hasUpgrade('bomb_delay'))   parts.push(`⏱️x${upgradeCount('bomb_delay')}`);
    if (hasUpgrade('damage_up'))    parts.push(`💥x${upgradeCount('damage_up')}`);
    hud.innerText = parts.length > 0 ? ('🔧 ' + parts.join(' ')) : '';
}

// Calcula quantos upgrade points o jogador ganhou baseado no score atual
function computeUpgradePoints() {
    // Cada 10 pontos de score = 1 upgrade point, menos os já gastos
    return Math.max(0, Math.floor(score / 10) - upgradePointsSpent);
}

function openUpgradeShop() {
    upgradeShopActive = true;
    upgradePoints = computeUpgradePoints();

    // Escolhe 3 upgrades aleatórios da lista, excluindo os que já estão no máximo
    let pool = UPGRADE_DEFS.filter(u => {
        // Alguns upgrades só podem ser comprados 1x
        if (['double_shot', 'triple_shot', 'piercing', 'shield'].includes(u.id)) {
            if (u.id === 'triple_shot' && !hasUpgrade('double_shot')) return false; // triple exige double
            return (unlockedUpgrades[u.id] || 0) === 0;
        }
        // Upgrades empilháveis limitados a 3x
        return (unlockedUpgrades[u.id] || 0) < 3;
    });

    upgradeShopOptions = shuffleArray([...pool]).slice(0, 3);

    // Cria overlay
    let overlay = document.createElement('div');
    overlay.id = 'upgrade-shop-overlay';
    overlay.innerHTML = `
        <h2>⚙️ UPGRADE SHOP</h2>
        <div class="shop-pts">Seus Upgrade Points: <b id="shop-pts-display">${upgradePoints}</b> pts</div>
        <div id="shop-cards"></div>
        <button id="shop-skip-btn">Pular (continuar sem upgrade)</button>
    `;
    bossArenaWrapper.appendChild(overlay);

    renderShopCards();

    document.getElementById('shop-skip-btn').addEventListener('click', closeUpgradeShop);
}

function renderShopCards() {
    let container = document.getElementById('shop-cards');
    if (!container) return;
    container.innerHTML = '';
    upgradeShopOptions.forEach(upg => {
        let canAfford = upgradePoints >= upg.cost;
        let card = document.createElement('div');
        card.className = 'upgrade-card' + (canAfford ? '' : ' unaffordable');
        card.innerHTML = `
            <div class="ucard-title">${upg.label}</div>
            <div class="ucard-desc">${upg.desc}</div>
            <div class="ucard-cost">Custo: ${upg.cost} pts</div>
        `;
        if (canAfford) {
            card.addEventListener('click', () => {
                applyUpgrade(upg);
                closeUpgradeShop();
            });
        }
        container.appendChild(card);
    });
}

function applyUpgrade(upg) {
    upgradePoints -= upg.cost;
    upgradePointsSpent += upg.cost;
    unlockedUpgrades[upg.id] = (unlockedUpgrades[upg.id] || 0) + 1;

    // Efeitos imediatos
    if (upg.id === 'shield') {
        lives = Math.min(6, lives + 1);
        updateLivesDisplay();
    }
    if (upg.id === 'speed_boost') {
        player.speed = 5 + upgradeCount('speed_boost') * 1.2;
    }
    if (upg.id === 'triple_shot') {
        // triple_shot implica double_shot
        unlockedUpgrades['double_shot'] = 1;
    }

    playAudio('correct.mp3');
    updateUpgradeHud();
}

function closeUpgradeShop() {
    upgradeShopActive = false;
    let overlay = document.getElementById('upgrade-shop-overlay');
    if (overlay) overlay.remove();

    // Agora sim spawna a onda
    spawnWave();
}

// =============================================================================
//  ONDAS DE INIMIGOS
// =============================================================================
function triggerWaveTransition(text) {
    isWaveTransitionActive = true;
    transitionText = text;
    transitionTimer = 110;
    enemyBullets = [];
    playerBullets = [];
    spiralEmitters = [];
}

function spawnWave() {
    player.x = 280;
    player.y = 340;
    enemies = [];

    // Fórmula de count baseada em dificuldade
    let count = currentDifficulty === 'hard' ? 8 : currentDifficulty === 'medium' ? 6 : 4;

    if (currentWave === 1) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: 50 + i * (500 / count), y: -40 - (i * 45), type: 'cubo',     hp: 2, speedY: 1.5 * diffSpeedMultiplier, speedX: 0, lastShot: 0 });
        }
    } else if (currentWave === 2) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: 40 + i * (500 / count), y: -50 - (i * 30), type: 'cilindro', hp: 3, speedY: 0.5 * diffSpeedMultiplier, speedX: 2 * diffSpeedMultiplier, lastShot: Date.now() + (i * 300) });
        }
    } else if (currentWave === 3) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: Math.random() * 520 + 20, y: -40 - (i * 50), type: 'piramide', hp: 2, speedY: 3 * diffSpeedMultiplier, speedX: (Math.random() - 0.5) * 2 * diffSpeedMultiplier, lastShot: 0 });
        }
    } else if (currentWave === 4) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: Math.random() * 500 + 30, y: -40 - (i * 50), type: 'cone', hp: 2, speedY: 2.5 * diffSpeedMultiplier, speedX: 3 * (i % 2 === 0 ? 1 : -1), lastShot: 0 });
        }
    } else if (currentWave === 5) {
        for (let i = 0; i < count; i++) {
            enemies.push({ x: 60 + i * (450 / count), y: -60 - (i * 20), type: 'esfera', hp: 4, speedY: 0.8 * diffSpeedMultiplier, speedX: 0, lastShot: Date.now() + (i * 400) });
        }
    } else if (currentWave === 6) {
        for (let i = 0; i < count * 2; i++) {
            enemies.push({ x: Math.random() * 560, y: -20 - (i * 35), type: 'fragmento', hp: 1, speedY: 4 * diffSpeedMultiplier, speedX: (Math.random() - 0.5) * 2, lastShot: 0 });
        }
    }
}

// =============================================================================
//  EXPLOSÕES
// =============================================================================
function addExplosion(x, y, size) {
    explosions.push({ x, y, size, currentFrame: 0, maxFrames: EXPLOSION_TOTAL_FRAMES, timer: 0 });
    playAudio('explosion.mp3');
}

// =============================================================================
//  INICIALIZAÇÃO DO BOSS
// =============================================================================
function initBossEntity(phase) {
    bossPhase = phase;
    bossAttackPattern = 1;
    bossPatternTimer = 0;
    bossBurstCount = 0;
    spiralEmitters = [];

    if (phase === 1) {
        bossHp    = currentDifficulty === 'hard' ? 190 : currentDifficulty === 'medium' ? 130 : 80;
        maxBossHp = bossHp;
        timerLabel.innerText = "FASE:";
        timerEl.innerText = "CHEFE";
    } else if (phase === 3) {
        bossHp    = currentDifficulty === 'hard' ? 220 : currentDifficulty === 'medium' ? 150 : 95;
        maxBossHp = bossHp;
        timerLabel.innerText = "FINAL:";
        timerEl.innerText = "ROCK!";
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

// =============================================================================
//  HELPER: SPAWNA ESPIRAL DE PROJÉTEIS
//  Inspirado na espiral áurea da imagem — projéteis saem em rotação
// =============================================================================
function spawnSpiralBurst(cx, cy, numArms, baseSpeed, startAngle, rotationStep) {
    // Cada "braço" é uma linha de projéteis saindo em ângulos espaçados igualmente,
    // com o ângulo base rotacionando a cada chamada (isso cria a espiral visual)
    for (let arm = 0; arm < numArms; arm++) {
        let angle = startAngle + (arm * (Math.PI * 2 / numArms));
        enemyBullets.push({
            x: cx,
            y: cy,
            speedX: Math.cos(angle) * baseSpeed,
            speedY: Math.sin(angle) * baseSpeed,
            width: 10,
            height: 10,
            type: 'spiral_particle',
            color: arm % 2 === 0 ? '#ff9900' : '#ff4444'
        });
    }
}

// =============================================================================
//  LOOP DA BOSS FIGHT
// =============================================================================
function bossFightLoop() {
    if (!isBossFightActive) return;
    if (!upgradeShopActive) {
        updateBfLogic();
        renderBfGraphics();
    }
    bossFightAnimationId = requestAnimationFrame(bossFightLoop);
}

// =============================================================================
//  LÓGICA DA BOSS FIGHT
// =============================================================================
function updateBfLogic() {

    // --- Explosões (animação de spritesheet) ---
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        exp.timer++;
        if (exp.timer >= 2) {
            exp.currentFrame++;
            exp.timer = 0;
            if (exp.currentFrame >= exp.maxFrames) explosions.splice(i, 1);
        }
    }

    // --- Sequência de fuga do boss (fase 1→2) ---
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

    // --- Countdown ---
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

    // --- Transição de onda ---
    if (isWaveTransitionActive) {
        transitionTimer--;
        if (transitionTimer <= 0) {
            isWaveTransitionActive = false;
            if (bossPhase === 0) {
                // Abre shop antes de spawnar (exceto onda 1)
                if (currentWave > 1) {
                    openUpgradeShop();
                } else {
                    spawnWave();
                }
            }
        }
        return;
    }

    if (isDyingSequence) return;

    // --- Invencibilidade pós-dano ---
    if (isInvincible) {
        invincibleTimer--;
        blinkTimer++;
        if (invincibleTimer <= 0) isInvincible = false;
    }

    // --- Movimento do jogador ---
    let spd = player.speed;
    if (keys['w'] || keys['arrowup']    || touchKeys.up)    player.y = Math.max(120, player.y - spd);
    if (keys['s'] || keys['arrowdown']  || touchKeys.down)  player.y = Math.min(370, player.y + spd);
    if (keys['a'] || keys['arrowleft']  || touchKeys.left)  player.x = Math.max(0,   player.x - spd);
    if (keys['d'] || keys['arrowright'] || touchKeys.right) player.x = Math.min(580, player.x + spd);

    // --- Tiro do jogador (simples, duplo ou triplo) ---
    if (keys[' '] || keys['spacebar'] || touchKeys.shoot) {
        let now = Date.now();
        if (now - lastShotTime > getShotFireInterval()) {
            lastShotTime = now;
            let dmg = getPlayerDamage();
            let pierce = hasUpgrade('piercing') ? 1 : 0;

            if (hasUpgrade('triple_shot')) {
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speed: 9, damage: dmg, pierce });
                playerBullets.push({ x: player.x - 4, y: player.y,     speed: 9, damage: dmg, pierce, speedX: -1.5 });
                playerBullets.push({ x: player.x + 18, y: player.y,    speed: 9, damage: dmg, pierce, speedX:  1.5 });
            } else if (hasUpgrade('double_shot')) {
                playerBullets.push({ x: player.x,      y: player.y - 5, speed: 9, damage: dmg, pierce });
                playerBullets.push({ x: player.x + 14, y: player.y - 5, speed: 9, damage: dmg, pierce });
            } else {
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speed: 9, damage: dmg, pierce: 0 });
            }
            playAudio('laser.mp3');
        }
    }

    // --- Movimento dos projéteis do jogador ---
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        b.y -= b.speed;
        if (b.speedX) b.x += b.speedX;
        if (b.y < 0 || b.x < -10 || b.x > 610) playerBullets.splice(i, 1);
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

            let shootInterval = currentDifficulty === 'hard' ? 1100 : currentDifficulty === 'medium' ? 1700 : 2400;
            if ((e.type === 'cilindro' || e.type === 'esfera') && Date.now() - e.lastShot > shootInterval) {
                enemyBullets.push({ x: e.x + 12, y: e.y + 20, speedY: 3 * diffSpeedMultiplier, speedX: 0, width: 10, height: 10, type: 'basic' });
                e.lastShot = Date.now();
            }

            // Colisão jogador-inimigo
            if (checkCollision(player, { x: e.x, y: e.y, width: 25, height: 25 })) {
                addExplosion(e.x - 10, e.y - 10, 50);
                enemies.splice(i, 1);
                playerHit();
                continue;
            }

            // Colisão projétil-inimigo (com suporte a pierce)
            for (let j = playerBullets.length - 1; j >= 0; j--) {
                let b = playerBullets[j];
                if (checkCollision(b, { x: e.x, y: e.y, width: 25, height: 25 })) {
                    e.hp -= b.damage;
                    if (b.pierce > 0) {
                        playerBullets[j].pierce--;  // pierce atravessa
                    } else {
                        playerBullets.splice(j, 1);
                    }
                    if (e.hp <= 0) {
                        addExplosion(e.x - 15, e.y - 15, 60);
                        enemies.splice(i, 1);
                        score += Math.round(5 * scoreMultiplier);
                        scoreEl.innerText = score;
                    } else {
                        playAudio('hit-enemy.mp3');
                    }
                    break;
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
                if (bossMusic) bossMusic.pause();
                if (bossMusicHeavy) { bossMusicHeavy.currentTime = 0; bossMusicHeavy.play().catch(e => {}); }
            } else {
                currentWave++;
                triggerWaveTransition(`ONDA ${currentWave}`);
            }
        }

    // ==========================================================================
    //  FASES DO BOSS (1, 2, 3)
    // ==========================================================================
    } else {
        bossSpeed = (bossPhase === 1 ? 2.2 : bossPhase === 2 ? 3.6 : 5.8) * (diffSpeedMultiplier * 0.85);
        bossX += bossSpeed * bossDirection;
        if (bossX < 20 || bossX > 440) bossDirection *= -1;

        bossPatternTimer++;
        let originY = bossY + 80;
        let originX = bossX + 70;

        // ====================================================================
        //  PADRÃO 1 — RAIOS RETOS
        //  Diferenciação por dificuldade: easy=3 beams, medium=5, hard=7 + diagonais
        // ====================================================================
        if (bossAttackPattern === 1) {
            let fireRate = currentDifficulty === 'hard' ? 18 : currentDifficulty === 'medium' ? 30 : 50;
            let duration = currentDifficulty === 'hard' ? 180 : 220;
            if (bossPatternTimer % fireRate === 0) {
                let numBeams = currentDifficulty === 'hard' ? 7 : currentDifficulty === 'medium' ? 5 : 3;
                let spread = currentDifficulty === 'hard' ? 45 : 55;
                for (let b = 0; b < numBeams; b++) {
                    let offsetX = (b - Math.floor(numBeams / 2)) * spread;
                    // Em hard, beams externos saem em diagonal
                    let sxHard = (currentDifficulty === 'hard' && b === 0) ? -2 * diffSpeedMultiplier :
                                 (currentDifficulty === 'hard' && b === numBeams - 1) ? 2 * diffSpeedMultiplier : 0;
                    enemyBullets.push({
                        x: bossX + 70 + offsetX,
                        y: originY,
                        speedY: 4 * diffSpeedMultiplier,
                        speedX: sxHard,
                        width: 10, height: 30, type: 'beam'
                    });
                }
            }
            if (bossPatternTimer > duration) { bossAttackPattern = 2; bossPatternTimer = 0; bossBurstCount = 0; }
        }

        // ====================================================================
        //  PADRÃO 2 — PLASMA GUIADO
        //  Diferenciação: easy=1 burst, medium=2, hard=3 + velocidade extra
        // ====================================================================
        else if (bossAttackPattern === 2) {
            let maxBursts = currentDifficulty === 'hard' ? 4 : currentDifficulty === 'medium' ? 3 : 2;
            let plasmaShotInterval = currentDifficulty === 'hard' ? 5 : 8;
            let plasmaSpeed = currentDifficulty === 'hard' ? 7.5 : currentDifficulty === 'medium' ? 5.5 : 4.0;
            plasmaSpeed *= diffSpeedMultiplier;

            if (bossBurstCount < maxBursts) {
                bossBurstInterval++;
                if (bossBurstInterval % plasmaShotInterval === 0 && bossBurstInterval < 80) {
                    let dx = player.x - originX;
                    let dy = player.y - originY;
                    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    enemyBullets.push({
                        x: originX, y: originY,
                        speedY: (dy / dist) * plasmaSpeed,
                        speedX: (dx / dist) * plasmaSpeed,
                        width: 14, height: 14, type: 'plasma'
                    });
                    // Em hard, atira um segundo plasma levemente desviado
                    if (currentDifficulty === 'hard') {
                        let angle = Math.atan2(dy, dx) + 0.3;
                        enemyBullets.push({
                            x: originX, y: originY,
                            speedX: Math.cos(angle) * plasmaSpeed * 0.8,
                            speedY: Math.sin(angle) * plasmaSpeed * 0.8,
                            width: 12, height: 12, type: 'plasma'
                        });
                    }
                }
                if (bossBurstInterval >= 110) { bossBurstCount++; bossBurstInterval = 0; }
            } else {
                bossAttackPattern = 3;
                bossPatternTimer = 0;
            }
        }

        // ====================================================================
        //  PADRÃO 3 — BOMBAS COM ESPIRAL ÁUREA
        //  A bomba ao explodir lança projéteis em espiral (inspirado na imagem)
        //  Diferenciação: easy = poucas bombas simples, medium = espiral 4 braços,
        //  hard = espiral 8 braços + bomba extra perto do jogador
        //  WARNING.MP3 toca a cada mudança de cor das bombas
        // ====================================================================
        else if (bossAttackPattern === 3) {
            let spawnRate = currentDifficulty === 'hard' ? 30 : currentDifficulty === 'medium' ? 45 : 65;
            let maxSpawnFrame = currentDifficulty === 'hard' ? 150 : 160;
            let bombTimer = currentDifficulty === 'hard' ? 50 : currentDifficulty === 'medium' ? 65 : 80;
            if (hasUpgrade('bomb_delay')) bombTimer += upgradeCount('bomb_delay') * 15;

            if (bossPatternTimer % spawnRate === 0 && bossPatternTimer < maxSpawnFrame) {
                let spawnX = 40 + Math.random() * 500;
                let spawnY = 130 + Math.random() * 110;
                let numArms = currentDifficulty === 'hard' ? 8 : currentDifficulty === 'medium' ? 6 : 4;
                enemyBullets.push({
                    x: spawnX, y: spawnY,
                    speedX: 0, speedY: 0.3,
                    width: 32, height: 32,
                    type: 'bomb',
                    timer: bombTimer,
                    maxTimer: bombTimer,
                    numArms,
                    spiralIndex: 0,        // rastreia ângulo de rotação acumulado
                    lastColorState: -1     // para detectar mudança de cor e tocar warning
                });

                // Hard: bomba extra na direção do jogador
                if (currentDifficulty === 'hard' && bossPatternTimer > 0) {
                    enemyBullets.push({
                        x: player.x + (Math.random() - 0.5) * 80,
                        y: player.y - 60,
                        speedX: 0, speedY: 0.2,
                        width: 28, height: 28,
                        type: 'bomb',
                        timer: Math.round(bombTimer * 0.75),
                        maxTimer: Math.round(bombTimer * 0.75),
                        numArms: 6,
                        spiralIndex: 0,
                        lastColorState: -1
                    });
                }
            }

            let duration3 = currentDifficulty === 'hard' ? 180 : 200;
            if (bossPatternTimer > duration3) {
                bossAttackPattern = (bossPhase === 3) ? 4 : 1;
                bossPatternTimer = 0;
            }
        }

        // ====================================================================
        //  PADRÃO 4 — CHUVA DE BEAMS + BOMBAS (APENAS FASE 3 / HARD)
        //  Diferenciação: beams SOMENTE no easy/medium, hard adiciona bombas
        //  Bombas do padrão 4 TAMBÉM usam espiral
        // ====================================================================
        else if (bossAttackPattern === 4) {
            // Beams caindo do boss — densidade depende de dificuldade
            let beamInterval = currentDifficulty === 'hard' ? 12 : currentDifficulty === 'medium' ? 18 : 30;
            if (bossPatternTimer % beamInterval === 0) {
                enemyBullets.push({
                    x: Math.random() * 570,
                    y: originY - 10,
                    speedY: (4 + Math.random() * 4) * diffSpeedMultiplier,
                    speedX: (Math.random() - 0.5) * (currentDifficulty === 'hard' ? 3 : 1.5),
                    width: 8, height: 22, type: 'beam'
                });
            }

            // Bombas espirais: medium e hard apenas
            if (currentDifficulty !== 'easy') {
                let bombInterval = currentDifficulty === 'hard' ? 45 : 65;
                let bombTimer4 = currentDifficulty === 'hard' ? 40 : 55;
                if (hasUpgrade('bomb_delay')) bombTimer4 += upgradeCount('bomb_delay') * 15;
                if (bossPatternTimer % bombInterval === 0) {
                    let numArms4 = currentDifficulty === 'hard' ? 8 : 5;
                    enemyBullets.push({
                        x: player.x + (Math.random() - 0.5) * 120,
                        y: player.y - 70,
                        speedX: 0, speedY: 0,
                        width: 32, height: 32,
                        type: 'bomb',
                        timer: bombTimer4,
                        maxTimer: bombTimer4,
                        numArms: numArms4,
                        spiralIndex: 0,
                        lastColorState: -1
                    });
                }
            }

            let duration4 = currentDifficulty === 'hard' ? 200 : 220;
            if (bossPatternTimer > duration4) {
                bossAttackPattern = 1;
                bossPatternTimer = 0;
            }
        }

        // --- Dano no boss pelos projéteis do jogador ---
        for (let j = playerBullets.length - 1; j >= 0; j--) {
            let b = playerBullets[j];
            if (checkCollision(b, { x: bossX, y: bossY, width: 140, height: 90 })) {
                bossHp -= b.damage;
                if (b.pierce > 0) {
                    playerBullets[j].pierce--;
                } else {
                    playerBullets.splice(j, 1);
                }
                playAudio('hit-enemy.mp3');
                updateBossHpBar();

                if (bossPhase === 1 && bossHp <= Math.round(maxBossHp * 0.5)) {
                    bossPhase = 2;
                } else if (bossPhase === 2 && bossHp <= 0) {
                    isBossFleeing = true;
                    bossFleeTimer = 0;
                    enemyBullets = [];
                    playerBullets = [];
                    spiralEmitters = [];
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
    //  PROCESSAMENTO DE PROJÉTEIS INIMIGOS
    // ==========================================================================
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];

        if (eb.type === 'bomb') {
            eb.timer--;
            eb.y += eb.speedY;

            // ---- Warning sound: toca warning.mp3 toda vez que a cor da bomba muda ----
            let colorState = Math.floor(eb.timer / 6) % 2;
            if (eb.lastColorState !== colorState) {
                eb.lastColorState = colorState;
                // Toca warning apenas se a bomba está na metade final do timer (urgência)
                if (eb.timer < eb.maxTimer * 0.6) {
                    playAudio('warning.mp3');
                }
            }

            if (eb.timer <= 0) {
                addExplosion(eb.x - 8, eb.y - 8, 55);

                // ---- ESPIRAL ÁUREA: projéteis giram a partir do centro da explosão ----
                let numArms = eb.numArms || (currentDifficulty === 'hard' ? 8 : currentDifficulty === 'medium' ? 6 : 4);
                let spiralSpeed = 3.8 * diffSpeedMultiplier;
                let numRings = currentDifficulty === 'hard' ? 3 : currentDifficulty === 'medium' ? 2 : 1;

                for (let ring = 0; ring < numRings; ring++) {
                    // Cada ring tem um ângulo base diferente para criar o efeito espiral
                    let ringAngleOffset = ring * (Math.PI / numArms);
                    let ringSpeed = spiralSpeed * (1 - ring * 0.2);
                    for (let arm = 0; arm < numArms; arm++) {
                        let angle = ringAngleOffset + (arm * (Math.PI * 2 / numArms));
                        enemyBullets.push({
                            x: eb.x + 16, y: eb.y + 16,
                            speedX: Math.cos(angle) * ringSpeed,
                            speedY: Math.sin(angle) * ringSpeed,
                            width: 10, height: 10,
                            type: 'spiral_particle',
                            color: ring === 0 ? '#ff9900' : ring === 1 ? '#ff4444' : '#ffffff'
                        });
                    }
                }

                enemyBullets.splice(i, 1);
                continue;
            }
        } else {
            eb.y += eb.speedY;
            eb.x += eb.speedX;
        }

        if (eb.y > 410 || eb.y < -60 || eb.x < -50 || eb.x > 650) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (!isInvincible && checkCollision(eb, { x: player.x, y: player.y, width: player.width, height: player.height })) {
            if (eb.type !== 'bomb') {  // bomb só machuca após explodir
                enemyBullets.splice(i, 1);
                playerHit();
            }
        }
    }
}

// =============================================================================
//  RENDERIZAÇÃO
// =============================================================================
function renderBfGraphics() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Jogador ---
    if (!isInvincible || (Math.floor(blinkTimer / 4) % 2 === 0)) {
        ctx.fillStyle = isInvincible ? '#ffcc00' : '#2ed573';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        // Pequena mira no centro do jogador
        ctx.fillStyle = '#fff';
        ctx.fillRect(player.x + 7, player.y + 7, 4, 4);
    }

    // --- Projéteis do jogador ---
    ctx.fillStyle = '#00ffff';
    playerBullets.forEach(b => {
        ctx.fillRect(b.x, b.y, 4, 10);
        // Efeito de brilho para tiros com dano aumentado
        if (b.damage > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(b.x + 1, b.y, 2, 4);
            ctx.fillStyle = '#00ffff';
        }
    });

    // --- Inimigos das ondas ---
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

    // --- Boss sprite ---
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
            let yOff = (90 - h) / 2;
            ctx.drawImage(activeBossImg, bossX, renderY + yOff, 140, h);
        } else {
            ctx.fillStyle = (bossPhase === 3) ? '#ff3838' : '#57606f';
            ctx.fillRect(bossX, renderY, 140, 90);
        }

        // Indicador de fase 2 (boss danificado) — pulsar vermelho
        if (bossPhase === 2) {
            let pulse = Math.sin(Date.now() / 120) * 0.3 + 0.3;
            ctx.fillStyle = `rgba(255,0,0,${pulse})`;
            ctx.fillRect(bossX, renderY, 140, 5);
        }
    }

    // --- Projéteis inimigos ---
    ctx.lineWidth = 3;
    enemyBullets.forEach(eb => {
        if (eb.type === 'bomb') {
            let colorState = Math.floor(eb.timer / 6) % 2 === 0;
            ctx.strokeStyle = colorState ? '#ff3838' : '#ffcc00';
            ctx.fillStyle   = colorState ? 'rgba(255,56,56,0.15)' : 'rgba(255,204,0,0.15)';
            ctx.strokeRect(eb.x, eb.y, eb.width, eb.height);
            ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
            // Ícone de exclamação
            ctx.fillStyle = ctx.strokeStyle;
            ctx.font = 'bold 22px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('!', eb.x + eb.width / 2, eb.y + eb.height - 8);
            ctx.textAlign = 'left';
            // Barra de countdown da bomba
            let pct = eb.timer / eb.maxTimer;
            ctx.fillStyle = pct > 0.5 ? '#00ff88' : pct > 0.25 ? '#ffcc00' : '#ff3838';
            ctx.fillRect(eb.x, eb.y - 5, eb.width * pct, 4);
        } else if (eb.type === 'spiral_particle') {
            ctx.fillStyle = eb.color || '#ffcc00';
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, (eb.width || 10) / 2, 0, Math.PI * 2);
            ctx.fill();
            // Brilho central
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, (eb.width || 10) / 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (eb.type === 'particle') {
            ctx.fillStyle = eb.color || '#ffcc00';
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, eb.width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (eb.type === 'beam') {
            ctx.fillStyle = '#ff3838';
            ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(eb.x + 2, eb.y, eb.width - 4, eb.height);
        } else if (eb.type === 'plasma') {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, eb.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, eb.width / 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(eb.x, eb.y, eb.width || 8, eb.height || 8);
        }
    });
    ctx.lineWidth = 1;

    // --- Explosões (spritesheet) ---
    explosions.forEach(exp => {
        if (explosionImg.complete && explosionImg.naturalWidth > 0) {
            let col = exp.currentFrame % EXPLOSION_COLS;
            let row = Math.floor(exp.currentFrame / EXPLOSION_COLS);
            let sw = explosionImg.naturalWidth / EXPLOSION_COLS;
            let sh = explosionImg.naturalHeight / EXPLOSION_ROWS;
            ctx.drawImage(explosionImg, col * sw, row * sh, sw, sh, exp.x, exp.y, exp.size, exp.size);
        } else {
            // Fallback: círculo laranja se a sprite não carregou
            ctx.fillStyle = 'rgba(255,150,0,0.7)';
            ctx.beginPath();
            ctx.arc(exp.x + exp.size / 2, exp.y + exp.size / 2, exp.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // --- Overlays de estado ---
    if (isCountdownActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff3838';
        ctx.font = 'bold 22px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText("PREPARE-SE PARA DETONAR...", 300, 160);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 70px "Courier New"';
        ctx.fillText(countdownNumber, 300, 245);
        ctx.textAlign = 'left';
    }

    if (isWaveTransitionActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 30px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(transitionText, 300, 195);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Courier New"';
        ctx.fillText("PREPARE-SE...", 300, 235);
        ctx.textAlign = 'left';
    }

    if (isWhiteFadeActive) {
        let retroAlpha = Math.floor(whiteFadeAlpha * 6) / 6;
        ctx.fillStyle = `rgba(255, 255, 255, ${retroAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// =============================================================================
//  COLISÃO
// =============================================================================
function checkCollision(rect1, rect2) {
    let r1w = rect1.width || 8;
    let r1h = rect1.height || 8;
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + r1w > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + r1h > rect2.y;
}

// =============================================================================
//  HIT DO JOGADOR
// =============================================================================
function playerHit() {
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

// =============================================================================
//  SEQUÊNCIA DE MORTE DO BOSS
// =============================================================================
function triggerDyingSequence() {
    isDyingSequence = true;
    if (bossMusicHeavy) bossMusicHeavy.pause();
    enemyBullets = [];
    playerBullets = [];
    spiralEmitters = [];
    gameBox.classList.add('crazy-spin');

    let dyingInterval = setInterval(() => {
        dyingTimer++;
        bossDyingY -= 1.4;
        addExplosion(bossX + Math.random() * 100, bossDyingY + Math.random() * 50, 65);
        if (dyingTimer >= 35) {
            clearInterval(dyingInterval);
            addExplosion(bossX - 40, bossDyingY - 40, 220);
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

// =============================================================================
//  FIM DE JOGO
// =============================================================================
function endGame() {
    clearInterval(timerInterval);
    isBossFightActive = false;
    cancelAnimationFrame(bossFightAnimationId);
    closeFakePopup();
    upgradeShopActive = false;

    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');

    if (bgMusic)        { bgMusic.pause(); bgMusic.playbackRate = 1.0; }
    if (bossMusic)      bossMusic.pause();
    if (bossMusicHeavy) bossMusicHeavy.pause();

    // Remove shop overlay se ainda estiver ativo
    const shopOverlay = document.getElementById('upgrade-shop-overlay');
    if (shopOverlay) shopOverlay.remove();

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');

    finalScoreEl.innerText = score;

    if (handContainer) handContainer.classList.add('hidden');
    if (mobileControls) mobileControls.classList.add('hidden');
    isHandActive = false;
    isBossFleeing = false;

    if (lives <= 0) {
        playAudio('wrong.mp3');
        endTitleEl.innerText = "💀 GAME OVER";
        let messagesPool = deathMessages[causeOfDeath] || deathMessages.wrongAnswer;
        endMessageEl.innerText = messagesPool[Math.floor(Math.random() * messagesPool.length)];
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

// =============================================================================
//  LEADERBOARD (localStorage com fallback gracioso)
// =============================================================================
function safeGetScores() {
    try {
        return JSON.parse(localStorage.getItem('geometryQuizScores')) || [];
    } catch (e) {
        return [];
    }
}

function safeSaveScores(scores) {
    try {
        localStorage.setItem('geometryQuizScores', JSON.stringify(scores));
        return true;
    } catch (e) {
        return false;
    }
}

if (saveScoreBtn) {
    saveScoreBtn.addEventListener('click', () => {
        let name = playerNameInput.value.trim() || "Anônimo";
        let diffLabel = currentDifficulty === 'easy' ? 'Fácil' : currentDifficulty === 'medium' ? 'Médio' : 'Difícil';
        let scores = safeGetScores();
        scores.push({ name, score, diff: diffLabel });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 5);
        if (safeSaveScores(scores)) {
            saveScoreArea.classList.add('hidden');
            updateLeaderboardDisplay();
            alert("Pontuação salva com sucesso!");
        } else {
            alert("Não foi possível salvar (localStorage indisponível neste ambiente).");
        }
    });
}

function updateLeaderboardDisplay() {
    if (!leaderboardList) return;
    let scores = safeGetScores();
    leaderboardList.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        let li = document.createElement('li');
        li.innerText = scores[i]
            ? `${scores[i].name} — ${scores[i].score} pts (${scores[i].diff})`
            : `Ninguém — 0 pts`;
        leaderboardList.appendChild(li);
    }
}

// =============================================================================
//  LISTENERS FINAIS
// =============================================================================
if (submitBtn)  submitBtn.addEventListener('click', checkAnswer);
if (inputEl)    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
if (restartBtn) restartBtn.addEventListener('click', showMainMenu);

updateLeaderboardDisplay();
