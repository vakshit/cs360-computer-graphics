class Init {
  constructor(gl, canvas) {
    this.vertexShader = null;
    this.fragmentShader = null;
    this.shaderProgram = null;

    this.initGL(canvas);
    this.initShaders();
  }

  initGL(canvas) {
    try {
      gl = canvas.getContext("webgl2");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch (e) {
      console.error("initGL() function failed");
    }

    if (!gl) {
      alert("[ERROR] WebGL initialization failed!");
    }
  }
  shaderSetup(shaderCode, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, shaderCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const print_type = type == gl.VERTEX_SHADER ? "Vertex" : "Fragment";
      alert(`[ERROR] ${print_type} shader unable to compile!`);
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    if (type == gl.VERTEX_SHADER) this.vertexShader = shader;
    else this.fragmentShader = shader;
    return shader;
  }

  initShaders() {
    let shaderProgram = gl.createProgram();
    var vertexShader = this.shaderSetup(
      window.vertexShaderCode,
      gl.VERTEX_SHADER
    );
    var fragmentShader = this.shaderSetup(
      window.fragShaderCode,
      gl.FRAGMENT_SHADER
    );

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("[ERROR] Shader program unable to link!");
      console.error(gl.getShaderInfoLog(vertexShader));
      console.error(gl.getShaderInfoLog(fragmentShader));
    }

    gl.useProgram(shaderProgram);
    this.shaderProgram = shaderProgram;
    return shaderProgram;
  }
}
