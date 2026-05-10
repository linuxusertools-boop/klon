// 1. Ambil semua elemen yang dibutuhkan
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const statusTxt = document.getElementById("status-text"); // Pastikan ini ada

function getTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

async function getPrompt() {
    try {
        const res = await fetch('prompt.txt');
        return res.ok ? await res.text() : "Kevin. Format: pesan|pesan2|stc|mood";
    } catch { return "Kevin. Format: pesan|pesan2|stc|mood"; }
}

// 2. Fungsi Render Pesan (Sudah diperbaiki ukurannya agar tidak kebesaran)
function renderMsg(content, type, isSticker = false, status = 'sent') {
    if (!content || content === "-" || content === "null") return null;
    
    const div = document.createElement("div");
    // ID unik agar centang bisa diubah nantinya
    const msgId = "msg-" + Math.random().toString(36).substr(2, 9);
    div.id = msgId;
    div.className = `message ${type}-msg ${isSticker ? 'stc-msg' : ''}`;
    
    // Ikon Centang (SVG)
    const tickSent = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
    const tickRead = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM6.41 11.17L5 9.75 1 13.75 2.41 15.17l4-4z"/></svg>`;

    const statusHtml = type === 'user' ? `<span class="status-icon ${status === 'read' ? 'tick-read' : 'tick-sent'}">${status === 'read' ? tickRead : tickSent}</span>` : '';

    if (isSticker) {
        const wrapper = document.createElement("div");
        wrapper.className = "stc-wrapper";
        const img = document.createElement("img");
        img.src = content;
        
        // Ukuran kecil (130px) & Soft (Border Radius)
        img.style.width = "130px";
        img.style.borderRadius = "12px";
        img.style.display = "block";
        
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

// 3. Logika Proses Chat
async function processChat() {
    const val = userInput.value.trim();
    if (!val) return;

    // Kirim pesan user
    const currentMsgId = renderMsg(val, "user", false, 'sent');
    userInput.value = "";
    sendBtn.disabled = true;

    // Status Mengetik
    if (statusTxt) {
        statusTxt.innerText = "mengetik";
        statusTxt.classList.add("typing-dots");
    }

    try {
        const sys = await getPrompt();
        const response = await fetch(`https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(sys + "\n\nUser: " + val)}`);
        const json = await response.json();
        let raw = json.result || json.response || "-|-|-|-";
        const parts = raw.split("|").map(s => s.trim());
        
        // --- FITUR CENTANG BIRU AUTOMATIS ---
        const userMsgEl = document.getElementById(currentMsgId);
        if (userMsgEl) {
            const iconCont = userMsgEl.querySelector('.status-icon');
            if (iconCont) {
                iconCont.className = "status-icon tick-read";
                iconCont.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM6.41 11.17L5 9.75 1 13.75 2.41 15.17l4-4z"/></svg>`;
            }
        }

        // Tampilkan balasan AI
        if (parts[0] && parts[0] !== "-") renderMsg(parts[0], "ai");
        if (parts[1] && parts[1] !== "-") setTimeout(() => renderMsg(parts[1], "ai"), 800);
        
        let stc = parts[2];
        if (stc && stc !== "-") {
            const match = stc.match(/https?:\/\/[^\s"'<>()\[\]]+?\.webp/);
            if (match) setTimeout(() => renderMsg(match[0], "ai", true), 1500);
        }

    } catch (err) {
        console.error(err);
        renderMsg("Gagal koneksi server.", "ai");
    } finally {
        if (statusTxt) {
            statusTxt.innerText = "bot";
            statusTxt.classList.remove("typing-dots");
        }
        sendBtn.disabled = false;
    }
}

// 4. Listeners
sendBtn.addEventListener("click", processChat);
userInput.addEventListener("keypress", (e) => { 
    if (e.key === "Enter") processChat(); 
});

window.onload = () => { 
    setTimeout(() => renderMsg("hlo, knp?", "ai"), 500); 
};
