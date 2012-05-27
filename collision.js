//collision detection system
/*	2 strategies in collision detection
	---scene graph: graph all objects onto a 2D grid, perform cell precise collision
	---polygonal: perform precise triangle intersection
*/

if(typeof F=='undefined') F=new Object;
if( typeof F.collision=='undefined') //#ifndef
{

F.collision = function ()
{
	//scene graph------
	this.create_graph=function(w,h) //create a scene graph
	{
		var A = new Array(w);
		for ( var i=0; i<w; i++)
		{
			A[i] = new Array(h);
			for ( var j=0; j<h; j++)
				A[i][j] = new Array();
		}
		this.G = A; //grid storing indices of objects
	}
	
	this.refresh_graph=function(P) //P: array of points
	{
		/*//clear
		for ( var i=0; i<this.G.length; i++)
			for ( var j=0; j<this.G[0].length; j++)
				this.G[i][j].length=0;
		*/
		
		//delete and new again;  interesting benchmark on garbage collector
		this.create_graph(this.G.length, this.G[0].length);
		
		for ( var i=0; i<P.length; i++)
		{
			if( this.point_in_rect(P[i],0,0,this.G.length,this.G[0].length))
			{ //graph only points within area
				this.get_Gxy(P[i]).push(i);
			}
		}
	}
	
	this.modify_graph=function(i,A,B) //an object with index i moves from A to B
	{
		var GA = this.get_Gxy(A);
		var GB = this.get_Gxy(B);
		
		var res = arr_search( GA, function(e){return e==i} ); //search for i
		if (res) GA.splice(res,1); //remove
		
		GB.push(i);
		return GB;
	}
	
	this.get_Gxy=function(P) //return array of object('s index) present at a particular point
	{
		return this.G[Math.floor(P.x)][Math.floor(P.y)];
	}
	
	//polygonal-------
	this.point_in_rect=function(P,left,top,right,bottom)
	{
		return (F.inbetween(P.x,left,right) && F.inbetween(P.y,top,bottom));
	}
	
	//triangle-triangle intersect test
	//	return true if triangle A touchs B,
	//	  including cases when one is completely contained in other
	this.tri_intersect=function(A,B) //triangle A,B: array of points
	{
		/*I assume this a fast enough implementation
		  it performs a max. of 18 cross products when the triangles do not intersect.
		    if they do, there may be fewer calculations
		*/
		var aa=F_.signed_area;
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
		/*another possible implementation http://jgt.akpeters.com/papers/Moller97/tritri.html
		 */
	}
}

} //#endif
