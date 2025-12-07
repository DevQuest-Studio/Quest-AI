// Globals
const personaToggle = document.getElementById('persona-toggle');
const personaLabel = document.getElementById('persona-label');
const personaIcon = document.getElementById('persona-icon');
const blob1 = document.querySelector('.blob-1');
const blob2 = document.querySelector('.blob-2');

const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const modeDropdownTrigger = document.getElementById('mode-dropdown-trigger');
const modeDropdownMenu = document.getElementById('mode-dropdown-menu');
const modeIcon = document.getElementById('mode-icon');
const messagesContainer = document.getElementById('messages-container');

let currentPersona = 'cooper';
let currentMode = null;
let isDropdownOpen = false;

// Define Modes & Personalities
const MODES = [
    { id: 'chat', label: 'Chat', icon: 'message-square', color: 'indigo', persona: 'cooper' },
    { id: 'code', label: 'Code', icon: 'code-2', color: 'green', persona: 'codey' },
    { id: 'image', label: 'Image', icon: 'image', color: 'pink', persona: 'cooper' },
    { id: 'video', label: 'Video', icon: 'video', color: 'orange', persona: 'cooper' },
    { id: 'research', label: 'Research', icon: 'book-open', color: 'blue', persona: 'sophia' },
    { id: 'creative', label: 'Creative', icon: 'feather', color: 'violet', persona: 'nova' },
];

// Mode switching
function selectMode(modeId) {
    currentMode = MODES.find(m => m.id === modeId) || MODES[0];
    modeIcon.innerHTML = `<i data-lucide="${currentMode.icon}" class="w-5 h-5 text-${currentMode.color}-400"></i>`;
    lucide.createIcons();
    switchPersona(currentMode.persona);
    toggleDropdown(false);
}

function toggleDropdown(show) {
    isDropdownOpen = show !== undefined ? show : !isDropdownOpen;
    modeDropdownMenu.classList.toggle('hidden', !isDropdownOpen);
    if (isDropdownOpen) modeDropdownMenu.classList.remove('opacity-0', 'scale-95');
    else modeDropdownMenu.classList.add('opacity-0', 'scale-95');
}

function populateModeDropdown() {
    modeDropdownMenu.innerHTML = MODES.map(mode => `
        <button class="w-full flex items-center gap-3 p-2 rounded-lg text-sm hover:bg-white/10"
            data-mode-id="${mode.id}">
            <i data-lucide="${mode.icon}" class="w-5 h-5 text-${mode.color}-400"></i>
            <span>${mode.label}</span>
        </button>
    `).join('');

    modeDropdownMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => selectMode(e.currentTarget.dataset.modeId));
    });

    lucide.createIcons();
}

// Persona switching
function switchPersona(persona) {
    currentPersona = persona;
    if (persona === 'cooper') {
        personaLabel.textContent = 'Cooper';
        personaIcon.innerHTML = '<i data-lucide="sparkles" class="w-6 h-6"></i>';
        blob1.style.background = '#4f46e5'; blob2.style.background = '#db2777';
    } else if (persona === 'codey') {
        personaLabel.textContent = 'Codey';
        personaIcon.innerHTML = '<i data-lucide="terminal" class="w-6 h-6"></i>';
        blob1.style.background = '#059669'; blob2.style.background = '#0891b2';
    } else if (persona === 'sophia') {
        personaLabel.textContent = 'Sophia';
        personaIcon.innerHTML = '<i data-lucide="book-open" class="w-6 h-6"></i>';
        blob1.style.background = '#2563eb'; blob2.style.background = '#9333ea';
    } else if (persona === 'nova') {
        personaLabel.textContent = 'Nova';
        personaIcon.innerHTML = '<i data-lucide="feather" class="w-6 h-6"></i>';
        blob1.style.background = '#db2777'; blob2.style.background = '#f97316';
    }
    lucide.createIcons();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateModeDropdown();
    selectMode('chat');

    personaToggle.addEventListener('click', () => {
        const next = currentPersona === 'cooper' ? 'codey' : 'cooper';
        const mode = MODES.find(m => m.persona === next) || MODES[0];
        selectMode(mode.id);
    });
});
