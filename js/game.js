// O "cérebro" do jogo. Contém o estado e as regras.

let players = [];
let scores = [0, 0];
let currentPlayerIndex = 0;
let drinkOptionEnabled = true;
let eventsEnabled = true; // Estado para as Cartas de Evento

let gameMode = 'progression';
let startingLevel = 1;
let currentLevel = 1;
let turnCounter = 0;
const TURNS_PER_LEVEL = 5;
const CONSEQUENCE_THRESHOLD = 3; // A cada 3 pontos, uma consequência
const EVENT_CHANCE = 0.25; // 25% de chance de um evento ocorrer por rodada
let usedQuestions = {};

function startGame(player1Name, player2Name, drinkOption, eventOption, mode, selectedLevel) {
    if (player1Name.trim() === '' || player2Name.trim() === '') {
        alert('Por favor, insira o nome dos dois jogadores.');
        return false;
    }
    players = [player1Name, player2Name];
    scores = [0, 0];
    drinkOptionEnabled = drinkOption;
    eventsEnabled = eventOption; // Armazena a escolha do jogador
    gameMode = mode;
    startingLevel = selectedLevel ? parseInt(selectedLevel) : 1;
    currentLevel = startingLevel;
    turnCounter = 0;
    usedQuestions = {};
    return true;
}

function nextTurn() {
    turnCounter++;

    // Só tenta sortear um evento se a opção estiver LIGADA
    if (eventsEnabled && Math.random() < EVENT_CHANCE) {
        return 'event';
    }

    currentPlayerIndex = Math.floor(Math.random() * players.length);
    
    if (gameMode === 'progression' && turnCounter % TURNS_PER_LEVEL === 0 && currentLevel < 5) {
        currentLevel++;
        return 'levelUp';
    }
    return 'normal';
}

function addSkipPoint() {
    scores[currentPlayerIndex]++;
    if (scores[currentPlayerIndex] % CONSEQUENCE_THRESHOLD === 0 && scores[currentPlayerIndex] !== 0) {
        return 'consequence';
    }
    return 'point_added';
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

async function getEvent() {
    try {
        const response = await fetch('data/events.json');
        if (!response.ok) throw new Error('Arquivo de eventos não encontrado.');
        const events = await response.json();
        const randomIndex = Math.floor(Math.random() * events.length);
        return events[randomIndex];
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        return "Ocorreu um erro ao carregar o evento. Ambos bebem uma dose!";
    }
}

// MODIFICADO: Adicionada uma linha para sincronizar a variável startingLevel
function setCurrentLevel(level) {
    const newLevel = parseInt(level);
    if (newLevel >= 1 && newLevel <= 5) {
        currentLevel = newLevel;
        startingLevel = newLevel; // <-- LINHA ADICIONADA PARA A CORREÇÃO
        // Ao trocar de nível manualmente, o modo de jogo é alterado.
        gameMode = 'choose-level'; 
        console.log(`Nível alterado manualmente para: ${currentLevel}`);
        return true;
    }
    return false;
}

function getCurrentPlayer() { return players[currentPlayerIndex]; }
function getPlayers() { return players; }
function getScores() { return scores; }
function getCurrentLevel() { return (gameMode === 'progression') ? currentLevel : startingLevel; }
function isDrinkOptionEnabled() { return drinkOptionEnabled; }