#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;    // density FBO
uniform sampler2D uBloom;
uniform sampler2D uSunrays;
uniform float bloomIntensity;
uniform float sunraysIntensity;
uniform float vignetteIntensity;
uniform float bloomEnabled;    // 1.0 / 0.0
uniform float sunraysEnabled;
uniform float vignetteEnabled;

vec3 linearToGamma(vec3 c) {
    return pow(max(c, vec3(0.0)), vec3(0.4545));
}

void main () {
    vec3 c = max(texture(uTexture, vUv).rgb, vec3(0.0));

    // Sunrays – additive light shafts
    if (sunraysEnabled > 0.5) {
        float rays = texture(uSunrays, vUv).r;
        c += rays * sunraysIntensity;
    }

    // Bloom – additive glow
    if (bloomEnabled > 0.5) {
        vec3 bloom = texture(uBloom, vUv).rgb;
        c += bloom * bloomIntensity;
    }

    // Reinhard tonemap (HDR → display range)
    c = c / (c + vec3(0.15));
    c *= 1.5;

    // Vignette
    if (vignetteEnabled > 0.5) {
        vec2 uv = vUv - 0.5;
        float v = 1.0 - dot(uv, uv) * vignetteIntensity * 3.0;
        c *= clamp(v, 0.0, 1.0);
    }

    // Gamma
    c = linearToGamma(c);

    outColor = vec4(c, 1.0);
}
