//math related functions

define(function(){ //exports a set of functions in an object

math={
/**
math helper functions-----
*/
/**
	@function
	@param x
	@param L
	@param R
	@return true if x is in between L and R
*/
inbetween: function (x,L,R)
{
	var l,r;
	if ( L<=R)
	{	l=L;
		r=R;
	}
	else
	{	l=R;
		r=L;
	}
	return x>=l && x<=r;
},
/**	round to decimal 2
	@function
*/
round_d2: function (I)
{
	return Math.round(I*100)/100;
},
/**	@function
*/
negligible: function (M)
{
	return -0.00000001 < M && M < 0.00000001;
},

/**
curves--------------------
*/
/**	degree 2 bezier
	@function
*/
bezier2: function (A,C,B,steps)
{
	var curve = new Array();
	for( var i=0; i<steps; i++)
	{
		curve.push(math.bezier2_step(A,C,B, i,steps));
	}
	curve.push(B);
	return curve;
},
bezier2_step: function (A,C,B, i,steps)
{
	var P={x:0,y:0};
	P.x = getstep(getstep(A.x, C.x, i, steps), getstep(C.x, B.x, i, steps), i, steps);
	P.y = getstep(getstep(A.y, C.y, i, steps), getstep(C.y, B.y, i, steps), i, steps);
	return P;

	function getstep(x1, x2, stepcount, numofsteps)
	{
		return ((numofsteps - stepcount) * x1 + stepcount * x2) / numofsteps;
	}
},

/**
vector math--------------
*/
/**	A+B
	@function
*/
add: function (A,B)
{
	return {x:A.x+B.x, y:A.y+B.y};
},
/**	A-B
	@function
*/
sub: function (A,B)
{
	return {x:A.x-B.x, y:A.y-B.y};
},
/**	scale
	@function
*/
sca: function (A,t)
{
	return {x:A.x*t, y:A.y*t};
},
/**	@function
*/
length: function (A)
{
	return Math.sqrt( A.x*A.x + A.y*A.y );
},
/**	@function
*/
distance: function (p1,p2)
{
	return Math.sqrt( (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y) );
},
/**	@function
*/
negative: function (A)
{
	return {x:-A.x, y:-A.y};
},
/**	@function
*/
normalize: function (A)
{
	return math.sca(A, 1/math.length(A));
},
/**	perpendicular: anti-clockwise 90 degrees, assume origin in lower left
	@function
*/
perpen: function (A)
{
	return {x:-A.y, y:A.x};
},
/**	@function
*/
signed_area: function (p1,p2,p3)
{
	var D = (p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y);
	return D;
},
/**	line-line intersection
	@function
	@param P1 line 1
	@param P2 line 1
	@param P3 line 2
	@param P4 line 2
	@return the intersection point of P1-P2 with P3-P4
*/
intersect: function ( P1,P2,
			P3,P4)
{
	var mua,mub;
	var denom,numera,numerb;

	denom  = (P4.y-P3.y) * (P2.x-P1.x) - (P4.x-P3.x) * (P2.y-P1.y);
	numera = (P4.x-P3.x) * (P1.y-P3.y) - (P4.y-P3.y) * (P1.x-P3.x);
	numerb = (P2.x-P1.x) * (P1.y-P3.y) - (P2.y-P1.y) * (P1.x-P3.x);

	if ( negligible(numera) && negligible(numerb) && negligible(denom)) {
		//meaning the lines coincide
		return { x: (P1.x + P2.x) * 0.5,
			y:  (P1.y + P2.y) * 0.5 };
	}

	if ( negligible(denom)) {
		//meaning lines are parallel
		return { x:0, y:0};
	}

	mua = numera / denom;
	mub = numerb / denom;

	return { x: P1.x + mua * (P2.x - P1.x),
		y:  P1.y + mua * (P2.y - P1.y) };
	//http://paulbourke.net/geometry/lineline2d/
}

};
return math;
});
