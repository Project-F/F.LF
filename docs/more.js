/**these are sections to add into the reference*/
/*\
 * An introduction
 * # ![Project F logo](http://2.bp.blogspot.com/-k-My1B-YlaU/T8JUBAYpu9I/AAAAAAAAACI/OnCvkzFF5jw/s1600/logo_l1_s.png) Project F
 * [http://project--f.blogspot.com/](http://project--f.blogspot.hk/search/label/about)
 *
 * F.core is the core components of Project F used to build browser based fighter games.
 * currently, games built on top of F.core include
 *
 *  [F.LF](http://tyt2y3.github.com/LFrelease/demo/demo3.html)
 * ![F.LF](http://tyt2y3.github.com/LFrelease/web/image/mile2013Jan.png)
 *  [teeth](http://tyt2y3.github.com/teeth)
 *
 * ![teeth](http://tyt2y3.github.com/teeth/web/images/cap01.png)
\*/
/*\
 * Architecture
 * F.core __is not a game engine__. F.core is a set of conceptual and functional components that can be used to build an engine.
 * so it is not a hard decision like Windows vs Mac when choose to use F.core. you find the parts you are interested, pull it out and use it in your game.
 * 
 * F.core employs requirejs dependency management, and you should too, if you care to build games that has more than 1000 lines of code. requirejs can be clumsy to set up than `<script src="">`, but when a project grows it will pay off.
 * 
 * F.core components can be categorized into:
 * 
 # <h4>sprites</h4>
 * @sprite and @animator
 * 
 # <h4>keyboard controller system</h4>
 * @controller,
 * @combodec (combo detector) with
 * @control_recorder and
 * @control_player.
 * 
 # <h4>math</h4>
 * some @collision detection and @math functions and javascript @util
 * 
 * @world for 3d to 2d projection
 * 
 # <h4>system programming</h4>
 * @states oriented programming in hierarchical state machines
 * 
 # <h4>entities management</h4>
 * @effect_pool for managing effects and
 * @graph for hashing objects
 * 
 # <h4>web application</h4>
 * @css for loading and optimizing css files and 
 * @support to check for browser support
\*/
