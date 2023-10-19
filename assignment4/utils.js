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

const addEventListeners = () => {
  contrast = 0.0;
  positionSlider = document.getElementById("contrast");
  positionSlider.addEventListener("input", () => {
    contrast = positionSlider.value;
    drawScene();
  });

  brightness = 0.0;
  brightnessSlider = document.getElementById("brightness");
  brightnessSlider.addEventListener("input", () => {
    brightness = brightnessSlider.value;
    drawScene();
  });

  grayScale = 0.0;
  grayCheckbox = document.getElementById("grayScale");
  grayCheckbox.addEventListener("change", () => {
    if (grayCheckbox.checked) {
      grayScale = 1.0;
    } else {
      grayScale = 0.0;
    }
    drawScene();
  });

  sepiaCheck = 0.0;
  sepiaCheckbox = document.getElementById("sepiaCheck");
  sepiaCheckbox.addEventListener("change", () => {
    if (sepiaCheckbox.checked) {
      sepiaCheck = 1.0;
    } else {
      sepiaCheck = 0.0;
    }
    drawScene();
  });

  background = 0.0;
  backgroundCheckbox = document.getElementById("backgroundCheck");
  backgroundCheckbox.addEventListener("change", () => {
    if (backgroundCheckbox.checked) {
      background = 1.0;
      aplhacheck = 0.0;
      aplhacheckbox.checked = false;
    } else {
      background = 0.0;
    }
    drawScene();
  });

  aplhacheck = 0.0;
  aplhacheckbox = document.getElementById("alphaCheck");
  aplhacheckbox.addEventListener("change", () => {
    if (aplhacheckbox.checked) {
      aplhacheck = 1.0;
      background = 0.0;
      backgroundCheckbox.checked = false;
    } else {
      aplhacheck = 0.0;
    }
    drawScene();
  });

  gradient = 0.0;
  gradcheckbox = document.getElementById("gradient");
  gradcheckbox.addEventListener("change", () => {
    if (gradcheckbox.checked) {
      gradient = 1.0;
      laplacian = 0.0;
      laplacianbox.checked = false;
      sharpenBox.checked = false;
      smoothbox.checked = false;
    } else {
      gradient = 0.0;
    }
    drawScene();
  });

  smooth = 0.0;
  smoothbox = document.getElementById("smooth");
  smoothbox.addEventListener("change", () => {
    if (smoothbox.checked) {
      smooth = 1.0;
      gradcheckbox.checked = false;
      laplacianbox.checked = false;
      sharpenBox.checked = false;
    } else {
      smooth = 0.0;
    }
    drawScene();
  });

  sharpen = 0.0;
  sharpenBox = document.getElementById("Sharpen");
  sharpenBox.addEventListener("change", () => {
    if (sharpenBox.checked) {
      sharpen = 1.0;
      gradcheckbox.checked = false;
      smoothbox.checked = false;
      laplacianbox.checked = false;
    } else {
      sharpen = 0.0;
    }
    drawScene();
  });

  laplacian = 0.0;
  laplacianbox = document.getElementById("laplacian");
  laplacianbox.addEventListener("change", () => {
    if (laplacianbox.checked) {
      laplacian = 1.0;
      gradcheckbox.checked = false;
      smoothbox.checked = false;
      sharpenBox.checked = false;
    } else {
      laplacian = 0.0;
    }
    drawScene();
  });
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
