#version 300 es
precision mediump float;
precision mediump sampler2D;

in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;

uniform sampler2D uVelocity;

void main () {
    float L = texture(uVelocity, vL).y;
    float R = texture(uVelocity, vR).y;
    float T = texture(uVelocity, vT).x;
    float B = texture(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    outColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
