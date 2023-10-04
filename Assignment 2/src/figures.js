class Figures extends Polygons {
  constructor(
    canvas,
    baseColour,
    lightLocation,
    vertexShaderCode,
    fragShaderCode
  ) {
    super(canvas, lightLocation, vertexShaderCode, fragShaderCode);

    this.baseColour = baseColour;
  }
  canvas1(degreeX, degreeY) {
    // clear the canvas
    this.clear(this.baseColour);

    // initial rotation to account for drag movement
    let mMatrix = mat4.identity(mat4.create());
    mMatrix = mat4.translate(mMatrix, [0.0, -0.3, 0.0]);
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
      mMatrix = mat4.scale(mMatrix, [0.8, 0.8, 0.8]);
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
      mMatrix = mat4.scale(mMatrix, [0.45, 0.45, 0.45]);
      mMatrix = mat4.rotate(mMatrix, degToRad(60), [0.0, 0.0, 1.0]);
      mMatrix = mat4.translate(mMatrix, [-1.0, 0.75, 0.0]);

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
      mMatrix = mat4.translate(mMatrix, [-0.3, 0.15, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 0.4]);
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
      mMatrix = mat4.translate(mMatrix, [0.1, 0.4, 0.1]);
      mMatrix = mat4.scale(mMatrix, [0.3, 0.3, 0.3]);
      mMatrix = mat4.rotateY(mMatrix, degToRad(20));
      mMatrix = mat4.rotateX(mMatrix, degToRad(20));
      // mMatrix = mat4.rotate(mMatrix, degToRad(45), [0.0, 1.0, 1.0]);
      this.drawCube(
        mMatrix,
        mat4.identity(mat4.create()),
        mat4.identity(mat4.create()),
        cubeColor
      );
    }
  }
}
