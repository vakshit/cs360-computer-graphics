class Figures extends Polygons {
  constructor(canvas, baseColour, vertexShaderCode, fragShaderCode) {
    super(canvas, vertexShaderCode, fragShaderCode);

    this.baseColour = baseColour;
  }
  canvas1(degreeX, degreeY) {
    // clear the canvas
    this.clear(this.baseColour);

    // initial rotation to account for drag movement
    let mMatrix = mat4.identity(mat4.create());
    mMatrix = mat4.rotateX(mMatrix, degToRad(degreeY));
    mMatrix = mat4.rotateY(mMatrix, degToRad(degreeX));

    let stack = [];
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.5, 0.9, 0.5]);
    this.drawCube(
      mMatrix,
      mat4.identity(mat4.create()),
      mat4.identity(mat4.create()),
      normalizeColor([194, 193, 165, 255])
    );
    mMatrix = popMatrix(stack);
    mMatrix = mat4.translate(mMatrix, [0.0, 0.7, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.5, 0.5, 0.5]);

    this.drawSphere(
      mMatrix,
      mat4.identity(mat4.create()),
      mat4.identity(mat4.create()),
      normalizeColor([10, 111, 173, 255])
    );
  }

  canvas2(degreeX, degreeY) {
    // clear the canvas
    const sphereColor = normalizeColor([189, 190, 191, 255]);
    const cubeColor = normalizeColor([172, 242, 138, 255]);
    this.clear(this.baseColour);

    // initial rotation to account for drag movement
    let mMatrix = mat4.identity(mat4.create());
    mMatrix = mat4.rotateX(mMatrix, degToRad(degreeY));
    mMatrix = mat4.rotateY(mMatrix, degToRad(degreeX));

    let stack = [];
    pushMatrix(stack, mMatrix);

    {
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [0.0, -0.55, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.7, 0.7, 0.7]);
      this.drawSphere(
        mMatrix,
        mat4.identity(mat4.create()),
        mat4.identity(mat4.create()),
        sphereColor
      );
      mMatrix = popMatrix(stack);
    }

    {
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [-0.45, -0.2, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 0.4]);
      mMatrix = mat4.rotate(mMatrix, degToRad(60), [0.0, 0.0, 1.0]);

      this.drawCube(
        mMatrix,
        mat4.identity(mat4.create()),
        mat4.identity(mat4.create()),
        cubeColor
      );
      mMatrix = popMatrix(stack);
    }

    {
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [-0.25, 0.15, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.35, 0.35, 0.35]);
      this.drawSphere(
        mMatrix,
        mat4.identity(mat4.create()),
        mat4.identity(mat4.create()),
        sphereColor
      );
    }
  }
}
