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

window.vertexShaderCode_flat = `#version 300 es
in vec3 aPosition;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform mat4 uVMatrix;
out vec3 posInEyeSpace;
out mat4 Vmatrix;

void main() {
  Vmatrix = uVMatrix;
  mat4 projectionModelView;
  mat4 m1;
	m1 = uVMatrix * uMMatrix;
	projectionModelView = uPMatrix * m1;
  gl_Position = projectionModelView * vec4(aPosition,1.0);
  gl_PointSize=5.0;
  
  posInEyeSpace = vec3(m1 * vec4(aPosition,1.0));
}`;

// Fragment shader code
window.fragShaderCode_flat = `#version 300 es
precision mediump float;
out vec4 fragColor;
in mat4 Vmatrix;
in vec3 posInEyeSpace;
uniform vec4 objColor;
uniform vec3 lightLocation;

void main() {
  vec3 normal=normalize(cross(dFdx(posInEyeSpace),dFdy(posInEyeSpace)));
  vec3 L=normalize(vec3(Vmatrix*vec4(lightLocation,1.0))-posInEyeSpace);
  vec3 R=normalize(-reflect(L,normal));
  vec3 V=normalize(-posInEyeSpace);
  
  float cos_theta=max(dot(normal,L),0.0);
  vec3 ldiff=cos_theta*vec3(objColor);
  float cos_phi=max(dot(V,R),0.0);
  vec3 lspec=((pow(cos_phi,10.0))*vec3(0.3,0.3,0.3))*(vec3(objColor));
  vec3 lamb=0.4*(vec3(objColor));
  fragColor=vec4(ldiff+lamb+lspec,1.0);
}`;

window.vertexShaderCode_gauraud = `#version 300 es
in vec3 aPosition;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform mat4 uVMatrix;
out vec3 posInEyeSpace;
out mat4 Vmatrix;

void main() {
  Vmatrix = uVMatrix;
  mat4 projectionModelView;
  mat4 m1;
	m1 = uVMatrix * uMMatrix;
	projectionModelView = uPMatrix * m1;
  gl_Position = projectionModelView * vec4(aPosition,1.0);
  gl_PointSize=5.0;
  
  posInEyeSpace = vec3(m1 * vec4(aPosition,1.0));
}`;

// Fragment shader code
window.fragShaderCode_gauraud = `#version 300 es
precision mediump float;
out vec4 fragColor;
in mat4 Vmatrix;
in vec3 posInEyeSpace;
uniform vec4 objColor;
uniform vec3 lightLocation;

void main() {
  vec3 normal=normalize(cross(dFdx(posInEyeSpace),dFdy(posInEyeSpace)));
  vec3 L=normalize(vec3(Vmatrix*vec4(lightLocation,1.0))-posInEyeSpace);
  vec3 R=normalize(-reflect(L,normal));
  vec3 V=normalize(-posInEyeSpace);
  
  float cos_theta=max(dot(normal,L),0.0);
  vec3 ldiff=cos_theta*vec3(objColor);
  float cos_phi=max(dot(V,R),0.0);
  vec3 lspec=((pow(cos_phi,10.0))*vec3(0.3,0.3,0.3))*(vec3(objColor));
  vec3 lamb=0.4*(vec3(objColor));
  fragColor=vec4(ldiff+lamb+lspec,1.0);
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
