// O "cérebro" do jogo. Contém o estado e as regras.

let players = [];
let scores = [0, 0];
let currentPlayerIndex = 0;
let drinkOptionEnabled = true;

let gameMode = 'progression';
let startingLevel = 1;
let currentLevel = 1;
let turnCounter = 0;
const TURNS_PER_LEVEL = 5;
const CONSEQUENCE_THRESHOLD = 3; // A cada 3 pontos, uma consequência
let usedQuestions = {};

function startGame(player1Name, player2Name, drinkOption, mode, selectedLevel) {
    if (player1Name.trim() === '' || player2Name.trim() === '') {
        alert('Por favor, insira o nome dos dois jogadores.');
        return false;
    }
    players = [player1Name, player2Name];
    scores = [0, 0];
    drinkOptionEnabled = drinkOption;
    gameMode = mode;
    startingLevel = selectedLevel ? parseInt(selectedLevel) : 1;
    currentLevel = startingLevel;
    turnCounter = 0;
    usedQuestions = {};
    currentPlayerIndex = Math.floor(Math.random() * players.length);
    return true;
}

function nextTurn() {
    currentPlayerIndex = Math.floor(Math.random() * players.length);
    turnCounter++;
    if (gameMode === 'progression' && turnCounter % TURNS_PER_LEVEL === 0 && currentLevel < 5) {
        currentLevel++;
        return true;
    }
    return false;
}

// MODIFICADO: Agora retorna se uma consequência foi ativada
function addSkipPoint() {
    scores[currentPlayerIndex]++;
    console.log(`Ponto adicionado para ${players[currentPlayerIndex]}. Placar:`, scores);
    if (scores[currentPlayerIndex] % CONSEQUENCE_THRESHOLD === 0 && scores[currentPlayerIndex] !== 0) {
        return 'consequence'; // Retorna que uma consequência foi ativada
    }
    return 'point_added'; // Retorna que apenas um ponto foi adicionado
}

async function getQuestion(type) {
    const level = (gameMode === 'progression') ? currentLevel : startingLevel;
    const filename = `data/level${level}_${type}s.json`;
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Arquivo não encontrado: ${filename}`);
        const questions = await response.json();
        // ... (lógica de não repetir perguntas)
        const questionKey = `level${level}_${type}`;
        if (!usedQuestions[questionKey]) usedQuestions[questionKey] = [];
        let availableQuestions = questions.filter(q => !usedQuestions[questionKey].includes(q));
        if (availableQuestions.length === 0) { usedQuestions[questionKey] = []; availableQuestions = questions; }
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const chosenQuestion = availableQuestions[randomIndex];
        usedQuestions[questionKey].push(chosenQuestion);
        return chosenQuestion;
    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        return "Oops! Ocorreu um erro ao carregar a pergunta.";
    }
}

// NOVO: Função para buscar um desafio de consequência
async function getConsequence() {
    const level = getCurrentLevel();
    try {
        const response = await fetch('data/consequences.json');
        if (!response.ok) throw new Error('Arquivo de consequências não encontrado.');
        const allConsequences = await response.json();
        const levelConsequences = allConsequences[`level${level}`];
        if (!levelConsequences || levelConsequences.length === 0) {
            return "A sorte está do seu lado, não encontramos uma consequência para este nível!";
        }
        const randomIndex = Math.floor(Math.random() * levelConsequences.length);
        return levelConsequences[randomIndex];
    } catch (error) {
        console.error('Erro ao buscar consequência:', error);
        return "Ocorreu um erro ao carregar a consequência. Beba uma dose como punição pelo erro do programador!";
    }
}

function getCurrentPlayer() { return players[currentPlayerIndex]; }
function getPlayers() { return players; }
function getScores() { return scores; }
function getCurrentLevel() { return (gameMode === 'progression') ? currentLevel : startingLevel; }
function isDrinkOptionEnabled() { return drinkOptionEnabled; }