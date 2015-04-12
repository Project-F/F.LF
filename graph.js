define(['F.core/util'],function(F)
{

/*\
 * graph
 * to maintain a graph
 [ class ]
 * a graph is a mapping/hashing of objects in finite 2d world into a 2d array
 * for example, can be used in collision detection system to boost performance.
 * speaking performance, however, there is considerable overhead in maintaining a graph,
 * and factors like cell size and number of objects in scene impact performance the most and
 * must be chosen carefully. and today's javascript is really too fast to care about algorithm
 * while most probably the bottleneck is from rendering.
 * you never know until I experiment on this, see [example](../sample/graph.html)
 - config (object)
|	var gh_config=
|	{
|		width: w, //width
|		height: h,//   and height of the 2d world
|		gridx: gx,//make a
|		gridy: gy,//   gx*gy sized 2d array
|			//specify only (gridx,gridy) OR (cellx,celly)
|		cellx: cx,//the size of
|		celly: cy //   each cell is cx*cy
|	}
\*/
function graph (config)
{
	if( !config.cellx)
	{
		config.cellx=config.width/config.gridx;
		config.celly=config.height/config.gridy;
	}
	if( !config.gridx)
	{
		config.gridx=config.width/config.cellx;
		config.gridy=config.height/config.celly;
	}
	this.config=config;
	this.create_graph(config.gridx, config.gridy);
}

/*\
 * graph.create_graph
 *	create a 3D array
 [ method ]
\*/
graph.prototype.create_graph=function(w,h)
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

/*\
 * graph.at
 * convert P from world space to grid space
 [ method ]
 - P (object) `{x,y}` point in world space
 = (object) `{x,y}` index in grid space
\*/
graph.prototype.at=function(P)
{
	var A= {
		x: Math.floor(P.x/this.config.cellx)%this.config.gridx,
		y: Math.floor(P.y/this.config.celly)%this.config.gridy
	}
	//include the boundaries
	if( A.x==this.config.gridx)
		A.x=this.config.gridx-1;
	if( A.y==this.config.gridy)
		A.y=this.config.gridy-1;
	if( A.x < 0)
		A.x+=this.config.gridx;
	if( A.y < 0)
		A.y+=this.config.gridy;
	return A;
}

/*\
 * graph.get
 * return array of object('s index) present at a particular point
 [ method ]
 - P (object) `{x,y}` index in grid space
 = (array) array of objects in this cell
\*/
graph.prototype.get=function(P)
{
	return this.G[P.x][P.y];
}

/*\
 * graph.add
 * add an object `i` at point `P`
 [ method ]
 - i (object)
 - P (object) `{x,y}` point in world space
\*/
graph.prototype.add=function(i,P)
{
	this.get(this.at(P)).push(i);
}

/*\
 * graph.remove
 * remove object i at P
 [ method ]
 - i (object)
 - P (object) `{x,y}` point in world space
\*/
graph.prototype.remove=function(i,P)
{
	var g=this.get(this.at(P));
	var res = F.arr_search( g, function(e){return e==i} ); //search for i
	if (res) g.splice(res,1); //remove
}

/*\
 * graph.move
 * an object i moves from A to B
 [ method ]
 - i (object)
 - A,B (object) `{x,y}` point in world space
\*/
graph.prototype.move=function(i,A,B)
{
	var gA=this.get(this.at(A));
	var gB=this.get(this.at(B));
	if(!gB)
		var x=1;
	if( gA !== gB)
	{
		var res = F.arr_search( gA, function(e){return e===i} ); //search for i
		if (res) gA.splice(res,1); //remove
		gB.push(i);
	}
}

return graph;

});
