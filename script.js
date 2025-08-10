// Global Variables
    const root = document.documentElement;
    
    // Settings Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const whereInsertTasks = document.getElementById('where-insert-tasks');
    const closeSettingsBtn = document.getElementById('close-settings-modal');
    const themeButtons = document.querySelectorAll('[data-theme]');
    const progressBar = document.querySelector('.progress-container');
    const settingsCheckboxes = document.querySelectorAll('#settings-form input[type="checkbox"]');
    const submitSettingsBtn = document.getElementById('submit-btn');
    
    // List Elements
    const listModal = document.getElementById('new-list-modal');
    const openListModal = document.getElementById('new-list-btn');
    const closeListModal = document.getElementById('cancel-list');
    const createListForm = document.getElementById('new-list-form');
    const listContainer = document.getElementById('lists-container');
    const listTitleInput = document.getElementById('list-title-input');
    const colorPicker = document.getElementById('color-picker');
    const currentListTitle = document.getElementById('current-list-title');
    
    // Task Elements
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const deleteListBtn = document.getElementById('delete-list-btn');
    const tasksContainer = document.getElementById('tasks-container');
    
    // Task Editing Elements
    const editTaskModal = document.getElementById('task-detail-modal');
    const editForm = document.getElementById('task-detail-form');
    const editName = document.getElementById('edit-task-name');
    const editDesc = document.getElementById('edit-task-description');
    const editDue = document.getElementById('edit-task-due');
    const editPrio = document.getElementById('edit-task-priority');
    const cancelEdit = document.getElementById('cancel-task-edit');
    
    // Task Controls
    const clearCompletedBtn = document.getElementById('clear-completed');
    const sortSelect = document.getElementById('sort-tasks');
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    let currentlyEditingTaskId = null;
    let taskFilter = 'all';
    let tempSettings = {
        theme: null,
        checkboxes: {}
    };
    let listsJSON = {};
    
    // Checkbox Handlers
    const checkboxHandlers = {
        'enable-animations': (checked) => {
            root.style.setProperty('--transition', checked ? 'all 0.15s linear' : 'none');
        },
        'enable-progress': (checked) => {
            if (progressBar) {
                progressBar.style.display = checked ? 'block' : 'none';
            }
        }
    };
    
    // Event Listeners
    function setupEventListeners() {
        // Open Edit Task Modal
        tasksContainer.addEventListener('click', handleTaskEdit);
    
        // Submit Edit Task Form
        editForm.addEventListener('submit', handleEditFormSubmit);
    
        // Cancel Task Edit
        cancelEdit.addEventListener('click', () => editTaskModal.classList.add('hidden'));
    
        // Open/Close Settings Modal
        settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
        closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    
        // Theme Selection
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                tempSettings.theme = button.dataset.theme;
            });
        });
    
        // Filter Selection
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                taskFilter = button.dataset.filter;
                renderSelectedList(taskFilter);
            });
        });
    
        // Settings Checkboxes
        settingsCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            tempSettings.checkboxes[checkbox.id] = true;
            checkbox.addEventListener('change', () => {
                tempSettings.checkboxes[checkbox.id] = checkbox.checked;
            });
        });
    
        // Apply Settings
        submitSettingsBtn.addEventListener('click', handleSettingsSubmit);
    
        // Open/Close Create List Modal
        openListModal.addEventListener('click', () => {
            listModal.classList.remove('hidden');
            listTitleInput.focus();
        });
        closeListModal.addEventListener('click', () => {
            listModal.classList.add('hidden');
            listTitleInput.value = '';
        });
    
        // Create New List
        createListForm.addEventListener('submit', handleCreateList);
    
        // Select/Deselect List
        listContainer.addEventListener('click', handleListSelection);
    
        // Delete List
        deleteListBtn.addEventListener('click', handleDeleteList);
    
        // Add Task
        addTaskBtn.addEventListener('click', handleAddTask);
    
        // Add Task with Enter Key
        newTaskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTaskBtn.click();
            }
        });
    
        // Mark Task as Completed
        tasksContainer.addEventListener('click', handleTaskCompletion);
    
        // Delete Task
        tasksContainer.addEventListener('click', handleTaskDeletion);
    
        // Clear Completed Tasks
        clearCompletedBtn.addEventListener('click', handleClearCompleted);
    
        // Sort Tasks
        sortSelect.addEventListener('change', () => {
            sortTasks(sortSelect.value);
            renderSelectedList();
        });
    }
    
    // Event Handlers
    function handleTaskEdit(e) {
        const editBtn = e.target.closest('.edit-task-btn');
        if (!editBtn) return;
    
        const taskId = Number(editBtn.dataset.id);
        const listKey = currentListTitle.textContent.trim();
        const task = listsJSON[listKey]?.tasks.find(t => t.id === taskId);
        if (!task) return;
    
        currentlyEditingTaskId = taskId;
        editName.value = task.name;
        editDesc.value = task.description || '';
        editDue.value = task.dueDate || '';
        editPrio.value = task.priority;
        editTaskModal.classList.remove('hidden');
    }
    
    function handleEditFormSubmit(e) {
        e.preventDefault();
        const listKey = currentListTitle.textContent.trim();
        const tasks = listsJSON[listKey]?.tasks;
        if (!tasks) return;
    
        const task = tasks.find(t => t.id === currentlyEditingTaskId);
        if (!task) return;
    
        task.name = editName.value.trim();
        task.description = editDesc.value.trim();
        task.dueDate = editDue.value || null;
        task.priority = editPrio.value;
    
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        editTaskModal.classList.add('hidden');
        renderSelectedList();
        updateProgressBar();
    }
    
    function handleSettingsSubmit(e) {
        e.preventDefault();
        if (tempSettings.theme) {
            applyTheme(tempSettings.theme);
        }
        for (const [id, checked] of Object.entries(tempSettings.checkboxes)) {
            const handler = checkboxHandlers[id];
            if (handler) handler(checked);
        }
        settingsModal.classList.add('hidden');
    }
    
    function handleCreateList(e) {
        e.preventDefault();
        const listTitle = listTitleInput.value.trim();
        const color = colorPicker.value;
    
        if (!listTitle || listsJSON[listTitle] || listTitle === 'Select a list') return;
    
        const noListDummyMsg = document.getElementById('no-lists');
        if (noListDummyMsg) noListDummyMsg.remove();
    
        listsJSON[listTitle] = { color, tasks: [] };
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        currentListTitle.textContent = listTitle;
    
        listContainer.insertAdjacentHTML('beforeend', `
            <div class="list-element sidebar-btn">
                <div class="list-color-circle" style="background-color: ${color}"></div>
                <p>${listTitle}</p>
            </div>
        `);
    
        listTitleInput.value = '';
        colorPicker.value = '#000000';
        listModal.classList.add('hidden');
    
        const newListElement = [...document.querySelectorAll('.list-element')]
            .find(el => el.textContent.trim() === listTitle);
        newListElement.click();
    }
    
    function handleListSelection(event) {
        const clickedElement = event.target.closest('.list-element');
        if (!clickedElement) return;
    
        const clickedTitle = clickedElement.querySelector('p')?.textContent.trim();
    
        if (clickedElement.classList.contains('active')) {
            clickedElement.classList.remove('active');
            currentListTitle.textContent = 'Select a list';
            tasksContainer.innerHTML = `
                <div class="no-tasks" id="no-tasks-message">
                    <img src="./assets/icons/list.svg" alt="List">
                    <p>Select a list to view tasks.</p>
                </div>
            `;
            disableTaskInputs();
            return;
        }
    
        document.querySelectorAll('.list-element').forEach(el => el.classList.remove('active'));
        clickedElement.classList.add('active');
        currentListTitle.textContent = clickedTitle;
        renderSelectedList();
    }
    
    function handleDeleteList() {
        const listName = currentListTitle.textContent.trim();
        if (!listsJSON[listName]) return;
    
        if (!confirm(`Are you sure you want to delete the list "${listName}"? This action cannot be undone.`)) return;
    
        const target = [...document.querySelectorAll('.list-element')]
            .find(el => el.textContent.includes(listName));
        if (target) target.remove();
    
        delete listsJSON[listName];
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        currentListTitle.textContent = 'Select a list';
        tasksContainer.innerHTML = '';
        updateProgressBar();
        loadLists();
    }
    
    function handleAddTask(e) {
        e.preventDefault();
        const listKey = currentListTitle.textContent.trim();
        if (!listsJSON[listKey]) {
            console.error(`List "${listKey}" does not exist.`);
            return;
        }
    
        const inputValue = newTaskInput.value.trim();
        if (!inputValue) return;
    
        const newTask = {
            id: Date.now(),
            name: inputValue,
            description: '',
            priority: 'low',
            dueDate: null,
            completed: false
        };
    
        const insertWhere = whereInsertTasks.value;
        if (insertWhere === 'top') {
            listsJSON[listKey].tasks.unshift(newTask);
        } else {
            listsJSON[listKey].tasks.push(newTask);
        }
    
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        newTaskInput.value = '';
        renderSelectedList();
        updateProgressBar();
        sortSelect.value = 'newest';
        sortTasks(sortSelect.value);
    }
    
    function handleTaskCompletion(e) {
        const completeBtn = e.target.closest('.complete-task-btn');
        if (!completeBtn) return;
    
        const taskElement = completeBtn.closest('.task-item');
        const taskId = Number(taskElement.dataset.id);
        const listKey = currentListTitle.textContent.trim();
        const taskList = listsJSON[listKey].tasks;
    
        const task = taskList.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            localStorage.setItem('VoidList', JSON.stringify(listsJSON));
            renderSelectedList();
            updateProgressBar();
        }
    }
    
    function handleTaskDeletion(e) {
        const btn = e.target.closest('.delete-task-btn');
        if (!btn) return;
    
        const taskId = Number(btn.dataset.taskId);
        const listName = currentListTitle.textContent.trim();
        const currentList = listsJSON[listName];
    
        if (!currentList) return;
    
        currentList.tasks = currentList.tasks.filter(task => task.id !== taskId);
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        renderSelectedList();
        updateProgressBar();
    }
    
    function handleClearCompleted() {
        const listName = currentListTitle.textContent.trim();
        const currentList = listsJSON[listName];
    
        if (!currentList) return;
    
        if (!confirm('Delete all completed tasks from this list?')) return;
    
        currentList.tasks = currentList.tasks.filter(task => !task.completed);
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        renderSelectedList();
        updateProgressBar();
    }
    
    // Logic Functions
    function applyTheme(theme) {
        const themes = {
            light: {
                '--bg-main': '#c3c3c3',
                '--bg-side': '#eaeaea',
                '--bg-hover': '#c1c1c175',
                '--bg-processbar': '#fff',
                '--text-main': '#414141',
                '--text-side': '#000',
                '--text-header': '#242424',
                '--footer-color': '#343b4975'
            },
            dark: {
                '--bg-main': '#111827',
                '--bg-side': '#1e2943',
                '--bg-hover': '#78787828',
                '--bg-processbar': '#e5e7eb',
                '--text-main': '#d1d5db',
                '--text-side': '#f3f4f6',
                '--text-header': '#fff',
                '--footer-color': '#343b49'
            }
        };
    
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
    
        Object.entries(themes[theme]).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }
    
    function renderSelectedList() {
        const listKey = currentListTitle.textContent.trim();
        const today = new Date().toISOString().split('T')[0];
    
        if (listKey === 'Select a list' || !listKey) {
            disableTaskInputs();
            tasksContainer.innerHTML = `
                <div class="no-tasks" id="no-tasks-message">
                    <img src="./assets/icons/list.svg" alt="List">
                    <p>Select a list to view tasks.</p>
                </div>
            `;
            return;
        }
    
        enableTaskInputs();
        tasksContainer.innerHTML = '';
    
        if (!listsJSON[listKey]?.tasks) {
            console.warn(`List "${listKey}" does not exist or is corrupted.`);
            return;
        }
    
        let tasks = [...listsJSON[listKey].tasks];
    
        if (taskFilter === 'important') {
            tasks = tasks.filter(task => task.priority === 'high');
        } else if (taskFilter === 'completed') {
            tasks = tasks.filter(task => task.completed);
        } else if (taskFilter === 'today') {
            tasks = tasks.filter(task => task.dueDate === today);
        }
    
        if (tasks.length === 0) {
            const messages = {
                important: 'No high priority tasks yet.',
                completed: 'No completed tasks yet.',
                today: 'No tasks for today yet.',
                all: 'No tasks yet. Add your first task above!'
            };
            tasksContainer.innerHTML = `
                <div class="no-tasks" id="no-tasks-message">
                    <img src="./assets/icons/list.svg" alt="List">
                    <p>${messages[taskFilter]}</p>
                </div>
            `;
        } else {
            tasks.forEach(task => {
                tasksContainer.insertAdjacentHTML('beforeend', `
                    <div class="task-item priority-${task.priority} fade-in" data-id="${task.id}">
                        <button class="complete-task-btn ${task.completed ? 'completed' : ''}">
                            ${task.completed ? '✓' : ''}
                        </button>
                        <div class="task-content ${task.completed ? 'completed' : ''}">
                            <div class="task-name"><p>${task.name}</p></div>
                            <div class="task-meta">
                                ${task.description ? `<span class="task-description">${task.description}</span>` : ''}
                                ${(task.description && task.dueDate) ? `<span class="separator">|</span>` : ''}
                                ${task.dueDate ? `<span class="task-due">${task.dueDate}</span>` : ''}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="edit-task-btn" data-id="${task.id}" title="Edit">
                                <img src="./assets/icons/edit.svg" alt="Edit">
                            </button>
                            <button class="delete-task-btn" data-task-id="${task.id}" title="Delete">
                                <img src="./assets/icons/cross.svg" alt="Delete">
                            </button>
                        </div>
                    </div>
                `);
            });
        }
        updateProgressBar();
        newTaskInput.focus();
    }
    
    function loadLists() {
        const savedData = localStorage.getItem('VoidList');
        listsJSON = savedData ? JSON.parse(savedData) : {};
    
        listContainer.innerHTML = '';
    
        if (Object.keys(listsJSON).length === 0) {
            listContainer.innerHTML = `
                <div class="no-lists" id="no-lists">
                    <p>No lists yet. Create your first list!</p>
                </div>
            `;
            currentListTitle.textContent = 'Select a list';
            tasksContainer.innerHTML = `
                <div class="no-tasks" id="no-tasks-message">
                    <img src="./assets/icons/list.svg" alt="List">
                    <p>Select a list to view tasks.</p>
                </div>
            `;
            disableTaskInputs();
            return;
        }
    
        Object.entries(listsJSON).forEach(([key, { color }]) => {
            listContainer.insertAdjacentHTML('beforeend', `
                <div class="list-element sidebar-btn">
                    <div class="list-color-circle" style="background-color:${color}"></div>
                    <p>${key}</p>
                </div>
            `);
        });
    }
    
    function updateProgressBar() {
        const listKey = currentListTitle.textContent.trim();
        const progressPercentage = document.getElementById('progress-percentage');
        const progressBarElement = document.getElementById('progress-bar');
    
        if (!listsJSON[listKey]) {
            progressPercentage.textContent = '0%';
            progressBarElement.style.width = '0%';
            return;
        }
    
        const tasks = listsJSON[listKey].tasks;
        const total = tasks.length;
        const done = tasks.filter(task => task.completed).length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    
        progressPercentage.textContent = `${percent}%`;
        progressBarElement.style.width = `${percent}%`;
    }
    
    function sortTasks(method) {
        const listKey = currentListTitle.textContent.trim();
        if (!listsJSON[listKey]) return;
    
        const taskList = listsJSON[listKey].tasks;
    
        const sorters = {
            priority: () => {
                const prioOrder = { high: 1, medium: 2, low: 3 };
                taskList.sort((a, b) => (prioOrder[a.priority] || 4) - (prioOrder[b.priority] || 4));
            },
            date: () => {
                taskList.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            },
            name: () => {
                taskList.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                );
            },
            newest: () => {
                taskList.sort((a, b) => b.id - a.id);
            }
        };
    
        sorters[method]?.();
        renderSelectedList();
    }
    
    function disableTaskInputs() {
        addTaskBtn.disabled = true;
        newTaskInput.disabled = true;
        clearCompletedBtn.disabled = true;
        addTaskBtn.style.setProperty('cursor', 'not-allowed');
        newTaskInput.style.setProperty('cursor', 'not-allowed');
        deleteListBtn.style.setProperty('cursor', 'not-allowed');
        clearCompletedBtn.style.setProperty('cursor', 'not-allowed');
        newTaskInput.value = '';
    }
    
    function enableTaskInputs() {
        addTaskBtn.disabled = false;
        newTaskInput.disabled = false;
        clearCompletedBtn.disabled = false;
        addTaskBtn.style.setProperty('cursor', 'pointer');
        newTaskInput.style.setProperty('cursor', 'text');
        deleteListBtn.style.setProperty('cursor', 'pointer');
        clearCompletedBtn.style.setProperty('cursor', 'pointer');
    }
    
    // Initialize
    setupEventListeners();
    loadLists();
    renderSelectedList();