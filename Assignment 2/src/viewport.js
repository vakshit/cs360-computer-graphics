class Viewport extends Figures {
  constructor(id, baseColour, vertexShaderCode, fragShaderCode) {
    const canvas = document.getElementById(`canvas${id}`);
    super(canvas, baseColour, vertexShaderCode, fragShaderCode);
    this.id = id;
    this.degreeX = 0;
    this.degreeY = 0;
    this.render(0, 0);
    this._addEventListeners(canvas);
  }

  _addEventListeners(canvas) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let deltaX = 0;
    let deltaY = 0;

    // Mouse event listeners
    canvas.addEventListener("mousedown", (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      isDragging = true;
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
      this.degreeX += deltaX;
      this.degreeY += deltaY;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const newX = e.clientX;
      const newY = e.clientY;

      deltaX = newX - lastX;
      deltaY = newY - lastY;

      this.render((this.degreeX + deltaX) * 0.2, (this.degreeY + deltaY) * 0.2);
    });
  }

  render(degreeX, degreeY) {
    if (this.id === 1) {
      this.canvas1(degreeX, degreeY);
    }
    if (this.id === 2) {
      this.canvas2(degreeX, degreeY);
    }
    if (this.id === 3) {
      this.canvas2(degreeX, degreeY);
    }
  }
}
