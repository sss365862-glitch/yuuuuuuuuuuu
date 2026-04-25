const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

const keywords = {
    FIRE: ['死', '殺', '破壊', '無理', '限界', '爆発', '消えろ', '地獄', '炎上', '怒', '激'],
    LIGHTNING: ['神', '天才', '革命', 'コード', 'バグ', '再構築', '閃光', '論理', '電撃'],
    GALAXY: ['愛', '希望', '夢', '未来', '平和', 'ありがとう', '奇跡', '調和', '光', '星'],
    MIST: ['疲れた', '虚無', '...', '退屈', '雨', '影', '悲', '無'],
    CHAOS: ['狂気', '混沌', '嘘', '崩壊', '闇', '堕', '乱']
};
const colors = { FIRE: '#FF4422', LIGHTNING: '#00EEEE', GALAXY: '#BB22FF', MIST: '#AAAAAA', BUG_NOISE: '#FF00BB', CHAOS: '#EEEE00' };

function setSample(type) {
    const texts = { 
        '建前': '明日も一日頑張りましょう。', 
        '本音': 'もう無理。帰りたい。限界です。', 
        '狂気': '死ね殺す破壊する革命神コードバグ混沌嘘崩壊闇狂気混沌嘘崩壊闇！あああああああああああああああ！！！！！！！' 
    };
    document.getElementById('input').value = texts[type];
}

// --- 以下、豪華版ロジックに差し替え ---

function runBurst() {
    const text = document.getElementById('input').value.trim();
    const log = document.getElementById('log');
    if (text === "") { log.innerHTML = "SYSTEM: Input is empty."; return; }

    particles = []; 
    let detectedTypes = [];
    let intensityBase = 20; 
    
    Object.keys(keywords).forEach(t => {
        keywords[t].forEach(word => {
            if (text.includes(word)) { 
                if (!detectedTypes.includes(t)) detectedTypes.push(t);
                intensityBase += 5; 
            }
        });
    });

    if (detectedTypes.length === 0) detectedTypes.push('MIST');
    
    // 対数で制御し、文字数が多くても「速すぎて消える」のを防ぐ
    const intensity = Math.min(60, intensityBase + Math.log1p(text.length) * 5);
    let finalTypes = detectedTypes;
    if (intensityBase > 80) finalTypes = ['BUG_NOISE'];

    // 密度を大幅にアップ
    const count = Math.min(7000, 800 + (text.length * 40));
    const baseSize = 6;
        
    createExplosion(finalTypes, intensity, count, baseSize);
    log.innerHTML = `DETECTED: ${finalTypes.join('+')} | particles:${count}`;
}

function createExplosion(types, intensity, count, baseSize) {
    for(let i=0; i<count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const angle = Math.random() * Math.PI * 2;
        const v = (Math.random() * 0.8 + 0.2) * intensity;
        
        particles.push({
            x: canvas.width/2, 
            y: canvas.height/2,
            vx: Math.cos(angle) * v,
            vy: Math.sin(angle) * v,
            friction: 0.94 + (Math.random() * 0.03),
            gravity: type === 'MIST' ? 0.02 : 0,
            life: 200 + Math.random() * 200, 
            maxLife: 400,
            type: type,
            color: colors[type] || '#ffffff',
            size: baseSize * (Math.random() * 1.5 + 0.5),
            phase: Math.random() * Math.PI * 2
        });
    }
}

function animate() {
    // 軌跡を残し、加算合成で光らせる
    ctx.fillStyle = 'rgba(10, 10, 10, 0.15)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        
        // 密度が高い時に「うねり」を加えて豪華さを演出
        if (particles.length > 2000) {
            p.vx += Math.sin(p.life * 0.05 + p.phase) * 0.15;
            p.vy += Math.cos(p.life * 0.05 + p.phase) * 0.15;
        }

        p.x += p.vx; p.y += p.vy;
        p.life--;

        if (p.type === 'BUG_NOISE' && Math.random() > 0.8) continue;

        const alpha = Math.min(1, p.life / 60);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        
        const s = Math.max(0.1, (p.life / p.maxLife) * p.size);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();

        if(p.life <= 0) particles.splice(i, 1);
    }
    
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(animate);
}

animate();