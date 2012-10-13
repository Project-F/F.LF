//math related functions

define(function(){ //exports a set of functions in an object

math={
//
//math helper functions-----
//
inbetween: function (x,L,R) //x in between L and R
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
round_d2: function (I)
{
	return Math.round(I*100)/100;
},
negligible: function (M)
{
	return -0.00000001 < M && M < 0.00000001;
},

//
//curves--------------------
//
bezier2: function (A,C,B,steps) //degree 2 bezier
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

//
//vector math--------------
//
add: function (A,B) //A+B
{
	return {x:A.x+B.x, y:A.y+B.y};
},
sub: function (A,B) //A-B
{
	return {x:A.x-B.x, y:A.y-B.y};
},
sca: function (A,t) //scale
{
	return {x:A.x*t, y:A.y*t};
},
length: function (A)
{
	return Math.sqrt( A.x*A.x + A.y*A.y );
},
distance: function (p1,p2)
{
	return Math.sqrt( (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y) );
},
negative: function (A)
{
	return {x:-A.x, y:-A.y};
},
normalize: function (A)
{
	return math.sca(A, 1/math.length(A));
},
perpen: function (A) //perpendicular: anti-clockwise 90 degrees
{
	return {x:-A.y, y:A.x};
},
signed_area: function (p1,p2,p3)
{
	var D = (p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y);
	return D;
},
intersect: function ( P1,P2, //line 1
			P3,P4)  //line 2
{
	//line-line intersection
	//	return the intersection point of P1-P2 with P3-P4
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
