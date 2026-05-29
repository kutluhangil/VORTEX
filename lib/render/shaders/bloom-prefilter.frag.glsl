#version 300 es
precision mediump float;
precision mediump sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float threshold;
uniform float knee;

void main () {
    vec3 c = max(texture(uTexture, vUv).rgb, vec3(0.0));
    float brightness = max(c.r, max(c.g, c.b));

    // Soft knee
    float rq = clamp(brightness - threshold + knee, 0.0, 2.0 * knee);
    rq = (rq * rq) / (4.0 * knee + 0.0001);
    c *= max(rq, brightness - threshold) / max(brightness, 0.0001);

    outColor = vec4(c, 1.0);
}
