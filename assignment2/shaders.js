window.shaders = {
  vertexShaderCode_flat: `#version 300 es
    in vec3 aPosition;
    uniform mat4 uMMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uVMatrix;
    out mat4 vMatrix;
    out vec3 posInEyeSpace;

    void main() {
      mat4 projectionModelView;
      projectionModelView = uPMatrix * uVMatrix * uMMatrix;
      gl_Position = projectionModelView * vec4(aPosition, 1.0);
      posInEyeSpace = vec3(uVMatrix * uMMatrix * vec4(aPosition,1.0));
      gl_PointSize = 2.0;
      vMatrix=uVMatrix;
    }`,

  // Fragment shader code
  fragShaderCode_flat: `#version 300 es
    precision mediump float;
    in mat4 vMatrix;
    in vec3 posInEyeSpace;
    out vec4 fragColor;
    uniform vec4 objColor;
    vec3 normal;
    uniform vec3 light;
    vec3 L,R,V;

    void main() {
      normal = normalize(cross(dFdx(posInEyeSpace), dFdy(posInEyeSpace)));
      L = normalize(vec3(vMatrix * vec4(light, 1.0)) - posInEyeSpace);
      R = normalize(-reflect(L,normal));
      V = normalize(-posInEyeSpace);
      float diffuse = max(dot(normal,L),0.0);
      float specular = 1.0*pow(max(dot(V,R),0.0),10.0);
      float ambient = 0.5;
      fragColor = vec4(vec3((ambient+ diffuse + specular)*objColor),1.0);
    }`,

  vertexShaderCode_gouraud: `#version 300 es
    in vec3 aPosition;
    in vec3 aNormal;

    uniform mat4 uMMatrix; // model matrix
    uniform mat4 uPMatrix; // projection matrix
    uniform mat4 uVMatrix; // view matrix

    out vec4 fragColor;
    uniform vec3 light;
    vec3 L,R,V,posInEyeSpace;
    
    void main() {
      mat4 projectionModelView;
      mat3 normalTransformMatrix = mat3(uVMatrix*uMMatrix);
      vec3 normal = normalize(normalTransformMatrix*aNormal);

      projectionModelView = uPMatrix * uVMatrix * uMMatrix;
      gl_Position = projectionModelView * vec4(aPosition, 1.0);
      posInEyeSpace = vec3(uVMatrix * uMMatrix * vec4(aPosition,1.0));
      gl_PointSize = 2.0;
      L = normalize(vec3(uVMatrix * vec4(light, 1.0)) - posInEyeSpace);
      R = normalize(-reflect(L,normal));
      V = normalize(-posInEyeSpace);
      float diffuse = max(dot(normal,L),0.0);
      float specular = 1.0*pow(max(dot(V,R),0.0),10.0);
      float ambient = 0.5;
      fragColor = vec4(vec3((ambient+ diffuse + specular)),1.0);
    }`,

  // Fragment shader code
  fragShaderCode_gouraud: `#version 300 es
    precision mediump float;
    in vec4 fragColor;

    out vec4 Color;

    uniform vec4 objColor;

    void main() {
      Color = fragColor*objColor;
    }`,

  vertexShaderCode_phong: `#version 300 es
    in vec3 aPosition;  // Vertex position
    in vec3 aNormal;    // Vertex normal
    
    out vec3 fragNormal; // Interpolated normal to fragment shader
    out vec3 fragLightDir; // Interpolated light direction to fragment shader
    out vec3 fragViewDir; // Interpolated view direction to fragment shader
    
    uniform mat4 uMMatrix; // Model matrix
    uniform mat4 uPMatrix; // Projection matrix
    uniform mat4 uVMatrix; // View matrix
    uniform vec3 light; // Light position
    
    out vec4 FragColor; // Output fragment color
    
    void main() {
      // Transform vertex position, normal, and light vector into view space
      vec4 viewPos = uVMatrix * uMMatrix * vec4(aPosition, 1.0);
      vec4 viewNormal = uVMatrix * uMMatrix * vec4(aNormal, 0.0);
      vec3 viewLightDir = normalize(light - viewPos.xyz);
      vec3 viewViewDir = normalize(-viewPos.xyz);
  
      // Pass data to fragment shader
      fragNormal = normalize(viewNormal.xyz);
      fragLightDir = viewLightDir;
      fragViewDir = viewViewDir;
  
      // Calculate the final vertex position in clip space
      gl_Position = uPMatrix * viewPos;
    }`,

  fragShaderCode_phong: `#version 300 es
    precision mediump float;
    in vec3 fragNormal; // Interpolated normal from vertex shader
    in vec3 fragLightDir; // Interpolated light direction from vertex shader
    in vec3 fragViewDir; // Interpolated view direction from vertex shader
    
    out vec4 FragColor; // Output fragment color
    
    uniform vec4 objColor; // Object color
    const vec3 ambientColor = vec3(0.4, 0.4, 0.4); // Ambient color
    const vec3 diffuseColor = vec3(1.0, 1.0, 1.0); // Diffuse color
    const vec3 specularColor = vec3(1.0, 1.0, 1.0); // Specular color
    const float shininess = 32.0; // Shininess factor
    
    void main() {
        // Calculate the normalized normal, light direction, and view direction
        vec3 N = normalize(fragNormal);
        vec3 L = normalize(fragLightDir);
        vec3 V = normalize(fragViewDir);
    
        // Calculate the reflection direction
        vec3 R = reflect(-L, N);
    
        // Calculate the ambient, diffuse, and specular components
        vec3 ambient = ambientColor * objColor.rgb;
        vec3 diffuse = max(dot(N, L), 0.0) * diffuseColor * objColor.rgb;
        vec3 specular = pow(max(dot(R, V), 0.0), shininess) * specularColor;
    
        // Calculate the final color
        vec3 finalColor = ambient + diffuse + specular;
    
        // Output the final color
        FragColor = vec4(finalColor, objColor.a);
    }`,
};
