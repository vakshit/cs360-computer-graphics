const webGLStart = () => {
  var canvas = document.getElementById("canvas");
  /** @type {Viewport} */
  const shapes = new Viewport(
    canvas,
    2,
    [240.0, 240.0, 240.0, 255.0],
    window.vertexShaderCode,
    window.fragShaderCode
  );
  shapes.drawCube(
    mat4.identity(mat4.create()),
    mat4.identity(mat4.create()),
    mat4.identity(mat4.create()),
    [1, 0, 0, 1]
  );
  shapes.drawSphere(
    mat4.identity(mat4.create()),
    mat4.identity(mat4.create()),
    mat4.identity(mat4.create()),
    [1, 0, 0, 1]
  );
  canvas.addEventListener(
    "ondrag",
    (e) => {
      console.log(e);
    },
    false
  );
  // window.type = init.gl.POINTS;

  // /** @type {Draw} */
  // const draw = new Draw(init.gl, init.shaderProgram);
  // start(init.gl, draw);
};
