// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==== Config Firebase & Gemini ====
const firebaseConfig = {
  apiKey: "AIzaSyAED0FvAfWyLQNaapLNqc4CN9BQPBeq8vU",
  authDomain: "kristoauth-1d71b.firebaseapp.com",
  projectId: "kristoauth-1d71b",
  storageBucket: "kristoauth-1d71b.firebasestorage.app",
  messagingSenderId: "1097863662117",
  appId: "1:1097863662117:web:496933d764c87d30f08dcc"
};
const GEMINI_API_KEY = "AIzaSyCVKqhGunw73jAF44Q4DA6ks3C5xZTG5PA";  // remplace par ta key

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==== State ====
let currentUser = null;
let currentChatId = null;
let unsubscribeMessages = null;
let currentLoaderElement = null;

// ==== DOM éléments ====
const chatListEl = document.getElementById('chat-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');

const renameModal = document.getElementById('rename-modal');
const renameInput = document.getElementById('rename-input');
const cancelRenameBtn = document.getElementById('cancel-rename');
const saveRenameBtn = document.getElementById('save-rename');

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

// Chat title display (non modifiable inline, juste affichage)
const chatTitleDisplay = document.getElementById('chat-title-display');

// ==== Helpers UI ====
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendLoaderUI() {
  const div = document.createElement('div');
  div.className = "flex w-full mb-6 justify-start loading-dots-container";
  const bubble = document.createElement('div');
  bubble.className = "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm backdrop-blur-md border border-white/10 bg-white/10";
  bubble.innerHTML = `
     <div class="flex items-center space-x-1 p-1">
       <div class="dot"></div>
       <div class="dot"></div>
       <div class="dot"></div>
     </div>`;
  div.appendChild(bubble);
  messagesContainer.appendChild(div);
  scrollToBottom();
  return div;
}

function appendMessageUI(role, content, type = 'text', userMode = 'text') {
  const div = document.createElement('div');
  div.className = `flex w-full mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`;
  const bubble = document.createElement('div');
  const bubbleClasses = role === 'user'
    ? 'bg-gradient-to-br from-indigo-500/80 to-purple-500/80 text-white rounded-br-none'
    : 'bg-gray-800/80 text-gray-100 rounded-bl-none border border-white/10';
  bubble.className = `max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xl backdrop-blur-md ${bubbleClasses}`;

  if (type === 'image' && content.startsWith('data:image')) {
    bubble.innerHTML = `<img src="${content}" alt="AI Generated" class="rounded-lg w-full h-auto shadow-lg border border-white/20">`;
  } else {
    const rawHtml = marked.parse(content);
    bubble.innerHTML = `<div class="prose prose-invert prose-sm max-w-none msg-text leading-relaxed" data-role="${role}">${rawHtml}</div>`;
    // highlight codeblocks
    const codeBlocks = bubble.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      hljs.highlightElement(block);
      if (block.classList.contains('language-html') || block.classList.contains('language-xml') || block.classList.contains('language-svg')) {
        const btn = document.createElement('button');
        btn.className = "mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-300 text-xs font-bold uppercase rounded transition-colors border border-green-500/30 shadow-md";
        btn.innerHTML = '<i data-lucide="monitor" class="w-3 h-3"></i> Preview Output';
        btn.onclick = () => openPreview(block.textContent);
        block.parentElement.after(btn);
      }
    });
  }

  div.appendChild(bubble);
  messagesContainer.appendChild(div);
  lucide.createIcons();
  scrollToBottom();
}

function openPreview(html) {
  const previewFrame = document.getElementById('preview-frame');
  previewFrame.srcdoc = html;
  toggleModal(document.getElementById('preview-modal'), true);
}

function toggleModal(modal, show) {
  if (show) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
  } else {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
  }
}

// ==== Firestore + Chat Logic ====
function setupChatListener() {
  const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
  const q = query(chatsRef);
  onSnapshot(q, snapshot => {
    chatListEl.innerHTML = '';
    const chats = [];
    snapshot.forEach(docSnap => chats.push({ id: docSnap.id, ...docSnap.data() }));
    // sort by createdAt
    chats.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    if (chats.length === 0) {
      chatListEl.innerHTML = `<div class="text-white/50 text-sm text-center mt-4 italic">No chats yet</div>`;
    }

    chats.forEach(chat => {
      const li = document.createElement('div');
      li.className = `p-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 group flex justify-between items-center ${currentChatId === chat.id ? 'bg-white/20 shadow-lg border border-white/20' : 'hover:bg-white/10 text-white/70'}`;

      const titleSpan = document.createElement('span');
      titleSpan.className = "truncate font-medium text-sm flex-1";
      titleSpan.textContent = chat.title || "New Conversation";

      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-red-300 hover:text-red-100"></i>';
      deleteBtn.className = "opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteChat(chat.id);
      };

      li.onclick = () => loadChat(chat.id);
      li.appendChild(titleSpan);
      li.appendChild(deleteBtn);
      chatListEl.appendChild(li);
    });
    lucide.createIcons();
  });
}

async function createNewChat() {
  const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
  const newChat = await addDoc(chatsRef, { title: "New Conversation", createdAt: serverTimestamp() });
  loadChat(newChat.id);
  if (window.innerWidth < 768) toggleSidebar(false);
}

async function deleteChat(chatId) {
  if (!window.confirm("Delete this chat?")) return;
  await deleteDoc(doc(db, 'users', currentUser.uid, 'chats', chatId));
  if (currentChatId === chatId) {
    currentChatId = null;
    messagesContainer.innerHTML = '';
  }
}

async function loadChat(chatId) {
  currentChatId = chatId;
  // fetch title
  const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
  try {
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      chatTitleDisplay.textContent = snap.data().title || "New Conversation";
    }
  } catch (e) {
    console.error("Failed to fetch chat title:", e);
  }

  if (unsubscribeMessages) unsubscribeMessages();

  const msgsRef = collection(db, 'users', currentUser.uid, 'chats', chatId, 'messages');
  const q = query(msgsRef);
  unsubscribeMessages = onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = '';
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      appendMessageUI(msg.role, msg.text, msg.type, msg.userMode);
    });
    scrollToBottom();
  });
}

// ==== Sending & AI / Gemini Logic ====
async function handleSend() {
  const text = messageInput.value.trim();
  if (!text || !currentChatId) return;
  messageInput.value = '';

  const msgsRef = collection(db, 'users', currentUser.uid, 'chats', currentChatId, 'messages');
  await addDoc(msgsRef, {
    role: 'user',
    text,
    type: 'text',
    userMode: currentMode.id,
    timestamp: serverTimestamp()
  });

  generateResponse(text, currentMode.id, currentChatId);
}

async function generateResponse(userText, modeId, chatIdAtRequest) {
  currentLoaderElement = appendLoaderUI();

  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let responseType = "text";
      let responseText = "";

      if (modeId === 'image') {
        // Image generation
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`;
        const payload = {
          instances: [{ prompt: userText }],
          parameters: { sampleCount: 1 }
        };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.predictions?.[0]?.bytesBase64Encoded) {
          responseText = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
          responseType = 'image';
        } else {
          responseText = "Sorry, couldn't generate the image.";
        }
      } else {
        // Text / code / video
        const systemPrompt = modeId === 'code'
          ? `You are Codey, a precise coding assistant. ALWAYS output code inside markdown code blocks.`
          : `You are Cooper, a friendly creative AI.`;

        // Fetch last few messages for context
        const msgsEls = Array.from(messagesContainer.querySelectorAll('.msg-text'));
        const context = msgsEls.slice(-6).map(el => ({
          role: el.getAttribute('data-role') === 'user' ? 'user' : 'model',
          parts: [{ text: el.innerText }]
        }));
        context.push({ role: 'user', parts: [{ text: userText }] });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
          contents: context,
          systemInstruction: { parts: [{ text: systemPrompt }] }
        };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text
          || "Error: no valid response.";
      }

      // If user switched chat, ignore result
      if (currentChatId !== chatIdAtRequest) {
        console.log("Chat changed — discarded this response.");
        return;
      }

      // Remove loader
      if (currentLoaderElement && messagesContainer.contains(currentLoaderElement)) {
        currentLoaderElement.remove();
        currentLoaderElement = null;
      }

      // Save model message
      await addDoc(collection(db, 'users', currentUser.uid, 'chats', chatIdAtRequest, 'messages'), {
        role: 'model',
        text: responseText,
        type: responseType,
        userMode: modeId,
        timestamp: serverTimestamp()
      });

      return;
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
      } else {
        if (currentLoaderElement && messagesContainer.contains(currentLoaderElement)) {
          currentLoaderElement.remove();
          currentLoaderElement = null;
        }
        appendMessageUI('model', "Connection interrupted. Please try again later.");
      }
    }
  }
}

// ==== Rename Chat via Sidebar ====
let renameTargetId = null;
function openRenameModalSidebar(chatId, currentTitle) {
  renameTargetId = chatId;
  renameInput.value = currentTitle;
  toggleModal(renameModal, true);
}
saveRenameBtn.addEventListener('click', async () => {
  const newTitle = renameInput.value.trim();
  if (newTitle && renameTargetId) {
    const chatRef = doc(db, 'users', currentUser.uid, 'chats', renameTargetId);
    await updateDoc(chatRef, { title: newTitle });
  }
  toggleModal(renameModal, false);
});
cancelRenameBtn.addEventListener('click', () => toggleModal(renameModal, false));

// ==== Sidebar toggle for mobile ====
mobileMenuBtn.addEventListener('click', () => toggleSidebar());

// ==== Auth & Init ====
async function initAuth() {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.error("Auth error:", e);
  }
}
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    setupChatListener();
    document.getElementById('app-container').classList.remove('opacity-0');
  }
});

// ==== Event Listeners ====
sendBtn.addEventListener('click', handleSend);
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
newChatBtn.addEventListener('click', createNewChat);

lucide.createIcons();
