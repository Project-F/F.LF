/*\
 * effect
 *
 * handle visual effects
 * like blood, fire, etc
\*/

define(['LF/global', 'LF/sprite', 'core/effects-pool', 'core/util'],
  function (Global, Sprite, Feffects_pool, Futil) {
    /*\
     * effect_set
     [ class ]
     * effect_set is the set for all kinds of effects
     * this is a big manager. there is only 1 instance of effect_set in a match.
     - config (object)
     - DATA (array) of data (object)
     - ID (array) of ID (number)
    \*/
    function effect_set(config, DATA, ID) // DATA and ID are arrays
    {
      DATA = Futil.make_array(DATA)
      ID = Futil.make_array(ID)
      const efs = this.efs = {}
      for (let i = 0; i < DATA.length; i++) {
        (function (i) {
          efs[ID[i]] = new Feffects_pool({
            circular: true,
            init_size: 5,
            batch_size: 5,
            max_size: 200,
            construct: function () {
              return new effect(config, DATA[i], ID[i])
            }
          })
        }(i))
      }
    }

    effect_set.prototype.destroy = function () {
      for (const i in this.efs) {
        for (let j = 0; j < this.efs[i].pool.length; j++) {
          this.efs[i].pool[j].destroy()
        }
      }
    }

    /*\
     * effect_set.create
     [ method ]
     - param (object) `{x,y,z}` position to create the effect
     - id (number) id of the desired effect
     - subnum (number) specify the variant of an effect
    \*/
    effect_set.prototype.create = function (id, A, B, C, D) {
      if (this.efs[id]) {
        this.efs[id].create(A, B, C, D)
      } else {
        console.error('no such effect id ' + id)
      }
    }

    effect_set.prototype.TU = function () {
      for (const i in this.efs) {
        this.efs[i].call_each('TU')
      }
    }

    effect_set.prototype.transit = function () {
    }

    /*\
     * effect_unit
     [ class ]
     * individual effect
     *
     * they are like other living objects but much simplier.
     * they are short-lived, `born` as triggered by `effects-pool` and `die` spontaneously
    \*/
    function effect(config, data, id) {
      this.dat = data
      this.match = config.match
      this.id = id
      this.sp = new Sprite(this.dat.bmp, config.stage)
      this.sp.hide()
      this.state
      this.frame
      this.frameD
      this.wait = -1
      this.next
      this.ps = {
        sx: 0,
        sy: 0,
        sz: 0,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0
      }
      if (data.effect_list) {
        this.effect_list = data.effect_list
      }
      if (config.broken_list) {
        this.broken_list = config.broken_list
      }
      this.width = data.bmp.file[0].w
    }

    effect.prototype.destroy = function () {
      this.sp.destroy()
    }

    effect.prototype.TU = function () {
      const $ = this
      const GC = Global.gameplay
      { // mechanics
        $.ps.x += $.ps.vx
        $.ps.y += $.ps.vy
        $.ps.z += $.ps.vz
        $.ps.sx = $.ps.x - $.frameD.centerx
        $.ps.sy = $.ps.y - $.frameD.centery
        $.ps.sz = $.ps.z
        $.sp.set_x_y($.ps.sx, $.ps.sy + $.ps.sz)
        $.sp.set_z($.ps.sz + 1)
        if ($.ps.y < 0) {
          $.ps.vy += $.mass * GC.gravity
        }
        if ($.ps.y > 0) {
          $.parent.die(this)
        }
      }
      if ($.frame_update) {
        $.frame_update = false
        $.sp.show_pic($.frameD.pic)
        $.wait = $.frameD.wait
        $.next = $.frameD.next
        if ($.with_sound) {
          if ($.frameD.sound) {
            $.match.sound.play($.frameD.sound)
          }
        }
      }
      if ($.wait === 0 || $.state === 9998) {
        if ($.next === 999) {
          $.next = 0
        } else if ($.next === 1000 || $.state === 9998) {
          $.parent.die($)
          return
        }
        $.frame = $.next
        $.frameD = $.dat.frame[$.frame]
        $.state = $.frameD.state
        $.frame_update = true
      } else {
        $.wait--
      }
    }

    effect.prototype.transit = function () {
    }

    effect.prototype.set_pos = function (x, y, z) {
    }

    effect.prototype.born = function (P, N, S, R) {
      const $ = this
      let sf = 0
      if ($.effect_list) {
        if (!N) { N = 0 }
        if ($.effect_list[N]) {
          sf = $.effect_list[N].frame
        }
        $.with_sound = S
        $.mass = 0
      } else if ($.broken_list) {
        if ($.broken_list[N]) {
          const slot = S % $.broken_list[N].length
          sf = $.broken_list[N][slot].frame
        }
        $.with_sound = true
        if (N === 302) { // flame
          $.mass = 0
        } else {
          $.mass = 1
        }
        if (!R) { R = { w: 50, h: 50 } }
        P.x += $.match.random() * R.w * 1.2 - $.width
        P.y -= $.match.random() * R.h
        $.ps.vx = ($.match.random() - 0.5) * R.w * 0.5
        $.ps.vy = $.match.random() * 2 - 4
      }
      $.frame = sf
      $.frameD = $.dat.frame[$.frame]
      $.state = $.frameD.state
      $.frame_update = true
      $.ps.x = P.x
      $.ps.y = P.y
      $.ps.z = P.z
      $.sp.show()
    }

    effect.prototype.die = function () {
      this.sp.hide()
    }

    return effect_set
  })
