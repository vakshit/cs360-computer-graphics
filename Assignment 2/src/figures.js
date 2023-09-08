class Figures extends Polygons {
  constructor(canvas, drawMode, baseColour, vertexShaderCode, fragShaderCode) {
    super(canvas, drawMode, vertexShaderCode, fragShaderCode);
    this.drawMode = drawMode;
    this.baseColour = baseColour;
  }

  canvas1(degreeX, degreeY) {
    this.clear(this.baseColour);
    let mMatrix = mat4.identity(mat4.create());
    mMatrix = mat4.rotateX(mMatrix, degToRad(degreeY));
    mMatrix = mat4.rotateY(mMatrix, degToRad(degreeX));
    this.drawCube(
      mMatrix,
      mat4.identity(mat4.create()),
      mat4.identity(mat4.create()),
      [1, 0, 0, 1]
    );
    this.drawSphere(
      mMatrix,
      mat4.identity(mat4.create()),
      mat4.identity(mat4.create()),
      [1, 0, 0, 1]
    );
  }
}
