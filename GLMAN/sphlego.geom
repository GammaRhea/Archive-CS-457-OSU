#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles ) in;
layout( triangle_strip, max_vertices=204 ) out;

in vec3 vNormal[3];

uniform int uLevel;
uniform float uQuantize;
uniform bool uRadiusOnly;
uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;
out float gLightIntensity;

const float PI = 3.14159265;

vec3 v0, v01, v02;
vec3 n0, n01, n02;

float
Sign( float f )
{
        if( f >= 0. )   return  1.;
        return -1.;
}


float
Quantize( float f )
{
        f *= uQuantize;
        f += 0.5 * Sign(f);                // round-off
        int fi = int( f );
        f = float( fi ) / uQuantize;
        return f;
}


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
ProduceVertex(float s, float t)
{
	vec3 v = v0 + (s * v01) + (t * v02);
	
	vec3 n = n0 + (s * n01) + (t * n02);
	vec3 tnorm = normalize(gl_NormalMatrix * n);
	
	float r = length( v );
	float theta = atan2( v.z, v.x );
	float phi = atan2( v.y, length( v.xz ) );
	
	if( uRadiusOnly ){
		r = Quantize(r);
	} else {
		r = Quantize(r);
		theta = Quantize(theta);
		phi = Quantize(phi);
	}
	
	v.y = r * sin( phi );
	float xz = r * cos( phi );
	v.x = xz * cos( theta );
	v.z = xz * sin( theta );
	
	vec4 ECposition = gl_ModelViewMatrix * vec4( v, 1. );
	gLightIntensity = abs( dot( normalize( vec3(uLightX, uLightY, uLightZ) - ECposition.xyz), tnorm));
	
	gl_Position = gl_ModelViewProjectionMatrix * vec4( v.x, v.y, v.z, 1. );
	
	EmitVertex();
}


void
main( )
{
	v0 = gl_PositionIn[0].xyz;
	v01 = (gl_PositionIn[1] - gl_PositionIn[0]).xyz;
	v02 = (gl_PositionIn[2] - gl_PositionIn[0]).xyz;
	
	n0 = vNormal[0];
	n01 = vNormal[1] - vNormal[0];
	n02 = vNormal[2] - vNormal[0];
	
	int numLayers = 1 << uLevel;
	float dt = 1. / float(numLayers);
	
	float t_top = 1.;
	
	for(int it = 0; it < numLayers; it++) {
		float t_bot = t_top - dt;
		float smax_top = 1. - t_top;
		float smax_bot = 1. - t_bot;
		
		int nums = it + 1;
		float ds_top = smax_top / float( nums - 1 );
		float ds_bot = smax_bot / float( nums );

		float s_top = 0.;
		float s_bot = 0.;
		
		for( int is = 0; is < nums; is++ )
		{
			ProduceVertex( s_bot, t_bot );
			ProduceVertex( s_top, t_top );
			s_top += ds_top;
			s_bot += ds_bot;
		}
		
		ProduceVertex( s_bot, t_bot );
		EndPrimitive( );
		
		t_top = t_bot;
		t_bot -= dt;
	}
}