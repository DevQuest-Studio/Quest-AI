// --- app-part2.js ---

// Modals
function toggleModal(modal, show) {
    const visible = show !== undefined ? show : modal.classList.contains('hidden');
    if (visible) {
        modal.classList.remove('hidden', 'opacity-0');
        modal.classList.add('opacity-100');
    } else {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function openPreview(code) {
    previewFrame.srcdoc = code;
    toggleModal(previewModal, true);
}

function openRenameModal(defaultValue) {
    renameInput.value = defaultValue || '';
    toggleModal(renameModal, true);
    renameInput.focus();
}

// Chat Actions
function handleRenameSave() {
    const newName = renameInput.value.trim();
    if (newName) {
        chatTitleDisplay.textContent = newName;
        toggleModal(renameModal, false);
    }
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showWelcome() {
    welcomeScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
}

function showChatScreen() {
    welcomeScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    scrollToBottom();
}

// Event Listeners
sendBtn.addEventListener('click', handleSend);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

editTitleBtn.addEventListener('click', () => toggleTitleEdit(true));
saveTitleBtn.addEventListener('click', saveTitle);
chatTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveTitle();
    }
});

cancelRenameBtn.addEventListener('click', () => toggleModal(renameModal, false));
saveRenameBtn.addEventListener('click', handleRenameSave);
renameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleRenameSave();
    }
});

newChatBtn.addEventListener('click', createNewChat);
settingsBtn.addEventListener('click', () => { 
    updateSettingsUI(); 
    toggleModal(settingsModal, true); 
});
closeModalBtn.addEventListener('click', () => toggleModal(settingsModal, false));
cancelSettingsBtn.addEventListener('click', () => toggleModal(settingsModal, false)); 
saveSettingsBtn.addEventListener('click', saveUserPreferences);
mobileMenuBtn.addEventListener('click', () => toggleSidebar());
closePreviewBtn.addEventListener('click', () => toggleModal(previewModal, false));

initAuth();
lucide.createIcons();
