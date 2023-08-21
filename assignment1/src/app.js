/** @type {WebGLRenderingContext} */
var gl;
var animation;
window.type;

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

const drawBirds = (figures) => {
  // near tree
  figures.bird(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.13, 0.63, 1.0]),
      [0.6, 0.6, 1.0]
    )
  );

  // left to near tree
  figures.bird(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [-0.17, 0.7, 1.0]),
      [0.5, 0.5, 1.0]
    )
  );

  // right to near tree
  figures.bird(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.3, 0.8, 1.0]),
      [0.45, 0.45, 1.0]
    )
  );

  // above this
  figures.bird(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.02, 0.78, 1.0]),
      [0.3, 0.3, 1.0]
    )
  );

  figures.bird(
    mat4.scale(
      mat4.translate(mat4.identity(mat4.create()), [0.13, 0.82, 1.0]),
      [0.2, 0.2, 1.0]
    )
  );
};

const painting = (sunDegree, windmillDegree, boatTranslation, draw) => {
  /** @type {Figures} */
  const figures = new Figures(draw);

  mMatrix = mat4.create();
  clearCanvas(gl);

  // initialize the model matrix to identity matrix
  mat4.identity(mMatrix);

  figures.sky(mat4.create(mMatrix));

  drawMountains(figures);

  figures.sun(
    mat4.rotateZ(
      mat4.translate(mat4.identity(mat4.create()), [-0.7, 0.8, 1.0]),
      degToRad(sunDegree)
    )
  );

  drawBirds(figures);

  figures.cloud(
    mat4.translate(mat4.identity(mat4.create()), [-0.65, 0.53, 1.0])
  );

  drawTrees(figures);

  figures.lawn(mat4.create(mMatrix));

  figures.river(mat4.create(mMatrix));

  figures.boat(
    mat4.translate(mat4.identity(mat4.create()), [boatTranslation, -0.05, 1.0])
  );

  drawBushes(figures);
  figures.windmill(
    mat4.translate(mat4.identity(mat4.create()), [0.65, 0.1, 1.0]),
    windmillDegree
  );
  figures.windmill(
    mat4.translate(mat4.identity(mat4.create()), [-0.5, 0.06, 1.0]),
    windmillDegree
  );
  figures.car(mat4.translate(mat4.identity(mat4.create()), [-0.52, -0.8, 1.0]));

  figures.home(mat4.translate(mat4.identity(mat4.create()), [-0.6, -0.5, 1.0]));
};

const start = (draw) => {
  if (animation) {
    window.cancelAnimationFrame(animation);
  }
  let sunDegree = 0,
    windmillDegree = 0,
    boatTranslation = 0,
    direction = 1;

  var animate = () => {
    painting(sunDegree, windmillDegree, boatTranslation, draw);
    sunDegree += 0.3;
    windmillDegree -= 0.3;
    if (boatTranslation > 0.8) {
      direction = 0;
    } else if (boatTranslation < -0.8) {
      direction = 1;
    }
    if (direction) {
      boatTranslation += 0.003;
    } else {
      boatTranslation -= 0.003;
    }

    animation = window.requestAnimationFrame(animate);
  };

  animate();
};

const toggleType = (draw_type) => {
  if (draw_type === "point") {
    window.type = gl.POINTS;
  } else if (draw_type === "line") {
    window.type = gl.LINE_LOOP;
  } else if (draw_type === "fill") {
    window.type = gl.TRIANGLES;
  }
};

const webGLStart = () => {
  var canvas = document.getElementById("canvas");
  const init = new Init(canvas);
  window.type = gl.POINTS;

  /** @type {Draw} */
  const draw = new Draw(gl, init.shaderProgram);
  start(draw);
};
