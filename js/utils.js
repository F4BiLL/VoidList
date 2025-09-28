// utils.js - Utility functions like theme, sort etc.

export function applyTheme(theme) {
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

    // Handle system theme
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }

    // Apply theme properties
    Object.entries(themes[theme]).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });

    // Save theme to LocalStorage for persistence
    localStorage.setItem('VoidListTheme', theme);
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
