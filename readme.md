# ![Project F logo](http://2.bp.blogspot.com/-k-My1B-YlaU/T8JUBAYpu9I/AAAAAAAAACI/OnCvkzFF5jw/s1600/logo_l1_s.png) Project F
[http://project--f.blogspot.com/](http://project--f.blogspot.com/)

F.core is the core components of Project F used to build browser based fighter games.

## Architecture
F.core __is not a game engine__. F.core is a set of conceptual and functional components that can be used to build an engine.
so it is not a hard decision like Windows vs Mac when choose to use F.core. you find the parts you are interested, pull it out and use it in your game.

F.core employs requirejs dependency management, and you should too, if you care to build games that has more than 1000 lines of code. requirejs can be clumsy to set up than `<script src="">`, but when a project grows it will pay off.

F.core components can be categorized into:

<h4>sprites</h4>
[sprite](#sprite) and [animator](#animator)

<h4>keyboard controller system</h4>
[controller](#controller),
[combodec](#combodec) (combo detector) with
[control_recorder](#control_recorder) and
[control_player](#control_player).

<h4>math</h4>
some [collision](#collision) detection and [math](#math) functions and javascript [util](#util)

[world](#world) for 3d to 2d projection

<h4>system programming</h4>
[states](#states) oriented programming in hierarchical state machines

<h4>entities management</h4>
[effect_pool](#effect_pool) for managing effects and
[graph](#effect_pool) for hashing objects

<h4>web application</h4>
[css](#css) for loading and optimizing css files and 
[support](#support) to check for browser support

## Components and features

### sprite
 - display and control sprites on page using <div> and <img> tag
 - multiple images for one sprite
 - not using canvas for sprite animations
 - support style left/top and CSS transform, depending on browser support

### animator
- animate sprites
- support multiple animation sequence on the same image

### controller
 - controllers for multiple players on the same keyboard
 - maintains a table of key states
 - generate key events for child controllers
 - buffered mode: buffer inputs and fetch only once a loop
 - never drops keys

### combodec
 - listen key events and detect combo from a controller
 - maintains a clean sequence of pressed keys and fire events when combo is detected
 - King of Fighter style combos
 - eliminating auto-repeated keys

### controller-recorder
- record and playback activity of a controller
- useful in game demo and testing

### states
 - nested state transition system, a Hierarchical State Machine ( HSM )
 - intuitive state machine definition syntax
 - simple (not UML compatible) yet powerful enough for interactive gaming
 - reduces logical bugs if used as a programming paradigm

### effect_pool
- manages a pool of effect instances using a circular array
- particularly useful in creating game effects, like explosions, flame or sound effects

### graph
- mapping(hashing) objects in finite 2d space into a 2d array

### math
- some useful vector operations

### collision
- performing rectangle-rectangle, triangle-triangle, circle-circle, line-line intersect tests
and point in rectangle test

### web development practices
- use [requirejs](http://requirejs.org/) for dependency management
- compile-time optimization

## Documentation
on [http://tyt2y3.github.com/F.core/docs/docs.html]

## Sample usages
- [support.html](http://tyt2y3.github.com/F.core/sample/support.html)
- [states.html](http://tyt2y3.github.com/F.core/sample/states.html)
- [sprite.html](http://tyt2y3.github.com/F.core/sample/sprite.html)
- [graph.html](http://tyt2y3.github.com/F.core/sample/graph.html)
- [controller.html](http://tyt2y3.github.com/F.core/sample/controller.html)
- [combo.html](http://tyt2y3.github.com/F.core/sample/combo.html)
- [collision.html](http://tyt2y3.github.com/F.core/sample/collision.html)
- [effects-pool.html](http://tyt2y3.github.com/F.core/sample/effects-pool.html)
- [world.html](http://tyt2y3.github.com/F.core/sample/world.html)

## License
Generally has complete freedom except for profit- making. For exact terms see [license](http://project--f.blogspot.hk/2012/05/license.html).
