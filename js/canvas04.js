var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var colors = ['#00FF7F', '#7B68EE', '#00FFFF'];
var particles = [];
var mouse = {
    x: -999,
    y: -999
};
var id = 0;

var isDown;
var requestId;

canvas.width = innerWidth;
canvas.height = innerHeight;

addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

addEventListener('keydown', function(event) {
    if (event.keyCode == 27) {
        location.href = '../index.html';
    }
});

addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.onmousedown = function(event) {
    isDown = true;
    Generate();
};

canvas.onmouseup = function() {
    isDown = false;
    cancelAnimationFrame(requestId);
    // console.log('Анимация отключена!');
}

function Generate() {
    requestId = requestAnimationFrame(Generate);
    if (isDown) {
        id++;
        const radius = randomIntFromRange(15, 25);
        const color = randomColor(colors);
        const mass = 1;
        const speed = randomIntFromRange(2, 4);
        const x = mouse.x;
        const y = mouse.y;
        const lineWidth = 0.5;
        particles.push(new Particle(id, x, y, radius, mass, speed, color, lineWidth));
        if (particles.length > 100) {
            while (particles.length > 100) {
                particles.shift();
            }

            for (let i = 0; i < particles.length; i++) {
                particles[i].id = i;
            }
        }

    }
    // console.log('Анимация работает!');
}

class Particle {
    constructor(id, x, y, radius, mass, speed, color, lineWidth) {
        this.id = id;
        this.radius = radius;
        this.mass = mass;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.velocity = {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5
        };
        this.color = color;
        this.lineWidth = lineWidth;
    };

    Update(particles) {
        this.Draw();

        for (let i = 0; i < particles.length; i++) {
            if (this === particles[i]) continue;
            if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius - particles[i].radius < 0) {
                resolveCollision(this, particles[i]);
            }

            if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius - particles[i].radius < 100 && this.id > i) {
                let grd = ctx.createLinearGradient(this.x, this.y, particles[i].x, particles[i].y);
                grd.addColorStop(0, this.color);
                grd.addColorStop(1, particles[i].color);
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(particles[i].x, particles[i].y);
                ctx.strokeStyle = grd;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.closePath();
            }
        }

        if (this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) {
            this.velocity.x = -this.velocity.x;
        }

        if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
            this.velocity.y = -this.velocity.y;
        }

        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }

    Draw() {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.radius - 8, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        ctx.arc(this.x, this.y, this.radius - 5, Math.PI * 2, false);
        ctx.fill('evenodd');
        ctx.closePath();
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.Update(particles);
    });
}

animate();

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

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

function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = {
            x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
            y: u1.y
        };
        const v2 = {
            x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
            y: u2.y
        };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}