/*\
 * math
 * math related functions
\*/

define(function(){

math={
/**
math helper functions-----
*/
/*\
 * math.inbetween
 [ method ]
 - x, L, R (number)
 = (boolean) true if x is in between L and R
\*/
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
/*\
 * math.round_d2
 [ method ]
 - I (number)
 = (number) round to decimal 2
\*/
round_d2: function (I)
{
	return Math.round(I*100)/100;
},
/*\
 * math.negligible
 [ method ]
 - M (number)
 = (boolean) true if M is very very small, with absolute value smaller than ~0.00000001
\*/
negligible: function (M)
{
	return -0.00000001 < M && M < 0.00000001;
},

/**
curves--------------------
*/

/*\
 * math.bezier2
 [ method ]
 - A, C, B (object) points in `{x,y}`
 * here `C` means the control point
 - steps (number)
 = (object) array of points on curve
\*/
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
2d vector math--------------
*/
/*\
 * math.add
 [ method ]
 * A+B
 - A, B (object) points in `{x,y}`
 = (object) point in `{x,y}`
\*/
add: function (A,B)
{
	return {x:A.x+B.x, y:A.y+B.y};
},
/*\
 * math.sub
 * A-B
 [ method ]
 - A, B (object) points in `{x,y}`
 = (object) point in `{x,y}`
\*/
sub: function (A,B)
{
	return {x:A.x-B.x, y:A.y-B.y};
},
/*\
 * math.scale
 * A*t
 [ method ]
 - A (object) point
 - t (number)
 = (object) point
\*/
sca: function (A,t)
{
	return {x:A.x*t, y:A.y*t};
},
/*\
 * math.length
 * |A|
 [ method ]
 - A (object) point
 = (number) length
\*/
length: function (A)
{
	return Math.sqrt( A.x*A.x + A.y*A.y );
},
/*\
 * math.distance
 * |AB|
 [ method ]
 - A, B (object) points in `{x,y}`
 = (number) length
\*/
distance: function (p1,p2)
{
	return Math.sqrt( (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y) );
},
/*\
 * math.negative
 * -A
 [ method ]
 - A (object) point
 = (object) point
\*/
negative: function (A)
{
	return {x:-A.x, y:-A.y};
},
/*\
 * math.normalize
 * A/|A|
 [ method ]
 - A (object) point
 = (object) point
\*/
normalize: function (A)
{
	return math.sca(A, 1/math.length(A));
},
/*\
 * math.perpen
 * perpendicular; anti-clockwise 90 degrees, assume origin in lower left
 [ method ]
 - A (object) point
\*/
perpen: function (A)
{
	return {x:-A.y, y:A.x};
},
/*\
 * math.signed_area
 [ method ]
 - A, B, C (object) points
 = (number) signed area
 * the sign indicate clockwise/anti-clockwise points order
\*/
signed_area: function (p1,p2,p3)
{
	var D = (p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y);
	return D;
},
/*\
 * math.intersect
 * line-line intersection
 [ method ]
 - P1 (object) point on line 1
 - P2 (object) point on line 1
 - P3 (object) point on line 2
 - P4 (object) point on line 2
 = (object) return the intersection point of P1-P2 with P3-P4
 * reference: [http://paulbourke.net/geometry/lineline2d/](http://paulbourke.net/geometry/lineline2d/)
\*/
intersect: function ( P1,P2,P3,P4)
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

	function negligible (M)
	{
		return -0.00000001 < M && M < 0.00000001;
	}
}

};
return math;
});
