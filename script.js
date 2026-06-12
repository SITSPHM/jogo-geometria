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
        "O tempo acabou! Você dormiu na tomada ou o quê? Que lerdo!",
        "Pensou tanto que o cérebro pifou? O cronômetro te esmagou completamente!",
        "Muito devagar! Desse jeito a geometria vai te deixar para trás para sempre!"
    ],
    wrongAnswer: [
        "Errou feio, errou rude! Volte para a escola porque a sua resposta foi um desastre!",
        "Sério que você digitou isso? Meu gato andando no teclado responderia melhor!",
        "Resposta totalmente incorreta! Você claramente não estudou nada."
    ],
    bulletHell: [
        "Que perdedor! Não aguentou nem uns tirinhos e virou poeira!",
        "Nossa, que noob! Foi obliterado completamente na arena!",
        "Desistiu de viver? Suas vidas sumiram mais rápido que a minha paciência!"
    ]
};

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

let isDyingSequence = false;
let dyingTimer = 0;
let bossDyingY = 30;
let whiteFadeAlpha = 0; 
let isWhiteFadeActive = false;

const canvas = document.getElementById('boss-canvas');
const ctx = canvas.getContext('2d');

let player = { x: 280, y: 340, width: 20, height: 20, speed: 5 };
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
const bossMusicHeavy = document.getElementById('boss-theme-hard.mp3');

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

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes acidTrip {
        0% { background-color: #ff0055; filter: hue-rotate(0deg); }
        20% { background-color: #00ffcc; }
        40% { background-color: #9900ff; }
        60% { background-color: #ffff00; }
        80% { background-color: #ff00ff; filter: hue-rotate(180deg); }
        100% { background-color: #ff0055; filter: hue-rotate(360deg); }
    }
    .chaos-background-active {
        animation: acidTrip 0.15s infinite linear !important;
    }
`;
document.head.appendChild(styleSheet);

function playAudio(filename) {
    const audio = new Audio(filename);
    audio.play().catch(e => {});
}

function setupButtonSounds(btn) {
    if(!btn) return;
    btn.addEventListener('mouseenter', () => { if(!isPopupActive && !isBossFightActive) playAudio('hover.mp3'); });
    btn.addEventListener('click', () => { playAudio('clique.mp3'); });
}
setupButtonSounds(submitBtn); setupButtonSounds(restartBtn); setupButtonSounds(saveScoreBtn);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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

window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function bindTouchBtn(elementId, targetKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const activate = (e) => { e.preventDefault(); touchKeys[targetKey] = true; };
    const deactivate = (e) => { e.preventDefault(); touchKeys[targetKey] = false; };
    el.addEventListener('touchstart', activate);
    el.addEventListener('touchend', deactivate);
    el.addEventListener('mousedown', activate);
    el.addEventListener('mouseup', deactivate);
    el.addEventListener('mouseleave', deactivate);
}
bindTouchBtn('btn-up', 'up');
bindTouchBtn('btn-down', 'down');
bindTouchBtn('btn-left', 'left');
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
if(popupCloseTop) popupCloseTop.addEventListener('click', closeFakePopup);
if(popupCloseBtn) popupCloseBtn.addEventListener('click', closeFakePopup);

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
    livesEl.innerText = "❤️".repeat(lives) || "💀 Vazio";
}

document.querySelectorAll('.diff-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        currentDifficulty = e.target.getAttribute('data-diff');
        if (currentDifficulty === 'easy') { scoreMultiplier = 1; baseTimeLimit = 20; }
        else if (currentDifficulty === 'medium') { scoreMultiplier = 1.5; baseTimeLimit = 15; }
        else if (currentDifficulty === 'hard') { scoreMultiplier = 2; baseTimeLimit = 10; }
        playAudio('clique.mp3');
        startGame();
    });
});

function showMainMenu() {
    bgMusic.pause(); bgMusic.currentTime = 0; bgMusic.playbackRate = 1.0;
    bossMusic.pause(); bossMusic.currentTime = 0;
    bossMusicHeavy.pause(); bossMusicHeavy.currentTime = 0; 
    cancelAnimationFrame(bossFightAnimationId);
    
    isBossFightActive = false;
    isDyingSequence = false;
    isWhiteFadeActive = false;
    isWaveTransitionActive = false;
    isCountdownActive = false;
    isInvincible = false;
    closeFakePopup();
    
    gameBox.classList.remove('crazy-spin'); 
    document.body.classList.remove('chaos-background-active');
    
    if(charImg) charImg.src = 'character-idle.png';
    speechEl.innerText = "Acha que sabe tudo do Capítulo 4? Vamos ver.";
    
    quizArea.classList.remove('hidden');
    bossArenaWrapper.classList.add('hidden');
    if(mobileControls) mobileControls.classList.add('hidden');
    endScreen.classList.add('hidden'); 
    gameScreen.classList.add('hidden'); 
    menuScreen.classList.remove('hidden'); 
    updateLeaderboardDisplay();
}

function startGame() {
    currentIndex = 0; score = 0; lives = 3; causeOfDeath = "wrongAnswer";
    scoreEl.innerText = score; updateLivesDisplay();
    canAnswer = true; isChaosMode = false; isPopupActive = false; isHandActive = false; isBossFightActive = false;
    isDyingSequence = false; isWhiteFadeActive = false; isWaveTransitionActive = false; isCountdownActive = false;
    isInvincible = false;
    
    timerLabel.innerText = "Tempo:"; timerUnit.innerText = "s";
    gameBox.classList.remove('crazy-spin');
    document.body.classList.remove('chaos-background-active');
    
    if(charImg) charImg.src = 'character-idle.png';
    speechEl.innerText = "Boa sorte... você vai precisar.";

    let shuffled = shuffleArray([...originalQuestionBank]);
    questionBank = shuffled.slice(0, 7);
    
    menuScreen.classList.add('hidden'); 
    endScreen.classList.add('hidden'); 
    gameScreen.classList.remove('hidden');
    quizArea.classList.remove('hidden');
    bossArenaWrapper.classList.add('hidden');
    if(mobileControls) mobileControls.classList.add('hidden');
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

    if(charImg) charImg.src = 'character-idle.png';
    if(!isChaosMode) {
        speechEl.innerText = "Pensa rápido aí!";
    } else {
        speechEl.innerText = "🚨 RESPONDE LOGO NO MEIO DESSE CAOS!!";
    }

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
                if(!isBossFightActive && canAnswer) triggerFakePopup();
            }, 1500);
        }
    }
    startTimer();
}

function checkAnswer() {
    if (!canAnswer || isPopupActive) return;
    canAnswer = false; clearInterval(timerInterval);
    inputEl.disabled = true; submitBtn.disabled = true;

    let playerAnswer = inputEl.value.trim().toLowerCase();
    let correctAnswer = questionBank[currentIndex].answer.toLowerCase();

    if (playerAnswer === correctAnswer) {
        score += Math.round(10 * scoreMultiplier); scoreEl.innerText = score;
        playAudio('correct.mp3');
        if(charImg) charImg.src = 'character-laughing.png'; // Atualizado
        speechEl.innerText = "Olha só, acertou! Não fez mais que sua obrigação.";
        nextStepSequence();
    } else {
        playAudio('wrong.mp3');
        causeOfDeath = "wrongAnswer";
        if(charImg) charImg.src = 'character-annoyed.png'; // Atualizado
        speechEl.innerText = "Caramba, que resposta horrível! Errou feio.";
        handleLoss();
    }
}

function handleLoss() {
    lives--; updateLivesDisplay();
    if (lives <= 0) {
        setTimeout(endGame, 1500);
    } else {
        nextStepSequence();
    }
}

function nextStepSequence() {
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

    if (currentDifficulty === 'easy') diffSpeedMultiplier = 0.75;
    else if (currentDifficulty === 'medium') diffSpeedMultiplier = 1.1;
    else if (currentDifficulty === 'hard') diffSpeedMultiplier = 1.6;

    player.x = 280; player.y = 340;
    playerBullets = []; enemyBullets = []; enemies = []; explosions = [];
    bossX = 230; bossY = 30; bossDyingY = 30;
    isInvincible = false;

    quizArea.classList.add('hidden');
    bossArenaWrapper.classList.remove('hidden');
    if(mobileControls) mobileControls.classList.remove('hidden'); 
    chaosBtn.classList.add('hidden');

    timerLabel.innerText = "Onda:";
    timerEl.innerText = "1 / 6";
    timerUnit.innerText = "";
    
    isBossFightActive = true;
    isCountdownActive = true;
    countdownNumber = 3;
    countdownTimer = 180; 
    
    bossFightLoop();
}

function triggerWaveTransition(text) {
    isWaveTransitionActive = true;
    transitionText = text;
    transitionTimer = 110; 
    enemyBullets = [];    
    playerBullets = [];
}

function spawnWave() {
    enemies = [];
    let count = currentDifficulty === 'hard' ? 8 : currentDifficulty === 'medium' ? 6 : 4;
    
    if (currentWave === 1) {
        for(let i=0; i<count; i++) {
            enemies.push({ x: 50 + i * (500/count), y: -40 - (i*45), type: 'cubo', hp: 2, speedY: 1.5 * diffSpeedMultiplier, speedX: 0, lastShot: 0 });
        }
    } else if (currentWave === 2) {
        for(let i=0; i<count; i++) {
            enemies.push({ x: 40 + i * (500/count), y: -50 - (i*30), type: 'cilindro', hp: 3, speedY: 0.5 * diffSpeedMultiplier, speedX: 2 * diffSpeedMultiplier, lastShot: Date.now() + (i*300) });
        }
    } else if (currentWave === 3) {
        for(let i=0; i<count; i++) {
            enemies.push({ x: Math.random()*520 + 20, y: -40 - (i*50), type: 'piramide', hp: 2, speedY: 3 * diffSpeedMultiplier, speedX: (Math.random() - 0.5) * 2 * diffSpeedMultiplier, lastShot: 0 });
        }
    } else if (currentWave === 4) {
        for(let i=0; i<count; i++) {
            enemies.push({ x: Math.random()*500 + 30, y: -40 - (i*50), type: 'cone', hp: 2, speedY: 2.5 * diffSpeedMultiplier, speedX: 3 * (i % 2 === 0 ? 1 : -1), lastShot: 0 });
        }
    } else if (currentWave === 5) {
        for(let i=0; i<count; i++) {
            enemies.push({ x: 60 + i * (450/count), y: -60 - (i*20), type: 'esfera', hp: 4, speedY: 0.8 * diffSpeedMultiplier, speedX: 0, lastShot: Date.now() + (i*400) });
        }
    } else if (currentWave === 6) {
        for(let i=0; i<count * 2; i++) {
            enemies.push({ x: Math.random()*560, y: -20 - (i*35), type: 'fragmento', hp: 1, speedY: 4 * diffSpeedMultiplier, speedX: (Math.random() - 0.5) * 2, lastShot: 0 });
        }
    }
}

function addExplosion(x, y, size) {
    explosions.push({
        x: x, y: y, size: size,
        currentFrame: 0, maxFrames: EXPLOSION_TOTAL_FRAMES, timer: 0
    });
}

function initBossEntity(phase) {
    bossPhase = phase; 
    bossAttackPattern = 1;
    bossPatternTimer = 0;
    bossBurstCount = 0;
    
    if (phase === 1) {
        bossHp = currentDifficulty === 'hard' ? 190 : currentDifficulty === 'medium' ? 130 : 80;
        maxBossHp = bossHp;
        timerLabel.innerText = "FASE:";
        timerEl.innerText = "CHEFE";
    } else if (phase === 3) {
        bossHp = currentDifficulty === 'hard' ? 220 : currentDifficulty === 'medium' ? 150 : 95;
        maxBossHp = bossHp;
        timerLabel.innerText = "FINAL:";
        timerEl.innerText = "ROCK!";
    }
    updateBossHpBar();
}

function updateBossHpBar() {
    const pct = Math.max(0, (bossHp / maxBossHp) * 100);
    document.getElementById('boss-hp-bar').style.width = `${pct}%`;
    if (bossPhase === 0) {
        document.getElementById('boss-hp-text').innerText = `LIMPE AS FORMAS (ONDA ${currentWave}/6)`;
    } else {
        document.getElementById('boss-hp-text').innerText = `CHEFE: FASE ${bossPhase} (${bossHp} HP)`;
    }
}

function bossFightLoop() {
    if (!isBossFightActive) return;
    updateBfLogic();
    renderBfGraphics();
    bossFightAnimationId = requestAnimationFrame(bossFightLoop);
}

function updateBfLogic() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        exp.timer++;
        if (exp.timer >= 2) { 
            exp.currentFrame++;
            exp.timer = 0;
            if (exp.currentFrame >= exp.maxFrames) explosions.splice(i, 1);
        }
    }

    if (isCountdownActive) {
        countdownTimer--;
        if (countdownTimer === 120) { countdownNumber = 2; playAudio('clique.mp3'); }
        if (countdownTimer === 60) { countdownNumber = 1; playAudio('clique.mp3'); }
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

    if (keys['w'] || keys['arrowup'] || touchKeys.up) player.y = Math.max(120, player.y - player.speed);
    if (keys['s'] || keys['arrowdown'] || touchKeys.down) player.y = Math.min(370, player.y + player.speed);
    if (keys['a'] || keys['arrowleft'] || touchKeys.left) player.x = Math.max(0, player.x - player.speed);
    if (keys['d'] || keys['arrowright'] || touchKeys.right) player.x = Math.min(580, player.x + player.speed);

    if (keys[' '] || keys['spacebar'] || touchKeys.shoot) {
        let now = Date.now();
        if (now - lastShotTime > 120) { 
            playerBullets.push({ x: player.x + 8, y: player.y - 5, speed: 9 });
            playAudio('laser.mp3');
            lastShotTime = now;
        }
    }

    for (let i = playerBullets.length - 1; i >= 0; i--) {
        playerBullets[i].y -= playerBullets[i].speed;
        if (playerBullets[i].y < 0) playerBullets.splice(i, 1);
    }

    if (bossPhase === 0) {
        updateBossHpBar();
        timerEl.innerText = `${currentWave} / 6`;
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            e.y += e.speedY;
            e.x += e.speedX;

            if ((e.type === 'cilindro' || e.type === 'cone') && (e.x < 10 || e.x > 560)) e.speedX *= -1;
            if (e.y > 400) { e.y = -40; e.x = Math.random()*540; }

            let shootInterval = currentDifficulty === 'hard' ? 1100 : currentDifficulty === 'medium' ? 1700 : 2400;
            if ((e.type === 'cilindro' || e.type === 'esfera') && Date.now() - e.lastShot > shootInterval) {
                let projectileTxt = e.type === 'esfera' ? "⚫" : "🔸";
                enemyBullets.push({ x: e.x + 12, y: e.y + 20, speedY: 3 * diffSpeedMultiplier, speedX: 0, txt: projectileTxt });
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
                    e.hp--;
                    playerBullets.splice(j, 1);
                    playAudio('hit-enemy.mp3');
                    if (e.hp <= 0) {
                        addExplosion(e.x - 15, e.y - 15, 60); 
                        enemies.splice(i, 1);
                        score += Math.round(5 * scoreMultiplier);
                        scoreEl.innerText = score;
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
                bossMusic.pause();
                bossMusicHeavy.currentTime = 0;
                bossMusicHeavy.play().catch(e => {});
            } else {
                currentWave++;
                triggerWaveTransition(`ONDA ${currentWave}`);
            }
        }
    } 
    else {
        bossSpeed = (bossPhase === 1 ? 2.2 : bossPhase === 2 ? 3.6 : 5.8) * (diffSpeedMultiplier * 0.85);
        bossX += bossSpeed * bossDirection;
        if (bossX < 20 || bossX > 440) bossDirection *= -1;

        bossPatternTimer++;
        let originY = bossY + 80; 

        if (bossPhase === 3 && bossAttackPattern === 3 && bossPatternTimer > 150) {
            bossAttackPattern = 4; 
            bossPatternTimer = 0;
        }

        if (bossAttackPattern === 1) {
            let fireRate = currentDifficulty === 'hard' ? 25 : currentDifficulty === 'medium' ? 40 : 60;
            if (bossPatternTimer % fireRate === 0) {
                let textOptions = ["EULER", "ARESTA", "FACES", "PRISMA", "CUBO"];
                let randTxt = textOptions[Math.floor(Math.random() * textOptions.length)];
                enemyBullets.push({ x: bossX + 20, y: originY, speedY: 3.5 * diffSpeedMultiplier, speedX: 0, txt: randTxt });
                enemyBullets.push({ x: bossX + 70, y: originY, speedY: 3.5 * diffSpeedMultiplier, speedX: 0, txt: randTxt });
                enemyBullets.push({ x: bossX + 120, y: originY, speedY: 3.5 * diffSpeedMultiplier, speedX: 0, txt: randTxt });
            }
            if (bossPatternTimer > 250) { bossAttackPattern = 2; bossPatternTimer = 0; bossBurstCount = 0; }
        }
        else if (bossAttackPattern === 2) {
            if (bossBurstCount < 3) {
                bossBurstInterval++;
                if (bossBurstInterval % 7 === 0 && bossBurstInterval < 90) { 
                    let targetX = player.x + 4;
                    enemyBullets.push({ x: targetX, y: originY, speedY: 5.0 * diffSpeedMultiplier, speedX: 0, txt: "GEOMETRIA" });
                }
                if (bossBurstInterval >= 130) { 
                    bossBurstCount++;
                    bossBurstInterval = 0;
                }
            } else {
                bossAttackPattern = 3;
                bossPatternTimer = 0;
            }
        }
        else if (bossAttackPattern === 3) {
            if (bossPatternTimer % 15 === 0) {
                enemyBullets.push({ x: bossX + 15, y: originY, speedY: 5 * diffSpeedMultiplier, speedX: 0, txt: "⚠️" });
                enemyBullets.push({ x: bossX + 65, y: originY, speedY: 5 * diffSpeedMultiplier, speedX: 0, txt: "VÉRTICE" });
                enemyBullets.push({ x: bossX + 115, y: originY, speedY: 5 * diffSpeedMultiplier, speedX: 0, txt: "⚠️" });
            }
            if (bossPatternTimer > 180) { 
                bossAttackPattern = 1; 
                bossPatternTimer = 0; 
            }
        }
        else if (bossAttackPattern === 4) {
            if (bossPatternTimer % 8 === 0) {
                let randomColumnX = Math.random() * 560;
                let randomSpeed = (3 + Math.random() * 4) * diffSpeedMultiplier;
                enemyBullets.push({ x: randomColumnX, y: originY - 20, speedY: randomSpeed, speedX: 0, txt: "💥💥MATEI💥💥" });
            }
            if (bossPatternTimer > 200) {
                bossAttackPattern = 1;
                bossPatternTimer = 0;
            }
        }

        for (let j = playerBullets.length - 1; j >= 0; j--) {
            let b = playerBullets[j];
            if (checkCollision(b, { x: bossX, y: bossY, width: 140, height: 90 })) {
                bossHp--;
                playerBullets.splice(j, 1);
                playAudio('hit-enemy.mp3');
                updateBossHpBar();

                if (bossPhase === 1 && bossHp <= Math.round(maxBossHp * 0.5)) { 
                    bossPhase = 2; 
                }
                else if (bossPhase === 2 && bossHp <= 0) {
                    playAudio('som-caos.mp3');
                    addExplosion(bossX + 15, bossY + 10, 110);
                    bossPhase = 0; 
                    currentWave = 4; 
                    triggerWaveTransition("FUGIU LÁ PRA CIMA! PREPARA!");
                    break;
                }
                else if (bossPhase === 3 && bossHp <= 0) {
                    triggerDyingSequence();
                }
                break;
            }
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        eb.y += eb.speedY;
        eb.x += eb.speedX;

        if (eb.y > 400 || eb.x < -40 || eb.x > 640) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (checkCollision(eb, { x: player.x, y: player.y, width: player.width, height: player.height })) {
            enemyBullets.splice(i, 1);
            playerHit();
        }
    }
}

function renderBfGraphics() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isInvincible || (Math.floor(blinkTimer / 4) % 2 === 0)) {
        ctx.fillStyle = isInvincible ? '#ffcc00' : '#2ed573'; 
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(player.x, player.y, player.width, player.height);
    }

    ctx.fillStyle = '#00ffff';
    playerBullets.forEach(b => { ctx.fillRect(b.x, b.y, 4, 10); });

    if (bossPhase === 0 && !isWaveTransitionActive && !isCountdownActive) {
        enemies.forEach(e => {
            if (e.type === 'cubo') { ctx.fillStyle = '#ffa502'; ctx.fillRect(e.x, e.y, 25, 25); ctx.strokeRect(e.x, e.y, 25, 25); }
            else if (e.type === 'cilindro') { ctx.fillStyle = '#1e90ff'; ctx.beginPath(); ctx.arc(e.x+12, e.y+12, 12, 0, Math.PI*2); ctx.fill(); ctx.stroke(); }
            else if (e.type === 'piramide') {
                ctx.fillStyle = '#ff4757'; ctx.beginPath();
                ctx.moveTo(e.x + 12, e.y); ctx.lineTo(e.x, e.y + 25); ctx.lineTo(e.x + 25, e.y + 25); ctx.closePath(); ctx.fill(); ctx.stroke();
            }
            else if (e.type === 'cone') { ctx.fillStyle = '#eccc68'; ctx.fillRect(e.x, e.y, 20, 20); }
            else if (e.type === 'esfera') { ctx.fillStyle = '#747d8c'; ctx.beginPath(); ctx.arc(e.x+12, e.y+12, 14, 0, Math.PI*2); ctx.fill(); }
            else if (e.type === 'fragmento') { ctx.fillStyle = '#ff6b81'; ctx.fillRect(e.x, e.y, 10, 10); }
        });
    } 
    else if (bossPhase > 0 && (!isDyingSequence || dyingTimer < 35)) {
        let activeBossImg = bossNormalImg; 
        let hpPercentage = bossHp / maxBossHp;

        if (bossPhase === 1) activeBossImg = bossNormalImg;
        else if (bossPhase === 2) activeBossImg = bossNormalBrokenImg;
        else if (bossPhase === 3) {
            if (hpPercentage > 0.15) activeBossImg = bossMadImg;
            else activeBossImg = bossMadBrokenImg;
        }

        let renderY = isDyingSequence ? bossDyingY : bossY;

        if (activeBossImg.complete && activeBossImg.naturalWidth !== 0) {
            ctx.imageSmoothingEnabled = false; 
            let aspect = activeBossImg.naturalHeight / activeBossImg.naturalWidth;
            let calculatedHeight = 140 * aspect;
            let yOffset = (90 - calculatedHeight) / 2;
            ctx.drawImage(activeBossImg, bossX, renderY + yOffset, 140, calculatedHeight);
        } else {
            ctx.fillStyle = (bossPhase === 3) ? '#ff3838' : '#57606f';
            ctx.fillRect(bossX, renderY, 140, 90);
        }
    }

    enemyBullets.forEach(eb => {
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 12px Courier New'; 
        ctx.fillText(eb.txt, eb.x, eb.y);
    });

    explosions.forEach(exp => {
        if (explosionImg.complete && explosionImg.naturalWidth !== 0) {
            let singleFrameWidth = explosionImg.naturalWidth / EXPLOSION_COLS;
            let singleFrameHeight = explosionImg.naturalHeight / EXPLOSION_ROWS;
            let col = exp.currentFrame % EXPLOSION_COLS;
            let row = Math.floor(exp.currentFrame / EXPLOSION_COLS);
            let srcX = col * singleFrameWidth;
            let srcY = row * singleFrameHeight;
            ctx.imageSmoothingEnabled = false; 
            ctx.drawImage(explosionImg, srcX, srcY, singleFrameWidth, singleFrameHeight, exp.x, exp.y, exp.size, exp.size);
        }
    });

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

function checkCollision(rect1, rect2) {
    let r1Width = rect1.width || 4;
    let r1Height = rect1.height || 10;
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + r1Width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + r1Height > rect2.y;
}

function playerHit() {
    if (isInvincible || isDyingSequence) return;
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
    const heavyBgm = document.getElementById('boss-music-heavy');
    if(heavyBgm) heavyBgm.pause();
    enemyBullets = [];
    playerBullets = [];
    gameBox.classList.add('crazy-spin');

    let dyingInterval = setInterval(() => {
        dyingTimer++;
        bossDyingY -= 1.4; 
        addExplosion(bossX + Math.random()*100, bossDyingY + Math.random()*50, 65);
        playAudio('hit-enemy.mp3');

        if (dyingTimer >= 35) { 
            clearInterval(dyingInterval);
            addExplosion(bossX - 40, bossDyingY - 40, 220);
            playAudio('boss-death.mp3');

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

    bgMusic.pause(); bgMusic.playbackRate = 1.0;
    bossMusic.pause(); 
    const heavyBgm = document.getElementById('boss-music-heavy');
    if(heavyBgm) heavyBgm.pause();

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    // CORREÇÃO CRÍTICA: Exibe exatamente a pontuação guardada na variável global "score"
    finalScoreEl.innerText = score; 
    
    if(handContainer) handContainer.classList.add('hidden');
    if(mobileControls) mobileControls.classList.add('hidden'); 
    isHandActive = false;

    if (lives <= 0) {
        playAudio('wrong.mp3');
        endTitleEl.innerText = "💀 GAME OVER";
        let messagesPool = deathMessages[causeOfDeath] || deathMessages.wrongAnswer;
        let randomIndex = Math.floor(Math.random() * messagesPool.length);
        endMessageEl.innerText = messagesPool[randomIndex];
    } else {
        playAudio('aplausos.mp3');
        endTitleEl.innerText = "👑 MITO SUPREMO!";
        endMessageEl.innerText = `Você destruiu tudo na dificuldade ${currentDifficulty.toUpperCase()}! A sala inteira está de pé aplaudindo você!`;
    }

    if (score > 0) {
        if(saveScoreArea) saveScoreArea.classList.remove('hidden');
        if(playerNameInput) playerNameInput.value = '';
    } else {
        if(saveScoreArea) saveScoreArea.classList.add('hidden');
    }
}

if(saveScoreBtn) {
    saveScoreBtn.addEventListener('click', () => {
        let name = playerNameInput.value.trim();
        if (name === '') name = "Anônimo";
        let diffLabel = currentDifficulty === 'easy' ? 'Fácil' : currentDifficulty === 'medium' ? 'Médio' : 'Difícil';

        let scores = JSON.parse(localStorage.getItem('geometryQuizScores')) || [];
        scores.push({ name: name, score: score, diff: diffLabel });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 5);
        
        localStorage.setItem('geometryQuizScores', JSON.stringify(scores));
        saveScoreArea.classList.add('hidden');
        updateLeaderboardDisplay();
        alert("Pontuação salva com sucesso!");
    });
}

function updateLeaderboardDisplay() {
    if(!leaderboardList) return;
    let scores = JSON.parse(localStorage.getItem('geometryQuizScores')) || [];
    leaderboardList.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        let li = document.createElement('li');
        if (scores[i]) li.innerText = `${scores[i].name} - ${scores[i].score} pts (${scores[i].diff})`;
        else li.innerText = `Ninguém - 0 pts`;
        leaderboardList.appendChild(li);
    }
}

if(submitBtn) submitBtn.addEventListener('click', checkAnswer);
if(inputEl) inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
if(restartBtn) restartBtn.addEventListener('click', showMainMenu);

updateLeaderboardDisplay();
