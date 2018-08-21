var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var colors = ['#00FF7F', '#7B68EE', '#00FFFF'];
var shieldColors = ['#00E8FF', '#FF7400'];
var particles = [];

canvas.width = innerWidth;
canvas.height = innerHeight;

var mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

class Particle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.radians = Math.random() * Math.PI * 2;
        this.velocity = randomIntFromRange(1, 6) / 100;
        this.distanceFromCenter = randomIntFromRange(50, 120);
        this.lastMouse = {x: this.x, y: this.y};
    };
    Update(particles) {
        const lastPoint = {
            x: this.x,
            y: this.y
        }

        this.radians += this.velocity;
        this.lastMouse.x += (mouse.x - this.lastMouse.x) * 0.05;
        this.lastMouse.y += (mouse.y - this.lastMouse.y) * 0.05;
        this.x = this.lastMouse.x +  Math.cos(this.radians) * this.distanceFromCenter;
        this.y = this.lastMouse.y + Math.sin(this.radians) * this.distanceFromCenter;
        this.Draw(lastPoint);
        

        // for (let i = 0; i < particles.length; i++) {
          
        //     ctx.beginPath();
        //     ctx.moveTo(this.x, this.y);
        //     ctx.lineCap = 'round';
        //     ctx.lineWidth = 1;
        //     ctx.setLineDash([1, 10]);
        //     ctx.lineTo(particles[i].x, particles[i].y);
        //     ctx.strokeStyle = this.color;
        //     ctx.stroke();
        //     ctx.closePath();
        // }
    }

    Draw(lastPoint) {
        ctx.beginPath();
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.radius;
        ctx.lineCap = 'round';
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
    }
}

function init() {
    for (let i = 0; i < 50; i++) {
        const radius = randomIntFromRange(2, 6);
        const color = randomColorFromArray(colors);
        particles.push(new Particle(mouse.x, mouse.y, radius, color));
    }
}

init();

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0,0.05)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    particles.forEach(particle => {
        particle.Update();
    });
}

animate();

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

function randomColorFromArray(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomColor() {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);

    return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
}