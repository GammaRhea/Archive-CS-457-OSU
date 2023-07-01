#version 330 compatibility

uniform float uLightX, uLightY, uLightZ;
uniform float uK, uA;

out vec3 vNs;
out vec3 vLs;
out vec3 vEs;
out vec3 vMC;

float
Sinc( float r, float k )
{
	if( r*k == 0. )
		return 1.;
	return sin(r*k) / (r*k);
}

float
DerivSinc( float r, float k )
{
	if( r*k == 0. )
		return 0;
	return ( r*k*cos(r*k) - sin(r*k) ) / ( r*k*r*k );
}

vec3 lightPos = vec3(uLightX, uLightY, uLightZ);

void
main( )
{
	vec4 newVertex = gl_Vertex;
	float r = sqrt( newVertex.x*newVertex.x + newVertex.y*newVertex.y );
	// more efficient: float r = length( newVertex.xy );
	newVertex.z = uA * Sinc( r, uK );
	
	vec4 ECposition = gl_ModelViewMatrix * newVertex;

	float dzdr = uA * DerivSinc( r, uK );
	float drdx = newVertex.x / r;
	float drdy = newVertex.y / r;
	float dzdx = dzdr * drdx;
	float dzdy = dzdr * drdy;
	
	vec3 Tx = vec3(1., 0., dzdx );
	vec3 Ty = vec3(0., 1., dzdy );
	
	vec3 newNormal = normalize( cross( Tx, Ty ) );
	
	vNs = normalize(gl_NormalMatrix * newNormal);
	vLs = lightPos - ECposition.xyz;
	vEs = vec3(0., 0., 0.) - ECposition.xyz;
	vMC = vec3(newVertex.x, newVertex.y, newVertex.z);
	
	gl_Position = gl_ModelViewProjectionMatrix * newVertex;
}