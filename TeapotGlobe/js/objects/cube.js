var CUBE_PREFIX = "cube";

var cubePositionBuffer;
var cubeIndexBuffer;
var cubeNormalBuffer;

var cubePositionArray = [];
var cubeIndexArray = [];
var cubeNormalArray = [];

var cubeShaderProgram;
var cubeLocations = {};
var normalTexture;

var cubeModelMatrix = mat4.create();
var cubeAngle = degToRad(200);
var cubeQuat = quat.create();

var cubeAngleStep = degToRad(-0.5);

var LIGHT_DIRECTION = vec3.fromValues(
  -Math.cos(degToRad(40)),
  Math.sin(degToRad(40)),
  0.0
);
var ENV_AMBIENT_LIGHT_ON = vec3.fromValues(0.08, 0.08, 0.08);
var ENV_AMBIENT_LIGHT_OFF = vec3.fromValues(0.8, 0.8, 0.8);
var CUBE_COLOR = vec3.fromValues(194 / 255, 187 / 255, 169 / 255);
var DIFFUSE_LIGHT_INIT = vec3.clone(CUBE_COLOR);
var SPECULAR_LIGHT_INIT = vec3.fromValues(1.0, 1.0, 1.0);

var environment_ambient = ENV_AMBIENT_LIGHT_ON;
var ambient_light = vec3.clone(environment_ambient);
var diffuse_light = vec3.clone(DIFFUSE_LIGHT_INIT);
var specular_light = vec3.clone(SPECULAR_LIGHT_INIT);

const cubes = [
  {
    scale: vec3.fromValues(0.1, 0.5, 0.1),
    translate: vec3.fromValues(0.5, -0.6, -0.2),
    textureNumber: 1.0,
  },
  {
    scale: vec3.fromValues(0.1, 0.5, 0.1),
    translate: vec3.fromValues(-0.5, -0.6, -0.2),
    textureNumber: 1.0,
  },
  {
    scale: vec3.fromValues(0.1, 0.5, 0.1),
    translate: vec3.fromValues(-0.5, -0.6, 0.2),
    textureNumber: 1.0,
  },
  {
    scale: vec3.fromValues(0.1, 0.5, 0.1),
    translate: vec3.fromValues(0.5, -0.6, 0.2),
    textureNumber: 1.0,
  },
  {
    scale: vec3.fromValues(0.1, 0.1, 0.1),
    translate: vec3.fromValues(-0.15, -0.1, -0.5),
    textureNumber: 2.0,
  },
  {
    scale: vec3.fromValues(0.15, 0.25, 0.15),
    translate: vec3.fromValues(0.35, -0.1, -0.3),
    textureNumber: 3.0,
  },
];

function cubeInit() {
  /** Register shaders, draw calls, animate calls. */
  shaderPrefix.push(CUBE_PREFIX);
  shaderInit[CUBE_PREFIX] = cubeShaderInit;
  bufferInit[CUBE_PREFIX] = cubeBufferInit;
  drawFunctions[CUBE_PREFIX] = cubeDraw;
  animateFunctions[CUBE_PREFIX] = cubeAnimate;

  setupRubiksTextureMap();
}

function cubeShaderInit() {
  cubeShaderProgram = shaderPrograms[CUBE_PREFIX];

  /** Attributes */
  cubeLocations["aVertexPosition"] = gl.getAttribLocation(
    cubeShaderProgram,
    "aVertexPosition"
  );
  cubeLocations["aVertexNormal"] = gl.getAttribLocation(
    cubeShaderProgram,
    "aVertexNormal"
  );

  /** Uniforms */
  cubeLocations["uPMatrix"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uPMatrix"
  );
  cubeLocations["uMVMatrix"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uMVMatrix"
  );
  cubeLocations["uModelMatrix"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uModelMatrix"
  );
  cubeLocations["uEnv"] = gl.getUniformLocation(cubeShaderProgram, "uEnv");

  cubeLocations["uViewOrigin"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uViewOrigin"
  );
  cubeLocations["uLightDirection"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uLightDirection"
  );
  cubeLocations["uAmbientLight"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uAmbientLight"
  );
  cubeLocations["uDiffuseLight"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uDiffuseLight"
  );
  cubeLocations["uSpecularLight"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uSpecularLight"
  );
  cubeLocations["vVertexColor"] = gl.getUniformLocation(
    cubeShaderProgram,
    "vVertexColor"
  );
  cubeLocations["uWood"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uWoodTexture"
  );
  cubeLocations["uShadingType"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uShadingType"
  );
  cubeLocations["uRubiksTexture"] = gl.getUniformLocation(
    cubeShaderProgram,
    "uRubiksTexture"
  );
}

function cubeBufferInit() {
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
  cubePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  cubePositionBuffer.itemSize = 3;
  cubePositionBuffer.numOfItems = vertices.length / 3;

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
  cubeNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  cubeNormalBuffer.itemSize = 3;
  cubeNormalBuffer.numOfItems = normals.length / 3;

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
  cubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  cubeIndexBuffer.itemSize = 1;
  cubeIndexBuffer.numOfItems = indices.length;
}

function cubeDraw() {
  gl.useProgram(cubeShaderProgram);

  cubes.forEach((cube) => {
    mat4.fromRotationTranslationScale(
      cubeModelMatrix,
      cubeQuat,
      cube.translate,
      cube.scale
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
    gl.enableVertexAttribArray(cubeLocations["aVertexPosition"]);
    gl.vertexAttribPointer(
      cubeLocations["aVertexPosition"],
      cubePositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.enableVertexAttribArray(cubeLocations["aVertexNormal"]);
    gl.vertexAttribPointer(
      cubeLocations["aVertexNormal"],
      cubeNormalBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.uniformMatrix4fv(cubeLocations["uPMatrix"], false, pMatrix);
    gl.uniformMatrix4fv(cubeLocations["uMVMatrix"], false, mvMatrix);
    gl.uniformMatrix4fv(cubeLocations["uModelMatrix"], false, cubeModelMatrix);
    gl.uniform3fv(cubeLocations["uViewOrigin"], viewOrigin);
    gl.uniform1i(cubeLocations["uEnv"], 0);
    gl.uniform1f(cubeLocations["uShadingType"], cube.textureNumber);
    gl.uniform3fv(cubeLocations["uLightDirection"], LIGHT_DIRECTION);
    gl.uniform3fv(cubeLocations["uAmbientLight"], ambient_light);
    gl.uniform3fv(cubeLocations["uDiffuseLight"], diffuse_light);
    gl.uniform3fv(cubeLocations["uSpecularLight"], specular_light);
    gl.uniform3fv(cubeLocations["vVertexColor"], CUBE_COLOR);

    gl.uniform1i(cubeLocations["uWood"], 1); // Use texture unit 1
    gl.uniform1i(cubeLocations["uRubiksTexture"], 2);

    gl.drawElements(
      gl.TRIANGLES,
      cubeIndexBuffer.numOfItems,
      gl.UNSIGNED_SHORT,
      0
    );
  });

  /** Destructor */
  gl.disableVertexAttribArray(cubeLocations["aVertexPosition"]);
  gl.disableVertexAttribArray(cubeLocations["aVertexNormal"]);
}

function cubeAnimate() {}

function setupRubiksTextureMap() {
  // Create a texture.
  cubeLocations["rubiksTexture"] = gl.createTexture();

  // use texture unit 0
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeLocations["rubiksTexture"]);
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
      gl.activeTexture(gl.TEXTURE2);

      gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (index == 5) {
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      }
    });
  };
}
