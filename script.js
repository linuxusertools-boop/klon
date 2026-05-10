const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const statusTxt = document.getElementById("status-text");

function getTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

async function getPrompt() {
    try {
        const res = await fetch('prompt.txt');
        return res.ok ? await res.text() : "Kevin. Format: pesan|pesan2|stc|mood";
    } catch { return "Kevin. Format: pesan|pesan2|stc|mood"; }
}

function renderMsg(content, type, isSticker = false, status = 'sent') {
    if (!content || content === "-" || content === "null") return null;
    
    const div = document.createElement("div");
    const msgId = "msg-" + Math.random().toString(36).substr(2, 9);
    div.id = msgId;
    div.className = `message ${type}-msg ${isSticker ? 'stc-msg' : ''}`;
    
    const tickSent = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
    const tickRead = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM6.41 11.17L5 9.75 1 13.75 2.41 15.17l4-4z"/></svg>`;

    const statusHtml = type === 'user' ? `<span class="status-icon ${status === 'read' ? 'tick-read' : 'tick-sent'}">${status === 'read' ? tickRead : tickSent}</span>` : '';

    if (isSticker) {
        const wrapper = document.createElement("div");
        wrapper.className = "stc-wrapper";
        
        const img = document.createElement("img");
        img.src = content;
        // KUNCI PERBAIKAN UKURAN DI SINI:
        img.style.width = "130px"; 
        img.style.borderRadius = "12px";
        img.style.filter = "drop-shadow(0 2px 5px rgba(0,0,0,0.4))";
        
        img.onerror = () => div.remove();
        wrapper.appendChild(img);
        div.appendChild(wrapper);
        div.innerHTML += `<span class="time" style="background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 10px; margin-top: -22px; position: relative; float: none; display: inline-flex;">${getTime()} ${statusHtml}</span>`;
    } else {
        div.innerHTML = `${content} <span class="time">${getTime()} ${statusHtml}</span>`;
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgId;
}

async function processChat() {
    const val = userInput.value.trim();
    if (!val) return;

    const currentMsgId = renderMsg(val, "user", false, 'sent');
    userInput.value = "";
    sendBtn.disabled = true;

    if(statusTxt) {
        statusTxt.innerText = "mengetik";
        statusTxt.classList.add("typing-dots");
    }

    try {
        const sys = await getPrompt();
        const fullPrompt = `${sys}\n\nUser: ${val}`;
        const response = await fetch(`https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(fullPrompt)}`);
        const json = await response.json();
        let raw = json.result || json.response || "-|-|-|-";

        const parts = raw.split("|").map(s => s.trim());
        
        // Ubah centang user jadi biru
        const userMsgEl = document.getElementById(currentMsgId);
        if (userMsgEl) {
            const iconCont = userMsgEl.querySelector('.status-icon');
            if (iconCont) {
                iconCont.className = "status-icon tick-read";
                iconCont.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM6.41 11.17L5 9.75 1 13.75 2.41 15.17l4-4z"/></svg>`;
            }
        }

        if (parts[0] && parts[0] !== "-") renderMsg(parts[0], "ai");
        if (parts[1] && parts[1] !== "-") setTimeout(() => renderMsg(parts[1], "ai"), 800);
        
        let stc = parts[2];
        if (stc && stc !== "-") {
            const match = stc.match(/https?:\/\/[^\s"'<>()\[\]]+?\.webp/);
            if (match) setTimeout(() => renderMsg(match[0], "ai", true), 1500);
        }

    } catch (err) {
        renderMsg("Gagal koneksi.", "ai");
    } finally {
        if(statusTxt) {
            statusTxt.innerText = "bot";
            statusTxt.classList.remove("typing-dots");
        }
        sendBtn.disabled = false;
    }
}

sendBtn.addEventListener("click", processChat);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") processChat(); });

window.onload = () => { setTimeout(() => renderMsg("hlo, knp?", "ai"), 500); };
        
        const img = document.createElement("img");
        img.className = "telegram-sticker";
        img.src = content;
        
        // Ukuran kecil & soft (lebar 130px)
        img.style.width = "130px";
        img.style.borderRadius = "12px";
        img.onerror = () => div.remove();
        
        wrapper.appendChild(img);
        div.appendChild(wrapper);
        // Waktu melayang untuk stiker
        div.innerHTML += `<span class="time" style="background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 10px; margin-top: -22px; position: relative; float: none; display: inline-flex;">${getTime()} ${statusHtml}</span>`;
    } else {
        div.innerHTML = `${content} <span class="time">${getTime()} ${statusHtml}</span>`;
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgId;
}

async function processChat() {
    const val = userInput.value.trim();
    if (!val) return;

    // Tampilkan pesan user (centang satu putih)
    const currentMsgId = renderMsg(val, "user", false, 'sent');
    userInput.value = "";
    sendBtn.disabled = true;

    // Aktifkan status mengetik
    statusTxt.innerText = "mengetik";
    statusTxt.classList.add("typing-dots");

    try {
        const sys = await getPrompt();
        const fullPrompt = `${sys}\n\nUser: ${val}`;
        
        const response = await fetch(`https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(fullPrompt)}`);
        const json = await response.json();
        let raw = json.result || json.response || "-|-|-|-";

        const parts = raw.split("|").map(s => s.trim());
        
        // UPDATE CENTANG: Ubah jadi dua biru (read) saat bot mulai balas
        const userMsgEl = document.getElementById(currentMsgId);
        if (userMsgEl) {
            const iconCont = userMsgEl.querySelector('.status-icon');
            if (iconCont) {
                iconCont.className = "status-icon tick-read";
                iconCont.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM6.41 11.17L5 9.75 1 13.75 2.41 15.17l4-4z"/></svg>`;
            }
        }

        // Render balasan bot secara bertahap
        if (parts[0] && parts[0] !== "-") renderMsg(parts[0], "ai");
        if (parts[1] && parts[1] !== "-") setTimeout(() => renderMsg(parts[1], "ai"), 800);
        
        // Logika link stiker webp
        let stc = parts[2];
        if (stc && stc !== "-") {
            const match = stc.match(/https?:\/\/[^\s"'<>()\[\]]+?\.webp/);
            if (match) setTimeout(() => renderMsg(match[0], "ai", true), 1500);
        }

    } catch (err) {
        renderMsg("Gagal terhubung ke server.", "ai");
    } finally {
        // Matikan status mengetik
        statusTxt.innerText = "bot";
        statusTxt.classList.remove("typing-dots");
        sendBtn.disabled = false;
    }
}

// Event Listeners
sendBtn.addEventListener("click", processChat);
userInput.addEventListener("keypress", (e) => { 
    if (e.key === "Enter") processChat(); 
});

// Pesan sambutan awal
window.onload = () => { 
    setTimeout(() => renderMsg("hlo, knp?", "ai"), 500); 
};
        div.appendChild(wrapper);
        
        // Waktu di bawah stiker
        const timeSpan = document.createElement("span");
        timeSpan.className = "time";
        timeSpan.innerText = getTime();
        div.appendChild(timeSpan);
    } else {
        // Pesan teks dengan waktu di dalamnya (Style Telegram)
        div.innerHTML = `${content} <span class="time">${getTime()}</span>`;
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto scroll ke bawah
}

// Fungsi utama memproses chat
async function processChat() {
    const val = userInput.value.trim();
    if (!val) return;

    // Tampilkan pesan user
    renderMsg(val, "user");
    userInput.value = "";
    sendBtn.disabled = true;

    // --- AKTIFKAN STATUS MENGETIK ---
    statusTxt.innerText = "mengetik";
    statusTxt.classList.add("typing-dots");

    try {
        const sys = await getPrompt();
        const fullPrompt = `${sys}\n\nUser: ${val}`;
        
        // Panggil API Gemini
        const response = await fetch(`https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(fullPrompt)}`);
        const json = await response.json();
        let raw = json.result || json.response || "-|-|-|-";

        // Parsing format mutlak: pesan|pesan2|stc|mood
        const parts = raw.split("|").map(s => s.trim());
        const p1 = parts[0];
        const p2 = parts[1];
        let stc = parts[2];
        const mood = parts[3];

        // Logika pembersihan link stiker
        if (stc && stc !== "-") {
            const match = stc.match(/https?:\/\/[^\s"'<>()\[\]]+?\.webp/);
            stc = match ? match[0] : "-";
        }

        // Tampilkan pesan AI secara bertahap (Delay agar terasa nyata)
        if (p1 && p1 !== "-") renderMsg(p1, "ai");
        
        if (p2 && p2 !== "-") {
            setTimeout(() => renderMsg(p2, "ai"), 800);
        }
        
        if (stc && stc !== "-" && stc.startsWith("http")) {
            setTimeout(() => renderMsg(stc, "ai", true), 1500);
        }
        
        console.log("Mood AI saat ini:", mood);

    } catch (err) {
        renderMsg("males, error koneksi.", "ai");
        console.error(err);
    } finally {
        // --- MATIKAN STATUS MENGETIK ---
        statusTxt.innerText = "bot";
        statusTxt.classList.remove("typing-dots");
        sendBtn.disabled = false;
    }
}

// Event Listeners
sendBtn.addEventListener("click", processChat);
userInput.addEventListener("keypress", (e) => { 
    if (e.key === "Enter") processChat(); 
});

// Pesan pembuka saat halaman dimuat
window.onload = () => { 
    setTimeout(() => renderMsg("hlo, knp?", "ai"), 500); 
};
