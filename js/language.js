// language.js - simple i18n support with localStorage persistence and fallback

const TRANSLATIONS = {
  english: {
    accessibility: 'Accessibility',
    addTask: 'Add Task',
    addTaskPlaceholder: 'Add a task...',
    allTasks: 'All Tasks',
    appearance: 'Appearance',
    apply: 'Apply',
    appSettings: 'App Settings',
    calendar: 'Calendar',
    check: 'Check',
    clearDone: 'Clear completed',
    completed: 'Completed',
    confirmClearCompleted: 'Delete all completed tasks from this list?',
    confirmDeleteList: 'Are you sure you want to delete the list "{listName}"? This action cannot be undone.',
    confirmDeleteTask: 'Are you sure you want to delete this task?',
    copy: 'copy',
    create: 'Create',
    createNewList: 'Create New List',
    dark: 'Dark',
    date: 'Date',
    deleteList: 'Delete List',
    descriptionLabel: 'Description',
    download: 'download',
    downloadLists: 'Download as file',
    dueDate: 'Due Date',
    edit: 'Edit',
    editList: 'Edit List',
    enableAnimations: 'Enable animations',
    english: 'English',
    exportLists: 'Export Lists',
    features: 'Features',
    filters: 'Filters',
    filtersSection: 'Filters',
    formats: 'Formats',
    high: 'High',
    important: 'Important',
    importLists: 'Import Lists',
    jsonDesc: 'Ready for in-app import and lossless',
    language: 'Language',
    light: 'Light',
    list: 'List',
    listColor: 'List color',
    listName: 'List name',
    listNameEmpty: 'List name cannot be empty.',
    listNameExists: 'A list with this name already exists.',
    listNotFound: 'Could not find the list to edit.',
    lists: 'Lists',
    low: 'Low',
    medium: 'Medium',
    menu: 'Menu',
    methods: 'Methods',
    name: 'Name',
    newestFirst: 'Newest first',
    noCompletedTasks: 'No completed tasks yet.',
    noHighPriority: 'No high priority tasks yet.',
    noListDummy: 'Select a list to view tasks.',
    noListsYet: 'No lists yet. Create your first list!',
    noTasksToday: 'No tasks for today yet.',
    noTasksYet: 'No tasks yet. Add your first one above!',
    plainText: 'Plain Text',
    plainTextDesc: 'Human readable, clean and minimal',
    priority: 'Priority',
    progress: 'Progress',
    qrCode: 'QR Code',
    renderQR: 'Render QR-Code',
    reset: 'Reset',
    rightsReserved: 'All rights reserved',
    save: 'Save',
    saveListInClipboard: 'Save in clipboard',
    selectList: 'Select a list',
    selectListToEdit: 'Select a list to edit.',
    selectListToView: 'Select a list to view tasks.',
    send: 'Send to a friend',
    sendListsToFriend: 'Send to a friend',
    sendTo: 'Send to a friend',
    settings: 'Settings',
    shareLists: 'Share Lists',
    showProgress: 'Show progress bar',
    star: 'Star',
    subtitle: 'Your Tasks. Your Rules.',
    system: 'System',
    taskDetails: 'Task Details',
    tasks: 'Tasks',
    titleLabel: 'Title',
    today: 'Today',
    trashcan: 'Trash Can',
  },
  german: {
    accessibility: 'Barrierefreiheit',
    addTask: 'Aufgabe hinzufügen',
    addTaskPlaceholder: 'Aufgabe hinzufügen...',
    allTasks: 'Alle Aufgaben',
    appearance: 'Aussehen',
    apply: 'Anwenden',
    appSettings: 'App-Einstellungen',
    calendar: 'Kalender',
    check: 'Häkchen',
    clearDone: 'Erledigte löschen',
    completed: 'Erledigt',
    confirmClearCompleted: 'Alle abgeschlossenen Aufgaben aus dieser Liste löschen?',
    confirmDeleteList: 'Sind Sie sicher, dass Sie die Liste "{listName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    confirmDeleteTask: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
    copy: 'kopieren',
    create: 'Erstellen',
    createNewList: 'Neue Liste erstellen',
    dark: 'Dunkel',
    date: 'Datum',
    deleteList: 'Liste löschen',
    descriptionLabel: 'Beschreibung',
    download: 'downloaden',
    downloadLists: 'Datei speichern',
    dueDate: 'Fälligkeitsdatum',
    edit: 'Bearbeiten',
    editList: 'Liste bearbeiten',
    enableAnimations: 'Animationen aktivieren',
    english: 'Englisch',
    exportLists: 'Listen exportieren',
    features: 'Funktionen',
    filters: 'Filter',
    filtersSection: 'Filter',
    formats: 'Formate',
    high: 'Hoch',
    important: 'Wichtig',
    importLists: 'Listen importieren',
    jsonDesc: 'Bereit für In-App-Import und verlustfrei',
    language: 'Sprache',
    light: 'Hell',
    list: 'Liste',
    listColor: 'Listenfarbe',
    listName: 'Listenname',
    listNameEmpty: 'Listenname darf nicht leer sein.',
    listNameExists: 'Eine Liste mit diesem Namen existiert bereits.',
    listNotFound: 'Die Liste konnte nicht gefunden werden.',
    lists: 'Listen',
    low: 'Niedrig',
    medium: 'Mittel',
    menu: 'Menü',
    methods: 'Methoden',
    name: 'Name',
    newestFirst: 'Neueste zuerst',
    noCompletedTasks: 'Noch keine erledigten Aufgaben.',
    noHighPriority: 'Noch keine Aufgaben mit hoher Priorität.',
    noListDummy: 'Wählen Sie eine Liste aus, um Aufgaben anzuzeigen.',
    noListsYet: 'Noch keine Listen. Erstellen Sie Ihre erste!',
    noTasksToday: 'Für heute noch keine Aufgaben.',
    noTasksYet: 'Noch keine Aufgaben. Fügen Sie Ihre erste oben hinzu!',
    plainText: 'Klartext',
    plainTextDesc: 'Für Menschen lesbar, sauber und minimalistisch',
    priority: 'Priorität',
    progress: 'Fortschritt',
    qrCode: 'QR-Code',
    renderQR: 'QR-Code',
    reset: 'Zurücksetzen',
    rightsReserved: 'Alle Rechte vorbehalten',
    save: 'Speichern',
    saveListInClipboard: 'Kopieren',
    selectList: 'Liste auswählen',
    selectListToEdit: 'Wählen Sie eine Liste zum Bearbeiten aus.',
    selectListToView: 'Wählen Sie eine Liste aus, um Aufgaben anzuzeigen.',
    send: 'An einen Freund senden',
    sendListsToFriend: 'Teilen',
    sendTo: 'An einen Freund senden',
    settings: 'Einstellungen',
    shareLists: 'Listen teilen',
    showProgress: 'Fortschrittsanzeige anzeigen',
    star: 'Stern',
    subtitle: 'Deine Aufgaben. Deine Regeln.',
    system: 'System',
    taskDetails: 'Aufgabendetails',
    tasks: 'Aufgaben',
    titleLabel: 'Titel',
    today: 'Heute',
    trashcan: 'Mülleimer',
  },
  russian: {
    accessibility: 'Доступность',
    addTask: 'Добавить задачу',
    addTaskPlaceholder: 'Добавить задачу...',
    allTasks: 'Все задачи',
    appearance: 'Внешний вид',
    apply: 'Применить',
    appSettings: 'Настройки приложения',
    calendar: 'Календарь',
    check: 'Отметка',
    clearDone: 'Очистить выполненные',
    completed: 'Выполненные',
    confirmClearCompleted: 'Удалить все выполненные задачи из этого списка?',
    confirmDeleteList: 'Вы уверены, что хотите удалить список "{listName}"? Это действие невозможно отменить.',
    confirmDeleteTask: 'Вы уверены, что хотите удалить эту задачу?',
    copy: 'скопировать',
    create: 'Создать',
    createNewList: 'Создать новый список',
    dark: 'Тёмная',
    date: 'Дата',
    deleteList: 'Удалить список',
    descriptionLabel: 'Описание',
    download: 'скачать',
    downloadLists: 'Скачать как файл',
    dueDate: 'Срок выполнения',
    edit: 'Редактировать',
    editList: 'Изменить список',
    enableAnimations: 'Включить анимации',
    english: 'Английский',
    exportLists: 'Экспорт списков',
    features: 'Функции',
    filters: 'Фильтры',
    filtersSection: 'Фильтры',
    formats: 'Форматы',
    high: 'Высокий',
    important: 'Важные',
    importLists: 'Импорт списков',
    jsonDesc: 'Готово для импорта в приложение без потерь',
    language: 'Язык',
    light: 'Светлая',
    list: 'Список',
    listColor: 'Цвет списка',
    listName: 'Название списка',
    listNameEmpty: 'Название списка не может быть пусто.',
    listNameExists: 'Список с этим названием уже существует.',
    listNotFound: 'Не удалось найти список для редактирования.',
    lists: 'Списки',
    low: 'Низкий',
    medium: 'Средний',
    menu: 'Меню',
    methods: 'Методы',
    name: 'Название',
    newestFirst: 'Сначала новые',
    noCompletedTasks: 'Нет выполненных задач.',
    noHighPriority: 'Нет задач с высоким приоритетом.',
    noListDummy: 'Выберите список, чтобы просмотреть задачи.',
    noListsYet: 'Еще нет списков. Создайте первый!',
    noTasksToday: 'Нет задач на сегодня.',
    noTasksYet: 'Еще нет задач. Добавьте первую выше!',
    plainText: 'Простой текст',
    plainTextDesc: 'Читаемый человеком, чистый, минималистичный',
    priority: 'Приоритет',
    progress: 'Прогресс',
    qrCode: 'QR-код',
    renderQR: 'Создать QR-код',
    reset: 'Сброс',
    rightsReserved: 'Все права защищены',
    save: 'Сохранить',
    saveListInClipboard: 'Сохранить в буфер',
    selectList: 'Выберите список',
    selectListToEdit: 'Выберите список для редактирования.',
    selectListToView: 'Выберите список, чтобы просмотреть задачи.',
    send: 'Отправить другу',
    sendListsToFriend: 'Отправить другу',
    sendTo: 'Отправить другу',
    settings: 'Настройки',
    shareLists: 'Поделиться списками',
    showProgress: 'Показывать индикатор прогресса',
    star: 'Звезда',
    subtitle: 'Ваши задачи. Ваши правила.',
    system: 'Система',
    taskDetails: 'Детали задачи',
    tasks: 'Задачи',
    titleLabel: 'Название',
    today: 'Сегодня',
    trashcan: 'Корзина',
  }
};

function getSavedLanguage() {
  return localStorage.getItem('VoidListLang') || 'english';
}

function saveLanguage(lang) {
  localStorage.setItem('VoidListLang', lang);
}

function setElementText(el, text) {
  // If element has an input-like placeholder, caller should use data-i18n-attr
  // If element contains images/icons, replace only text nodes to preserve images
  const childTextNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim().length > 0);
  if (childTextNode) {
    childTextNode.nodeValue = ' ' + text;
    return;
  }
  el.textContent = text;
}

function translatePage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['english'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!key) return;

    const value = dict[key] || TRANSLATIONS['english'][key] || '';

    const attrData = el.dataset.i18nAttr;
    if (attrData) {
      // split and set multiple attributes 
      attrData
        .split(',')
        .map(a => a.trim())
        .filter(Boolean)
        .forEach(attr => el.setAttribute(attr, value));
      return;
    }

    // Special handling: input placeholder
    if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
      el.placeholder = value;
      return;
    }

    setElementText(el, value);
  });
}


function markSelectedButton(lang) {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('selected-option', btn.dataset.lang === lang);
  });
}

function attachLanguageButtons(tempSettings) {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      tempSettings.language = lang;
      markSelectedButton(lang);
    });
  });
}

function init(tempSettings) {
  const lang = getSavedLanguage();
  translatePage(lang);
  markSelectedButton(lang);
  if (tempSettings) {
    attachLanguageButtons(tempSettings);
  }
}

export { init as initLanguage, getSavedLanguage, saveLanguage, translatePage, TRANSLATIONS };
