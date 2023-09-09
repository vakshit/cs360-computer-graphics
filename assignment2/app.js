////////////////////////////////////////////////////////////////////////
//  A simple WebGL program to draw a 3D cube wirh basic interaction.
//

/** @type {WebGLRenderingContext} */
var gl;
/** @type {HTMLCanvasElement} */
var canvas;

// params
var zoom = 10;
var light = [50.0, 10.0, 5.0];

// shader Programs
/** @type {ShaderProgram} */
var shaderProgram1 = new ShaderProgram();
/** @type {ShaderProgram} */
var shaderProgram2 = new ShaderProgram();
/** @type {ShaderProgram} */
var shaderProgram3 = new ShaderProgram();

// rotations
/** @type {Rotation} */
var rotation1 = new Rotation();
/** @type {Rotation} */
var rotation2 = new Rotation();
/** @type {Rotation} */
var rotation3 = new Rotation();

// buffers
var buf;
var indexBuf;
var cubeNormalBuf;
var spBuf;
var spIndexBuf;
var spNormalBuf;

var spVerts = [];
var spIndicies = [];
var spNormals = [];

// initialize model, view, and projection matrices
var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create(); // model matrix
var pMatrix = mat4.create(); //projection matrix

// specify camera/eye coordinate system parameters
var eyePos = [0.0, 0.0, 2.0];
var COI = [0.0, 0.0, 0.0];
var viewUp = [0.0, 1.0, 0.0];

mat4.identity(vMatrix);
vMatrix = mat4.lookAt(eyePos, COI, viewUp, vMatrix);

function _shaderSetup(shaderCode, type) {
  shader = gl.createShader(type);
  gl.shaderSource(shader, shaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function initShaders(shaderProgram, vertexShaderCode, fragShaderCode) {
  shaderProgram.program = gl.createProgram();

  var vertexShader = _shaderSetup(vertexShaderCode, gl.VERTEX_SHADER);
  var fragmentShader = _shaderSetup(fragShaderCode, gl.FRAGMENT_SHADER);

  // attach the shaders
  gl.attachShader(shaderProgram.program, vertexShader);
  gl.attachShader(shaderProgram.program, fragmentShader);
  //link the shader program
  gl.linkProgram(shaderProgram.program);

  // check for compilation and linking status
  if (!gl.getProgramParameter(shaderProgram.program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  //get locations of attributes and uniforms declared in the shader
  shaderProgram.aPositionLocation = gl.getAttribLocation(
    shaderProgram.program,
    "aPosition"
  );
  shaderProgram.aNormalLocation = gl.getAttribLocation(
    shaderProgram.program,
    "aNormal"
  );
  shaderProgram.uMMatrixLocation = gl.getUniformLocation(
    shaderProgram.program,
    "uMMatrix"
  );
  shaderProgram.uVMatrixLocation = gl.getUniformLocation(
    shaderProgram.program,
    "uVMatrix"
  );
  shaderProgram.uPMatrixLocation = gl.getUniformLocation(
    shaderProgram.program,
    "uPMatrix"
  );
  shaderProgram.uColorLocation = gl.getUniformLocation(
    shaderProgram.program,
    "objColor"
  );

  shaderProgram.uLightLocation = gl.getUniformLocation(
    shaderProgram.program,
    "light"
  );
}

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2"); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function initCubeBuffer() {
  var vertices = [
    // Front face
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    // Back face
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    // Top face
    -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    // Bottom face
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
    // Right face
    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
    // Left face
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
  ];
  buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  buf.itemSize = 3;
  buf.numItems = vertices.length / 3;
  var normals = [
    // Front face
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    // Back face
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
    // Top face
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    // Bottom face
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
    // Right face
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
    // Left face
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
  ];
  cubeNormalBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  cubeNormalBuf.itemSize = 3;
  cubeNormalBuf.numItems = normals.length / 3;

  var indices = [
    0,
    1,
    2,
    0,
    2,
    3, // Front face
    4,
    5,
    6,
    4,
    6,
    7, // Back face
    8,
    9,
    10,
    8,
    10,
    11, // Top face
    12,
    13,
    14,
    12,
    14,
    15, // Bottom face
    16,
    17,
    18,
    16,
    18,
    19, // Right face
    20,
    21,
    22,
    20,
    22,
    23, // Left face
  ];
  indexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  indexBuf.itemSize = 1;
  indexBuf.numItems = indices.length;
}

function drawCube(color, shaderProgram) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.vertexAttribPointer(
    shaderProgram.aPositionLocation,
    buf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuf);

  gl.vertexAttribPointer(
    shaderProgram.aNormalLocation,
    cubeNormalBuf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);

  gl.uniform4fv(shaderProgram.uColorLocation, color);
  gl.uniformMatrix4fv(shaderProgram.uMMatrixLocation, false, mMatrix);
  gl.uniformMatrix4fv(shaderProgram.uVMatrixLocation, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.uPMatrixLocation, false, pMatrix);
  gl.uniform3fv(shaderProgram.uLightLocation, light);

  gl.drawElements(gl.TRIANGLES, indexBuf.numItems, gl.UNSIGNED_SHORT, 0);
  //gl.drawArrays(gl.LINE_STRIP, 0, buf.numItems); // show lines
  //gl.drawArrays(gl.POINTS, 0, buf.numItems); // show points
}

// New sphere initialization function
function initSphere(nslices, nstacks, radius) {
  for (var i = 0; i <= nslices; i++) {
    var angle = (i * Math.PI) / nslices;
    var comp1 = Math.sin(angle);
    var comp2 = Math.cos(angle);

    for (var j = 0; j <= nstacks; j++) {
      var phi = (j * 2 * Math.PI) / nstacks;
      var comp3 = Math.sin(phi);
      var comp4 = Math.cos(phi);

      var xcood = comp4 * comp1;
      var ycoord = comp2;
      var zcoord = comp3 * comp1;

      spVerts.push(radius * xcood, radius * ycoord, radius * zcoord);
      spNormals.push(xcood, ycoord, zcoord);
    }
  }

  // now compute the indices here
  for (var i = 0; i < nslices; i++) {
    for (var j = 0; j < nstacks; j++) {
      var id1 = i * (nstacks + 1) + j;
      var id2 = id1 + nstacks + 1;

      spIndicies.push(id1, id2, id1 + 1);
      spIndicies.push(id2, id2 + 1, id1 + 1);
    }
  }
}

function initSphereBuffer() {
  var nslices = 50;
  var nstacks = 50;
  var radius = 0.65;

  initSphere(nslices, nstacks, radius);

  // buffer for vertices
  spBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spVerts), gl.STATIC_DRAW);
  spBuf.itemSize = 3;
  spBuf.numItems = spVerts.length / 3;

  // buffer for indices
  spIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spIndexBuf);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(spIndicies),
    gl.STATIC_DRAW
  );
  spIndexBuf.itemsize = 1;
  spIndexBuf.numItems = spIndicies.length;

  // buffer for normals
  spNormalBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spNormalBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spNormals), gl.STATIC_DRAW);
  spNormalBuf.itemSize = 3;
  spNormalBuf.numItems = spNormals.length / 3;
}

function drawSphere(color, shaderProgram) {
  gl.bindBuffer(gl.ARRAY_BUFFER, spBuf);
  gl.vertexAttribPointer(
    shaderProgram.aPositionLocation,
    spBuf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, spNormalBuf);
  gl.vertexAttribPointer(
    shaderProgram.aNormalLocation,
    spNormalBuf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spIndexBuf);

  gl.uniform4fv(shaderProgram.uColorLocation, color);
  gl.uniformMatrix4fv(shaderProgram.uMMatrixLocation, false, mMatrix);
  gl.uniformMatrix4fv(shaderProgram.uVMatrixLocation, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.uPMatrixLocation, false, pMatrix);
  gl.uniform3fv(shaderProgram.uLightLocation, light);

  gl.drawElements(gl.TRIANGLES, spIndexBuf.numItems, gl.UNSIGNED_INT, 0);
  //gl.drawArrays(gl.LINE_STRIP, 0, buf.numItems); // show lines
  //gl.drawArrays(gl.POINTS, 0, buf.numItems); // show points
}

//////////////////////////////////////////////////////////////////////
//Main drawing routine
function drawView1(shaderProgram) {
  const cubeColor = normalizeColor([171, 170, 132, 255]);
  const sphereColor = normalizeColor([54, 105, 224, 255]);
  mat4.identity(mMatrix);
  mMatrix = mat4.rotateX(
    mMatrix,
    degToRad((rotation1.degreeY + rotation1.deltaY) * 0.2)
  );
  mMatrix = mat4.rotateY(
    mMatrix,
    degToRad((rotation1.degreeX + rotation1.deltaX) * 0.2)
  );
  matrixStack = [];

  {
    pushMatrix(matrixStack, mMatrix);
    mat4.translate(mMatrix, [0, -0.2, 0]);
    mat4.scale(mMatrix, [0.55, 1, 0.55]);

    // Now draw the cube
    drawCube(cubeColor, shaderProgram);

    mMatrix = popMatrix(matrixStack);
  }

  {
    pushMatrix(matrixStack, mMatrix);
    mat4.translate(mMatrix, [0, 0.55, 0]);
    mat4.scale(mMatrix, [0.4, 0.4, 0.4]);
    drawSphere(sphereColor, shaderProgram);
    mMatrix = popMatrix(matrixStack);
  }
}

function drawView2(shaderProgram) {
  const cubeColor = normalizeColor([62, 145, 41, 255]);
  const sphereColor = normalizeColor([171, 178, 184, 255]);
  let stack = [];
  mat4.identity(mMatrix);

  // transformations applied here on model matrix
  mMatrix = mat4.rotateX(
    mMatrix,
    degToRad((rotation2.degreeY + rotation2.deltaY) * 0.2)
  );
  mMatrix = mat4.rotateY(
    mMatrix,
    degToRad((rotation2.degreeX + rotation2.deltaX) * 0.2)
  );
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [0, -0.5, 0]);
    mat4.scale(mMatrix, [0.7, 0.7, 0.7]);
    drawSphere(sphereColor, shaderProgram);
    mMatrix = popMatrix(stack);
  }

  {
    pushMatrix(stack, mMatrix);
    mat4.rotateZ(mMatrix, degToRad(-25));
    mat4.translate(mMatrix, [-0.48, -0.4, 0]);
    mat4.scale(mMatrix, [0.48, 0.48, 0.48]);

    drawCube(cubeColor, shaderProgram);
    mMatrix = popMatrix(stack);
  }

  {
    pushMatrix(stack, mMatrix);
    mat4.rotateZ(mMatrix, degToRad(-25));
    mat4.translate(mMatrix, [-0.48, 0.1, 0]);
    mat4.scale(mMatrix, [0.4, 0.4, 0.4]);

    drawSphere(sphereColor, shaderProgram);
    mMatrix = popMatrix(stack);
  }

  {
    mat4.rotateZ(mMatrix, degToRad(30));
    mat4.rotateY(mMatrix, degToRad(10));
    mat4.rotateX(mMatrix, degToRad(20));

    mat4.translate(mMatrix, [0.25, 0.4, -0.2]);
    pushMatrix(stack, mMatrix);
    mat4.scale(mMatrix, [0.35, 0.35, 0.35]);

    drawCube(cubeColor, shaderProgram);
    mMatrix = popMatrix(stack);
  }

  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [0.0, 0.35, 0]);
    mat4.scale(mMatrix, [0.25, 0.25, 0.25]);

    drawSphere(sphereColor, shaderProgram);
    mMatrix = popMatrix(stack);
  }
}

function drawView3(shaderProgram) {
  const cubeColor = normalizeColor([171, 170, 132, 255]);
  const sphereColor = normalizeColor([54, 105, 224, 255]);
  let stack = [];
  mat4.identity(mMatrix);

  // transformations applied here on model matrix
  mMatrix = mat4.rotateX(
    mMatrix,
    degToRad((rotation3.degreeY + rotation3.deltaY) * 0.2)
  );
  mMatrix = mat4.rotateY(
    mMatrix,
    degToRad((rotation3.degreeX + rotation3.deltaX) * 0.2)
  );
  // bottom circle
  {
    mat4.translate(mMatrix, [0, -0.7, 0]);
    pushMatrix(stack, mMatrix);
    mat4.scale(mMatrix, [0.4, 0.4, 0.4]);
    drawSphere(normalizeColor([10, 166, 47, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // move up
  mat4.translate(mMatrix, [0, 0.27, 0]);

  // bottom plank
  {
    pushMatrix(stack, mMatrix);
    mat4.scale(mMatrix, [1.5, 0.05, 0.4]);
    drawCube(normalizeColor([163, 31, 5, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // move up
  mat4.translate(mMatrix, [0, 0.25, 0]);

  // right lower circle
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [0.4, 0.0, 0.0]);
    mat4.scale(mMatrix, [0.35, 0.35, 0.35]);
    drawSphere(normalizeColor([3, 126, 163, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // left lower circle
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [-0.4, 0.0, 0.0]);
    mat4.scale(mMatrix, [0.35, 0.35, 0.35]);
    drawSphere(normalizeColor([85, 77, 201, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // move uo
  mat4.translate(mMatrix, [0.0, 0.25, 0.0]);

  // middle left plank
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [-0.4, 0, 0]);
    mat4.scale(mMatrix, [0.4, 0.05, 1]);
    drawCube(normalizeColor([163, 149, 69, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // middle right plank
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [0.4, 0, 0]);
    mat4.scale(mMatrix, [0.4, 0.05, 1]);
    drawCube(normalizeColor([49, 148, 146, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // move uo
  mat4.translate(mMatrix, [0.0, 0.25, 0.0]);

  // right upper circle
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [0.4, 0.0, 0.0]);
    mat4.scale(mMatrix, [0.35, 0.35, 0.35]);
    drawSphere(normalizeColor([184, 146, 44, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // left upper circle
  {
    pushMatrix(stack, mMatrix);
    mat4.translate(mMatrix, [-0.4, 0.0, 0.0]);
    mat4.scale(mMatrix, [0.35, 0.35, 0.35]);
    drawSphere(normalizeColor([159, 32, 168, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // move uo
  mat4.translate(mMatrix, [0.0, 0.25, 0.0]);

  // upper plank
  {
    pushMatrix(stack, mMatrix);
    mat4.scale(mMatrix, [1.5, 0.05, 0.4]);
    drawCube(normalizeColor([163, 31, 5, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }

  // move uo
  mat4.translate(mMatrix, [0.0, 0.3, 0.0]);

  // uppermost circle
  {
    pushMatrix(stack, mMatrix);
    mat4.scale(mMatrix, [0.4, 0.4, 0.4]);
    drawSphere(normalizeColor([138, 150, 158, 255]), shaderProgram);
    mMatrix = popMatrix(stack);
  }
}

function eventListeners() {
  // drag eventListeners
  canvas.addEventListener("mousedown", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    if (x >= 0 && x <= 400) {
      rotation1.lastX = x;
      rotation1.lastY = y;
      rotation1.isDragging = true;
    } else if (x > 400 && x <= 800) {
      rotation2.lastX = x;
      rotation2.lastY = y;
      rotation2.isDragging = true;
    } else if (x > 800 && x <= 1200) {
      rotation3.lastX = x;
      rotation3.lastY = y;
      rotation3.isDragging = true;
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    rotation1.isDragging = false;
    rotation1.degreeX += rotation1.deltaX;
    rotation1.deltaX = 0;
    rotation1.degreeY += rotation1.deltaY;
    rotation1.deltaY = 0;

    rotation2.isDragging = false;
    rotation2.degreeX += rotation2.deltaX;
    rotation2.deltaX = 0;
    rotation2.degreeY += rotation2.deltaY;
    rotation2.deltaY = 0;

    rotation3.isDragging = false;
    rotation3.degreeX += rotation3.deltaX;
    rotation3.deltaX = 0;
    rotation3.degreeY += rotation3.deltaY;
    rotation3.deltaY = 0;
  });

  canvas.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (x >= 0 && x <= 400) {
      if (!rotation1.isDragging) return;
      rotation2.isDragging = false;
      rotation3.isDragging = false;

      rotation1.deltaX = x - rotation1.lastX;
      rotation1.deltaY = y - rotation1.lastY;
    } else if (x > 400 && x <= 800) {
      if (!rotation2.isDragging) return;
      rotation1.isDragging = false;
      rotation3.isDragging = false;

      rotation2.deltaX = x - rotation2.lastX;
      rotation2.deltaY = y - rotation2.lastY;
    } else if (x > 800 && x <= 1200) {
      if (!rotation3.isDragging) return;
      rotation1.isDragging = false;
      rotation2.isDragging = false;

      rotation3.deltaX = x - rotation3.lastX;
      rotation3.deltaY = y - rotation3.lastY;
    }
    drawView();
  });

  const zoomSlider = document.getElementById("zoom-value");
  zoomSlider.addEventListener("input", function (e) {
    zoom = zoomSlider.value;
    drawView();
  });

  const lightSlider = document.getElementById("light-value");
  lightSlider.addEventListener("input", function () {
    light[0] = lightSlider.value;
    drawView();
  });
}

function drawView() {
  //set up perspective projection matrix
  mat4.identity(pMatrix);
  mat4.perspective(60 + Number(zoom), 1.0, 0.1, 1000, pMatrix);

  // start drawing
  gl.scissor(0, 0, 400, 400);
  gl.viewport(0, 0, 400, 400);
  gl.clearColor(...normalizeColor([215, 229, 252, 240]));
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram1.program);
  gl.enableVertexAttribArray(shaderProgram1.aPositionLocation);
  gl.enableVertexAttribArray(shaderProgram1.aNormalLocation);
  drawView1(shaderProgram1);

  gl.scissor(400, 0, 400, 400);
  gl.viewport(400, 0, 400, 400);
  gl.clearColor(...normalizeColor([251, 215, 252, 220]));
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram2.program);
  gl.enableVertexAttribArray(shaderProgram2.aPositionLocation);
  gl.enableVertexAttribArray(shaderProgram2.aNormalLocation);
  drawView2(shaderProgram2);

  gl.scissor(800, 0, 400, 400);
  gl.viewport(800, 0, 400, 400);
  gl.clearColor(...normalizeColor([233, 255, 230, 255]));
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram3.program);
  gl.enableVertexAttribArray(shaderProgram3.aPositionLocation);
  gl.enableVertexAttribArray(shaderProgram3.aNormalLocation);
  drawView3(shaderProgram3);
}

// This is the entry point from the html
function webGLStart() {
  canvas = document.getElementById("canvas");
  eventListeners();

  // initialize WebGL
  initGL(canvas);
  gl.enable(gl.DEPTH_TEST); // enable depth test
  gl.enable(gl.SCISSOR_TEST);
  initShaders(
    shaderProgram1,
    window.shaders.vertexShaderCode_flat,
    window.shaders.fragShaderCode_flat
  );
  initShaders(
    shaderProgram2,
    window.shaders.vertexShaderCode_gouraud,
    window.shaders.fragShaderCode_gouraud
  );
  initShaders(
    shaderProgram3,
    window.shaders.vertexShaderCode_phong,
    window.shaders.fragShaderCode_phong
  );
  //initialize buffers for the square
  initCubeBuffer();
  initSphereBuffer();

  drawView();
}
