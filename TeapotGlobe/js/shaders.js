class Shaders {
  constructor() {
    this.skybox = {
      name: "skybox",

      vertexShaderSource: `
      attribute vec3 aVertexPosition;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;

      varying vec3 vPosition;

      void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      vPosition= aVertexPosition;
      }`,

      fragmentShaderSource: `
      precision mediump float;

      uniform samplerCube uEnv;

      varying vec3 vPosition;

      void main(void) {
      gl_FragColor = textureCube(uEnv, normalize(vPosition));
      }`,
    };

    this.teapot = {
      name: "teapot",

      vertexShaderSource: `
      attribute vec3 aVertexPosition;
      attribute vec3 aVertexNormal;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uModelMatrix;

      varying vec3 vModelPosition;
      varying vec3 vModelNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying vec3 vVertexColor;

      void main(void) {

      vModelPosition = aVertexPosition;
      vModelNormal = aVertexNormal;

      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);

      vWorldPosition = vec3(worldPosition);
      vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);
      vVertexColor = vec3(0.8,0.8,0.8);

      gl_Position = uPMatrix * uMVMatrix * worldPosition;
      }`,

      fragmentShaderSource: `
      precision mediump float;

      const float shininess = 1000.0;
      const float PI = 3.1415926535897932384626433832795;

      uniform vec3 uViewOrigin;
      uniform vec3 uLightDirection;
      uniform vec3 uAmbientLight;
      uniform vec3 uDiffuseLight;
      uniform vec3 uSpecularLight;

      uniform samplerCube uEnv;
      uniform sampler2D uNormalMap;

      uniform float uNormalEnable;
      uniform float uReflectionEnable;
      uniform float uBumpiness;

      varying vec3 vModelPosition;
      varying vec3 vModelNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying vec3 vVertexColor;

      void main(void) {

      vec3 worldPosition = vWorldPosition;
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 modelPosition = vModelPosition;
      // Adjust to actual center of teapot.
      modelPosition.y -= 1.0;
      modelPosition = normalize(modelPosition);
      vec3 modelNormal = normalize(vModelNormal);

      // Calculate texture coorinates.
      vec2 textureCoord;
      textureCoord.s = -atan(-modelPosition.z, -modelPosition.x) / 2.0 / PI + 0.5;
      textureCoord.t = 0.5 - 0.5 * modelPosition.y;

      // Calculate tangent bases in world coordinates.
      vec3 tangentBAxis = vec3(0.0,1.0,0.0);
      tangentBAxis = normalize(tangentBAxis - dot(tangentBAxis, worldNormal) * worldNormal);
      vec3 tangentTAxis = normalize(cross(tangentBAxis, worldNormal));

      // Load normal map.
      vec3 targetNormal = texture2D(uNormalMap, textureCoord).rgb;
      // Hard-coded fine tuning
      targetNormal.r = targetNormal.r / 129.0 * 127.5;
      targetNormal.g = targetNormal.g / 128.0 * 127.5;
      targetNormal = normalize(targetNormal * 2.0 - 1.0);

      // Increase bumpiness
      targetNormal.r = targetNormal.r * uBumpiness;
      targetNormal.g = targetNormal.g * uBumpiness;
      targetNormal = normalize(targetNormal);

      // Calculate new normal after adding normal map
      targetNormal = targetNormal.r * tangentTAxis - targetNormal.g * tangentBAxis + targetNormal.b * worldNormal;
      targetNormal = normalize(targetNormal);

      worldNormal = uNormalEnable * targetNormal ;

      // Phong reflection model
      vec3 normalizedLightDirection = normalize(uLightDirection);
      vec3 vectorReflection = normalize( reflect(-normalizedLightDirection, worldNormal) );
      vec3 vectorView = normalize( uViewOrigin - worldPosition );

      float diffuseLightWeighting = max( dot(worldNormal, normalizedLightDirection), 0.0 );
      float specularLightWeighting = pow( max( dot(vectorReflection, vectorView), 0.0), shininess );

      // Sum up lighting and reflection parts
      gl_FragColor = vec4(
      ( uAmbientLight * vVertexColor)
      + ((uDiffuseLight * vVertexColor) * diffuseLightWeighting)
      + ( uSpecularLight * specularLightWeighting),
      1.0 );
      gl_FragColor += vec4(textureCube(uEnv, normalize(reflect(-vectorView, worldNormal))).rgb * uReflectionEnable,
      0.0);
      }`,
    };

    this.sphere = {
      name: "sphere",

      vertexShaderSource: `#version 300 es
      in vec3 aVertexPosition;
      in vec3 aVertexNormal;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uModelMatrix;

      out vec3 vModelPosition;
      out vec3 vModelNormal;
      out vec3 vWorldPosition;
      out vec3 vWorldNormal;

      void main(void) {

      vModelPosition = aVertexPosition;
      vModelNormal = aVertexNormal;

      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);

      vWorldPosition = vec3(worldPosition);
      vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);

      gl_Position = uPMatrix * uMVMatrix * worldPosition;
      }`,

      fragmentShaderSource: `#version 300 es
      precision mediump float;

      const float shininess = 10.0;
      const float PI = 3.1415926535897932384626433832795;

      uniform vec3 uViewOrigin;
      uniform vec3 uLightDirection;
      uniform vec3 uAmbientLight;
      uniform vec3 uDiffuseLight;
      uniform vec3 uSpecularLight;
      uniform float uTextureEnable;
      uniform sampler2D uTextureMap;

      uniform samplerCube uEnv;
      uniform vec3 vVertexColor;

      in vec3 vModelPosition;
      in vec3 vWorldPosition;
      in vec3 vWorldNormal;

      out vec4 fragColor;
      void main(void) {

      vec3 worldPosition = vWorldPosition;
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 modelPosition = vModelPosition;
      // Adjust to actual center of teapot.
      modelPosition.y -= 1.0;
      modelPosition = normalize(modelPosition);

      // Calculate texture coorinates.
      vec2 textureCoord = vec2(0.5, 0.5);
      textureCoord.s = -atan(-modelPosition.z, -modelPosition.x) / 2.0 / PI + 0.5;
      textureCoord.t = 0.5 - 0.5 * modelPosition.y;

      // Phong reflection model
      vec3 normalizedLightDirection = normalize(uLightDirection);
      vec3 vectorReflection = normalize( reflect(-normalizedLightDirection, worldNormal) );
      vec3 vectorView = normalize( uViewOrigin - worldPosition );

      float diffuseLightWeighting = max( dot(worldNormal, normalizedLightDirection), 0.0 );
      float specularLightWeighting = pow( max( dot(vectorReflection, vectorView), 0.0), shininess );

      // Sum up lighting and reflection parts
      if (uTextureEnable == 1.0){
        fragColor = 0.5* vec4(texture(uTextureMap, textureCoord).rgb, 2.0);
      } else {
        fragColor =  vec4(
        (6.0*uAmbientLight * vVertexColor)
        + ((uDiffuseLight * vVertexColor) * diffuseLightWeighting)
        + ( uSpecularLight * specularLightWeighting),
        3.0 );
      }
      fragColor += 0.6 * vec4(texture(uEnv, normalize(reflect(-vectorView, worldNormal))).rgb,
      0.0);
      }`,
    };

    this.cube = {
      name: "cube",

      vertexShaderSource: `#version 300 es
      in vec3 aVertexPosition;
      in vec3 aVertexNormal;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 uModelMatrix;

      out vec3 vModelPosition;
      out vec3 vModelNormal;
      out vec3 vWorldPosition;
      out vec3 vWorldNormal;

      void main(void) {

      vModelPosition = aVertexPosition;
      vModelNormal = aVertexNormal;

      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);

      vWorldPosition = vec3(worldPosition);
      vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);

      gl_Position = uPMatrix * uMVMatrix * worldPosition;
      }`,

      fragmentShaderSource: `#version 300 es
      precision mediump float;

      const float shininess = 1000.0;
      const float PI = 3.1415926535897932384626433832795;

      uniform vec3 uViewOrigin;
      uniform vec3 uLightDirection;
      uniform vec3 uAmbientLight;
      uniform vec3 uDiffuseLight;
      uniform vec3 uSpecularLight;
      uniform float uShadingType;
      uniform sampler2D uWoodTexture;
      uniform samplerCube uRubiksTexture;

      uniform samplerCube uEnv;
      uniform vec3 vVertexColor;

      in vec3 vModelPosition;
      in vec3 vWorldPosition;
      in vec3 vWorldNormal;

      out vec4 fragColor;
      void main(void) {

      vec3 worldPosition = vWorldPosition;
      vec3 worldNormal = normalize(vWorldNormal);
      vec3 modelPosition = vModelPosition;
      // Adjust to actual center of teapot.
      modelPosition.y -= 1.0;
      modelPosition = normalize(modelPosition);
      vec3 vectorView = normalize( uViewOrigin - worldPosition );


      // Sum up lighting and reflection parts
      if (uShadingType == 1.0){
        // Calculate texture coorinates.
        vec2 textureCoord = vec2(0.5, 0.5);
        textureCoord.s = -atan(-modelPosition.z, -modelPosition.x) / 2.0 / PI + 0.5;
        textureCoord.t = 0.5 - 0.5 * modelPosition.y;
        fragColor = 0.5* vec4(texture(uWoodTexture, textureCoord).rgb, 2.0);

        // add reflection
        fragColor += 0.4 * vec4(texture(uEnv, normalize(reflect(-vectorView, worldNormal))).rgb,
        0.0);
      } else if (uShadingType == 2.0) {
        fragColor = vec4(texture(uRubiksTexture, normalize(vModelPosition)).rgb, 1.0);
      } else {
        // Phong reflection model
        vec3 normalizedLightDirection = normalize(uLightDirection);
        vec3 vectorReflection = normalize( reflect(-normalizedLightDirection, worldNormal) );
  
        float diffuseLightWeighting = max( dot(worldNormal, normalizedLightDirection), 0.0 );
        float specularLightWeighting = pow( max( dot(vectorReflection, vectorView), 0.0), shininess );  
        fragColor =  vec4(
        (8.0*uAmbientLight * vVertexColor)
        + ((uDiffuseLight * vVertexColor) * diffuseLightWeighting)
        + ( uSpecularLight * specularLightWeighting),
        1.0 );

        // add reflection
        fragColor += 0.4 * vec4(texture(uEnv, normalize(refract(-vectorView, worldNormal, 0.82))).rgb,
        0.0);
      }
      // always reflects
      
      }`,
    };
  }
}
