// data.js - Handles LocalStorage, loading/saving lists and tasks

export function loadLists(listContainer, currentListTitle, tasksContainer, renderSelectedList, taskFilter, sortSelect) {
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
        return listsJSON;
    }

    // Render list elements
    Object.entries(listsJSON).forEach(([key, { color }]) => {
        listContainer.insertAdjacentHTML('beforeend', `
            <div class="list-element sidebar-btn">
                <div class="list-color-circle" style="background-color:${color}"></div>
                <p>${key}</p>
            </div>
        `);
    });

    // Render selected list if one is active
    if (currentListTitle.textContent.trim() !== 'Select a list') {
        renderSelectedList(listsJSON, currentListTitle, tasksContainer, taskFilter.value, sortSelect);
    }

    return listsJSON;
}

export function saveLists(listsJSON) {
    // Safely save with error handling
    try {
        localStorage.setItem('VoidList', JSON.stringify(listsJSON));
    } catch (error) {
        console.error('Error saving lists to LocalStorage:', error);
    }
}
