#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform vec2 velScale;   // (1,1) on square grids; damps the long axis on wide grids
uniform float dt;
uniform float dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tSize) {
    vec2 st = uv / tSize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture(sam, (iuv + vec2(0.5, 0.5)) * tSize);
    vec4 b = texture(sam, (iuv + vec2(1.5, 0.5)) * tSize);
    vec4 c = texture(sam, (iuv + vec2(0.5, 1.5)) * tSize);
    vec4 d = texture(sam, (iuv + vec2(1.5, 1.5)) * tSize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
    // velScale keeps the advected displacement isotropic in screen space on
    // non-square (ultrawide) grids — without it, horizontal motion drifts
    // faster than vertical and the field looks stretched.
    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * velScale;
    vec4 result = bilerp(uSource, coord, dyeTexelSize);
    float decay = 1.0 + dissipation * dt;
    outColor = result / decay;
}
