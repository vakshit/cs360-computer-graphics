//////////////////// SHADERS ///////////////////
class Shaders {
  constructor() {
    this.skybox = {
      name: "skybox",

      vertexShaderSource: `#version 300 es
      in vec3 aVertexPosition;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;

      out vec3 vPosition;

      void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      vPosition= aVertexPosition;
      }`,

      fragmentShaderSource: `#version 300 es
      precision mediump float;

      uniform samplerCube uEnv;

      in vec3 vPosition;
      out vec4 fragColor;
      void main(void) {
      fragColor = texture(uEnv, normalize(vPosition));
      }`,
    };

    this.teapot = {
      name: "teapot",

      vertexShaderSource: `#version 300 es
      in vec3 aVertexPosition;
      in vec3 aVertexNormal;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uModelMatrix;

      out vec3 vModelPosition;
      out vec3 vModelNormal;
      out vec3 vWorldPosition;
      out vec3 vWorldNormal;
      out vec3 vVertexColor;

      void main(void) {

      vModelPosition = aVertexPosition;
      vModelNormal = aVertexNormal;

      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);

      vWorldPosition = vec3(worldPosition);
      vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);
      vVertexColor = vec3(0.8,0.8,0.8);

      gl_Position = uPMatrix * uMVMatrix * worldPosition;
      }`,

      fragmentShaderSource: `#version 300 es
      precision mediump float;

      const float shininess = 1000.0;
      const float PI = 3.1415926535897932384626433832795;

      uniform vec3 uViewOrigin;
      uniform vec3 uLightDirection;
      uniform vec3 uAmbientLight;
      uniform vec3 uDiffuseLight;
      uniform vec3 uSpecularLight;

      uniform samplerCube uEnv;

      in vec3 vModelPosition;
      in vec3 vModelNormal;
      in vec3 vWorldPosition;
      in vec3 vWorldNormal;
      in vec3 vVertexColor;
      out vec4 fragColor;
      void main(void) {

      vec3 worldPosition = vWorldPosition;
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 modelPosition = vModelPosition;
      // Adjust to actual center of teapot.
      modelPosition.y -= 1.0;
      modelPosition = normalize(modelPosition);
      vec3 modelNormal = normalize(vModelNormal);

      // Calculate texture coorinates.
      vec2 textureCoord;
      textureCoord.s = -atan(-modelPosition.z, -modelPosition.x) / 2.0 / PI + 0.5;
      textureCoord.t = 0.5 - 0.5 * modelPosition.y;

      // Calculate tangent bases in world coordinates.
      vec3 tangentBAxis = vec3(0.0,1.0,0.0);
      tangentBAxis = normalize(tangentBAxis - dot(tangentBAxis, worldNormal) * worldNormal);
      vec3 tangentTAxis = normalize(cross(tangentBAxis, worldNormal));

      // Phong reflection model
      vec3 normalizedLightDirection = normalize(uLightDirection);
      vec3 vectorReflection = normalize( reflect(-normalizedLightDirection, worldNormal) );
      vec3 vectorView = normalize( uViewOrigin - worldPosition );

      float diffuseLightWeighting = max( dot(worldNormal, normalizedLightDirection), 0.0 );
      float specularLightWeighting = pow( max( dot(vectorReflection, vectorView), 0.0), shininess );

      // Sum up lighting and reflection parts
      fragColor = vec4(
      ( uAmbientLight * vVertexColor)
      + ((uDiffuseLight * vVertexColor) * diffuseLightWeighting)
      + ( uSpecularLight * specularLightWeighting),
      1.0 );
      fragColor += vec4(texture(uEnv, normalize(reflect(-vectorView, worldNormal))).rgb ,
      0.0);
      }`,
    };

    this.sphere = {
      name: "sphere",

      vertexShaderSource: `#version 300 es
      in vec3 aVertexPosition;
      in vec3 aVertexNormal;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uModelMatrix;

      out vec3 vModelPosition;
      out vec3 vModelNormal;
      out vec3 vWorldPosition;
      out vec3 vWorldNormal;
      out mat4 vModelMatrix;

      void main(void) {

      vModelPosition = aVertexPosition;
      vModelNormal = aVertexNormal;
      vModelMatrix = uModelMatrix;

      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);

      vWorldPosition = vec3(worldPosition);
      vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);

      gl_Position = uPMatrix * uMVMatrix * worldPosition;
      }`,

      fragmentShaderSource: `#version 300 es
      precision mediump float;

      const float shininess = 10.0;
      const float PI = 3.1415926535897932384626433832795;

      uniform vec3 uViewOrigin;
      uniform vec3 uLightDirection;
      uniform vec3 uAmbientLight;
      uniform vec3 uDiffuseLight;
      uniform vec3 uSpecularLight;
      uniform float uTextureEnable;
      uniform sampler2D uTextureMap;

      uniform samplerCube uEnv;
      uniform vec3 vVertexColor;

      in vec3 vModelPosition;
      in vec3 vModelNormal;
      in vec3 vWorldPosition;
      in vec3 vWorldNormal;
      in mat4 vModelMatrix;

      out vec4 fragColor;
      void main(void) {

      vec3 worldPosition = vWorldPosition;
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 modelPosition = vModelPosition;
      // Adjust to actual center of teapot.
      modelPosition.y -= 1.0;
      modelPosition = normalize(modelPosition);
      
      // Apply inverse transpose of the model matrix to the normal and light direction
      vec3 transformedNormal = normalize(mat3(transpose(inverse(vModelMatrix))) * vModelNormal);
      vec3 transformedLightDirection = normalize(mat3(transpose(inverse(vModelMatrix))) * uLightDirection);

      // Calculate texture coorinates.
      vec2 textureCoord = vec2(0.5, 0.5);
      textureCoord.s = -atan(-modelPosition.z, -modelPosition.x) / 2.0 / PI + 0.5;
      textureCoord.t = 0.5 - 0.5 * modelPosition.y;

      // Phong reflection model
      vec3 normalizedLightDirection = normalize(uLightDirection);
      vec3 vectorReflection = normalize( reflect(-normalizedLightDirection, worldNormal) );
      vec3 vectorView = normalize( uViewOrigin - worldPosition );

      float diffuseLightWeighting = max( dot(worldNormal, normalizedLightDirection), 0.0 );
      float specularLightWeighting = pow( max( dot(vectorReflection, vectorView), 0.0), shininess );

      // Sum up lighting and reflection parts
      if (uTextureEnable == 1.0){
        fragColor = 0.5* vec4(texture(uTextureMap, textureCoord).rgb, 2.0);
        fragColor += 0.4 * vec4(texture(uEnv, normalize(reflect(-vectorView, transformedNormal))).rgb,
      0.0);
      } else {
        fragColor =  vec4(
        (uAmbientLight * vVertexColor)
        + ((uDiffuseLight * vVertexColor) * diffuseLightWeighting)
        + ( uSpecularLight * specularLightWeighting),
        3.0 );
        fragColor += 0.7 * vec4(texture(uEnv, normalize(reflect(-vectorView, transformedNormal))).rgb,
      0.0);
      }
      
      }`,
    };

    this.cube = {
      name: "cube",

      vertexShaderSource: `#version 300 es
      in vec3 aVertexPosition;
      in vec3 aVertexNormal;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uModelMatrix;

      out vec3 vModelPosition;
      out vec3 vModelNormal;
      out vec3 vWorldPosition;
      out vec3 vWorldNormal;

      void main(void) {

      vModelPosition = aVertexPosition;
      vModelNormal = aVertexNormal;

      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);

      vWorldPosition = vec3(worldPosition);
      vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);

      gl_Position = uPMatrix * uMVMatrix * worldPosition;
      }`,

      fragmentShaderSource: `#version 300 es
      precision mediump float;

      const float shininess = 1000.0;
      const float PI = 3.1415926535897932384626433832795;

      uniform vec3 uViewOrigin;
      uniform vec3 uLightDirection;
      uniform vec3 uAmbientLight;
      uniform vec3 uDiffuseLight;
      uniform vec3 uSpecularLight;
      uniform float uShadingType;
      uniform sampler2D uWoodTexture;
      uniform samplerCube uRubiksTexture;

      uniform samplerCube uEnv;
      uniform vec3 vVertexColor;

      in vec3 vModelPosition;
      in vec3 vWorldPosition;
      in vec3 vWorldNormal;

      out vec4 fragColor;
      void main(void) {

      vec3 worldPosition = vWorldPosition;
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 modelPosition = vModelPosition;
      // Adjust to actual center of teapot.
      modelPosition.y -= 1.0;
      modelPosition = normalize(modelPosition);
      vec3 vectorView = normalize( uViewOrigin - worldPosition );


      // Sum up lighting and reflection parts
      if (uShadingType == 1.0){
        // Calculate texture coorinates.
        vec2 textureCoord = vec2(0.5, 0.5);
        textureCoord.s = -atan(-modelPosition.z, -modelPosition.x) / 2.0 / PI + 0.5;
        textureCoord.t = 0.5 - 0.5 * modelPosition.y;
        fragColor = 0.5* vec4(texture(uWoodTexture, textureCoord).rgb, 2.0);

        // add reflection
        fragColor += 0.4 * vec4(texture(uEnv, normalize(reflect(-vectorView, worldNormal))).rgb,
        0.0);
      } else if (uShadingType == 2.0) {
        fragColor = vec4(texture(uRubiksTexture, normalize(vModelPosition)).rgb, 1.0);
      } else {
        // Phong reflection model
        vec3 normalizedLightDirection = normalize(uLightDirection);
        vec3 vectorReflection = normalize( reflect(-normalizedLightDirection, worldNormal) );
  
        float diffuseLightWeighting = max( dot(worldNormal, normalizedLightDirection), 0.0 );
        float specularLightWeighting = pow( max( dot(vectorReflection, vectorView), 0.0), shininess );  
        fragColor =  vec4(
        (uAmbientLight * vVertexColor)
        + ((uDiffuseLight * vVertexColor) * diffuseLightWeighting)
        + ( uSpecularLight * specularLightWeighting),
        1.0 );

        // add reflection
        fragColor += 0.8 * vec4(texture(uEnv, normalize(refract(-vectorView, worldNormal, 0.82))).rgb,
        0.0);
      }
      // always reflects
      
      }`,
    };
  }
}

//////////////////// STARTER VARIABLES /////////////
var gl;

var shaderPrefix = [];
var shaderPrograms = {};
var shaderInit = {};
var bufferInit = {};
var drawFunctions = {};
var animateFunctions = {};
const shaders = new Shaders();

/////////////////// VIEW ///////////////////
var X_AXIS = vec3.fromValues(1.0, 0.0, 0.0);
var Y_AXIS = vec3.fromValues(0.0, 1.0, 0.0);
var Z_AXIS = vec3.fromValues(0.0, 0.0, 1.0);

var VIEW_RADIUS = 1.8;

var viewOrigin = vec3.fromValues(VIEW_RADIUS, 0.0, 0.0);
var viewAngle = 80;
var viewAngleStep = degToRad(0.2);

var viewUp = vec3.clone(Y_AXIS);
var viewLookAt = vec3.create();
var viewCenter = vec3.create();

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var VIEWPORT = 40;

function viewInit() {
  mat4.perspective(
    pMatrix,
    degToRad(VIEWPORT),
    gl.viewportWidth / gl.viewportHeight,
    0.001,
    7.0
  );
}

function viewUpdateMatrix() {
  viewAngle += viewAngleStep;

  viewOrigin = vec3.fromValues(
    VIEW_RADIUS * Math.cos(viewAngle),
    0.8,
    VIEW_RADIUS * Math.sin(viewAngle)
  );
  viewLookAt = vec3.fromValues(-Math.cos(viewAngle), 0.0, -Math.sin(viewAngle));

  mat4.lookAt(mvMatrix, viewOrigin, viewCenter, viewUp);
}

/////////////////// SKYBOX ////////////////////
var SKYBOX_PREFIX = "skybox";

var SKYBOX_SIZE = 3.0;

var skyboxPositionBuffer;
var skyboxIndexBuffer;

var skyboxPositionArray = [];
var skyboxIndexArray = [];

var skyboxShaderProgram;
var skyboxLocations = {};
var skyboxTexture;

function skyboxInit() {
  shaderPrefix.push(SKYBOX_PREFIX);
  shaderInit[SKYBOX_PREFIX] = skyboxShaderInit;
  bufferInit[SKYBOX_PREFIX] = skyboxBufferInit;
  drawFunctions[SKYBOX_PREFIX] = skyboxDraw;
  animateFunctions[SKYBOX_PREFIX] = skyboxAnimate;

  skyboxGenerateShape();
  setupCubeMap();
}

function skyboxShaderInit() {
  skyboxShaderProgram = shaderPrograms[SKYBOX_PREFIX];

  skyboxLocations["aVertexPosition"] = gl.getAttribLocation(
    skyboxShaderProgram,
    "aVertexPosition"
  );

  skyboxLocations["uPMatrix"] = gl.getUniformLocation(
    skyboxShaderProgram,
    "uPMatrix"
  );
  skyboxLocations["uMVMatrix"] = gl.getUniformLocation(
    skyboxShaderProgram,
    "uMVMatrix"
  );
  skyboxLocations["uEnv"] = gl.getUniformLocation(skyboxShaderProgram, "uEnv");
}

function skyboxBufferInit() {
  skyboxPositionBuffer = gl.createBuffer();
  skyboxIndexBuffer = gl.createBuffer();

  skyboxPositionBuffer.itemSize = 3;
  skyboxPositionBuffer.numOfItems =
    skyboxPositionArray.length / skyboxPositionBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(skyboxPositionArray),
    gl.STATIC_DRAW
  );

  skyboxIndexBuffer.itemSize = 1;
  skyboxIndexBuffer.numOfItems =
    skyboxIndexArray.length / skyboxIndexBuffer.itemSize;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Int16Array(skyboxIndexArray),
    gl.STATIC_DRAW
  );
}

function skyboxDraw() {
  gl.useProgram(skyboxShaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
  gl.enableVertexAttribArray(skyboxLocations["aVertexPosition"]);
  gl.vertexAttribPointer(
    skyboxLocations["aVertexPosition"],
    skyboxPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBuffer);

  gl.uniformMatrix4fv(skyboxLocations["uPMatrix"], false, pMatrix);
  gl.uniformMatrix4fv(skyboxLocations["uMVMatrix"], false, mvMatrix);
  gl.uniform1i(skyboxLocations["uEnv"], 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

  gl.drawElements(
    gl.TRIANGLES,
    skyboxIndexBuffer.numOfItems,
    gl.UNSIGNED_SHORT,
    0
  );

  gl.disableVertexAttribArray(skyboxLocations["aVertexPosition"]);
}

function skyboxAnimate() {}

function skyboxGenerateShape() {
  var sizes = [-SKYBOX_SIZE, SKYBOX_SIZE];

  for (var z in sizes) {
    for (var y in sizes) {
      for (var x in sizes) {
        skyboxPositionArray.push(sizes[x]);
        skyboxPositionArray.push(sizes[y]);
        skyboxPositionArray.push(sizes[z]);
      }
    }
  }

  skyboxIndexArray = [
    0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7, 0, 4, 1, 4, 5, 1, 2, 6, 3, 6, 7, 3, 0,
    2, 4, 2, 6, 4, 1, 3, 5, 3, 7, 5,
  ];
}

function setupCubeMap() {
  skyboxTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR
  );

  const faces = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: "posx.jpg",
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: "negx.jpg",
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: "posy.jpg",
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: "negy.jpg",
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: "posz.jpg",
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: "negz.jpg",
    },
  ];
  faces.forEach((face, index) => {
    const url = `textures/nvidia/${face.url}`;
    if (index === 5) {
      loadCubeMapFace(gl, face.target, skyboxTexture, url, function () {
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    } else {
      loadCubeMapFace(gl, face.target, skyboxTexture, url);
    }
  });
}

function loadCubeMapFace(gl, target, texture, url, callback) {
  var img = new Image();
  img.src = url;
  img.onload = function () {
    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (callback) {
      callback();
    }
  };
}

/////////////////// TEAPOT ////////////////////
var TEAPOT_PREFIX = "teapot";

var teapotPositionBuffer;
var teapotIndexBuffer;
var teapotNormalBuffer;

var teapotPositionArray = [];
var teapotIndexArray = [];
var teapotNormalArray = [];

var teapotShaderProgram;
var teapotLocations = {};
var normalTexture;

var teapotModelMatrix = mat4.create();
var teapotAngle = degToRad(200);
var teapotQuat = quat.create();
var teapotAngleStep = degToRad(0);

var TEAPOT_SCALE = vec3.fromValues(0.11, 0.11, 0.1);
var TEAPOT_TRANSLATION = vec3.fromValues(0.0, -0.2, 0.0);

var lightEnable = 0.0;
var normalEnable = 1.0;
var reflectionEnable = 1.0;
var bumpiness = 0.0;

var LIGHT_DIRECTION = vec3.fromValues(
  -Math.cos(degToRad(40)),
  Math.sin(degToRad(40)),
  0.0
);
var ENV_AMBIENT_LIGHT_ON = vec3.fromValues(0.0, 0.0, 0.0);
var ENV_AMBIENT_LIGHT_OFF = vec3.fromValues(0.0, 0.0, 0.0);
var DIFFUSE_LIGHT_INIT = vec3.fromValues(
  (0.2 * 253) / 255,
  (0.2 * 184) / 255,
  (0.2 * 19) / 255
);
var SPECULAR_LIGHT_INIT = vec3.fromValues(
  (1.0 * 253) / 255,
  (1.0 * 184) / 255,
  (1.0 * 19) / 255
);

var environment_ambient = ENV_AMBIENT_LIGHT_ON;
var ambient_light = vec3.clone(environment_ambient);
var diffuse_light = vec3.clone(DIFFUSE_LIGHT_INIT);
var specular_light = vec3.clone(SPECULAR_LIGHT_INIT);

function teapotInit() {
  shaderPrefix.push(TEAPOT_PREFIX);
  shaderInit[TEAPOT_PREFIX] = teapotShaderInit;
  bufferInit[TEAPOT_PREFIX] = teapotBufferInit;
  drawFunctions[TEAPOT_PREFIX] = teapotDraw;
  animateFunctions[TEAPOT_PREFIX] = teapotAnimate;

  teapotGenerateShape();
}

function teapotShaderInit() {
  teapotShaderProgram = shaderPrograms[TEAPOT_PREFIX];

  teapotLocations["aVertexPosition"] = gl.getAttribLocation(
    teapotShaderProgram,
    "aVertexPosition"
  );
  teapotLocations["aVertexNormal"] = gl.getAttribLocation(
    teapotShaderProgram,
    "aVertexNormal"
  );

  teapotLocations["uPMatrix"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uPMatrix"
  );
  teapotLocations["uMVMatrix"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uMVMatrix"
  );
  teapotLocations["uModelMatrix"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uModelMatrix"
  );
  teapotLocations["uEnv"] = gl.getUniformLocation(teapotShaderProgram, "uEnv");
  teapotLocations["uNormalMap"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uNormalMap"
  );
  teapotLocations["uNormalEnable"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uNormalEnable"
  );
  teapotLocations["uReflectionEnable"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uReflectionEnable"
  );
  teapotLocations["uBumpiness"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uBumpiness"
  );

  teapotLocations["uViewOrigin"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uViewOrigin"
  );
  teapotLocations["uLightDirection"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uLightDirection"
  );
  teapotLocations["uAmbientLight"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uAmbientLight"
  );
  teapotLocations["uDiffuseLight"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uDiffuseLight"
  );
  teapotLocations["uSpecularLight"] = gl.getUniformLocation(
    teapotShaderProgram,
    "uSpecularLight"
  );
}

function teapotBufferInit() {
  teapotPositionBuffer = gl.createBuffer();
  teapotIndexBuffer = gl.createBuffer();
  teapotNormalBuffer = gl.createBuffer();

  teapotPositionBuffer.itemSize = 3;
  teapotPositionBuffer.numOfItems =
    teapotPositionArray.length / teapotPositionBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, teapotPositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(teapotPositionArray),
    gl.STATIC_DRAW
  );

  teapotIndexBuffer.itemSize = 1;
  teapotIndexBuffer.numOfItems =
    teapotIndexArray.length / teapotIndexBuffer.itemSize;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Int16Array(teapotIndexArray),
    gl.STATIC_DRAW
  );

  teapotNormalBuffer.itemSize = 3;
  teapotNormalBuffer.numOfItems =
    teapotNormalArray.length / teapotNormalBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, teapotNormalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(teapotNormalArray),
    gl.STATIC_DRAW
  );
}

function teapotDraw() {
  vec3.scale(ambient_light, environment_ambient, lightEnable);
  vec3.scale(diffuse_light, DIFFUSE_LIGHT_INIT, lightEnable);
  vec3.scale(specular_light, SPECULAR_LIGHT_INIT, lightEnable);

  gl.useProgram(teapotShaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, teapotPositionBuffer);
  gl.enableVertexAttribArray(teapotLocations["aVertexPosition"]);
  gl.vertexAttribPointer(
    teapotLocations["aVertexPosition"],
    teapotPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIndexBuffer);

  gl.bindBuffer(gl.ARRAY_BUFFER, teapotNormalBuffer);
  gl.enableVertexAttribArray(teapotLocations["aVertexNormal"]);
  gl.vertexAttribPointer(
    teapotLocations["aVertexNormal"],
    teapotNormalBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.uniformMatrix4fv(teapotLocations["uPMatrix"], false, pMatrix);
  gl.uniformMatrix4fv(teapotLocations["uMVMatrix"], false, mvMatrix);
  gl.uniformMatrix4fv(
    teapotLocations["uModelMatrix"],
    false,
    teapotModelMatrix
  );
  gl.uniform3fv(teapotLocations["uViewOrigin"], viewOrigin);
  gl.uniform1i(teapotLocations["uEnv"], 0);
  gl.uniform1i(teapotLocations["uNormalMap"], 1);
  gl.uniform1f(teapotLocations["uNormalEnable"], normalEnable);
  gl.uniform1f(teapotLocations["uReflectionEnable"], reflectionEnable);
  gl.uniform1f(teapotLocations["uBumpiness"], bumpiness);

  gl.uniform3fv(teapotLocations["uLightDirection"], LIGHT_DIRECTION);
  gl.uniform3fv(teapotLocations["uAmbientLight"], ambient_light);
  gl.uniform3fv(teapotLocations["uDiffuseLight"], diffuse_light);
  gl.uniform3fv(teapotLocations["uSpecularLight"], specular_light);

  gl.drawElements(
    gl.TRIANGLES,
    teapotIndexBuffer.numOfItems,
    gl.UNSIGNED_SHORT,
    0
  );

  gl.disableVertexAttribArray(teapotLocations["aVertexPosition"]);
  gl.disableVertexAttribArray(teapotLocations["aVertexNormal"]);
}

function teapotAnimate() {
  teapotAngle += teapotAngleStep;
  quat.setAxisAngle(teapotQuat, Y_AXIS, teapotAngle);
  mat4.fromRotationTranslationScale(
    teapotModelMatrix,
    teapotQuat,
    TEAPOT_TRANSLATION,
    TEAPOT_SCALE
  );
}

function teapotGenerateShape() {
  teapotSetPositionAndIndex();

  var summation = teapotNormalArray;
  var count = [];
  var numVertices = teapotPositionArray.length / 3;
  var numTriangles = teapotIndexArray.length / 3;
  var index = function (i, x) {
    return 3 * i + x;
  };

  for (var i = 0; i < numVertices * 3; i++) {
    summation[i] = 0.0;
  }

  for (var i = 0; i < numVertices; i++) {
    count[i] = 0;
  }

  for (var i = 0; i < numTriangles; i++) {
    teapotIndexArray[index(i, 0)] -= 1;
    teapotIndexArray[index(i, 1)] -= 1;
    teapotIndexArray[index(i, 2)] -= 1;
  }

  for (var i = 0; i < numTriangles; i++) {
    var indices = [
      teapotIndexArray[index(i, 0)],
      teapotIndexArray[index(i, 1)],
      teapotIndexArray[index(i, 2)],
    ];
    var vertices = [
      vec3.fromValues(
        teapotPositionArray[index(indices[0], 0)],
        teapotPositionArray[index(indices[0], 1)],
        teapotPositionArray[index(indices[0], 2)]
      ),
      vec3.fromValues(
        teapotPositionArray[index(indices[1], 0)],
        teapotPositionArray[index(indices[1], 1)],
        teapotPositionArray[index(indices[1], 2)]
      ),
      vec3.fromValues(
        teapotPositionArray[index(indices[2], 0)],
        teapotPositionArray[index(indices[2], 1)],
        teapotPositionArray[index(indices[2], 2)]
      ),
    ];

    var v1 = vec3.create();
    var v2 = vec3.create();
    var normal = vec3.create();
    vec3.subtract(v1, vertices[1], vertices[0]);
    vec3.subtract(v2, vertices[2], vertices[0]);
    vec3.cross(normal, v1, v2);
    vec3.normalize(normal, normal);

    for (var v = 0; v < 3; v++) {
      var origNormal = vec3.fromValues(
        summation[index(indices[v], 0)],
        summation[index(indices[v], 1)],
        summation[index(indices[v], 2)]
      );
      var origCount = count[indices[v]];
      summation[index(indices[v], 0)] =
        (origNormal[0] * origCount + normal[0]) / (origCount + 1.0);
      summation[index(indices[v], 1)] =
        (origNormal[1] * origCount + normal[1]) / (origCount + 1.0);
      summation[index(indices[v], 2)] =
        (origNormal[2] * origCount + normal[2]) / (origCount + 1.0);
      count[indices[v]] = origCount + 1;
    }
  }
}

function teapotSetPositionAndIndex() {
  var request = new XMLHttpRequest();
  request.open("GET", "teapot.json", false); // The third parameter specifies synchronous request
  request.send(null);

  if (request.status === 200) {
    var data = JSON.parse(request.responseText);
    teapotPositionArray = data["vertexPositions"];
    teapotIndexArray = data["indices"];
  } else {
    console.error("Failed to fetch JSON file");
  }
}

/////////////////// SPHERES ////////////////////
var SPHERE_PREFIX = "sphere";
var nslices = 50;
var nstacks = 50;
var radius = 1.0;
var spherePositionBuffer;
var sphereIndexBuffer;
var sphereNormalBuffer;

var spherePositionArray = [];
var sphereIndexArray = [];
var sphereNormalArray = [];

var sphereShaderProgram;
var sphereLocations = {};
var normalTexture;
var sphereModelMatrix = mat4.create();
var sphereAngle = degToRad(200);
var sphereQuat = quat.create();
var sphereAngleStep = degToRad(-0.5);

const spheres = [
  {
    color: vec3.fromValues(32 / 255, 82 / 255, 64 / 255),
    scale: vec3.fromValues(0.08, 0.08, 0.08),
    translate: vec3.fromValues(0.05, -0.1, -0.5),
    texture: 0.0,
  },
  {
    color: vec3.fromValues(2 / 255, 53 / 255, 177 / 255),
    scale: vec3.fromValues(0.06, 0.06, 0.06),
    translate: vec3.fromValues(-0.3, -0.1, -0.25),
    texture: 0.0,
  },
  {
    color: vec3.fromValues(52 / 255, 66 / 255, 125 / 255),
    scale: vec3.fromValues(0.8, 0.05, 0.6),
    translate: vec3.fromValues(0.0, -0.3, 0.0),
    texture: 1.0,
  },
];

var SPHERE_SCALE = vec3.fromValues(0.1, 0.1, 0.1);
var SPHERE_TRANSLATION = vec3.fromValues(0.3, -0.1, 0.0);

var LIGHT_DIRECTION = vec3.fromValues(
  -Math.cos(degToRad(40)),
  Math.sin(degToRad(40)),
  0.0
);
var ENV_AMBIENT_LIGHT_ON = vec3.fromValues(0.08, 0.08, 0.08);
var ENV_AMBIENT_LIGHT_OFF = vec3.fromValues(0.8, 0.8, 0.8);
var SPHERE_COLOR = vec3.fromValues(32 / 255, 82 / 255, 64 / 255);
var DIFFUSE_LIGHT_INIT = vec3.clone(SPHERE_COLOR);
var SPECULAR_LIGHT_INIT = vec3.fromValues(1.0, 1.0, 1.0);

var environment_ambient = ENV_AMBIENT_LIGHT_ON;
var ambient_light = vec3.clone(environment_ambient);
var diffuse_light = vec3.clone(DIFFUSE_LIGHT_INIT);
var specular_light = vec3.clone(SPECULAR_LIGHT_INIT);

function sphereInit() {
  shaderPrefix.push(SPHERE_PREFIX);
  shaderInit[SPHERE_PREFIX] = sphereShaderInit;
  bufferInit[SPHERE_PREFIX] = sphereBufferInit;
  drawFunctions[SPHERE_PREFIX] = sphereDraw;
  animateFunctions[SPHERE_PREFIX] = sphereAnimate;

  sphereGenerateShape();
  setupSphereTextureMap();
}

function sphereShaderInit() {
  sphereShaderProgram = shaderPrograms[SPHERE_PREFIX];

  sphereLocations["aVertexPosition"] = gl.getAttribLocation(
    sphereShaderProgram,
    "aVertexPosition"
  );
  sphereLocations["aVertexNormal"] = gl.getAttribLocation(
    sphereShaderProgram,
    "aVertexNormal"
  );

  sphereLocations["uPMatrix"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uPMatrix"
  );
  sphereLocations["uMVMatrix"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uMVMatrix"
  );
  sphereLocations["uModelMatrix"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uModelMatrix"
  );
  sphereLocations["uEnv"] = gl.getUniformLocation(sphereShaderProgram, "uEnv");

  sphereLocations["uViewOrigin"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uViewOrigin"
  );
  sphereLocations["uLightDirection"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uLightDirection"
  );
  sphereLocations["uAmbientLight"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uAmbientLight"
  );
  sphereLocations["uDiffuseLight"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uDiffuseLight"
  );
  sphereLocations["uSpecularLight"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uSpecularLight"
  );
  sphereLocations["vVertexColor"] = gl.getUniformLocation(
    sphereShaderProgram,
    "vVertexColor"
  );
  sphereLocations["uTextureLocation"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uTextureMap"
  );
  sphereLocations["uTextureEnable"] = gl.getUniformLocation(
    sphereShaderProgram,
    "uTextureEnable"
  );
}

function sphereBufferInit() {
  spherePositionBuffer = gl.createBuffer();
  sphereIndexBuffer = gl.createBuffer();
  sphereNormalBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(spherePositionArray),
    gl.STATIC_DRAW
  );
  spherePositionBuffer.itemSize = 3;
  spherePositionBuffer.numOfItems = spherePositionArray.length / 3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(sphereIndexArray),
    gl.STATIC_DRAW
  );
  sphereIndexBuffer.itemsize = 1;
  sphereIndexBuffer.numOfItems = sphereIndexArray.length;

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(sphereNormalArray),
    gl.STATIC_DRAW
  );
  sphereNormalBuffer.itemSize = 3;
  sphereNormalBuffer.numOfItems = sphereNormalArray.length / 3;
}

function sphereDraw() {
  vec3.scale(ambient_light, environment_ambient, 1.0);
  vec3.scale(diffuse_light, DIFFUSE_LIGHT_INIT, 1.0);
  vec3.scale(specular_light, SPECULAR_LIGHT_INIT, 1.0);

  gl.useProgram(sphereShaderProgram);

  spheres.forEach(({ color, scale, translate, texture }) => {
    SPHERE_COLOR = color;
    SPHERE_SCALE = scale;
    SPHERE_TRANSLATION = translate;
    mat4.fromRotationTranslationScale(
      sphereModelMatrix,
      sphereQuat,
      SPHERE_TRANSLATION,
      SPHERE_SCALE
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
    gl.enableVertexAttribArray(sphereLocations["aVertexPosition"]);
    gl.vertexAttribPointer(
      sphereLocations["aVertexPosition"],
      spherePositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.enableVertexAttribArray(sphereLocations["aVertexNormal"]);
    gl.vertexAttribPointer(
      sphereLocations["aVertexNormal"],
      sphereNormalBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.uniformMatrix4fv(sphereLocations["uPMatrix"], false, pMatrix);
    gl.uniformMatrix4fv(sphereLocations["uMVMatrix"], false, mvMatrix);
    gl.uniformMatrix4fv(
      sphereLocations["uModelMatrix"],
      false,
      sphereModelMatrix
    );
    gl.uniform3fv(sphereLocations["uViewOrigin"], viewOrigin);
    gl.uniform1i(sphereLocations["uEnv"], 0);
    gl.uniform1f(sphereLocations["uTextureEnable"], texture);
    gl.uniform3fv(sphereLocations["uLightDirection"], LIGHT_DIRECTION);
    gl.uniform3fv(sphereLocations["uAmbientLight"], ambient_light);
    gl.uniform3fv(sphereLocations["uDiffuseLight"], diffuse_light);
    gl.uniform3fv(sphereLocations["uSpecularLight"], specular_light);
    gl.uniform3fv(sphereLocations["vVertexColor"], SPHERE_COLOR);

    gl.uniform1i(sphereLocations["uTextureLocation"], 1); // Use texture unit 1

    gl.drawElements(
      gl.TRIANGLES,
      sphereIndexBuffer.numOfItems,
      gl.UNSIGNED_INT,
      0
    );
  });
  gl.disableVertexAttribArray(sphereLocations["aVertexPosition"]);
  gl.disableVertexAttribArray(sphereLocations["aVertexNormal"]);
}

function sphereAnimate() {}

function sphereGenerateShape() {
  var nslices = 50;
  var nstacks = 50;
  var radius = 1.0;
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
      var utex = 1 - j / nstacks;
      var vtex = 1 - i / nslices;

      spherePositionArray.push(
        radius * xcood,
        radius * ycoord,
        radius * zcoord
      );
      sphereNormalArray.push(xcood, ycoord, zcoord);
      // sphereTextureArray.push(utex, vtex);
    }
  }

  // now compute the indices here
  for (var i = 0; i < nslices; i++) {
    for (var j = 0; j < nstacks; j++) {
      var id1 = i * (nstacks + 1) + j;
      var id2 = id1 + nstacks + 1;

      sphereIndexArray.push(id1, id2, id1 + 1);
      sphereIndexArray.push(id2, id2 + 1, id1 + 1);
    }
  }
}

function setupSphereTextureMap() {
  sphereLocations["texture"] = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  var image = new Image();
  image.src = "textures/wood.jpg";
  image.onload = function () {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sphereLocations["texture"]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
  };
}

/////////////////// CUBES //////////////////////
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
var CUBE_COLOR = vec3.fromValues(207 / 255, 207 / 255, 207 / 255);
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
  shaderPrefix.push(CUBE_PREFIX);
  shaderInit[CUBE_PREFIX] = cubeShaderInit;
  bufferInit[CUBE_PREFIX] = cubeBufferInit;
  drawFunctions[CUBE_PREFIX] = cubeDraw;
  animateFunctions[CUBE_PREFIX] = cubeAnimate;

  setupRubiksTextureMap();
}

function cubeShaderInit() {
  cubeShaderProgram = shaderPrograms[CUBE_PREFIX];

  cubeLocations["aVertexPosition"] = gl.getAttribLocation(
    cubeShaderProgram,
    "aVertexPosition"
  );
  cubeLocations["aVertexNormal"] = gl.getAttribLocation(
    cubeShaderProgram,
    "aVertexNormal"
  );

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
  img.src = "textures/rcube.png";
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

/////////////////// STARTERS ///////////////////

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
