#version 330 compatibility

out vec3 vNormal;

void
main( ) {
	vNormal.xyz = gl_Vertex.xyz;
	gl_Position = gl_Vertex;
}