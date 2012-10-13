//collision detection system
/*	perform
	-rectangle-rectangle intersect test
	-triangle-triangle intersect test
	-circle-circle intersect test
	-line-line intersect test
	-point in rectangle test
 */

define(['core/math'], function(Fm) //exports a set of functions in an object
{

return {

//rectangle-rectangle intersect test
rect: function (rect1,rect2) //rect1,rect2: object in form {left,top,right,bottom}
{
	if(rect1.bottom < rect2.top)	return false;
	if(rect1.top > rect2.bottom)	return false;
	if(rect1.right < rect2.left)	return false;
	if(rect1.left > rect2.right)	return false;

	return true;
},

normalize_rect: function (rect)
{
	if( rect.left > rect.right && rect.top > rect.bottom)
		return {left:rect.right, right:rect.left,
			top:rect.bottom, bottom:rect.top}
	else if( rect.left > rect.right)
		return {left:rect.right, right:rect.left,
			top:rect.top, bottom:rect.bottom}
	else if( rect.top > rect.bottom)
		return {left:rect.left, right:rect.right,
			top:rect.bottom, bottom:rect.top}
	else
		return rect;
},

//triangle-triangle intersect test
//	return true if triangle A touchs B,
//	  including cases when one is completely contained in other
tri: function (A,B) //triangle A,B: array of points in form {x,y}
{
	/*I assume this a fast enough implementation
	  it performs a max. of 18 cross products when the triangles do not intersect.
	    if they do, there may be fewer calculations
	*/
	var aa=Fm.signed_area;
	var I=[];
	//line line intersect tests
	var tested=0;
	I.push( aa(A[0],A[1],B[0])>0, aa(A[0],A[1],B[1])>0,
		aa(A[0],B[0],B[1])>0, aa(A[1],B[0],B[1])>0
	);if(test())return true;
	I.push(         I[1]        , aa(A[0],A[1],B[2])>0,
		aa(A[0],B[1],B[2])>0, aa(A[1],B[1],B[2])>0
	);if(test())return true;
	I.push(         I[0]        ,         I[5]        ,
		aa(A[0],B[0],B[2])>0, aa(A[1],B[0],B[2])>0
	);if(test())return true;
	I.push( aa(A[1],A[2],B[0])>0, aa(A[1],A[2],B[1])>0,
			I[3]        , aa(A[2],B[0],B[1])>0
	);if(test())return true;
	I.push(         I[13]       , aa(A[1],A[2],B[2])>0,
			I[7]        , aa(A[2],B[1],B[2])>0
	);if(test())return true;
	I.push(         I[12]       ,         I[17]       ,
			I[11]       , aa(A[2],B[0],B[2])>0
	);if(test())return true;
	I.push( aa(A[0],A[2],B[0])>0, aa(A[0],A[2],B[1])>0,
			I[2]        ,         I[15]
	);if(test())return true;
	I.push(         I[25]       , aa(A[0],A[2],B[2])>0,
			I[6]        ,         I[19]
	);if(test())return true;
	I.push(         I[24]       ,         I[29]       ,
			I[10]       ,         I[23]
	);if(test())return true;

	function test()
	{
		var i=tested; tested+=4;
		return (I[i]!=I[i+1] && I[i+2]!=I[i+3]);
	}

	//point inside triangle test
	var AinB=[ I[2]==I[6]&&I[6]==!I[10],   //true if A[0] is inside triangle B
		   I[3]==I[7]&&I[7]==!I[11],   //  A[1]
		   I[15]==I[19]&&I[19]==!I[23]]//  A[2]

	var BinA=[ I[0]==I[12]&&I[12]==!I[24], //true if B[0] is inside triangle A
		   I[1]==I[13]&&I[13]==!I[25], //  B[1]
		   I[9]==I[21]&&I[21]==!I[33]];//  B[2]

	if (AinB[0] && AinB[1] && AinB[2])  return true;
	if (BinA[0] && BinA[1] && BinA[2])  return true;

	return false;
	//another possible implementation http://jgt.akpeters.com/papers/Moller97/tritri.html
},

//circle-circle intersect test
circle: function (A,B) //A,B: circle in form {center,radius},
						// where center is in form {x,y}, radius is a number
{
	return (Fm.distance(A.center,B.center) <= A.radius+B.radius);
},

//line-line intersect test
//	return true if line AB intersects CD
line: function (A,B,C,D) //A,B,C,D: points in form {x,y}
{
	var res = (Fm.signed_area(A,B,C)>0 != Fm.signed_area(A,B,D)>0) &&
		  (Fm.signed_area(C,D,A)>0 != Fm.signed_area(C,D,B)>0);
	return res;
},

//point in rectangle test
point_in_rect: function (P,R) //P: point in form {x,y}, R: object in form {left,top,right,bottom}
{
	return (Fm.inbetween(P.x,R.left,R.right) && Fm.inbetween(P.y,R.top,R.bottom));
}

}});
