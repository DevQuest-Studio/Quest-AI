function appendMessageUI(role, content) {
    const div = document.createElement('div');
    div.className = `flex w-full mb-4 ${role==='user'?'justify-end':'justify-start'}`;
    const bubble = document.createElement('div');
    bubble.className = `max-w-[75%] rounded-2xl p-4 ${role==='user'?'bg-indigo-500 text-white':'bg-gray-800 text-gray-100'}`;
    bubble.innerHTML = content;
    div.appendChild(bubble);
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleSend() {
    const value = messageInput.value.trim();
    if (!value) return;
    appendMessageUI('user', value);
    messageInput.value = '';
    appendMessageUI('ai', `Quest Ai (${currentPersona}) responding to: ${value}`);
}

sendBtn.addEventListener('click', handleSend);
messageInput.addEventListener('keypress', e => {
    if(e.key==='Enter' && !e.shiftKey){
        e.preventDefault();
        handleSend();
    }
});
