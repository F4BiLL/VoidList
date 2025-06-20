const root = document.documentElement;  // Capture HTML Root-Element
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-modal');
const themeButtons = document.querySelectorAll('[data-theme]');
const progressBar = document.querySelector('.progress-container');
const settingsCheckboxes = document.querySelectorAll('#settings-form input[type="checkbox"]');
const submitSettingsBtn = document.getElementById('submit-btn');
const listModal = document.getElementById('new-list-modal');
const openListModal = document.getElementById('new-list-btn');
const closeListModal = document.getElementById('cancel-list');
const createListForm = document.getElementById('new-list-form');
const listContainer = document.getElementById('lists-container');
const listTitleInput = document.getElementById('list-title-input');
const colorPicker = document.getElementById('color-picker');
const currentListTitle = document.getElementById('current-list-title');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const deleteListBtn = document.getElementById('delete-list-btn');
const listsContainer = document.getElementById('lists-container');
const tasksContainer = document.getElementById('tasks-container');

let noListDummyMsg = document.getElementById('no-lists');

let tempSettings = {
    theme: null,
    checkboxes: {}
};

let listsJSON = {};

// Checkbox Handler:
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



// Open / Close Settings Modal:
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Switch Theme:
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        tempSettings.theme = button.dataset.theme;
    });
});

// Enable / Disable App-Features:
settingsCheckboxes.forEach(checkbox => {
    checkbox.checked = true;
    tempSettings.checkboxes[checkbox.id] = true;  

    checkbox.addEventListener('change', () => {
        tempSettings.checkboxes[checkbox.id] = checkbox.checked;
    });
});

// Apply Changes in Settings Modal:
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

// Open / Close 'Create List' Modal:
openListModal.addEventListener('click', () => {
    listModal.classList.remove('hidden');
});

closeListModal.addEventListener('click', () => {
    listModal.classList.add('hidden');
});

// Create New List:
createListForm.addEventListener('submit', (e) => {
    if (!createListForm.checkValidity()) return;

    e.preventDefault();

    if (noListDummyMsg) {
        noListDummyMsg.remove();
    }

    const listTitle = listTitleInput.value.trim();
    listContainer.innerHTML += `
        <div class="list-element filter-btn">
            <div class="list-color-cirlce" style="background-color: ${colorPicker.value}"></div>
            <p>${listTitle}</p>
        </div>
    `;

    listsJSON[listTitle] = [colorPicker.value];
    localStorage.setItem('VoidList', JSON.stringify(listsJSON));

    colorPicker.value = '#000000';
    listTitleInput.value = '';
    listModal.classList.add('hidden');
});

// Select List:
listContainer.addEventListener('click', (event) => {
    const clickedElement = event.target.closest('.list-element');
    currentListTitle.textContent = clickedElement.querySelector('p')?.textContent;
    handleInputState();
});

// Delete List:
deleteListBtn.addEventListener('click', () => {
    // Clean Up UI:
    const target = [...document.querySelectorAll('.list-element')]
    .find(el => el.textContent.includes(currentListTitle.textContent));
    if (target) target.remove();

    // Delete Data in Local Storage:
    delete listsJSON[currentListTitle.textContent];
    localStorage.setItem('VoidList', JSON.stringify(listsJSON));

    currentListTitle.textContent = "Select a list";
    loadLists();
});

// Add Task to a List:
addTaskBtn.addEventListener('click', (e)  => {
    console.log('Click');

    if (!newTaskInput.checkValidity()) return;
    e.preventDefault();

    console.log(listsJSON[currentListTitle.textContent]); // undifined

    if (currentListTitle.textContent != "Select a list" && newTaskInput.value != '') {
        listsJSON[currentListTitle.textContent].push(newTaskInput.value);
    }

    console.log('Click 2');
    tasksContainer.innerHTML += `
        <div class="task-item group flex items-center justify-between p-8 rounded-lg border border-gray-200 hover:bg-gray-50 priority-low fade-in">
            <div class="flex items-center w-full">
                <button class="complete-task-btn mr-8 w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0"></button>
                <div class="task-content">
                    <div class="task-name truncate">${currentListTitle.textContent}</div>
                </div>
                <div class="task-actions flex space-x-4 ml-8">
                    <button class="edit-task-btn p-4 text-gray-500 hover:text-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" data-id="1750014802993">
                        <img src="./assets/icons/edit.svg" alt="Edit">
                    </button>
                </div>
            </div>
        </div>
    `;
    newTaskInput.value = '';
});

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

// Deactivate Task Input when no List is Selected:
function handleInputState() {
    if (currentListTitle.textContent === "Select a list") {
        addTaskBtn.disabled = true;
        newTaskInput.disabled = true;
        addTaskBtn.style.setProperty('cursor', 'not-allowed');
        newTaskInput.style.setProperty('cursor', 'not-allowed');
        deleteListBtn.style.setProperty('cursor', 'not-allowed');
    } else {
        addTaskBtn.disabled = false;
        newTaskInput.disabled = false;
        addTaskBtn.style.setProperty('cursor', 'pointer');
        deleteListBtn.style.setProperty('cursor', 'pointer');
        newTaskInput.style.setProperty('cursor', 'text');
    }
}

// Load List from Local Storage:
function loadLists() {
    const savedData = localStorage.getItem('VoidList');

    if (savedData) {
        listsJSON = JSON.parse(savedData);
    } else {
        listsJSON = {};
    }

    // Display Lists in HTML:
    Object.keys(listsJSON).forEach(key => {
        const listColor = listsJSON[key][0];
        
        listContainer.innerHTML += `
            <div class="list-element filter-btn">
                <div class="list-color-cirlce" style="background-color:${listColor}"></div>
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
        noListDummyMsg = document.getElementById('no-lists');
    }
}

function loadTasks() {

}