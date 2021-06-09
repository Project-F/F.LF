define(['core/util', 'LF/sprite-select', 'core/support', 'LF/global'], function (Futil, Fsprite, Fsupport, global) {
  const GA = global.application

  let global_timer; const global_timer_children = []
  function standalone(child) {
    global_timer_children.push(child)
    if (!global_timer) {
      global_timer = setInterval(function () {
        for (let i = 0; i < global_timer_children.length; i++) {
          global_timer_children[i].TU()
        }
      }, 1000 / 30) // 30 fps
    }
  }

  /* config=
  {
    layers      //layers holder, append bg layers here
    scrollbar   //if true, append scrollbar here
    camerachase:{character:} //camera only chase these characters
    standalone  //no match, background viewer only
    onscroll    //
  } */
  function background(config, data, id) {
    const $ = this
    if (!config) {	// create an empty background
      $.id = -1
      $.name = 'empty background'
      $.width = 1500
      $.zboundary = [0, 300]
      $.height = $.zboundary[1] - $.zboundary[0]
      $.shadow = { x: 0, y: 0, img: '' }
      return
    }
    $.sprite_layer = config.layers
    $.layers = []
    $.timed_layers = []
    $.timer = 0
    $.data = data
    $.name = data.name.replace(/_/g, ' ')
    $.id = id

    $.zboundary = data.zboundary
    $.width = data.width
    $.height = $.zboundary[1] - $.zboundary[0]
    $.shadow = {
      x: 0,
      y: 0, // offset x,y
      img: data.shadow
    }
    if (Fsprite.renderer === 'DOM' && !Fsupport.css3dtransform) {
      $.dropframe = 1
    } else {
      $.dropframe = 0
    }

    (function () {
      const sp = new Fsprite({ img: data.shadow })
      sp.img[0].addEventListener('load', onload, true)
      function onload() {
        $.shadow.x = (this.naturalWidth || this.width) / 2
        $.shadow.y = (this.naturalHeight || this.height) / 2
        sp.img[0].removeEventListener('load', onload, true)
      }
    }())

    if (config.scrollbar) {
      const sc = document.createElement('div')
      $.scrollbar = sc
      sc.className = 'backgroundScroll'
      const child = document.createElement('div')
      child.style.width = $.width + 'px'
      child.className = 'backgroundScrollChild'
      sc.appendChild(child)
      config.scrollbar.appendChild(sc)
      sc.onscroll = function () {
        if ($.camera_locked) {
          $.camerax = sc.scrollLeft
          $.scroll(sc.scrollLeft)
          if (config.onscroll) { config.onscroll() }
        }
      }
      sc.onmousedown = function () {
        $.camera_locked = true
      }
      sc.onmouseup = function () {
        $.camera_locked = false
      }
      if (!('__proto__' in {})) {	// IE 9,10 quirk
        sc.onmousemove = function () {
          $.camera_locked = false
        }
      }
    }

    if (config.camerachase) {
      $.char = config.camerachase.character
      $.camerax = $.width / 2
      $.cami = 0
    } else {
      $.camera_locked = true
    }

    // create layers
    $.layers.push({
      sp: new Fsprite({ canvas: config.layers, type: 'group' }),
      ratio: 1
    })
    $.layers[0].sp.set_w($.width)
    $.layers[0].sp.set_z(3000)
    $.floor = $.layers[0].sp
    const LAY = Futil.group_elements(data.layer, 'width')
    for (const i in LAY) {
      const lay =
      {
        sp: new Fsprite({ canvas: config.layers, type: 'group' }),
        ratio: (parseInt(i) - GA.window.width) / ($.width - GA.window.width)
      }
      lay.sp.set_z(-1000 + parseInt(i))
      $.layers.push(lay)
      for (let j = 0; j < LAY[i].length; j++) {
        const dlay = LAY[i][j] // layer data
        var sp_config
        if (dlay.rect) {
          // if `rect` is defined, `pic` will only be a dummy
          sp_config =
          {
            canvas: lay.sp,
            wh: { w: dlay.width, h: dlay.height }
          }
        } else if (dlay.pic) {
          sp_config =
          {
            canvas: lay.sp,
            wh: 'fit',
            img: dlay.pic
          }
        }
        var sp
        if (!dlay.loop && !dlay.tile) {	// single item
          sp = new Fsprite(sp_config)
          sp.set_x_y(dlay.x, correct_y(dlay))
          sp.set_z(data.layer.indexOf(dlay))
          if (dlay.rect) { sp.set_bgcolor(color_conversion(dlay.rect)) }
        } else {	// a horizontal array
          sp = new Fsprite({ canvas: lay.sp, type: 'group' }) // holder
          sp_config.canvas = sp
          sp.set_x_y(0, 0)
          sp.set_z(data.layer.indexOf(dlay))
          var left, right, interval
          if (dlay.loop) {
            left = dlay.x
            right = dlay.width
            interval = dlay.loop
          } else if (dlay.tile) {
            left = dlay.x - dlay.width * Math.abs(dlay.tile)
            right = dlay.width + dlay.width * Math.abs(dlay.tile)
            interval = dlay.width
          }
          for (let k = -1, xx = left; xx < right; xx += interval, k++) {
            const spi = new Fsprite(sp_config)
            spi.set_x_y(xx, dlay.y)
            if (dlay.rect) { spi.set_bgcolor(color_conversion(dlay.rect)) }
            if (dlay.tile < 0) { spi.set_flipx(!(k % 2 === 0)) }
          }
        }
        if (dlay.cc) {
          $.timed_layers.push({
            sp: sp,
            cc: dlay.cc,
            c1: dlay.c1,
            c2: dlay.c2
          })
        }
      }
    }

    if (config.standalone) {
      standalone(this)
      $.carousel = {
        type: config.standalone.carousel,
        dir: 1,
        speed: 5
      }
      $.camera_locked = false
      $.standalone = config.standalone
    }

    // a very strange bug for the scene 'HK Coliseum' must be solved by hard coding
    function correct_y(dlay) {
      if (data.name === 'HK Coliseum') {
        if (dlay.pic.indexOf('back1') === -1) {
          return dlay.y - 8
        } else {
          return dlay.y
        }
      } else {
        return dlay.y
      }
    }
  }

  function color_conversion(rect) {
    if (typeof rect === 'string') {
      return rect // extended standard: CSS color format allowed
    } else if (typeof rect === 'number') {
      let lookup, computed
      switch (rect) {
        case 4706: lookup = 'rgb(16,79,16)'; break // lion forest
        case 40179: lookup = 'rgb(159,163,159)'; break // HK Coliseum
        case 29582: lookup = 'rgb(119,119,119)'; break
        case 37773: lookup = 'rgb(151,119,111)'; break
        case 33580: lookup = 'rgb(135,107,103)'; break
        case 25356: lookup = 'rgb(103,103,103)'; break
        case 21096: lookup = 'rgb(90,78,75)'; break // Stanley Prison
        case 37770: lookup = 'rgb(154,110,90)'; break // The Great Wall
        case 16835: lookup = 'rgb(66,56,24)'; break // Queen's Island
        case 34816: lookup = 'rgb(143,7,7)'; break // Forbidden Tower
      }
      const r = (rect >> 11 << 3)
      const g = (rect >> 6 & 31) << 3
      const b = ((rect & 31) << 3)
      computed = 'rgb(' +
        (r + (r > 64 || r === 0 ? 7 : 0)) + ',' +
        (g + (g > 64 || g === 0 ? 7 : 0) + ((rect >> 5 & 1) && g > 80 ? 4 : 0)) + ',' +
        (b + (b > 64 || b === 0 ? 7 : 0)) +
        ')'
      if (lookup && computed !== lookup) {
        if (0) { // debug info
          console.log('computed:' + computed, 'correct:' + lookup)
        }
      }
      if (lookup) {
        return lookup
      } else {
        return computed
      }
    }
  }

  background.prototype.destroy = function () {
    const $ = this
    if ($.name === 'empty background') { return }
    if ($.layers) {
      for (var i = 0; i < $.layers.length; i++) {
        $.layers[i].sp.remove()
      }
    }
    if ($.timed_layers) {
      for (var i = 0; i < $.timed_layers.length; i++) {
        $.timed_layers[i].sp.remove()
      }
    }
    if ($.scrollbar) {
      $.scrollbar.parentNode.removeChild($.scrollbar)
    }
    if ($.sprite_layer) {
      $.sprite_layer.remove_all()
    }
  }

  // return true if the moving object is leaving the scene
  background.prototype.leaving = function (o, xt) {
    const $ = this
    if (!xt) {
      xt = 0
    }
    const nx = o.ps.sx + o.ps.vx
    const ny = o.ps.sy + o.ps.vy
    return (nx + o.sp.width < 0 - xt || nx > $.width + xt || ny < -600 || ny > 100)
  }

  // get an absolute position using a ratio, e.g. get_pos(0.5,0.5) is exactly the mid point
  background.prototype.get_pos = function (rx, rz) {
    const $ = this
    return { x: $.width * rx, y: 0, z: $.zboundary[0] + $.height * rz }
  }

  background.prototype.scroll = function (X) {
    const $ = this
    for (var i = 0; i < $.layers.length; i++) {
      $.layers[i].sp.set_x_y(round(-(X * $.layers[i].ratio)), 0)
    }
    function round(x) {
      if (i === 0) { return x | 0 } else { return x }
    }
  }

  const screenW = GA.window.width
  const halfW = GA.window.width / 2
  background.prototype.TU = function () {
    const $ = this
    // camera movement
    if (!$.camera_locked) {
      if (!$.carousel) {	// camera chase
        if ($.cami++ % ($.dropframe + 1) !== 0) {
          return
        }
        /// algorithm by Azriel
        /// http://www.lf-empire.de/forum/archive/index.php/thread-4597.html
        let avgX = 0
        let facing = 0
        let numPlayers = 0
        for (var i in $.char) {
          avgX += $.char[i].ps.x
          facing += $.char[i].dirh()
          numPlayers++
        }
        if (numPlayers > 0) {
          avgX /= numPlayers
        }
        // var xLimit= (facing*screenW)/(numPlayers*6) - (halfW + avgX);
        //  his original equation has one error, it should be 24 regardless of number of players
        let xLimit = (facing * screenW / 24) + (avgX - halfW)
        if (xLimit < 0) xLimit = 0
        if (xLimit > $.width - screenW) xLimit = $.width - screenW
        const spdX = (xLimit - $.camerax) * GA.camera.speed_factor * ($.dropframe + 1)
        if (spdX !== 0) {
          if (spdX > -0.05 && spdX < 0.05) {
            $.camerax = xLimit
          } else {
            $.camerax = $.camerax + spdX
          }
          $.scroll($.camerax)
          if ($.scrollbar) {
            $.scrollbar.scrollLeft = Math.round($.camerax)
          }
        }
      } else if ($.carousel.type === 'linear') {
        const lastscroll = $.scrollbar.scrollLeft
        $.scrollbar.scrollLeft += $.carousel.speed * $.carousel.dir
        if (lastscroll === $.scrollbar.scrollLeft) {
          $.carousel.dir *= -1
        }
        $.scroll($.scrollbar.scrollLeft)
      }
    }
    // layers animation
    for (var i = 0; i < $.timed_layers.length; i++) {
      const lay = $.timed_layers[i]
      const frame = $.timer % lay.cc
      if (frame >= lay.c1 && frame <= lay.c2) {
        lay.sp.show()
      } else {
        lay.sp.hide()
      }
    }
    if ($.standalone) {
      $.standalone.canvas.render()
    }
    $.timer++
  }

  return background
})
