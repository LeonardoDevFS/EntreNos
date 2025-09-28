// Responsável por manipular o HTML e interagir com o usuário.

const welcomeScreen = document.getElementById('welcome-screen');
const welcomeContinueBtn = document.getElementById('welcome-continue-btn');
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const consequenceScreen = document.getElementById('consequence-screen');
const eventScreen = document.getElementById('event-screen');
const levelUpNotification = document.getElementById('level-up-notification');
const levelUpTitle = document.getElementById('level-up-title');
const levelUpSubtitle = document.getElementById('level-up-subtitle');

const pauseBtn = document.getElementById('pause-btn');
const pauseMenu = document.getElementById('pause-menu');
const resumeGameBtn = document.getElementById('resume-game-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const changeLevelBtn = document.getElementById('change-level-btn');
const levelChangeModal = document.getElementById('level-change-modal');
const pauseLevelSelect = document.getElementById('pause-level-select');
const confirmLevelChangeBtn = document.getElementById('confirm-level-change-btn');

const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const drinkOptionCheckbox = document.getElementById('drink-option');
const eventOptionCheckbox = document.getElementById('event-option');
const startGameBtn = document.getElementById('start-game-btn');
const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
const levelSelectWrapper = document.getElementById('level-select-wrapper');
const levelSelect = document.getElementById('level-select');

const currentLevelSpan = document.getElementById('current-level');
const gameInfoText = document.getElementById('game-info-text');
const bottle = document.getElementById('bottle');
const player1Position = document.getElementById('player1-position');
const player2Position = document.getElementById('player2-position');
const choiceContainer = document.getElementById('choice-container');
const turnTitle = document.getElementById('turn-title');
const truthBtn = document.getElementById('truth-btn');
const dareBtn = document.getElementById('dare-btn');

const resultType = document.getElementById('result-type');
const resultText = document.getElementById('result-text');
const nextTurnBtn = document.getElementById('next-turn-btn');
const skipBtn = document.getElementById('skip-btn');

const consequenceText = document.getElementById('consequence-text');
const consequenceDoneBtn = document.getElementById('consequence-done-btn');

const eventText = document.getElementById('event-text');
const eventDoneBtn = document.getElementById('event-done-btn');

const player1ScoreDisplay = document.getElementById('player1-score-display');
const player2ScoreDisplay = document.getElementById('player2-score-display');

const spinSound = document.getElementById('spin-sound');
const clickSound = document.getElementById('click-sound');
const levelUpSound = document.getElementById('level-up-sound');

let isSpinning = false;
let lastBottleAngle = 0;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function playSound(soundElement) {
    soundElement.currentTime = 0;
    soundElement.play();
}

async function showScreen(screenId) {
    const activeScreen = document.querySelector('.screen:not(.hidden)');
    if (activeScreen) {
        activeScreen.classList.add('fading');
        await wait(400);
        activeScreen.classList.add('hidden');
        activeScreen.classList.remove('fading');
    }
    const newScreen = document.getElementById(screenId);
    newScreen.classList.remove('hidden');
    await wait(10);
    newScreen.classList.remove('fading');

    if (screenId === 'welcome-screen' || screenId === 'setup-screen') {
        pauseBtn.classList.add('hidden');
    } else {
        pauseBtn.classList.remove('hidden');
    }
}

function initializeUI() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden', 'fading');
    });
    // AQUI ESTÁ A CORREÇÃO:
    welcomeScreen.classList.remove('hidden', 'fading');
}

welcomeContinueBtn.addEventListener('click', () => {
    showScreen('setup-screen');
});

startGameBtn.addEventListener('click', () => {
    const player1 = player1NameInput.value;
    const player2 = player2NameInput.value;
    const drinksEnabled = drinkOptionCheckbox.checked;
    const eventsEnabled = eventOptionCheckbox.checked;
    const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
    const selectedLevel = levelSelect.value;

    const gameCanStart = startGame(player1, player2, drinksEnabled, eventsEnabled, selectedMode, selectedLevel);

    if (gameCanStart) {
        player1Position.textContent = getPlayers()[0];
        player2Position.textContent = getPlayers()[1];
        updateGameScreen();
        showScreen('game-screen');
    }
});

bottle.addEventListener('click', () => { if (!isSpinning) spinBottle(); });

const levelSubtitles = {
    2: "As coisas estão ficando mais românticas...",
    3: "Prepare-se para apimentar um pouco...",
    4: "A temperatura está subindo...",
    5: "Agora o jogo é para os fortes!"
};

async function showLevelUpAnimation(newLevel) {
    playSound(levelUpSound);
    levelUpTitle.textContent = `Nível ${newLevel}`;
    levelUpSubtitle.textContent = levelSubtitles[newLevel] || "Prepare-se!";
    levelUpNotification.classList.remove('hidden');
    levelUpNotification.classList.add('show');
    await wait(3000);
    levelUpNotification.classList.remove('show');
    levelUpNotification.classList.add('hidden');
}

async function spinBottle() {
    isSpinning = true;
    gameInfoText.textContent = 'Processando rodada...';
    choiceContainer.classList.add('hidden');

    await wait(500);

    const turnResult = nextTurn();

    if (turnResult === 'event') {
        playSound(levelUpSound);
        const event = await getEvent();
        eventText.textContent = event;
        showScreen('event-screen');
        isSpinning = false;
        return;
    }
    
    playSound(spinSound);
    gameInfoText.textContent = 'Girando...';

    if (turnResult === 'levelUp') {
        await showLevelUpAnimation(getCurrentLevel());
    }

    const targetPlayerIndex = currentPlayerIndex;
    const angleToTargetPlayer = (targetPlayerIndex === 0) ? 180 : 0;
    const randomFullSpins = Math.floor(Math.random() * 4) + 3;
    const rotationAmount = (randomFullSpins * 360) + angleToTargetPlayer;
    const newRotation = lastBottleAngle + rotationAmount;

    bottle.style.transform = `rotate(${newRotation}deg)`;
    lastBottleAngle = newRotation;
    
    await wait(4000);

    updateGameScreen();
    gameInfoText.textContent = '';
    choiceContainer.classList.remove('hidden');
    isSpinning = false;
}

function proceedToNextRound() {
    gameInfoText.textContent = 'Clique na garrafa para girar!';
    choiceContainer.classList.add('hidden');
    showScreen('game-screen');
}

nextTurnBtn.addEventListener('click', proceedToNextRound);

skipBtn.addEventListener('click', async () => {
    const result = addSkipPoint();
    updateScoreDisplay();

    if (result === 'consequence') {
        const dare = await getConsequence();
        consequenceText.textContent = dare;
        showScreen('consequence-screen');
    } else {
        proceedToNextRound();
    }
});

consequenceDoneBtn.addEventListener('click', () => {
    proceedToNextRound();
});

eventDoneBtn.addEventListener('click', () => {
    proceedToNextRound();
});

async function showResult(type, content) {
    resultType.textContent = type;
    resultText.textContent = content;
    if (isDrinkOptionEnabled()) {
        skipBtn.classList.remove('hidden');
    } else {
        skipBtn.classList.add('hidden');
    }
    showScreen('result-screen');
}

truthBtn.addEventListener('click', async () => {
    const question = await getQuestion('truth');
    showResult('Verdade', question);
});

dareBtn.addEventListener('click', async () => {
    const challenge = await getQuestion('dare');
    showResult('Desafio', challenge);
});

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        playSound(clickSound);
    });
});

pauseBtn.addEventListener('click', () => {
    playSound(clickSound);
    pauseMenu.classList.remove('hidden');
});

resumeGameBtn.addEventListener('click', () => {
    playSound(clickSound);
    pauseMenu.classList.add('hidden');
    levelChangeModal.classList.add('hidden');
});

backToMenuBtn.addEventListener('click', () => {
    window.location.reload();
});

changeLevelBtn.addEventListener('click', () => {
    playSound(clickSound);
    levelChangeModal.classList.remove('hidden');
});

confirmLevelChangeBtn.addEventListener('click', () => {
    const newLevel = pauseLevelSelect.value;
    setCurrentLevel(newLevel);
    pauseMenu.classList.add('hidden');
    levelChangeModal.classList.add('hidden');
    proceedToNextRound();
});

function updateScoreDisplay() {
    const currentScores = getScores();
    const playerNames = getPlayers();
    
    player1ScoreDisplay.querySelector('.player-name').textContent = playerNames[0];
    player1ScoreDisplay.querySelector('.score').textContent = currentScores[0];

    player2ScoreDisplay.querySelector('.player-name').textContent = playerNames[1];
    player2ScoreDisplay.querySelector('.score').textContent = currentScores[1];
}

function updateGameScreen() {
    const currentPlayerName = getCurrentPlayer();
    const level = getCurrentLevel();
    turnTitle.textContent = `Sua vez, ${currentPlayerName}!`;
    currentLevelSpan.textContent = `Nível ${level}`;
    updateScoreDisplay();
}

initializeUI();