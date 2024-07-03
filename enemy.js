class Enemy {
  static baseRadius = 5;
  static baseSpeed = 0.1;
  constructor({ x, y }) {
    this.x = x;
    this.y = y;
    this.radius = Enemy.baseRadius;
    this.imageDraw = false;

    this.starty = 0;
    this.startx = 0;
    this.width = 0;
    this.height = 0;
    this.istracking = false;
    this.targetVertex = null;
    this.speed = Enemy.baseSpeed;
    this.targetRadius = 50 + Math.random() * 50;
  }
  draw() {
    CONTEXT.fillStyle = "purple";
    CONTEXT.beginPath();
    CONTEXT.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); // Arc parameters (x, y, radius, startAngle, endAngle)
    CONTEXT.fill();
    CONTEXT.closePath();

    this.drawRadius();
  }
  pathFiniding() {
    const start = {
      row: Math.floor(this.y / WALLSIZE),
      col: Math.floor(this.x / WALLSIZE),
    };
    const dest = {
      row: Math.floor(PLAYER.y / WALLSIZE),
      col: Math.floor(PLAYER.x / WALLSIZE),
    };
    const adjacencyMatrix = [];
    for (let i = 0; i < MAP.length; i++) {
      const row = [];
      for (let j = 0; j < MAP[0].length; j++) {
        if (MAP[i][j] == 0) {
          row[j] = new Vertex({
            row: i,
            col: j,
            distance: Infinity,
            parent: null,
          });
        } else {
          row[j] = null;
        }
      }
      adjacencyMatrix.push(row);
    }
    var step = 0;
    const startVertex = adjacencyMatrix[start.row]?.[start.col];
    if (!startVertex) return null;
    const queue = new Queue();
    queue.enQueue(startVertex);
    startVertex.distance = step;
    var destVertex = null;
    while (queue.size() != 0) {
      var vertexParent = queue.deQueue();
      if (vertexParent.row == dest.row && vertexParent.col == dest.col) {
        destVertex = vertexParent;
        break;
      }

      var vertexLeft =
        adjacencyMatrix[vertexParent.row]?.[vertexParent.col - 1];
      var vertexRight =
        adjacencyMatrix[vertexParent.row]?.[vertexParent.col + 1];
      var vertexTop = adjacencyMatrix[vertexParent.row - 1]?.[vertexParent.col];
      var vertexBottom =
        adjacencyMatrix[vertexParent.row + 1]?.[vertexParent.col];
      this.visit(vertexLeft, vertexParent, step + 1, queue);
      this.visit(vertexRight, vertexParent, step + 1, queue);
      this.visit(vertexTop, vertexParent, step + 1, queue);
      this.visit(vertexBottom, vertexParent, step + 1, queue);
      step++;
    }

    // consturc array
    var arr = [];
    var terminal = destVertex;
    while (terminal) {
      arr.push(terminal);
      terminal = terminal.parent;
    }
    const targetVertes = arr[arr.length - 2];
    return targetVertes;
  }
  visit(v1, v2, step, queue) {
    if (!v1 || !v2) return;
    if (v2.distance < v1.distance) {
      v1.parent = v2;
      v1.distance = step;
      queue.enQueue(v1);
    }
  }
  move() {
    this.targetVertex = this.pathFiniding();
    if (!this.targetVertex) return;
    if (this.isInRadius()) {
      console.log(this.canShoot());
      return;
      if (this.canShoot()) return;
    }

    const deltaTime = currentCycleTime - prevCycleTime;
    // move
    if (Math.floor(this.x / WALLSIZE) != this.targetVertex.col) {
      // make horizontal move
      if (this.targetVertex.col < Math.floor(this.x / WALLSIZE)) {
        this.x -= (WALLSIZE / 30) * deltaTime * this.speed;
      } else {
        this.x += (WALLSIZE / 30) * deltaTime * this.speed;
      }
    }
    if (Math.floor(this.y / WALLSIZE) != this.targetVertex.row) {
      if (this.targetVertex.row < Math.floor(this.y / WALLSIZE)) {
        this.y -= (WALLSIZE / 30) * deltaTime * this.speed;
      } else {
        this.y += (WALLSIZE / 30) * deltaTime * this.speed;
      }
    }
  }
  drawRadius() {
    CONTEXT.lineWidth = 1;
    CONTEXT.strokeStyle = "white";
    CONTEXT.beginPath();
    CONTEXT.arc(this.x, this.y, this.targetRadius, 0, 2 * Math.PI); // Full circle (360 degrees)
    CONTEXT.stroke();
  }
  isInRadius() {
    const diffx = PLAYER.x - this.x;
    const diffy = PLAYER.y - this.y;
    const hypot = Math.hypot(diffx, diffy);
    return hypot <= this.targetRadius;
  }
  canShoot() {
    var startx = this.x;
    var starty = this.y;
    var step = 0.01;
    while (Math.abs(startx - PLAYER.x) > 2) {
      console.log(
        MAP[Math.floor(startx / WALLSIZE)][Math.floor(starty / WALLSIZE)]
      );
      if (
        MAP[Math.floor(startx / WALLSIZE)][Math.floor(starty / WALLSIZE)] == 1
      )
        return false;
      startx += step;
      starty += step;
    }
    return true;
  }
}
