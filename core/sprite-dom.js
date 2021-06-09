/*\
 * sprite-dom
 * - DOM implementation: display sprites on page using `<div>` and `<img>` tag
 * - support CSS style left/top and 2d and 3d transform, depending on browser support
\*/
define(['core/css!core/style.css', 'core/support', 'core/resourcemap', 'module'],
  function (css_loaded, support, resourcemap, module) {
    sprite._masterconfig = module.config() || {}
    sprite._count = 0
    sprite._loading = 0
    sprite.renderer = 'DOM'
    sprite.masterconfig =
      function (c) {
        if (c) {
          sprite._masterconfig = c
          sprite.masterconfig_update()
        } else { return sprite._masterconfig }
      }
    sprite.masterconfig_set =
      function (key, value) {
        if (key && value) {
          sprite._masterconfig[key] = value
          sprite.masterconfig_update()
        }
      }
    sprite.masterconfig_update = function () {
      if (sprite._masterconfig.resourcemap) {
        if (!(sprite._masterconfig.resourcemap instanceof resourcemap)) { sprite._masterconfig.resourcemap = new resourcemap(sprite._masterconfig.resourcemap) }
      }
    }
    sprite.resolve_resource = function (res, level) {
      if (sprite._masterconfig.resourcemap) {
        if (!level) { return sprite._masterconfig.resourcemap.get(res) } else { return sprite._masterconfig.resourcemap.fallback(res, level) }
      }
      if (sprite._masterconfig.baseUrl) { return sprite._masterconfig.baseUrl + res }
      return res
    }
    sprite.preload_image = function (imgname) {
      const img = new Image()
      img.src = sprite.resolve_resource(imgname)
    }

    function sprite(config) {
      sprite._count++

      /*
       * sprite.el
       * sprite.type
       */
      let classname = 'F_sprite'
      if (config.type === 'group') {
        classname = 'F_sprite_group'
        this.type = 'group'
      } else if (config.div) { classname = 'F_sprite_inline' }
      if (config.div) {
        this.el = config.div
        this.el.classList.add(classname)
        if (window.getComputedStyle(this.el).getPropertyValue('position') === 'static') { this.el.style.position = 'relative' }
      } else {
        this.el = document.createElement('div')
        this.el.className = classname
        if (config.canvas) {
          if (config.canvas instanceof sprite && config.canvas.type === 'group') { config.canvas.attach(this) } else { config.canvas.appendChild(this.el) }
        }
      }

      this.img = {}
      this.cur_img = null

      if (config.wh === 'fit') { this.fit_to_img = true } else if (typeof config.wh === 'object') { this.set_wh(config.wh) }
      if (config.xy) { this.set_xy(config.xy) }
      if (config.xywh) {
        let xywh = config.xywh
        if (config.xywh instanceof Array) {
          const A = config.xywh
          xywh = { x: A[0], y: A[1], w: A[2], h: A[3] }
        }
        this.set_xy(xywh)
        this.set_wh(xywh)
      }
      if (config.img) { // add the images in config list
        if (typeof config.img === 'object') {
          for (const I in config.img) { this.add_img(config.img[I], I) }
        } else { this.add_img(config.img, '0') }
      }
      if (config.div && config.type !== 'group') {  // adopt images in `div`
        const img = config.div.getElementsByTagName('img')
        for (let i = 0; i < img.length; i++) {
          const Name = img[i].getAttribute('name')
          if (Name) { this.adopt_img(img[i]) }
        }
      }
      if (config.bgcolor) { this.set_bgcolor(config.bgcolor) }

      if ((support.css3dtransform && !sprite._masterconfig.disable_css3dtransform) ||
        (support.css2dtransform && !sprite._masterconfig.disable_css2dtransform)) {
        if (!config.div) {
          this.el.style.left = 0 + 'px'
          this.el.style.top = 0 + 'px'
        }
        this.x = 0; this.y = 0
      }
    }

    sprite.prototype.set_wh = function (P) {
      if (defined(P.w) && defined(P.h)) { this.set_w_h(P.w, P.h) } else { console.log('sprite:wrong set_wh parameters') }
      function defined(x) { return x !== null && x !== undefined }
    }
    sprite.prototype.set_w_h = function (w, h) {
      this.el.style.width = w + 'px'
      this.el.style.height = h + 'px'
    }
    sprite.prototype.set_w = function (w) {
      this.el.style.width = w + 'px'
    }
    sprite.prototype.set_h = function (h) {
      this.el.style.height = h + 'px'
    }

    if (support.css3dtransform && !sprite._masterconfig.disable_css3dtransform) {
      sprite.prototype.set_xy = function (P) {
        this.x = P.x; this.y = P.y
        this.el.style[support.css3dtransform] = 'translate3d(' + P.x + 'px,' + P.y + 'px, 0px) ' + (this.x_flipped ? 'scaleX(-1) ' : '') + (this.y_flipped ? 'scaleY(-1) ' : '')
      }
      sprite.prototype.set_x_y = function (x, y) {
        this.x = x; this.y = y
        this.el.style[support.css3dtransform] = 'translate3d(' + x + 'px,' + y + 'px, 0px) ' + (this.x_flipped ? 'scaleX(-1) ' : '') + (this.y_flipped ? 'scaleY(-1) ' : '')
      }
      sprite.prototype.set_flipx = function (m) {
        this.x_flipped = m
        this.set_x_y(this.x, this.y)
      }
      sprite.prototype.set_flipy = function (m) {
        this.y_flipped = m
        this.set_x_y(this.x, this.y)
      }
    } else if (support.css2dtransform && !sprite._masterconfig.disable_css2dtransform) {
      sprite.prototype.set_xy = function (P) {
        this.x = P.x; this.y = P.y
        this.el.style[support.css2dtransform] = 'translate(' + P.x + 'px,' + P.y + 'px) ' + (this.x_flipped ? 'scaleX(-1) ' : '') + (this.y_flipped ? 'scaleY(-1) ' : '')
      }
      sprite.prototype.set_x_y = function (x, y) {
        this.x = x; this.y = y
        this.el.style[support.css2dtransform] = 'translate(' + x + 'px,' + y + 'px) ' + (this.x_flipped ? 'scaleX(-1) ' : '') + (this.y_flipped ? 'scaleY(-1) ' : '')
      }
      sprite.prototype.set_flipx = function (m) {
        this.x_flipped = m
        this.set_x_y(this.x, this.y)
      }
      sprite.prototype.set_flipy = function (m) {
        this.y_flipped = m
        this.set_x_y(this.x, this.y)
      }
    } else {
      sprite.prototype.set_xy = function (P) {
        this.x = P.x; this.y = P.y
        this.el.style.left = P.x + 'px'
        this.el.style.top = P.y + 'px'
      }
      sprite.prototype.set_x_y = function (x, y) {
        this.x = x; this.y = y
        this.el.style.left = x + 'px'
        this.el.style.top = y + 'px'
      }
      sprite.prototype.set_flipx = function (m) {
        // not supported
      }
      sprite.prototype.set_flipy = function (m) {
        // not supported
      }
    }
    sprite.prototype.set_z = function (z) {
      z = Math.round(z)
      this.el.style.zIndex = z
      this.z = z
    }
    sprite.prototype.set_bgcolor = function (color) {
      this.el.style.background = color
    }
    sprite.prototype.set_alpha = function (a) {
      this.el.style.opacity = a
    }
    /* private
     * sprite.add_img
     [ method ]
     * add new image
     - imgpath (string)
     - name (string)
     = (object) newly created `img` element
     * note that adding images can and should better be done in constructor `config`
     */
    sprite.prototype.add_img = function (imgpath, name) {
      const This = this
      const img = new Image()
      let retry = 0
      sprite._loading++
      img.className = 'F_sprite_img' //* *DOM
      img.onload = function () {
        if (!this.naturalWidth) this.naturalWidth = this.width
        if (!this.naturalHeight) this.naturalHeight = this.height
        if (This.fit_to_img) { This.set_w_h(this.naturalWidth, this.naturalHeight) }
        img.onload = null
        img.onerror = null
        delete This.fit_to_img
        sprite._loading--
        if (sprite._loading === 0) {
          if (sprite._masterconfig.onready) { sprite._masterconfig.onready() }
        }
      }
      if (sprite._masterconfig.resourcemap) {
        img.onerror = function () {
          retry++
          const src = sprite.resolve_resource(imgpath, retry) // fallback
          if (!src) { img.onerror = null } else { img.src = src }
        }
      }
      img.src = sprite.resolve_resource(imgpath)
      this.el.appendChild(img) //* *DOM

      this.img[name] = img
      this.switch_img(name)
      return img
    }
    sprite.prototype.remove_img = function (name) {
      if (this.img[name]) {
        this.img[name].parentNode.removeChild(this.img[name])
        this.img[name] = undefined
      }
      if (this.cur_img === name) { this.cur_img = null }
    }
    /* private
     * sprite.adopt_img
     * adopt an `img` element that already exists
     [ method ]
     - im (object) `img` element
     */
    sprite.prototype.adopt_img = function (im) {
      const Name = im.getAttribute('name')
      im.classList.add('F_sprite_img')
      if (!im.naturalWidth) im.naturalWidth = im.width
      if (!im.naturalHeight) im.naturalHeight = im.height
      if (!im.naturalWidth && !im.naturalHeight) { im.addEventListener('load', onload, true) }
      function onload() {
        if (!this.naturalWidth) this.naturalWidth = this.width
        if (!this.naturalHeight) this.naturalHeight = this.height
        im.removeEventListener('load', onload, true)
      }
      this.img[Name] = im
      this.switch_img(Name)
    }
    sprite.prototype.switch_img = function (name) {
      let left, top // store the left, top of the current displayed image
      for (var I in this.img) {
        if (this.img[I].style.display == '') {
          left = this.img[I].style.left
          top = this.img[I].style.top
          break
        }
      }
      for (var I in this.img) {
        if (I == name) {
          this.img[I].style.left = left
          this.img[I].style.top = top
          this.img[I].style.display = ''
        } else {
          this.img[I].style.display = 'none'
        }
      }
      this.cur_img = name
    }
    if (support.css3dtransform && !sprite._masterconfig.disable_css3dtransform) {
      sprite.prototype.set_img_xy = function (P) {
        this.x = P.x; this.y = P.y
        this.img[this.cur_img].style[support.css3dtransform] = 'translate3d(' + P.x + 'px,' + P.y + 'px, 0px) '
      }
      sprite.prototype.set_img_x_y = function (x, y) {
        this.x = x; this.y = y
        this.img[this.cur_img].style[support.css3dtransform] = 'translate3d(' + x + 'px,' + y + 'px, 0px) '
      }
    } else if (support.css2dtransform && !sprite._masterconfig.disable_css2dtransform) {
      sprite.prototype.set_img_xy = function (P) {
        this.x = P.x; this.y = P.y
        this.img[this.cur_img].style[support.css2dtransform] = 'translate(' + P.x + 'px,' + P.y + 'px) '
      }
      sprite.prototype.set_img_x_y = function (x, y) {
        this.x = x; this.y = y
        this.img[this.cur_img].style[support.css2dtransform] = 'translate(' + x + 'px,' + y + 'px) '
      }
    } else {
      sprite.prototype.set_img_xy = function (P) {
        this.img[this.cur_img].style.left = P.x + 'px'
        this.img[this.cur_img].style.top = P.y + 'px'
      }
      sprite.prototype.set_img_x_y = function (x, y) {
        this.img[this.cur_img].style.left = x + 'px'
        this.img[this.cur_img].style.top = y + 'px'
      }
    }

    sprite.prototype.render = function () {
      // do nothing
    }
    sprite.prototype.hide = function () {
      this.el.style.display = 'none'
    }
    sprite.prototype.show = function () {
      this.el.style.display = ''
    }
    sprite.prototype.remove = function (sp) {
      if (this.type === 'group' && sp) {
        this.el.removeChild(sp.el)
      } else {
        if (!this.removed && this.el.parentNode) {
          this.removed = this.el.parentNode
          this.el.parentNode.removeChild(this.el)
        }
      }
    }
    sprite.prototype.attach = function (sp) {
      if (this.type === 'group' && sp) {
        this.el.appendChild(sp.el)
      } else {
        if (this.removed) {
          this.removed.appendChild(this.el)
          this.removed = null
        }
      }
    }
    sprite.prototype.remove_all = function () {
      if (this.type === 'group') {
        const e = this.el
        while (e.lastChild) { e.removeChild(e.lastChild) }
      }
    }

    return sprite
  })
