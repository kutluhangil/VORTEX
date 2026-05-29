#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform vec3 curve;
uniform float bloom;
uniform float sunrays;

// Agent 4 replaces this with LUT colour mapping + bloom + sunrays.
// For now: linear passthrough with a mild contrast curve.
void main () {
    vec3 c = max(texture(uTexture, vUv).rgb, vec3(0.0));
    // Reinhard-like tonemapping so bright splats look good
    c = c / (c + vec3(0.15));
    c *= 1.6;
    outColor = vec4(c, 1.0);
}
