/** Identification prefix for sphere shader. */
var SPHERE_PREFIX = "sphere";

/** GL buffers for spheres. */
var spherePositionBuffer;
var sphereIndexBuffer;
var sphereNormalBuffer;

/** Data array for spheres. */
var spherePositionArray = [];
var sphereIndexArray = [];
var sphereNormalArray = [];

/** Shader program for spheres. */
var sphereShaderProgram;
/** Variable locations in shader program. */
var sphereLocations = {};
/** Texture of normal map. */
var normalTexture;

/** Model-to-world matrix of the sphere. */
var sphereModelMatrix = mat4.create();
/** Rotation angle of sphere. */
var sphereAngle = degToRad(200);
/** Quaternion of sphere's rotation. */
var sphereQuat = quat.create();
/** Rotation speed of sphere */
var sphereAngleStep = degToRad(-0.5);

const spheres = [
  {
    color: vec3.fromValues(32 / 255, 82 / 255, 64 / 255),
    scale: vec3.fromValues(0.1, 0.1, 0.1),
    translate: vec3.fromValues(0.3, -0.1, 0.0),
    texture: 0.0,
  },
  {
    color: vec3.fromValues(52 / 255, 66 / 255, 125 / 255),
    scale: vec3.fromValues(0.1, 0.1, 0.1),
    translate: vec3.fromValues(0.5, -0.1, 0.0),
    texture: 0.0,
  },
  {
    color: vec3.fromValues(52 / 255, 66 / 255, 125 / 255),
    scale: vec3.fromValues(0.8, 0.05, 0.6),
    translate: vec3.fromValues(0.0, -0.3, 0.0),
    texture: 1.0,
  },
];

/** Model-to-World scale of sphere */
var SPHERE_SCALE = vec3.fromValues(0.1, 0.1, 0.1);
/** Model-to-World translation of sphere */
var SPHERE_TRANSLATION = vec3.fromValues(0.3, -0.1, 0.0);

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
var SPHERE_COLOR = vec3.fromValues(32 / 255, 82 / 255, 64 / 255);
var DIFFUSE_LIGHT_INIT = vec3.clone(SPHERE_COLOR);
/** Soft warm sunlight (RGB = 253,184,19) for specular light if light is enabled. */
var SPECULAR_LIGHT_INIT = vec3.fromValues(1.0, 1.0, 1.0);

/** Environment ambient light (based on whether reflection is enabled).*/
var environment_ambient = ENV_AMBIENT_LIGHT_ON;
/** Actual light (subject to changed by interfaces. */
var ambient_light = vec3.clone(environment_ambient);
var diffuse_light = vec3.clone(DIFFUSE_LIGHT_INIT);
var specular_light = vec3.clone(SPECULAR_LIGHT_INIT);

/** Initialization of sphere.js */
function sphereInit() {
  /** Register shaders, draw calls, animate calls. */
  shaderPrefix.push(SPHERE_PREFIX);
  shaderInit[SPHERE_PREFIX] = sphereShaderInit;
  bufferInit[SPHERE_PREFIX] = sphereBufferInit;
  drawFunctions[SPHERE_PREFIX] = sphereDraw;
  animateFunctions[SPHERE_PREFIX] = sphereAnimate;

  /** Initialize sphere and normal map. */
  sphereGenerateShape();
  setupSphereTextureMap();
}

/** Initialize sphere's shader programs and variable locations. */
function sphereShaderInit() {
  sphereShaderProgram = shaderPrograms[SPHERE_PREFIX];

  /** Attributes */
  sphereLocations["aVertexPosition"] = gl.getAttribLocation(
    sphereShaderProgram,
    "aVertexPosition"
  );
  sphereLocations["aVertexNormal"] = gl.getAttribLocation(
    sphereShaderProgram,
    "aVertexNormal"
  );

  /** Uniforms */
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

/** Initialize sphere's buffer. */
function sphereBufferInit() {
  // create buffers
  spherePositionBuffer = gl.createBuffer();
  sphereIndexBuffer = gl.createBuffer();
  sphereNormalBuffer = gl.createBuffer();
  // spTextureBuffer = gl.createBuffer();

  // bind buffers
  // buffer for vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(spherePositionArray),
    gl.STATIC_DRAW
  );
  spherePositionBuffer.itemSize = 3;
  spherePositionBuffer.numOfItems = spherePositionArray.length / 3;

  // buffer for indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(sphereIndexArray),
    gl.STATIC_DRAW
  );
  sphereIndexBuffer.itemsize = 1;
  sphereIndexBuffer.numOfItems = sphereIndexArray.length;

  // buffer for normals
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(sphereNormalArray),
    gl.STATIC_DRAW
  );
  sphereNormalBuffer.itemSize = 3;
  sphereNormalBuffer.numOfItems = sphereNormalArray.length / 3;

  // // buffer for texture coordinates
  // gl.bindBuffer(gl.ARRAY_BUFFER, spTextureBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereTex), gl.STATIC_DRAW);
  // spTextureBuffer.itemSize = 2;
  // spTextureBuffer.numOfItems = sphereTex.length / 2;
}

/** Airplane draw call */
function sphereDraw() {
  /** Update lights based on interface settings. */
  vec3.scale(ambient_light, environment_ambient, lightEnable);
  vec3.scale(diffuse_light, DIFFUSE_LIGHT_INIT, lightEnable);
  vec3.scale(specular_light, SPECULAR_LIGHT_INIT, lightEnable);

  /** Setup variables. */
  gl.useProgram(sphereShaderProgram);

  spheres.forEach(({ color, scale, translate, texture }) => {
    /** Draw Sphere 1! */
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
  /** Destructor */
  gl.disableVertexAttribArray(sphereLocations["aVertexPosition"]);
  gl.disableVertexAttribArray(sphereLocations["aVertexNormal"]);
}

/**
 * Airplane animate call
 *
 * @param {float} lapse timelapse since last frame in sec
 */
function sphereAnimate() {
  // /** Update model-to-world matrix. */
  // mat4.fromRotationTranslationScale(
  //   sphereModelMatrix,
  //   sphereQuat,
  //   SPHERE_TRANSLATION,
  //   SPHERE_SCALE
  // );
}

/** Generate sphere model. */
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
var nslices = 50;
var nstacks = 50;
var radius = 1.0;
/** Setup normal map. */
function setupSphereTextureMap() {
  /** Set up texture. */
  sphereLocations["texture"] = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  var image = new Image();
  image.src = "wood.jpg";
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
