# F.LF - the open source LF2
[http://f-lf2.blogspot.com](http://f-lf2.blogspot.com)
F.LF attempts a clean room implementation of the famous fighter game [LF2](http://lf2.net). The F stands for [Project F](http://project--f.blogspot.hk).

## Philosophy
F.LF attempts to re- create LF2 in a web browser, and be an open source clean room implementation. F.LF respects original LF2 in every detail, that data file compatibilty and program behavior will be regarded carefully.
F.LF will leverage web technologies as much as it can to make games "native to browsers".
I believe the web, open source and fine software will enable anyone, from novices to experts, to create great interactive contents and bring them to any other one.

## Architecture
The open LF2 project is divided into three repositories, [F.core](https://github.com/tyt2y3/F.core), F.LF and [LFrelease](https://github.com/tyt2y3/LFrelease). F.LF is the game engine which implements ___the LF2 standard___ and provides gaming functionalities. F.core provides the engine components to build a HTML5 game. While F.LF _could_ be platform independent, current implementation does depend a lot on the browser environment. LFrelease contains material (sprites,data,sound,etc) converted from original LF2. Such division is to ensure that F.LF is 100% original work containing no third party copyrighted material.

## Compatibility
F.LF thrives for 99% compatibility with LF2. the currently reference is LF2 1.451.
- data
	- F.LF provide a [tool](http://tyt2y3.github.com/LFrelease/tools/data_file_converter.html) to convert xml-like LF2 data files into JSON.
- sprite
	- LF2 sprite images are in 24bit bmp and must be converted to 32bit png with transparency. in addition, F.LF requires XXX.png to be mirrored into XXX_mirror.png.
- sound
	- LF2 sounds are in wav and must be converted to ogg and mp3 for use with HTML5 audio.
- in general, materials should be compressed and converted to a format suitable for distribution and consumption on the web.
- there is however plan to develop an automated build tool to convert entire package of all materials.

## Development
F.LF is still in mid-stage development. Check out the latest demo at the [release channel](https://github.com/tyt2y3/LFrelease) or latest milestone at [f-lf2.blogspot.hk](http://f-lf2.blogspot.hk/search/label/latest-demo). For details read the [roadmap](https://github.com/tyt2y3/F.LF/blob/master/docs/developer.md#roadmap).

### Call for contributors
F.LF has been a personal project for one year. Much of the foundational work has been done. May I now call for programmers and testers or any one who love and know LF2 to involve in this project to accelerate development and bring F.LF to production quality.

### Test
[nightly build](http://tyt2y3.github.com/LFrelease/demo/demo3.html)

### Install
The three repositories must be named and placed as below:
```
 F
 |---F.core
 |---LF
 |---LFrelease
```

## License
Generally have complete freedom except for profit- making. For exact terms see [license](http://project--f.blogspot.hk/2012/05/license.html).
