// main.js - Central entry point: Imports modules, defines DOM elements, and initializes the app

// Group DOM elements in an object for better organization
const domElements = {
    root: document.documentElement,
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-modal'),
    themeButtons: document.querySelectorAll('[data-theme]'),
    progressBar: document.querySelector('.progress-container'),
    settingsCheckboxes: document.querySelectorAll('#settings-form input[type="checkbox"]'),
    submitSettingsBtn: document.getElementById('submit-btn'),

    listModal: document.getElementById('new-list-modal'),
    openListModal: document.getElementById('new-list-btn'),
    closeListModal: document.getElementById('cancel-list'),
    createListForm: document.getElementById('new-list-form'),
    listContainer: document.getElementById('lists-container'),
    listTitleInput: document.getElementById('list-title-input'),
    colorPicker: document.getElementById('color-picker'),
    currentListTitle: document.getElementById('current-list-title'),

    editListModal: document.getElementById('edit-list-modal'),
    editListForm: document.getElementById('edit-list-form'),
    editColorPicker: document.getElementById('editing-color-picker'),
    editListTitle: document.getElementById('editing-list-title-input'),
    cancelListEdit: document.getElementById('cancel-list-edit'),

    newTaskInput: document.getElementById('new-task-input'),
    addTaskBtn: document.getElementById('add-task-btn'),
    editListBtn: document.getElementById('edit-list-btn'),
    deleteListBtn: document.getElementById('delete-list-btn'),
    tasksContainer: document.getElementById('tasks-container'),

    editTaskModal: document.getElementById('task-detail-modal'),
    editTaskForm: document.getElementById('task-detail-form'),
    editName: document.getElementById('edit-task-name'),
    editDesc: document.getElementById('edit-task-description'),
    editDue: document.getElementById('edit-task-due'),
    editPrio: document.getElementById('edit-task-priority'),
    cancelTaskEdit: document.getElementById('cancel-task-edit'),

    clearCompletedBtn: document.getElementById('clear-completed'),
    sortSelect: document.getElementById('sort-tasks'),
    filterButtons: document.querySelectorAll('[data-filter]'),

    openExportModalBtn: document.getElementById('share-btn'),
    exportListModal: document.getElementById('list-export-modal'),
    closeExportModal: document.getElementById('close-export-modal'),
    exportListSpace: document.getElementById('export-list-space'),
    downloadListBtn: document.getElementById('export-lists-btn'),
    shareListBtn: document.getElementById('share-lists-btn')
};

// Group state variables
const appState = {
    currentlyEditingTaskId: null,
    editingListOldTitle: null,
    taskFilter: 'all',
    tempSettings: {
        theme: null,
        checkboxes: {}
    },
    listsJSON: {}
};

// Imports
import { loadLists, saveLists } from './data.js';
import { renderSelectedList, updateProgressBar, displayListsForExport } from './ui.js';
import { setupEventListeners } from './events.js';
import { applyTheme, sortTasks, disableTaskInputs, enableTaskInputs } from './utils.js';

// Initialization
function init() {
    // Load saved theme if exists
    const savedTheme = localStorage.getItem('VoidListTheme') || 'system';
    applyTheme(savedTheme);

    // Load data
    appState.listsJSON = loadLists(domElements.listContainer, domElements.currentListTitle, domElements.tasksContainer, renderSelectedList, { value: appState.taskFilter }, domElements.sortSelect);
    
    // Setup event listeners
    setupEventListeners({
        domElements,
        appState,
        renderSelectedList,
        updateProgressBar,
        applyTheme,
        sortTasks,
        saveLists,
        loadLists,
        disableTaskInputs,
        enableTaskInputs,
        displayListsForExport
    });
    
    // Initial rendering and sorting
    renderSelectedList(appState.listsJSON, domElements.currentListTitle, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
    sortTasks('newest', appState.listsJSON, domElements.currentListTitle, renderSelectedList, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
    displayListsForExport(domElements.exportListSpace, domElements.downloadListBtn, domElements.shareListBtn, appState.listsJSON);
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
