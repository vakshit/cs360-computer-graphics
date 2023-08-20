/** @type {WebGLRenderingContext} */
var gl;

const drawMountains = (figures) => {
  // left mountain
  figures.mountain(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [-0.62, 0.08, 1.0]),
      [0.8, 0.8, 1.0]
    )
  );

  // right mountain
  figures.mountain(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.73, 0.08, 1.0]),
      [0.6, 0.6, 1.0]
    )
  );

  // mid mountain
  figures.mountain(
    mat4.translate(mat4.identity(mat4.create()), [0.0, 0.12, 1.0])
  );
};

const drawTrees = (figures) => {
  // rightmost tree
  figures.tree(
    mat4.translate(mat4.identity(mat4.create()), [0.75, 0.165, 1.0])
  );
  // mid tree
  figures.tree(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.45, 0.18, 1.0]),
      [1.1, 1.1, 1.1]
    )
  );
  // leftmost tree
  figures.tree(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.2, 0.14, 1.0]),
      [0.8, 0.8, 1.0]
    )
  );
};

const drawBushes = (figures) => {
  // house right
  figures.bush(
    mat4.translate(mat4.identity(mat4.create()), [-0.25, -0.54, 1.0])
  );

  // house left
  figures.bush(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [-0.9, -0.57, 1.0]),
      [0.7, 0.8, 1.0]
    )
  );

  // bottom
  figures.bush(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [-0.1, -1.02, 1.0]),
      [1.7, 1.4, 1.0]
    )
  );

  // right
  figures.bush(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [1.0, -0.4, 1.0]),
      [1.3, 1.3, 1.0]
    )
  );
};

const painting = (shaderProgram, draw) => {
  /** @type {Figures} */
  const figures = new Figures(draw);
  mMatrix = mat4.create();

  matrixStack = [];
  clearCanvas(gl);

  // initialize the model matrix to identity matrix
  mat4.identity(mMatrix);

  figures.sky(mat4.create(mMatrix));

  drawMountains(figures);

  figures.sun(mat4.translate(mat4.identity(mat4.create()), [-0.7, 0.8, 1.0]));
  figures.bird(mat4.translate(mat4.identity(mat4.create()), [-0.7, 0.8, 1.0]));
  figures.cloud(mat4.translate(mat4.identity(mat4.create()), [-0.7, 0.8, 1.0]));

  drawTrees(figures);

  figures.lawn(mat4.create(mMatrix));

  figures.river(mat4.create(mMatrix));

  figures.boat(mat4.translate(mat4.identity(mat4.create()), [0.0, -0.05, 1.0]));

  drawBushes(figures);
  figures.car(mat4.translate(mat4.identity(mat4.create()), [-0.52, -0.8, 1.0]));

  figures.home(mat4.translate(mat4.identity(mat4.create()), [-0.6, -0.5, 1.0]));
};

const webGLStart = () => {
  var canvas = document.getElementById("canvas");
  const init = new Init(canvas);
  /** @type {Draw} */
  const draw = new Draw(gl, init.shaderProgram);
  painting(init.shaderProgram, draw);
};
