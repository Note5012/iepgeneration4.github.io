const bgm = document.getElementById("bgm");
const btn = document.getElementById("musicBtn");

btn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        btn.textContent = "⏸ Pause";
    } else {
        bgm.pause();
        btn.textContent = "▶ Play";
    }
});

const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 1000;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2.5;
const IMAGE_ENLARGE = 13;
const HEART_COLOR = "#ff3e5f";

// ================== โหลดรูปหลายรูป ==================
const imagesSrc = [
    "images/Am.PNG",
    "images/Bui.jpeg",
    "images/Cha.jpeg",
    "images/Dear.PNG",
    "images/Fara.JPG",
    "images/Farista.JPG",
    "images/Folk.jpeg",
    "images/It.jpeg",
    "images/Khaw.JPG",
    "images/Mei.jpeg",
    "images/Neef.PNG",
    "images/Note.JPG",
    "images/Ong.jpg",
    "images/Opor.jpeg",
    "images/Phoo.PNG",
    "images/Rabia.JPG",
    "images/Rif.JPG",
    "images/Sireen.JPG",
    "images/Tanut.jpeg",
    "images/Tong.PNG",
    "images/Typhoon.JPG",
    "images/Wani.jpeg",
    "images/Ying.JPG",
    "images/US.JPG",
];

const images = [];
imagesSrc.forEach(src => {
    const img = new Image();
    img.src = src;
    images.push(img);
});

// ================== HEART ==================
function heartfunction(t, shrinkRatio = IMAGE_ENLARGE) {
    const scale = 20;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
        x: (x * shrinkRatio) + CANVAS_CENTER_X,
        y: (y * shrinkRatio) + CANVAS_CENTER_Y
    };
}

function scatterinside(x, y, beta = 0.15) {
    const ratioX = -beta * Math.log(Math.random());
    const ratioY = -beta * Math.log(Math.random());
    return {
        x: x - ratioX * (x - CANVAS_CENTER_X),
        y: y - ratioY * (y - CANVAS_CENTER_Y)
    };
}

function curve(p) {
    return (2 * Math.sin(p)) / Math.PI;
}

class Heart {
    constructor(generateFrame = 60) {
        this.points = [];
        this.edgePoints = [];
        this.centerPoints = [];
        this.allPoints = [];
        this.generateFrame = generateFrame;
        this.build(1500);

        for (let frame = 0; frame < generateFrame; frame++) {
            this.calc(frame);
        }
    }

    build(number) {
        for (let i = 0; i < number; i++) {
            const t = Math.random() * 2 * Math.PI;
            this.points.push(heartfunction(t));
        }

        this.points.forEach(p => {
            for (let i = 0; i < 3; i++) {
                this.edgePoints.push(scatterinside(p.x, p.y, 0.05));
            }
        });

        for (let i = 0; i < 4000; i++) {
            const p = this.points[Math.floor(Math.random() * this.points.length)];
            this.centerPoints.push(scatterinside(p.x, p.y, 0.18));
        }
    }

    calcPosition(x, y, ratio) {
        const distSq = Math.pow(x - CANVAS_CENTER_X, 2) + Math.pow(y - CANVAS_CENTER_Y, 2);
        const force = 1 / Math.pow(distSq, 0.42);
        const dx = ratio * force * (x - CANVAS_CENTER_X) + (Math.random() * 2 - 1);
        const dy = ratio * force * (y - CANVAS_CENTER_Y) + (Math.random() * 2 - 1);
        return { x: x - dx, y: y - dy };
    }

    calc(frame) {
        const ratio = 12 * curve((frame / this.generateFrame) * 2 * Math.PI);
        const framePoints = [];

        const add = (pts, sizeBase) => {
            for (const p of pts) {
                const pos = this.calcPosition(p.x, p.y, ratio);
                framePoints.push({
                    x: pos.x,
                    y: pos.y,
                    size: Math.random() * sizeBase + 1.5
                });
            }
        };

        add(this.points, 2);
        add(this.edgePoints, 1.5);
        add(this.centerPoints, 1.5);

        this.allPoints[frame] = framePoints;
    }

    render(context, frame) {
        const points = this.allPoints[frame % this.generateFrame];
        context.fillStyle = HEART_COLOR;

        for (const p of points) {
            context.fillRect(p.x, p.y, p.size, p.size);
        }
    }
}

// ================== PARTICLE ==================
class FloatingParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = CANVAS_CENTER_X + (Math.random() * 400 - 200);
        this.y = CANVAS_HEIGHT * 0.8;

        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1.2 + 0.8;
        this.opacity = 1;

        const types = ["text", "image"];
        this.type = types[Math.floor(Math.random() * types.length)];

        const texts = ["Love", "You", "♥", "Congratulations"];
        this.text = texts[Math.floor(Math.random() * texts.length)];

        // สุ่มรูป
        this.img = images[Math.floor(Math.random() * images.length)];
    }

    update() {
        this.y -= this.speedY;

        // 🔥 ดูดเข้ากลาง
        this.x += (CANVAS_CENTER_X - this.x) * 0.0001;

        // ส่ายเล็กน้อย
        this.x += Math.sin(this.y / 30) * 1.8;

        this.opacity -= 0.004;

        if (this.opacity <= 0 || this.y < CANVAS_CENTER_Y - 50) {
            this.reset();
        }
    }

    draw(context) {
    context.globalAlpha = this.opacity;

    // 🔥 กันพัง 100%
    if (this.type === "image" && this.img && this.img.complete && this.img.naturalWidth > 0) {
        context.drawImage(this.img, this.x, this.y, 60, 60);
    } else {
        context.fillStyle = `rgba(255, 62, 95, ${this.opacity})`;
        context.font = `bold ${this.size * 6}px Arial`;
        context.fillText(this.text, this.x, this.y);
    }

    context.globalAlpha = 1;
}
}

// ================== START ==================
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// กัน canvas เพี้ยน
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const heart = new Heart();
const floatingParticles = Array.from({ length: 30 }, () => new FloatingParticle());

let frame = 0;

let introActive = true;
let introOpacity = 0;
let introTextOpacity = 0;
let introTimer = 0;

function animate() {
    // 🔥 ทำฉากมืดแบบ fade (แทน clearRect)
    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ================= INTRO =================
    if (introActive) {
        introOpacity += 0.02;
        if (introOpacity > 0.7) introOpacity = 0.7;

        // 🌑 overlay ดำ
        context.fillStyle = `rgba(0,0,0,${introOpacity})`;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ✨ ข้อความ
        introTextOpacity += 0.02;
        if (introTextOpacity > 1) introTextOpacity = 1;

        context.globalAlpha = introTextOpacity;
        context.fillStyle = "#ffffff";
        context.font = "bold 45px Arial";
        context.textAlign = "center";

        context.fillText("Congratulation", CANVAS_CENTER_X, CANVAS_CENTER_Y);
        context.font = "22px Arial";
        context.fillText("Wishing you all the best for your next chapter! 💖", CANVAS_CENTER_X, CANVAS_CENTER_Y + 50);

        context.globalAlpha = 1;

        introTimer++;

        // 🎆 ยิงถี่ตอน intro
        if (Math.random() < 0.15) {
            fireworks.push(new Firework());
        }

        // ⏱️ 3 วิ
        if (introTimer > 180) {
            introActive = false;
        }
    }

    // ================= FIREWORK =================
    fireworks.forEach((f, index) => {
        f.update();
        f.draw(context);

        // 🔥 ลบตัวที่ตายแล้ว
        if (f.exploded && f.particles.every(p => p.life <= 0)) {
            fireworks.splice(index, 1);
        }
    });

    // ================= HEART =================
    if (!introActive) {
        heart.render(context, frame);

        floatingParticles.forEach(p => {
            p.update();
            p.draw(context);
        });

        
    }

    frame++;
    requestAnimationFrame(animate);
}

class Firework {
    constructor() {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = CANVAS_HEIGHT;
        this.targetY = Math.random() * CANVAS_HEIGHT * 0.5;

        this.speed = 6;
        this.exploded = false;
        this.particles = [];
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;

            if (this.y <= this.targetY) {
                this.explode();
                this.exploded = true;
            }
        } else {
            this.particles.forEach(p => p.update());
        }
    }

    explode() {
        for (let i = 0; i < 60; i++) {
            this.particles.push(new Spark(this.x, this.y));
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            ctx.fillStyle = "white";
            ctx.fillRect(this.x, this.y, 6, 6);
        } else {
            this.particles.forEach(p => p.draw(ctx));
        }
    }
}

class Spark {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 60;
        this.opacity = 1;

        // 🌈 สีสุ่ม
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        this.vy += 0.05; // gravity
        this.life--;
        this.opacity -= 0.02;
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1;
    }
}

const fireworks = [];

// ยิงตอนโหลด
for (let i = 0; i < 1; i++) {
    setTimeout(() => {
        fireworks.push(new Firework());
    }, i * 300);
}


animate();

