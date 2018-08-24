var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var colors = ['#00FF7F', '#7B68EE', '#00FFFF'];
var shieldColors = ['#00E8FF', '#FF7400'];
var particles = [];

canvas.width = innerWidth;
canvas.height = 700;

var mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

canvas.onmousedown = function (event) {
    canvas.onmousemove = function (event) {
        particles.forEach(particle => {
            particle.Update();
        });
    }
    canvas.onmouseup = function (event) {
        canvas.onmousemove = null;
        particles[0].lastMouse.x = null;
        particles[0].lastMouse.y = null;

    }
}

addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

addEventListener('keydown', function(event) {
    if (event.keyCode == 27) {
        location.href = '../index.html';
    }
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.lastMouse = {x: null, y: null};
    };
    Update() {
        this.x = mouse.x;
        this.y = mouse.y;
        this.Draw();
        this.lastMouse.x = this.x;
        this.lastMouse.y = this.y;
    }

    Draw() {
        ctx.beginPath();
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        if (this.lastMouse.x == null) {
            ctx.moveTo(this.x, this.y);
        } else {
            ctx.moveTo(this.lastMouse.x, this.lastMouse.y);
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
    }
}

function init() {
    for (let i = 0; i < 1; i++) {
        const color = randomColorFromArray(colors);
        // const color = randomColor();
        particles.push(new Particle(mouse.x, mouse.y, color));
    }
}

document.getElementById('color').onchange = function () {
    particles[0].color = this.value;
}

document.getElementById('clear').onclick = function () {
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

init();

// function animate() {
//     requestAnimationFrame(animate);
//     // ctx.fillStyle = 'rgba(0, 0, 0,0.05)';
//     // ctx.fillRect(0,0,canvas.width,canvas.height);

//     particles.forEach(particle => {
//         particle.Update();
//     });
// }

// animate();

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

function randomColorFromArray(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomColor() {
    let redHex = Math.floor(Math.random() * 255).toString(16);
    let greenHex = Math.floor(Math.random() * 255).toString(16);
    let blueHex = Math.floor(Math.random() * 255).toString(16);
    if (redHex.length == 1) {
        redHex = '0' + redHex;
    }
    if (greenHex.length == 1) {
        greenHex = '0' + greenHex;
    }

    if (blueHex.length == 1) {
        blueHex = '0' + blueHex;
    }

    return '#' + redHex + greenHex + blueHex;
}