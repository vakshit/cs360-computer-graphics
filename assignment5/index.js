/** @type {WebGL2RenderingContext} */
var gl;
/** @type {HTMLCanvasElement} */
var canvas;
var locations;
var program;
var vertexBuffer;
var settings = {
  mode: 0,
  light: 0.0,
  bounces: 2,
};

const shaderCode = {
  vertex: `#version 300 es

    in vec3 aPosition;

    void main() {
      gl_Position = vec4(aPosition, 1.0);
    }
  `,
  fragment: `#version 300 es
  precision mediump float;
  
  #define NUM_SPHERES 4
  #define ROOT_3 1.73205080757
  #define INFINITY 100000.0
  
  uniform float uLight;
  uniform int uMode;
  uniform int uBounces;
  
  vec3 initialLightDir;
  
  out vec4 fragColor;
  
  struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
    float shine;
  };
  
  struct Ray {
    vec3 origin;
    vec3 direction;
  };
  
  Sphere spheres[NUM_SPHERES] = Sphere[NUM_SPHERES](Sphere(vec3(-ROOT_3, 0, -1), 0.8f, vec3(0.0f, 1.0f, 0.0f), 20.0f), 
    Sphere(vec3(0, 0, -2), 1.0f, vec3(1.0f, 0.0f, 0.0f), 10.0f), 
    Sphere(vec3(ROOT_3, 0, -1), 0.8f, vec3(0.0f, 0.0f, 1.0f), 50.0f), 
    Sphere(vec3(0, -10, 0), 9.0f, vec3(1.0f, 1.0f, 1.0f), 100.0f)
  );
  
  bool solveQuadratic(float a, float b, float c, out float t0, out float t1) {
    float disc = b * b - 4.f * a * c;
    if(disc < 0.0f) {
      return false;
    } else if(disc == 0.0f) {
      t0 = t1 = -0.5f * b / a;
      return true;
    }
    t0 = (-b + sqrt(disc)) / (2.f * a);
    t1 = (-b - sqrt(disc)) / (2.f * a);
    return true;
  }
  
  // Function to calculate lighting for phong shading
  vec3 calcLighting(
    vec3 normal,
    vec3 viewDir,
    vec3 lightDir,
    vec3 objectColor,
    float shininess
  ) {
    vec3 ambient = 0.3f * objectColor;
    vec3 diffuse = 0.3f * objectColor * max(dot(normal, lightDir), 0.0f);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 specular = 0.6f * vec3(1.0f, 1.0f, 1.0f) *
      pow(max(dot(viewDir, reflectDir), 0.0f), shininess);
  
    if(objectColor == vec3(1.0f)) {
      return (ambient + diffuse);
    }
    return (ambient + diffuse + specular);
  }
  
  // Function to perform ray-sphere intersection
  float trace(Ray ray, Sphere sphere, out vec3 normal) {
    float a = dot(ray.direction, ray.direction);
    float b = 2.0f * dot(ray.direction, ray.origin - sphere.center);
    float c = dot(ray.origin - sphere.center, ray.origin - sphere.center) -
      sphere.radius * sphere.radius;
    float t0, t1;
  
    if(!solveQuadratic(a, b, c, t0, t1)) {
      return -1.0f;
    }
    if(t0 > t1) {
      float temp = t0;
      t0 = t1;
      t1 = temp;
    }
    if(t0 < 0.0f) {
      t0 = t1;
      if(t0 < 0.0f) {
        return -1.0f;
      }
    }
  
    float t = t0;
    vec3 hitPoint = ray.origin + ray.direction * t;
    normal = normalize(hitPoint - sphere.center);
    return t;
  }
  
  bool inShadow(vec3 intersectionPoint, vec3 lightDir) {
    vec3 normal;
    for(int i = 0; i < 4; ++i) {
      float t = trace(Ray(intersectionPoint, lightDir), spheres[i], normal);
      if(t > 0.1f) {
        return true; // Point is in shadow
      }
    }
    return false; // Point is not in shadow
  }
  
  vec3 calculateNormal(vec3 intersectionPoint, int sphereIndex) {
    return normalize(intersectionPoint - spheres[sphereIndex].center);
  }
  
  Ray calculateColor(Ray ray, int depth, out vec3 outputColor) {
    if(depth <= 0) {
      outputColor = vec3(0.0f); // Terminate recursion at a certain depth
      return ray;
    }
  
    float closestIntersection = INFINITY;
    int closestSphereIndex = -1;
    vec3 normal;
    vec3 closestNormal;
  
      // Find the closest intersection
    for(int i = 0; i < NUM_SPHERES; ++i) {
      float t = trace(ray, spheres[i], normal);
      if(t > 0.0f && (closestIntersection < 1.0f || t < closestIntersection)) {
        closestIntersection = t;
        closestNormal = normal;
      }
    }
  
    closestIntersection = INFINITY;
    for(int i = 0; i < NUM_SPHERES; ++i) {
      Sphere currentSphere = spheres[i];
  
      vec3 oc = ray.origin - currentSphere.center;
      float a = dot(ray.direction, ray.direction);
      float b = 2.0f * dot(oc, ray.direction);
      float c = dot(oc, oc) - currentSphere.radius * currentSphere.radius;
      float discriminant = b * b - 4.0f * a * c;
  
      if(discriminant >= 0.0f) {
        float t = (-b - sqrt(discriminant)) / (2.0f * a);
  
        if(t > 0.001f && t < closestIntersection) {
          closestIntersection = t;
          closestSphereIndex = i;
        }
      }
    }
  
    if(closestSphereIndex == -1) {
      outputColor = vec3(0.0f); // No intersection, return background color
      return ray;
    }
  
      // Calculate intersection point  
  
    vec3 intersectionPoint = ray.origin + ray.direction * closestIntersection;
    vec3 otherNormal = calculateNormal(intersectionPoint, closestSphereIndex);
  
    vec3 color = spheres[closestSphereIndex].color;
    float shininess = spheres[closestSphereIndex].shine;
    vec3 viewDir = normalize(-ray.direction);
    vec3 point = ray.origin + closestIntersection * ray.direction;
    vec3 lightDir = normalize(initialLightDir - point);
    vec3 neworigin = point + 0.0002f * normal;
    bool shadowed = inShadow(neworigin, lightDir);
  
    vec3 phongColor = calcLighting(closestNormal, viewDir, lightDir, color, shininess);
    if(shadowed && depth == uBounces && closestSphereIndex == 3) {
      if(uMode == 1 || uMode == 3) {
        phongColor -= vec3(0.2f, 0.2f, 0.2f);
      }
    }
  
    Ray reflectedRay;
    reflectedRay.origin = intersectionPoint;
    reflectedRay.direction = reflect(ray.direction, otherNormal);
  
    outputColor = phongColor;
    return reflectedRay;
  }
  
  void main() {
    vec2 screenCoords = (gl_FragCoord.xy / vec2(500, 500)) * 2.0f - 1.0f;
    initialLightDir = vec3(uLight, 3.0f, -1.0f);
  
    vec3 rayDirection = normalize(vec3(screenCoords, -1.0f));
    vec3 rayOrigin = vec3(0.0f, 0.5f, 1.5f);
    Ray ray = Ray(rayOrigin, rayDirection);
  
    // Perform ray tracing with a loop for bounces
    vec3 tempColor;
    vec3 finalColor;
    ray = calculateColor(ray, uBounces, finalColor);
    // finalColor = normalize(finalColor);
  
    if(uMode > 1) {
      for(int bounce = uBounces - 1; bounce > 0; --bounce) {
        ray = calculateColor(ray, bounce, tempColor);
          // finalColor = normalize(0.2*finalColor + 0.6*tempColor);
          // finalColor = normalize(finalColor);
        if(tempColor != vec3(0.0f)) {
          finalColor = 0.6f * finalColor + 0.4f * tempColor;
        }
      }
    }
  
    fragColor = vec4(finalColor, 1.0f);
  }`,
};

function initGL() {
  try {
    /** @type {WebGL2RenderingContext} */
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SCISSOR_TEST);
  } catch (e) {
    console.error(e);
  } finally {
    if (!gl) {
      alert("[ERROR] WebGL initialization failed!");
    }
  }
}

function clear() {
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initShaders(vertexShaderCode, fragmentShaderCode) {
  program = gl.createProgram();
  setupShader(vertexShaderCode, gl.VERTEX_SHADER);
  setupShader(fragmentShaderCode, gl.FRAGMENT_SHADER);
  // setupVertexShader();
  // setupFragmentShader();
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }
  setupLocations();
  gl.useProgram(program);
}

function setupShader(code, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("[ERROR] shader shader not compiled!");
    console.error(gl.getShaderInfoLog(shader));
  }
  gl.attachShader(program, shader);
}

function setupLocations() {
  locations = {
    aPosition: gl.getAttribLocation(program, "aPosition"),
    uLight: gl.getUniformLocation(program, "uLight"),
    uMode: gl.getUniformLocation(program, "uMode"),
    uBounces: gl.getUniformLocation(program, "uBounces"),
  };
}

function setupBuffer() {
  vertexBuffer = gl.createBuffer();
  const vertexData = new Float32Array([
    -1, 1, 0, 1, 1, 0, -1, -1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0,
  ]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
}

function setupEventListeners() {
  settings.mode = 0;
  document.getElementById("mode-none").addEventListener("click", () => {
    settings.mode = 0;
    draw();
  });
  document.getElementById("mode-shadow").addEventListener("click", () => {
    settings.mode = 1;
    draw();
  });
  document.getElementById("mode-reflection").addEventListener("click", () => {
    settings.mode = 2;
    draw();
  });
  document.getElementById("mode-both").addEventListener("click", () => {
    settings.mode = 3;
    draw();
  });

  settings.light = 0.0;
  document.getElementById("light").addEventListener("input", (e) => {
    settings.light = e.target.value * 5.0;
    draw();
  });

  settings.bounces = 2;
  document.getElementById("bounces").addEventListener("input", (e) => {
    settings.bounces = e.target.value;
    draw();
  });
}

function draw() {
  clear();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(locations.aPosition);

  gl.uniform1f(locations.uLight, settings.light);
  gl.uniform1i(locations.uMode, settings.mode);
  gl.uniform1i(locations.uBounces, settings.bounces);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const webGLStart = () => {
  canvas = document.getElementById("canvas");
  initGL();
  initShaders(shaderCode.vertex, shaderCode.fragment);
  setupBuffer();
  setupEventListeners();
  draw();
};
