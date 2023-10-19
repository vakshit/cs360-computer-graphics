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
