/* ==========================================================
   TaskFlow - app.js
   Part 1 : Initialization & DOM Elements
========================================================== */

"use strict";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

// Form Elements
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");

// Search
const searchInput = document.getElementById("searchInput");

// Task Container
const taskList = document.getElementById("taskList");

// Filter Buttons
const filterButtons = document.querySelectorAll(".filters button");

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");

// Toast
const toast = document.getElementById("toast");

// Dashboard Counters
const totalTasksCount = document.getElementById("totalTasks");
const completedTasksCount = document.getElementById("completedTasks");
const pendingTasksCount = document.getElementById("pendingTasks");
const todayTasksCount = document.getElementById("todayTasks");

/* ==========================================================
   APPLICATION STATE
========================================================== */

let tasks = [];

let currentFilter = "All";

let searchKeyword = "";

let editTaskId = null;

/* ==========================================================
   CONSTANTS
========================================================== */

const STORAGE_KEY = "taskflow_tasks";

const PRIORITY = {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low"
};

/* ==========================================================
   HELPER FUNCTIONS
========================================================== */

/**
 * Generate Unique ID
 */

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Today's Date
 */

function getTodayDate() {

    const today = new Date();

    return today.toISOString().split("T")[0];
}

/**
 * Clear Form
 */

function clearForm() {

    if (taskTitle) taskTitle.value = "";

    if (taskDescription) taskDescription.value = "";

    if (taskPriority) taskPriority.value = PRIORITY.MEDIUM;

    if (taskDate) taskDate.value = "";

    editTaskId = null;

}

/**
 * Check Empty String
 */

function isEmpty(value) {

    return value.trim() === "";

}

/**
 * Format Date
 */

function formatDate(dateString) {

    if (!dateString) return "";

    const options = {

        day: "numeric",

        month: "short",

        year: "numeric"

    };

    return new Date(dateString).toLocaleDateString("en-IN", options);

}

/**
 * Is Due Today
 */

function isToday(date) {

    return date === getTodayDate();

}

/**
 * Escape HTML
 */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* ==========================================================
   APP INITIALIZATION
========================================================== */

function initializeApp() {

    console.log("====================================");
    console.log("TaskFlow Initialized Successfully");
    console.log("====================================");

    console.table({

        TaskTitle: taskTitle,

        Description: taskDescription,

        Priority: taskPriority,

        Date: taskDate,

        Search: searchInput,

        TaskList: taskList

    });

}

/* ==========================================================
   START APPLICATION
========================================================== */

document.addEventListener("DOMContentLoaded", initializeApp);

/* ==========================================================
   TaskFlow - app.js
   Part 2 : Task Model
========================================================== */

/* ==========================================================
   CREATE TASK OBJECT
========================================================== */

function createTask(title, description, priority, dueDate) {

    return {

        id: generateId(),

        title: title.trim(),

        description: description.trim(),

        priority: priority,

        dueDate: dueDate,

        completed: false,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString()

    };

}

/* ==========================================================
   VALIDATE TASK
========================================================== */

function validateTask() {

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const dueDate = taskDate.value;

    // Title Validation
    if (title.length === 0) {

        showToast("Task title is required.", "error");

        taskTitle.focus();

        return null;
    }

    if (title.length < 3) {

        showToast("Title should contain at least 3 characters.", "warning");

        taskTitle.focus();

        return null;
    }

    if (title.length > 100) {

        showToast("Title is too long.", "warning");

        taskTitle.focus();

        return null;
    }

    // Description Validation
    if (description.length > 300) {

        showToast("Description must be below 300 characters.", "warning");

        taskDescription.focus();

        return null;
    }

    // Due Date Validation
    if (dueDate !== "") {

        const selected = new Date(dueDate);

        selected.setHours(0, 0, 0, 0);

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (selected < today) {

            showToast("Please choose today or a future date.", "warning");

            taskDate.focus();

            return null;
        }

    }

    return {

        title,

        description,

        priority,

        dueDate

    };

}

/* ==========================================================
   ADD TASK
========================================================== */

function addTask() {

    const taskData = validateTask();

    if (!taskData) return;

    const task = createTask(

        taskData.title,

        taskData.description,

        taskData.priority,

        taskData.dueDate

    );

    tasks.push(task);

    console.log("Task Added");

    console.table(task);

    // These functions will be created
    // in upcoming sections

    saveTasks();

    renderTasks();

    updateDashboard();

    clearForm();

    showToast("Task added successfully!", "success");

}

/* ==========================================================
   UPDATE TASK
========================================================== */

function updateTask(id) {

    const taskData = validateTask();

    if (!taskData) return;

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.title = taskData.title;

    task.description = taskData.description;

    task.priority = taskData.priority;

    task.dueDate = taskData.dueDate;

    task.updatedAt = new Date().toISOString();

    saveTasks();

    renderTasks();

    updateDashboard();

    clearForm();

    editTaskId = null;

    addTaskBtn.innerHTML = `

        <i class="fa-solid fa-plus"></i>

        Add Task

    `;

    showToast("Task updated successfully!", "success");

}

/* ==========================================================
   BUTTON HANDLER
========================================================== */

function handleTaskSubmit() {

    if (editTaskId) {

        updateTask(editTaskId);

    } else {

        addTask();

    }

}

/* ==========================================================
   ENTER KEY SUPPORT
========================================================== */

taskTitle?.addEventListener("keydown", function(event){

    if(event.key === "Enter"){

        event.preventDefault();

        handleTaskSubmit();

    }

});

taskDescription?.addEventListener("keydown", function(event){

    if(event.ctrlKey && event.key === "Enter"){

        handleTaskSubmit();

    }

});

/* ==========================================================
   ADD BUTTON EVENT
========================================================== */

addTaskBtn?.addEventListener("click", function(event){

    event.preventDefault();

    handleTaskSubmit();

});

/* ==========================================================
   TaskFlow - app.js
   Part 3 : Local Storage
========================================================== */

/* ==========================================================
   SAVE TASKS
========================================================== */

function saveTasks() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(tasks)

        );

        console.log("Tasks saved successfully.");

    } catch (error) {

        console.error("Error saving tasks:", error);

    }

}

/* ==========================================================
   LOAD TASKS
========================================================== */

function loadTasks() {

    try {

        const storedTasks = localStorage.getItem(STORAGE_KEY);

        if (!storedTasks) {

            tasks = [];

            return;
        }

        tasks = JSON.parse(storedTasks);

        if (!Array.isArray(tasks)) {

            tasks = [];

        }

    } catch (error) {

        console.error("Error loading tasks:", error);

        tasks = [];

    }

}

/* ==========================================================
   CLEAR ALL TASKS
========================================================== */

function clearAllTasks() {

    const confirmDelete = confirm(
        "Are you sure you want to delete all tasks?"
    );

    if (!confirmDelete) return;

    tasks = [];

    saveTasks();

    renderTasks();

    updateDashboard();

    showToast("All tasks deleted.", "success");

}

/* ==========================================================
   EXPORT TASKS
========================================================== */

function exportTasks() {

    const data = JSON.stringify(tasks, null, 4);

    const blob = new Blob([data], {

        type: "application/json"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "TaskFlow-Tasks.json";

    link.click();

    URL.revokeObjectURL(url);

}

/* ==========================================================
   IMPORT TASKS
========================================================== */

function importTasks(file) {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {

        try {

            const importedTasks = JSON.parse(event.target.result);

            if (!Array.isArray(importedTasks)) {

                showToast("Invalid JSON file.", "error");

                return;

            }

            tasks = importedTasks;

            saveTasks();

            renderTasks();

            updateDashboard();

            showToast("Tasks imported successfully!", "success");

        } catch (error) {

            console.error(error);

            showToast("Unable to import file.", "error");

        }

    };

    reader.readAsText(file);

}

/* ==========================================================
   RESET STORAGE
========================================================== */

function resetStorage() {

    localStorage.removeItem(STORAGE_KEY);

    tasks = [];

    renderTasks();

    updateDashboard();

    showToast("Storage cleared.", "success");

}

/* ==========================================================
   STORAGE INFO
========================================================== */

function storageInfo() {

    console.log("====================================");

    console.log("TaskFlow Storage Information");

    console.log("====================================");

    console.log("Storage Key :", STORAGE_KEY);

    console.log("Total Tasks :", tasks.length);

    console.log("Storage Used :", JSON.stringify(tasks).length, "bytes");

}

/* ==========================================================
   LOAD APP DATA
========================================================== */

function initializeStorage() {

    loadTasks();

    renderTasks();

    updateDashboard();

    console.log("Local Storage Initialized");

}

/* ==========================================================
   TaskFlow - app.js
   Part 4 : Render Tasks
========================================================== */

/* ==========================================================
   RENDER TASKS
========================================================== */

function renderTasks() {

    if (!taskList) return;

    taskList.innerHTML = "";

    // Apply Search
    let filteredTasks = tasks.filter(task => {

        const keyword = searchKeyword.toLowerCase();

        return (
            task.title.toLowerCase().includes(keyword) ||
            task.description.toLowerCase().includes(keyword)
        );

    });

    // Apply Filter
    switch(currentFilter){

        case "Completed":
            filteredTasks = filteredTasks.filter(task => task.completed);
            break;

        case "Pending":
            filteredTasks = filteredTasks.filter(task => !task.completed);
            break;

        case "High":
            filteredTasks = filteredTasks.filter(task => task.priority === "High");
            break;

        case "Medium":
            filteredTasks = filteredTasks.filter(task => task.priority === "Medium");
            break;

        case "Low":
            filteredTasks = filteredTasks.filter(task => task.priority === "Low");
            break;

        default:
            break;
    }

    // Empty State
    if(filteredTasks.length === 0){

        taskList.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-clipboard-list"></i>

            <h2>No Tasks Found</h2>

            <p>Create your first task to get started.</p>

        </div>

        `;

        return;

    }

    // Render Every Task
    filteredTasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = `task-card ${task.completed ? "completed" : ""}`;

        taskCard.dataset.id = task.id;

        taskCard.innerHTML = `

        <div class="task-left">

            <input
                type="checkbox"
                class="complete-checkbox"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
            >

            <div>

                <h3>${escapeHTML(task.title)}</h3>

                <p>${escapeHTML(task.description)}</p>

            </div>

        </div>

        <div class="task-right">

            <span class="priority ${task.priority.toLowerCase()}">

                ${task.priority}

            </span>

            <span class="date">

                <i class="fa-solid fa-calendar"></i>

                ${task.dueDate ? formatDate(task.dueDate) : "No Date"}

            </span>

            <button
                class="edit-btn"
                data-id="${task.id}"
                title="Edit Task"
            >

                <i class="fa-solid fa-pen"></i>

            </button>

            <button
                class="delete-btn"
                data-id="${task.id}"
                title="Delete Task"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        `;

        taskList.appendChild(taskCard);

    });

}

