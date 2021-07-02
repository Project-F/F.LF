/*\
 * weapon
 *
 * generalization over light and heavy weapons
\*/

define(['LF/livingobject', 'LF/global', 'core/util'],
  function (livingobject, Global, Futil) {
    const GC = Global.gameplay

    /*\
     * weapon
     [ class ]
     * note that this is a template class
     | var lightweapon = weapon('lightweapon');
     | var heavyweapon = weapon('heavyweapon');
    \*/
    function weapon(type) {
      const states =
      {
        generic: function (event, K) {
          const $ = this
          switch (event) {
            case 'TU':

              $.interaction()

              switch ($.state()) {
                case 1001:
                case 2001:
                  // I am passive! so I dont need to care states of myself
                  break

                default:
                  // dynamics: position, friction, gravity
                  $.mech.dynamics()
                  break
              }

              var ps = $.ps
              if (ps.y === 0 && ps.vy > 0) // fell onto ground
              {
                if (this.mech.speed() > GC.weapon.bounceup.limit) { // bounceup
                  if ($.light) {
                    ps.vy = 0
                    $.trans.frame(70)
                  }
                  if ($.heavy) {
                    ps.vy = GC.weapon.bounceup.speed.y
                  }
                  if (ps.vx) { ps.vx = (ps.vx > 0 ? 1 : -1) * GC.weapon.bounceup.speed.x }
                  if (ps.vz) { ps.vz = (ps.vz > 0 ? 1 : -1) * GC.weapon.bounceup.speed.z }
                  $.health.hp -= $.data.bmp.weapon_drop_hurt
                } else {
                  $.team = 0
                  ps.vy = 0 // set to zero
                  if ($.light) {
                    $.trans.frame(70) // just_on_ground
                  }
                  if ($.heavy) {
                    $.trans.frame(21) // just_on_ground
                  }
                }
                ps.zz = 0
              }
              break
            case 'die':
              $.trans.frame(1000)
              if ($.data.bmp.weapon_broken_sound) {
                $.match.sound.play($.data.bmp.weapon_broken_sound)
              }
              $.brokeneffect_create($.id)
              break
          }
        },

        1003: function (event, K) // light
        {
          const $ = this
          switch (event) {
            case 'frame':
              if ($.frame.N === 70) // just_on_ground
              {
                if (!$.frame.D.sound) {
                  if ($.data.bmp.weapon_drop_sound) {
                    $.match.sound.play($.data.bmp.weapon_drop_sound)
                  }
                }
              }
              break
          }
        },

        1004: function (event, K) // light
        {
          const $ = this
          switch (event) {
            case 'frame':
              if ($.frame.N === 64) { // on ground
                $.team = 0 // loses team
              }
              break
          }
        },

        2000: function (event, K) // heavy
        {
          const $ = this
          switch (event) {
            case 'frame':
              if ($.frame.N === 21) // just_on_ground
              {
                $.trans.set_next(20)
                if (!$.frame.D.sound) {
                  if ($.data.bmp.weapon_drop_sound) {
                    $.match.sound.play($.data.bmp.weapon_drop_sound)
                  }
                }
              }
              break
          }
        },

        2004: function (event, K) // heavy
        {
          const $ = this
          switch (event) {
            case 'frame':
              if ($.frame.N === 20) { // on_ground
                $.team = 0
              }
              break
          }
        }
      }

      // inherit livingobject
      function typeweapon(config, data, thisID) {
        const $ = this
        // chain constructor
        livingobject.call(this, config, data, thisID)
        for (let i = 0; i < $.sp.ani.length; i++) { // fix border issue
          $.sp.ani[i].config.borderleft = 1
          $.sp.ani[i].config.bordertop = 0
          $.sp.ani[i].config.borderright = 2
          $.sp.ani[i].config.borderbottom = 2
        }
        $.hold =
        {
          obj: null, // character who hold me
          pre: null // previous holder
        }
        $.health.hp = $.data.bmp.weapon_hp
        $.setup()
      }
      typeweapon.prototype = new livingobject()
      typeweapon.prototype.constructor = typeweapon
      typeweapon.prototype.light = type === 'lightweapon'
      typeweapon.prototype.heavy = type === 'heavyweapon'
      typeweapon.prototype.type = type
      typeweapon.prototype.states = states

      typeweapon.prototype.init = function (T) {
        const $ = this
        if (T.opoint.kind === 2) {
          T.parent.hold_weapon($)
          $.pick(T.parent)
        }
      }
      typeweapon.prototype.interaction = function () {
        const $ = this
        const ITR = Futil.make_array($.frame.D.itr)

        if ($.team !== 0) {
          if (($.heavy) || ($.light && $.state() === 1002)) {
            for (const j in ITR) {  // for each itr tag
              if (ITR[j].kind === 0) // kind 0
              {
                const vol = $.mech.volume(ITR[j])
                vol.zwidth = 0
                const hit = $.scene.query(vol, $, { tag: 'body', not_team: $.team })
                for (const k in hit) {  // for each being hit
                  var itr_rest
                  if (ITR[j].arest !== undefined || ITR[j].vrest !== undefined) {
                    itr_rest = ITR[j]
                  } else {
                    itr_rest = GC.default.weapon
                  }
                  // if (itr_rest.arest) itr_rest.arest+=20; //what is this line for?
                  if (!$.itr.arest) {
                    if ($.attacked(hit[k].hit(ITR[j], $, { x: $.ps.x, y: $.ps.y, z: $.ps.z }, vol))) {  // hit you!
                      const ps = $.ps
                      const vx = (ps.vx === 0 ? 0 : (ps.vx > 0 ? 1 : -1))
                      if ($.light) {
                        ps.vx = vx * GC.weapon.hit.vx
                        ps.vy = GC.weapon.hit.vy
                      }
                      $.itr_arest_update(ITR)
                      // create an effect
                      var timeout
                      if ($.light) { timeout = 2 }
                      if ($.heavy) { timeout = 4 }
                      $.effect.dvx = 0
                      $.effect.dvy = 0
                      $.effect_stuck(0, timeout)
                    }
                  }
                }
              }
              // kind 5 is handled in `act()`
            }
          }
        }
      }

      /*\
       * caller hits callee
       - ITR the itr object in data
       - att reference of attacker
       - attps position of attacker
       - rect the hit rectangle where visual effects should appear
      \*/
      typeweapon.prototype.hit = function (ITR, att, attps, rect) {
        const $ = this
        if ($.hold.obj) {
          return false
        }
        if ($.itr.vrest[att.uid]) {
          return false
        }

        if (ITR.kind === 15) {
          $.whirlwind_force(rect)
          return true
        }

        if (ITR.kind === 10 || ITR.kind === 11) {
          $.flute_force()
          return true
        }

        let accept = false
        if ($.light) {
          if ($.state() === 1002) // throwing
          {
            accept = true
            if ((att.dirh() > 0) !== ($.ps.vx > 0)) { // head-on collision
              $.ps.vx *= GC.weapon.reverse.factor.vx
            }
            $.ps.vy *= GC.weapon.reverse.factor.vy
            $.ps.vz *= GC.weapon.reverse.factor.vz
            $.team = att.team // change to the attacker's team
          } else if ($.state() === 1004) // on_ground
          {
            // var asp = att.mech.speed();
            // $.ps.vx= asp* GC.weapon.gain.factor.x * (att.ps.vx>0?1:-1);
            // $.ps.vy= asp* GC.weapon.gain.factor.y;
            if (att.type === 'lightweapon' || att.type === 'heavyweapon') {
              accept = true
              $.ps.vx = (att.ps.vx ? (att.ps.vx > 0 ? 1 : -1) : 0) * GC.weapon.bounceup.speed.x
              $.ps.vz = (att.ps.vz ? (att.ps.vz > 0 ? 1 : -1) : 0) * GC.weapon.bounceup.speed.z
            }
          }
        }

        const fall = ITR.fall !== undefined ? ITR.fall : GC.default.fall.value
        if ($.heavy) {
          if ($.state() === 2004) // on_ground
          {
            accept = true
            if (fall < 30) {
              $.effect_create(0, GC.effect.duration)
            } else if (fall < GC.fall.KO) {
              $.ps.vy = GC.weapon.soft_bounceup.speed.y
            } else {
              $.ps.vy = GC.weapon.bounceup.speed.y
              if (att.ps.vx) { $.ps.vx = (att.ps.vx > 0 ? 1 : -1) * GC.weapon.bounceup.speed.x }
              if (att.ps.vz) { $.ps.vz = (att.ps.vz > 0 ? 1 : -1) * GC.weapon.bounceup.speed.z }
              $.trans.frame(999)
            }
          } else if ($.state() === 2000) // in_the_sky
          {
            if (fall >= GC.fall.KO) {
              accept = true
              if ((att.dirh() > 0) !== ($.ps.vx > 0)) { // head-on collision
                $.ps.vx *= GC.weapon.reverse.factor.vx
              }
              $.ps.vy *= GC.weapon.reverse.factor.vy
              $.ps.vz *= GC.weapon.reverse.factor.vz
              $.team = att.team // change to the attacker's team
            }
          }
        }
        if (accept) {
          $.visualeffect_create(0, rect, (attps.x < $.ps.x), (fall < GC.fall.KO ? 1 : 2))
          if (ITR && ITR.vrest) {
            $.itr.vrest[att.uid] = ITR.vrest
          }
          if (ITR && ITR.injury) {
            $.health.hp -= ITR.injury
          }
          if ($.data.bmp.weapon_hit_sound) {
            $.match.sound.play($.data.bmp.weapon_hit_sound)
          }
        }
        return accept
      }

      /*\
       * being held in a character's hand
       - att holder's reference
       - wpoint data
       - holdpoint data
      \*/
      typeweapon.prototype.act = function (att, wpoint, holdpoint) {
        const $ = this
        const fD = $.frame.D
        const result = {}

        if ($.data.frame[wpoint.weaponact]) // if that frame exists
        {
          $.trans.frame(wpoint.weaponact)
          $.trans.trans() // update immediately
        }

        if (fD.wpoint && fD.wpoint.kind === 2) {
          if (wpoint.dvx) { $.ps.vx = att.dirh() * wpoint.dvx }
          if (wpoint.dvz) { $.ps.vz = att.dirv() * wpoint.dvz }
          if (wpoint.dvy) { $.ps.vy = wpoint.dvy }
          if ($.ps.vx || $.ps.vy || $.ps.vz) {  // gaining velocity; flying away
            let imx, imy // impulse
            if ($.light) {
              imx = 58; imy = -15
            }
            if ($.heavy) {
              imx = 48; imy = -40
            }
            $.mech.set_pos(
              att.ps.x + att.dirh() * imx,
              att.ps.y + imy,
              att.ps.z + $.ps.vz)
            $.ps.zz = 1
            if ($.light) {
              $.trans.frame(40)
            }
            if ($.heavy) {
              $.trans.frame(999)
            }
            $.trans.trans() // update immediately
            $.hold.obj = null
            result.thrown = true
          }

          if (!result.thrown) {
            const wpoint_cover = wpoint.cover !== undefined ? wpoint.cover : GC.default.wpoint.cover
            if (wpoint_cover === 1) {
              $.ps.zz = -1
            } else {
              $.ps.zz = 1
            }

            $.switch_dir(att.ps.dir)
            $.ps.sz = $.ps.z = att.ps.z
            $.mech.coincideXY(holdpoint, $.mech.make_point(fD.wpoint))
            $.mech.project()
          }

          if ($.light) // attackable
          {
            if (wpoint.attacking) {
              const ITR = Futil.make_array(fD.itr)

              for (const j in ITR) {  // for each itr tag
                if (ITR[j].kind === 5) // kind 5 only
                {
                  const vol = $.mech.volume(ITR[j])
                  vol.zwidth = 0
                  const hit = $.scene.query(vol, [$, att], { tag: 'body', not_team: $.team })
                  for (const k in hit) {  // for each being hit
                    if (!att.itr.arest) { // if rest allows
                      var citr
                      if ($.data.weapon_strength_list &&
                        $.data.weapon_strength_list[wpoint.attacking]) {
                        citr = $.data.weapon_strength_list[wpoint.attacking]
                      } else {
                        citr = ITR[j]
                      }

                      if ($.attacked(hit[k].hit(citr, att, { x: att.ps.x, y: att.ps.y, z: att.ps.z }, vol))) {  // hit you!
                        if (citr.vrest) {
                          result.vrest = citr.vrest
                        }
                        if (citr.arest) {
                          result.arest = citr.arest
                        }
                        result.hit = hit[k].uid
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (result.thrown) {
          $.shadow.show()
        }
        return result
      }

      typeweapon.prototype.drop = function (dvx, dvy) {
        const $ = this
        $.team = 0
        $.hold.obj = null
        if (dvx) { $.ps.vx = dvx * 0.5 } // magic number
        if (dvy) { $.ps.vy = dvy * 0.2 }
        $.ps.zz = 0
        $.trans.frame(999)
        $.shadow.show()
      }

      typeweapon.prototype.pick = function (att) {
        const $ = this
        if (!$.hold.obj) {
          $.hold.obj = att
          $.hold.pre = att
          $.team = att.team
          $.shadow.hide()
          return true
        }
        return false
      }

      typeweapon.prototype.itr_rest_update = function (obj, uid, ITR) // override livingobject.itr_rest_update
      {
        const $ = this
        let newrest
        if (ITR.arest) {
          newrest = ITR.arest
        } else if (ITR.vrest) {
          newrest = ITR.vrest
        } else {
          newrest = GC.default.weapon.vrest
        }
        if (obj.type === 'heavyweapon' || obj.type === 'lightweapon') {
          newrest *= 2 // double the rest time for weapon-weapon hit
        }
        $.itr.vrest[uid] = newrest
      }

      typeweapon.prototype.attacked = function (inj) {
        const $ = this
        if ($.hold.pre) {
          return $.hold.pre.attacked(inj)
        } else {
          return inj !== false
        }
      }

      typeweapon.prototype.offset_attack = function (inj) {
        const $ = this
        if ($.hold.pre) {
          $.hold.pre.offset_attack(inj)
        }
      }
      
      typeweapon.prototype.killed = function () {
        const $ = this
        if ($.hold.pre) {
          return $.hold.pre.killed()
        }
      }

      return typeweapon
    } // outer class weapon
    return weapon
  })
