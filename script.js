// ===== Variabel DOM =====
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const suggestionsBox = document.getElementById('suggestions');
const themeToggle = document.getElementById('themeToggle');
const chatContainer = document.querySelector('.chat-container');
const installBtn = document.getElementById('installBtn');

// ===== Data =====
let faq = {};      // FAQ JSON
let kamus = {};    // Kamus Dayak
let chatHistory = [];
let deferredPrompt;

// ===== Load JSON FAQ =====
async function loadJSON(file) {
    try {
        const res = await fetch(file);
        const data = await res.json();
        faq = { ...faq, ...data };
    } catch (err) {
        console.error('Gagal load JSON:', file, err);
    }
}

// ===== Load Kamus Dayak =====
async function loadKamus(file) {
    try {
        const res = await fetch(file);
        const data = await res.json();
        kamus = data.kamus;
    } catch (err) {
        console.error('Gagal load Kamus Dayak', err);
    }
}

// ===== Load semua JSON =====
Promise.all([
    // loadJSON('game.json'),
   // loadJSON('hp.json'),
   // loadJSON('windows.json'),
  //  loadJSON('linux.json'),
    loadKamus('kamus_dayak.json')
]).then(() => console.log('Semua JSON dan Kamus Dayak loaded'));

// ===== Add Chat Message =====
function addMessage(text, sender) {
    const message = document.createElement('div');
    message.classList.add('chat-message', sender);
    message.textContent = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
    chatHistory.push({ sender, text });
}

// ===== Default Answers =====
const defaultAnswers = {
    "ok": "Ok",
    "halo": "Halo",
    "hai": "Hai",
    "bro": "Bro"
};

// ===== AI Response =====
function aiResponse(input) {
    input = input.toLowerCase().trim();

    // 1. Default answers
    for (let key in defaultAnswers) if (input === key) return defaultAnswers[key];

    // 2. FAQ JSON
    for (let key in faq) if (input.includes(key)) return faq[key];

    // 3. Kamus Dayak per kata
    const words = input.split(' ');
    const translated = words.map(word => {
        if (kamus["id-dayak"]?.[word]) return kamus["id-dayak"][word];
        if (kamus["dayak-id"]?.[word]) return kamus["dayak-id"][word];
        return word;
    });

    return translated.join(' ');
}

// ===== Auto-suggest (FAQ) =====
function showSuggestions(value) {
    suggestionsBox.innerHTML = '';
    if (!value) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const matches = Object.keys(faq).filter(key => key.includes(value.toLowerCase()));
    if (matches.length > 0) {
        matches.forEach(match => {
            const div = document.createElement('div');
            div.textContent = match;
            div.addEventListener('click', () => {
                userInput.value = match;
                suggestionsBox.style.display = 'none';
                sendBtn.click();
            });
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
}

// ===== Event Input =====
userInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

// ===== Event Send Button =====
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, 'user');
        addMessage("...", 'ai');
        setTimeout(() => {
            chatBox.lastChild.remove();
            const response = aiResponse(text);
            addMessage(response, 'ai');
        }, 800);
        userInput.value = '';
        suggestionsBox.style.display = 'none';
    }
});

// ===== Enter Key =====
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});

// ===== Dark Mode =====
themeToggle.addEventListener('click', () => {
    chatContainer.classList.toggle('dark-mode');
    themeToggle.textContent = chatContainer.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// ===== PWA Install Button =====
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA install outcome:', outcome);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    installBtn.style.display = 'none';
});

function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function showInstallButton() {
    installBtn.style.display = isAppInstalled() ? 'none' : 'block';
}

window.addEventListener('load', () => {
    showInstallButton();
});