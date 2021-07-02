/*\
 * livingobject
 *
 * a base class for all living objects
\*/
define(['LF/global', 'LF/sprite', 'LF/mechanics', 'LF/AI', 'LF/util', 'LF/sprite-select', 'core/util'],
  function (Global, Sprite, Mech, AI, util, Fsprite, Futil) {
    const GC = Global.gameplay

    /*\
     * livingobject
     [ class ]
     | config=
     | {
     | match,
     | controller, (characters only)
     | team
     | }
    \*/
    function livingobject(config, data, thisID) {
      if (!config) { return }

      const $ = this

      // identity
      $.name = data.bmp.name
      $.uid = -1 // unique id, set by scene
      $.id = thisID // object id
      $.data = data
      $.team = config.team
      $.statemem = {} // state memory, will be cleared on every state transition

      // handles
      $.match = config.match
      $.scene = $.match.scene
      $.bg = $.match.background

      // states
      $.sp = new Sprite(data.bmp, $.match.stage)
      $.sp.width = data.bmp.file[0].w
      if (!$.proper('no_shadow')) {
        const sp_sha =
        {
          canvas: $.match.stage,
          wh: 'fit',
          img: $.bg.shadow.img
        }
        $.shadow = new Fsprite(sp_sha)
      }
      $.health =
      {
        hp: 100,
        mp: 100
      }
      $.frame =
      {
        PN: 0, // previous frame number
        N: 0, // current frame number
        D: data.frame[0], // current frame's data object
        ani: // animation sequence
        {
          i: 0, up: true
        }
      }
      $.mech = new Mech($)
      $.AI = new AI.interface($)
      $.ps = $.mech.create_metric() // position, velocity, and other physical properties
      $.trans = new frame_transistor($)
      $.itr =
      {
        arest: 0, // attack rest - time until the attacker can do a single hit again
        vrest: {} // victim rest - time until a character can be hit again
      }
      $.effect =
      {
        num: -99, // effect number
        dvx: 0,
        dvy: 0,
        stuck: false, // when an object is said to be 'stuck', there is not state and frame update
        oscillate: 0, // if oscillate is non-zero, will oscillate for amplitude equals value of oscillate
        blink: false, // blink: hide 2 TU, show 2 TU ,,, until effect vanishs
        super: false, // when an object is in state 'super', it does not return body volume, such that it cannot be hit
        timein: 0, // time to take effect
        timeout: 0, // time to lose effect
        heal: undefined
      }
      $.catching = 0 // state 9: the object being caught by me now
      // OR state 10: the object catching me now
      $.allow_switch_dir = true // direction switcher
    }
    livingobject.prototype.type = 'livingobject'
    // livingobject.prototype.states = null; //the collection of states forming a state machine
    // livingobject.prototype.states_switch_dir = null; //whether to allow switch dir in each state

    livingobject.prototype.destroy = function () {
      this.sp.destroy()
      if (this.shadow) {
        this.shadow.remove()
      }
    }

    livingobject.prototype.log = function (mes) {
      this.match.log(mes)
    }

    // setup for a match
    livingobject.prototype.setup = function () {
      const $ = this
      $.state_update('setup')
    }

    // update done at every frame
    livingobject.prototype.frame_update = function () {
      const $ = this
      // show frame
      $.sp.show_pic($.frame.D.pic)

      $.ps.fric = 1 // reset friction

      if (!$.state_update('frame_force')) {
        $.frame_force()
      }

      // wait for next frame
      $.trans.set_wait($.frame.D.wait, 99)
      $.trans.set_next($.frame.D.next, 99)

      // state generic then specific update
      $.state_update('frame')

      if ($.frame.D.sound) {
        $.match.sound.play($.frame.D.sound)
      }
    }

    livingobject.prototype.frame_force = function () {
      const $ = this
      if ($.frame.D.dvx) {
        const avx = $.ps.vx > 0 ? $.ps.vx : -$.ps.vx
        if ($.ps.y < 0 || avx < $.frame.D.dvx) { // accelerate..
          $.ps.vx = $.dirh() * $.frame.D.dvx // ..is okay
        }
        // decelerate must be gradual
        if ($.frame.D.dvx < 0) {
          $.ps.vx = $.ps.vx - $.dirh()
        }
      }
      if ($.frame.D.dvz) { $.ps.vz = $.dirv() * $.frame.D.dvz }
      if ($.frame.D.dvy) { $.ps.vy += $.frame.D.dvy }
      if ($.frame.D.dvx === 550) { $.ps.vx = 0 }
      if ($.frame.D.dvy === 550) { $.ps.vy = 0 }
      if ($.frame.D.dvz === 550) { $.ps.vz = 0 }
    }

    livingobject.prototype.whirlwind_force = function (rect) {
      const $ = this
      // lift
      $.ps.vy -= 2 / $.mech.mass
      // centripetal force
      const cx = rect.x + rect.vx + rect.w * 0.5 // center
      const cz = rect.z
      $.ps.vx -= sign($.ps.x - cx) * 2 / $.mech.mass
      $.ps.vz -= sign($.ps.z - cz) * 0.5 / $.mech.mass

      function sign(x) {
        return x > 0 ? 1 : -1
      }
    }

    livingobject.prototype.flute_force = function () {
      const $ = this
      let low_level = -140
      let mid_level = -160
      let high_level = -180
      $.effect.super = true
      $.ps.vx = 0
      $.ps.vz = 0
      if ($.ps.y > low_level) {
        $.ps.vy = ($.ps.vy <= 0) ? (-7.5) : (-$.ps.vy / 2)
      } else if ($.ps.y <= low_level && $.ps.y > mid_level) {
        $.ps.vy -= ($.ps.vy <= 0) ? ($.mech.mass / 2) : ($.mech.mass / 2)
      } else if ($.ps.y <= mid_level && $.ps.y > high_level) {
        $.ps.vy += ($.ps.vy <= 0) ? ($.mech.mass / 2) : ($.mech.mass / 2)
      }
      // Floating effect
      switch ($.type) {
        case 'lightweapon':
          if ($.frame.N >= 55) {
            $.trans.frame(40, 20)
          }
          break
        case 'heavyweapon':
          if ($.frame.N >= 5) {
            $.trans.frame(1, 20)
          }
          break
        case 'character':
          ($.ps.vy > 0)?$.trans.frame(181, 20):$.trans.frame(182, 20)
          break
      }
    }

    // update done at every TU (30fps)
    livingobject.prototype.TU_update = function () {
      const $ = this

      if (!$.state_update('TU_force')) {
        $.frame_force()
      }

      // effect
      if ($.effect.timein < 0) {
        if ($.effect.oscillate) {
          if ($.effect.oi === 1) {
            $.effect.oi = -1
          } else {
            $.effect.oi = 1
          }
          $.sp.set_x_y($.ps.sx + $.effect.oscillate * $.effect.oi, $.ps.sy + $.ps.sz)
        } else if ($.effect.blink) {
          if ($.effect.bi === undefined) {
            $.effect.bi = 0
          }
          switch ($.effect.bi % 4) {
            case 0: case 1:
              $.sp.hide()
              break
            case 2: case 3:
              $.sp.show()
              break
          }
          $.effect.bi++
        }
        if ($.effect.timeout === 0) {
          $.effect.num = -99
          if ($.effect.stuck) {
            $.effect.stuck = false
          }
          if ($.effect.oscillate) {
            $.effect.oscillate = 0
            $.sp.set_x_y($.ps.sx, $.ps.sy + $.ps.sz)
          }
          if ($.effect.blink) {
            $.effect.blink = false
            $.effect.bi = undefined
            $.sp.show()
          }
          if ($.effect.super) {
            $.effect.super = false
          }
        } else if ($.effect.timeout === -1) {
          if ($.effect.dvx) { $.ps.vx = $.effect.dvx }
          if ($.effect.dvy) { $.ps.vy = $.effect.dvy }
          $.effect.dvx = 0
          $.effect.dvy = 0
        }
        $.effect.timeout--
      }

      if ($.effect.timein < 0 && $.effect.stuck) {
        ; // stuck
      } else {
        $.state_update('TU')
      }

      if ($.health.hp <= 0) {
        if (!$.dead) {
          $.state_update('die')
          $.dead = true
        }
      }

      if ($.bg.leaving($)) {
        $.state_update('leaving')
      }

      for (const I in $.itr.vrest) {  // watch out that itr.vrest might grow very big
        if ($.itr.vrest[I] > 0) {
          $.itr.vrest[I]--
        }
      }
      if ($.itr.arest > 0) {
        $.itr.arest--
      }
    }

    livingobject.prototype.state_update = function (event) {
      const $ = this
      const tar1 = $.states.generic
      if (tar1) { var res1 = tar1.apply($, arguments) }
      //
      const tar2 = $.states[$.frame.D.state]
      if (tar2) { var res2 = tar2.apply($, arguments) }
      //
      return res1 || res2
    }

    livingobject.prototype.TU = function () {
      const $ = this
      // state
      $.TU_update()
    }

    livingobject.prototype.transit = function () {
      const $ = this
      // fetch inputs
      if ($.con) {
        // $.con.fetch(); //match is responsible for fetching
        $.combo_update()
      }
      // frame transition
      if ($.effect.timein < 0 && $.effect.stuck) {
        ; // stuck!
      } else {
        $.trans.trans()
      }
      $.effect.timein--
      if ($.effect.timein < 0 && $.effect.stuck) {
        ; // stuck!
      } else {
        $.state_update('transit')
      }
    }

    livingobject.prototype.set_pos = function (x, y, z) {
      this.mech.set_pos(x, y, z)
    }

    // return the body volume for collision detection
    //  all other volumes e.g. itr should start with prefix vol_
    livingobject.prototype.vol_body = function () {
      return this.mech.body()
    }

    livingobject.prototype.vol_itr = function (kind) {
      const $ = this
      if ($.frame.D.itr) {
        return $.mech.body(
          $.frame.D.itr, // make volume from itr
          function (obj) // filter
          {
            return obj.kind == kind // use type conversion comparison
          }
        )
      } else {
        return $.mech.body_empty()
      }
    }

    livingobject.prototype.state = function () {
      return this.frame.D.state
    }

    livingobject.prototype.effect_id = function (num) {
      return num + GC.effect.num_to_id
    }

    livingobject.prototype.effect_create = function (num, duration, dvx, dvy) {
      const $ = this
      if (num >= $.effect.num) {
        const efid = num + GC.effect.num_to_id
        if ($.proper(efid, 'oscillate')) { $.effect.oscillate = $.proper(efid, 'oscillate') }
        $.effect.stuck = true
        if (dvx !== undefined) {
          $.effect.dvx = dvx
        }
        if (dvy !== undefined) {
          $.effect.dvy = dvy
        }
        if ($.effect.num >= 0) {  // only allow extension of effect
          if ($.effect.timein > 0) {
            $.effect.timein = 0
          }
          if (duration > $.effect.timeout) {
            $.effect.timeout = duration
          }
        } else {
          $.effect.timein = 0
          $.effect.timeout = duration
        }
        $.effect.num = num
      }
    }

    livingobject.prototype.effect_stuck = function (timein, timeout) {
      const $ = this
      if (!$.effect.stuck || $.effect.num <= -1) {
        $.effect.num = -1 // magic number
        $.effect.stuck = true
        $.effect.timein = timein
        $.effect.timeout = timeout
      }
    }

    livingobject.prototype.visualeffect_create = function (num, rect, righttip, variant, with_sound) {
      const $ = this
      const efid = num + GC.effect.num_to_id
      const pos =
      {
        x: rect.x + rect.vx + (righttip ? rect.w : 0),
        y: rect.y + rect.vy + rect.h / 2,
        z: rect.z > $.ps.z ? rect.z : $.ps.z
      }
      $.match.visualeffect.create(efid, pos, variant, with_sound)
    }

    livingobject.prototype.brokeneffect_create = function (id, num) {
      const $ = this
      const static_body = $.vol_body()[0]
      if (!num) { num = 8 }
      for (let i = 0; i < num; i++) {
        $.match.brokeneffect.create(320, { x: $.ps.x, y: $.ps.y, z: $.ps.z }, id, i, static_body)
      }
    }

    // animate back and forth between frame a and b
    livingobject.prototype.frame_ani_oscillate = function (a, b) {
      const $ = this
      const $f = $.frame
      if ($f.ani.i < a || $f.ani.i > b) {
        $f.ani.up = true
        $f.ani.i = a + 1
      }
      if ($f.ani.i < b && $f.ani.up) {
        $.trans.set_next($f.ani.i++)
      } else if ($f.ani.i > a && !$f.ani.up) {
        $.trans.set_next($f.ani.i--)
      }
      if ($f.ani.i == b) { $f.ani.up = false }
      if ($f.ani.i == a) { $f.ani.up = true }
    }

    livingobject.prototype.frame_ani_sequence = function (a, b) {
      const $ = this
      const $f = $.frame
      if ($f.ani.i < a || $f.ani.i > b) {
        $f.ani.i = a + 1
      }
      trans.set_next($f.ani.i++)
      if ($f.ani.i > b) {
        $f.ani.i = a
      }
    }

    livingobject.prototype.itr_arest_test = function () {
      const $ = this
      return !$.itr.arest
    }
    livingobject.prototype.itr_arest_update = function (ITR) {
      const $ = this
      if (ITR && ITR.arest) {
        $.itr.arest = ITR.arest
      } else if (!ITR || !ITR.vrest) {
        $.itr.arest = GC.default.character.arest
      }
    }
    livingobject.prototype.itr_vrest_test = function (uid) {
      const $ = this
      return !$.itr.vrest[uid]
    }
    livingobject.prototype.itr_vrest_update = function (attacker_uid, ITR) {
      const $ = this
      if (ITR && ITR.vrest) {
        $.itr.vrest[attacker_uid] = ITR.vrest
      }
    }

    livingobject.prototype.switch_dir = function (e) {
      const $ = this
      if ($.ps.dir === 'left' && e === 'right') {
        $.ps.dir = 'right'
        $.sp.switch_lr('right')
      } else if ($.ps.dir === 'right' && e === 'left') {
        $.ps.dir = 'left'
        $.sp.switch_lr('left')
      }
    }

    livingobject.prototype.dirh = function () {
      const $ = this
      return ($.ps.dir === 'left' ? -1 : 1)
    }

    livingobject.prototype.dirv = function () {
      const $ = this
      let d = 0
      if ($.con) {
        if ($.con.state.up) d -= 1
        if ($.con.state.down) d += 1
      }
      return d
    }

    livingobject.prototype.proper = function (id, prop) {
      const $ = this
      if (arguments.length === 1) {
        prop = id
        id = $.id
      }
      if ($.match.spec[id]) {
        return $.match.spec[id][prop]
      }
      return undefined
    }

    function frame_transistor($) {
      let wait = 1 // when wait decreases to zero, a frame transition happens
      let next = 999 // next frame
      let lock = 0
      let lockout = 1 // when lockout equals 0, the lock will be reset automatically
      // frame transitions are caused differently: going to the next frame, a combo is pressed, being hit, or being burnt
      //  and they can all happen *at the same TU*, to determine which frame to go to,
      //  each cause is given an authority which is used to resolve frame transition conflicts.
      //  lock=0 means unlocked
      //  common authority values:
      //  0: natural
      // 10: move,defend,jump,punch,catching,caught
      // 11: special moves
      // 15: environmental interactions
      // 2x: interactions
      //    20: being punch
      //    21: fall
      // 3x: strong interactions
      //    30: in effect type 0
      //    35: blast
      //    36: fire
      //    38: ice
      let switch_dir_after_trans // a negative next value causes a switch dir after frame transition

      this.frame = function (F, au) {
        // console.log('frame', F, au, arguments.callee.caller.toString()) //trace caller
        this.set_next(F, au)
        this.set_wait(0, au)
      }

      this.set_wait = function (value, au, out) {
        if (!au) { au = 0 } // authority
        if (au === 99) { au = lock } // au=99 means always has just enough authority
        if (!out) { out = 1 } // lock timeout
        if (au >= lock) {
          lock = au
          lockout = out
          if (out === 99) { // out=99 means lock until frame transition
            lockout = wait
          }
          wait = value
          if (wait < 0) { wait = 0 }
        }
      }

      this.inc_wait = function (inc, au, out) // increase wait by inc amount
      {
        if (!au) { au = 0 }
        if (au === 99) { au = lock }
        if (!out) { out = 1 }
        if (au >= lock) {
          lock = au
          lockout = out
          if (out === 99) {
            lockout = wait
          }
          wait += inc
          if (wait < 0) { wait = 0 }
        }
      }

      this.next = function () {
        return next
      }
      this.wait = function () {
        return wait
      }

      this.set_next = function (value, au, out) {
        if (!au) { au = 0 }
        if (au === 99) { au = lock }
        if (!out) { out = 1 }
        if (au >= lock) {
          lock = au
          lockout = out
          if (out === 99) {
            lockout = wait
          }
          if (value < 0) {
            value = -value
            switch_dir_after_trans = true
          }
          next = value
        }
      }

      this.reset_lock = function (au) {
        if (!au) { au = 0 }
        if (au === 99) { au = lock }
        if (au >= lock) {
          lock = 0
        }
      }

      this.next_frame_D = function () {
        let anext = next
        if (anext === 999) {
          anext = 0
        }
        if (anext === 1280) {
          anext = 0
        }
        return $.data.frame[anext]
      }

      this.trans = function () {
        const oldlock = lock
        lockout--
        if (lockout === 0) {
          lock = 0 // reset transition lock
        }

        if (wait === 0) {
          if (next === 0) {
            // do nothing
          } else {
            if (next === 1000) {
              $.state_update('destroy')
              $.match.destroy_object($)
              return
            }
            if ($.health.hp <= 0 && $.frame.D.state === 14) {
              return
            }

            if (next === 999) {
              next = 0
            }
            if (next === 1280) {
              next = 0
            }
            $.frame.PN = $.frame.N
            $.frame.N = next
            $.state_update('frame_exit')

            // state transition
            const is_trans = $.frame.D.state !== $.data.frame[next].state
            if (is_trans) {
              $.state_update('state_exit')
            }

            $.frame.D = $.data.frame[next]

            if (is_trans) {
              for (const I in $.statemem) {
                $.statemem[I] = undefined
              }
              const old_switch_dir = $.allow_switch_dir
              if ($.states_switch_dir && $.states_switch_dir[$.frame.D.state] !== undefined) {
                $.allow_switch_dir = $.states_switch_dir[$.frame.D.state]
              } else {
                $.allow_switch_dir = false
              }

              $.state_update('state_entry')

              if (!switch_dir_after_trans) {
                if ($.allow_switch_dir && !old_switch_dir) {
                  if ($.con) {
                    if ($.con.state.left) { $.switch_dir('left') }
                    if ($.con.state.right) { $.switch_dir('right') }
                  }
                }
              }
            }

            if (switch_dir_after_trans) {
              switch_dir_after_trans = false
              $.switch_dir($.ps.dir === 'right' ? 'left' : 'right')
            }

            $.frame_update()

            if (oldlock === 10 || oldlock === 11) { // combo triggered action
              if (wait > 0) {
                wait -= 1
              }
            }
          }
        } else {
          wait--
        }
      }
    } // frame_transistor

    return livingobject
  })
