class Figures {
  constructor(draw) {
    /** @type {Draw} */
    this.draw = draw;
  }

  tree(mMatrix) {
    const topColor = normalizeColor([0, 214, 65, 1.0]);
    const midColor = normalizeColor([0, 185, 64, 1.0]);
    const baseColor = normalizeColor([0, 155, 68, 1.0]);
    const trunkColor = normalizeColor([128, 58, 69, 1.0]);
    let stack = [];

    // trunk
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.05, 0.28, 1.0]);
    this.draw.square(trunkColor, mMatrix);
    mMatrix = popMatrix(stack);

    // base
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, 0.25, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.3, 1.0]);
    this.draw.triangle(baseColor, mMatrix);

    // mid
    mMatrix = mat4.translate(mMatrix, [0.0, 0.15, 0.0]);
    this.draw.triangle(midColor, mMatrix);

    // top
    mMatrix = mat4.translate(mMatrix, [0.0, 0.15, 0.0]);
    this.draw.triangle(topColor, mMatrix);

    mMatrix = popMatrix(stack);
  }

  mountain(mMatrix) {
    const lightShade = normalizeColor([146, 107, 72, 1.0]);
    const darkShade = normalizeColor([126, 77, 57, 1.0]);

    let stack = [];

    // dark triangle
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.rotateZ(mMatrix, degToRad(-2));
    mMatrix = mat4.scale(mMatrix, [1.4, 0.4, 1.0]);
    mMatrix = mat4.translate(mMatrix, [-0.02, -0.0, 0.0]);
    this.draw.triangle(darkShade, mMatrix);
    mMatrix = popMatrix(stack);

    // light triangle
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.rotateZ(mMatrix, degToRad(8));
    mMatrix = mat4.scale(mMatrix, [1.4, 0.4, 1.0]);
    this.draw.triangle(lightShade, mMatrix);
    mMatrix = popMatrix(stack);
  }

  sky(mMatrix) {
    const skyColor = normalizeColor([23, 194, 255, 1.0]);
    mMatrix = mat4.scale(mMatrix, [2, 2, 1.0]);
    this.draw.square(skyColor, mMatrix);
  }

  sun(mMatrix) {
    const sunColor = normalizeColor([255, 234, 0, 1.0]);
    const stack = [];

    // sun body
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.11, 0.11, 1.0]);
    this.draw.circle(sunColor, mMatrix);
    mMatrix = popMatrix(stack);

    // straight lines
    const angles = [0, 45, 90, 135];
    angles.forEach((angle) => {
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.rotateZ(mMatrix, degToRad(angle));
      mMatrix = mat4.scale(mMatrix, [0.32, 0.008, 1.0]);
      this.draw.square(sunColor, mMatrix);
      mMatrix = popMatrix(stack);
    });
  }
  bird(mMatrix) {}
  cloud(mMatrix) {}
  bush(mMatrix) {
    const leftColor = normalizeColor([0, 188, 0, 1.0]);
    const midColor = normalizeColor([0, 157, 0, 1.0]);
    const rightColor = normalizeColor([0, 102, 0, 1.0]);
    const stack = [];

    // left bush
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.12, -0.015, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.055, 1.0]);
    this.draw.circle(leftColor, mMatrix);
    mMatrix = popMatrix(stack);

    // right bush
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.12, -0.015, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.055, 1.0]);
    this.draw.circle(rightColor, mMatrix);
    mMatrix = popMatrix(stack);

    // mid bush
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.12, 0.075, 1.0]);
    this.draw.circle(midColor, mMatrix);
    mMatrix = popMatrix(stack);
  }
  lawn(mMatrix) {
    const lawnColor = normalizeColor([0, 255, 0, 1.0]);
    const patchColor = normalizeColor([0, 185, 41, 1.0]);
    let stack = [];

    // base lawn
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.5, 0.0]);
    mMatrix = mat4.scale(mMatrix, [2, 1.07, 1.0]);
    this.draw.square(lawnColor, mMatrix);
    mMatrix = popMatrix(stack);

    // green patch
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.3, -0.65, 0.0]);
    mMatrix = mat4.rotateZ(mMatrix, degToRad(48));
    mMatrix = mat4.scale(mMatrix, [1.7, 1.5, 1.0]);
    this.draw.triangle(patchColor, mMatrix);
    mMatrix = popMatrix(stack);
  }

  river(mMatrix) {
    const riverColor = normalizeColor([0, 80, 255, 1.0]);
    const riverLineColor = normalizeColor([255, 255, 255, 1.0]);
    let stack = [];

    // main river
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.1, 0.0]);
    mMatrix = mat4.scale(mMatrix, [2, 0.22, 1.0]);
    this.draw.square(riverColor, mMatrix);
    mMatrix = popMatrix(stack);

    // line 1
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.65, -0.1, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.003, 1.0]);
    this.draw.square(riverLineColor, mMatrix);
    mMatrix = popMatrix(stack);

    // line 2
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, -0.05, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.003, 1.0]);
    this.draw.square(riverLineColor, mMatrix);
    mMatrix = popMatrix(stack);

    // line 3
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.65, -0.18, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.4, 0.003, 1.0]);
    this.draw.square(riverLineColor, mMatrix);
    mMatrix = popMatrix(stack);
  }

  boat(mMatrix) {
    const baseColor = normalizeColor([200, 200, 200, 1.0]);
    const sailColor = normalizeColor([230, 85, 69, 1.0]);
    const stickColor = normalizeColor([0.0, 0.0, 0.0, 1.0]);
    let stack = [];

    // boat base
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.5, 0.3, 1.0]);
    mMatrix = mat4.rotateZ(mMatrix, degToRad(180));
    this.draw.trapezium(baseColor, mMatrix);
    mMatrix = popMatrix(stack);

    // boat sail
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.1, 0.09, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.2, 0.2, 1.0]);
    mMatrix = mat4.rotateZ(mMatrix, degToRad(270));
    this.draw.triangle(sailColor, mMatrix);
    mMatrix = popMatrix(stack);

    // sail stick
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.0, 0.099, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.01, 0.25, 1.0]);
    this.draw.square(stickColor, mMatrix);
    mMatrix = popMatrix(stack);

    // slanting stick
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.rotateZ(mMatrix, degToRad(-25));
    mMatrix = mat4.translate(mMatrix, [-0.09, 0.05, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.005, 0.25, 1.0]);
    this.draw.square(stickColor, mMatrix);
    mMatrix = popMatrix(stack);
  }

  car(mMatrix) {
    const roofColor = normalizeColor([181, 22, 4, 1.0]);
    const baseColor = normalizeColor([2, 75, 232, 0.95]);
    const tyreColor = normalizeColor([0, 0, 0, 1.0]);
    const rimColor = normalizeColor([0.0, 0.0, 0.0, 0.5]);
    let stack = [];

    // roof
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.scale(mMatrix, [0.55, 0.5, 1.0]);
    this.draw.trapezium(roofColor, mMatrix);
    mMatrix = popMatrix(stack);

    // wheels
    {
      // left
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [-0.12, -0.06, 0.0]);

      // tyre
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.scale(mMatrix, [0.045, 0.045, 1.0]);
      this.draw.circle(tyreColor, mMatrix);
      mMatrix = popMatrix(stack);

      // rim
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.scale(mMatrix, [0.033, 0.033, 1.0]);
      this.draw.circle(rimColor, mMatrix);
      mMatrix = popMatrix(stack);

      mMatrix = popMatrix(stack);

      // right
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [0.12, -0.06, 0.0]);

      // tyre
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.scale(mMatrix, [0.045, 0.045, 1.0]);
      this.draw.circle(tyreColor, mMatrix);
      mMatrix = popMatrix(stack);

      // rim
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.scale(mMatrix, [0.033, 0.033, 1.0]);
      this.draw.circle(rimColor, mMatrix);
      mMatrix = popMatrix(stack);

      mMatrix = popMatrix(stack);
    }

    // body
    {
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [0.0, 0.01, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.4, 0.1, 1.0]);
      this.draw.square(baseColor, mMatrix);
      mMatrix = popMatrix(stack);

      // right triangle
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [0.2, 0.01, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.1, 0.1, 1.0]);
      this.draw.triangle(baseColor, mMatrix);
      mMatrix = popMatrix(stack);

      // right triangle
      pushMatrix(stack, mMatrix);
      mMatrix = mat4.translate(mMatrix, [-0.2, 0.01, 0.0]);
      mMatrix = mat4.scale(mMatrix, [0.1, 0.1, 1.0]);
      this.draw.triangle(baseColor, mMatrix);
      mMatrix = popMatrix(stack);
    }
  }

  home(mMatrix) {
    const wallColor = normalizeColor([245, 240, 230, 1.0]);
    const ventilationColor = normalizeColor([230, 190, 99, 1.0]);
    const roofColor = normalizeColor([230, 85, 69, 1.0]);
    let stack = [];
    pushMatrix(stack, mMatrix);

    // main wall
    this.draw.square(
      wallColor,
      mat4.scale(mat4.create(mMatrix), [0.5, 0.25, 1.0])
    );

    // door
    mMatrix = mat4.translate(mMatrix, [0.0, -0.045, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.16, 1.0]);
    this.draw.square(ventilationColor, mMatrix);
    mMatrix = popMatrix(stack);

    // window right
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [0.15, 0.04, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.07, 1.0]);
    this.draw.square(ventilationColor, mMatrix);
    mMatrix = popMatrix(stack);

    // window left
    pushMatrix(stack, mMatrix);
    mMatrix = mat4.translate(mMatrix, [-0.15, 0.04, 0.0]);
    mMatrix = mat4.scale(mMatrix, [0.07, 0.07, 1.0]);
    this.draw.square(ventilationColor, mMatrix);
    mMatrix = popMatrix(stack);

    this.draw.trapezium(roofColor, mMatrix);
  }
}
