

let timeInterval = null;
let timeRemaining = 25 * 60; 
let totalTime = 25 * 60;
let isRunning = false;
let currentMode = 'focus'; 

let completedSessions = parseInt(localStorage.getItem('completedSessions') || '0');
let totalMinutes = parseInt(localStorage.getItem('totalMinutes') || '0');
let streak = parseInt(localStorage.getItem('streak') || '0');
let plantStage = parseInt(localStorage.getItem('plantStage') || '0');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let activeTaskId = localStorage.getItem('activeTaskId') || null;

const timerDisplay = document.getElementById('timerDisplay');
const timerLabel = document.getElementById('timerLabel');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const plant = document.getElementById('plant');
const message = document.getElementById('message');
const modeButtons = document.querySelectorAll('.mode-btn');

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

updateStats();
updatePlant();
renderTasks();

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const task = {
        id: Date.now().toString(),
        text: taskText,
        completed: false
        createdAt: new Date().toISOString()
    }
}