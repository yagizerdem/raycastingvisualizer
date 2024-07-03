const PLAYER = new Player({ x: 50, y: 50 });

ALLENEMY.push(new Enemy({ x: 100, y: 50 }));

window.onload = () => {
  CANVAS = document.getElementById("canvas");
  CONTEXT = CANVAS.getContext("2d");

  window.onkeydown = ({ key }) => {
    switch (key) {
      case "ArrowRight":
        PLAYER.spinDirection = 1;
        break;
      case "ArrowLeft":
        PLAYER.spinDirection = -1;
        break;
      case "ArrowUp":
        PLAYER.speed = Player.baseSpeed;
        PLAYER.coefficients.x = 1;
        PLAYER.coefficients.y = 1;
        break;
      case "ArrowDown":
        PLAYER.speed = Player.baseSpeed / 2;
        PLAYER.coefficients.x = -1;
        PLAYER.coefficients.y = -1;
        break;
    }
  };
  window.onkeyup = ({ key }) => {
    switch (key) {
      case "ArrowRight":
        PLAYER.spinDirection = 0;
        break;
      case "ArrowLeft":
        PLAYER.spinDirection = 0;
        break;
      case "ArrowUp":
        PLAYER.coefficients.x = 0;
        PLAYER.coefficients.y = 0;
      case "ArrowDown":
        PLAYER.coefficients.x = 0;
        PLAYER.coefficients.y = 0;
        break;
    }
  };
  MONSTERIMAGE = document.getElementById("texture");
  loop = setInterval(main, 1000 / fps);
};

function main() {
  update();
  draw();
  clearFix();
}

function renderMap2d() {
  for (let row = 0; row < MAPSIZE; row++) {
    for (let col = 0; col < MAPSIZE; col++) {
      if (MAP[row][col] == 1) {
        CONTEXT.fillStyle = "red";
        CONTEXT.fillRect(col * WALLSIZE, row * WALLSIZE, WALLSIZE, WALLSIZE);
        CONTEXT.fill();
      }
    }
  }
}

function draw() {
  // backgorund
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
  CANVAS.style.backgoroundColor = "black";
  // map
  CONTEXT.fillStyle = "white";
  CONTEXT.fillRect(OFFSETX, OFFSETY, WIDTH, HEIGHT);
  CONTEXT.fill();

  renderMap2d();

  rayCast();
  PLAYER.draw();
  // palyer direction vector
  PLAYER.drawDirectionVector();

  for (var enemy of ALLENEMY) {
    enemy.draw();

    CONTEXT.lineWidth = 2;
    CONTEXT.strokeStyle = "red";
    CONTEXT.beginPath();
    CONTEXT.moveTo(enemy.x, enemy.y); // Move to the starting point
    CONTEXT.lineTo(PLAYER.x, PLAYER.y); // Draw a line to the ending point
    CONTEXT.stroke();
  }

  printFps();
}
function update() {
  calcFps();

  PLAYER.spin();
  const { flag, rowIndex, colIndex } = PLAYER.checkWall();
  if (flag) {
    if (!(PLAYER.coefficients.x == -1 || PLAYER.coefficients.y == -1)) {
      const playerRowIndex = Math.floor(PLAYER.y / WALLSIZE);
      const playerColIndex = Math.floor(PLAYER.x / WALLSIZE);
      if (rowIndex != playerRowIndex) {
        PLAYER.coefficients.x = 1;
        PLAYER.coefficients.y = 0;
      } else if (colIndex != playerColIndex) {
        PLAYER.coefficients.x = 0;
        PLAYER.coefficients.y = 1;
      }

      PLAYER.move();
    }
  } else {
    PLAYER.isSliding = false;
    PLAYER.move();
  }

  for (let enemy of ALLENEMY) {
    enemy.move();
  }
}

function calcFps() {
  prevCycleTime = currentCycleTime;
  currentCycleTime = Date.now();
  counter++;
  if (counter == 60) {
    fps = Math.floor(1000 / (currentCycleTime - prevCycleTime));
    counter = 0;
  }
}

function printFps() {
  const fontSize = 20; // Font size
  const font = `${fontSize}px Arial`; // Font size and family

  CONTEXT.fillStyle = "green"; // Text color
  CONTEXT.textAlign = "left"; // Text alignment
  CONTEXT.textBaseline = "middle"; // Text baseline
  CONTEXT.font = font; // Font size
  CONTEXT.fillText(`fps rate : ${fps}`, 10, 10);
}

function rayCast() {
  let rayAngle = PLAYER.angle - HALFFOV;
  for (let i = 0; i < WIDTH; i++) {
    let ray = {
      x: PLAYER.x,
      y: PLAYER.y,
    };

    let rayCos = Math.cos(rayAngle) / PRECISION;
    let raySin = Math.sin(rayAngle) / PRECISION;
    let target = 0;
    while (target == 0) {
      ray.x += rayCos;
      ray.y += raySin;
      // walls
      target = MAP[Math.floor(ray.y / WALLSIZE)][Math.floor(ray.x / WALLSIZE)];
      // enemy
      for (let enemy of ALLENEMY) {
        const diff = Math.hypot(ray.x - enemy.x, ray.y - enemy.y);
        if (diff <= enemy.radius) target = enemy;
      }
    }
    let distance = Math.sqrt(
      Math.pow(PLAYER.x - ray.x, 2) + Math.pow(PLAYER.y - ray.y, 2)
    );
    distance = distance * Math.cos(rayAngle - PLAYER.angle);
    // console.log(distance);
    rayAngle += FOV / WIDTH;

    // draw rays
    drawLine(PLAYER.x, PLAYER.y, ray.x, ray.y, "blue");

    let wallHeight = Math.floor(HEIGHT / 2 / distance) + 50;
    // draw outside
    drawLine(
      i + OFFSETX,
      0 + OFFSETY,
      i + OFFSETX,
      HEIGHT / 2 - wallHeight + OFFSETY,
      "cyan"
    );
    // draw walls
    if (target == 1) {
      drawLine(
        i + OFFSETX,
        HEIGHT / 2 - wallHeight + OFFSETY,
        i + OFFSETX,
        HEIGHT / 2 + wallHeight + OFFSETY,
        "red"
      );
    }

    if (target instanceof Enemy && !target.istracking) {
      target.istracking = true;
      target.startx = OFFSETX + i;
      target.starty = HEIGHT / 2 - wallHeight + OFFSETY;
      target.height = 2 * wallHeight;
      target.imageDraw = true;
      // target.imageDraw = true;
      // const x = ;

      // CONTEXT.drawImage(
      //   MONSTERIMAGE,
      //   x,
      //   HEIGHT / 2 - wallHeight + OFFSETY,
      //   wallHeight,
      //   height
      // );
    }
    if (target instanceof Enemy && target.istracking) {
      target.width++;
    }

    // draw floor
    drawLine(
      i + OFFSETX,
      HEIGHT / 2 + wallHeight + OFFSETY,
      i + OFFSETX,
      HEIGHT + OFFSETY,
      "green"
    );
  }
}
function drawLine(x1, y1, x2, y2, cssColor) {
  CONTEXT.strokeStyle = cssColor;
  CONTEXT.beginPath();
  CONTEXT.moveTo(x1, y1);
  CONTEXT.lineTo(x2, y2);
  CONTEXT.stroke();
}
function clearFix() {
  for (var e of ALLENEMY) {
    if (e.imageDraw) {
      CONTEXT.drawImage(MONSTERIMAGE, e.startx, e.starty, e.width, e.height);
    }
  }
  for (var enemy of ALLENEMY) {
    enemy.istracking = false;
    enemy.imageDraw = false;
    enemy.width = 0;
    enemy.height = 0;
    enemy.startx = 0;
    enemy.starty = 0;
  }
  // draw eney
}
