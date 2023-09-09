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
      in vec3 aPosition;
      in vec3 aNormal;

      uniform mat4 uMMatrix; // model matrix
      uniform mat4 uPMatrix; // projection matrix
      uniform mat4 uVMatrix; // view matrix

      out vec3 fragNormal; // Pass the interpolated normal to the fragment shader
      out vec3 fragPosition; // Pass the interpolated vertex position in eye space to the fragment shader

      uniform vec3 light;
      vec3 L, R, V, posInEyeSpace;

      void main() {
        mat4 projectionModelView;
        mat3 normalTransformMatrix = mat3(uVMatrix * uMMatrix);
        vec3 normal = normalize(normalTransformMatrix * aNormal);

        projectionModelView = uPMatrix * uVMatrix * uMMatrix;
        gl_Position = projectionModelView * vec4(aPosition, 1.0);
        posInEyeSpace = vec3(uVMatrix * uMMatrix * vec4(aPosition, 1.0));
        gl_PointSize = 2.0;
        L = normalize(vec3(uVMatrix * vec4(light, 1.0)) - posInEyeSpace);
        R = normalize(-reflect(L, normal));
        V = normalize(-posInEyeSpace);

        fragNormal = normal; // Pass the interpolated normal to the fragment shader
        fragPosition = posInEyeSpace; // Pass the interpolated position to the fragment shader
      }`,

  // Fragment shader code (modified for Phong shading)
  fragShaderCode_phong: `#version 300 es
      precision mediump float;

      in vec3 fragNormal; // Receive the interpolated normal from the vertex shader
      in vec3 fragPosition; // Receive the interpolated position from the vertex shader

      out vec4 Color;

      uniform vec4 objColor;
      uniform vec3 lightDirection; // Direction to the light source
      uniform vec3 viewDirection; // Direction to the viewer/camera
      uniform float shininess; // Shininess factor, adjust as needed

      void main() {
        vec3 normal = normalize(fragNormal);
        vec3 lightDir = normalize(lightDirection);
        vec3 viewDir = normalize(viewDirection);
        
        // Calculate the ambient, diffuse, and specular components
        vec3 ambient = objColor.rgb * 0.5; // Adjust the ambient factor as needed
        float diffuse = max(dot(normal, lightDir), 0.0);
        float specular = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), shininess);

        // Calculate the final color using Phong shading
        vec3 phongColor = ambient + objColor.rgb * diffuse + vec3(specular);

        Color = vec4(phongColor, objColor.a);
      }`,
};
