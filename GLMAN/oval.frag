#version 330 compatibility

in float vLightIntensity;
in vec2 vST;

uniform float uAd;
uniform float uBd;
uniform float uTol;

const vec3 RED   = vec3( 1., 0., 0. );
const vec3 ORANGE = vec3( 1., 0.5, 0. );
const vec3 WHITE  = vec3( 1., 1., 1. );

void
main()
{
	float Ar = uAd/2.;
	float Br = uBd/2.;
	
	int numins = int(vST.s/uAd);
	int numint = int(vST.t/uBd);
	
	float s = numins * uAd + Ar;
	float t = numint * uBd + Br;
	
	vec3 color = mix(RED, WHITE, smoothstep(1 - uTol, 1 + uTol, pow(((vST.s - s)/Ar), 2) + pow(((vST.t - t)/Br), 2)));
	
	gl_FragColor = vec4(color * vLightIntensity, 1.);
}