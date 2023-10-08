var gl;

var shaderPrefix = [];
var shaderPrograms = {};
var shaderInit = {};
var bufferInit = {};
var drawFunctions = {};
var animateFunctions = {};
const shaders = new Shaders();

function startup() {
  var canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  initAll();
  setupShaders();
  setupBuffers();

  tick();
}

function tick() {
  requestAnimFrame(tick);

  draw();
  animate();
}

function createGLContext(canvas) {
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function setupShaders() {
  for (prefix in shaders) {
    setupOneShader(shaders[prefix]);
    shaderInit[prefix]();
  }
}

function setupOneShader(prefix) {
  var oneShaderProgram = gl.createProgram();
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, prefix.vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(oneShaderProgram, vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(
      "Failed to setup vertex shader:" + gl.getShaderInfoLog(vertexShader)
    );
  }

  gl.shaderSource(fragmentShader, prefix.fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(oneShaderProgram, fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(
      "Failed to setup fragment shader:" + gl.getShaderInfoLog(fragmentShader)
    );
  }

  gl.linkProgram(oneShaderProgram);

  if (!gl.getProgramParameter(oneShaderProgram, gl.LINK_STATUS)) {
    console.log("Failed to setup shader:" + prefix.name);
  }

  shaderPrograms[prefix.name] = oneShaderProgram;
}

function setupBuffers() {
  for (prefix in shaders) {
    bufferInit[prefix]();
  }
}

function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (prefix in shaders) {
    drawFunctions[prefix]();
  }
}

function animate() {
  viewUpdateMatrix();
  for (prefix in shaders) {
    animateFunctions[prefix]();
  }
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function radToDeg(r) {
  return (r / Math.PI) * 180;
}

function initAll() {
  viewInit();
  skyboxInit();
  teapotInit();
  sphereInit();
  cubeInit();
}
