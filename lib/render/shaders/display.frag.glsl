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

const float EXPOSURE = 2.5;

vec3 linearToGamma(vec3 c) {
    return pow(max(c, vec3(0.0)), vec3(0.4545));
}

void main () {
    vec3 dye = max(texture(uTexture, vUv).rgb, vec3(0.0));

    // 1) Tonemap the dye itself into [0,1]. exp curve keeps black black
    //    (exp(-0)=1 → 0) and rolls off accumulated highlights so dense dye
    //    can never blow past white on its own.
    vec3 c = vec3(1.0) - exp(-dye * EXPOSURE);

    // 2) Add post-fx as restrained highlights ON TOP of the tonemapped dye.
    //    Scaled down because preset intensities (bloom up to 1.5, sunrays up
    //    to 1.3) are tuned as "amounts", not raw additive gain.
    if (sunraysEnabled > 0.5) {
        float rays = texture(uSunrays, vUv).r;
        c += rays * sunraysIntensity * 0.25;
    }
    if (bloomEnabled > 0.5) {
        vec3 bloom = vec3(1.0) - exp(-texture(uBloom, vUv).rgb * EXPOSURE);
        c += bloom * bloomIntensity * 0.45;
    }

    // 3) Hard clamp so post-fx can't blow out.
    c = min(c, vec3(1.0));

    // Vignette
    if (vignetteEnabled > 0.5) {
        vec2 uv = vUv - 0.5;
        float v = 1.0 - dot(uv, uv) * vignetteIntensity * 3.0;
        c *= clamp(v, 0.0, 1.0);
    }

    c = linearToGamma(c);
    outColor = vec4(c, 1.0);
}
