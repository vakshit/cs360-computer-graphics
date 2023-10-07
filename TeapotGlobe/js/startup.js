/** Main GL entity */
var gl;

/** Shader prefixes */
var shaderPrefix = [];
/** Shader programs */
var shaderPrograms = {};
/** Shader initialization functions */
var shaderInit = {};
/** Buffer initialization functions */
var bufferInit = {};
/** Draw functions */
var drawFunctions = {};
/** Animate functions */
var animateFunctions = {};
/** Shaders */
/** @type {Shaders} */
const shaders = new Shaders();

/** Enter point of the scripts for initialization of everything. */
function startup() {
  /** Create GL entity. */
  var canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  /** Initialize all scripts, shaders, and buffers. */
  initAll();
  setupShaders();
  setupBuffers();

  /** Start drawing! */
  tick();
}

/** Render a frame. */
function tick() {
  requestAnimFrame(tick);

  draw();
  animate();
}

/** Create GL context.
 *  @param {canvasElement} canvas
 *  @return {glContext}
 */
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

/** Setup all shaders. */
function setupShaders() {
  console.log(shaderInit);
  for (prefix in shaders) {
    setupOneShader(shaders[prefix]);
    shaderInit[prefix]();
  }
}

/** Setup one shader with specified identification prefix.
 *  @param {Map} prefix
 */
function setupOneShader(prefix) {
  /** Create new program. */
  var oneShaderProgram = gl.createProgram();
  /** Get shader codes. */
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  // var vertexShaderSource = document.getElementById(
  //   prefix + "VertexShaderDOM"
  // ).innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  // var fragmentShaderSource = document.getElementById(
  //   prefix + "FragmentShaderDOM"
  // ).innerHTML;

  /** Compile and link program. */
  gl.shaderSource(vertexShader, prefix.vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(oneShaderProgram, vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
  }

  gl.shaderSource(fragmentShader, prefix.fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(oneShaderProgram, fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  gl.linkProgram(oneShaderProgram);

  if (!gl.getProgramParameter(oneShaderProgram, gl.LINK_STATUS)) {
    console.log("Failed to setup shader:" + prefix.name);
  }

  shaderPrograms[prefix.name] = oneShaderProgram;
}

/** Setup all buffers. */
function setupBuffers() {
  for (prefix in shaders) {
    bufferInit[prefix]();
  }
  // for (var i = 0; i < shaderPrefix.length; i++) {
  //   bufferInit[shaderPrefix[i]]();
  // }
}

/** Draw a frame by calling all draw functions. */
function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (prefix in shaders) {
    drawFunctions[prefix]();
  }
  // for (var i = 0; i < shaderPrefix.length; i++) {
  //   drawFunctions[shaderPrefix[i]]();
  // }
}

/** Animate by calling all animate functions. */
function animate() {
  /** Update physics and views. */
  viewUpdateMatrix();

  /** Call animate functions. */
  for (prefix in shaders) {
    animateFunctions[prefix]();
  }
  // for (var i = 0; i < shaderPrefix.length; i++) {
  //   animateFunctions[shaderPrefix[i]]();
  // }
}

/** Convert degree to rad.
 *  @param {float} d degree
 *  @return {float} r rad
 */
function degToRad(d) {
  return (d * Math.PI) / 180;
}

/** Convert rad to degree.
 *  @param {float} r rad
 *  @return {float} d degree
 */
function radToDeg(r) {
  return (r / Math.PI) * 180;
}

/** Initialize all scripts. */
function initAll() {
  viewInit();
  skyboxInit();
  teapotInit();
  sphereInit();
}
