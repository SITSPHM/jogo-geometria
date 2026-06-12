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
//  ESTADO DA BOSS FIGHT E UPGRADES (LOOT Drop System)
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

// Listas de entidades da Arena
let player = { x: 280, y: 340, width: 18, height: 18, speed: 5.2, activeWeapon: 'normal' };
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let explosions = [];
let drops = []; // Novo repositório de upgrades derrubados no mapa

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

const bgMusic = document.getElementById('bg-music');
const bossMusic = document.getElementById('boss-music');
const bossMusicHeavy = document.getElementById('boss-music-heavy');

const bossNormalImg = new Image(); bossNormalImg.src = 'character-boss-normal.png';
const bossNormalBrokenImg = new Image(); bossNormalBrokenImg.src = 'character-boss-normal-broken.png';
const bossMadImg = new Image(); bossMadImg.src = 'character-boss-mad.png';
const bossMadBrokenImg = new Image(); bossMadBrokenImg.src = 'character-boss-mad-broken.png';

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
//  SISTEMA DE ÁUDIO
// =============================================================================
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
    bgMusic.playbackRate = 2.0;
    clearInterval(timerInterval);
    startTimer();
});

// =============================================================================
//  TECLADO E TOUCH
// =============================================================================
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
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
    livesEl.innerText = "❤️".repeat(Math.max(0, lives)) || "💀 Vazio";
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
    updateLeaderboardDisplay();
}

function startGame() {
    currentIndex = 0; score = 0; lives = 3; causeOfDeath = "wrongAnswer";
    scoreEl.innerText = score; updateLivesDisplay();
    canAnswer = true; isChaosMode = false; isPopupActive = false; isHandActive = false;
    isBossFightActive = false; isDyingSequence = false; isWhiteFadeActive = false;
    isWaveTransitionActive = false; isCountdownActive = false; isInvincible = false;
    isBossFleeing = false; drops = []; player.activeWeapon = 'normal';

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
        if (lives <= 0) {
            setTimeout(endGame, 1500);
        } else {
            nextStepSequence(false);
        }
    }
}

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
    lives = 3; // Força limite máximo inicial correto de 3 vidas
    updateLivesDisplay();

    if (currentDifficulty === 'easy')        diffSpeedMultiplier = 0.85; // Levemente buffado no fácil
    else if (currentDifficulty === 'medium') diffSpeedMultiplier = 1.1;
    else if (currentDifficulty === 'hard')   diffSpeedMultiplier = 1.35; // Reduzido de 1.6 para ficar viável

    player.x = 280; player.y = 340; player.activeWeapon = 'normal';
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
    hud.innerText = `ARMA ATIVA: [${label}]`;
    
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

function addExplosion(x, y, size) {
    explosions.push({ x, y, size, currentFrame: 0, timer: 0 });
    playAudio('explosion.mp3');
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
    // --- Explosões puras (Apenas círculos expandindo sem arquivo externo) ---
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        exp.timer++;
        if (exp.timer >= 25) {
            explosions.splice(i, 1);
        }
    }

    // --- Movimentação e Coleta dos Loot Drops ---
    for (let i = drops.length - 1; i >= 0; i--) {
        let d = drops[i];
        d.y += 1.5; // Caem devagar e suavemente
        
        if (d.y > 410) {
            drops.splice(i, 1);
            continue;
        }

        if (checkCollision(player, d)) {
            if (d.type === 'heart') {
                if (lives < 3) { // Só consome para reobter se estiver abaixo de 3
                    lives++;
                    updateLivesDisplay();
                    playAudio('correct.mp3');
                }
            } else {
                player.activeWeapon = d.type;
                updateUpgradeHud();
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

    // --- Movimento do jogador ---
    let spd = player.speed;
    if (keys['w'] || keys['arrowup']    || touchKeys.up)    player.y = Math.max(120, player.y - spd);
    if (keys['s'] || keys['arrowdown']  || touchKeys.down)  player.y = Math.min(370, player.y + spd);
    if (keys['a'] || keys['arrowleft']  || touchKeys.left)  player.x = Math.max(0,   player.x - spd);
    if (keys['d'] || keys['arrowright'] || touchKeys.right) player.x = Math.min(580, player.x + spd);

    // --- Atirar com base nas Armas Adquiridas via Drops ---
    if (keys[' '] || keys['spacebar'] || touchKeys.shoot) {
        let now = Date.now();
        let fireRate = 160; 
        
        if (player.activeWeapon === 'smg') fireRate = 55;        // SMG: muito rápido
        if (player.activeWeapon === 'shotgun') fireRate = 380;   // Shotgun: lento e forte
        if (player.activeWeapon === 'sniper') fireRate = 650;    // Sniper: cadência pesada

        if (now - lastShotTime > fireRate) {
            lastShotTime = now;
            playAudio('laser.mp3');

            if (player.activeWeapon === 'normal') {
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedY: -9, speedX: 0, damage: 1, width: 4, height: 10 });
            } 
            else if (player.activeWeapon === 'smg') {
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedY: -12, speedX: 0, damage: 0.5, width: 4, height: 8 });
            } 
            else if (player.activeWeapon === 'shotgun') {
                // Multiplas direções, velocidade baixa, dano alto 2
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedY: -5.5, speedX: 0, damage: 2, width: 6, height: 10 });
                playerBullets.push({ x: player.x + 5, y: player.y - 5, speedY: -5.2, speedX: -1.8, damage: 2, width: 6, height: 10 });
                playerBullets.push({ x: player.x + 9, y: player.y - 5, speedY: -5.2, speedX: 1.8, damage: 2, width: 6, height: 10 });
            } 
            else if (player.activeWeapon === 'sniper') {
                // Sniper futurística guiada (homing), lento, dano 5
                playerBullets.push({ x: player.x + 7, y: player.y - 5, speedVal: 7, damage: 5, width: 6, height: 14, isHoming: true, speedX: 0, speedY: -7 });
            }
        }
    }

    // --- Movimento dos Projéteis Aliados (Com Mecânica Sniper Homing) ---
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
    //  FASE 0 — ONDAS DE INIMIGOS (Adicionado trigger para drop de loot)
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
                addExplosion(e.x - 10, e.y - 10, 50);
                enemies.splice(i, 1);
                playerHit();
                continue;
            }

            for (let j = playerBullets.length - 1; j >= 0; j--) {
                let b = playerBullets[j];
                if (checkCollision(b, { x: e.x, y: e.y, width: 25, height: 25 })) {
                    e.hp -= b.damage;
                    playerBullets.splice(j, 1);
                    
                    if (e.hp <= 0) {
                        addExplosion(e.x - 15, e.y - 15, 60);
                        enemies.splice(i, 1);
                        score += Math.round(5 * scoreMultiplier);
                        scoreEl.innerText = score;

                        // Sistema Aleatório Balanceado de Loot Drops (30% de chance)
                        if (Math.random() < 0.30) {
                            let rng = Math.random();
                            let dropType = 'heart';
                            if (rng < 0.35) dropType = 'heart';
                            else if (rng < 0.60) dropType = 'shotgun';
                            else if (rng < 0.82) dropType = 'smg';
                            else dropType = 'sniper';

                            drops.push({ x: e.x + 4, y: e.y + 4, width: 18, height: 18, type: dropType });
                        }
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
    //  PADRÕES DO CHEFE BALANCEADOS
    // ==========================================================================
    } else {
        bossSpeed = (bossPhase === 1 ? 2.0 : bossPhase === 2 ? 3.2 : 5.0) * (diffSpeedMultiplier * 0.85);
        bossX += bossSpeed * bossDirection;
        if (bossX < 20 || bossX > 440) bossDirection *= -1;

        bossPatternTimer++;
        let originY = bossY + 80;
        let originX = bossX + 70;

        // PADRÃO 1 — Raios Retos (Suavizado no Hard para dar Safe Zones)
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

        // PADRÃO 2 — Plasma Perseguidor (Velocidade e frequência ajustadas de forma justa)
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

        // PADRÃO 3 — Bombas em Espiral Áurea (Removido explosion.png e redesenhado em 4 braços)
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

        // PADRÃO 4 — Chuva Suprema (Geométrica e Limpa)
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

        // --- Colisão do Boss com tiros aliados ---
        for (let j = playerBullets.length - 1; j >= 0; j--) {
            let b = playerBullets[j];
            if (checkCollision(b, { x: bossX, y: bossY, width: 140, height: 90 })) {
                bossHp -= b.damage;
                playerBullets.splice(j, 1);
                playAudio('hit-enemy.mp3');
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
                playAudio('explosion.mp3');
                
                // CRIAÇÃO DA ESPIRAL ÁUREA DINÂMICA (Do centro para fora em 4 direções perpendiculares)
                let baseAngle = Math.random() * Math.PI; // Rotação inicial aleatória para beleza visual
                for (let arm = 0; arm < 4; arm++) {
                    let startAngle = baseAngle + (arm * (Math.PI / 2)); // Cima, Baixo, Esquerda, Direita (90° em 90°)
                    enemyBullets.push({
                        cx: eb.x + 13, cy: eb.y + 13,
                        x: eb.x + 13,  y: eb.y + 13,
                        radius: 0, angle: startAngle,
                        radialSpeed: 2.2 * diffSpeedMultiplier, // Expansão do raio para fora
                        angularSpeed: 0.04,                    // Velocidade angular de rotação do vetor
                        width: 10, height: 10, type: 'spiral_arm',
                        color: arm % 2 === 0 ? '#ff9900' : '#ff4444'
                    });
                }
                enemyBullets.splice(i, 1);
                continue;
            }
        } 
        else if (eb.type === 'spiral_arm') {
            // Atualiza a posição estritamente em movimento espiral circular harmônico
            eb.radius += eb.radialSpeed;
            eb.angle += eb.angularSpeed;
            eb.x = eb.cx + Math.cos(eb.angle) * eb.radius;
            eb.y = eb.cy + Math.sin(eb.angle) * eb.radius;
        } 
        else {
            eb.y += eb.speedY;
            eb.x += eb.speedX;
        }

        // Limpeza de tela
        if (eb.y > 410 || eb.y < -60 || eb.x < -50 || eb.x > 650) {
            enemyBullets.splice(i, 1);
            continue;
        }

        // Validação de Dano
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
        } else {
            ctx.fillStyle = d.type === 'shotgun' ? '#ffa502' : d.type === 'smg' ? '#1e90ff' : '#9900ff';
            ctx.font = 'bold 9px monospace';
            let txt = d.type === 'shotgun' ? 'SG' : d.type === 'smg' ? 'MG' : 'SP';
            ctx.fillText(txt, d.x + d.width/2, d.y + d.height/2);
        }
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; // Reset padrão de render

    // --- Jogador ---
    if (!isInvincible || (Math.floor(blinkTimer / 4) % 2 === 0)) {
        ctx.fillStyle = isInvincible ? '#ffcc00' : '#2ed573';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = '#fff'; ctx.fillRect(player.x + 7, player.y + 7, 4, 4);
    }

    // --- Projéteis Aliados ---
    playerBullets.forEach(b => {
        ctx.fillStyle = player.activeWeapon === 'shotgun' ? '#ffa502' : player.activeWeapon === 'smg' ? '#1e90ff' : player.activeWeapon === 'sniper' ? '#9900ff' : '#00ffff';
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
            ctx.fillStyle = '#ffffff'; // Núcleo brilhante da espiral
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

    // --- Efeito Visual Simples de Explosão (Círculos radiantes) ---
    explosions.forEach(exp => {
        ctx.fillStyle = `rgba(255, ${100 + exp.timer * 4}, 0, ${1 - exp.timer / 25})`;
        ctx.beginPath();
        ctx.arc(exp.x + exp.size / 2, exp.y + exp.size / 2, (exp.size / 2) * (1 + exp.timer / 20), 0, Math.PI * 2);
        ctx.fill();
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
    if (bossMusicHeavy) bossMusicHeavy.pause();
    enemyBullets = []; playerBullets = []; drops = [];
    gameBox.classList.add('crazy-spin');

    let dyingInterval = setInterval(() => {
        dyingTimer++; bossDyingY -= 1.4;
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

function endGame() {
    clearInterval(timerInterval);
    isBossFightActive = false;
    cancelAnimationFrame(bossFightAnimationId);
    closeFakePopup();

    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');

    if (bgMusic)        { bgMusic.pause(); bgMusic.playbackRate = 1.0; }
    if (bossMusic)      bossMusic.pause();
    if (bossMusicHeavy) bossMusicHeavy.pause();

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreEl.innerText = score;

    if (handContainer) handContainer.classList.add('hidden');
    if (mobileControls) mobileControls.classList.add('hidden');
    isHandActive = false; isBossFleeing = false;

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

updateLeaderboardDisplay();
