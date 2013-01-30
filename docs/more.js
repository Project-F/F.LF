/**these are sections to add into the reference*/
/*\
 * An introduction
 * # ![Project F logo](http://2.bp.blogspot.com/-k-My1B-YlaU/T8JUBAYpu9I/AAAAAAAAACI/OnCvkzFF5jw/s1600/logo_l1_s.png) Project F
 * [project--f.blogspot.com/](http://project--f.blogspot.com/search/label/about)
 * 
 * F.core is the programming library that powered Project F games.
 * currently, games built on top of F.core include
 * 
 >  [F.LF](http://tyt2y3.github.com/LFrelease/demo/demo3.html)
 * ![F.LF](http://tyt2y3.github.com/LFrelease/web/image/mile2013Jan.png)
 >  [teeth](http://tyt2y3.github.com/teeth)
 * ![teeth](http://tyt2y3.github.com/teeth/web/images/cap01.png)
\*/
/*\
 * Architecture
 * F.core __is not a game engine__. F.core is a set of conceptual and functional components that can be used to build an engine.
 * so it is not a hard decision like Windows vs Mac when choose to use F.core. you find the parts you are interested, pull it out and use it in your game.
 * 
 * F.core employs requirejs dependency management, and you should too, if you care to build games that has more than 1000 lines of code. requirejs can be clumsy to set up than `<script src="">`, but when a project grows it will pay off.
 * 
 * All classes in F.core are prototype classes with __no private member__ to make it easy for inheritance. Some properties and methods may not be listed here, but source code is [there](https://github.com/tyt2y3/F.core).
 * 
 * F.core components can be categorized into:
 * 
 > sprites
 * @sprite and @animator
 * 
 > keyboard controller system
 * @controller,
 * @combodec (combo detector) with
 * @control_recorder and
 * @control_player.
 * 
 > math
 * some @collision detection and @math functions and javascript @util
 * 
 * @world for 3d to 2d projection
 * 
 > system programming
 * @states oriented programming in hierarchical state machines
 * 
 > entities management
 * @effect_pool for managing effects and
 * @graph for hashing objects
 * 
 > web application
 * @css for loading and optimizing css files and 
 * @support to check for browser support
\*/
/*\
 * Development condition
 * F.core components are tested, used and are production ready. The feature set is never complete, but the architecture is stabilized and future development will be careful to not break exsiting code.
\*/
/*\
 * Getting_started
 * Download the [package](https://github.com/tyt2y3/F.core/archive/master.zip), or browse the [source code](https://github.com/tyt2y3/F.core), and look into the `sample` directory. __The unzipped folder must be named `F.core`__.
 * 
 * Setup could be tricky, but it is a requirejs issue (haha).
 * 
 * Let go through some scenarios.
 > 1 I do everything in one HTML file and directory looks like
| F.core/
| mygame.html
 * it is a bad practice, but let's look into `mygame.html`
| <body>
| <script data-main="./" src="require.js"></script>
| <script>
| requirejs(['F.core/sprite'], function(Fsprite)
| {
|		var sp = new Fsprite(..);
|		//everything
| });
| </script>
| </body>
 * 
 * here `data-main` sets the `baseUrl` of requirejs, `"./"` means in the same directory as `mygame.html`. every require of F.core say `module.js` is like `F.core/module`, prefixed with `F.core/` but without the `.js` extension, as requirejs naturally assumes every module is a javascript module. the `F.core/` is a directory __relative to the baseUrl__.
 * 
 > 2 I have 1 HTML file with many .js files
 | F.core/
 | mygame.html
 | mygame.js
 | character.js
 * 
 * this is a good practice because it allows you to do @Optimization
 * 
 * `mygame.html` should look like
| <body>
| <script data-main="mygame.js" src="require.js"></script>
| </body>
 * `mygame.js` should look like
| requirejs.config(
| {
| 	baseUrl: './'
| });
| requirejs(['character'], function(character)
| {
|		var david = new character('david');
| });
 * 
 * here the `baseUrl` property is explicitly set.
 * `character.js` may look like
| define(['F.core/sprite','F.core/animator'],
| function(Fsprite,Fanimator)
| {
| 	function character(name) //my character class
| 	{
| 		this.name=name;
| 		this.sprite=new Fsprite(..);
| 		//more setup
| 	}
| 	character.prototype.fight=function()
| 	{
| 		//something
| 	}
| 	return character; //you need to return the class!
| });
 * 
 * what's happening is `mygame.html` requires `mygame.js` and `mygame.js` requires `character.js`, making a chain of dependency. requirejs is good at untangling complex depedency tree to free you from `load this.js before that.js` hassle. that's all you need to get started.
\*/
/*\
 * Optimization
 * Assume you have chosen strategy 2 in @Getting_started, and you have made a fun and good game, and now you want to optimize all javascripts into one `.js` file.
 * 
 * Please read [requirejs documentation](http://requirejs.org/docs/optimization.html) first. that means you have [node.js](http://nodejs.org) installed and [r.js](http://requirejs.org/docs/download.html#rjs) in hand.
 * 
 * a `build.config` then looks
| ({
|	baseUrl: "./",
|	name: "mygame",
|	out: "mygame-built.js",
|	//,optimize: 'none' //uncomment to disable uglifying
| })
 * run
| node r.js -o build.config
 * then replace `<script data-main="mygame.js" src="require.js"></script>` in `mygame.html` with `<script data-main="mygame-built.js" src="require.js"></script>`
\*/
/*\
 * Sample usages
 * - [combo.html](http://tyt2y3.github.com/F.core/sample/combo.html)
 * - [collision.html](http://tyt2y3.github.com/F.core/sample/collision.html)
 * - [controller.html](http://tyt2y3.github.com/F.core/sample/controller.html)
 * - [effects-pool.html](http://tyt2y3.github.com/F.core/sample/effects-pool.html)
 * - [graph.html](http://tyt2y3.github.com/F.core/sample/graph.html)
 * - [support.html](http://tyt2y3.github.com/F.core/sample/support.html)
 * - [states.html](http://tyt2y3.github.com/F.core/sample/states.html)
 * - [sprite.html](http://tyt2y3.github.com/F.core/sample/sprite.html)
 * - [world.html](http://tyt2y3.github.com/F.core/sample/world.html)
\*/
/*\
 * License
 * Generally has complete freedom except for profit- making. For exact terms see [license](http://project--f.blogspot.com/2012/05/license.html).
\*/
/*\
 * Links
 > Project F
 * - repo [https://github.com/tyt2y3/F.core](https://github.com/tyt2y3/F.core)
 * - official site [project--f.blogspot.com/](http://project--f.blogspot.com/)
 > F.LF
 * - repo [https://github.com/tyt2y3/F.LF](https://github.com/tyt2y3/F.LF)
 * - official site [f-lf2.blogspot.com/](http://f-lf2.blogspot.com/)
 * - [demo](http://tyt2y3.github.com/LFrelease/demo/demo3.html)
 > teeth
 * - repo [https://github.com/tyt2y3/teeth](https://github.com/tyt2y3/teeth)
 * - [game](http://tyt2y3.github.com/teeth)
\*/
