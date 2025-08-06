// ============ Create Variables ============ //

const root = document.documentElement;  // Capture root element
// Capture settings elements:
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const whereInsertTasks = document.getElementById('where-insert-tasks');
const closeSettingsBtn = document.getElementById('close-settings-modal');
const themeButtons = document.querySelectorAll('[data-theme]');
const progressBar = document.querySelector('.progress-container');
const settingsCheckboxes = document.querySelectorAll('#settings-form input[type="checkbox"]');
const submitSettingsBtn = document.getElementById('submit-btn');
// Capture list elements:
const listModal = document.getElementById('new-list-modal');
const openListModal = document.getElementById('new-list-btn');
const closeListModal = document.getElementById('cancel-list');
const createListForm = document.getElementById('new-list-form');
const listContainer = document.getElementById('lists-container');
const listTitleInput = document.getElementById('list-title-input');
const colorPicker = document.getElementById('color-picker');
const currentListTitle = document.getElementById('current-list-title');
// Capture task elements:
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const deleteListBtn = document.getElementById('delete-list-btn');
const listsContainer = document.getElementById('lists-container');
const tasksContainer = document.getElementById('tasks-container');
// Capture task-editing elements:
const editTaskModal = document.getElementById('task-detail-modal');
const editForm = document.getElementById('task-detail-form');
const editName = document.getElementById('edit-task-name');
const editDesc = document.getElementById('edit-task-description');
const editDue = document.getElementById('edit-task-due');
const editPrio = document.getElementById('edit-task-priority');
const cancelEdit = document.getElementById('cancel-task-edit');
// Capture task controls:
const clearCompletedBtn = document.getElementById('clear-completed');
const sortSelect = document.getElementById("sort-tasks");
// Capture filter btns:
const filterButtons = document.querySelectorAll('[data-filter]');

let currentlyEditingTaskId = null;

let taskFilter = 'all';

let tempSettings = {
    theme: null,
    checkboxes: {}
};

let listsJSON = {};

// Checkbox handler:
const checkboxHandlers = {
    'enable-animations': checked => {
        root.style.setProperty('--transition', checked ? 'all .15s linear' : 'none');
    },
    'enable-progress': checked => {
        if (progressBar) {
            progressBar.style.display = checked ? 'block' : 'none';
        }
    }
};

// ============  EventListeners  ============ //

// Open edit task modal:
tasksContainer.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-task-btn');
    if (!editBtn) return;

    const taskId = Number(editBtn.dataset.id);
    const listKey = currentListTitle.textContent.trim();
    const task = listsJSON[listKey]?.tasks.find(t => t.id === taskId);
    if (!task) return;

    currentlyEditingTaskId = taskId;

    // Load current task values into inputs: 
    editName.value = task.name;
    editDesc.value = task.description || '';
    editDue.value = task.dueDate || '';
    editPrio.value = task.priority;

    editTaskModal.classList.remove('hidden');
});

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const listKey = currentListTitle.textContent.trim();
    const tasks = listsJSON[listKey]?.tasks;
    if (!tasks) return;

    const task = tasks.find(t => t.id === currentlyEditingTaskId);
    if (!task) return;

    // Save new task values:
    task.name = editName.value.trim();
    task.description = editDesc.value.trim();
    task.dueDate = editDue.value || null;
    task.priority = editPrio.value;

    localStorage.setItem('VoidList', JSON.stringify(listsJSON));
    editTaskModal.classList.add('hidden');
    renderSelectedList();
    updateProgressBar();
});

cancelEdit.addEventListener('click', () => {
    editTaskModal.classList.add('hidden');
});

// Open / Close settings modal:
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Switch theme:
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        tempSettings.theme = button.dataset.theme;
    });
});

// Switch filter:
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        taskFilter = button.dataset.filter;
        renderSelectedList(taskFilter);
    });
});


// Enable / Disable app-features:
settingsCheckboxes.forEach(checkbox => {
    checkbox.checked = true;
    tempSettings.checkboxes[checkbox.id] = true;  

    checkbox.addEventListener('change', () => {
        tempSettings.checkboxes[checkbox.id] = checkbox.checked;
    });
});

// Apply changes in settings modal:
submitSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (tempSettings.theme) {
        applyTheme(tempSettings.theme);
    }

    for (const [id, checked] of Object.entries(tempSettings.checkboxes)) {
        const handler = checkboxHandlers[id];
        if (handler) {
            handler(checked);
        }
    }

    settingsModal.classList.add('hidden');
});

// Open / Close 'Create List' modal:
openListModal.addEventListener('click', () => {
    listModal.classList.remove('hidden');
    listTitleInput.focus();
});

closeListModal.addEventListener('click', () => {
    listModal.classList.add('hidden');
    listTitleInput.value = '';
});

// Create new list:
createListForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const listTitle = listTitleInput.value.trim();
    const color = colorPicker.value;

    // Prevent re-creating existing lists / creating 'Select a list' list:
    if (!listTitle || listsJSON[listTitle] || listTitle === 'Select a list') return;

    noListDummyMsg = document.getElementById('no-lists');
    if (noListDummyMsg) {
        noListDummyMsg.remove();
    }

    listsJSON[listTitle] = {
        color: color,
        tasks: []
    };

    localStorage.setItem('VoidList', JSON.stringify(listsJSON));
    currentListTitle.textContent = listTitle;
    renderSelectedList();

    // Display list in sidebar:
    listContainer.innerHTML += `
        <div class="list-element sidebar-btn">
            <div class="list-color-circle" style="background-color: ${color}"></div>
            <p>${listTitle}</p>
        </div>
    `;

    // Save & reload UI:
    localStorage.setItem('VoidList', JSON.stringify(listsJSON));
    currentListTitle.textContent = listTitle;
    renderSelectedList();

    listTitleInput.value = '';
    colorPicker.value = '#000000';
    listModal.classList.add('hidden');

    const newListElement = [...document.querySelectorAll('.list-element')]
    .find(el => el.textContent.trim() === listTitle);

    newListElement.click();  // Select new list instantly
});

// Select / Deselect list:
listContainer.addEventListener('click', (event) => {
    const clickedElement = event.target.closest('.list-element');
    if (!clickedElement) return;

    const clickedTitle = clickedElement.querySelector('p')?.textContent.trim();

    // Click on selected list to unselect:
    if (clickedElement.classList.contains('active')) {
        clickedElement.classList.remove('active');
        currentListTitle.textContent = 'Select a list';
        tasksContainer.innerHTML = `
            <div class="no-tasks" id="no-tasks-message">
                <img src="./assets/icons/list.svg" alt="List">
                <p>Select a list to view tasks.</p>
            </div>
        `;
        addTaskBtn.disabled = true;
        newTaskInput.disabled = true;
        addTaskBtn.style.setProperty('cursor', 'not-allowed');
        newTaskInput.style.setProperty('cursor', 'not-allowed');
        newTaskInput.value = '';
        deleteListBtn.style.setProperty('cursor', 'not-allowed');
        updateProgressBar();
        return;
    }

    // Select a list:
    document.querySelectorAll('.list-element').forEach(el => el.classList.remove('active'));
    clickedElement.classList.add('active');
    currentListTitle.textContent = clickedTitle;
    renderSelectedList();
});

// Delete list:
deleteListBtn.addEventListener('click', () => {
    const listName = currentListTitle.textContent.trim();
    if (!listsJSON[listName]) return;

    const confirmed = confirm(`Are you sure you want to delete the list "${listName}"? This action cannot be undone.`);
    if (!confirmed) return;

    // Remove list from UI:
    const target = [...document.querySelectorAll('.list-element')]
        .find(el => el.textContent.includes(listName));
    if (target) target.remove();

    // Remove list from JSON and localStorage:
    delete listsJSON[listName];
    localStorage.setItem('VoidList', JSON.stringify(listsJSON));

    // Reset UI:
    currentListTitle.textContent = "Select a list";
    tasksContainer.innerHTML = '';
    updateProgressBar();
    loadLists();
});


// Add task to a list:
addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const listKey = currentListTitle.textContent.trim();
    if (!listsJSON[listKey]) {
        console.error(`Liste "${listKey}" existiert nicht.`);
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

    // Control where to append new tasks in the list:
    const insertWhere = document.getElementById('where-insert-tasks').value;
    if (insertWhere === 'top') {
        listsJSON[listKey].tasks.unshift(newTask);
    } else {
        listsJSON[listKey].tasks.push(newTask);
    }

    localStorage.setItem('VoidList', JSON.stringify(listsJSON));

    newTaskInput.value = '';
    renderSelectedList();
    updateProgressBar();
    sortSelect.value === 'newest';
    sortTasks(sortSelect.value);
});

// Mark task as completed:
tasksContainer.addEventListener('click', (e) => {
    const completeBtn = e.target.closest('.complete-task-btn');
    if (!completeBtn) return;

    const taskElement = completeBtn.closest('.task-item');
    const taskId = Number(taskElement.dataset.id);
    const listKey = currentListTitle.textContent.trim();
    const taskList = listsJSON[listKey].tasks;

    // Locate completed tasks in JSON:
    const task = taskList.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        renderSelectedList(); // Reload UI
        updateProgressBar();
    }
});

// Add task by pressing the enter key:
newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

// Delete task:
tasksContainer.addEventListener('click', (e) => {
    if (e.target.closest('.delete-task-btn')) {
        const btn = e.target.closest('.delete-task-btn');
        const taskId = Number(btn.dataset.taskId);

        const listName = currentListTitle.textContent.trim();
        const currentList = listsJSON[listName];

        if (!currentList) return;

        currentList.tasks = currentList.tasks.filter(task => task.id !== taskId);
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
        renderSelectedList();
        updateProgressBar();
    }
});

// Delete all completed tasks in selected list:
clearCompletedBtn.addEventListener('click', () => {
    const listName = currentListTitle.textContent.trim();
    const currentList = listsJSON[listName];

    if (!currentList) return;

    const confirmed = confirm("Delete all completed tasks from this list?");
    if (!confirmed) return;

    // Filter out completed tasks:
    currentList.tasks = currentList.tasks.filter(task => !task.completed);  

    // Save changes:
    localStorage.setItem('VoidList', JSON.stringify(listsJSON));
    renderSelectedList();
    updateProgressBar();
});

// Sort tasks:
sortSelect.addEventListener("change", () => {
    sortTasks(sortSelect.value);
    renderSelectedList();
});


// ============ Logic Functions ============ //
function applyTheme(theme) {
    if (theme === 'light') {
        root.style.setProperty('--bg-main', '#c3c3c3');
        root.style.setProperty('--bg-side', '#eaeaea');
        root.style.setProperty('--bg-hover', '#c1c1c175');
        root.style.setProperty('--bg-processbar', '#fff');
        root.style.setProperty('--text-main', '#414141');
        root.style.setProperty('--text-side', '#000');
        root.style.setProperty('--text-header', '#242424');
        root.style.setProperty('--footer-color', '#343b4975');
    }
    if (theme === 'dark') {
        root.style.setProperty('--bg-main', '#111827');
        root.style.setProperty('--bg-side', '#1e2943');
        root.style.setProperty('--bg-hover', '#78787828');
        root.style.setProperty('--bg-processbar', '#e5e7eb');
        root.style.setProperty('--text-main', '#d1d5db');
        root.style.setProperty('--text-side', '#f3f4f6');
        root.style.setProperty('--text-header', '#fff');
        root.style.setProperty('--footer-color', '#343b49');
    }
    if (theme === 'system') {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}   

// Handle list selection:
function renderSelectedList() {
    const listKey = currentListTitle.textContent.trim();
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    if (listKey === "Select a list" || !listKey) {
        addTaskBtn.disabled = true;
        newTaskInput.disabled = true;
        clearCompletedBtn.disabled = true;
        addTaskBtn.style.setProperty('cursor', 'not-allowed');
        newTaskInput.style.setProperty('cursor', 'not-allowed');
        deleteListBtn.style.setProperty('cursor', 'not-allowed');
        clearCompletedBtn.style.setProperty('cursor', 'not-allowed');

        tasksContainer.innerHTML = `
            <div class="no-tasks" id="no-tasks-message">
                <img src="./assets/icons/list.svg" alt="List">
                <p>Select a list to view tasks.</p>
            </div>
        `;
        return;
    } else {
        addTaskBtn.disabled = false;
        newTaskInput.disabled = false;
        clearCompletedBtn.disabled = false;
        clearCompletedBtn.style.setProperty('cursor', 'pointer');
        addTaskBtn.style.setProperty('cursor', 'pointer');
        deleteListBtn.style.setProperty('cursor', 'pointer');
        newTaskInput.style.setProperty('cursor', 'text');
        tasksContainer.innerHTML = '';

        if (!listsJSON[listKey] || !listsJSON[listKey].tasks) {
            console.warn(`Liste "${listKey}" existiert nicht oder ist beschädigt.`);
            return;
        }

        let tasks = listsJSON[listKey].tasks;

        if (taskFilter === 'important') {
            tasks = tasks.filter(task => task.priority === "high");
        } else if (taskFilter === 'completed') {
            tasks = tasks.filter(task => task.completed);
        } else if (taskFilter === 'today') {
            tasks = tasks.filter(task => task.dueDate === today);
        }

        if (tasks.length === 0) {
            let noTasksMessage = 'No tasks yet. Add your first task above!';
            
            if (taskFilter === 'important') {
                noTasksMessage = 'No high priority tasks yet.';
            } else if (taskFilter === 'completed') {
                noTasksMessage = 'No completed tasks yet.';
            } else if (taskFilter === 'today') {
                noTasksMessage = 'No tasks for today yet.';
            }

            tasksContainer.innerHTML = `
                <div class="no-tasks" id="no-tasks-message">
                    <img src="./assets/icons/list.svg" alt="List">
                    <p>${noTasksMessage}</p>
                </div>
            `;
        } else {
            tasks.forEach(task => {
                tasksContainer.innerHTML += `
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
                            <button class="edit-task-btn" data-id="${task.id}" title="Edit"><img src="./assets/icons/edit.svg" alt="Edit"></button>
                            <button class="delete-task-btn" data-task-id="${task.id}" title="Delete"><img src="./assets/icons/cross.svg" alt="Delete"></button>
                        </div>
                    </div>
                `;
            });
        }
        updateProgressBar();
    }
    newTaskInput.focus();
}


// Load list from localStorage:
function loadLists() {
    const savedData = localStorage.getItem('VoidList');

    if (savedData) {
        listsJSON = JSON.parse(savedData);
    } else {
        listsJSON = {};
    }

    listContainer.innerHTML = '';  // Remove all lists from UI

    // Reload all lists in HTML:
    Object.keys(listsJSON).forEach(key => {
        const listColor = listsJSON[key].color;
        
        listContainer.innerHTML += `
            <div class="list-element sidebar-btn">
                <div class="list-color-circle" style="background-color:${listColor}"></div>
                <p>${key}</p>
            </div>
        `;
    });

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
        addTaskBtn.disabled = true;
        newTaskInput.disabled = true;
        return;
    }
}

function updateProgressBar() {
    const listKey = currentListTitle.textContent.trim();

    // Reset progress:
    if (!listsJSON[listKey]) {
        document.getElementById('progress-percentage').textContent = '0%';
        document.getElementById('progress-bar').style.width = '0%';
        return;
    }

    // Calc & display progress of selected list:
    const tasks = listsJSON[listKey].tasks;
    const total = tasks.length;
    const done = tasks.filter(task => task.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById('progress-percentage').textContent = `${percent}%`;
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

function sortTasks(method) {
    const listKey = currentListTitle.textContent.trim();
    if (!listsJSON[listKey]) return;

    const taskList = listsJSON[listKey].tasks;

    if (method === "priority") {
        const prioOrder = { high: 1, medium: 2, low: 3 };
        taskList.sort((a, b) => (prioOrder[a.priority] || 4) - (prioOrder[b.priority] || 4));
    } else if (method === "date") {
        taskList.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    } else if (method === "name") {
        taskList.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );
    } else if (method === "newest") {
        taskList.sort((a, b) => b.id - a.id);
    }

    renderSelectedList();
}

renderSelectedList();
loadLists();