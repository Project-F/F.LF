This is intended to be a guideline for developers who want to do development on F.LF

# Architecture
Let's have a top-down walk through the modules.
- `global.js` defines the global parameters
- `keychanger.js` is a small utility to change keys of a controller
- `loader.js` is to load all data files as defined by `data.js` during startup.
- `match.js` is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
	the life time of a `match` object represents the course of a match, from start when weapon drops to end all opponents killed.
	- `factories.js` is responsible to list all available classes to `match` as `match` does not depend on object classes directly.
	- `character.js` is a generalization of all LF2 characters. `LFrelease/data/specification.js` specifies the exact property of a character
	- `weapon.js` is a generalization of `heavyweapon` and `lightweapon`.
		- `livingobject.js` is a base class. `character` and `weapon` each derive from `livingobject`, adding their specialized properties and methods.
			- `sprite.js` is a class to handle sprite animation needs in LF2.
			- `mechanics.js` is a state-less helper class to process all mechanics of `livingobject`.
	- `effects.js` handles all the visual effects.
	- `scene.js` maintains a graph of all livingobjects in the scene. collision detection is done by a scene query where livingobject query for intersection with other objects on the scene.

### Considerations
F.LF is to be hackable. The architecture answer yes to the following questions:
- can I customize behavior by changing only few parameters in a single place?
- can I extend functionality by wrapping over existing code?
- can I append a new component by adding an entry to a list?
- can I replace a module by implementing one with same interface?

# roadmap

here lists the unimplemented features.

### the LF2 standard
- characters
	- mostly implemented, except
	- opoint
	- health and mana system
- weapons
	- stick,hoe and stone implemented
- specialattack
- drinks
- baseball, miscell (Criminal, etc, broken_weapon)
- effects (blood,fire,etc)
	- effect type 0,1 implemented
- background

### engine components
- AI
- networking
	- networking architecture
		- protocol
		- technology (webSocket?)
	- server implementation
- sound
- record & playback
	- data format
	- standalone player

### application
- game modes
	- VS mode
		- health panel
		- F1~F10 function keys
	- stage mode
	- (extended) story mode
- interface
	- mimic original LF2 interface
- content pack
	- a meta package
		- characters, weapons and other objects
		- backgrounds
		- sounds
		- stages
		- custom interface
	- data format
	- distribution
	- automated packaging tool
	- note: in future development, we should pack the original LF2 contents into a package and treat it as one of the many available packages
- content loader
	- currently, we use a requirejs plugin to load data files all at once during startup.
	- however, this will increase startup time and waste bandwidth
	- we would like to have a content loader which load resources on demand (lazy loading), at the start of a match.

### documentation
- the LF2 standard
- hands on F.LF
