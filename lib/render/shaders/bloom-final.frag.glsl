#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uBase;
uniform sampler2D uBloom;
uniform float intensity;

void main () {
    vec3 base  = texture(uBase,  vUv).rgb;
    vec3 bloom = texture(uBloom, vUv).rgb;
    outColor = vec4(base + bloom * intensity, 1.0);
}
