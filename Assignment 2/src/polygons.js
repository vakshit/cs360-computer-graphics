class Polygons extends Buffer {
  constructor(canvas, vertexShaderCode, fragShaderCode) {
    super(canvas, vertexShaderCode, fragShaderCode);

    // this.drawMode = drawMode;
  }

  _draw(buffer, mMatrix, vMatrix, pMatrix, color) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.vertex);
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      buffer.vertex.itemSize,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer.index);
    this.gl.uniform4fv(this.uColorLocation, color);
    this.gl.uniformMatrix4fv(this.uMMatrixLocation, false, mMatrix);
    this.gl.uniformMatrix4fv(this.uVMatrixLocation, false, vMatrix);
    this.gl.uniformMatrix4fv(this.uPMatrixLocation, false, pMatrix);
    this.gl.drawElements(
      this.gl.LINE_LOOP,
      buffer.index.numItems,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  drawCube(mMatrix, vMatrix, pMatrix, color) {
    this._draw(this.cube, mMatrix, vMatrix, pMatrix, color);
  }

  drawSphere(mMatrix, vMatrix, pMatrix, color) {
    this._draw(this.sphere, mMatrix, vMatrix, pMatrix, color);
  }
}
