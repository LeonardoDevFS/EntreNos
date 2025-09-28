// O "cérebro" do jogo. Contém o estado e as regras.

let players = [];
let currentPlayerIndex = 0;
let drinkOptionEnabled = true;

let gameMode = 'progression';
let startingLevel = 1;
let currentLevel = 1;
let turnCounter = 0;
const TURNS_PER_LEVEL = 5;
let usedQuestions = {};

function startGame(player1Name, player2Name, drinkOption, mode, selectedLevel) {
    if (player1Name.trim() === '' || player2Name.trim() === '') {
        alert('Por favor, insira o nome dos dois jogadores.');
        return false;
    }

    players = [player1Name, player2Name];
    drinkOptionEnabled = drinkOption;
    gameMode = mode;
    startingLevel = selectedLevel ? parseInt(selectedLevel) : 1;
    currentLevel = startingLevel;
    turnCounter = 0;
    usedQuestions = {};

    currentPlayerIndex = Math.floor(Math.random() * players.length);
    
    return true;
}

// MODIFICADO: Agora retorna true se o nível aumentar, senão false.
function nextTurn() {
    currentPlayerIndex = Math.floor(Math.random() * players.length);
    turnCounter++;

    if (gameMode === 'progression' && turnCounter % TURNS_PER_LEVEL === 0 && currentLevel < 5) {
        currentLevel++;
        console.log(`NÍVEL AUMENTOU PARA: ${currentLevel}`);
        return true; // Retorna true para indicar que o nível mudou
    }

    return false; // Retorna false se o nível permaneceu o mesmo
}

async function getQuestion(type) {
    const level = (gameMode === 'progression') ? currentLevel : startingLevel;
    const filename = `data/level${level}_${type}s.json`;
    
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Arquivo não encontrado: ${filename}`);
        
        const questions = await response.json();
        const questionKey = `level${level}_${type}`;
        if (!usedQuestions[questionKey]) usedQuestions[questionKey] = [];

        let availableQuestions = questions.filter(q => !usedQuestions[questionKey].includes(q));

        if (availableQuestions.length === 0) {
            usedQuestions[questionKey] = [];
            availableQuestions = questions;
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const chosenQuestion = availableQuestions[randomIndex];
        usedQuestions[questionKey].push(chosenQuestion);
        return chosenQuestion;

    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        return "Oops! Ocorreu um erro ao carregar a pergunta.";
    }
}

function getCurrentPlayer() { return players[currentPlayerIndex]; }
function getCurrentLevel() { return (gameMode === 'progression') ? currentLevel : startingLevel; }
function isDrinkOptionEnabled() { return drinkOptionEnabled; }