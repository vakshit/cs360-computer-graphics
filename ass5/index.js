class Shaders {
  constructor(gl) {
    this.gl = gl;
    this.vertexShader = `
    attribute vec2 aVertexPosition;
    attribute vec3 aPlotPosition;

    varying vec3 vPosition;

    void main(void) {
      gl_Position = vec4(aVertexPosition, 1.0, 1.0);
      vPosition = aPlotPosition;
      gl_PointSize = 1.0;
    }
    `;
    this.fragmentShader = `
    precision highp float;
    varying vec3 vPosition;
    uniform vec3 cameraPosition;
    uniform int reflections;  // max = 10
    uniform bool shadows;
    uniform int numberOfSpheres;  // max = 64
    uniform vec3 sphereCenters[64];
    vec3 lightDirections[3];

    /**
     * Check for an intersection with a sphere
     */
    bool intersectSphere(vec3 sphereCenter, vec3 rayStart, vec3 rayDirection, out float distance) {
      vec3 rayToSphere = sphereCenter - rayStart;
      float b = dot(rayDirection, rayToSphere);
      float d = b*b - dot(rayToSphere, rayToSphere) + 1.0;

      if (d < 0.0) {
        distance = 10000.0;
        return false;
      }

      distance = b - sqrt(d);
      if (distance < 0.0) {
        distance = 10000.0;
        return false;
      }

      return true;
    }

    /**
     * Does the ray intersect a sphere, if so, output the sphere's index and distance from the ray start
     */
    bool intersectSpheres(vec3 rayStart, vec3 rayDirection, out int sphereIndex, out float distance, out vec3 intersectPosition, out vec3 normal) {
      float minDistance = -1.0, thisDistance = 0.0;
      for (int i = 0; i < 64; i++) {
        if (i < numberOfSpheres) {
          if (intersectSphere(sphereCenters[i], rayStart, rayDirection, thisDistance)) {
            if (minDistance < 0.0 || thisDistance < minDistance) {
              minDistance = thisDistance;
              sphereIndex = i;
              intersectPosition = rayStart + minDistance * rayDirection;
              normal = intersectPosition - sphereCenters[i];
            }
          }
        }
      }

      if (minDistance <= 0.0) {
        sphereIndex = -1;
        distance = 10000.0;
        return false;
      } else {
        distance = minDistance;
        return true;
      }
    }

    bool intersectSpheresSimple(vec3 rayStart, vec3 rayDirection) {
      float minDistance = -1.0, thisDistance = 0.0;
      for (int i = 0; i < 64; i++) {
        if (i < numberOfSpheres) {
          if (intersectSphere(sphereCenters[i], rayStart, rayDirection, thisDistance)) {
            if (minDistance < 0.0 || thisDistance < minDistance) {
              minDistance = thisDistance;
            }
          }
        }
      }

      return (minDistance >= 0.0);
    }

    /**
     * Calculate the intensity of light at a certain angle - 0.0 means none, 1.0 means true colour, >1.0 for gloss/shine
     */
    vec3 lightAt(vec3 position, vec3 normal, vec3 viewer, vec3 color) {
      vec3 light = lightDirections[0];
      vec3 reflection = reflect(-light, normal);

      vec3 intersectPosition, n;
      float intensity = 0.0, distance;
      int sphereIndex;

      for (int i = 0; i < 3; i++) {
        light = lightDirections[i];
        reflection = reflect(-light, normal);

        // TODO: check if testing for shadows here is valid...
        if (!shadows || !intersectSpheresSimple(position, light)) {
          intensity = intensity + 0.05 + 0.3 * pow(max(dot(reflection, viewer), 0.0), 30.0) + 0.7 * dot(light, normal);
        } else {
          intensity = intensity + 0.05;
        }
      }

      intensity = intensity / 1.5;

      if (intensity > 1.0) {
        return mix(color, vec3(1.2, 1.2, 1.2), intensity - 1.0);
      }

      return intensity * color;
    }

    /**
     * Check if our ray intersects with an object/floor
     */
    bool intersectWorld(vec3 rayStart, vec3 rayDirection, out vec3 intersectPosition, out vec3 normal, out vec3 color) {
      int sphereIndex;
      float distance;

      if (intersectSpheres(rayStart, rayDirection, sphereIndex, distance, intersectPosition, normal)) {
        float i = float(sphereIndex);
        float n = i / 32.0;
        color = vec3(sin(1.0/n) / 2.0 + 0.5, sin(n) / 2.0 + 0.5, cos(n) / 2.0 + 0.5);
      } else if (rayDirection.y < -0.01) {
        intersectPosition = rayStart + ((rayStart.y + 2.7) / -rayDirection.y) * rayDirection;

        if (intersectPosition.x*intersectPosition.x + intersectPosition.z*intersectPosition.z > 300.0) {
          return false;
        }

        normal = vec3(0.0, 1.0, 0.0);

        if (fract(intersectPosition.x / 5.0) > 0.5 == fract(intersectPosition.z / 5.0) > 0.5) {
          color = vec3(1.0);
        } else {
          color = vec3(0.0, 0.45, 0.4);
        }
      } else {
      return false;
      }

      return true;
    }

    void main(void) {
      vec3 cameraDirection = normalize(vPosition - cameraPosition);

      lightDirections[0] = normalize(vec3(0.577350269, 0.577350269, -0.577350269));
      lightDirections[1] = normalize(vec3(0.577350269, 0.577350269, -0.577350269));
      lightDirections[2] = normalize(vec3(0.5, 1.0, 1.0));

      // start pos, normal, end pos
      vec3 position1, normal, position2;
      vec3 color, reflectedColor, colorMax;

      if (intersectWorld(cameraPosition, cameraDirection, position1, normal, reflectedColor)) {
        color = lightAt(position1, normal, -cameraDirection, reflectedColor);
        colorMax = (reflectedColor + vec3(0.7)) / 1.7;
        cameraDirection = reflect(cameraDirection, normal);

        // since integer modulo isn't available
        bool even = true;
        for (int i=0; i<10; i++) {
          // since loops *have* to be unrolled due to no branches
          if (i < int(reflections)) {
            if (even) {
              even = false;
              if (intersectWorld(position1, cameraDirection, position2, normal, reflectedColor)) {
                color += lightAt(position1, normal, -cameraDirection, reflectedColor) * colorMax;
                colorMax *= (reflectedColor + vec3(0.7)) / 1.7;
                cameraDirection = reflect(cameraDirection, normal);
              } else {
                break;
              }
            } else {
              even = true;
              if (intersectWorld(position2, cameraDirection, position1, normal, reflectedColor)) {
                color += lightAt(position2, normal, -cameraDirection, reflectedColor) * colorMax;
                colorMax *= (reflectedColor + vec3(0.7)) / 1.7;
                cameraDirection = reflect(cameraDirection, normal);
              } else {
                break;
              }
            }
          } else {
            break;
          }
        }

        gl_FragColor = vec4(color, 1.0);
      } else {
        gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
      }
    }`;
  }
  shaderSetup(shaderCode, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, shaderCode);
    this.gl.compileShader(shader);
    // Error check whether the shader is compiled correctly
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      alert(this.gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
}

class Controls {
  constructor(screenSelector, controlsSelector) {
    this.screen = document.querySelector(screenSelector);
    this.canvas = this.screen.querySelector("canvas.render");
    this.controls = document.querySelector(controlsSelector);

    try {
      this.rayTracer = new RayTracer(this.canvas);
    } catch (e) {
      this.screen.querySelector(".error.dimmer").classList.add("active");
      throw e;
    } finally {
      this.screen.querySelector(".loading.dimmer").classList.remove("active");
      this.screen.querySelector(".loaded.dimmer").classList.add("active");
    }

    this.controls
      .querySelector("button.render")
      .addEventListener("click", this.render.bind(this));
    this.controls
      .querySelector("button.profile")
      .addEventListener("click", this.profile.bind(this));

    this.simulationTime = 0.0;
  }

  profile() {
    let dimmer = this.controls.querySelector(".profiling.dimmer");
    dimmer.classList.add("active");
    setTimeout(() => dimmer.classList.remove("active"), 2000);
  }

  render() {
    if (!this.interval) {
      this.controls.querySelector("button.render").innerHTML =
        'Pause <i class="pause icon"></i>';

      let timeDisplay = this.controls.querySelector("span.render-time");
      this.screen.querySelector(".loaded.dimmer").classList.remove("active");

      setTimeout(() => {
        try {
          this.interval = true;
          let startTime, endTime;
          startTime = endTime = new Date().getTime();
          const step = () => {
            if (this.interval) {
              startTime = new Date().getTime();
              this.simulationTime += (startTime - endTime) / 100;
              this.rayTracer.render(
                this.setting("spheres"),
                this.setting("reflections"),
                this.setting("zoom"),
                this.checkbox("shadows"),
                this.simulationTime
              );
              endTime = new Date().getTime();
              timeDisplay.innerHTML = endTime - startTime + "ms";
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
        } catch (error) {
          console.error(error);
          let errorDimmer = this.screen.querySelector(".error.dimmer");
          errorDimmer.classList.add("active");
          errorDimmer.querySelector("p").innerHTML = error.message;
        }
      }, 1);
    } else {
      clearInterval(this.interval);
      this.interval = null;
      this.controls.querySelector("button.render").innerHTML =
        'Render <i class="play icon"></i>';
    }
  }

  setting(name) {
    return this.controls.querySelector("." + name + ".setting").value;
  }

  checkbox(name) {
    return this.controls.querySelector("#" + name).checked;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("Initialising app...");

  // Initialize checkboxes
  var checkboxes = document.querySelectorAll(".ui.checkbox");

  // Assuming Controls is defined elsewhere and doesn't rely on jQuery
});

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Show the text value for our HTML range elements in the label
   * @param e
   */
  function showValue(e) {
    var element = e.target;
    var parent = element.parentElement;
    parent.querySelector(".value").textContent = element.value;
  }

  var ranges = document.querySelectorAll('input[type="range"]');

  ranges.forEach(function (range) {
    range.addEventListener("change", showValue);
    range.addEventListener("input", showValue);

    // Trigger the event manually for initialization
    showValue({ target: range });
  });
  new Controls("#screen", "#controls");
});
