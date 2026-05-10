const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const statusTxt = document.getElementById("status-text"); // Elemen status di header

// Fungsi untuk mendapatkan waktu saat ini (Format Telegram)
function getTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Fungsi mengambil data prompt dari file prompt.txt
async function getPrompt() {
    try {
        const res = await fetch('prompt.txt');
        return res.ok ? await res.text() : "Kevin. Format: pesan|pesan2|stc|mood";
    } catch { return "Kevin. Format: pesan|pesan2|stc|mood"; }
}

// Fungsi untuk merender pesan ke layar
function renderMsg(content, type, isSticker = false) {
    if (!content || content === "-" || content === "null") return;
    
    const div = document.createElement("div");
    div.className = `message ${type}-msg ${isSticker ? 'stc-msg' : ''}`;
    
    if (isSticker) {
        // Wrapper stiker agar tetap rapi sesuai tema
        const wrapper = document.createElement("div");
        wrapper.className = "stc-wrapper";
        
        const img = document.createElement("img");
        img.className = "whatsapp-sticker";
        img.src = content;
        img.onerror = () => div.remove(); // Hapus jika link gambar rusak
        
        wrapper.appendChild(img);
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
