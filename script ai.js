// JavaScript remains unchanged
// DOM Elements
const newListBtn = document.getElementById('new-list-btn');
const newListBtnMobile = document.getElementById('new-list-btn-mobile');
const newListModal = document.getElementById('new-list-modal');
const closeListModal = document.getElementById('close-list-modal');
const cancelList = document.getElementById('cancel-list');
const newListForm = document.getElementById('new-list-form');
const listsContainer = document.getElementById('lists-container');
const mobileListsContainer = document.getElementById('mobile-lists-container');
const tasksContainer = document.getElementById('tasks-container');
const noTasksMessage = document.getElementById('no-tasks-message');
const currentListTitle = document.getElementById('current-list-title');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const sortTasks = document.getElementById('sort-tasks');
const clearCompleted = document.getElementById('clear-completed');
const taskDetailModal = document.getElementById('task-detail-modal');
const closeTaskModal = document.getElementById('close-task-modal');
const cancelTaskEdit = document.getElementById('cancel-task-edit');
const taskDetailForm = document.getElementById('task-detail-form');
const deleteTaskBtn = document.getElementById('delete-task-btn');
const themeToggle = document.getElementById('theme-toggle');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const settingsForm = document.getElementById('settings-form');
const resetSettingsBtn = document.getElementById('reset-settings');
const suggestionsContainer = document.getElementById('suggestions-container');
const smartSuggestions = document.getElementById('smart-suggestions');
const enableSuggestions = document.getElementById('enable-suggestions');
const enableProgress = document.getElementById('enable-progress');
const enableAnimations = document.getElementById('enable-animations');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const clearSuggestionsBtn = document.querySelector('.clear-suggestions');
const deleteListBtn = document.querySelector('.delete-list-btn');
const filterButtons = document.querySelectorAll('.filter-btn');

// State
let lists = JSON.parse(localStorage.getItem('smartListLists')) || [];
let currentListId = null;
let currentFilter = 'all';
let settings = JSON.parse(localStorage.getItem('smartListSettings')) || {
    suggestions: true,
    progress: true,
    animations: true,
    theme: 'light'
};
let inputHistory = JSON.parse(localStorage.getItem('smartListInputHistory')) || {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderLists();
    updateUI();
    loadSettings();
    setupEventListeners();
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Initialize mobile menu
    if (window.innerWidth < 1024) {
        mobileMenuToggle.click();
    }
});

function setupEventListeners() {
    newListBtn.addEventListener('click', showNewListModal);
    newListBtnMobile.addEventListener('click', showNewListModal);
    closeListModal.addEventListener('click', hideNewListModal);
    cancelList.addEventListener('click', hideNewListModal);
    newListForm.addEventListener('submit', createNewList);
    addTaskBtn.addEventListener('click', addNewTask);
    sortTasks.addEventListener('change', sortTasksHandler);
    clearCompleted.addEventListener('click', clearCompletedTasks);
    closeTaskModal.addEventListener('click', hideTaskDetailModal);
    cancelTaskEdit.addEventListener('click', hideTaskDetailModal);
    taskDetailForm.addEventListener('submit', saveTaskChanges);
    deleteTaskBtn.addEventListener('click', deleteCurrentTask);
    themeToggle.addEventListener('click', toggleTheme);
    settingsBtn.addEventListener('click', showSettingsModal);
    closeSettingsModal.addEventListener('click', hideSettingsModal);
    settingsForm.addEventListener('submit', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    clearSuggestionsBtn.addEventListener('click', clearSuggestions);
    deleteListBtn.addEventListener('click', deleteCurrentList);
    
    // Input history tracking for suggestions
    newTaskInput.addEventListener('input', debounce(handleInputForSuggestions, 300));
    newTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateActiveFilterState();
            if (currentListId) {
                const list = lists.find(l => l.id === currentListId);
                if (list) {
                    renderTasks(filterTasks(list.tasks || []));
                }
            }
        });
    });
}

function handleKeyboardShortcuts(e) {
    if (e.key === 'Enter' && newTaskInput === document.activeElement) {
        addNewTask();
    }
    
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showNewListModal();
    }
    
    if (e.key === 'Escape') {
        if (!newListModal.classList.contains('hidden')) hideNewListModal();
        if (!taskDetailModal.classList.contains('hidden')) hideTaskDetailModal();
        if (!settingsModal.classList.contains('hidden')) hideSettingsModal();
    }
}

function renderLists() {
    listsContainer.innerHTML = '';
    mobileListsContainer.innerHTML = '';
    
    if (lists.length === 0) {
        listsContainer.innerHTML = `
            <div class="no-list-dummy">
                <p>No lists yet. Create your first list!</p>
            </div>
        `;
        mobileListsContainer.innerHTML = listsContainer.innerHTML;
        return;
    }
    
    lists.forEach(list => {
        const listElement = createListElement(list);
        listsContainer.appendChild(listElement);
        
        const mobileListElement = createListElement(list, true);
        mobileListsContainer.appendChild(mobileListElement);
    });
}

function createListElement(list, isMobile = false) {
    const element = document.createElement('div');
    const activeClass = currentListId === list.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700';
    
    element.className = `flex justify-between items-center px-8 py-6 rounded text-sm cursor-pointer ${activeClass}`;
    element.innerHTML = `
        <div class="flex items-center truncate">
            <div class="w-8 h-8 rounded-full mr-8 bg-${list.color || 'indigo'}-500"></div>
            <span class="truncate">${list.name}</span>
            ${list.tasks && list.tasks.length > 0 ? 
                `<span class="ml-8 text-xs bg-gray-200 text-gray-700 px-6 py-2 rounded-full">${list.tasks.filter(task => !task.completed).length}</span>` : ''}
        </div>
    `;
    
    element.addEventListener('click', () => {
        loadList(list.id);
        if (isMobile) toggleMobileMenu();
    });
    
    return element;
}

function loadList(listId) {
    currentListId = listId;
    const list = lists.find(l => l.id === listId);
    
    if (!list) return;
    
    currentListTitle.textContent = list.name;
    
    // Update progress
    updateProgress(list);
    
    // Render tasks with current filter
    renderTasks(filterTasks(list.tasks || []));
    
    // Update active state in sidebar
    updateActiveListState();
    
    // Generate smart suggestions if enabled
    if (settings.suggestions) {
        generateSmartSuggestions(list);
    } else {
        smartSuggestions.classList.add('hidden');
    }
}

function filterTasks(tasks) {
    if (currentFilter === 'all') return tasks;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
        if (currentFilter === 'important') {
            return task.priority === 'high';
        } else if (currentFilter === 'today') {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        } else if (currentFilter === 'completed') {
            return task.completed;
        }
        return true;
    });
}

function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        noTasksMessage.classList.remove('hidden');
        return;
    }
    
    noTasksMessage.classList.add('hidden');
    
    // Sort tasks based on current sort option
    const sortedTasks = sortTasksArray(tasks, sortTasks.value);
    
    sortedTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item group flex items-center justify-between p-8 rounded-lg border border-gray-200 hover:bg-gray-50 priority-${task.priority || 'low'} ${settings.animations ? 'fade-in' : ''}`;
        taskElement.innerHTML = `
            <div class="flex items-center w-full">
                <button class="complete-task-btn mr-8 w-20 h-20 rounded-full border ${task.completed ? 'bg-green-500 border-green-500 text-white completed' : 'border-gray-300'} flex items-center justify-center flex-shrink-0">
                    ${task.completed ? '<i class="fas fa-check text-xs"></i>' : ''}
                </button>
                <div class="task-content">
                    <div class="task-name ${task.completed ? 'completed' : ''} truncate">${task.name}</div>
                    ${task.description ? `<div class="task-description truncate">${task.description}</div>` : ''}
                    ${task.dueDate ? `<div class="task-due ${isDueDateApproaching(task.dueDate) ? 'urgent' : ''}">
                        <i class="far fa-calendar-alt mr-4"></i>${formatDate(task.dueDate)}
                    </div>` : ''}
                </div>
                <div class="task-actions flex space-x-4 ml-8">
                    ${task.priority === 'high' ? '<span class="priority-indicator priority-high">!</span>' : ''}
                    ${task.priority === 'medium' ? '<span class="priority-indicator priority-medium">~</span>' : ''}
                    <button class="edit-task-btn p-4 text-gray-500 hover:text-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" data-id="${task.id}">
                        <i class="fas fa-pencil-alt text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const completeBtn = taskElement.querySelector('.complete-task-btn');
        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
        });
        
        const editBtn = taskElement.querySelector('.edit-task-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showTaskDetailModal(task.id);
        });
        
        // Click anywhere on task to edit
        taskElement.addEventListener('click', () => showTaskDetailModal(task.id));
        
        tasksContainer.appendChild(taskElement);
    });
}

function sortTasksArray(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        } else if (sortBy === 'date') {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else {
            return a.name.localeCompare(b.name);
        }
    });
}

function sortTasksHandler() {
    if (!currentListId) return;
    const list = lists.find(l => l.id === currentListId);
    if (list) {
        renderTasks(filterTasks(list.tasks || []));
    }
}

function updateProgress(list) {
    if (!settings.progress) {
        document.getElementById('progress-bar').parentElement.classList.add('hidden');
        return;
    }
    
    document.getElementById('progress-bar').parentElement.classList.remove('hidden');
    
    const tasks = list.tasks || [];
    if (tasks.length === 0) {
        progressBar.style.width = '0%';
        progressPercentage.textContent = '0%';
        return;
    }
    
    const completedCount = tasks.filter(task => task.completed).length;
    const percentage = Math.round((completedCount / tasks.length) * 100);
    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
}

function handleInputForSuggestions() {
    const text = newTaskInput.value.trim();
    if (!text || !currentListId) {
        smartSuggestions.classList.add('hidden');
        return;
    }
    
    const list = lists.find(l => l.id === currentListId);
    if (!list) return;
    
    generateSmartSuggestions(list, text);
}

function generateSmartSuggestions(list, inputText = '') {
    if (!settings.suggestions) {
        smartSuggestions.classList.add('hidden');
        return;
    }
    
    suggestionsContainer.innerHTML = '';
    
    // Get current task names to avoid suggesting duplicates
    const currentTaskNames = list.tasks ? list.tasks.map(task => task.name.toLowerCase()) : [];
    
    // Combine different suggestion sources
    let suggestions = [
        ...getListBasedSuggestions(list.name),
        ...getHistoryBasedSuggestions(),
        ...getCommonTaskSuggestions()
    ].filter(suggestion => 
        !currentTaskNames.includes(suggestion.toLowerCase())
    );
    
    // Filter suggestions based on input text if provided
    if (inputText) {
        const inputLower = inputText.toLowerCase();
        suggestions = suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(inputLower)
        );
    }
    
    // Remove duplicates and take up to 5 suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 5);
    
    if (uniqueSuggestions.length === 0) {
        smartSuggestions.classList.add('hidden');
        return;
    }
    
    smartSuggestions.classList.remove('hidden');
    
    uniqueSuggestions.forEach(suggestion => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.addEventListener('click', () => {
            newTaskInput.value = suggestion;
            newTaskInput.focus();
        });
        suggestionsContainer.appendChild(chip);
    });
}

function getListBasedSuggestions(listName) {
    const listWords = listName.toLowerCase().split(' ');
    const suggestions = [];
    
    if (listWords.includes('work') || listWords.includes('job')) {
        suggestions.push('Finish project', 'Schedule meeting', 'Reply to emails', 'Update resume');
    }
    
    if (listWords.includes('home') || listWords.includes('house')) {
        suggestions.push('Clean kitchen', 'Do laundry', 'Organize closet', 'Water plants');
    }
    
    if (listWords.includes('shop') || listWords.includes('buy')) {
        suggestions.push('Buy groceries', 'Get milk', 'Purchase supplies');
    }
    
    if (listWords.includes('study') || listWords.includes('learn')) {
        suggestions.push('Read chapter', 'Practice exercises', 'Watch tutorial', 'Take notes');
    }
    
    return suggestions;
}

function getHistoryBasedSuggestions() {
    if (!currentListId || !inputHistory[currentListId]) return [];
    
    const history = inputHistory[currentListId];
    return history.slice(0, 3);
}

function getCommonTaskSuggestions() {
    return [
        'Call mom', 'Pay bills', 'Exercise', 
        'Read book', 'Plan weekend', 'Doctor appointment'
    ];
}

function trackInputHistory(text) {
    if (!text || !currentListId) return;
    
    if (!inputHistory[currentListId]) {
        inputHistory[currentListId] = [];
    }
    
    if (!inputHistory[currentListId].includes(text)) {
        inputHistory[currentListId].unshift(text);
        
        if (inputHistory[currentListId].length > 5) {
            inputHistory[currentListId].pop();
        }
        
        localStorage.setItem('smartListInputHistory', JSON.stringify(inputHistory));
    }
}

function clearSuggestions() {
    suggestionsContainer.innerHTML = '';
    smartSuggestions.classList.add('hidden');
}

function showNewListModal() {
    newListModal.classList.remove('hidden');
    document.getElementById('list-name').focus();
}

function hideNewListModal() {
    newListModal.classList.add('hidden');
    newListForm.reset();
}

function createNewList(e) {
    e.preventDefault();
    
    const name = document.getElementById('list-name').value.trim();
    if (!name) return;
    
    const newList = {
        id: Date.now().toString(),
        name,
        color: 'indigo',
        tasks: [],
        createdAt: new Date().toISOString()
    };
    
    lists.push(newList);
    saveToLocalStorage();
    renderLists();
    hideNewListModal();
    loadList(newList.id);
}

function addNewTask() {
    const taskName = newTaskInput.value.trim();
    if (!taskName || !currentListId) return;
    
    const list = lists.find(l => l.id === currentListId);
    if (!list) return;
    
    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        description: '',
        dueDate: '',
        priority: 'low',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    if (!list.tasks) {
        list.tasks = [];
    }
    
    list.tasks.push(newTask);
    saveToLocalStorage();
    renderTasks(filterTasks(list.tasks));
    updateProgress(list);
    
    trackInputHistory(taskName);
    
    if (settings.suggestions) {
        generateSmartSuggestions(list);
    }
    
    newTaskInput.value = '';
    newTaskInput.focus();
}

function toggleTaskCompletion(taskId) {
    if (!currentListId) return;
    
    const list = lists.find(l => l.id === currentListId);
    if (!list || !list.tasks) return;
    
    const task = list.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks(filterTasks(list.tasks));
        updateProgress(list);
    }
}

function deleteCurrentTask() {
    if (!currentListId) return;
    
    const taskId = document.getElementById('edit-task-id').value;
    const list = lists.find(l => l.id === currentListId);
    if (!list || !list.tasks) return;
    
    list.tasks = list.tasks.filter(t => t.id !== taskId);
    saveToLocalStorage();
    renderTasks(filterTasks(list.tasks));
    updateProgress(list);
    hideTaskDetailModal();
    
    if (settings.suggestions) {
        generateSmartSuggestions(list);
    }
}

function clearCompletedTasks() {
    if (!currentListId) return;
    
    const list = lists.find(l => l.id === currentListId);
    if (!list || !list.tasks) return;
    
    list.tasks = list.tasks.filter(t => !t.completed);
    saveToLocalStorage();
    renderTasks(filterTasks(list.tasks));
    updateProgress(list);
}

function deleteCurrentList() {
    if (!currentListId) return;
    
    if (!confirm('Are you sure you want to delete this list and all its tasks?')) {
        return;
    }
    
    lists = lists.filter(l => l.id !== currentListId);
    saveToLocalStorage();
    currentListId = null;
    currentListTitle.textContent = 'Select a list';
    tasksContainer.innerHTML = '';
    noTasksMessage.classList.remove('hidden');
    renderLists();
}

function showTaskDetailModal(taskId) {
    if (!currentListId) return;
    
    const list = lists.find(l => l.id === currentListId);
    if (!list || !list.tasks) return;
    
    const task = list.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-name').value = task.name;
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-due').value = task.dueDate || '';
    document.getElementById('edit-task-priority').value = task.priority || 'low';
    
    taskDetailModal.classList.remove('hidden');
}

function hideTaskDetailModal() {
    taskDetailModal.classList.add('hidden');
    taskDetailForm.reset();
}

function saveTaskChanges(e) {
    e.preventDefault();
    
    if (!currentListId) return;
    
    const list = lists.find(l => l.id === currentListId);
    if (!list || !list.tasks) return;
    
    const taskId = document.getElementById('edit-task-id').value;
    const task = list.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.name = document.getElementById('edit-task-name').value.trim();
    task.description = document.getElementById('edit-task-description').value.trim();
    task.dueDate = document.getElementById('edit-task-due').value;
    task.priority = document.getElementById('edit-task-priority').value;
    
    saveToLocalStorage();
    renderTasks(filterTasks(list.tasks));
    hideTaskDetailModal();
    
    if (settings.suggestions) {
        generateSmartSuggestions(list);
    }
}

function showSettingsModal() {
    enableSuggestions.checked = settings.suggestions;
    enableProgress.checked = settings.progress;
    enableAnimations.checked = settings.animations;
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        option.classList.add('border-gray-300');
        if (option.dataset.theme === settings.theme) {
            option.classList.add('active');
        }
    });
    
    settingsModal.classList.remove('hidden');
}

function hideSettingsModal() {
    settingsModal.classList.add('hidden');
}

function saveSettings(e) {
    e.preventDefault();
    
    settings.suggestions = enableSuggestions.checked;
    settings.progress = enableProgress.checked;
    settings.animations = enableAnimations.checked;
    
    const selectedTheme = document.querySelector('.theme-option.active')?.dataset.theme || 'light';
    settings.theme = selectedTheme;
    
    localStorage.setItem('smartListSettings', JSON.stringify(settings));
    hideSettingsModal();
    
    loadSettings();
    
    if (currentListId) {
        const list = lists.find(l => l.id === currentListId);
        if (list) {
            updateProgress(list);
            if (settings.suggestions) {
                generateSmartSuggestions(list);
            } else {
                smartSuggestions.classList.add('hidden');
            }
        }
    }
}

function resetSettings() {
    if (confirm('Reset all settings to default?')) {
        settings = {
            suggestions: true,
            progress: true,
            animations: true,
            theme: 'light'
        };
        localStorage.setItem('smartListSettings', JSON.stringify(settings));
        hideSettingsModal();
        loadSettings();
    }
}

function loadSettings() {
    if (settings.theme === 'dark' || 
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    document.body.classList.toggle('no-animations', !settings.animations);
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        settings.theme = 'light';
        document.documentElement.classList.remove('dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        settings.theme = 'dark';
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    localStorage.setItem('smartListSettings', JSON.stringify(settings));
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
    mobileMenuToggle.querySelector('i').classList.toggle('fa-chevron-down');
    mobileMenuToggle.querySelector('i').classList.toggle('fa-chevron-up');
}

function updateActiveListState() {
    document.querySelectorAll('#lists-container > div, #mobile-lists-container > div').forEach(listEl => {
        const isActive = listEl.textContent.includes(currentListTitle.textContent);
        listEl.classList.toggle('bg-indigo-50', isActive);
        listEl.classList.toggle('text-indigo-700', isActive);
        listEl.classList.toggle('text-gray-700', !isActive);
        listEl.classList.toggle('hover:bg-gray-100', !isActive);
    });
}

function updateActiveFilterState() {
    filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === currentFilter;
        btn.classList.toggle('bg-gray-100', isActive);
    });
}

function saveToLocalStorage() {
    localStorage.setItem('smartListLists', JSON.stringify(lists));
}

function updateUI() {
    if (lists.length > 0 && !currentListId) {
        loadList(lists[0].id);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isDueDateApproaching(dateString) {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Theme selection buttons
document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', function() {
        settings.theme = this.dataset.theme;
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('border-gray-300');
        });
        this.classList.add('active');
    });
});