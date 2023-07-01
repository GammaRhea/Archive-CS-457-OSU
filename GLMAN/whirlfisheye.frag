#version 330 compatibility

uniform float uPower;
uniform float uRtheta;
uniform float uBlend;
uniform float uContrast;
uniform sampler2D TexUnitA;
uniform sampler2D TexUnitB;

in vec2 vST;

const vec4 BLACK = vec4( 0., 0., 0., 1. );

const float PI = 3.14159265;

float
atan2( float y, float x )
{
        if( x == 0. )
        {
                if( y >= 0. )
                        return  PI/2.;
                else
                        return -PI/2.;
        }
        return atan(y,x);
}

void
main( )
{
	//fisheye
	vec2 st = vST - vec2(0.5,0.5);  // put (0,0) in the middle so that the range is -0.5 to +0.5
	float r = length(st);
	float rPrime = pow((2 * r), uPower);
	
	float s = st.x;
	float t = st.y;

	//whirl
	float theta  = atan2( t, s );
	float thetaPrime = theta - uRtheta * r;
	
	//restore
	st = rPrime * vec2( cos(thetaPrime), sin(thetaPrime) );  		// now in the range -1. to +1.
	st += vec2 (1., 1.);                        		// change the range to 0. to +2.
	st *= vec2 (0.5, 0.5); 		       					// change the range to 0. to +1.
	
	// if s or t wander outside the range [0.,1.], paint the pixel black
	if( any( lessThan(st, vec2 (0., 0.)) ) )
		gl_FragColor = BLACK;
	else
		if( any( greaterThan(st, vec2 (1., 1.)) ) )
			gl_FragColor = BLACK;
		else
		{
			// sample both textures at (s,t)
			// mix the two samples using uBlend
			// do the contrasting according to our Image notes
			
			//vec2 comboImage = mix(textureSize(TexUnitA, 0), textureSize(TexUnitB, 0), uBlend);
			
			vec3 comboImage = mix(texture(TexUnitA, st).rgb, texture(TexUnitB, st).rgb, uBlend);
			
			//float ResS = float(comboImage.x);
			//float ResT = float(comboImage.y);
		
			//vec2 stp0 = vec2(1./ResS, 0.);
			//vec2 st0p = vec2(0., 1./ResT);
			//vec2 stpp = vec2(1./ResS, 1./ResT);
			//vec2 stpm = vec2(1./ResS, -1./ResT);
		
			//vec3 i00 = texture2D(comboImage, st).rgb;
			//vec3 im1m1 = texture2D(comboImage, st - stpp).rgb;
			//vec3 ip1p1 = texture2D(comboImage, st + stpp).rgb;
			//vec3 im1p1 = texture2D(comboImage, st - stpm).rgb;
			//vec3 ip1m1 = texture2D(comboImage, st + stpm).rgb;
			//vec3 im10 = texture2D(comboImage, st - stp0).rgb;
			//vec3 ip10 = texture2D(comboImage, st + stp0).rgb;
			//vec3 i0m1 = texture2D(comboImage, st - st0p).rgb;
			//vec3 i0p1 = texture2D(comboImage, st + st0p).rgb;
			
			vec3 target = vec3(0.5, 0.5, 0.5);
			//target += 1. * (im1m1 + ip1m1 + ip1p1 + im1p1);
			//target += 2. * (im10 + ip10 + i0m1 + i0p1);
			//target += 4. * (i00);
			//target /= 16.;
			
			vec4 finalMix = vec4(mix(target, comboImage, uContrast), 1.);
			
			//gl_FragColor = vec4( rgb, 1. );
			gl_FragColor = finalMix;
		}
}