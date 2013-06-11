This is intended to be a guideline for developers who want to do development on F.LF

# Architecture

The open LF2 project is divided into three repositories, [F.core](https://github.com/tyt2y3/F.core), F.LF and [LFrelease](https://github.com/tyt2y3/LFrelease). F.LF is the game engine which implements ___the LF2 standard___ and provides gaming functionalities. F.core provides the engine components to build a HTML5 game. While F.LF _could_ be platform independent, current implementation does depend a lot on the browser environment. LFrelease contains material (sprites,data,sound,etc) converted from original LF2. Such division is to ensure that F.LF is 100% original work containing no third party copyrighted material.

Let's have a top-down walk through the modules.
- `global.js` defines the global parameters
- `keychanger.js` is a small utility to change keys of a controller
- `loader.js` is to load data files in a content package.
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

# Getting started

### join us
get a [github](https://github.com/) account, join the discussion on [github](https://github.com/tyt2y3/F.LF/issues). remember to put the appropriate label:
- `implementation` for implementation of new features (on or not on the roadmap)
- `bug` to report general bugs
- `compliance` for issues and observations releated to LF2 compliance
- `question` to seek help
- `suggestion` for suggestions, comments and general discussions.

### development environment

- programming text editor
	- I recommend [geany](http://www.geany.org/) and [geany portable for windows](http://geanyportable.org/)
- [node.js](http://nodejs.org/)
- [git](http://git-scm.com/)
- [optional] [console2](http://sourceforge.net/projects/console/)
	- only to make the git console looks better
- repositories
	 - [github help/fork-a-repo](https://help.github.com/articles/fork-a-repo)
	 - fork [F.core](https://github.com/tyt2y3/F.core), [F.LF](https://github.com/tyt2y3/F.LF) and [LFrelease](https://github.com/tyt2y3/LFrelease). The three repositories must be named and placed as below:

```
 F
 |---F.core
 |---LF
 |---LFrelease
```

### workflow

#### collaboration model
- [github help/fork & pull](https://help.github.com/articles/using-pull-requests)
- in normal circumstances, changes to `F.core` should be avoided.
- do development on dev branchs and pull `origin/master` frequently. resolve conflicts as soon as possible.
- [dchelimsky/Topic Branches](https://github.com/dchelimsky/rspec/wiki/Topic-Branches)
- only make pull request on topic branches, that is, branch with only one important change.

	> you can cherry-pick the important updates to a separate branch and make a pull request on that branch (try [this](http://stackoverflow.com/questions/5256021/send-a-pull-request-on-github-for-only-latest-commit)). or try using one branch for each topic in the first place (`docs` branch for documentation, `test` branch for test cases).
- only make pull request when reasonable progress is being made
	- program code should be functional and slightly tested
- do not include personal code playground or unrelated files in a pull request.

#### make demo
in `F/LF/tools`, run `./make_demo.sh` to create a latest demo in `LFrelease`.
in `F/LFrelease`, run `./make_release.sh` to commit and push changes.
after pushing to branch `gh-pages`, the demo should be live at ` http://your-github-username.github.io/LFrelease/demo/demo3.html`

# Roadmap

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
- content pack (done)
- content loader
	- currently, we use a requirejs plugin to load data files all at once during startup.
	- however, this will increase startup time and waste bandwidth
	- we would like to have a content loader which load resources on demand (lazy loading), at the start of a match.

### software engineering
- build system
	- possibly [grunt](http://gruntjs.com/). the current build system is based on linux shell script, which is not platform independent and not javascript oriented.
- automated test suite
	- to develope a test suite specifically for F.LF. to test against the specification of:
		- frame transition sequence
		- movement (position difference)

### documentation compilation
- the LF2 standard
- hands on F.LF

# engineering process

F.LF attempts a clean room implementation of LF2.
### Clean room implementation

A quote from [Wikipedia](http://en.wikipedia.org/wiki/Clean_room_design)
> Clean room design is the method of copying a design by reverse engineering and then recreating it without infringing any of the copyrights and trade secrets associated with the original design. Clean room design is useful as a defense against copyright and trade secret infringement because it relies on independent invention.

> Typically, a clean room design is done by having someone examine the system to be reimplemented and having this person write a specification. This specification is then reviewed by a lawyer to ensure that no copyrighted material is included. The specification is then implemented by a team with no connection to the original examiners.

Also read these [answers](http://ask.slashdot.org/story/00/06/09/0136236/what-is-a-clean-room-implementation).

Ideally the one who examine LF2 and produce the specification should be a different person from the one who implement it. But we are short of programmers that sometimes they may be the same person.

The aim of Project F is to produce a completely free code base for the community. It is critical to maintain the cleanliness of the F.LF repository. Though, the publishing of F.LF in bundle with LF2 materials could be copyright infringement.

The bottom line is, no trade secret or proprietary source code can enter the F.LF repository. the following rules are extremely important, and have to be beared in mind.

#### do not state the long form of LF2. it could be Loyal Fighter 2 or anything
#### do not look into the disassembly of LF2.

### engineering process

The top-down engineering process starts from playing LF2, observing its behaviour, and write a specification. The specification is then implemented.

The bottom-up engineering process starts implementing a system, and observe the behavioural difference from LF2, and improve the implementation. If everything is okay, then write a specification.

Both processes produce a pair of specification and implementation as the end product. A task is said to be finished only if the specification and implementation comply to each other and they both comply to LF2 behavior to a high degree.
