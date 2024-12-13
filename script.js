//* Get the canvas HTML element
const canvas = document.getElementById("gameCanvas");

//* Specify width and height of canvas
canvas.width = 400;
canvas.height = 400;

//* Variable to check if the player can jump
let canJump = true;

//* Start working with canvas
const ctx = canvas.getContext("2d");
//* color of canvas
ctx.fillStyle = "rgb(120, 120, 120)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

class Player {
  constructor(w, h, xSpeed, ySpeed, xPos, yPos) {
    this.w = w;
    this.h = h;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.xPos = xPos;
    this.yPos = yPos;
  }

  //* Draw the player
  update() {
    this.xPos += this.xSpeed;
    this.yPos += this.ySpeed;
    if (this.xPos < 0) {
      this.xPos = 0;
    }
    if (this.xPos + this.w > canvas.width) {
      this.xPos = canvas.width - this.w;
    }
    if (this.yPos < 0) {
      this.yPos = 0;
      this.ySpeed = 0;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(this.xPos, this.yPos, this.w, this.h);
  }

  //* Getters and Setters
  setXSpeed(s) {
    this.xSpeed = s;
  }

  setYSpeed(s) {
    this.ySpeed = s;
  }

  getYSpeed() {
    return this.ySpeed;
  }

  setYPos(yPos) {
    this.yPos = yPos;
  }
}

//* Create the main player
const mainPlayer = new Player(
  20,
  20,
  0,
  0,
  canvas.width / 2,
  canvas.height / 2
);

//! Define map
// 1's = platforms, 0's = empty space
let map = ranMap(10, 10);

//* Function to generate a random map
function ranMap(width, height) {
  const map = [];
  for (let i = 0; i < height; i++) {
    map.push([]);
    const goalNum = Math.floor(Math.random() * width);
    for (let j = 0; j < width; j++) {
      if (i === height - 1) map[i].push(1);
      else if (i === height - 2) map[i].push(0);
      else if (i === 0 && j === goalNum) map[i].push(2);
      else map[i].push(ranNum());
    }
  }
  mainPlayer.yPos = canvas.height - mainPlayer.h - 40;
  return map;
}

//* Function to generate a random number
function ranNum() {
  const f = 0.2; // The frequency of platforms
  const num = Math.random();

  if (num < f) return 1;
  else return 0;
}

//* Function to draw the map, it loops through the map array and draws the tile based on what the value is
function drawMap() {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === 1) {
        ctx.fillStyle = "rgb(48, 48, 48)";
        ctx.fillRect(j * 40, i * 40, 40, 40);
      } else if (map[i][j] === 2) {
        ctx.fillStyle = "rgb(0, 255, 64)";
        ctx.fillRect(j * 40, i * 40, 40, 40);
      } else {
        ctx.fillStyle = "rgb(120, 120, 180)";
        ctx.fillRect(j * 40, i * 40, 40, 40);
      }
    }
  }
}

//* Function to detect collision between player and platform and handle it
function collisionDetection() {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const platform = map[i][j];
      if (platform === 1) {
        // Calculate the position of the platform and store width
        const platformX = j * 40;
        const platformY = i * 40;
        const platformWidth = 40;
        const platformHeight = 40;

        // Check for collision
        if (
          mainPlayer.xPos < platformX + platformWidth &&
          mainPlayer.xPos + mainPlayer.w > platformX &&
          mainPlayer.yPos < platformY + platformHeight &&
          mainPlayer.yPos + mainPlayer.h > platformY
        ) {
          // Calculate the overlap between player and platform
          const overlapX =
            Math.min(
              mainPlayer.xPos + mainPlayer.w,
              platformX + platformWidth
            ) - Math.max(mainPlayer.xPos, platformX);
          const overlapY =
            Math.min(
              mainPlayer.yPos + mainPlayer.h,
              platformY + platformHeight
            ) - Math.max(mainPlayer.yPos, platformY);

          if (overlapX < overlapY) {
            // Horizontal collision
            if (mainPlayer.xPos < platformX) {
              mainPlayer.xPos = platformX - mainPlayer.w; // Colliding from the left
            } else {
              mainPlayer.xPos = platformX + platformWidth; // Colliding from the right
            }
            mainPlayer.xSpeed = 0;
          } else {
            // Vertical collision
            if (mainPlayer.yPos < platformY && mainPlayer.ySpeed > 0) {
              mainPlayer.yPos = platformY - mainPlayer.h; // Colliding from above
              mainPlayer.ySpeed = 0;
              canJump = true;
            } else if (mainPlayer.yPos > platformY) {
              mainPlayer.yPos = platformY + platformHeight; // Colliding from below
              mainPlayer.ySpeed = 0;
            }
          }
        }
      } else if (platform === 2) {
        // Check if the player has reached the goal
        if (
          mainPlayer.xPos < j * 40 + 40 &&
          mainPlayer.xPos + mainPlayer.w > j * 40 &&
          mainPlayer.yPos < i * 40 + 40 &&
          mainPlayer.yPos + mainPlayer.h > i * 40
        ) {
          // Generate a new map
          map = ranMap(10, 10);
        }
      }
    }
  }
}

//* Function to update the game state
function updateGame() {
  // Check if the player is on the ground
  if (mainPlayer.yPos + mainPlayer.h > canvas.height) {
    mainPlayer.setYPos(canvas.height - mainPlayer.h);
    canJump = true;
    mainPlayer.setYSpeed(0);
  } else if (mainPlayer.yPos != canvas.height - mainPlayer.h) {
    mainPlayer.setYSpeed(mainPlayer.getYSpeed() + gravity); // Gravity
  }
  // Call the collision detection function
  collisionDetection();
  // Update the player
  mainPlayer.update();
}

//* Function to render the game
function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  drawMap();
  mainPlayer.update();
  requestAnimationFrame(renderGame);
}

//* Add event listeners to listen for arrow movements
let canGenMap = true;

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (canJump && mainPlayer.yPos > 0) {
        mainPlayer.setYSpeed(-4);
        canJump = false;
      }
      break;
    case "ArrowLeft":
      mainPlayer.setXSpeed(-2.2);
      break;
    case "ArrowRight":
      mainPlayer.setXSpeed(2.2);
      break;
    case "Enter":
      if (canGenMap) {
        map = ranMap(10, 10);
        canGenMap = false;
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      mainPlayer.setXSpeed(0);
      if (mainPlayer.xPos < 0) {
        mainPlayer.xPos = 0;
      }
      break;
    case "ArrowRight":
      mainPlayer.setXSpeed(0);
      break;
    case "Enter":
      canGenMap = true;
      break;
  }
});

//! Start main loop
const gravity = 0.13;
setInterval(updateGame, 1000 / 60); // Update game logic at 60 FPS
requestAnimationFrame(renderGame); // Start rendering
