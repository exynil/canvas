var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var colors = ['#00FF7F', '#7B68EE', '#00FFFF'];
var shieldColors = ['#00E8FF', '#FF7400'];
var particles = [];
var wDown;
var sDown;
var arrowUpDown;
var arrowDownDown;
var numberOfBalls;

canvas.width = innerWidth;
canvas.height = innerHeight;

addEventListener('resize', function() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	particles[1].x = innerWidth;
});

addEventListener('keydown', function (event) {
	if (event.keyCode == 27) {
		location.href = '../index.html';
	}
});

addEventListener('keydown', function (event) {
	if (event.keyCode == 87) {
		wDown = true;
	} else if (event.keyCode == 83) {
		sDown = true;
	} else if (event.keyCode == 40) {
		arrowDownDown = true;
	} else if (event.keyCode == 38) {
		arrowUpDown = true;
	}
});

addEventListener('keyup', function (event) {
	if (event.keyCode == 87) {
		wDown = false;
		particles[0].acceleration = 1;
	} else if (event.keyCode == 83) {
		sDown = false;
		particles[0].acceleration = 1;
	} else if (event.keyCode == 40) {
		arrowDownDown = false;
		particles[1].acceleration = 1;
	} else if (event.keyCode == 38) {
		arrowUpDown = false;
		particles[1].acceleration = 1;
	}
});

class Particle {
	constructor(id, x, y, radius, mass, speed, acceleration, color, isShield) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.mass = mass;
		this.speed = speed;
		this.acceleration = acceleration;
		this.color = color;
		this.velocity = {
			x: Math.random() - 0.5,
			y: Math.random() - 0.5
		};
		this.count = 0;
		this.isShield = isShield;
	};

	Update(particles){
		this.Draw();
		if (this.isShield == false) {
			for (let i = 0; i < particles.length; i++) {
				if (this === particles[i]) continue;
				if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius - particles[i].radius < 0) {
					if (i == 0 || i == 1) {
						if (this.x - this.radius <= 10 || this.x + this.radius >= canvas.width - 10) {
							this.velocity.x = -this.velocity.x;
						}
					}
					else {
						resolveCollision(this, particles[i]);
					}
				}
			}

			if (this.x + this.radius <= 0 && this.isShield == false) {
				particles[1].count++;
			} else if (this.x - this.radius >= innerWidth && this.isShield == false) {
				particles[0].count++;
			}

			if ((this.x + this.radius <= 0 || this.x - this.radius >= innerWidth) && this.isShield == false) {
				for (let i = 0; i < particles.length; i++) {
					if (particles[i].id == this.id) {
						particles.splice(i, 1);
						for (let j = 2; j < particles.length; j++) {
							particles[j].id = j;
						}
						break;
					}
				}
				return;
			}


			if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
				this.velocity.y = -this.velocity.y;
			}

			if (this.isShield == false) {
				this.x += this.velocity.x * this.speed;
				this.y += this.velocity.y * this.speed;
			}
		}

		for (let i = this.id + 1; i < particles.length; i++) {
			if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius - particles[i].radius < canvas.width / 2 - canvas.width / 6) {	
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineCap = 'round';
				ctx.lineWidth = 1;
				ctx.setLineDash([1, 10]);
				ctx.lineTo(particles[i].x, particles[i].y);
				ctx.strokeStyle = this.color;
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	Draw() {
		if (this.isShield) {
			ctx.beginPath();
			ctx.shadowBlur = 30;
			ctx.shadowColor = this.color;
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x - 10, this.y - this.radius, 20, this.radius * 2);
			ctx.closePath();

			ctx.beginPath();
			ctx.font = "30pt Arial";
			if (this.id == 0) {
				ctx.fillText(this.count, this.x + 40, this.y + 10);
			} else if (this.id == 1) {
				ctx.fillText(this.count, this.x - 60, this.y + 10);
			}
		}
		else {
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.arc(this.x, this.y, this.radius - this.radius / 2, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.shadowBlur = 30;
			ctx.shadowColor = this.color;
			ctx.lineWidth = 1;
			ctx.fillStyle = this.color;
			ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
			ctx.arc(this.x, this.y, this.radius - this.radius / 4, Math.PI * 2, false);
			ctx.fill('evenodd');
			ctx.closePath();
		}
	}
};

function init () {
	pushShields();
	pushBalls(3);
};

init();

function pushShields () {
	for (let i = 0; i < 2; i++) {
		let radius = 450;
		let color = shieldColors[i];
		let mass = 1;
		let speed = 0;
		let acceleration = 0.1;
		let x;
		let y;
		let isShield = true;
		if (i == 0) {
			x = 0;
			y = canvas.height / 2;
			radius = 100;
		}
		else if (i == 1) {
			x = canvas.width;
			y = canvas.height / 2;
		}
		particles.push(new Particle(i, x, y, radius, mass, speed, acceleration, color, isShield));
	}
}

function pushBalls (numberOfBalls) {
	for (let i = 2; i < 2 + numberOfBalls; i++) {
		let radius = 15;
		let color = randomColor();
		let mass = 1;
		let speed = 30;
		let acceleration = 0.1;
		let isShield = false;
		let x = randomIntFromRange(radius, canvas.width - radius);
		let y = randomIntFromRange(radius, canvas.height - radius);

		for (let j = 0; j < particles.length; j++) {
			if (getDistance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
				x = randomIntFromRange(radius, canvas.width - radius);
				y = randomIntFromRange(radius, canvas.height - radius);

				j = -1;
			}
		}

		particles.push(new Particle(i, x, y, radius, mass, speed, acceleration, color, isShield));
	}
}

function animate() {
	requestAnimationFrame(animate);

	if (particles.length < 3) {
		pushBalls(3);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < particles.length; i++) {
		particles[i].Update(particles);
	}

	
	if (sDown) {
		particles[0].y += 5 + particles[0].acceleration;
		particles[0].acceleration += 0.5;
		if (particles[0].y > canvas.height - particles[0].radius) {
			particles[0].y = canvas.height - particles[0].radius;
		}
	} else if (wDown) {
		particles[0].y -= 5 - particles[0].acceleration;
		particles[0].acceleration -= 0.5;
		if (particles[0].y < particles[0].radius) {
			particles[0].y = particles[0].radius;
		}
	}

	if (arrowDownDown) {
		particles[1].y += 5 + particles[1].acceleration;
		particles[1].acceleration += 0.5;
		if (particles[1].y > canvas.height - particles[1].radius) {
			particles[1].y = canvas.height - particles[1].radius;
		}
	} else if (arrowUpDown) {
		particles[1].y -= 5 - particles[1].acceleration;
		particles[1].acceleration -= 0.5;
		if (particles[1].y < particles[1].radius) {
			particles[1].y = particles[1].radius;
		}
	}
};

animate();

function randomIntFromRange (min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function randomColorFromArray(colors) {
	return colors[Math.floor(Math.random() * colors.length)];
}

function randomColor() {
	let red = Math.floor(Math.random() * 255);
	let green = Math.floor(Math.random() * 255);
	let blue = Math.floor(Math.random() * 255);
	
	return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
}

function getDistance (x1, y1, x2, y2) {
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
};

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
		const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
		const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

		// Final velocity after rotating axis back to original location
		const vFinal1 = rotate(v1, -angle);
		const vFinal2 = rotate(v2, -angle);

		// Swap particle velocities for realistic bounce effect
		particle.velocity.x = vFinal1.x;
		particle.velocity.y = vFinal1.y;

		otherParticle.velocity.x = vFinal2.x;
		otherParticle.velocity.y = vFinal2.y;
	}
};