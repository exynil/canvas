var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var colors = ['#00FF7F', '#7B68EE', '#00FFFF'];
var boardColors = ['#00E8FF', '#FF7400'];
var boards = [];
var balls = [];
var wKeyDown;
var sKeyDown;
var arrowUpKeyDown;
var arrowDownKeyDown;
var numberOfBalls = 1;
var maxSpeed = 0;
var animationId;
var animationState = true;
var limitation = 10;
var timer = 45;

canvas.width = innerWidth;
canvas.height = innerHeight;

addEventListener('resize', function() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	boards[1].x = innerWidth - boards[1].width;
});

addEventListener('keydown', function(event) {
	switch (event.code) {
		case 'Escape':
			location.href = '../index.html';
			break;
		case 'Space':
			if (animationState) {
				cancelAnimationFrame(animationId);
				animationState = false;
				ctx.save();
				ctx.fillStyle = 'rgba(0, 0, 0,0.8)';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
				ctx.save();
				ctx.beginPath();
				ctx.shadowBlur = 10;
				ctx.shadowColor = '#F50338';
				ctx.font = "bold 60pt Courier New";
				ctx.fillStyle = '#F50338';
				ctx.fillText('<PAUSE>', canvas.width / 2 - 145, canvas.height / 2);
				ctx.font = "bold 20pt Courier New";
				ctx.fillText('<PING PONG by exynil>', canvas.width / 2 - 140, canvas.height / 2 + 100);
				ctx.fillText('<2018>', canvas.width / 2 - 30, canvas.height / 2 + 200);
				ctx.restore();
				ctx.closePath();
			} else {
				animate();
				animationState = true;
			}
			break;
		case 'NumpadAdd':
			pushBalls(1);
			break;
		case 'KeyR':
			redirectAllBalls();
			break;
		case 'Numpad1':
			for (let i = 0; i < balls.length; i++) {
				localStorage.setItem(i, JSON.stringify(balls[i]));
			}
			break;
		case 'Numpad2':
			for (let i = 0; i < balls.length; i++) {
				balls[i] = JSON.parse(localStorage.getItem(i));
			}
			break;
		default:
			// console.log(event.code);
			break;
	}

	if (event.code == 'KeyW') {
		wKeyDown = true;
		boards
	} else if (event.code == 'KeyS') {
		sKeyDown = true;
	} else if (event.code == 'ArrowDown') {
		arrowDownKeyDown = true;
	} else if (event.code == 'ArrowUp') {
		arrowUpKeyDown = true;
	}
});

addEventListener('keyup', function(event) {
	if (event.code == 'KeyW') {
		wKeyDown = false;
		boards[0].acceleration = 1;
	} else if (event.code == 'KeyS') {
		sKeyDown = false;
		boards[0].acceleration = 1;
	} else if (event.code == 'ArrowDown') {
		arrowDownKeyDown = false;
		boards[1].acceleration = 1;
	} else if (event.code == 'ArrowUp') {
		arrowUpKeyDown = false;
		boards[1].acceleration = 1;
	}
});

class Board {
	constructor(id, x, y, width, height, mass, speed, acceleration, color) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.mass = mass;
		this.speed = speed;
		this.acceleration = acceleration;
		this.color = color;
		this.velocity = {
			x: Math.random() - 0.5,
			y: Math.random() - 0.5
		}
		this.numberOfWins = 0;
	}

	Update() {
		this.Draw();
	}

	Draw() {
		ctx.beginPath();
		ctx.save();
		ctx.shadowBlur = 30;
		ctx.shadowColor = this.color;
		ctx.strokeStyle = this.color;
		ctx.setLineDash([10, 10]);
		ctx.arc(this.x, this.y + this.height / 2, 100, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.restore();
		ctx.closePath();

		ctx.beginPath();
		ctx.save();
		ctx.shadowBlur = 30;
		ctx.shadowColor = this.color;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.restore();
		ctx.closePath();
	}
}

class Ball {
	constructor(id, x, y, radius, mass, speed, acceleration, color, isboard) {
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
		}
	}

	Update(balls) {
		this.Draw();

		// Проверка на столкновение мяча с левой доской
		if (this.x - this.radius <= boards[0].x + boards[0].width && this.y >= boards[0].y && this.y <= boards[0].y + boards[0].height) {
			this.velocity.y *= 1;
			this.velocity.x *= -1;
		}

		// Проверка на столкновение мяча с правой доской
		if (this.x + this.radius >= boards[1].x && this.y >= boards[1].y && this.y <= boards[1].y + boards[1].height) {
			this.velocity.y *= 1;
			this.velocity.x *= -1;
		}

		// Увеличиваем счетчики побед игроков, если противник не смог отразить мяч
		if (this.x + this.radius <= 0) {
			boards[1].numberOfWins++;
		} else if (this.x - this.radius >= innerWidth) {
			boards[0].numberOfWins++;
		}

		// Удаляем объект если он вышел за левый и правый край
		if (this.x + this.radius <= 0 || this.x - this.radius >= innerWidth) {
			for (let i = 0; i < balls.length; i++) {
				if (balls[i].id == this.id) {
					balls.splice(i, 1);
					for (let j = 0; j < balls.length; j++) {
						balls[j].id = j;
					}
					break;
				}
			}
			return;
		}

		// Обнаружение столкновений мяча с другими мячами
		for (let i = 0; i < balls.length; i++) {
			if (this === balls[i]) continue;
			if (getDistance(this.x, this.y, balls[i].x, balls[i].y) - this.radius - balls[i].radius < 0) {
				resolveCollision(this, balls[i]);
			}
		}

		// Блокировка верхнего и нижнего края
		if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
			this.velocity.y = -this.velocity.y;
		}

		// Блокировкая левого края
		// if (this.x - this.radius < 0) {
		// 	this.velocity.x = -this.velocity.x;
		// }

		// Блокировкая правого края
		// if (this.x + this.radius > innerWidth) {
		// 	this.velocity.x = -this.velocity.x;
		// }

		// Передвигаем мяч по вектору движения
		this.x += this.velocity.x * this.speed;
		this.y += this.velocity.y * this.speed;
		this.speed += this.acceleration;
	}

	Draw() {
		// Прорисовка внутреннего круга мяча
		ctx.beginPath();
		ctx.save();
		ctx.shadowBlur = 30;
		ctx.shadowColor = this.color;
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.radius - this.radius / 2, Math.PI * 2, false);
		ctx.fill();
		ctx.restore();
		ctx.closePath();

		// Прорисовка внешнего круга мяча
		ctx.beginPath();
		ctx.save();
		ctx.shadowBlur = 30;
		ctx.shadowColor = this.color;
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
		ctx.arc(this.x, this.y, this.radius - this.radius / 4, Math.PI * 2, false);
		ctx.fill('evenodd');
		ctx.restore();
		ctx.closePath();

		// Прорисвока вектора скорости
		ctx.beginPath();
		ctx.save();
		ctx.font = "10pt Courier New";
		ctx.shadowBlur = 15;
		ctx.shadowColor = this.color;
		ctx.fillStyle = this.color;
		ctx.fillText('vx:' + +this.velocity.x.toFixed(2), this.x + 20, this.y);
		ctx.fillText('vy:' + +this.velocity.y.toFixed(2), this.x + 20, this.y + 20);
		ctx.restore();
		ctx.closePath();

		// Прорисвока координат
		ctx.beginPath();
		ctx.save();
		ctx.font = "10pt Courier New";
		ctx.shadowBlur = 15;
		ctx.shadowColor = this.color;
		ctx.fillStyle = this.color;
		ctx.fillText('x:' + +this.x.toFixed(2), this.x + 20, this.y + 40);
		ctx.fillText('y:' + +this.y.toFixed(2), this.x + 20, this.y + 60);
		ctx.restore();
		ctx.closePath();
	}
}

// Вывод результата игроков
function drawResult() {
	for (let i = 0; i < boards.length; i++) {
		ctx.beginPath();
		ctx.save();
		ctx.font = "bold 60pt Courier New";
		ctx.shadowBlur = 15;
		if (boards[i].id == 0) {
			ctx.fillStyle = boards[i].color;
			ctx.shadowColor = boards[i].color;
			ctx.fillText(boards[i].numberOfWins, canvas.width / 2 - ctx.measureText(boards[i].numberOfWins).width - 100, canvas.height / 2);
		} else {
			ctx.fillStyle = boards[i].color;
			ctx.shadowColor = boards[i].color;
			ctx.fillText(boards[i].numberOfWins, canvas.width / 2 + 100, canvas.height / 2);
		}
		ctx.restore();
		ctx.closePath();
	}
}

function drawMiddleLine() {
			ctx.beginPath();
			ctx.save();
			ctx.beginPath();
			ctx.lineCap = 'round';
			ctx.setLineDash([10, 10]);
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.strokeStyle = 'gray';
			ctx.stroke();
			ctx.restore();
			ctx.closePath();
}

// Прорисовка линий между доской и мячом
function drawLineBetweenBoardAndBall() {
	for (let i = 0; i < boards.length; i++) {
		for (let j = 0; j < balls.length; j++) {
			ctx.beginPath();
			ctx.save();
			let gradient = ctx.createLinearGradient(boards[i].x, boards[i].y, balls[j].x, balls[j].y);
			gradient.addColorStop(0, boards[i].color);
			gradient.addColorStop(1, balls[j].color);
			ctx.beginPath();
			ctx.lineCap = 'round';
			ctx.setLineDash([1, 10]);
			ctx.moveTo(boards[i].x, boards[i].y + boards[i].height / 2);
			ctx.lineTo(balls[j].x, balls[j].y);
			ctx.strokeStyle = gradient;
			ctx.stroke();
			ctx.restore();
			ctx.closePath();
		}
	}
}

// Прорисовка линий мячиками
function drawLinesBetweenBalls() {
	for (let i = 0; i < balls.length; i++) {
		for (let j = 0; j < balls.length; j++) {
			if (i == j) continue;
			if (i < j) {
				ctx.beginPath();
				ctx.save();
				let gradient = ctx.createLinearGradient(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
				gradient.addColorStop(0, balls[i].color);
				gradient.addColorStop(1, balls[j].color);
				ctx.beginPath();
				ctx.lineCap = 'round';
				ctx.setLineDash([1, 10]);
				ctx.moveTo(balls[i].x, balls[i].y);
				ctx.lineTo(balls[j].x, balls[j].y);
				ctx.strokeStyle = gradient;
				ctx.stroke();
				ctx.restore();
				ctx.closePath();
			}
		}
	}
}

// Прорисовка максимальной скорости
function drawMaxSpeed() {
	ctx.beginPath();
	ctx.save();
	ctx.font = "30pt Courier New";
	ctx.shadowBlur = 15;
	ctx.shadowColor = '#00E8FF';
	ctx.fillStyle = '#00E8FF';
	ctx.fillText('Max Speed: ' + maxSpeed, canvas.width / 2 - ctx.measureText('Max Speed: ' + maxSpeed).width / 2, 100);
	ctx.restore();
	ctx.closePath();
}

// Прорисовка скорости мяча
function drawBallSpeed() {
	ctx.beginPath();
	ctx.save();
	ctx.font = "30pt Courier New";
	ctx.shadowBlur = 15;
	ctx.shadowColor = '#FF7400';
	ctx.fillStyle = '#FF7400';
	ctx.fillText('Speed: ' + balls[0].speed.toFixed(1), canvas.width / 2 - ctx.measureText('Speed: ' + balls[0].speed.toFixed(1)).width / 2, canvas.height / 2 - 200);
	ctx.restore();
	ctx.closePath();
	if (+balls[0].speed.toFixed(1) > maxSpeed) {
		maxSpeed = +balls[0].speed.toFixed(0);
	}
}

// Прорисовка таймера
function drawTimer() {
	ctx.beginPath();
	ctx.save();
	ctx.font = "30pt Courier New";
	ctx.shadowBlur = 15;
	if (timer > 10) {
		ctx.shadowColor = '#58FF4D';
		ctx.fillStyle = '#58FF4D';
	} else if (timer > 5) {
		ctx.shadowColor = '#E8AB02';
		ctx.fillStyle = '#E8AB02';
	} else {
		ctx.shadowColor = '#F50338';
		ctx.fillStyle = '#F50338'
	}
	ctx.fillText('Timer: ' + timer, canvas.width / 2 - ctx.measureText('Timer: ' + timer).width / 2, canvas.height - 100);
	ctx.restore();
	ctx.closePath();
}

// Начальная инициализация объектов
function init() {
	pushBoards();

	pushBalls(numberOfBalls);
}

init();

// Добавление досок
function pushBoards() {
	for (let i = 0; i < 2; i++) {
		let width = 10;
		let height = 200;
		let color = boardColors[i];
		let mass = 1;
		let speed = 0;
		let acceleration = 0.1;
		let x = (i == 0) ? 0 : canvas.width - width;
		let y = canvas.height / 2;

		boards.push(new Board(i, x, y, width, height, mass, speed, acceleration, color));
	}
}

// Добавление мячей
function pushBalls(numberOfBalls) {
	if (balls.length < limitation) {
		let lastBallsLength = balls.length;
		for (let i = lastBallsLength; i < lastBallsLength + numberOfBalls; i++) {
			let radius = 15;
			let color = randomColor();
			let mass = 1;
			let speed = 20;
			let acceleration = 0.02;
			let x = randomIntFromRange(canvas.width / 2 - 40, canvas.width / 2 + 40);
			let y = randomIntFromRange(radius, canvas.height - radius);

			for (let j = 0; j < balls.length; j++) {
				if (getDistance(x, y, balls[j].x, balls[j].y) - radius * 2 < 0) {
					x = randomIntFromRange(radius, canvas.width - radius);
					y = randomIntFromRange(radius, canvas.height - radius);

					j = -1;
				}
			}

			balls.push(new Ball(i, x, y, radius, mass, speed, acceleration, color));
		}

		// balls.push(new Ball(0, canvas.width / 2, canvas.height / 2, 15, 1, 8, 0.1, 'lightgreen'));
		// balls[0].velocity.x = 0;
		// balls[0].velocity.y = 1;
	}
}

// Изменение вектора движения всех мячиков
function redirectAllBalls() {
	for (let i = 0; i < balls.length; i++) {
		balls[i].velocity.x = Math.random() - 0.5;
		balls[i].velocity.y = Math.random() - 0.5;
	}
}

function animate() {
	animationId = requestAnimationFrame(animate);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (balls.length <= 0) {
		pushBalls(numberOfBalls);
	}

	for (let i = 0; i < boards.length; i++) {
		boards[i].Update();
	}

	for (let i = 0; i < balls.length; i++) {
		balls[i].Update(balls);
	}

	drawResult()
	drawLineBetweenBoardAndBall();
	drawLinesBetweenBalls();
	if (balls.length == 1) {
		drawBallSpeed();
	}
	drawMaxSpeed();
	drawMiddleLine();
	drawTimer()

	if (sKeyDown) {
		boards[0].y += 5 + boards[0].acceleration;
		boards[0].acceleration += 0.5;
		if (boards[0].y > canvas.height - boards[0].height) {
			boards[0].y = canvas.height - boards[0].height;
		}
	} else if (wKeyDown) {
		boards[0].y -= 5 - boards[0].acceleration;
		boards[0].acceleration -= 0.5;
		if (boards[0].y < 0) {
			boards[0].y = 0;
		}
	}

	if (arrowDownKeyDown) {
		boards[1].y += 5 + boards[1].acceleration;
		boards[1].acceleration += 0.5;
		if (boards[1].y > canvas.height - boards[1].height) {
			boards[1].y = canvas.height - boards[1].height;
		}
	} else if (arrowUpKeyDown) {
		boards[1].y -= 5 - boards[1].acceleration;
		boards[1].acceleration -= 0.5;
		if (boards[1].y < 0) {
			boards[1].y = 0;
		}
	}
}

animate();

setInterval(function (argument) {
	timer--;
	if (timer < 0) {
		redirectAllBalls();
		timer = 45;
	}
}, 1000);

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

function resolveCollision(Ball, otherBall) {
	const xVelocityDiff = Ball.velocity.x - otherBall.velocity.x;
	const yVelocityDiff = Ball.velocity.y - otherBall.velocity.y;

	const xDist = otherBall.x - Ball.x;
	const yDist = otherBall.y - Ball.y;

	// Prevent accidental overlap of balls
	if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
		// Grab angle between the two colliding balls
		const angle = -Math.atan2(otherBall.y - Ball.y, otherBall.x - Ball.x);

		// Store mass in var for better readability in collision equation
		const m1 = Ball.mass;
		const m2 = otherBall.mass;

		// Velocity before equation
		const u1 = rotate(Ball.velocity, angle);
		const u2 = rotate(otherBall.velocity, angle);

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

		// Swap Ball velocities for realistic bounce effect
		Ball.velocity.x = vFinal1.x;
		Ball.velocity.y = vFinal1.y;

		otherBall.velocity.x = vFinal2.x;
		otherBall.velocity.y = vFinal2.y;
	}
}