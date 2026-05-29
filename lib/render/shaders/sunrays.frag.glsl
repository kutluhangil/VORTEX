#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float weight;

#define SAMPLES 64

void main () {
    vec2 center = vec2(0.5, 0.5);
    vec2 dir = (vUv - center) * (1.0 / float(SAMPLES)) * 0.8;
    vec2 coord = vUv;

    float decay = 0.96;
    float illuminationDecay = 1.0;
    float result = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
        coord -= dir;
        vec3 col = texture(uTexture, clamp(coord, vec2(0.001), vec2(0.999))).rgb;
        float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
        result += lum * illuminationDecay;
        illuminationDecay *= decay;
    }

    result *= 0.3 * weight;
    outColor = vec4(vec3(result), 1.0);
}
