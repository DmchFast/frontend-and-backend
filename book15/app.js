// Элементы DOM 
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

// Функция смены активной кнопки
function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

// Загрузка контента
async function loadContent(page) {
    try {
        const response = await fetch(`content/${page}.html`);
        const html = await response.text();
        contentDiv.innerHTML = html;

        // Если загружена главная страница, инициализируем заметки
        if (page === 'home') {
            initNotes();
        }
    } catch (err) {
        contentDiv.innerHTML = '<p class="is-center text-error">Ошибка загрузки страницы.</p>';
        console.error(err);
    }
}

// Инициализация функционала заметок (вызывается только на главной)
function initNotes() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const list = document.getElementById('notes-list');

    if (!form || !input || !list) return; // защита

    // Функция экранирования
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Загрузка заметок из localStorage при старте
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        // Применяем экранирование
        list.innerHTML = notes.map(note => `<li>${escapeHtml(note)}</li>`).join('');
    }

    // Сохранение заметки
    function addNote(text) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.push(text);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }

    // Обработка отправки формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addNote(text);
            input.value = '';
        }
    });

    // Первоначальная загрузка
    loadNotes();
}

// Обработчики навигации
homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

// Первоначальная загрузка (главная)
loadContent('home');

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log("Service worker зарегистрирован:", registration.scope);
        } catch (err) {
            console.error('Ошибка регистрации ServiceWorker:', err);
        }
    });
}