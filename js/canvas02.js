var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var colors = ['#00FF7F', '#7B68EE', '#00FFFF'];
var mouse = {
    x: -999,
    y: -999
};
var particles;

canvas.width = innerWidth;
canvas.height = innerHeight;

addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

canvas.addEventListener('mouseleave', function(event) {
    mouse.x = -999;
    mouse.y = -999;
});

canvas.addEventListener('click', function() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].radius = 0;
    }
})

class Particle {
    constructor(id, radius, mass, speed, acceleration, x, y, color) {
        this.id = id;
        this.radius = radius;
        this.mass = mass;
        this.speed = speed;
        this.acceleration = acceleration;
        this.x = x;
        this.y = y;
        this.velocity = {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5
        };
        this.color = color;
        this.opacity = 0;
    };

    Update(particles) {
        this.Draw();

        for (let i = 0; i < particles.length; i++) {
            if (this === particles[i]) continue;
            if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius - particles[i].radius < 0) {
                resolveCollision(this, particles[i]);
            }
        }

        if (this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) {
            this.velocity.x = -this.velocity.x;
        }

        if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
            this.velocity.y = -this.velocity.y;
        }

        if (getDistance(mouse.x, mouse.y, this.x, this.y) < 120 && this.radius < 20) {
            this.radius += 0.5;
        } else if (this.radius > 0.5) {
            this.radius -= 0.5;
            this.radius = Math.max(0, this.radius);
        }

        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }

    Draw() {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

function init() {
    particles = [];

    for (let i = 0; i < 1000; i++) {
        const radius = 0;
        const color = randomColorFromArray(colors);
        const mass = 1;
        const speed = 3;
        const acceleration = 0.1;

        let x = randomIntFromRange(radius, canvas.width - radius);
        let y = randomIntFromRange(radius, canvas.height - radius);


        if (i !== 0) {
            for (let j = 0; j < particles.length; j++) {
                if (getDistance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
                    x = randomIntFromRange(radius, canvas.width - radius);
                    y = randomIntFromRange(radius, canvas.height - radius);

                    j = -1;
                }
            }
        }

        particles.push(new Particle(i, radius, mass, speed, acceleration, x, y, color));
    }
}

init();

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