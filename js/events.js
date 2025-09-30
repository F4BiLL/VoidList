// events.js - All event listeners and handler functions

export function setupEventListeners({ domElements, appState, renderSelectedList, updateProgressBar, applyTheme, sortTasks, saveLists, loadLists, disableTaskInputs, enableTaskInputs, displayListsForExport }) {
    if (!domElements || !appState) {
        console.error('setupEventListeners: Missing required parameters');
        return;
    }

    // Checkbox handlers for settings:
    const checkboxHandlers = {
        'enable-animations': (checked) => {
            domElements.root.style.setProperty('--transition', checked ? 'all 0.15s linear' : 'none');
        },
        'enable-progress': (checked) => {
            if (domElements.progressBar) {
                domElements.progressBar.style.display = checked ? 'block' : 'none';
            }
        }
    };

    // Task edit events:
    domElements.tasksContainer.addEventListener('click', (e) => handleTaskEdit(e, appState.listsJSON, domElements.currentListTitle, appState, domElements));
    domElements.editTaskForm.addEventListener('submit', (e) => handleEditTaskFormSubmit(e, appState.listsJSON, domElements.currentListTitle, appState, domElements, renderSelectedList, updateProgressBar, saveLists));
    domElements.cancelTaskEdit.addEventListener('click', () => domElements.editTaskModal.classList.add('hidden'));

    // Settings events:
    domElements.submitSettingsBtn.addEventListener('click', (e) => handleSettingsSubmit(e, appState.tempSettings, applyTheme, checkboxHandlers, domElements.settingsModal));
    domElements.settingsBtn.addEventListener('click', () => domElements.settingsModal.classList.remove('hidden'));
    domElements.closeSettingsBtn.addEventListener('click', () => domElements.settingsModal.classList.add('hidden'));
    domElements.themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            appState.tempSettings.theme = button.dataset.theme;
        });
    });
    domElements.settingsCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        appState.tempSettings.checkboxes[checkbox.id] = true;
        checkbox.addEventListener('change', () => {
            appState.tempSettings.checkboxes[checkbox.id] = checkbox.checked;
        });
    });

    // List creation/selection/edit/delete events:
    domElements.createListForm.addEventListener('submit', (e) => handleCreateList(e, appState.listsJSON, domElements.listTitleInput, domElements.colorPicker, domElements.listContainer, domElements.currentListTitle, domElements.listModal, saveLists, renderSelectedList, appState.taskFilter, domElements.sortSelect));
    domElements.listContainer.addEventListener('click', (e) => handleListSelection(e, domElements.currentListTitle, domElements.tasksContainer, renderSelectedList, disableTaskInputs, enableTaskInputs, appState.listsJSON, appState.taskFilter, domElements.sortSelect, domElements));
    domElements.deleteListBtn.addEventListener('click', () => handleDeleteList(appState.listsJSON, domElements.currentListTitle, domElements.listContainer, domElements.tasksContainer, updateProgressBar, saveLists, loadLists, renderSelectedList, appState.taskFilter, domElements.sortSelect, appState));
    domElements.editListForm.addEventListener('submit', (e) => handleEditList(e, appState.listsJSON, domElements.currentListTitle, domElements.editListTitle, domElements.editColorPicker, domElements.editListModal, domElements.listContainer, saveLists, loadLists, renderSelectedList, appState.taskFilter, domElements.sortSelect, appState));
    domElements.openListModal.addEventListener('click', () => {
        domElements.listModal.classList.remove('hidden');
        domElements.listTitleInput.focus();
    });
    domElements.closeListModal.addEventListener('click', () => {
        domElements.listModal.classList.add('hidden');
        domElements.listTitleInput.value = '';
    });
    domElements.editListBtn.addEventListener('click', () => handleOpenEditList(domElements.editListModal, domElements.currentListTitle, domElements.editListTitle, domElements.editColorPicker));
    domElements.cancelListEdit.addEventListener('click', () => domElements.editListModal.classList.add('hidden'));

    // Task addition/completion/deletion/clear events:
    domElements.addTaskBtn.addEventListener('click', (e) => handleAddTask(e, appState.listsJSON, domElements.currentListTitle, domElements.newTaskInput, renderSelectedList, updateProgressBar, sortTasks, domElements.sortSelect, saveLists, appState.taskFilter, domElements, appState));
    domElements.tasksContainer.addEventListener('click', (e) => handleTaskCompletion(e, appState.listsJSON, domElements.currentListTitle, renderSelectedList, updateProgressBar, saveLists, appState.taskFilter, domElements.sortSelect));
    domElements.tasksContainer.addEventListener('click', (e) => handleTaskDeletion(e, appState.listsJSON, domElements.currentListTitle, renderSelectedList, updateProgressBar, saveLists, appState.taskFilter, domElements.sortSelect));
    domElements.clearCompletedBtn.addEventListener('click', () => handleClearCompleted(appState.listsJSON, domElements.currentListTitle, renderSelectedList, updateProgressBar, saveLists, appState.taskFilter, domElements.sortSelect));

    // Add task with Enter key:
    domElements.newTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            domElements.addTaskBtn.click();
        }
    });

    // Sort and filter events:
    domElements.sortSelect.addEventListener('change', () => {
        sortTasks(domElements.sortSelect.value, appState.listsJSON, domElements.currentListTitle, renderSelectedList, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
    });
    domElements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            appState.taskFilter = button.dataset.filter;
            renderSelectedList(appState.listsJSON, domElements.currentListTitle, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
        });
    });

    // Export/share events:
    domElements.openExportModalBtn.addEventListener('click', () => domElements.exportListModal.classList.remove('hidden'));
    domElements.closeExportModal.addEventListener('click', () => domElements.exportListModal.classList.add('hidden'));
}

// Handler functions

function handleTaskEdit(e, listsJSON, currentListTitle, appState, domElements) {
    const editBtn = e.target.closest('.edit-task-btn');
    if (!editBtn) return;

    const taskId = Number(editBtn.dataset.id);
    const listKey = currentListTitle.textContent.trim();
    const task = listsJSON[listKey]?.tasks.find(t => t.id === taskId);
    if (!task) {
        console.error(`Task with ID ${taskId} not found in list "${listKey}"`);
        return;
    }

    appState.currentlyEditingTaskId = taskId;
    domElements.editName.value = task.name;
    domElements.editDesc.value = task.description || '';
    domElements.editDue.value = task.dueDate || '';
    domElements.editPrio.value = task.priority;
    domElements.editTaskModal.classList.remove('hidden');
}

function handleEditTaskFormSubmit(e, listsJSON, currentListTitle, appState, domElements, renderSelectedList, updateProgressBar, saveLists) {
    e.preventDefault();
    const listKey = currentListTitle.textContent.trim();
    const tasks = listsJSON[listKey]?.tasks;
    if (!tasks) return;

    const task = tasks.find(t => t.id === appState.currentlyEditingTaskId);
    if (!task) return;

    task.name = domElements.editName.value.trim();
    task.description = domElements.editDesc.value.trim();
    task.dueDate = domElements.editDue.value || null;
    task.priority = domElements.editPrio.value;

    saveLists(listsJSON);
    domElements.editTaskModal.classList.add('hidden');
    renderSelectedList(listsJSON, currentListTitle, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
    updateProgressBar(listsJSON, currentListTitle);
}

function handleSettingsSubmit(e, tempSettings, applyTheme, checkboxHandlers, settingsModal) {
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

function handleCreateList(e, listsJSON, listTitleInput, colorPicker, listContainer, currentListTitle, listModal, saveLists, renderSelectedList, taskFilter, sortSelect) {
    e.preventDefault();
    const listTitle = listTitleInput.value.trim();
    const color = colorPicker.value;

    if (!listTitle || listsJSON[listTitle] || listTitle === 'Select a list') return;

    const noListDummyMsg = document.getElementById('no-lists');
    if (noListDummyMsg) noListDummyMsg.remove();

    listsJSON[listTitle] = { color, tasks: [] };
    saveLists(listsJSON);
    currentListTitle.textContent = listTitle;

    listContainer.insertAdjacentHTML('beforeend', `
        <div data-id="${Date.now()}" class="list-element sidebar-btn">
            <div class="list-color-circle" style="background-color: ${color}"></div>
            <p>${listTitle}</p>
        </div>
    `);

    listTitleInput.value = '';
    colorPicker.value = '#000000';
    listModal.classList.add('hidden');

    const newListElement = [...document.querySelectorAll('.list-element')]
        .find(el => el.textContent.trim() === listTitle);
    if (newListElement) newListElement.click();
}

function handleListSelection(e, currentListTitle, tasksContainer, renderSelectedList, disableTaskInputs, enableTaskInputs, listsJSON, taskFilter, sortSelect, domElements) {
    const clickedElement = e.target.closest('.list-element');
    if (!clickedElement) return;

    const clickedTitle = clickedElement.querySelector('p')?.textContent.trim();
    if (!clickedTitle) return;

    if (clickedElement.classList.contains('active')) {
        clickedElement.classList.remove('active');
        currentListTitle.textContent = 'Select a list';
        tasksContainer.innerHTML = `
            <div class="no-tasks" id="no-tasks-message">
                <img src="./assets/icons/list.svg" alt="List">
                <p>Select a list to view tasks.</p>
            </div>
        `;
        disableTaskInputs(domElements);
        return;
    }

    document.querySelectorAll('.list-element').forEach(el => el.classList.remove('active'));
    clickedElement.classList.add('active');
    currentListTitle.textContent = clickedTitle;
    renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter, sortSelect);
    enableTaskInputs(domElements);
}

function handleOpenEditList(editListModal, currentListTitle, editListTitle, editColorPicker) {
    const activeList = document.querySelector('.list-element.active');
    if (!activeList) return;

    editListModal.classList.remove('hidden');

    const rgb2Hex = rgb => '#' + rgb.match(/\d+/g).map(n =>
        (+n).toString(16).padStart(2, '0')).join('');

    editListTitle.value = currentListTitle.textContent.trim();
    editColorPicker.value = rgb2Hex(getComputedStyle(activeList.firstElementChild).backgroundColor);
}

function handleEditList(e, domElements, listsJSON, currentListTitle, editListTitle, editColorPicker, editListModal, listContainer, saveLists, loadLists, renderSelectedList, taskFilter, sortSelect, appState) {
    e.preventDefault();

    const oldTitle = currentListTitle.textContent.trim();
    const newTitle = editListTitle.value.trim();
    const newColor = editColorPicker.value;

    if (!newTitle) {
        alert('List name cannot be empty.');
        return;
    }
    if (newTitle !== oldTitle && listsJSON[newTitle]) {
        alert('A list with this name already exists.');
        return;
    }

    console.log('oldTitle:', oldTitle, 'listsJSON keys:', Object.keys(listsJSON));
    const listData = listsJSON[oldTitle];
    if (!listData) {
        alert('Could not find the list to edit.');
        return;
    }

    if (newTitle !== oldTitle) {
        listsJSON[newTitle] = { ...listData, color: newColor };
        delete listsJSON[oldTitle];
        currentListTitle.textContent = newTitle;
    } else {
        listsJSON[oldTitle].color = newColor;
    }

    saveLists(listsJSON);
    listContainer.innerHTML = '';
    appState.listsJSON = loadLists(listContainer, currentListTitle, domElements.tasksContainer, renderSelectedList, { value: taskFilter }, sortSelect);
    const newListElement = [...document.querySelectorAll('.list-element')]
        .find(el => el.textContent.trim() === newTitle);
    if (newListElement) {
        newListElement.classList.add('active');
    }
    editListModal.classList.add('hidden');
    renderSelectedList(listsJSON, currentListTitle, domElements.tasksContainer, taskFilter, sortSelect);
}

function handleDeleteList(listsJSON, currentListTitle, listContainer, tasksContainer, updateProgressBar, saveLists, loadLists, renderSelectedList, taskFilter, sortSelect, appState) {
    const listName = currentListTitle.textContent.trim();
    if (!listsJSON[listName]) return;

    if (!confirm(`Are you sure you want to delete the list "${listName}"? This action cannot be undone.`)) return;

    const target = [...document.querySelectorAll('.list-element')]
        .find(el => el.textContent.includes(listName));
    if (target) target.remove();

    delete listsJSON[listName];
    saveLists(listsJSON);
    currentListTitle.textContent = 'Select a list';
    tasksContainer.innerHTML = `
        <div class="no-tasks" id="no-tasks-message">
            <img src="./assets/icons/list.svg" alt="List">
            <p>Select a list to view tasks.</p>
        </div>
    `;
    updateProgressBar(listsJSON, currentListTitle);
    appState.listsJSON = loadLists(listContainer, currentListTitle, tasksContainer, renderSelectedList, { value: taskFilter }, sortSelect);
    renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter, sortSelect);
}

function handleAddTask(e, listsJSON, currentListTitle, newTaskInput, renderSelectedList, updateProgressBar, sortTasks, sortSelect, saveLists, taskFilter, domElements, appState) {
    e.preventDefault();
    const listKey = currentListTitle.textContent.trim();
    if (!listsJSON[listKey]) return;

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

    listsJSON[listKey].tasks.push(newTask);
    saveLists(listsJSON);
    newTaskInput.value = '';
    renderSelectedList(listsJSON, currentListTitle, domElements.tasksContainer, taskFilter, sortSelect);
    updateProgressBar(listsJSON, currentListTitle);
    sortTasks(sortSelect.value, listsJSON, currentListTitle, renderSelectedList, domElements.tasksContainer, taskFilter, sortSelect);
}

function handleTaskCompletion(e, listsJSON, currentListTitle, renderSelectedList, updateProgressBar, saveLists, taskFilter, sortSelect) {
    const completeBtn = e.target.closest('.complete-task-btn');
    if (!completeBtn) return;

    const taskElement = completeBtn.closest('.task-item');
    const taskId = Number(taskElement.dataset.id);
    const listKey = currentListTitle.textContent.trim();
    const taskList = listsJSON[listKey]?.tasks;
    if (!taskList) return;

    const task = taskList.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveLists(listsJSON);
        renderSelectedList(listsJSON, currentListTitle, taskElement.closest('#tasks-container'), taskFilter, sortSelect);
        updateProgressBar(listsJSON, currentListTitle);
    }
}

function handleTaskDeletion(e, listsJSON, currentListTitle, renderSelectedList, updateProgressBar, saveLists, taskFilter, sortSelect) {
    const btn = e.target.closest('.delete-task-btn');
    if (!btn) return;

    const taskId = Number(btn.dataset.taskId);
    const listName = currentListTitle.textContent.trim();
    const currentList = listsJSON[listName];
    if (!currentList) return;

    currentList.tasks = currentList.tasks.filter(task => task.id !== taskId);
    saveLists(listsJSON);
    renderSelectedList(listsJSON, currentListTitle, btn.closest('#tasks-container'), taskFilter, sortSelect);
    updateProgressBar(listsJSON, currentListTitle);
}

function handleClearCompleted(listsJSON, currentListTitle, renderSelectedList, updateProgressBar, saveLists, taskFilter, sortSelect) {
    const listName = currentListTitle.textContent.trim();
    const currentList = listsJSON[listName];
    if (!currentList) return;

    if (!confirm('Delete all completed tasks from this list?')) return;

    currentList.tasks = currentList.tasks.filter(task => !task.completed);
    saveLists(listsJSON);
    renderSelectedList(listsJSON, currentListTitle, document.getElementById('tasks-container'), taskFilter, sortSelect);
    updateProgressBar(listsJSON, currentListTitle);
}
