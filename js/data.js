// data.js - Handles LocalStorage, loading/saving lists and tasks

import { getSavedLanguage, TRANSLATIONS } from './language.js';

export function loadLists(listContainer, currentListTitle, tasksContainer, renderSelectedList, taskFilter, sortSelect) {
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
  let savedData = localStorage.getItem('VoidList');
  let listsJSON = {};

  // Safely parse data with error handling
  try {
    listsJSON = savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    console.error('Error parsing lists from LocalStorage:', error);
    listsJSON = {}; // Reset to empty if corrupted
  }

  listContainer.innerHTML = '';

  // If no lists, show message
  if (Object.keys(listsJSON).length === 0) {
    listContainer.innerHTML = `
      <div class="sidebar__no-lists" id="no-lists">
        <p class="sidebar__no-lists--text" data-i18n="noListsYet">${dict['noListsYet']}</p>
      </div>
    `;
    currentListTitle.textContent = 'Select a list';
    tasksContainer.innerHTML = `
      <div class="tasks__no-tasks" id="no-tasks-message">
        <img class="tasks__no-tasks--icon" src="./assets/icons/list.svg" alt="List">
        <p class="tasks__no-tasks--text" data-i18n="selectListToView"></p>
      </div>
    `;
    return listsJSON;
  }

  // Render list elements
  Object.entries(listsJSON).forEach(([key, { color }]) => {
    listContainer.insertAdjacentHTML('beforeend', `
      <div class="sidebar__item list-element" role="button">
        <div class="sidebar__list-item-color" style="background-color:${color}"></div>
        <p>${escapeHTML(key)}</p>
      </div>
    `);
  });

  // Render selected list if one is active
  if (currentListTitle.textContent.trim() !== 'Select a list') {
    renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter.value, sortSelect);
  }

  return listsJSON;
}

// Helper function to escape HTML for safety
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function saveLists(listsJSON) {
  // Safely save with error handling
  try {
    localStorage.setItem('VoidList', JSON.stringify(listsJSON));
  } catch (error) {
    console.error('Error saving lists to LocalStorage:', error);
  }
}
