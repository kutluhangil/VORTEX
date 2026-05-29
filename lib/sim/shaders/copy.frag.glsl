#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;

void main () {
    outColor = texture(uTexture, vUv);
}
