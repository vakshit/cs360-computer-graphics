class Draw {
  constructor(gl, shaderProgram) {
    this.shaderProgram = shaderProgram;

    this.animation;
    this.degree0 = 0;
    this.degree1 = 0;

    // mMatrix is called the model matrix, transforms objects
    // from local object space to world space.

    this.uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
    this.aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
    this.uColorLoc = gl.getUniformLocation(shaderProgram, "color");

    this.circleBuf;
    this.triangleBuf;
    this.triangleIndexBuf;
    this.circleIndexBuf;
    this.sqVertexPositionBuffer;
    this.sqVertexIndexBuffer;

    //enable the attribute arrays
    gl.enableVertexAttribArray(this.aPositionLocation);
  }

  initSquareBuffer() {
    // buffer for point locations
    const sqVertices = new Float32Array([
      0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    ]);
    this.sqVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sqVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sqVertices, gl.STATIC_DRAW);
    this.sqVertexPositionBuffer.itemSize = 2;
    this.sqVertexPositionBuffer.numItems = 4;

    // buffer for point indices
    const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    this.sqVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sqVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
    this.sqVertexIndexBuffer.itemsize = 1;
    this.sqVertexIndexBuffer.numItems = 6;
  }

  initTriangleBuffer() {
    // buffer for point locations
    const triangleVertices = new Float32Array([
      0.0, 0.5, -0.5, -0.5, 0.5, -0.5,
    ]);
    this.triangleBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    this.triangleBuf.itemSize = 2;
    this.triangleBuf.numItems = 3;

    // buffer for point indices
    const triangleIndices = new Uint16Array([0, 1, 2]);
    this.triangleIndexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
    this.triangleIndexBuf.itemsize = 1;
    this.triangleIndexBuf.numItems = 3;
  }

  square(color, mMatrix) {
    gl.uniformMatrix4fv(this.uMMatrixLocation, false, mMatrix);

    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sqVertexPositionBuffer);
    gl.vertexAttribPointer(
      this.aPositionLocation,
      this.sqVertexPositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    // buffer for point indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sqVertexIndexBuffer);
    gl.uniform4fv(this.uColorLoc, color);

    // now draw the square
    gl.drawElements(
      gl.TRIANGLES,
      this.sqVertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  triangle(color, mMatrix) {
    gl.uniformMatrix4fv(this.uMMatrixLocation, false, mMatrix);

    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleBuf);
    gl.vertexAttribPointer(
      this.aPositionLocation,
      this.triangleBuf.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    // buffer for point indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuf);

    gl.uniform4fv(this.uColorLoc, color);

    // now draw the square
    gl.drawElements(
      gl.TRIANGLES,
      this.triangleIndexBuf.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}
