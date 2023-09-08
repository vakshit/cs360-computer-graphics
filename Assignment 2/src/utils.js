window.vertexShaderCode = `#version 300 es
in vec3 aPosition;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;

void main() {
  mat4 projectionModelView;
  projectionModelView=uPMatrix*uVMatrix*uMMatrix;
  gl_Position = projectionModelView*vec4(aPosition,1.0);
  gl_PointSize=3.0;
}`;

window.fragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec4 objColor;

void main() {
  fragColor = objColor;
}`;

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

function eventListeners(canvas) {
  let isDragging = false;
  let lastX = 0;
  let rotationMatrix = mat4.create();
  mat4.identity(rotationMatrix);

  // Mouse event listeners
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.clientX;
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const newX = e.clientX;
    const deltaX = newX - lastX;

    // Rotate the object based on mouse movement
    const rotationAngle = deltaX * 0.01; // Adjust the rotation speed as needed
    mat4.rotateY(rotationMatrix, rotationMatrix, rotationAngle);

    // Render the object with the new rotation
    render();

    lastX = newX;
  });
}
