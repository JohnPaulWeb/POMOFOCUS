

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
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    if (activeTaskId === taskId) {
        activeTaskId = null;
        localStorage.removeItem('activeTaskId');
    }
    saveTasks();
    renderTasks();
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function setActiveTask(taskId) {
    if (activeTaskId === taskId) {
        activeTaskId = null;
        localStorage.removeItem('activeTaskId');
    } else {
        activeTaskId = taskId;
        localStorage.setItem('activeTaskId', activeTaskId);
    }
    renderTasks();
}

function renderTasks() {
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-tasks">No tasks added yet.</div>';
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.id === activeTaskId ? 'active' : ''} ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed? 'checked' : ''}
            onchange="toggleTaskComplete('${task.id}')"
            >

            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                    <button class="task-btn active-btn ${task.id === activeTaskId ? 'active' : ''}" 
                    onclick="setActiveTask('${task.id}')">
                        ${task.id === activeTaskId ? 'Active' : 'Set Active'}
                    </button>

                    <button class="task-btn delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
        </div>
     `).join('');
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) return;

        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentMode = btn.dataset.mode;
        const minutes = parseInt(btn.dataset.time);
        timeRemaining = minutes * 60;
        totalTime = minutes * 60;

        updateDisplay();
        updateProgress();

        if (currentMode === 'focus') {
            timerLabel.textContent = 'Focus Time';
        } else if (currentMode === 'shortBreak') {
            timerLabel.textContent = 'Short Break';
        } else {
            timerLabel.textContent = 'Long Break';
        }
    });
});

startBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', () => {
    resetTimer();
});

function startTimer() {
    isRunning = true;
    startBtn.textContent = 'Pause';

    timeInterval = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        updateProgress();

        if (timeRemaining <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    startBtn.textContent = 'Resume';
    clearInterval(timeInterval);
}

function resetTimer() {
    isRunning = false;
    startBtn.textContent = 'Start';
    clearInterval(timeInterval);

    const activeModeBtn = document.querySelector('.mode-btn.active');
    const minutes = parseInt(activeModeBtn.dataset.minutes);
    timeRemaining = minutes * 60;
    totalTime = minutes * 60;

    updateDisplay();
    updateProgress();
}

function completeSession() {
    clearInterval(timeInterval);
    isRunning = false;
    startBtn.textContent = 'Start';

    if (currentMode === 'focus') {
        completedSessions++;
        streak++;
        const minutes = Math.floor(totalTime / 60); 
        totalMinutes += minutes;
         
        if (plantStage < 5) {
            plantStage++;
            showMessage('Your plant has grown, keep it up!');
        } else {
            showMessage('Great job! Your plant is fully grown!');
            if (confirm('Your plant is fully grown! Do you want to reset it and start over?')) {
                plantStage = 0;
            }
        }

        saveStats();
        updateStats();
        updatePlant();

        playCompletionSound();
    } else {
        showMessage('Break over! Time to focus again.');
    }

    resetTimer();
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateProgress() {
    const progress = ((totalTime - timeRemaining) / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateStats() {
    document.getElementById('completedSessions').textContent = completedSessions;
    document.getElementById('totalMinutes').textContent = totalMinutes;
    document.getElementById('streak').textContent = streak;
}

function updatePlant() {
    plant.className = `plant plant-stage-${plantStage}`;
}

function saveStats() {
    localStorage.setItem('completedSessions', completeSession);
    localStorage.setItem('totalMinutes', totalMinutes);
    localStorage.setItem('streak', streak);
    localStorage.setItem('plantStage', plantStage);
}

function showMessage(text) {
    message.textContent = text;
    message.classList.add('show');

    setTimeout(() => {
        message.classList.remove('show');
    }, 4000);
}

function playCompletionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    } else if (e.code === 'KeyR') {
        resetTimer();
    }
});