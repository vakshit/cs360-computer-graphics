var vertexShaderCode = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition, 0, 1);
}
`;

var fragmentShaderCode = `#version 300 es
precision mediump float;

in vec2 vTexCoord;

out vec4 fragColor;

uniform sampler2D backgroundSampler;
uniform sampler2D foregroundSampler;

uniform float background;
uniform float contrast;
uniform float brightness;

uniform float greyCheck;
uniform float sepiaCheck;

uniform float gradientCheck;
uniform float smoothCheck;
uniform float sharpenCheck;
uniform float laplacianCheck;

void grayScale(vec4 color) {
  float gray = 0.2126f * color.r + 0.7152f * color.g + 0.0722f * color.b;
  fragColor = vec4(gray, gray, gray, color.a);
}

void sepia(vec4 color) {

  fragColor.r = dot(color.rgb, vec3(0.393f, 0.769f, 0.189f));
  fragColor.g = dot(color.rgb, vec3(0.349f, 0.686f, 0.168f));
  fragColor.b = dot(color.rgb, vec3(0.272f, 0.534f, 0.131f));
  fragColor.a = color.a;
}

void gradient() {
  vec2 pixel = vec2(1, 1) / vec2(textureSize(backgroundSampler, 0));
  vec4 up = texture(backgroundSampler, vTexCoord + 5.0f * pixel * vec2(0, -1));
  vec4 down = texture(backgroundSampler, vTexCoord + 5.0f * pixel * vec2(0, 1));
  vec4 right = texture(backgroundSampler, vTexCoord + 5.0f * pixel * vec2(1, 0));
  vec4 left = texture(backgroundSampler, vTexCoord + 5.0f * pixel * vec2(-1, 0));
  vec4 dy = (up - down);
  vec4 dx = (right - left);
  vec4 gradMag = sqrt(dx * dx + dy * dy);
  if(gradMag.r < 0.1f || gradMag.g < 0.1f || gradMag.b < 0.1f)
    fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
}

void smoothen(vec4 color) {
  vec2 pixel = vec2(1, 1) / vec2(textureSize(backgroundSampler, 0));
  const float kernel[9] = float[9](1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f);
  vec4 smoothedColor = color / 9.0f;
  int index = 0;
  for(int x = -1; x <= 1; x++) {
    for(int y = -1; y <= 1; y++) {
      smoothedColor += texture(backgroundSampler, vTexCoord + 5.0f * pixel * vec2(float(x), float(y))) * kernel[index];
      index++;
    }
  }
  fragColor = vec4((smoothedColor / 9.0f).rgb, color.a);
}

void sharpen(vec4 color) {
  vec2 pixel = vec2(1, 1) / vec2(textureSize(backgroundSampler, 0));
  const float kernel[9] = float[9](0.0f, -1.0f, 0.0f, -1.0f, 5.0f, -1.0f, 0.0f, -1.0f, 0.0f);
  vec4 smoothedColor = color / 9.0f;
  int index = 0;
  for(int x = -1; x <= 1; x++) {
    for(int y = -1; y <= 1; y++) {
      smoothedColor += texture(backgroundSampler, vTexCoord + 5.0f * pixel * vec2(float(x), float(y))) * kernel[index];
      index++;
    }
  }
  fragColor = vec4((smoothedColor).rgb, color.a);
}

void laplacian(vec4 color) {
  vec2 pixel = vec2(1, 1) / vec2(textureSize(backgroundSampler, 0));
  const float kernel[9] = float[9](0.0f, -1.0f, 0.0f, -1.0f, 4.0f, -1.0f, 0.0f, -1.0f, 0.0f);
  vec4 smoothedColor = color / 9.0f;
  int index = 0;
  for(int x = -1; x <= 1; x++) {
    for(int y = -1; y <= 1; y++) {
      smoothedColor += texture(backgroundSampler, vTexCoord + 3.0f * pixel * vec2(float(x), float(y))) * kernel[index];
      index++;
    }
  }
  fragColor = vec4((smoothedColor).rgb, color.a);
}

void main() {
  vec4 colorb = texture(backgroundSampler, vTexCoord);
  vec4 colorf = texture(foregroundSampler, vTexCoord);

  if(background == 0.0f) {
    fragColor = colorb;

    if(greyCheck == 1.0f) {
      grayScale(colorb);
    }

    if(sepiaCheck == 1.0f) {
      sepia(colorb);
    }

  } else if(background == 1.0f) {
    vec4 blend = colorf.a * colorf + (1.0f - colorf.a) * colorb;
    fragColor = blend;
    if(greyCheck == 1.0f)
      grayScale(blend);
    else if(sepiaCheck == 1.0f)
      sepia(blend);
  }
  // check for background filters
  if(gradientCheck == 1.0f) {
    gradient();
  } else if(smoothCheck == 1.0f) {
    smoothen(colorb);
  } else if(sharpenCheck == 1.0f) {
    sharpen(colorb);
  } else if(laplacianCheck == 1.0f) {
    laplacian(colorb);
  }
  // contrast and brightness
  fragColor = vec4(0.5f + (contrast + 1.0f) * (fragColor.rgb - 0.5f), fragColor.a);
  fragColor = clamp(vec4(fragColor.rgb + brightness, fragColor.a), 0.0f, 1.0f);
}
`;
var background;

var contrast = 0.0;
var brightness = 0.0;

var effects = {
  grayscale: 0.0,
  sepia: 0.0,

  smooth: 0.0,
  gradient: 0.0,
  sharpen: 0.0,
  laplacian: 0.0,
};

var canvas;
var gl;
var shaderProgram;
var positionBuffer;
var positionAttribLocation;
var texCoordAttribLocation;
var texCoordBuffer;
var sqVertexIndexBuffer;

const loadImage = (e, number) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.addEventListener("load", () => {
        loadTexture(number, img);
      });
      img.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
  }
};

const loadTexture = async (number, image) => {
  texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + number);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    image.width,
    image.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
};

const setEffects = (effect) => {
  for (const key in effects) {
    effects[key] = 0.0;
  }
  if (effect) {
    if (["smooth", "gradient", "sharpen", "laplacian"].includes(effect)) {
      imageModes = document.getElementsByName("imageMode");
      imageModes[0].checked = true;
      imageModes[1].checked = false;
      background = 0.0;
    }
    effects[effect] = 1.0;
  } else {
    document.getElementById("none").checked = true;
  }
};

const clearCanvas = () => {
  gl.clearColor(0.99, 0.99, 0.99, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

const downloadImage = () => {
  const image = document.getElementById("canvas");
  const link = document.createElement("a");
  link.download = "image.png";
  link.href = image.toDataURL("image/png");
  link.click();
};

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2", {
      preserveDrawingBuffer: true,
    }); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function shaderSetup(shaderCode, type) {
  shader = gl.createShader(type);
  gl.shaderSource(shader, shaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function initShaders() {
  shaderProgram = gl.createProgram();
  var vertexShader = shaderSetup(vertexShaderCode, gl.VERTEX_SHADER);
  var fragmentShader = shaderSetup(fragmentShaderCode, gl.FRAGMENT_SHADER);

  // attach the shaders
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  //link the shader program
  gl.linkProgram(shaderProgram);

  // check for compiiion and linking status
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  //finally use the program.
  gl.useProgram(shaderProgram);

  return shaderProgram;
}

const loadUniforms = () => {
  positionAttribLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  texCoordAttribLocation = gl.getAttribLocation(shaderProgram, "aTexCoord");

  const vertexData = new Float32Array([
    1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
  ]);
  const texCoordBufferData = new Float32Array([1, 0, 0, 0, 0, 1, 1, 1]);

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  sqVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
  sqVertexIndexBuffer.itemsize = 1;
  sqVertexIndexBuffer.numItems = 6;

  texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData, gl.STATIC_DRAW);
};

const drawScene = async () => {
  clearCanvas();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  gl.uniform1f(gl.getUniformLocation(shaderProgram, "contrast"), contrast);
  gl.uniform1f(gl.getUniformLocation(shaderProgram, "brightness"), brightness);
  gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "greyCheck"),
    effects.grayscale
  );
  gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "sepiaCheck"),
    effects.sepia
  );
  gl.uniform1f(gl.getUniformLocation(shaderProgram, "background"), background);
  gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "gradientCheck"),
    effects.gradient
  );
  gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "smoothCheck"),
    effects.smooth
  );
  gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "sharpenCheck"),
    effects.sharpen
  );
  gl.uniform1f(
    gl.getUniformLocation(shaderProgram, "laplacianCheck"),
    effects.laplacian
  );
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "backgroundSampler"), 0);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "foregroundSampler"), 1);

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
};

async function webGLStart() {
  canvas = document.getElementById("canvas");
  initGL(canvas);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  shaderProgram = initShaders();
  loadUniforms();
  clearCanvas();
}
