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
uniform float contrast;
uniform float brightness;
uniform float grayScale;
uniform float sepiaCheck;
uniform float background;
uniform float alpha;
uniform sampler2D uSampler;
uniform sampler2D newSampler;
uniform float gradient;
uniform float smoothf;
uniform float sharpenf;
uniform float laplacianf;
void main(){

    vec4 colorb = texture(uSampler,vTexCoord);
    vec4 colorf = texture(newSampler,vTexCoord);
    float af =  colorf.a;


    if(background == 1.0){
        fragColor = colorb;
        float gray = 0.2126*fragColor.r + 0.7152*fragColor.g + 0.0722*fragColor.b;
        vec4 grayscalecolor = vec4(gray,gray,gray, fragColor.a);
        if(grayScale == 1.0)
        fragColor = grayscalecolor;
        else fragColor = colorb;
        
        float sr = 0.393*fragColor.r + 0.769*fragColor.g + 0.189*fragColor.b;
        float sg = 0.349*fragColor.r + 0.686*fragColor.g + 0.168*fragColor.b;
        float sb = 0.272*fragColor.r + 0.534*fragColor.g + 0.131*fragColor.b;
        vec4 sepia = vec4(sr,sg,sb,fragColor.a);
        if(sepiaCheck == 1.0)
        fragColor = sepia;
        if(gradient == 1.0){
            vec2 onePixel = vec2(1,1) / vec2(textureSize(uSampler, 0));
            vec4 up = texture(uSampler, vTexCoord + 5.0*onePixel*vec2(0,-1));
            vec4 down = texture(uSampler, vTexCoord + 5.0*onePixel*vec2(0,1));
            vec4 right = texture(uSampler, vTexCoord + 5.0*onePixel*vec2(1,0));
            vec4 left = texture(uSampler, vTexCoord + 5.0*onePixel*vec2(-1,0));
            vec4 dy = (up-down);
            vec4 dx = (right-left);
            vec4 gradMag = sqrt(dx*dx+dy*dy);
            if(gradMag.r<0.1 ||gradMag.g<0.1 ||gradMag.b<0.1 ) fragColor = vec4(0.0,0.0,0.0,1.0);
        }
        else if(smoothf == 1.0){
            vec2 onePixel = vec2(1,1) / vec2(textureSize(uSampler, 0));
            const float kernel[9] = float[9](
                1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, 1.0
            );
            vec4 smoothedColor = colorb / 9.0;
            int index=0;
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    smoothedColor += texture(uSampler, vTexCoord + 5.0*onePixel * vec2(float(x), float(y))) * kernel[index];
                    index++;
                }
            }
            fragColor = vec4((smoothedColor/9.0).rgb,colorb.a);
        }
        else if(sharpenf == 1.0){
            vec2 onePixel = vec2(1,1) / vec2(textureSize(uSampler, 0));
            const float kernel[9] = float[9](
                0.0, -1.0, 0.0,
                -1.0, 5.0, -1.0,
                0.0, -1.0, 0.0
            );
            vec4 smoothedColor = colorb/9.0;
            int index=0;
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    smoothedColor += texture(uSampler, vTexCoord + 5.0*onePixel * vec2(float(x), float(y))) * kernel[index];
                    index++;
                }
            }
            fragColor = vec4((smoothedColor).rgb,colorb.a);
        }
        else if(laplacianf == 1.0){
            vec2 onePixel = vec2(1,1) / vec2(textureSize(uSampler, 0));
            const float kernel[9] = float[9](
                0.0, -1.0, 0.0,
                -1.0, 4.0, -1.0,
                0.0, -1.0, 0.0
            );
            vec4 smoothedColor = colorb/9.0;
            int index=0;
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    smoothedColor += texture(uSampler, vTexCoord + 3.0*onePixel * vec2(float(x), float(y))) * kernel[index];
                    index++;
                }
            }
            fragColor = vec4((smoothedColor).rgb,colorb.a);
        }
    }
    else if(alpha == 1.0){
        vec4 blend = af*colorf + (1.0-af)*colorb;
        fragColor = blend;
        float gray = 0.2126*fragColor.r + 0.7152*fragColor.g + 0.0722*fragColor.b;
        vec4 grayscalecolor = vec4(gray,gray,gray, fragColor.a);
        if(grayScale == 1.0)
        fragColor = grayscalecolor;
        
        float sr = 0.393*fragColor.r + 0.769*fragColor.g + 0.189*fragColor.b;
        float sg = 0.349*fragColor.r + 0.686*fragColor.g + 0.168*fragColor.b;
        float sb = 0.272*fragColor.r + 0.534*fragColor.g + 0.131*fragColor.b;
        vec4 sepia = vec4(sr,sg,sb,fragColor.a);
        if(sepiaCheck == 1.0)
        fragColor = sepia;
    }
    
    fragColor = vec4(0.5+ (contrast+ 1.0) * (fragColor.rgb - 0.5) , fragColor.a);
    fragColor = clamp(vec4(fragColor.rgb + brightness,fragColor.a), 0.0,  1.0);
    
}
`;
var contrast;
var brightness;
var grayScale;
var sepiaCheck;
var background;
var aplhacheck;
var gradient;
var smooth;
var imageInput;
var loadedImage;
var imageUrl;
var canvas;
var gl;
var shaderProgram;
var positionBuffer;
var positionAttribLocation;
var texCoordAttribLocation;
var texCoordBuffer;
var texture;
var sqVertexIndexBuffer;
var newTexture;
var contrastLocation;
var grayCheckboxLocation;
var sepiaCheckboxLocation;
var backgroundLocation;
var alphaLocation;
var gradientLocation;
var smoothLocation;
var sharpenLocation;
var laplacianLocation;
function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2"); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}
function vertexShaderSetup(vertexShaderCode) {
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function fragmentShaderSetup(fragShaderCode) {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragShaderCode);
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

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragmentShaderCode);

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
  contrastLocation = gl.getUniformLocation(shaderProgram, "contrast");
  brightnessLocation = gl.getUniformLocation(shaderProgram, "brightness");
  grayCheckboxLocation = gl.getUniformLocation(shaderProgram, "grayScale");
  sepiaCheckboxLocation = gl.getUniformLocation(shaderProgram, "sepiaCheck");
  backgroundLocation = gl.getUniformLocation(shaderProgram, "background");
  alphaLocation = gl.getUniformLocation(shaderProgram, "alpha");
  gradientLocation = gl.getUniformLocation(shaderProgram, "gradient");
  smoothLocation = gl.getUniformLocation(shaderProgram, "smoothf");
  sharpenLocation = gl.getUniformLocation(shaderProgram, "sharpenf");
  laplacianLocation = gl.getUniformLocation(shaderProgram, "laplacianf");

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
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  gl.uniform1f(contrastLocation, contrast);
  gl.uniform1f(brightnessLocation, brightness);
  gl.uniform1f(grayCheckboxLocation, grayScale);
  gl.uniform1f(sepiaCheckboxLocation, sepiaCheck);
  gl.uniform1f(backgroundLocation, background);
  gl.uniform1f(alphaLocation, aplhacheck);
  gl.uniform1f(gradientLocation, gradient);
  gl.uniform1f(smoothLocation, smooth);
  gl.uniform1f(sharpenLocation, sharpen);
  gl.uniform1f(laplacianLocation, laplacian);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "newSampler"), 1);

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
};

async function webGLStart() {
  canvas = document.getElementById("canvas");
  initGL(canvas);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  shaderProgram = initShaders();
  addEventListeners();
  loadUniforms();
}
