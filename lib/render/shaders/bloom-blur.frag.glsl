#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform float offset;

void main () {
    vec4 col = vec4(0.0);
    col += texture(uTexture, vUv + vec2(-offset, -offset) * texelSize);
    col += texture(uTexture, vUv + vec2( offset, -offset) * texelSize);
    col += texture(uTexture, vUv + vec2(-offset,  offset) * texelSize);
    col += texture(uTexture, vUv + vec2( offset,  offset) * texelSize);
    outColor = col * 0.25;
}
