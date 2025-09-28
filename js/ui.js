// Responsável por manipular o HTML e interagir com o usuário.

// Mapeamento dos elementos do HTML
// ... (telas)
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const levelUpNotification = document.getElementById('level-up-notification');
const levelUpTitle = document.getElementById('level-up-title');
const levelUpSubtitle = document.getElementById('level-up-subtitle');

// ... (setup)
const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const drinkOptionCheckbox = document.getElementById('drink-option');
const startGameBtn = document.getElementById('start-game-btn');
const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
const levelSelectWrapper = document.getElementById('level-select-wrapper');
const levelSelect = document.getElementById('level-select');

// ... (jogo)
const currentLevelSpan = document.getElementById('current-level');
const gameInfoText = document.getElementById('game-info-text');
const bottle = document.getElementById('bottle');
const player1Position = document.getElementById('player1-position');
const player2Position = document.getElementById('player2-position');
const choiceContainer = document.getElementById('choice-container');
const turnTitle = document.getElementById('turn-title');
const truthBtn = document.getElementById('truth-btn');
const dareBtn = document.getElementById('dare-btn');

// ... (resultado)
const resultType = document.getElementById('result-type');
const resultText = document.getElementById('result-text');
const nextTurnBtn = document.getElementById('next-turn-btn');
const skipBtn = document.getElementById('skip-btn');

// NOVO: Seletores para os elementos de áudio
const spinSound = document.getElementById('spin-sound');
const clickSound = document.getElementById('click-sound');
const levelUpSound = document.getElementById('level-up-sound');

let isSpinning = false;
let lastBottleAngle = 0;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// NOVO: Função reutilizável para tocar sons
function playSound(soundElement) {
    soundElement.currentTime = 0; // Reinicia o som para o caso de ser tocado de novo rapidamente
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
}

function initializeUI() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden', 'fading');
    });
    const setup = document.getElementById('setup-screen');
    setup.classList.remove('hidden', 'fading');
}

gameModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.value === 'choose-level') {
            levelSelectWrapper.classList.remove('hidden');
        } else {
            levelSelectWrapper.classList.add('hidden');
        }
    });
});

startGameBtn.addEventListener('click', () => {
    const player1 = player1NameInput.value;
    const player2 = player2NameInput.value;
    const drinksEnabled = drinkOptionCheckbox.checked;
    const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
    const selectedLevel = levelSelect.value;

    const gameCanStart = startGame(player1, player2, drinksEnabled, selectedMode, selectedLevel);

    if (gameCanStart) {
        player1Position.textContent = players[0];
        player2Position.textContent = players[1];
        updateGameScreen();
        showScreen('game-screen');
    }
});

bottle.addEventListener('click', () => {
    if (!isSpinning) spinBottle();
});

const levelSubtitles = {
    2: "As coisas estão ficando mais românticas...",
    3: "Prepare-se para apimentar um pouco...",
    4: "A temperatura está subindo...",
    5: "Agora o jogo é para os fortes!"
};

async function showLevelUpAnimation(newLevel) {
    playSound(levelUpSound); // Toca o som de level up
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
    playSound(spinSound); // Toca o som da roleta
    gameInfoText.textContent = 'Girando...';
    choiceContainer.classList.add('hidden');

    const leveledUp = nextTurn();

    if (leveledUp) {
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
skipBtn.addEventListener('click', proceedToNextRound);

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

// NOVO: Adiciona som de clique para todos os botões com a classe .btn
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        playSound(clickSound);
    });
});

function updateGameScreen() {
    const currentPlayerName = getCurrentPlayer();
    const level = getCurrentLevel();
    turnTitle.textContent = `Sua vez, ${currentPlayerName}!`;
    currentLevelSpan.textContent = `Nível ${level}`;
}

initializeUI();