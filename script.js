const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function getTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

async function getPrompt() {
    try {
        const res = await fetch('prompt.txt');
        return res.ok ? await res.text() : "Kevin. Format: pesan|pesan2|stc|mood";
    } catch { return "Kevin. Format: pesan|pesan2|stc|mood"; }
}

function renderMsg(content, type, isSticker = false) {
    if (!content || content === "-" || content === "null") return;
    const div = document.createElement("div");
    div.className = `message ${type}-msg ${isSticker ? 'stc-msg' : ''}`;
    
    if (isSticker) {
        const img = document.createElement("img");
        img.className = "whatsapp-sticker";
        img.src = content;
        img.onerror = () => div.remove();
        div.appendChild(img);
    } else {
        div.innerHTML = `${content} <span class="time">${getTime()}</span>`;
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function processChat() {
    const val = userInput.value.trim();
    if (!val) return;

    renderMsg(val, "user");
    userInput.value = "";
    sendBtn.disabled = true;

    try {
        const sys = await getPrompt();
        const fullPrompt = `${sys}\n\nUser: ${val}`;
        const response = await fetch(`https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(fullPrompt)}`);
        const json = await response.json();
        let raw = json.result || json.response || "-|-|-|-";

        const parts = raw.split("|").map(s => s.trim());
        const p1 = parts[0];
        const p2 = parts[1];
        let stc = parts[2];
        const mood = parts[3];

        if (stc && stc !== "-") {
            const match = stc.match(/https?:\/\/[^\s"'<>()\[\]]+?\.webp/);
            stc = match ? match[0] : "-";
        }

        if (p1 && p1 !== "-") renderMsg(p1, "ai");
        if (p2 && p2 !== "-") setTimeout(() => renderMsg(p2, "ai"), 600);
        if (stc && stc !== "-" && stc.startsWith("http")) {
            setTimeout(() => renderMsg(stc, "ai", true), 1100);
        }
        
        console.log("Mood:", mood);
    } catch (err) {
        renderMsg("males, error.", "ai");
    } finally {
        sendBtn.disabled = false;
    }
}

sendBtn.addEventListener("click", processChat);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") processChat(); });

window.onload = () => { setTimeout(() => renderMsg("hlo, knp?", "ai"), 500); };
