// utils.js - Utility functions like theme, sort etc.

export function applyTheme(theme) {
  const themes = {
    light: {
      '--bg-main': '#fff',
      '--bg-sections': '#f8f8f8',
      '--bg-hover': '#00000010',
      '--bg-modal': '#f5f5f5',
      '--bg-modal-hover': '#e2e2e2',
      '--outline-color': '#e0e0e0',
      '--modal-outline-color': '#b2b2b2',
      '--bg-progressbar': 'transparent',
      '--text-main': '#0d0d0d',
      '--text-sub': '#5f5f5f',
      '--footer-color': '#c4c4c4',
      '--important-color': '#b92424',
      '--shadow': '0 2px 12px rgba(0, 0, 0, 0.18)',
      '--img-filter': 'invert(1) brightness(0.2)',
      '--sidebar-img-filter': 'saturate(2)',
      '--hover-img-filter': 'brightness(1) !important',
      '--highlight-color': '#4791f7',
    },
    dark: {
      '--bg-main': '#0f0f0f',
      '--bg-sections': '#1c1c1c',
      '--bg-hover': '#78787828',
      '--bg-modal': '#101113',
      '--bg-modal-hover': '#232426',
      '--outline-color': '#303030',
      '--modal-outline-color': '#202123',
      '--text-main': '#fcfcfc',
      '--text-sub': '#a6a6a6',
      '--footer-color': '#363636',
      '--important-color': '#892828',
      '--shadow': '0 0 30px rgba(0, 0, 0, 0.60)',
      '--img-filter': 'none',
      '--sidebar-img-filter': 'none',
      '--hover-img-filter': 'none',
      '--highlight-color': '#155ec4',
    },
  };

  // Helper to apply CSS variables
  const applyVars = (vars) => {
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  };

  // Handle system theme: get and apply the resolved theme
  if (theme === 'system') {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyResolvedSystemTheme = () => {
      const prefersDark = media.matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      const themeVars = themes[systemTheme];
      if (!themeVars) return console.warn(`Unknown resolved system theme: ${systemTheme}`);
      applyVars(themeVars);
    };

    // Initial apply
    applyResolvedSystemTheme();

    // Add listener only once
    if (!media._listenerAdded) {
      media.addEventListener('change', applyResolvedSystemTheme);
      media._listenerAdded = true;
    }

    localStorage.setItem('VoidListTheme', 'system');  // Save system theme
    return;
  }

  // Apply theme properties for explicit themes (light/dark)
  const themeVars = themes[theme];
  if (!themeVars) return console.warn(`Unknown theme: ${theme}`);

  applyVars(themeVars);

  localStorage.setItem('VoidListTheme', theme);  // Save user-selected theme
}

export function sortTasks(method, listsJSON, currentListTitle, renderSelectedList, tasksContainer, taskFilter, sortSelect) {
  if (!currentListTitle || !currentListTitle.textContent) {
    console.error('sortTasks: currentListTitle is not defined or empty');
    return;
  }
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

  // Apply sorter if exists, else default to newest
  if (sorters[method]) {
    sorters[method]();
  } else {
    sorters.newest();
  }

  renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter, sortSelect);
}

export function disableTaskInputs(elements) {
  if (!elements) {
    console.error('disableTaskInputs: elements is undefined');
    return;
  }
  const { addTaskBtn, newTaskInput, clearCompletedBtn, editListBtn, deleteListBtn } = elements;
  if (addTaskBtn) {
    addTaskBtn.disabled = true;
    addTaskBtn.style.cursor = 'not-allowed';
  }
  if (newTaskInput) {
    newTaskInput.disabled = true;
    newTaskInput.style.cursor = 'not-allowed';
    newTaskInput.value = '';
  }
  if (clearCompletedBtn) {
    clearCompletedBtn.disabled = true;
    clearCompletedBtn.style.cursor = 'not-allowed';
  }
  if (editListBtn) {
    editListBtn.disabled = true;
    editListBtn.style.cursor = 'not-allowed';
  }
  if (deleteListBtn) {
    deleteListBtn.disabled = true;
    deleteListBtn.style.cursor = 'not-allowed';
  }
}

export function enableTaskInputs(elements) {
  if (!elements) {
    console.error('enableTaskInputs: elements is undefined');
    return;
  }
  const { addTaskBtn, newTaskInput, clearCompletedBtn, editListBtn, deleteListBtn } = elements;
  if (addTaskBtn) {
    addTaskBtn.disabled = false;
    addTaskBtn.style.cursor = 'pointer';
  }
  if (newTaskInput) {
    newTaskInput.disabled = false;
    newTaskInput.style.cursor = 'text';
  }
  if (clearCompletedBtn) {
    clearCompletedBtn.disabled = false;
    clearCompletedBtn.style.cursor = 'pointer';
  }
  if (editListBtn) {
    editListBtn.disabled = false;
    editListBtn.style.cursor = 'pointer';
  }
  if (deleteListBtn) {
    deleteListBtn.disabled = false;
    deleteListBtn.style.cursor = 'pointer';
  } 
}
