// ui.js - Rendering functions for lists, entries, progress bar, and more

import { getSavedLanguage, TRANSLATIONS, initLanguage } from './language.js';

export function renderSelectedList(
  listsJSON,
  currentListTitle,
  tasksContainer,
  taskFilter
) {
  const listKey = currentListTitle.textContent.trim();

  // Check if no list is selected
  const invalidListKeys = new Set([
    "Select a list",
    "Liste auswählen",
    "Выберите список"
  ]);

  if (!listKey || invalidListKeys.has(listKey)) {
    tasksContainer.innerHTML = `
      <div class="tasks__no-tasks" id="no-tasks-message">
        <img class="tasks__no-tasks--icon" src="./assets/icons/list.svg" alt="List">
        <p class="tasks__no-tasks--text" data-i18n="selectListToView"></p>
      </div>
    `;
    // Translate the newly inserted element
    const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
    const el = tasksContainer.querySelector('[data-i18n]');
    if (el) el.textContent = dict['selectListToView'];

    document.getElementById("progress-percentage").textContent = "0%";
    document.getElementById("progress-bar").style.width = "0%";
    return;
  }

  tasksContainer.innerHTML = "";

  // Error check: If list doesn't exist
  if (!listsJSON[listKey] || !listsJSON[listKey].tasks) {
    console.warn(`List "${listKey}" does not exist or is damaged.`);
    return;
  }

  let tasks = [...listsJSON[listKey].tasks];

  // Apply filters
  if (taskFilter === "important") {
    tasks = tasks.filter((task) => task.priority === "high");
  } else if (taskFilter === "completed") {
    tasks = tasks.filter((task) => task.completed);
  } else if (taskFilter === "today") {
    const today = new Date().toISOString().split("T")[0];
    tasks = tasks.filter((task) => task.dueDate === today);
  }

  // Show message if no tasks after filtering
  if (tasks.length === 0) {
    const messageKeys = {
      important: "noHighPriority",
      completed: "noCompletedTasks",
      today: "noTasksToday",
      all: "noTasksYet",
    };
    const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];
    const messageKey = messageKeys[taskFilter];

    tasksContainer.innerHTML = `
      <div class="tasks__no-tasks" id="no-tasks-message">
        <img class="tasks__no-tasks--icon" src="./assets/icons/list.svg" alt="List">
        <p class="tasks__no-tasks--text" data-i18n="${messageKey}">${dict[messageKey]}</p>
      </div>
    `;
  } else {
    // Render each task with escaped content for safety
    tasks.forEach((task) => {
      const escapedName = escapeHTML(task.name);
      const escapedDesc = task.description ? escapeHTML(task.description) : "";
      const escapedDue = task.dueDate ? escapeHTML(task.dueDate) : "";

      tasksContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div class="task-item priority-${task.priority
        } fade-in" data-id="${task.id}">
          <button title="Complete Task" class="task-item__button--complete${task.completed ? " completed" : ""
        }">
            ${task.completed ? "✓" : ""}
          </button>
          <div class="task-item__content ${task.completed ? "completed" : ""
        }">
            <div class="task-item__name"><p>${escapedName}</p></div>
            <div class="task-item__meta">
              ${escapedDesc
          ? `<span class="task-item__description">${escapedDesc}</span>`
          : ""
        }
              ${escapedDesc && escapedDue
          ? `<span class="task-item__separator">|</span>`
          : ""
        }
              ${escapedDue
          ? `<span class="task-item__due">${escapedDue}</span>`
          : ""
        }
            </div>
          </div>
          <div class="task-item__actions">
            <button class="task-item__btn task-item__edit-btn" data-id="${task.id
        }" title="Edit">
              <img class="task-item__button--icon" src="./assets/icons/edit.svg" title="Edit" alt="Edit">
            </button>
            <button class="task-item__button task-item__delete-btn" data-task-id="${task.id
        }" title="Delete">
              <img class="task-item__button--icon" src="./assets/icons/cross.svg" title="Delete" alt="Delete">
            </button>
          </div>
        </div>
        `
      );
    });
  }
  updateProgressBar(listsJSON, currentListTitle);
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

export function updateProgressBar(listsJSON, currentListTitle) {
  const listKey = currentListTitle.textContent.trim();
  const progressPercentage = document.getElementById("progress-percentage");
  const progressBarElement = document.getElementById("progress-bar");

  // Error check: If elements or list missing
  if (!progressPercentage || !progressBarElement || !listsJSON[listKey]) {
    if (progressPercentage) progressPercentage.textContent = "0%";
    if (progressBarElement) progressBarElement.style.width = "0%";
    return;
  }

  const tasks = listsJSON[listKey].tasks;
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressPercentage.textContent = `${percent}%`;
  progressBarElement.style.width = `${percent}%`;
}

export function displayListsForExport(
  exportListSpace,
  downloadListBtn,
  shareListBtn,
  listsJSON
) {
  exportListSpace.innerHTML = "";
  const dict = TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english'];

  // Check if no lists
  if (Object.keys(listsJSON).length === 0) {
    exportListSpace.innerHTML = `
      <div class="sidebar__no-lists" id="no-lists">
        <p class="sidebar__no-lists--text" data-i18n="noListsYet">${dict['noListsYet']}</p>
      </div>
    `;
    return;
  }

  // Render list elements
  Object.entries(listsJSON).forEach(([key]) => {
    exportListSpace.insertAdjacentHTML(
      "beforeend",
      `
      <div class="list-element" data-id="${key}">
        <input class="list-element__checkbox" type="checkbox">
        <p class="list-element__name">${escapeHTML(key)}</p>
      </div>
      `
    );
  });

  // Function to get selected lists
  function getSelectedListsForExport() {
    const checked = document.querySelectorAll(
      '.list-element input[type="checkbox"]:checked'
    );
    return Array.from(checked).map((cb) => {
      const key = cb.closest(".list-element").dataset.id;
      return {
        name: key,
        color: listsJSON[key].color,
        tasks: listsJSON[key].tasks,
      };
    });
  }

  // Add event listeners only once
  downloadListBtn.addEventListener(
    "click",
    () => {
      const selectedLists = getSelectedListsForExport();
      if (selectedLists.length === 0) {
        alert("You have to select at least one list.");
        return;
      }

      const blob = new Blob([JSON.stringify(selectedLists, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `lists-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    { once: true }  // Prevent multiple listeners
  );

  shareListBtn.addEventListener(
    "click",
    async () => {
      const selectedLists = getSelectedListsForExport();
      if (selectedLists.length === 0) {
        alert("You have to select at least one list.");
        return;
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: "My Lists",
            text: JSON.stringify(selectedLists, null, 2),
          });
          console.log("Lists successfully shared.");
        } catch (err) {
          console.error("Sharing failed:", err);
        }
      } else {
        alert("Sharing not supported by your browser.");
      }
    },
    { once: true }  // Prevent multiple listeners
  );
}

export function handleResize() {
  // Get DOM-Elements by ID
  const mobileTasksFooter = document.getElementById("mobile-tasks-footer");
  const deleteListBtn = document.getElementById("delete-list-btn");
  const clearCompleted = document.getElementById("clear-completed");
  const sortTasksContainer = document.getElementById("sort-tasks-container");
  const tasksControls = document.getElementById("tasks-controls");
  const listsContainer = document.getElementById("lists-container");
  const mobileListsContainer = document.getElementById("mobile-lists-container");
  const sidebarDivider = document.getElementById("sidebar-divider");
  const newListBtn = document.getElementById("new-list-btn");
  const sidebarHeader = document.getElementById("sidebar-header");

  const mq = window.matchMedia("(max-width: 1024px)"); // Media query check

  if (mq.matches) {
    // Mobile
    deleteListBtn.parentNode.insertBefore(sortTasksContainer, deleteListBtn);
    mobileTasksFooter.appendChild(clearCompleted);
    mobileListsContainer.appendChild(listsContainer);
    listsContainer.appendChild(newListBtn);
    newListBtn.textContent = "+";
  } else {
    // Desktop
    tasksControls.appendChild(sortTasksContainer);
    tasksControls.appendChild(clearCompleted);
    sidebarDivider.parentNode.insertBefore(listsContainer, sidebarDivider);
    sidebarHeader.appendChild(newListBtn);
    initLanguage(TRANSLATIONS[getSavedLanguage()] || TRANSLATIONS['english']);
  }
}
