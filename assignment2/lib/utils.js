function pushMatrix(stack, m) {
  var copy = mat4.create(m);
  stack.push(copy);
}

function popMatrix(stack) {
  if (stack.length > 0) return stack.pop();
  else console.log("stack has no matrix to pop!");
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function normalizeColor(colors) {
  return colors.map((color) => color / 255);
}

class Rotation {
  constructor() {
    this.isDragging = false;
    this.degreeX = 0;
    this.degreeY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
  }
}

class ShaderProgram {
  constructor() {
    this.program;
    this.aPositionLocation;
    this.aNormalLocation;
    this.uMMatrixLocation;
    this.uVMatrixLocation;
    this.uPMatrixLocation;
    this.uColorLocation;
    this.uLightLocation;
  }
}
