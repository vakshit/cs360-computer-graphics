/** @type {WebGLRenderingContext} */
var gl;

const vertexShaderCode = `#version 300 es
in vec2 aPosition;
in vec3 aColor;
out vec3 fColor;

void main(){
  fColor = aColor;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;
in vec3 fColor;

void main(){
  fragColor = vec4(fColor, 1.0);
}`;

const initGL = (canvas) => {
  try {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
    console.error("initGL() function failed");
  }

  if (!gl) {
    alert("[ERROR] WebGL initialization failed!");
  }
};

const vertexShaderSetup = (vertexShaderCode) => {
  let shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("[ERROR] Vertex shader unable to compile!");
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
};

const fragmentShaderSetup = (fragmentShaderCode) => {
  let shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragmentShaderCode);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("[ERROR] Fragment shader unable to compile!");
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
};

const initShaders = () => {
  let shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragmentShaderCode);

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("[ERROR] Shader program unable to link!");
    console.error(gl.getShaderInfoLog(vertexShader));
    console.error(gl.getShaderInfoLog(fragmentShader));
  }

  gl.useProgram(shaderProgram);
  return shaderProgram;
};

const drawScene = (shaderProgram) => {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  const aColorLocation = gl.getAttribLocation(shaderProgram, "aColor");

  const bufData = new Float32Array([
    0.0, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, -0.5, 0.0, 0.0,
    1.0,
  ]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, bufData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 5 * 4, 0);
  gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

  gl.enableVertexAttribArray(aPositionLocation);
  gl.enableVertexAttribArray(aColorLocation);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};

const webGLStart = () => {
  var canvas = document.getElementById("canvas");
  initGL(canvas);

  var shaderProgram = initShaders();
  console.log(gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
  console.log(shaderProgram);
  drawScene(shaderProgram);
};
