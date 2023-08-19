/** @type {WebGLRenderingContext} */
var gl;

const drawScene = (shaderProgram, draw) => {
  mMatrix = mat4.create();
  matrixStack = [];
  clearCanvas(gl);

  // initialize the model matrix to identity matrix
  mat4.identity(mMatrix);

  //// This translation applies to both the objects below
  //mMatrix = mat4.translate(mMatrix, [0.0, 0.2, 0]);

  pushMatrix(matrixStack, mMatrix);
  let color = [0.8, 0, 0, 1];
  // //local rotation operation for the square
  mMatrix = mat4.rotate(mMatrix, degToRad(20), [0, 0, 1]);
  // //local scale operation for the square
  mMatrix = mat4.scale(mMatrix, [0.5, 1, 1.0]);
  draw.square(color, mMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  // //local translation operation for the circle
  mMatrix = mat4.translate(mMatrix, [0.2, 0.0, 0]);
  // //local scale operation for the circle
  mMatrix = mat4.scale(mMatrix, [1.0, 0.5, 1.0]);
  color = [0.4, 0.9, 0, 1];
  draw.triangle(color, mMatrix);
  mMatrix = popMatrix(matrixStack);
};

const webGLStart = () => {
  var canvas = document.getElementById("canvas");
  const init = new Init(gl, canvas);
  const draw = new Draw(gl, init.shaderProgram);
  draw.initSquareBuffer();
  draw.initTriangleBuffer();
  drawScene(init.shaderProgram, draw);
};
