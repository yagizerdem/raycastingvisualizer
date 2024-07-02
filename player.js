class Player {
  static baseSpeed = WALLSIZE / 360 / 3;
  constructor({ x, y }) {
    if (!Player.instance) {
      Player.instance = this;
    } else {
      return Player.instance;
    }

    WALLSIZE / fps / 6;
    this.angle = 0; // radion

    this.x = x;
    this.y = y;
    this.coefficients = {
      x: 0,
      y: 0,
    };
    this.speed = Player.baseSpeed;
    this.spinDirection = 0;
    this.isSliding = false;
  }
  draw() {
    CONTEXT.fillStyle = "blue";
    CONTEXT.beginPath();
    CONTEXT.arc(this.x, this.y, 10, 0, 2 * Math.PI); // Arc parameters (x, y, radius, startAngle, endAngle)
    CONTEXT.fill();
    CONTEXT.closePath();
  }

  drawDirectionVector() {
    const endx = this.x + Math.cos(this.angle) * 40;
    const endy = this.y + Math.sin(this.angle) * 40;
    CONTEXT.beginPath();
    CONTEXT.moveTo(this.x, this.y); // Move to the starting point
    CONTEXT.lineTo(endx, endy); // Draw a line to the ending point
    CONTEXT.lineWidth = 2; // Set the line width
    CONTEXT.strokeStyle = "green"; // Set the line color
    CONTEXT.stroke(); // Stroke the line
  }
  move() {
    const deltaTime = currentCycleTime - prevCycleTime;
    const dx =
      Math.cos(this.angle) * this.speed * deltaTime * this.coefficients.x;
    const dy =
      Math.sin(this.angle) * this.speed * deltaTime * this.coefficients.y;
    this.x += dx;
    this.y += dy;
  }
  spin() {
    if (!this.spinDirection) return;
    this.angle += (Math.PI / 180) * this.spinDirection * 2;
  }
  checkWall() {
    const deltaTime = currentCycleTime - prevCycleTime;
    const dx =
      Math.cos(this.angle) * this.speed * deltaTime * this.coefficients.x;
    const dy =
      Math.sin(this.angle) * this.speed * deltaTime * this.coefficients.y;
    const rowIndex = Math.floor((this.y + dy) / WALLSIZE);
    const colIndex = Math.floor((this.x + dx) / WALLSIZE);
    var flag = MAP[rowIndex][colIndex] == 1 ? true : false;

    return { flag, rowIndex, colIndex };
  }
}
