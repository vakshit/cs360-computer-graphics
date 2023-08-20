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

    this.triangleBuf;
    this.triangleIndexBuf;
    this.sqVertexPositionBuffer;
    this.sqVertexIndexBuffer;
    this.circleBuf;
    this.wingBuf;

    //enable the attribute arrays
    gl.enableVertexAttribArray(this.aPositionLocation);
    this.initSquareBuffer();
    this.initTriangleBuffer();
    this.initCircleBuffer();
    this.initWingBladeBuffer();
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

  initCircleBuffer() {
    // Define circle vertices
    const radius = 1;
    const segments = 100;
    const vertices = [];
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      vertices.push(x, y);
    }

    this.circleBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.circleBuf.itemSize = 2;
    this.circleBuf.numItems = segments;
  }

  initWingBladeBuffer() {
    // buffer for point locations
    const triangleVertices = new Float32Array([
      0.0, 0.0, -0.04, -0.22, 0.04, -0.22,
    ]);
    this.wingBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wingBuf);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    this.wingBuf.itemSize = 2;
    this.wingBuf.numItems = 3;

    // buffer for point indices
    const triangleIndices = new Uint16Array([0, 1, 2]);
    this.triangleIndexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
    this.triangleIndexBuf.itemsize = 1;
    this.triangleIndexBuf.numItems = 3;
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

  circle(color, mMatrix) {
    gl.uniformMatrix4fv(this.uMMatrixLocation, false, mMatrix);

    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuf);
    gl.vertexAttribPointer(
      this.aPositionLocation,
      this.circleBuf.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.uniform4fv(this.uColorLoc, color);

    // now draw the circle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.circleBuf.numItems);
  }

  wingBlade(color, mMatrix) {
    gl.uniformMatrix4fv(this.uMMatrixLocation, false, mMatrix);

    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wingBuf);
    gl.vertexAttribPointer(
      this.aPositionLocation,
      this.wingBuf.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.uniform4fv(this.uColorLoc, color);

    // now draw the circle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.wingBuf.numItems);
  }

  trapezium(color, mMatrix) {
    let stack = [];
    // roof square
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, 0.21, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.205, 1.0]);
    this.square(color, mMatrix);
    mMatrix = popMatrix(stack);

    // roof right triangle
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.2, 0.21, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.205, 1.0]);
    this.triangle(color, mMatrix);
    mMatrix = popMatrix(stack);

    // roof left triangle
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.2, 0.21, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.205, 1.0]);
    this.triangle(color, mMatrix);
    mMatrix = popMatrix(stack);
  }
}
