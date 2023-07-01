#version 330 compatibility

uniform sampler2D TexUnit;

in vec2		vST;

uniform float uScanlineWeight;
uniform float uGapBrightness;
uniform float uBloomFactor;
uniform float uGammaIn;
uniform float uGammaOut;
uniform int uMaskType;
uniform float uMaskBrightness;
uniform bool uSharper;


float CalcScanLineWeight(float dist)
{
	return max(1.0-dist*dist*uScanlineWeight, uGapBrightness);
}


float CalcScanLine(float dy)
{
	float scanLineWeight = CalcScanLineWeight(dy);
	return scanLineWeight;
}


void main( )
{
	vec2 TextureSize = vec2(512., 512.);

	vec2 texcoord = vST;
	vec2 texcoordInPixels = texcoord * TextureSize;
	
	vec2 tc;
	float scanLineWeight;
	
	if(uSharper == true) {
		vec2 tempCoord = floor(texcoordInPixels) + 0.5;
		vec2 coord = tempCoord / TextureSize;
		vec2 deltas = texcoordInPixels - tempCoord;
		
		scanLineWeight = CalcScanLine(deltas.y);
		
		vec2 signs = sign(deltas);
		
		deltas.x *= 2.0;
		deltas = deltas * deltas;
		deltas.y = deltas.y * deltas.y;
		deltas.x *= 0.5;
		deltas.y *= 8.0;
		deltas /= TextureSize;
		deltas *= signs;
		
		tc = coord + deltas;
	} else {
		float tempY = floor(texcoordInPixels.y) + 0.5;
		float yCoord = tempY / TextureSize.y;
		float dy = texcoordInPixels.y - tempY;
		
		scanLineWeight = CalcScanLine(dy);
		
		float signY = sign(dy);
		
		dy = dy * dy;
		dy = dy * dy;
		dy *= 8.0;
		dy /= TextureSize.y;
		dy *= signY;
		
		tc = vec2(texcoord.x, yCoord + dy);
	}
		
	vec3 colour = texture2D(TexUnit, tc).rgb;
		
	colour = pow(colour, vec3(uGammaIn));
		
	scanLineWeight *= uBloomFactor;
	colour *= scanLineWeight;
		
	colour = pow(colour, vec3(1.0/uGammaOut));
	
	float maskSelect;
	vec3 mask;
	
	if(uMaskType == 1){
		maskSelect = fract((gl_FragCoord.x * 1.0001) * 0.5);
		if(maskSelect < 0.5){
			mask = vec3(uMaskBrightness, 1.0, uMaskBrightness);
		} else{
			mask = vec3(1.0, uMaskBrightness, 1.0);
		}
		
		gl_FragColor = vec4(colour * mask, 1.0);
	} else if(uMaskType == 2){
		maskSelect = fract((gl_FragCoord.x * 1.0001) * 0.3333333);
		mask = vec3(uMaskBrightness, uMaskBrightness, uMaskBrightness);
		if(maskSelect < 0.3333333){
			mask.x = 1.0;
		} else if(maskSelect < 0.6666666){
			mask.y = 1.0;
		} else{
			mask.z = 1.0;
		}
		
		gl_FragColor = vec4(colour * mask, 1.0);
	} else{
		gl_FragColor = vec4(colour, 1.0);
	}

	//vec3 newcolor = texture( TexUnit, vST ).rgb;
	//gl_FragColor = vec4( newcolor, 1. );
}