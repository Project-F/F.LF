# character.js
### Specification and implementation status

## A) actions
### i)
1. standing
2. walking in all directions and diagonally
3. running in all directions and diagonally
4. stop running
5. running + row
6. running + dash
7. running + attack
8. jump in all directions and diagonally
9. jump + row
10. jump + dash
11. jump + attack
12. dash attack
13. dash + turning back
	- issue: has 1 frame of glitch when performing back dash

### ii) interactive actions
14. A punch B
15. trigger superpunch
16. catch & +throw
17. obstacle
	- issue: characters sometimes trapped in obstacle

## B) interactions: `itr`

### attributes
- [`kind`](#itrkind)
- [`x`, `y`, `w`, `h`, `zwidth`](#itrvolume)
- [`dvx`, `dvy`](#itreffect)
- `arest`, `vrest`
- `fall`
- `bdefend`
- `injury`
- [`effect`](#itreffect)

### itr:kind

#### itr:kind:0
normal attack
- `active`
	- trigger an event by intersecting with others
- conditional `team exclusive`
	- only attacks characters of other teams
	- `team neutral` to other object types

#### itr:kind:1
characters with this itr can catch characters that are in state:16 (Dance of Pain).
- `active`
- `team exclusive`
	- only interacts with other teams
- only interact with characters at state 16

extra tags:
```
"catchingact": [A,B]
```
catcher transits to frame A if catcher approaches the one being caught from the front, otherwiser to frame B
```
"caughtact": [A,B]
```
the one being caught transits to frame A if catcher approaches the one being caught from the front, otherwiser to frame B

for details consult [inter-living-object-interactions.html](http://f-lf2.blogspot.hk/2013/01/inter-living-object-interactions.html).

#### itr:kind:2
characters with this itr can pick up weapons
- `active`
- only interact with pickable items

#### itr:kind:3
characters with this itr can catch characters, without state:16 requirement as kind:3
- `active`
- `team exclusive`
- only interact with characters

other properties same as kind 1

#### itr:kind:4
(unimplemented) characters with this itr can hit others as if he is a heavyweapon.
normally this itr appears in falling frames of a character
- `active`
- conditional `team neutral`
	- can hit any team
	- cannot hit the character that initially threw him

#### itr:kind:5
kind 5 is for weapons

#### itr:kind:6
when a character initiates a punch, he checks if his itr volume intersects with another itr volume of kind:6, if this is true he will transit to frame 70 instead of 60 or 65.
- `passive`
	- other characters trigger an event by intersecting with this itr
- `team exclusive`

#### itr:kind:7
characters with this itr can pick up weapons without causing a frame transition
- `active`
- `key press`
	- require holding down the attack key
- only interact with pickable items

#### itr:kind:8,9,10,11
kind 8,9,10,11 are for special attacks

#### itr:kind:14
living objects with this itr acts as obstacle to characters
- `passive`
- only interact with characters

#### itr:kind:15,16
kind 15,16 are for special attacks

### itr:volume
for details consult [volume specification](http://f-lf2.blogspot.hk/2013/01/scenejs-volume.html).

### itr:effect
with this attribute, an effect will be created when itr:kind:0 occurs.
effects can be purely visual, but most effects include behaviours that affect characters being hit.
effects apply `dvx`,`dvy` as velocity to characters being hit.

## C) attachment points: `point`

### wpoint
#### attributes
- kind
- x, y
- weaponact
- attacking
- cover
- dvx, dvy, dvz

### opoint
#### attributes
- kind
- x, y
- action
- dvx, dvy
- oid
- facing

### cpoint

### bpoint
(unimplemented)
