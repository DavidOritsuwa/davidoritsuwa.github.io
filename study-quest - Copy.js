    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const scoreDisplay = document.getElementById("score");
    let score = Number(localStorage.getItem("studyScore")) || 0;
    scoreDisplay.textContent = score;
    
    const levelMessage = document.getElementById("level-message");
    const streakDisplay = document.getElementById("streak-display");
    const rewardMessage = document.getElementById("reward-message");
    const badgeMessage = document.getElementById("badge-message");
    const badgeProgressFill = document.getElementById("badge-progress-fill");
    const badgeProgressText = document.getElementById("badge-progress-text");

    function playRewardSound() {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextType) {
        return;
    }

    const audioContext = new AudioContextType();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.12);

    volume.gain.setValueAtTime(0.12, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.35
    );

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.35);
    oscillator.addEventListener("ended", function () {
        audioContext.close();
    });
}

    function updateBadge() {
    const completedCount = taskList.querySelectorAll("li.completed").length;
    const progressCount = Math.min(completedCount, 5);

    badgeProgressFill.style.width = (progressCount / 5) * 100 + "%";
    badgeProgressText.textContent =
        progressCount + " of 5 tasks completed";

    if (completedCount >= 5) {
        badgeMessage.textContent = "🏅 Badge unlocked: Task Master!";
    } else {
        const remaining = 5 - completedCount;
        badgeMessage.textContent =
            "Badge: Locked — complete " + remaining +
            " more task(s) to earn Task Master!";
    }
}
   
    function saveTasks() { 
    const tasks = [];

    taskList.querySelectorAll("li").forEach(function (listItem) {
       tasks.push({
    text: listItem.dataset.taskText,
    completed: listItem.classList.contains("completed"),
    completedAt: listItem.dataset.completedAt || null
    
        });
    });

    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function displayTask(taskText, isCompleted, completedAt) {
    const listItem = document.createElement("li");
    listItem.textContent = taskText;
    listItem.dataset.taskText = taskText;

    const completeButton = document.createElement("button");
    completeButton.textContent = isCompleted ? "Completed" : "Complete";

    if (isCompleted) {
        listItem.classList.add("completed");
        listItem.dataset.completedAt = completedAt || Date.now();
        completeButton.disabled = true;
    }

    completeButton.addEventListener("click", function () {
        listItem.classList.add("completed");
        listItem.classList.add("celebrate");

        setTimeout(function () {
            listItem.classList.remove("celebrate");
        }, 500);
        listItem.dataset.completedAt = Date.now();
        completeButton.textContent = "Completed";
        completeButton.disabled = true;

        score += 10;
        scoreDisplay.textContent = score;
        localStorage.setItem("studyScore", score);

     updateStreak();

        const rewards = [
    "Quest complete! Knowledge power-up!",
    "Great work! You’re getting stronger!",
    "One step closer to your study goal!",
    "Brilliant effort! Keep going!",
    "Your future self says thank you!"
];

const randomReward = Math.floor(Math.random() * rewards.length);
rewardMessage.textContent = rewards[randomReward];

playRewardSound();

if (score >= 50) {
levelMessage.textContent = "Level 2 — Study Champion!";
 }

        saveTasks();
        updateBadge();
    });

    listItem.appendChild(completeButton);
    taskList.appendChild(listItem);
}

const savedTasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
const oneDay = 24 * 60 * 60 * 1000;
const now = Date.now();

const tasksToKeep = savedTasks.filter(function (task) {
    return !task.completed ||
        !task.completedAt ||
        now - task.completedAt < oneDay;
});

tasksToKeep.forEach(function (task) {
    displayTask(task.text, task.completed, task.completedAt);
});

saveTasks();
updateBadge();

function removeExpiredTasks() {
    taskList.querySelectorAll("li.completed").forEach(function (listItem) {
        const completedAt = Number(listItem.dataset.completedAt);

        if (completedAt && Date.now() - completedAt >= oneDay) {
            listItem.remove();
        }
    });

    saveTasks();
    updateBadge();
}

setInterval(removeExpiredTasks, 60 * 1000);

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    displayTask(taskText, false);
    saveTasks();

    taskInput.value = "";
    taskInput.focus();
});

const timerDisplay = document.getElementById("timer-display");
const timerProgress = document.getElementById("timer-progress");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");
const customMinutesInput = document.getElementById("custom-minutes");
const setTimeButton = document.getElementById("set-time-button");

let totalTime = 25 * 60;
let timeLeft = totalTime;
let timerInterval = null;

function showTime() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
        timerProgress.style.width = (timeLeft / totalTime) * 100 + "%";
}

setTimeButton.addEventListener("click", function () {
    const minutes = Number(customMinutesInput.value);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
        alert("Choose a whole number from 1 to 120 minutes.");
        return;
    }

    clearInterval(timerInterval);
    timerInterval = null;
    totalTime = minutes * 60;
    timeLeft = totalTime;
    showTime();
});

startButton.addEventListener("click", function () {
    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function () {
        timeLeft--;
        showTime();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Study session complete. Great work!");
        }
    }, 1000);
});

pauseButton.addEventListener("click", function () {
    clearInterval(timerInterval);
    timerInterval = null;
});

resetButton.addEventListener("click", function () {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = totalTime;
    showTime();
});

showTime();

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function updateStreak() {
    const today = getToday();
    const lastStudyDate = localStorage.getItem("lastStudyDate");
    let streak = Number(localStorage.getItem("studyStreak")) || 0;
    
    if (lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayText =
            yesterday.getFullYear() + "-" +
            String(yesterday.getMonth() + 1).padStart(2, "0") + "-" +
            String(yesterday.getDate()).padStart(2, "0");

        if (lastStudyDate === yesterdayText) {
            streak++;
        } else {
            streak = 1;
        }

        localStorage.setItem("studyStreak", streak);
        localStorage.setItem("lastStudyDate", today);
    }

    streakDisplay.textContent = "Daily streak: " + streak + " days";
}

streakDisplay.textContent =
    "Daily streak: " + (localStorage.getItem("studyStreak") || 0) + " days";