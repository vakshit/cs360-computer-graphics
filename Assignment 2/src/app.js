const webGLStart = () => {
  /** @type {Viewport} */
  const shapes1 = new Viewport(
    1,
    [182, 192, 217, 200.0],
    [0.0, 0.0, 4.0],
    window.vertexShaderCode_flat,
    window.fragShaderCode_flat
  );

  /** @type {Viewport} */
  const shapes2 = new Viewport(
    2,
    [245, 213, 232, 225.0],
    [2.0, 2.0, 2.0],
    window.vertexShaderCode_flat,
    window.fragShaderCode_flat
  );

  /** @type {Viewport} */
  const shapes3 = new Viewport(
    3,
    [220, 242, 218, 230.0],
    [2.0, 2.0, 2.0],
    window.vertexShaderCode_flat,
    window.fragShaderCode_flat
  );
};
