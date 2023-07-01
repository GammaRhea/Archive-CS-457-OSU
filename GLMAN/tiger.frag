#version 330 compatibility

uniform float Timer;

uniform sampler2D TexUnit;

in vec2 vST;

const float PI = 3.14159265;

uniform float rbow;
uniform bool rBool;

float fmod(float x, float y)
{
	return x - y * floor(x/y);
}

void
main( )
{
	float x, y, u, v, w, a, r;

    x = vST.s - 0.5;
    y = vST.t - 0.5;

    a = atan( y, x );
    r = sqrt( x * x + y * y );

    u = a / PI + 0.005 * r;
    v = 40 * pow( r, 0.01 );

    v += (Timer);

	if(!rBool){
	gl_FragColor = vec4(texture2D(TexUnit, vec2(u, v)).r,
						texture2D(TexUnit, vec2(u, v)).g,
						texture2D(TexUnit, vec2(u, v)).b, 1.);
	}
	else{
	gl_FragColor = vec4(fmod(texture2D(TexUnit, vec2(u, v)).r, rbow),
						fmod(texture2D(TexUnit, vec2(u, v)).g, rbow),
						fmod(texture2D(TexUnit, vec2(u, v)).b, rbow), 1.);
	}
}