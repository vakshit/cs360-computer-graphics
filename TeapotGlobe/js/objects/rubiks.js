/** Identification prefix for rubiks shader. */
var RUBIKS_PREFIX = "rubiks";

/** GL buffers for rubikss. */
var rubiksPositionBuffer;
var rubiksIndexBuffer;
var rubiksNormalBuffer;

/** Data array for rubikss. */
var rubiksPositionArray = [];
var rubiksIndexArray = [];
var rubiksNormalArray = [];

/** Shader program for rubikss. */
var rubiksShaderProgram;
/** Variable locations in shader program. */
var rubiksLocations = {};
/** Texture of normal map. */
var normalTexture;

/** Model-to-world matrix of the rubiks. */
var rubiksModelMatrix = mat4.create();
/** Rotation angle of rubiks. */
var rubiksAngle = degToRad(200);
/** Quaternion of rubiks's rotation. */
var rubiksQuat = quat.create();
/** Rotation speed of rubiks */
var rubiksAngleStep = degToRad(-0.5);
/** Model-to-World scale of rubiks */
var RUBIKS_SCALE = vec3.fromValues(0.1, 0.1, 0.1);
/** Model-to-World translation of rubiks */
var RUBIKS_TRANSLATION = vec3.fromValues(0.4, 0.5, 0.4);

/** Settings */
var lightEnable = 1.0;
var normalEnable = 1.0;
var reflectionEnable = 1.0;
var bumpiness = 0.0;

/** Lighting parameters */
/** Parallel light source */
var LIGHT_DIRECTION = vec3.fromValues(
  -Math.cos(degToRad(40)),
  Math.sin(degToRad(40)),
  0.0
);
/** White ambient light when reflection is on/off. */
var ENV_AMBIENT_LIGHT_ON = vec3.fromValues(0.08, 0.08, 0.08);
var ENV_AMBIENT_LIGHT_OFF = vec3.fromValues(0.8, 0.8, 0.8);
/** Soft warm sunlight (RGB = 253,184,19) for diffuse light if light is enabled. */
var RUBIKS_COLOR = vec3.fromValues(32 / 255, 82 / 255, 64 / 255);
var DIFFUSE_LIGHT_INIT = vec3.clone(RUBIKS_COLOR);
/** Soft warm sunlight (RGB = 253,184,19) for specular light if light is enabled. */
var SPECULAR_LIGHT_INIT = vec3.fromValues(1.0, 1.0, 1.0);

/** Environment ambient light (based on whether reflection is enabled).*/
var environment_ambient = ENV_AMBIENT_LIGHT_ON;
/** Actual light (subject to changed by interfaces. */
var ambient_light = vec3.clone(environment_ambient);
var diffuse_light = vec3.clone(DIFFUSE_LIGHT_INIT);
var specular_light = vec3.clone(SPECULAR_LIGHT_INIT);

/** Initialization of rubiks.js */
function rubiksInit() {
  /** Register shaders, draw calls, animate calls. */
  shaderPrefix.push(RUBIKS_PREFIX);
  shaderInit[RUBIKS_PREFIX] = rubiksShaderInit;
  bufferInit[RUBIKS_PREFIX] = rubiksBufferInit;
  drawFunctions[RUBIKS_PREFIX] = rubiksDraw;
  animateFunctions[RUBIKS_PREFIX] = rubiksAnimate;

  /** Initialize rubiks and normal map. */
  rubiksGenerateShape();
  initCubeMap();
}

/** Initialize rubiks's shader programs and variable locations. */
function rubiksShaderInit() {
  rubiksShaderProgram = shaderPrograms[RUBIKS_PREFIX];

  //get locations of attributes and uniforms declared in the shader
  rubiksLocations["aPositionLocation"] = gl.getAttribLocation(
    rubiksShaderProgram,
    "aPosition"
  );
  rubiksLocations["uPMatrix"] = gl.getUniformLocation(
    rubiksShaderProgram,
    "uPMatrix"
  );
  rubiksLocations["uMVMatrix"] = gl.getUniformLocation(
    rubiksShaderProgram,
    "uMVMatrix"
  );

  rubiksLocations["uMMatrixLocation"] = gl.getUniformLocation(
    rubiksShaderProgram,
    "uMMatrix"
  );
  rubiksLocations["uTextureLocation"] = gl.getUniformLocation(
    rubiksShaderProgram,
    "uTexture"
  );
}

/** Initialize rubiks's buffer. */
function rubiksBufferInit() {
  // Create a buffer for positions
  var rubiksPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rubiksPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, rubiksPositionArray, gl.STATIC_DRAW);
}

function rubiksDraw() {
  gl.useProgram(rubiksShaderProgram);
  // gl.bindBuffer(gl.ARRAY_BUFFER, rubiksPositionBuffer);
  gl.enableVertexAttribArray(rubiksLocations["aPositionLocation"]);
  gl.vertexAttribPointer(
    rubiksLocations["aPositionLocation"],
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  mat4.fromRotationTranslationScale(
    rubiksModelMatrix,
    rubiksQuat,
    RUBIKS_TRANSLATION,
    RUBIKS_SCALE
  );

  // Set the matrix.
  gl.uniformMatrix4fv(rubiksLocations["uPMatrix"], false, pMatrix);
  gl.uniformMatrix4fv(rubiksLocations["uMVMatrix"], false, mvMatrix);
  gl.uniformMatrix4fv(
    rubiksLocations["uMMatrixLocation"],
    false,
    rubiksModelMatrix
  );
  gl.uniform1i(rubiksLocations["uTextureLocation"], 2); // Use texture unit 1
  gl.activeTexture(gl.TEXTURE0 + 2);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, rubiksLocations["texture"]);

  gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

  gl.disableVertexAttribArray(rubiksLocations["aPositionLocation"]);
}

function rubiksAnimate() {}

function initCubeMap() {
  // Create a texture.
  rubiksLocations["texture"] = gl.createTexture();

  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0 + 2);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, rubiksLocations["texture"]);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR
  );

  const faceInfos = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];
  var img = new Image();
  img.src = "rcube.png";
  img.onload = function () {
    faceInfos.forEach((face, index) => {
      gl.activeTexture(gl.TEXTURE0 + 2);

      gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (index == 5) {
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      }
    });
  };
}

function rubiksGenerateShape() {
  rubiksPositionArray = new Float32Array([
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5,
    0.5, -0.5, 0.5, -0.5, -0.5,

    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5,
    0.5, 0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
    0.5, 0.5, 0.5, -0.5,

    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, -0.5, 0.5,

    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5, 0.5, -0.5,

    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5, 0.5,
  ]);
}
