// events.js - All event listeners and handler functions

import { getSavedLanguage, TRANSLATIONS, saveLanguage, translatePage } from './language.js';

export function setupEventListeners({ domElements, appState, renderSelectedList, updateProgressBar, applyTheme, sortTasks, saveLists, loadLists, disableTaskInputs, enableTaskInputs, displayListsForExport }) {
  if (!domElements || !appState) {
    console.error('setupEventListeners: Missing required parameters');
    return;
  }

  // Checkbox handlers for settings
  const checkboxHandlers = {
    'enable-animations': (checked) => {
      domElements.root.style.setProperty('--duration', checked ? '0.15s' : '0s');
    },
    'enable-progress': (checked) => {
      if (domElements.progressBar) {
        domElements.progressBar.style.display = checked ? 'block' : 'none';
      }
    }
  };

  document.querySelectorAll('.modal__theme-option').forEach(btn => btn.addEventListener('click', () => setSelectedTheme(appState, btn.dataset.theme)));

  // Task edit events
  domElements.tasksContainer.addEventListener('click', (e) => handleTaskEdit(e, appState.listsJSON, domElements.currentListTitle, appState, domElements));
  domElements.editTaskForm.addEventListener('submit', (e) => handleEditTaskFormSubmit(e, appState.listsJSON, domElements.currentListTitle, appState, domElements, renderSelectedList, updateProgressBar, saveLists));
  domElements.cancelTaskEdit.addEventListener('click', () => domElements.editTaskModal.classList.add('hidden'));

  // Settings events
  domElements.submitSettingsBtn.addEventListener('click', (e) => handleSettingsSubmit(e, appState.tempSettings, applyTheme, checkboxHandlers, domElements.settingsModal));
  domElements.settingsBtn.addEventListener('click', () => {
    domElements.settingsModal.classList.remove('hidden');
    setSelectedTheme(appState);
    setSelectedLanguage(appState);
  });
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

  // List creation/selection/edit/delete events
  domElements.createListForm.addEventListener('submit', (e) => handleCreateList(e, appState.listsJSON, domElements.listTitleInput, domElements.colorPicker, domElements.listContainer, domElements.currentListTitle, domElements.listModal, saveLists, renderSelectedList, appState.taskFilter, domElements.sortSelect, loadLists));
  domElements.listContainer.addEventListener('click', (e) => handleListSelection(e, domElements.currentListTitle, domElements.tasksContainer, renderSelectedList, disableTaskInputs, enableTaskInputs, appState.listsJSON, appState.taskFilter, domElements.sortSelect, domElements));
  domElements.deleteListBtn.addEventListener('click', () => handleDeleteList(appState.listsJSON, domElements.currentListTitle, domElements.listContainer, domElements.tasksContainer, updateProgressBar, saveLists, loadLists, renderSelectedList, appState.taskFilter, domElements.sortSelect, appState));
  domElements.editListForm.addEventListener('submit', (e) => handleEditList(e, appState.listsJSON, appState, domElements.editListTitle, domElements.editColorPicker, domElements.editListModal, domElements.listContainer, saveLists, loadLists, renderSelectedList, appState.taskFilter, domElements.sortSelect, domElements, domElements.currentListTitle));
  domElements.openListModal.addEventListener('click', () => {
    domElements.listModal.classList.remove('hidden');
    domElements.listTitleInput.focus();
  });
  domElements.closeListModal.addEventListener('click', () => {
    domElements.listModal.classList.add('hidden');
    domElements.listTitleInput.value = '';
  });
  domElements.editListBtn.addEventListener('click', () => handleOpenEditList(domElements.editListModal, domElements.currentListTitle, domElements.editListTitle, domElements.editColorPicker, appState));
  domElements.cancelListEdit.addEventListener('click', () => domElements.editListModal.classList.add('hidden'));

  // Task addition/completion/deletion/clear events
  domElements.addTaskBtn.addEventListener('click', (e) => handleAddTask(e, appState.listsJSON, domElements.currentListTitle, domElements.newTaskInput, renderSelectedList, updateProgressBar, sortTasks, domElements.sortSelect, saveLists, appState.taskFilter, domElements, appState));
  domElements.tasksContainer.addEventListener('click', (e) => handleTaskCompletion(e, appState.listsJSON, domElements.currentListTitle, renderSelectedList, updateProgressBar, saveLists, appState.taskFilter, domElements.sortSelect));
  domElements.tasksContainer.addEventListener('click', (e) => handleTaskDeletion(e, appState.listsJSON, domElements.currentListTitle, renderSelectedList, updateProgressBar, saveLists, appState.taskFilter, domElements.sortSelect));
  domElements.clearCompletedBtn.addEventListener('click', () => handleClearCompleted(appState.listsJSON, domElements.currentListTitle, renderSelectedList, updateProgressBar, saveLists, appState.taskFilter, domElements.sortSelect));

  // Filter buttons
  domElements.filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      appState.taskFilter = button.dataset.filter;
      renderSelectedList(appState.listsJSON, domElements.currentListTitle, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
      domElements.filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // Sort select
  domElements.sortSelect.addEventListener('change', (e) => {
    sortTasks(e.target.value, appState.listsJSON, domElements.currentListTitle, renderSelectedList, domElements.tasksContainer, appState.taskFilter, domElements.sortSelect);
  });

  // Export modal events
  domElements.openExportModalBtn.addEventListener('click', () => {
    domElements.exportListModal.classList.remove('hidden');
    displayListsForExport(domElements.exportListSpace, domElements.downloadListBtn, domElements.shareListBtn, appState.listsJSON);
  });
  domElements.closeExportModal.addEventListener('click', () => domElements.exportListModal.classList.add('hidden'));

  // Enter key adds task:
  domElements.newTaskInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      domElements.addTaskBtn.click();
    }
  });
}

function handleSettingsSubmit(e, tempSettings, applyTheme, checkboxHandlers, settingsModal) {
  e.preventDefault();
  if (tempSettings.theme) {
    applyTheme(tempSettings.theme);
  }
  if (tempSettings.language) {
    saveLanguage(tempSettings.language);
    translatePage(tempSettings.language);
  }
  Object.entries(tempSettings.checkboxes).forEach(([id, checked]) => {
    if (checkboxHandlers[id]) {
      checkboxHandlers[id](checked);
    }
  });
  settingsModal.classList.add('hidden');
}

function handleOpenEditList(editListModal, currentListTitle, editListTitle, editColorPicker, appState) {
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  const listName = currentListTitle.textContent.trim();
  if (listName === 'Select a list') {
    alert(dict['selectListToEdit']);
    return;
  }
  appState.editingListOldTitle = listName;
  editListTitle.value = listName;
  editColorPicker.value = appState.listsJSON[listName].color;
  editListModal.classList.remove('hidden');
  editListTitle.focus();
}

function handleCreateList(e, listsJSON, listTitleInput, colorPicker, listContainer, currentListTitle, listModal, saveLists, renderSelectedList, taskFilter, sortSelect, loadLists) {
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  e.preventDefault();
  const title = listTitleInput.value.trim();
  if (!title) {
    alert(dict['listNameEmpty']);
    return;
  }
  if (listsJSON[title]) {
    alert(dict['listNameExists']);
    return;
  }
  listsJSON[title] = { color: colorPicker.value, tasks: [] };
  saveLists(listsJSON);
  listContainer.innerHTML = '';
  loadLists(listContainer, currentListTitle, document.getElementById('tasks-container'), renderSelectedList, { value: taskFilter }, sortSelect);
  listModal.classList.add('hidden');
  listTitleInput.value = '';
  colorPicker.value = '#000000';
  currentListTitle.textContent = title;
  renderSelectedList(listsJSON, currentListTitle, document.getElementById('tasks-container'), taskFilter, sortSelect);
}

function handleListSelection(e, currentListTitle, tasksContainer, renderSelectedList, disableTaskInputs, enableTaskInputs, listsJSON, taskFilter, sortSelect, domElements) {
  const target = e.target.closest('.list-element');
  if (!target) return;

  const wasActive = target.classList.contains('active');  // If clicked list was already active -> unselect it
  document.querySelectorAll('.list-element').forEach(el => el.classList.remove('active'));  // Clear any active state

  if (wasActive) {
    // Unselect lists
    currentListTitle.textContent = 'Select a list';
    disableTaskInputs(domElements);
    renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter, sortSelect);
    return;
  }

  // Normal select flow
  target.classList.add('active');
  currentListTitle.textContent = target.textContent.trim();
  renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter, sortSelect);
  enableTaskInputs(domElements);
}

function handleTaskEdit(e, listsJSON, currentListTitle, appState, domElements) {
  const editBtn = e.target.closest('.task-item__edit-btn');
  if (!editBtn) return;
  const taskId = Number(editBtn.dataset.id);
  const listKey = currentListTitle.textContent.trim();
  const task = listsJSON[listKey].tasks.find(t => t.id === taskId);
  if (!task) return;
  appState.currentlyEditingTaskId = taskId;
  domElements.editName.value = task.name;
  domElements.editDesc.value = task.description || '';
  domElements.editDue.value = task.dueDate || '';
  domElements.editPrio.value = task.priority;
  domElements.editTaskModal.classList.remove('hidden');
  domElements.editName.focus();
}

function handleEditTaskFormSubmit(e, listsJSON, currentListTitle, appState, domElements, renderSelectedList, updateProgressBar, saveLists) {
  e.preventDefault();
  const listKey = currentListTitle.textContent.trim();
  const taskId = appState.currentlyEditingTaskId;
  const task = listsJSON[listKey].tasks.find(t => t.id === taskId);
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

function handleEditList(e, listsJSON, appState, editListTitle, editColorPicker, editListModal, listContainer, saveLists, loadLists, renderSelectedList, taskFilter, sortSelect, domElements, currentListTitle) {
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  e.preventDefault();
  const oldTitle = appState.editingListOldTitle;
  const newTitle = editListTitle.value.trim();
  const newColor = editColorPicker.value;
  const listData = listsJSON[oldTitle];
  if (!newTitle) {
    alert(dict['listNameEmpty']);
    return;
  }
  if (newTitle !== oldTitle && listsJSON[newTitle]) {
    alert(dict['listNameExists']);
    return;
  }

  if (!listData) {
    alert(dict['listNotFound']);
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
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  const listName = currentListTitle.textContent.trim();
  if (!listsJSON[listName]) return;

  const confirmMsg = dict['confirmDeleteList'].replace('{listName}', listName);
  if (!confirm(confirmMsg)) return;

  const target = [...document.querySelectorAll('.list-element')]
    .find(el => el.textContent.includes(listName));
  if (target) target.remove();

  delete listsJSON[listName];
  saveLists(listsJSON);
  currentListTitle.textContent = 'Select a list';
  const dict2 = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  tasksContainer.innerHTML = `
    <div class="tasks__no-tasks" id="no-tasks-message">
        <img class="tasks__no-tasks--icon" src="./assets/icons/list.svg" alt="List">
        <p class="tasks__no-tasks--text" data-i18n="selectListToView"></p>
      </div>
  `;
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
  const completeBtn = e.target.closest('.task-item__button--complete');
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
  const btn = e.target.closest('.task-item__delete-btn');
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
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  const listName = currentListTitle.textContent.trim();
  const currentList = listsJSON[listName];
  if (!currentList) return;

  if (!confirm(dict['confirmClearCompleted'])) return;

  currentList.tasks = currentList.tasks.filter(task => !task.completed);
  saveLists(listsJSON);
  renderSelectedList(listsJSON, currentListTitle, document.getElementById('tasks-container'), taskFilter, sortSelect);
  updateProgressBar(listsJSON, currentListTitle);
}

function setSelectedTheme(appState, clickedTheme = null) {
  const savedTheme = localStorage.getItem('VoidListTheme');  // Get saved theme from localStorage
  const tempThemeSelection = appState.tempSettings.theme;  // Get unsaved changes in modal 
  const themeToSelect = clickedTheme || tempThemeSelection || savedTheme || 'dark';
  
  document.querySelectorAll('.modal__theme-option').forEach(btn => btn.classList.remove('selected-option'));  // Remove existing selection

  const match = document.querySelector(`.modal__theme-option[data-theme="${themeToSelect}"]`);  // Find and mark the matching button
  if (match) match.classList.add('selected-option');  // Apply visual selection
}

function setSelectedLanguage(appState) {
  const savedLanguage = getSavedLanguage();  // Get saved language from localStorage
  const tempLanguageSelection = appState.tempSettings.language;  // Get unsaved changes in modal
  const languageToSelect = tempLanguageSelection || savedLanguage || 'english';
  
  document.querySelectorAll('[data-lang]').forEach(btn => btn.classList.remove('selected-option'));  // Remove existing selection

  const match = document.querySelector(`[data-lang="${languageToSelect}"]`);  // Find and mark the matching button
  if (match) match.classList.add('selected-option');  // Apply visual selection
}
