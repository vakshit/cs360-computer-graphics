class Init {
  constructor(canvas, vertexShaderCode, fragShaderCode) {
    this.initGL(canvas);

    /** @type {WebGLProgram} */
    this.shaderProgram = null;
    this.initShaders(vertexShaderCode, fragShaderCode);
  }

  initGL(canvas) {
    try {
      /** @type {WebGLRenderingContext} */
      this.gl = canvas.getContext("webgl2");
      this.gl.viewportWidth = canvas.width;
      this.gl.viewportHeight = canvas.height;
      this.gl.enable(this.gl.DEPTH_TEST);
    } catch (e) {
      console.error("initGL() function failed");
    }

    if (!this.gl) {
      alert("[ERROR] WebGL initialization failed!");
    }
  }

  _shaderSetup(shaderCode, type) {
    let shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, shaderCode);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const print_type = type == this.gl.VERTEX_SHADER ? "Vertex" : "Fragment";
      alert(`[ERROR] ${print_type} shader unable to compile!`);
      console.error(this.gl.getShaderInfoLog(shader));
      return null;
    }
    if (type == this.gl.VERTEX_SHADER) this.vertexShader = shader;
    return shader;
  }

  initShaders(vertexShaderCode, fragShaderCode) {
    const shaderProgram = this.gl.createProgram();

    // compile shaders
    var vertexShader = this._shaderSetup(
      vertexShaderCode,
      this.gl.VERTEX_SHADER
    );

    var fragmentShader = this._shaderSetup(
      fragShaderCode,
      this.gl.FRAGMENT_SHADER
    );
    // attach and link shaders
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    // check link status
    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      alert("[ERROR] Shader program unable to link!");
      console.error(this.gl.getShaderInfoLog(vertexShader));
      console.error(this.gl.getShaderInfoLog(fragmentShader));
    }
    this.gl.useProgram(shaderProgram);
    this.shaderProgram = shaderProgram;
    this.setupLocations();
  }

  setupLocations() {
    this.aPositionLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "aPosition"
    );
    this.uMMatrixLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uMMatrix"
    );
    this.uVMatrixLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uVMatrix"
    );
    this.uPMatrixLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uPMatrix"
    );
    this.uColorLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "objColor"
    );
    this.lightLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "lightLocation"
    );
    this.gl.enableVertexAttribArray(this.aPositionLocation);
  }

  clear(baseColour) {
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.clearColor(...normalizeColor(baseColour));
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
