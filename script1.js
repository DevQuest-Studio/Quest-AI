// --- app-part1.js ---

// Message UI
function appendMessageUI(role, content, type, userMode) {
    const div = document.createElement('div');
    div.className = `flex w-full mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    const bubbleClasses = role === 'user' 
        ? 'bg-gradient-to-br from-indigo-500/80 to-purple-500/80 text-white rounded-br-none' 
        : 'bg-gray-800/80 text-gray-100 rounded-bl-none border border-white/10';

    bubble.className = `max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xl backdrop-blur-md ${bubbleClasses}`;

    if (type === 'image') {
        const modeDetails = MODES.find(m => m.id === userMode) || MODES[1];
        const modeColor = modeDetails.color;
        if (content.startsWith('data:image')) {
            bubble.innerHTML = `
                <div class="mb-3 text-xs opacity-80 font-semibold uppercase tracking-wider text-${modeColor}-300 flex items-center gap-2">
                   <i data-lucide="${modeDetails.icon}" class="w-3 h-3"></i> ${modeDetails.label} Output
                </div>
                <img src="${content}" alt="AI Generated Image" class="rounded-lg w-full h-auto shadow-lg border border-white/20">
                <a href="${content}" download="generated-image.png" class="mt-2 inline-flex items-center gap-1 text-xs text-blue-300 hover:text-white"><i data-lucide="download" class="w-3 h-3"></i> Download</a>
            `;
        } else {
             bubble.innerHTML = `<p class="text-red-300">${content}</p>`;
        }
    } else {
        const rawHtml = marked.parse(content);
        let htmlContent = `<div class="prose prose-invert prose-sm max-w-none msg-text leading-relaxed" data-role="${role}">${rawHtml}</div>`;
        if (role === 'user') {
            const modeDetails = MODES.find(m => m.id === userMode) || MODES[0];
            const modeColor = modeDetails.color;
            htmlContent = `
                <div class="mb-1 text-xs opacity-70 font-semibold uppercase tracking-wider text-${modeColor}-200 flex items-center gap-2">
                    <i data-lucide="${modeDetails.icon}" class="w-3 h-3"></i> ${modeDetails.label} Prompt
                </div>
                ${htmlContent}
            `;
        }
        bubble.innerHTML = htmlContent;

        const codeBlocks = bubble.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block);
            if (block.classList.contains('language-html') || block.classList.contains('language-xml') || block.classList.contains('language-svg')) {
                const parentPre = block.parentElement;
                const btn = document.createElement('button');
                btn.className = "mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-300 text-xs font-bold uppercase rounded transition-colors border border-green-500/30 shadow-md";
                btn.innerHTML = '<i data-lucide="monitor" class="w-3 h-3"></i> Preview Output';
                btn.onclick = () => openPreview(block.textContent);
                parentPre.after(btn);
            }
        });
    }

    div.appendChild(bubble);
    messagesContainer.appendChild(div);
    lucide.createIcons();
}

function appendSystemMessage(text) {
    const div = document.createElement('div');
    div.className = "flex justify-center mb-4";
    div.innerHTML = `<span class="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/5 flex items-center gap-2"><i data-lucide="info" class="w-3 h-3"></i> ${text}</span>`;
    messagesContainer.appendChild(div);
    lucide.createIcons();
}

// Persona Switching
function switchPersona(persona) {
    currentPersona = persona;
    if (persona === 'cooper') {
        personaLabel.textContent = "Cooper (AI)";
        personaIcon.innerHTML = '<i data-lucide="sparkles" class="text-white w-6 h-6"></i>';
        blob1.style.background = '#4f46e5'; 
        blob2.style.background = '#db2777'; 
        personaToggle.classList.remove('bg-green-500/20', 'border-green-500/50');
        personaToggle.classList.add('bg-blue-500/20', 'border-blue-500/50');
    } else {
        personaLabel.textContent = "Codey (Dev)";
        personaIcon.innerHTML = '<i data-lucide="terminal" class="text-white w-6 h-6"></i>';
        blob1.style.background = '#059669'; 
        blob2.style.background = '#0891b2'; 
        personaToggle.classList.remove('bg-blue-500/20', 'border-blue-500/50');
        personaToggle.classList.add('bg-green-500/20', 'border-green-500/50');
    }
    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    const personaToggle = document.getElementById('persona-toggle');
    personaToggle.addEventListener('click', () => { 
        const nextPersona = currentPersona === 'cooper' ? 'codey' : 'cooper';
        const nextMode = MODES.find(m => m.persona === nextPersona) || MODES[0];
        selectMode(nextMode.id);
    });
});

// Mode Switching Logic
function toggleDropdown(show) {
    isDropdownOpen = show !== undefined ? show : !isDropdownOpen;
    modeDropdownMenu.classList.toggle('hidden', !isDropdownOpen);
    if (isDropdownOpen) {
        modeDropdownMenu.classList.remove('opacity-0', 'scale-95');
        modeDropdownMenu.classList.add('opacity-100', 'scale-100');
    } else {
        modeDropdownMenu.classList.remove('opacity-100', 'scale-100');
        modeDropdownMenu.classList.add('opacity-0', 'scale-95');
    }
}

function selectMode(modeId) {
    currentMode = MODES.find(m => m.id === modeId) || MODES[0];
    updateModeUI();
    toggleDropdown(false);
}

function updateModeUI() {
    modeIcon.innerHTML = `<i data-lucide="${currentMode.icon}" class="w-5 h-5 text-current"></i>`;
    const colorClass = `text-${currentMode.color}-400`;
    modeDropdownTrigger.className = modeDropdownTrigger.className.replace(/text-[\w-]+\s?/, 'p-3 rounded-xl transition-colors flex items-center gap-2 hover:bg-white/5 ');
    modeDropdownTrigger.classList.add(colorClass);

    if (currentMode.id === 'image') {
        messageInput.placeholder = "Describe the image you want to generate...";
    } else if (currentMode.id === 'code') {
        messageInput.placeholder = "Write a prompt for Codey to generate code...";
    } else if (currentMode.id === 'video') {
        messageInput.placeholder = "Describe the video idea or script you need...";
    } else {
        messageInput.placeholder = "Type a message or prompt...";
    }
    switchPersona(currentMode.persona); 
    lucide.createIcons();
}

function populateModeDropdown() {
    modeDropdownMenu.innerHTML = MODES.map(mode => `
        <button 
            class="mode-select-btn w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-white/10 transition-colors"
            data-mode-id="${mode.id}"
        >
            <i data-lucide="${mode.icon}" class="w-5 h-5 text-${mode.color}-400"></i>
            <span class="text-white/80">${mode.label}</span>
        </button>
    `).join('');

    modeDropdownMenu.querySelectorAll('.mode-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modeId = e.currentTarget.getAttribute('data-mode-id');
            selectMode(modeId);
        });
    });
    lucide.createIcons();
}

// Language Dropdown
function populateLanguageDropdown() {
    customLanguageMenu.innerHTML = languages.map(lang => `
        <button 
            class="lang-select-btn w-full text-left block px-3 py-2 text-white/80 hover:bg-white/10 transition-colors rounded-lg text-sm"
            data-lang="${lang}"
        >
            ${lang}
        </button>
    `).join('');

    customLanguageMenu.querySelectorAll('.lang-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectLanguage(e.currentTarget.getAttribute('data-lang'));
        });
    });
    lucide.createIcons();
}

function toggleLanguageDropdown(show) {
    isLanguageDropdownOpen = show !== undefined ? show : !isLanguageDropdownOpen;
    customLanguageMenu.classList.toggle('hidden', !isLanguageDropdownOpen);
    const icon = customLanguageDisplay.querySelector('i[data-lucide="chevron-down"]');
    if (icon) icon.classList.toggle('rotate-180', isLanguageDropdownOpen);
}

function selectLanguage(lang) {
    selectedLanguageText.textContent = lang;
    toggleLanguageDropdown(false);
}
