const btn = document.getElementById('submitBtn');
const resDiv = document.getElementById('aiResponse');
const API_KEY = "AIzaSyBYK5quIZGEjpJWJt-F8LBtr_agvPZz2wY";

btn.addEventListener('click', async () => {
    const input = document.getElementById('userInput').value;
    if (!input) return;

    btn.innerText = "弁論中...";
    btn.disabled = true;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "あなたは弁護士です。言い訳を「崇高な余白」として正当化して：" + input }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            typeWriter(data.candidates[0].content.parts[0].text);
        } else {
            throw new Error("No response");
        }
    } catch (e) {
        const fallbacks = [
            "それは、脳が新しいアイデアを整理するための『神聖な空白』です。",
            "動かないことこそが、最も鋭い戦略的判断です。",
            "今は停滞しているように見えますが、これは大ジャンプの前の屈伸です。"
        ];
        typeWriter(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
        btn.innerText = "弁護する";
        btn.disabled = false;
    }
});

function typeWriter(text) {
    resDiv.innerText = "";
    let i = 0;
    const interval = setInterval(() => {
        resDiv.innerText += text[i];
        i++;
        if (i >= text.length) clearInterval(interval);
    }, 50);
}