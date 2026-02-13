/* ============================================
   F-LENTINE — Valentine Interactive Website
   script.js — All logic, animations, particles
   ============================================ */

// ============================
// CONFIGURATION & CONSTANTS
// ============================
const CONFIG = {
    password: 'FebyZahara',
    typingSpeed: 2,          // ms per character (fast)
    slowTypingSpeed: 35,      // ms for important words
    particleDensity: 50,      // number of particles
    heartCircleCount: 18,     // hearts in final circle
    heartCircleRadius: 120,   // radius of heart circle
};

// Valentine letter content — static text
const LETTER_PARAGRAPHS = [
    'Dear Feby Zahara,',
    'Setiap hari bersamamu adalah hadiah yang tak ternilai. Kamu adalah <span class="highlight">cahaya</span> dalam setiap hariku, dan <span class="highlight">kebahagiaan</span> yang tak pernah bisa aku bayangkan sebelumnya.',
    'Terima kasih sudah datang <span class="highlight">secara tiba tiba</span> untuk mewarnai. Terima kasih sudah selalu ada.',
    'kamu adalah <span class="highlight">rumahku</span>, tempatku pulang, dan tempatku merasa <span class="highlight">aman</span>.',
    'Happy Valentine\'s Day, My Love, Maybe?. 💗',
];

// ============================
// DOM ELEMENTS
// ============================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const canvas = $('#particle-canvas');
const ctx = canvas.getContext('2d');

const lockScreen = $('#lock-screen');
const passwordInput = $('#password-input');
const unlockBtn = $('#unlock-btn');
const lockIcon = $('#lock-icon');
const lockError = $('#lock-error');
const passwordWrapper = $('#password-wrapper');

const envelopeScene = $('#envelope-scene');
const envelope = $('#envelope');
const tapHint = $('#tap-hint');

const letterScene = $('#letter-scene');
const letterContent = $('#letter-content');
const letterCard = $('#letter-card');

const cardsScene = $('#cards-scene');
const tarotCards = $$('.tarot-card');
const btnFinal = $('#btn-final');

const finalScene = $('#final-scene');
const finalText = $('#final-text');
const heartCircle = $('#heart-circle');
const foreverText = $('#forever-text');

const btnSpecial = $('#btn-special');
const vinylPlayer = $('#vinyl-player');
const vinylDisc = $('#vinyl-disc');
const bgMusic = $('#bg-music');

// ============================
// STATE
// ============================
let currentScene = 'lock';
let particles = [];
let particlesActive = false;
let isPlaying = false;
let flippedCards = 0;

// ============================
// UTILITY FUNCTIONS
// ============================
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// SCENE TRANSITION
// ============================
function transitionTo(sceneId) {
    $$('.scene').forEach(s => s.classList.remove('active'));
    const target = $(`#${sceneId}`);

    // Small delay for smooth transition
    setTimeout(() => {
        target.classList.add('active');
    }, 100);

    currentScene = sceneId.replace('-scene', '');
}

// ============================
// 1. PASSWORD / LOCK SCREEN
// ============================
function handleUnlock() {
    const value = passwordInput.value.trim();

    if (value === CONFIG.password) {
        // Correct password
        lockError.classList.remove('visible');
        lockIcon.classList.add('unlocked');

        // Sparkle burst effect
        createSparkleBurst();

        // Transition after sparkle animation
        setTimeout(() => {
            transitionTo('envelope-scene');
            // Start background music attempt
            tryPlayMusic();
        }, 1200);

    } else {
        // Wrong password — shake + error
        passwordWrapper.classList.add('shake');
        lockError.classList.add('visible');
        passwordInput.value = '';

        setTimeout(() => {
            passwordWrapper.classList.remove('shake');
        }, 500);
    }
}

// Sparkle burst when unlocking
function createSparkleBurst() {
    const sparkles = ['✨', '💖', '💕', '⭐', '🌟', '💗'];
    const container = document.createElement('div');
    container.className = 'sparkle-burst';
    document.body.appendChild(container);

    for (let i = 0; i < 20; i++) {
        const spark = document.createElement('span');
        spark.className = 'sparkle';
        spark.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];

        const angle = (Math.PI * 2 * i) / 20;
        const dist = randomRange(80, 200);
        spark.style.left = '50%';
        spark.style.top = '45%';
        spark.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
        spark.style.animationDelay = `${i * 30}ms`;

        container.appendChild(spark);
    }

    setTimeout(() => container.remove(), 1500);
}

// Event listeners for lock screen
unlockBtn.addEventListener('click', handleUnlock);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUnlock();
});

// ============================
// 2. ENVELOPE SCENE
// ============================
let envelopeOpened = false;
let envelopeReady = false; // true after open animation completes

envelope.addEventListener('click', () => {
    if (!envelopeOpened) {
        // First click: open envelope
        envelopeOpened = true;
        envelope.classList.add('opened');
        tapHint.classList.add('hidden');

        // After open animation, show hint text and allow next click
        setTimeout(() => {
            const letterInner = $('#letter-inner');
            letterInner.textContent = 'Klik untuk membaca surat... 💌';
            envelopeReady = true;
        }, 1500);

    } else if (envelopeReady) {
        // Second click: go to letter scene
        envelopeReady = false; // prevent double-fire
        transitionTo('letter-scene');
        startLetterScene();
    }
});

// ============================
// 3. LETTER SCENE
// ============================
let letterStarted = false;

async function startLetterScene() {
    if (letterStarted) return;
    letterStarted = true;

    // Change background color
    document.body.style.background = 'linear-gradient(135deg, #E8A0BF 0%, #FFDAB9 50%, #FFB6C1 100%)';

    // Start particle rain
    startParticleRain();

    // Show vinyl player
    vinylPlayer.classList.add('visible');

    // Bloom roses
    setTimeout(() => bloomRoses(), 1000);

    // Typing effect for each paragraph
    letterContent.innerHTML = '';

    for (let i = 0; i < LETTER_PARAGRAPHS.length; i++) {
        await sleep(400);
        await typeParagraph(LETTER_PARAGRAPHS[i], i);
    }

    // Show footer
    const footer = letterCard.querySelector('.letter-footer');
    if (footer) {
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(10px)';
        footer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        await sleep(500);
        footer.style.opacity = '1';
        footer.style.transform = 'translateY(0)';
    }
}

async function typeParagraph(html, index) {
    return new Promise((resolve) => {
        const p = document.createElement('div');
        p.className = 'paragraph';
        p.style.animationDelay = `${index * 0.1}s`;
        letterContent.appendChild(p);

        // Force reflow then trigger animation
        requestAnimationFrame(() => {
            p.style.opacity = '1';
            p.style.transform = 'translateY(0)';
        });

        // Strip HTML for typing, but apply it once done
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const plainText = tempDiv.textContent;

        let charIndex = 0;

        function typeChar() {
            if (charIndex < plainText.length) {
                // Vary speed for important moments
                const char = plainText[charIndex];
                const speed = (char === ',' || char === '.')
                    ? CONFIG.slowTypingSpeed * 2
                    : CONFIG.typingSpeed;

                p.textContent = plainText.substring(0, charIndex + 1);
                charIndex++;

                // Scroll letter content into view
                letterContent.scrollTop = letterContent.scrollHeight;

                setTimeout(typeChar, speed);
            } else {
                // Replace with rich HTML version (with highlights)
                p.innerHTML = html;
                resolve();
            }
        }

        typeChar();
    });
}

// Rose bloom
function bloomRoses() {
    const roses = $$('.rose');
    roses.forEach((rose, i) => {
        setTimeout(() => {
            rose.classList.add('bloom');
        }, i * 500);
    });

    // Show corner roses
    setTimeout(() => {
        $$('.corner-rose').forEach(r => r.classList.add('visible'));
    }, 800);
}

// ============================
// 4. CLICK BURST HEARTS
// ============================
document.addEventListener('click', (e) => {
    if (currentScene === 'lock' || currentScene === 'envelope') return;

    const hearts = ['💗', '💕', '💖', '💘', '🌸', '✨'];
    const count = Math.floor(randomRange(5, 10));

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'click-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = `${e.clientX}px`;
        heart.style.top = `${e.clientY}px`;

        const angle = (Math.PI * 2 * i) / count;
        const dist = randomRange(30, 80);
        heart.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
        heart.style.setProperty('--by', `${Math.sin(angle) * dist - 30}px`);
        heart.style.animationDelay = `${i * 30}ms`;

        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 900);
    }
});

// ============================
// 5. PARTICLE RAIN (Canvas)
// ============================
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
        // Pre-pick emoji once so it doesn't flicker
        const r = Math.random();
        this.emoji = r < 0.4 ? '🌸' : r < 0.75 ? '💗' : '✨';
    }

    reset() {
        this.x = randomRange(0, canvas.width);
        this.y = randomRange(-50, -200);
        this.size = randomRange(12, 20);
        this.speed = randomRange(0.5, 1.6);           // slower, gentler fall
        this.angle = randomRange(0, Math.PI * 2);
        this.angleSpeed = randomRange(-0.003, 0.003);  // very slow rotation
        this.wobbleAmp = randomRange(0.15, 0.5);       // gentle horizontal sway
        this.wobbleFreq = randomRange(0.008, 0.02);    // slow sway frequency
        this.opacity = randomRange(0.4, 0.85);
        this.time = randomRange(0, 200);               // offset so particles don't sync
    }

    update() {
        this.time++;
        this.y += this.speed;
        this.angle += this.angleSpeed;
        // Smooth sine-wave horizontal drift
        this.x += Math.sin(this.time * this.wobbleFreq) * this.wobbleAmp;

        if (this.y > canvas.height + 30) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

function startParticleRain() {
    if (particlesActive) return;
    particlesActive = true;

    // Create particles
    for (let i = 0; i < CONFIG.particleDensity; i++) {
        const p = new Particle();
        p.y = randomRange(0, canvas.height);  // Spread initially
        particles.push(p);
    }

    animateParticles();
}

function animateParticles() {
    if (!particlesActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}

// ============================
// 6. SPECIAL BUTTON → CARDS
// ============================
btnSpecial.addEventListener('click', (e) => {
    e.stopPropagation();
    transitionTo('cards-scene');

    // Change background
    document.body.style.background = 'linear-gradient(135deg, #FF1493 0%, #c2185b 50%, #B19CD9 100%)';
});

// ============================
// 7. TAROT CARDS
// ============================
tarotCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();

        if (card.classList.contains('flipped')) return;
        card.classList.add('flipped');
        flippedCards++;

        // Confetti burst on flip
        createConfetti(e.clientX, e.clientY);

        // Show final button when all cards flipped
        if (flippedCards >= 3) {
            setTimeout(() => {
                btnFinal.classList.add('visible');
            }, 800);
        }
    });
});

function createConfetti(x, y) {
    const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#B19CD9', '#FFD700', '#FF6B6B'];

    for (let i = 0; i < 25; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';
        piece.style.left = `${x}px`;
        piece.style.top = `${y}px`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];

        const angle = (Math.PI * 2 * i) / 25;
        const dist = randomRange(50, 150);
        piece.style.setProperty('--cx', `${Math.cos(angle) * dist}px`);
        piece.style.setProperty('--cy', `${Math.sin(angle) * dist}px`);
        piece.style.animationDelay = `${i * 20}ms`;
        piece.style.width = `${randomRange(6, 12)}px`;
        piece.style.height = `${randomRange(6, 12)}px`;
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 1200);
    }
}

// ============================
// 8. FINAL SCENE — Cinematic
// ============================
btnFinal.addEventListener('click', async (e) => {
    e.stopPropagation();

    // Stop particles temporarily
    particlesActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];

    // Transition to final scene
    transitionTo('final-scene');
    document.body.style.background = 'linear-gradient(135deg, #0D1B2A 0%, #1B0A2E 100%)';

    // Pause before text
    await sleep(800);

    // Typing effect for final question
    const question = 'Will you always be with me?';
    finalText.textContent = '';

    for (let i = 0; i < question.length; i++) {
        finalText.textContent += question[i];
        await sleep(80);
    }

    // Bloom the big rose
    await sleep(500);
    const bigRose = $('#big-rose');
    bigRose.classList.add('visible');

    // Show "Happy Valentine" text after rose blooms
    await sleep(1800);
    const happyVal = $('#happy-valentine');
    happyVal.classList.add('visible');

    // Pause, then create heart circle
    await sleep(800);
    createHeartCircle();

    // After circle formed, pulse + show "Forever"
    await sleep(2000);
    heartCircle.classList.add('pulse');

    await sleep(500);
    foreverText.classList.add('visible');

    // Show credit
    await sleep(1000);
    $('#created-by').classList.add('visible');

    // Restart particles with different style for final scene
    await sleep(500);
    startFinalParticles();
});

function createHeartCircle() {
    heartCircle.innerHTML = '';

    const count = CONFIG.heartCircleCount;
    const radius = CONFIG.heartCircleRadius;

    // On mobile, reduce radius
    const isMobile = window.innerWidth <= 480;
    const r = isMobile ? radius * 0.7 : radius;

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const x = Math.cos(angle) * r + r + 20;
        const y = Math.sin(angle) * r + r + 20;

        const heart = document.createElement('span');
        heart.className = 'heart-item';
        heart.textContent = '💗';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.animationDelay = `${i * 80}ms`;

        heartCircle.appendChild(heart);
    }
}

function startFinalParticles() {
    particlesActive = true;
    particles = [];

    for (let i = 0; i < 30; i++) {
        const p = new Particle();
        p.y = randomRange(0, canvas.height);
        p.opacity = randomRange(0.2, 0.5);
        p.speed = randomRange(0.3, 1);
        particles.push(p);
    }

    animateParticles();
}

// ============================
// 9. VINYL AUDIO PLAYER
// ============================
function tryPlayMusic() {
    bgMusic.volume = 0.3;
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            vinylPlayer.classList.add('playing');
        }).catch(() => {
            // Autoplay blocked — user needs to click vinyl
            isPlaying = false;
        });
    }
}

vinylPlayer.addEventListener('click', (e) => {
    e.stopPropagation();

    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        vinylPlayer.classList.remove('playing');
    } else {
        bgMusic.volume = 0.3;
        bgMusic.play().then(() => {
            isPlaying = true;
            vinylPlayer.classList.add('playing');
        }).catch(() => { });
    }
});

// ============================
// 10. EASTER EGG: "L" Key / Double Tap
// ============================
document.addEventListener('keydown', (e) => {
    if (e.key === 'l' || e.key === 'L') {
        triggerFireworks();
    }
});

// Double tap for mobile
let lastTap = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
        triggerFireworks();
    }
    lastTap = now;
});

function triggerFireworks() {
    const emojis = ['💗', '💖', '💕', '❤️', '🌟', '✨', '🎆', '💫'];

    for (let burst = 0; burst < 5; burst++) {
        setTimeout(() => {
            const cx = randomRange(100, window.innerWidth - 100);
            const cy = randomRange(100, window.innerHeight - 100);

            for (let i = 0; i < 15; i++) {
                const spark = document.createElement('span');
                spark.className = 'click-heart';
                spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                spark.style.left = `${cx}px`;
                spark.style.top = `${cy}px`;
                spark.style.fontSize = `${randomRange(1, 2.5)}rem`;

                const angle = (Math.PI * 2 * i) / 15;
                const dist = randomRange(60, 180);
                spark.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
                spark.style.setProperty('--by', `${Math.sin(angle) * dist}px`);
                spark.style.animationDelay = `${i * 40}ms`;
                spark.style.animationDuration = '1.2s';

                document.body.appendChild(spark);
                setTimeout(() => spark.remove(), 1400);
            }
        }, burst * 500);
    }
}

// ============================
// INITIALIZATION
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Focus password input
    passwordInput.focus();

    // Preload font rendering
    document.fonts.ready.then(() => {
        // Fonts loaded
    });
});
