class Viewport extends Figures {
  constructor(canvas, drawMode, baseColour, vertexShaderCode, fragShaderCode) {
    super(canvas, drawMode, baseColour, vertexShaderCode, fragShaderCode);
    this.degreeX = 0;
    this.degreeY = 0;
    this.canvas1(0, 0);
    this._addEventListeners(canvas);
  }

  _addEventListeners(canvas) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    // Mouse event listeners
    canvas.addEventListener("mousedown", (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      isDragging = true;
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      // console.log("moving");
      const newX = e.clientX;
      const newY = e.clientY;
      // console.log(newX, newY);
      // console.log(lastX, lastY);
      const deltaX = newX - lastX;
      const deltaY = newY - lastY;
      this.degreeX += deltaX;
      this.degreeY += deltaY;
      // console.log(this.deltaX, this.deltaY);

      // // Rotate the object based on mouse movement
      // const rotationAngle = deltaX * 0.01; // Adjust the rotation speed as needed
      // mat4.rotateY(rotationMatrix, rotationMatrix, rotationAngle);

      // // Render the object with the new rotation
      // render();
      this.canvas1(this.degreeX * 0.1, this.degreeY * 0.1);
      // lastX = newX;
      // lastY = newY;
    });
  }
}
