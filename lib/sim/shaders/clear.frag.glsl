#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float value;

void main () {
    outColor = value * texture(uTexture, vUv);
}
