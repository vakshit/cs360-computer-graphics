class Vector {
  /**
   * Construct a 3 dimensional vector
   * @param x
   * @param y
   * @param z
   */
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Take the cross product (this . v) of this vector with another
   * @param v
   * @returns {Vector}
   */
  crossProduct(v) {
    return new Vector(
      this.y * v.z - v.y * this.z,
      this.z * v.x - v.z * this.x,
      this.x * v.y - v.x * this.y
    );
  }

  /**
   * Normalize this vector
   * @returns {Vector}
   */
  normalize() {
    var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    return new Vector(this.x / l, this.y / l, this.z / l);
  }

  /**
   * Add to this vector
   * @param v
   * @returns {Vector}
   */
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * Subtract another vector from this Vector
   * @param v
   * @returns {Vector}
   */
  subtract(v) {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Multiply vector by a Scalar
   * @param l
   * @returns {Vector}
   */
  multiply(l) {
    return new Vector(this.x * l, this.y * l, this.z * l);
  }

  /**
   * Push 3 vector values onto the end of an array
   * @param vector - {Vector}
   * @param array - {Array}
   */
  static push(vector, array) {
    array.push(vector.x, vector.y, vector.z);
  }
}
