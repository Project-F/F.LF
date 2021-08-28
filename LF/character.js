/** a LF2 character
 */

define(['LF/livingobject', 'LF/global', 'core/combodec', 'core/util', 'LF/util'],
  function (livingobject, Global, Fcombodec, Futil, util) {
    const GC = Global.gameplay

    const states =
    {
      generic: function (event, K) {
        const $ = this
        switch (event) {
          case 'frame':
            // health reduce
            if ($.frame.D.mp) {
              if ($.data.frame[$.frame.PN].next === $.frame.N) {  // if this frame is transited by next of previous frame
                if ($.frame.D.mp < 0) {
                  if (!$.match.F6_mode) {
                    $.health.mp += $.frame.D.mp
                  }
                  $.health.mp_usage -= $.frame.D.mp
                  if ($.health.mp < 0) {
                    $.health.mp = 0
                    $.trans.frame($.frame.D.hit_d)
                  }
                }
              } else {
                const dmp = $.frame.D.mp % 1000
                const dhp = Math.floor($.frame.D.mp / 1000) * 10
                if (!$.match.F6_mode) {
                  $.health.mp -= dmp
                }
                $.health.mp_usage += dmp
                $.injury(dhp)
              }
            }
            $.opoint()
            break
          case 'TU':
            switch (true) {
              case ($.counter.disappear_count < 0): // dismiss
                break
              case ($.counter.disappear_count >= 0 && $.counter.disappear_count < GC.effect.disappear.shadow_blink): // body disappear
                $.counter.disappear_count += 1
                break
              case ($.counter.disappear_count >= GC.effect.disappear.shadow_blink && $.counter.disappear_count < GC.effect.disappear.body_blink): // shadow blink
                $.counter.disappear_count += 1
                if (Math.floor($.counter.disappear_count / 2) % 2 == 0) {
                  $.shadow.show()
                } else {
                  $.shadow.hide()
                }
                break
              case ($.counter.disappear_count == GC.effect.disappear.body_blink): // body blink
                $.counter.disappear_count += 1
                $.effect.blink = true
                $.effect.timein = 0
                $.effect.timeout = 30
                $.shadow.show()
                $.sp.show()
                $.effect.super = false
                break
              case ($.counter.disappear_count > GC.effect.disappear.body_blink): // initialize and dismiss
                $.counter.disappear_count = -1
                break
            }
            switch (true) {
              case ($.counter.dead_blink_count < 0):
                break
              case ($.counter.dead_blink_count == 0):
                $.effect.blink = true
                $.counter.dead_blink_count += 1
                break
              case ($.counter.dead_blink_count > 0 && $.counter.dead_blink_count < 30):
                $.counter.dead_blink_count += 1
                break
              case ($.counter.dead_blink_count >= 30):
                $.effect.blink = false
                $.sp.hide()
                $.shadow.hide()
                $.counter.dead_blink_count = -1
                $.match.destroy_object($)
                break
            }
            if ($.state_update('post_interaction')) {
              ; // do nothing
            } else {
              $.post_interaction()
            }

            var ps = $.ps
            if (ps.y === 0 && ps.vy === 0 && $.frame.N === 212 && $.frame.PN !== 211) {
              $.trans.frame(999)
            } else if (ps.y === 0 && ps.vy > 0) // fell onto ground
            {
              var result = $.state_update('fell_onto_ground')
              if (result) {
                $.trans.frame(result, 15)
              } else {
                // console.log(ps.vx, util.lookup_abs(GC.friction.fell,ps.vx));
                ps.vy = 0 // set to zero
                $.mech.linear_friction(
                  util.lookup_abs(GC.friction.fell, ps.vx),
                  util.lookup_abs(GC.friction.fell, ps.vz)
                )
              }
            } else if (ps.y + ps.vy >= 0 && ps.vy > 0) // predict falling onto the ground
            {
              var result = $.state_update('fall_onto_ground')
              if (result) {
                $.trans.frame(result, 15)
              } else {
                if ($.state() === 13) { // frozen
                  ; // do nothing
                } else if ($.frame.N === 212) { // jumping
                  $.trans.frame(215, 15) // crouch
                } else {
                  $.trans.frame(219, 15) // crouch2
                }
              }
            }

            // health recover
            // http://lf2.wikia.com/wiki/Health_and_mana
            if ($.match.time.t % 12 === 0) {
              if ($.health.hp >= 0 && $.health.hp < $.health.hp_bound) {
                $.health.hp++
              }
            }

            var heal_speed = 8
            if ($.health.hp >= 0 && $.effect.heal && $.effect.heal > 0) {
              if ($.match.time.t % 8 === 0) {
                if ($.health.hp + heal_speed <= $.health.hp_bound) {
                  $.health.hp += heal_speed
                }
                $.effect.heal -= heal_speed
              }
            }

            if ($.match.time.t % 3 === 0) {
              if ($.health.mp < $.health.mp_full) {
                $.health.mp += 1 + Math.floor(($.health.hp_full - ($.health.hp < $.health.hp_full ? $.health.hp : $.health.hp_full)) / 100)
              }
            }
            // recovery
            if ($.health.fall > 0) { $.health.fall += GC.recover.fall }
            if ($.health.bdefend > 0) { $.health.bdefend += GC.recover.bdefend }
            // combo buffer
            $.combo_buffer.timeout--
            if ($.combo_buffer.timeout === 0) {
              switch ($.combo_buffer.combo) {
                case 'def': case 'jump': case 'att': case 'left-left': case 'right-right':
                  $.combo_buffer.combo = null
                  break
                // other combo is not cleared
              }
            }
            break
          case 'transit':
            // dynamics: position, friction, gravity
            $.mech.dynamics() // any further change in position will not be updated on screen until next TU
            $.wpoint() // my holding weapon following my change
            break
          case 'combo':
            switch (K) {
              case 'left': case 'right':
              case 'left-left': case 'right-right':
                break
              default:
                // here is where D>A, D>J... etc handled
                if (K == 'DJA' && $.transform_character && $.transform_character.is_rudolf_transform) {
                  $.id_update('revert_transform')
                }
                var tag = Global.combo_tag[K]
                if (tag && $.frame.D[tag]) {
                  if (!$.id_update('generic_combo', K, tag)) {
                    var dir = Global.combo_dir[K]
                    if (dir) {
                      $.switch_dir(dir)
                    }
                    $.trans.frame($.frame.D[tag], 11)
                    return 1
                  }
                }
            }
            break
          case 'post_combo': // after state specific processing
            $.pre_interaction()
            break
          case 'state_exit':
            switch ($.combo_buffer.combo) {
              case 'left-left': case 'right-right':
                // cannot transfer across states
                $.combo_buffer.combo = null
                break
            }
            break
        }
      },

      // state specific processing to different events

      0: function (event, K) // standing
      {
        const $ = this
        switch (event) {
          case 'frame':
            if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
              $.trans.frame(12)
            }
            break

          case 'combo':
            switch (K) {
              case 'left': case 'right': case 'up': case 'down':
              case 'jump': case null:
                var dx = $.con.state.left !== $.con.state.right
                var dz = $.con.state.up !== $.con.state.down
                if (dx || dz) {
                  // apply movement
                  if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                    if (dx) { $.ps.vx = $.dirh() * ($.data.bmp.heavy_walking_speed) }
                    $.ps.vz = $.dirv() * ($.data.bmp.heavy_walking_speedz)
                  } else {
                    if (K !== 'jump') {
                      $.trans.frame(5, 5)
                    }
                    if (dx) {
                      $.ps.vx = $.dirh() * ($.data.bmp.walking_speed)
                    }
                    $.ps.vz = $.dirv() * ($.data.bmp.walking_speedz)
                  }
                }
                break
            }
            switch (K) {
              case 'left-left': case 'right-right':
                if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                  $.trans.frame(16, 10)
                } else {
                  $.trans.frame(9, 10)
                }
                return 1
              case 'def':
                if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                  return 1
                }
                $.trans.frame(110, 10)
                return 1
              case 'jump':
                if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                  if (!$.proper('heavy_weapon_jump')) {
                    return 1
                  } else {
                    $.trans.frame($.proper('heavy_weapon_jump'), 10)
                    return 1
                  }
                }
                $.trans.frame(210, 10)
                return 1
              case 'att':
                if ($.hold.obj) {
                  var dx = $.con.state.left !== $.con.state.right
                  if ($.hold.obj.type === 'heavyweapon') {
                    $.trans.frame(50, 10) // throw heavy weapon
                    return 1
                  } else if ($.proper($.hold.obj.id, 'just_throw')) {
                    $.trans.frame(45, 10) // throw light weapon
                    return 1
                  } else if (dx && $.proper($.hold.obj.id, 'stand_throw')) {
                    $.trans.frame(45, 10) // throw weapon
                    return 1
                  } else if ($.proper($.hold.obj.id, 'attackable')) // light weapon attack
                  {
                    $.trans.frame($.match.random() < 0.5 ? 20 : 25, 10)
                    return 1
                  }
                }
                //
                var vol = $.mech.volume(Futil.make_array($.data.frame[72].itr || $.data.frame[73].itr)[0]) // super punch frames
                var hit = $.scene.query(vol, $, { tag: 'itr:6', not_team: $.team })
                for (const t in hit) {  // if someone is in my hitting scoope who has itr kind:6
                  $.trans.frame(70, 10) // I 'll use super punch!
                  return 1
                }
                //
                $.trans.frame($.match.random() < 0.5 ? 60 : 65, 10)
                return 1
            }
            break
        }
      },

      1: function (event, K) // walking
      {
        const $ = this

        let dx = 0; let dz = 0
        if ($.con.state.left) { dx -= 1 }
        if ($.con.state.right) { dx += 1 }
        if ($.con.state.up) { dz -= 1 }
        if ($.con.state.down) { dz += 1 }
        switch (event) {
          case 'frame':
            if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
              if (dx || dz) {
                $.frame_ani_oscillate(12, 15)
              } else {
                $.trans.set_next($.frame.N)
              }
            } else {
              $.frame_ani_oscillate(5, 8)
            }
            $.trans.set_wait($.data.bmp.walking_frame_rate - 1)
            break

          case 'TU':
            // apply movement
            var xfactor = 1 - ($.dirv() ? 1 : 0) * (2 / 7) // reduce x speed if moving diagonally
            if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
              if (dx) $.ps.vx = xfactor * $.dirh() * ($.data.bmp.heavy_walking_speed)
              $.ps.vz = $.dirv() * ($.data.bmp.heavy_walking_speedz)
            } else {
              if (dx) $.ps.vx = xfactor * $.dirh() * ($.data.bmp.walking_speed)
              $.ps.vz = $.dirv() * ($.data.bmp.walking_speedz)
              if (!dx && !dz && $.trans.next() !== 999) {
                $.trans.set_next(999) // go back to standing
                $.trans.set_wait(1, 1, 2)
              }
            }
            break

          case 'state_entry':
            $.trans.set_wait(0)
            break

          case 'combo':
            if (dx !== 0 && dx !== $.dirh()) { $.switch_dir($.ps.dir === 'right' ? 'left' : 'right') } // toogle dir
            if (!dx && !dz && !$.statemem.released) {
              $.statemem.released = true
              $.mech.unit_friction()
            }
            // walking same as standing, except null combo
            if (K) { return $.states['0'].call($, event, K) }
            break
        }
      },

      2: function (event, K) // running, heavy_obj_run
      {
        const $ = this
        switch (event) {
          case 'frame':
            if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
              $.frame_ani_oscillate(16, 18)
            } else {
              $.frame_ani_oscillate(9, 11)
            }
            $.trans.set_wait($.data.bmp.running_frame_rate)
          // no break here

          case 'TU':
            // to maintain the velocity against friction
            var xfactor = 1 - ($.dirv() ? 1 : 0) * (1 / 7) // reduce x speed if moving diagonally
            if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
              $.ps.vx = xfactor * $.dirh() * $.data.bmp.heavy_running_speed
              $.ps.vz = $.dirv() * $.data.bmp.heavy_running_speedz
            } else {
              $.ps.vx = xfactor * $.dirh() * $.data.bmp.running_speed
              $.ps.vz = $.dirv() * $.data.bmp.running_speedz
            }
            break

          case 'combo':
            switch (K) {
              case 'left': case 'right': case 'left-left': case 'right-right':
                if (K.split('-')[0] !== $.ps.dir) {
                  if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                    $.trans.frame(19, 10)
                  } else {
                    $.trans.frame(218, 10)
                  }
                  return 1
                }
                break

              case 'def':
                if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                  return 1
                }
                $.trans.frame(102, 10)
                return 1

              case 'jump':
                if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                  if (!$.proper('heavy_weapon_dash')) {
                    return 1
                  } else {
                    $.trans.frame($.proper('heavy_weapon_dash'), 10)
                    return 1
                  }
                }
                $.trans.frame(213, 10)
                return 1

              case 'att':
                if ($.hold.obj) {
                  if ($.hold.obj.type === 'heavyweapon') {
                    $.trans.frame(50, 10) // throw heavy weapon
                    return 1
                  } else {
                    const dx = $.con.state.left !== $.con.state.right
                    if (dx && $.proper($.hold.obj.id, 'run_throw')) {
                      $.trans.frame(45, 10) // throw light weapon
                      return 1
                    } else if ($.proper($.hold.obj.id, 'attackable')) {
                      $.trans.frame(35, 10) // light weapon attack
                      return 1
                    }
                  }
                }
                $.trans.frame(85, 10)
                return 1
            }
            break
        }
      },

      3: function (event, K) // punch, jump_attack, run_attack, ...
      {
        const $ = this
        switch (event) {
          case 'frame':
            if ($.frame.D.next === 999 && $.ps.y < 0) {
              $.trans.set_next(212) // back to jump
            }
            if ($.frame.N === 253) {
              $.id_update('state3_fly_crash')
            }
            $.id_update('state3_frame')
            break
          case 'hit_stop':
            return $.id_update('state3_hit_stop')
          case 'frame_force':
            return $.id_update('state3_frame_force')
          case 'TU':
            if ($.frame.D.itr) {
              for (let index in $.frame.D.itr) {
                if (($.frame.D.itr[index].kind == 10 ||
                  $.frame.D.itr[index].kind == 11) &&
                  $.match.time.t % 2 === 0) {
                  for (let I in $.scene.live) {
                    let target = $.scene.live[I]
                    let z_diff = Math.abs(target.ps.z - $.ps.z)
                    let x_diff = Math.abs(target.ps.x - $.ps.x)
                    if (x_diff * x_diff + 4 * z_diff * z_diff < (150 * 150)) { // Oval equation (obj inside affected area?)
                      if (target.uid != $.uid) {
                        if (target.ps.y < 0 || // floating
                          target.type == 'character' || // target is character
                          (target.ps.y >= 0 && $.match.random() < 0.15)) // random select living obj
                        {
                          if (target.type == 'character' && target.hold) { // drop weapon when being lift
                            target.drop_weapon(0, 0)
                          }
                          const ITR = Futil.make_array($.data.frame[251].itr || $.data.frame[251].itr)[0]
                          const vol = $.mech.volume(Futil.make_array($.data.frame[251].itr || $.data.frame[251].itr)[0])
                          if (target.attacked(target.hit(ITR, $, { x: $.ps.x, y: $.ps.y, z: $.ps.z }, vol))) { // hit you!
                            target.itr_arest_update(ITR)
                          }
                        }
                      }
                    }
                  }
                  break
                }
              }
            }
            break
        }
      },

      4: function (event, K) // jump
      {
        const $ = this
        switch (event) {
          case 'frame':
            $.statemem.frameTU = true
            if ($.frame.PN === 80 || $.frame.PN === 81) { // after jump attack
              $.statemem.attlock = 2
            }
            break

          case 'TU':
            if ($.statemem.frameTU) {
              $.statemem.frameTU = false
              if ($.frame.N === 212 && $.frame.PN === 211) { // start jumping
                var dx = 0
                if ($.con.state.left) { dx -= 1 }
                if ($.con.state.right) { dx += 1 }
                $.ps.vx = dx * ($.data.bmp.jump_distance - 1)
                $.ps.vz = $.dirv() * ($.data.bmp.jump_distancez - 1)
                $.ps.vy = $.data.bmp.jump_height // upward force
              }
            }
            if ($.statemem.attlock) {
              $.statemem.attlock--
            }
            break

          case 'combo':
            if ((K === 'att' || $.con.state.att) && !$.statemem.attlock) {
              // a transition to jump_attack can only happen after entering frame 212
              if ($.frame.N === 212) {
                if ($.hold.obj) {
                  var dx = $.con.state.left !== $.con.state.right
                  if (dx && $.proper($.hold.obj.id, 'jump_throw')) {
                    $.trans.frame(52, 10) // sky light weapon throw
                  } else if ($.proper($.hold.obj.id, 'attackable')) {
                    $.trans.frame(30, 10) // light weapon attack
                  }
                } else {
                  $.trans.frame(80, 10) // jump attack
                }
                return 1 // key consumed
              }
            }
            break
        }
      },

      5: function (event, K) // dash
      {
        const $ = this
        switch (event) {
          case 'state_entry':
            if (($.frame.PN >= 9 && $.frame.PN <= 11) || // if previous is running
              ($.frame.PN === 215)) // or crouch
            {
              $.ps.vx = $.dirh() * ($.data.bmp.dash_distance - 1) * ($.frame.N === 213 ? 1 : -1)
              $.ps.vz = $.dirv() * ($.data.bmp.dash_distancez - 1)
              $.ps.vy = $.data.bmp.dash_height
            }
            break

          case 'combo':
            if (K === 'att' || $.con.state.att) {
              if ($.proper('dash_backattack') || // back attack
                $.dirh() === ($.ps.vx > 0 ? 1 : -1)) // if not turning back
              {
                if ($.hold.obj && $.proper($.hold.obj.id, 'attackable')) { // light weapon attack
                  $.trans.frame(40, 10)
                } else {
                  $.trans.frame(90, 10)
                }
                $.allow_switch_dir = false
                if (K === 'att') {
                  return 1
                }
              }
            }
            if (K === 'left' || K === 'right') {
              if (K != $.ps.dir) {
                if ($.dirh() == ($.ps.vx > 0 ? 1 : -1)) { // turn back
                  if ($.frame.N === 213) $.trans.frame(214, 0)
                  if ($.frame.N === 216) $.trans.frame(217, 0)
                  $.switch_dir(K)
                } else {  // turn to front
                  if ($.frame.N === 214) $.trans.frame(213, 0)
                  if ($.frame.N === 217) $.trans.frame(216, 0)
                  $.switch_dir(K)
                }
                return 1
              }
            }
            break
        }
      },

      6: function (event, K) // rowing
      {
        const $ = this
        switch (event) {
          case 'TU':
            if ($.frame.N === 100 || $.frame.N === 108) {
              $.ps.vy = 0
            }
            break

          case 'frame':
            if ($.frame.N === 100 || $.frame.N === 108) {
              $.trans.set_wait(1)
            }
            break

          case 'fall_onto_ground':
            if ($.frame.N === 101 || $.frame.N === 109) {
              return 215
            }
            break
        }
      },

      7: function (event, K) // defending
      {
        const $ = this
        switch (event) {
          case 'frame':
            if ($.frame.N === 111) {
              $.trans.inc_wait(4)
            }
            break
        }
      },

      8: function (event, K) // broken defend
      {
        const $ = this
        switch (event) {
          case 'frame_force':
          case 'TU_force':
            // nasty fix: to compensate that frame_force is applied with respecting to facing direction
            if ($.frame.D.dvx) {
              if (($.ps.vx > 0 ? 1 : -1) !== $.dirh()) {
                const avx = $.ps.vx > 0 ? $.ps.vx : -$.ps.vx
                const dirx = 2 * ($.ps.vx > 0 ? 1 : -1)
                if ($.ps.y < 0 || avx < $.frame.D.dvx) {
                  $.ps.vx = dirx * $.frame.D.dvx
                }
                if ($.frame.D.dvx < 0) {
                  $.ps.vx = $.ps.vx - dirx
                }
              }
            }
            break
        }
      },

      9: function (event, K) // catching, throw lying man
      {
        const $ = this
        switch (event) {
          case 'state_entry':
            $.statemem.stateTU = true
            $.statemem.counter = 43
            $.statemem.attacks = 0
            break

          case 'state_exit':
            $.catching = null
            $.ps.zz = 0
            break

          case 'frame':
            switch ($.frame.N) {
              case 123: // a successful attack
                $.statemem.attacks++
                $.statemem.counter += 3
                $.trans.inc_wait(1)
                break
              case 233: case 234:
                $.trans.inc_wait(-1)
                break
              case 240: // it means from frame 121 jump to 235 for Rudolf => performing transform
                $.id_update('rudolf_transform')
                break
            }
            if ($.catching && $.frame.D.cpoint) {
              $.catching.caught_b(
                $.mech.make_point($.frame.D.cpoint),
                $.frame.D.cpoint,
                $.ps.dir,
                $.dirv()
              )
            }
            break

          case 'TU':
            if ($.catching &&
              $.caught_cpointkind() === 1 &&
              $.catching.caught_cpointkind() === 2) { // really catching you
              if ($.statemem.stateTU) {
                $.statemem.stateTU = false
                /** the immediate `TU` after `state`. the reason for this is a synchronization issue,
                  i.e. it must be waited until both catcher and catchee transited to the second frame
                  and it is not known at the point of `frame` event, due to different scheduling.
                 */

                // injury
                if ($.frame.D.cpoint.injury) {
                  if ($.attacked($.catching.hit($.frame.D.cpoint, $, { x: $.ps.x, y: $.ps.y, z: $.ps.z }, null))) {
                    $.trans.inc_wait(1, 10, 99) // lock until frame transition
                  }
                }

                // cover
                let cover = GC.default.cpoint.cover
                if ($.frame.D.cpoint.cover !== undefined) {
                  cover = $.frame.D.cpoint.cover
                }

                if (cover === 0 || cover === 10) {
                  $.ps.zz = 1
                } else {
                  $.ps.zz = -1
                }

                if ($.frame.D.cpoint.dircontrol === 1) {
                  if ($.con.state.left) { $.switch_dir('left') }
                  if ($.con.state.right) { $.switch_dir('right') }
                }
              }
            }
            break // TU

          case 'post_combo':
            if ($.catching) {
              $.statemem.counter--
            }
            if ($.statemem.counter <= 0) {
              if (!($.frame.N === 122 && $.statemem.attacks === 4)) // let it finish the 5th punch
              {
                if ($.frame.N === 121 || $.frame.N === 122) {
                  $.catching.caught_release()
                  $.trans.frame(999, 15)
                }
              }
            }
            break

          case 'combo':
            switch (K) {
              case 'att':
                if ($.frame.D.cpoint &&
                  ($.frame.D.cpoint.taction ||
                    $.frame.D.cpoint.aaction)) {
                  const dx = $.con.state.left !== $.con.state.right
                  const dy = $.con.state.up !== $.con.state.down
                  if ((dx || dy) && $.frame.D.cpoint.taction) {
                    const tac = $.frame.D.cpoint.taction
                    if (tac < 0) {  // turn myself around
                      $.switch_dir($.ps.dir === 'right' ? 'left' : 'right') // toogle dir
                      $.trans.frame(-tac, 10)
                    } else {
                      $.trans.frame(tac, 10)
                    }
                    $.statemem.counter += 10
                  } else if ($.frame.D.cpoint.aaction) {
                    $.trans.frame($.frame.D.cpoint.aaction, 10)
                  }
                  const nextframe = $.data.frame[$.trans.next()]
                  $.catching.caught_throw(nextframe.cpoint, $.dirv())
                }
                return 1 // always return true so that `att` is not re-fired next frame
              case 'jump':
                if ($.frame.N === 121) {
                  if ($.frame.D.cpoint.jaction) {
                    $.trans.frame($.frame.D.cpoint.jaction, 10)
                    return 1
                  }
                }
                break
            }
            break
        }
      },

      10: function (event, K) // being caught
      {
        const $ = this
        switch (event) {
          case 'state_exit':
            $.catching = null
            $.caught_b_holdpoint = null
            $.caught_b_cpoint = null
            $.caught_b_adir = null
            $.caught_b_vdir = null
            $.caught_throwz = null
            break

          case 'frame':
            $.statemem.frameTU = true
            $.trans.set_wait(99, 10, 99) // lock until frame transition
            break

          case 'TU':
            if ($.frame.N === 135) {
              // to be lifted against gravity
              $.ps.vy = 0
            }

            if ($.caught_cpointkind() === 2 &&
              $.catching && $.catching.caught_cpointkind() === 1) { // really being caught
              if ($.statemem.frameTU) {
                $.statemem.frameTU = false // the immediate `TU` after `frame`

                const holdpoint = $.caught_b_holdpoint
                const cpoint = $.caught_b_cpoint
                const adir = $.caught_b_adir

                if (cpoint.vaction) {
                  $.trans.frame(cpoint.vaction, 22)
                }

                if (cpoint.throwvx) { // I am being thrown!
                  const dvx = cpoint.throwvx; const dvy = cpoint.throwvy; let dvz = cpoint.throwvz
                  if (dvx) $.ps.vx = (adir === 'right' ? 1 : -1) * dvx
                  if (dvy) $.ps.vy = dvy
                  if (dvz === GC.unspecified) dvz = 0
                  if (dvz) $.ps.vz = dvz
                  if ($.caught_throwz !== null && $.caught_throwz !== undefined) {
                    $.ps.vz *= $.caught_throwz
                  } else {
                    $.ps.vz *= $.caught_b_vdir
                  }

                  if (cpoint.throwinjury !== GC.unspecified) {
                    $.caught_throwinjury = cpoint.throwinjury
                  } else {
                    $.caught_throwinjury = GC.default.itr.throw_injury
                  }

                  // impulse
                  $.mech.set_pos(
                    $.ps.x + $.ps.vx * 1,
                    $.ps.y + $.ps.vy * 2,
                    $.ps.z + $.ps.vz)
                } else {
                  if (cpoint.dircontrol === undefined) {
                    if (cpoint.cover && cpoint.cover >= 10) {
                      $.switch_dir(adir) // follow dir of catcher
                    } else { // default cpoint cover
                      $.switch_dir(adir === 'left' ? 'right' : 'left') // face the catcher
                    }
                  }
                  $.mech.coincideXY(holdpoint, $.mech.make_point($.frame.D.cpoint))
                }
              }
            } else {
              if ($.catching) {
                $.trans.frame(212, 10)
              }
            }
            break
        }
      },

      11: function (event, K) // injured
      {
        const $ = this
        switch (event) {
          case 'state_entry':
            $.trans.inc_wait(0, 20) // set lock only
            break
          case 'frame':
            switch ($.frame.N) {
              case 221: case 223: case 225:
                $.trans.set_next(999)
                break
              case 220: case 222: case 224: case 226:
                // $.trans.inc_wait(0, 20, 99); //lock until frame transition
                break
            }
            break
        }
      },

      12: function (event, K) // falling
      {
        const $ = this
        switch (event) {
          case 'frame':
            if ($.effect.dvy <= 0) {
              switch ($.frame.N) {
                case 180:
                  $.trans.set_next(181)
                  $.trans.set_wait(util.lookup_abs(GC.fall.wait180, $.effect.dvy))
                  break
                case 181:
                  // console.log('y:'+$.ps.y+', vy:'+$.ps.vy+', vx:'+$.ps.vx);
                  $.trans.set_next(182)
                  var vy = $.ps.vy > 0 ? $.ps.vy : -$.ps.vy
                  if ($.ps.vy == 0) {
                    $.ps.vy = 5*($.ps.vy>0?1:-1); //magic number
                    vy = 5*($.ps.vy>0?1:-1); //magic number
                  }
                  if (vy >= 0 && vy <= 4) {
                    $.trans.set_wait(2)
                  } else if (vy > 4 && vy < 7) {
                    $.trans.set_wait(3)
                  } else if (vy >= 7) {
                    $.trans.set_wait(4)
                  }
                  break
                case 182:
                  $.trans.set_next(183)
                  break                
                case 186:
                  if ($.ps.vy == 0) {
                    $.ps.vy = 5*($.ps.vy>0?1:-1); //magic number
                    vy = 5*($.ps.vy>0?1:-1); //magic number
                  }
                  $.trans.set_next(187)
                  break
                case 187:
                  $.trans.set_next(188)
                  break
                case 188:
                  $.trans.set_next(189)
                  break
              }
            } else {
              switch ($.frame.N) {
                case 180:
                  $.trans.set_next(185)
                  $.trans.set_wait(1)
                  break
                case 186:
                  $.trans.set_next(191)
                  break
              }
            }
            break

          case 'fell_onto_ground':
          case 'fall_onto_ground':
            if ($.caught_throwinjury > 0) {
              $.injury($.caught_throwinjury)
              $.caught_throwinjury = null
            }
            var ps = $.ps
            $.match.sound.play('1/016')
            // console.log('speed:'+$.mech.speed()+', vx:'+ps.vx+', vy:'+ps.vy);
            if ($.mech.speed() > GC.character.bounceup.limit.xy ||
              ps.vy > GC.character.bounceup.limit.y) {
              $.mech.linear_friction(
                util.lookup_abs(GC.character.bounceup.absorb, ps.vx),
                util.lookup_abs(GC.character.bounceup.absorb, ps.vz)
              )
              ps.vy = -GC.character.bounceup.y
              if ($.frame.N >= 203 && $.frame.N <= 206) {
                return 185
              }
              if ($.frame.N >= 180 && $.frame.N <= 185) {
                return 185
              }
              if ($.frame.N >= 186 && $.frame.N <= 191) {
                return 191
              }
            } else {
              if ($.frame.N >= 203 && $.frame.N <= 206) {
                return 230 // next frame
              }
              if ($.frame.N >= 180 && $.frame.N <= 185) {
                return 230
              }
              if ($.frame.N >= 186 && $.frame.N <= 191) {
                return 231
              }
            }
            break

          case 'combo':
            if ($.frame.N === 182 || $.frame.N === 188) {
              if (K === 'jump') {
                if ($.health.fall < GC.fall.KO && $.health.hp > 0) {
                  if ($.frame.N === 182) {
                    $.trans.frame(100)
                  } else {
                    $.trans.frame(108)
                  }
                  if ($.ps.vx) {
                    $.ps.vx = 5 * ($.ps.vx > 0 ? 1 : -1) // magic number
                  }
                  if ($.ps.vy == 0) {
                    $.ps.vy = 5 * ($.ps.vy > 0 ? 1 : -1) //magic number
                  }
                  if ($.ps.vz) {
                    $.ps.vz = 2 * ($.ps.vz > 0 ? 1 : -1) // magic number
                  }
                  return 1
                }
              }
            }
            return 1 // always return true so that `jump` is not re-fired next frame
        }
      },

      13: function (event, K) // frozen
      {
        const $ = this
        switch (event) {
          case 'state_exit':
            $.brokeneffect_create(212)
            break
        }
      },

      14: function (event, K) // lying
      {
        const $ = this
        switch (event) {
          case 'state_entry':
            $.health.fall = 0
            $.health.bdefend = 0
            if ($.health.hp <= 0) {
              $.die()
              if ($.is_npc) {
                $.counter.dead_blink_count = 0
              }
            }
            break
          case 'state_exit':
            $.effect.timein = 0
            $.effect.timeout = 30
            $.effect.blink = true
            $.effect.super = true
            break
        }
      },

      15: function (event, K) // stop_running, crouch, crouch2, dash_attack, light_weapon_thw, heavy_weapon_thw, heavy_stop_run, sky_lgt_wp_thw
      {
        const $ = this
        switch (event) {
          case 'frame':
            switch ($.frame.N) {
              case 19: // heavy_stop_run
                if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
                  $.trans.set_next(12)
                }
                break
              case 215:
                $.trans.inc_wait(-1)
                break
              case 219: // crouch
                if (!$.id_update('state15_crouch')) {
                  switch ($.frame.PN) // previous frame number
                  {
                    case 105: // after rowing
                      $.mech.unit_friction()
                      break
                    case 216: // after dash
                    case 90: case 91: case 92: // dash attack
                      $.trans.inc_wait(-1)
                      break
                  }
                }
                break
              case 54: // sky_lgt_wp_thw
                if ($.frame.D.next === 999 && $.ps.y < 0) {
                  $.trans.set_next(212) // back to jump
                }
                break
              case 257:
                $.id_update('state1280_disappear')
                break
            }
            break

          case 'combo':
            if ($.frame.N === 215) // only after jumping
            {
              if (K === 'def') {
                $.trans.frame(102, 10)
                return 1
              }
              if (K === 'jump') {
                let dx = 0
                if ($.con.state.left) { dx -= 1 }
                if ($.con.state.right) { dx += 1 }
                if (dx) {
                  $.trans.frame(213, 10)
                  $.switch_dir(dx === 1 ? 'right' : 'left')
                } else if ($.ps.vx === 0) {
                  $.trans.inc_wait(2, 10, 99) // lock until frame transition
                  $.trans.set_next(210, 10)
                } else if (($.ps.vx > 0 ? 1 : -1) === $.dirh()) {
                  $.trans.frame(213, 10)
                } else {
                  $.trans.frame(214, 10)
                }
                return 1
              }
            }
            break
        }
      },

      16: function (event, K) // injured 2 (dance of pain)
      {
        const $ = this
        switch (event) {
        }
      },

      18: function (event, K) // burning
      {
        const $ = this
        switch (event) {
          case 'frame':
            $.brokeneffect_create(302, 1)
            break
          case 'fall_onto_ground':
            $.brokeneffect_create(302)
          case 'fell_onto_ground':
            return $.states['12'].call($, event, K)
            break
        }
      },

      19: function (event, K) // firen specific
      {
        const $ = this
        switch (event) {
          case 'TU':
            $.ps.vz = $.dirv() * ($.data.bmp.running_speedz)
            break
        }
      },

      301: function (event, K) // deep specific
      {
        const $ = this
        switch (event) {
          case 'frame_force':
            if ($.frame.N !== 290) {
              return 1 // disable pre update of force
            }
            break
          case 'TU':
            $.ps.vz = $.dirv() * ($.data.bmp.walking_speedz)
            break
          case 'hit_stop':
            $.effect_stuck(1, 2) // not stuck immediately but next frame (timein=1)
            $.trans.inc_wait(1)
            return 1
        }
      },

      400: function (event, K) // teleport to the nearest enemy
      {
        const $ = this
        switch (event) {
          case 'frame':
            var targets = $.match.scene.query(null, $, {
              not_team: $.team,
              type: 'character',
              sort: 'distance'
            })
            if (targets.length) {
              const en = targets[0]
              $.ps.x = en.ps.x - 120 * ($.dirh())
              $.ps.y = 0
              $.ps.z = en.ps.z
            }
            break
        }
      },

      401: function (event, K) // teleport to the furthest teammate
      {
        const $ = this
        switch (event) {
          case 'frame':
            var targets = $.match.scene.query(null, $, {
              team: $.team,
              type: 'character',
              sort: 'distance'
            })
            targets.reverse()
            if (targets.length) {
              const en = targets[0]
              $.ps.x = en.ps.x + 60 * ($.dirh())
              $.ps.y = 0
              $.ps.z = en.ps.z
            }
            break
        }
      },

      501: function (event)
      {
        const $ = this
        switch (event) {
          case 'frame':
            switch ($.frame.N) {
              case 298:
                if ($.trans.next() === 999) {
                  $.id_update('rudolf_transform')
                }
                break
            }
        }
      },

      1700: function (event, K) // heal
      {
        const $ = this
        switch (event) {
          case 'frame':
            $.effect.heal = GC.effect.heal_max
            break
        }
      },

      x: function (event, K) {
        const $ = this
        switch (event) {
        }
      }
    }

    const id_updates = // nasty fix (es)
    {
      default: function (event, K, tag) {
        switch (event) {
          case 'revert_transform':
            const $ = this
            $.transform_character.is_rudolf_transform = false
            $.match.create_object($.transform_character.opoint, $)
            $.match.transform_panel($.uid)
            $.match.create_transform_character({
              name: 'transform',
              id: 5,
              controller: $.con,
              team: $.team,
              pos: { x: $.ps.x, y: $.ps.y, z: $.ps.z },
              spec: {                
                dir: $.ps.dir,
                health: $.health,
                stat: $.stat,
                transform_character: $.transform_character,
                replace_from: $,
              }
            })
            break
        }
      },
      1: function (event, K, tag) // deep
      {
        const $ = this
        switch (event) {
          case 'state3_frame':
            switch ($.frame.N) {
              case 267:
                $.ps.vy += 1
                return 1
            }
            break
          case 'state15_crouch':
            if ($.frame.PN >= 267 && $.frame.PN <= 272) {
              $.trans.inc_wait(-1)
            }
            break
          case 'generic_combo':
            if (tag === 'hit_Fj') {
              if (K === 'D>J' || K === 'D>AJ') {
                $.switch_dir('right')
              } else {
                $.switch_dir('left')
              }
            }
            break
        }
      },
      5: function (event) // Rudolf
      {
        const $ = this
        switch (event) {
          case 'state3_frame':
            if ($.frame.N >= 273 && $.frame.N <= 276) {
              $.ps.vy = -6.8
            }
            break
          case ('rudolf_transform'):
            if ($.catching) {
              $.transform_character = {
                id:  $.catching.id, // create_characters
                uid: $.catching.uid, // panel
                opoint: { // smoke
                  kind: 1, x: 41, y: 70, action: 70, dvx: 0, dvy: 0, oid: 204, facing: 0
                },
                is_rudolf_transform: true,
              }
            }
            if (!$.transform_character) {
              break
            }
            $.match.transform_panel($.uid, $.transform_character.uid)
            $.match.create_transform_character({
              name: 'transform',
              id: $.transform_character.id,
              controller: $.con,
              team: $.team,
              pos: { x: $.ps.x, y: $.ps.y, z: $.ps.z },
              spec: {
                dir: $.ps.dir,
                health: $.health,
                stat: $.stat,
                transform_character: $.transform_character,
                replace_from: $,
              }
            })
            break
          case 'state1280_disappear':
            if ($.frame.N === 257) { // next: 1280
              $.sp.hide()
              $.shadow.hide()
              $.effect.super = true
              $.counter.disappear_count = 0
            }
            break
        }
      },
      6: function (event, K, tag) // Louis
      {
        const $ = this
        switch (event) {
          case 'generic_combo':
            if (tag === 'hit_ja') // FIX ME: disable transform
            {
              return 1
            }
            break
        }
      },
      10: function (event)
      {
        const $ = this
        switch (event) {
          case 'state3_fly_crash':
            $.trans.set_wait(0)
            break
        }
      },
      11: function (event) // davis
      {
        const $ = this
        switch (event) {
          case 'state3_hit_stop':
            switch ($.frame.N) {
              // to fix many_punch
              case 271: case 276: case 280:
                $.effect_stuck(1, 2) // not stuck immediately but next frame (timein=1)
                $.trans.inc_wait(1)
                return 1
              case 273:
                $.effect_stuck(0, 2)
                return 1
            }
            break
          case 'state3_frame_force':
            switch ($.frame.N) {
              // to fix many_punch
              case 275: case 278: case 279:
                return 1 // disable pre update of force
            }
            break
        }
      }
    }

    const states_switch_dir = // whether to allow switch dir in each state
    {
      0: true,
      1: true,
      2: false,
      3: false,
      4: true,
      5: false,
      6: false,
      7: true,
      8: false,
      9: false,
      10: false,
      11: false,
      12: false,
      13: false,
      14: false,
      15: false,
      16: false
    }

    // inherit livingobject
    function character(config, data, thisID) {
      /* (function ()
      { //a small benchmark for make_array efficiency,
        //for deep and davis,
        //>>time to make_array of 1105 frames:15; x=33720
        //>>time to make_array of 1070 frames:15; x=29960
        var sta=new Date();
        var ccc=0;
        var x=0;
        var tags={'itr':'itr','bdy':'bdy'};
        for (var m=0; m<5; m++)
        for (var j in data.frame)
        {
          ccc++;
          for (var l in tags)
          {
            var obj = Futil.make_array(data.frame[j][l]);
            for (var k=0; k<obj.length; k++)
              x+=obj[k].x;
          }
        }
        var fin=new Date();
        console.log('time to make_array of '+ccc+' frames of '+data.bmp.name+':'+(fin-sta)+'; x='+x);
      }()); */

      const $ = this
      // chain constructor
      livingobject.call(this, config, data, thisID)
      if (typeof id_updates[$.id] === 'function') {
        $.id_update = id_updates[$.id]
      } else {
        $.id_update = id_updates.default
      }
      $.mech.floor_xbound = true
      $.con = config.controller
      $.combo_buffer =
      {
        combo: null,
        timeout: 0
      }
      if ($.con) {
        function combo_event(kobj) {
          const K = kobj.name
          switch (K) {
            case 'left': case 'right':
              if ($.allow_switch_dir) {
                $.switch_dir(K)
              }
          }
          if ($.combo_buffer.timeout === GC.combo.timeout &&
            priority[K] < priority[$.combo_buffer.combo]) { // combo clash in same frame, higher priority wins
          } else {
            $.combo_buffer.combo = K
            $.combo_buffer.timeout = GC.combo.timeout
          }
        }
        const dec_con = // combo detector
        {
          clear_on_combo: true,
          callback: combo_event // callback function when combo detected
        }
        let combo_list = [
          { name: 'left', seq: ['left'], clear_on_combo: false },
          { name: 'right', seq: ['right'], clear_on_combo: false },
          { name: 'up', seq: ['up'], clear_on_combo: false },
          { name: 'down', seq: ['down'], clear_on_combo: false },
          { name: 'def', seq: ['def'], clear_on_combo: false },
          { name: 'jump', seq: ['jump'], clear_on_combo: false },
          { name: 'att', seq: ['att'], clear_on_combo: false },
          { name: 'left-left', seq: ['left', 'left'], maxtime: 9 },
          { name: 'right-right', seq: ['right', 'right'], maxtime: 9 },
          { name: 'jump-att', seq: ['jump', 'att'], maxtime: 0, clear_on_combo: false }
          // plus those defined in Global.combo_list
          // priority grows downward
        ]
        combo_list = combo_list.concat(Global.combo_list)
        $.combodec = new Fcombodec($.con, dec_con, combo_list)
        var priority = {}
        for (let i = 0; i < combo_list.length; i++) {
          priority[combo_list[i].name] = i
        }
      }
      $.hold =
      {
        obj: null // holding weapon
      }
      $.health.bdefend = 0
      $.health.fall = 0
      $.health.hp = $.health.hp_full = $.health.hp_bound = $.proper('hp') || GC.default.health.hp_full
      $.health.hp_lost = 0
      $.health.mp_full = GC.default.health.mp_full
      $.health.mp = GC.default.health.mp_start
      $.health.mp_usage = 0
      $.stat =
      {
        attack: 0,
        picking: 0,
        kill: 0
      }
      $.counter = 
      {
        disappear_count : -1,
        dead_blink_count : -1,
      }
      $.transform_character = null
      $.trans.frame = function (next, au) {
        if (next === 0 || next === 999) {
          this.set_next(next, au)
          this.set_wait(0, au)
          return
        }
        const nextF = $.data.frame[next]
        if (!nextF) { return }
        // check if mp is enough
        let dmp = 0
        if (nextF.mp > 0) {
          dmp = nextF.mp % 1000
        }
        if ($.health.mp - dmp >= 0) {
          this.set_next(next, au)
          this.set_wait(0, au)
        }
      }
      $.setup()
    }
    character.prototype = new livingobject()
    character.prototype.constructor = character
    character.prototype.type = 'character'
    character.prototype.states = states
    character.prototype.states_switch_dir = states_switch_dir

    character.prototype.destroy = function () {
      const $ = this
      livingobject.prototype.destroy.call(this)
      // (handled by manager.js) remove combo listener to controller
    }

    // to emit a combo event
    character.prototype.combo_update = function () {
      /** different from `state_update`, current state receive the combo event first,
        and only if it returned falsy result, the combo event is passed to the generic state.
        if the combo event is not consumed, it is stored in state memory,
        resulting in 1 combo event being emited every frame until it is being handled or
        overridden by a new combo event.
        a combo event is emitted even when there is no combo, in such case `K=null`
        */

      const $ = this
      let K = $.combo_buffer.combo
      if (!K) { K = null }
      if ($.combo_buffer.combo === 'jump-att') { K = 'jump' }

      const tar1 = $.states[$.frame.D.state]
      if (tar1) { var res1 = tar1.call($, 'combo', K) }
      const tar2 = $.states.generic
      if (!res1) { if (tar2) { var res2 = tar2.call($, 'combo', K) } }
      if (tar1) { tar1.call($, 'post_combo') }
      if (tar2) { tar2.call($, 'post_combo') }
      if ($.combo_buffer.combo === 'jump-att') {
        if (res1 || res2) {
          $.combo_buffer.combo = 'att' // degrade
        }
      } else {
        if (res1 || res2 || // do not store if returned true
          K === 'left' || K === 'right' || K === 'up' || K === 'down') { // dir combos are not persistent
          $.combo_buffer.combo = null
        }
      }
    }

    /**
      @protocol caller hits callee
      @param ITR the itr object in data
      @param att reference of attacker
      @param attps position of attacker
      @param rect the hit rectangle where visual effects should appear
     */
    character.prototype.hit = function (ITR, att, attps, rect) {
      const $ = this
      if (!$.itr_vrest_test(att.uid)) { return false }

      let accepthit = false
      let defended = false
      let ef_dvx = 0; let ef_dvy = 0; let inj = 0
      if ($.state() === 10) // being caught
      {
        if ($.catching.caught_cpointhurtable()) {
          accepthit = true
          fall()
        }
        if ($.catching.caught_cpointhurtable() === 0 && $.catching !== att) { // I am unhurtable as defined by catcher,
          // and I am hit by attacker other than catcher
        } else {
          accepthit = true
          inj += Math.abs(ITR.injury)
          if (ITR.injury > 0) {
            $.effect_create(0, GC.effect.duration)
            let tar
            if (ITR.vaction) {
              tar = ITR.vaction
            } else {
              tar = (attps.x > $.ps.x) === ($.ps.dir === 'right') ? $.frame.D.cpoint.fronthurtact : $.frame.D.cpoint.backhurtact
            }
            $.trans.frame(tar, 20)
          }
        }
      } else if ($.state() === 14) {
        // lying
      } else if ($.state() === 19 && att.state() === 3000) {
        return false // firerun
      } else if (ITR.kind === undefined || // default
        ITR.kind === 0 || // normal
        ITR.kind === 4 || // falling
        ITR.kind === 9) // reflective shield
      {
        accepthit = true
        const compen = $.ps.y === 0 ? 1 : 0 // magic compensation
        const attdir = att.ps.vx === 0 ? att.dirh() : (att.ps.vx > 0 ? 1 : -1)
        ef_dvx = ITR.dvx ? attdir * (ITR.dvx - compen) : 0
        ef_dvy = ITR.dvy ? ITR.dvy : 0
        const effectnum = ITR.effect !== undefined ? ITR.effect : GC.default.effect.num

        if ($.state() === 13 && effectnum === 30) { // frozen characters are immune to effect 30 'weak ice'
          return false
        }

        if (($.state() === 18 || $.state() === 19) && (effectnum === 20 || effectnum === 21)) { // burning and firerun characters are immune to effect 20/21 'weak fire'
          return false
        }

        if ($.state() === 7 && // defend
          (attps.x > $.ps.x) === ($.ps.dir === 'right')) // attacked in front
        {
          if (ITR.injury) { inj += GC.defend.injury.factor * ITR.injury }
          if (ITR.bdefend) { $.health.bdefend += ITR.bdefend }
          if ($.health.bdefend > GC.defend.break_limit) { // broken defence
            $.trans.frame(112, 20)
          } else {  // an effective defence
            $.trans.frame(111, 20)
          }
          if (ef_dvx) { ef_dvx += (ef_dvx > 0 ? -1 : 1) * util.lookup_abs(GC.defend.absorb, ef_dvx) }
          ef_dvy = 0
          if ($.health.hp - inj <= 0) {
            falldown()
          } else {
            defended = true
          }
        } else {
          if ($.hold.obj && $.hold.obj.type === 'heavyweapon') {
            $.drop_weapon(0, 0)
          }
          if (ITR.injury) { inj += ITR.injury } // injury
          $.health.bdefend = 45 // lose defend ability immediately
          fall()
        }

        // effect
        let vanish = GC.effect.duration - 1
        switch ($.trans.next()) {
          case 111: vanish = 3; break
          case 112: vanish = 4; break
        }
        $.effect_create(effectnum, vanish, ef_dvx, ef_dvy)
        posteffect(effectnum)
      } else if (ITR.kind === 10 || ITR.kind === 11) {
        $.flute_force()
        if ($.state() === 12) {
          inj = ITR.injury * 2
          accepthit = true
        }
      } else if (ITR.kind === 15) {
        $.whirlwind_force(rect)
      } else if (ITR.kind === 16) {
        $.trans.frame(200, 38)
        inj = ITR.injury
        accepthit = true
      }
      function fall() {
        if (ITR.fall !== undefined) {
          $.health.fall += ITR.fall
        } else {
          $.health.fall += GC.default.fall.value
        }
        const fall = $.health.fall
        if ($.state() == 13) {
          falldown()
        } else if ($.ps.y < 0 || $.ps.vy < 0) {
          falldown()
        } else if ($.health.hp - inj <= 0) {
          falldown()
        } else if (fall > 0 && fall <= 20) {
          $.trans.frame(220, 20)
        } else if (fall > 20 && fall <= 30) {
          $.trans.frame(222, 20)
        } else if (fall > 30 && fall <= 40) {
          $.trans.frame(224, 20)
        } else if (fall > 40 && fall <= 60) {
          $.trans.frame(226, 20)
        } else if (GC.fall.KO < fall) {
          falldown()
        }
      }
      function falldown() {
        if (ITR.dvy === undefined) { ef_dvy = GC.default.fall.dvy }
        $.health.fall = 0
        $.ps.vy = 0
        const front = (attps.x > $.ps.x) === ($.ps.dir === 'right') // attacked in front
        if (front && ITR.dvx < 0 && ITR.bdefend >= 60) {
          $.trans.frame(186, 21)
        } else if (front) {
          $.trans.frame(180, 21)
        } else if (!front) {
          $.trans.frame(186, 21)
        }
      }
      function posteffect(effectnum) {
        if (defended) {
          switch (effectnum) {
            case 0: // normal hit
            case 1: // blood
              $.match.sound.play('1/002')
              break
          }
          return
        }
        switch (effectnum) {
          case 0: // normal hit
          case 1: // blood
            switch ($.trans.next()) {
              case 180: case 186:
                $.drop_weapon(ef_dvx, ef_dvy)
                break
            }
            $.visualeffect_create(effectnum, rect, (attps.x < $.ps.x), ($.health.fall > 0 ? 0 : 1), true)
            break
          case 2: // fire
          case 21:
          case 22:
          case 23:
            $.drop_weapon(ef_dvx, ef_dvy)
          case 20:
            $.trans.frame(203, 36)
            $.match.sound.play('1/070')
            break
          case 3: case 30: // ice
            $.drop_weapon(ef_dvx, ef_dvy)
            if ($.state() !== 13) {
              $.trans.frame(200, 38)
            } else {
              $.trans.frame(182, 21)
            }
            if ($.state() === 13) {
              $.match.sound.play('1/066')
            } else {
              $.match.sound.play('1/065')
            }
            break
          case 4:
            $.drop_weapon(ef_dvx, ef_dvy)
            break
        }
      }

      if (accepthit) {
        $.itr.attacker = att
        $.itr_vrest_update(att.uid, ITR)
      }
      $.injury(inj)
      if (accepthit) { return inj } else { return false }
    }
    character.prototype.injury = function (inj) {
      const $ = this
      $.health.hp -= inj
      $.health.hp_lost += inj
      $.health.hp_bound -= Math.ceil(inj * 1 / 3)
      if ($.is_npc && $.itr.attacker) {
        $.itr.attacker.offset_attack(inj)
      }
    }
    character.prototype.heal = function (amount) {
      this.effect.heal = amount
      return true
    }
    character.prototype.attacked = function (inj) {
      if (inj === true) { return true } else if (inj > 0) {
        if (this.is_npc && this.parent) {
          this.parent.stat.attack += inj
        } else {
          this.stat.attack += inj
        }
        return true
      }
    }
    character.prototype.offset_attack = function (inj) {
      this.stat.attack -= inj
    }
    character.prototype.killed = function () {
      if (this.is_npc) {
        this.parent.stat.kill++
      } else {
        this.stat.kill++
      }
    }
    character.prototype.die = function () {
      if (!this.is_npc) {
        this.itr.attacker.killed()
      }
    }

    // pre interaction is based on `itr` of next frame
    character.prototype.pre_interaction = function () {
      const $ = this
      const ITR_LIST = Futil.make_array($.trans.next_frame_D().itr)

      for (const i in ITR_LIST) {
        const ITR = ITR_LIST[i] // the itr tag in data
        // first check for what I have got into intersect with
        const vol = $.mech.volume(ITR)
        vol.zwidth = 0
        const hit = $.scene.query(vol, $, { tag: 'body' })

        switch (ITR.kind) {
          case 1: // catch
          case 3: // super catch
            for (var t in hit) {
              if (hit[t].team !== $.team) // only catch other teams
              {
                if (hit[t].type === 'character') // only catch characters
                {
                  if ((ITR.kind === 1 && hit[t].state() === 16) || // you are in dance of pain
                    (ITR.kind === 3)) // super catch
                  {
                    if (!$.itr.arest) {
                      const dir = hit[t].caught_a(ITR, $, { x: $.ps.x, y: $.ps.y, z: $.ps.z })
                      if (dir) {
                        $.itr_arest_update(ITR)
                        if (dir === 'front') {
                          $.trans.frame(ITR.catchingact[0], 10)
                        } else {
                          $.trans.frame(ITR.catchingact[1], 10)
                        }
                        $.catching = hit[t]
                        break
                      }
                    }
                  }
                }
              }
            }
            break

          case 7: // pick weapon easy
            if (!$.con.state.att) {
              break // only if att key is down
            }
          case 2: // pick weapon
            if (!$.hold.obj) {
              for (var t in hit) {
                if (!(ITR.kind === 7 && hit[t].type === 'heavyweapon')) // kind 7 cannot pick up heavy weapon
                {
                  if (hit[t].type === 'lightweapon' || hit[t].type === 'heavyweapon') {
                    if (hit[t].pick($)) {
                      $.stat.picking++
                      $.itr_arest_update(ITR)
                      if (ITR.kind === 2) {
                        if (hit[t].type === 'lightweapon') {
                          $.trans.frame(115, 10)
                        } else if (hit[t].type === 'heavyweapon') {
                          $.trans.frame(116, 10)
                        }
                      }
                      $.hold.obj = hit[t]
                      break
                    }
                  }
                }
              }
            }
            break
        }
      }
    }

    // post interaction is based on `itr` of current frame
    character.prototype.post_interaction = function () {
      const $ = this
      const ITR_LIST = Futil.make_array($.frame.D.itr)

      // TODO
      /* 某葉: 基本上會以先填入的itr為優先， 但在範圍重複、同effect的情況下的2組itr，
      攻擊時，會隨機指定其中一個itr的效果。
      （在範圍有部份重複或是完全重複的部份才有隨機效果。） */

      for (const i in ITR_LIST) {
        const ITR = ITR_LIST[i] // the itr tag in data
        // first check for what I have got into intersect with
        const vol = $.mech.volume(ITR)
        vol.zwidth = 0
        const hit = $.scene.query(vol, $, { tag: 'body' })

        switch (ITR.kind) {
          case 0: // normal attack
          case 4: // falling
            for (const t in hit) {
              let canhit = true
              switch (ITR.effect) {
                case 0: case 1:
                  if (hit[t].type === 'character' && hit[t].team === $.team) { // cannot attack characters of same team
                    canhit = false
                  }
                  break
                case 4:
                  if (!(hit[t].type !== 'character' && hit[t].state() === 3000)) { // reflect all specialattacks with state: 3000, has no influence on other characters
                    canhit = false
                  }
                  break
                case 21: case 22: // burning
                  if ($.state() === 18 && hit[t].team === $.team) { // cannot burn teammates
                    canhit = false
                  }
                case 20:
                  if (hit[t].type !== 'character') {
                    canhit = false
                  }
                  break
              }
              if (ITR.kind === 4) {
                if ($.itr.attacker.uid === hit[t].uid || // does not hit who blown you away
                  ($.itr.attacker.parent && $.itr.attacker.parent.uid === hit[t].uid) || // specialattack
                  ($.itr.attacker.hold && $.itr.attacker.hold.pre && $.itr.attacker.hold.pre.uid === hit[t].uid)) { // weapon
                  canhit = false
                }
              }
              if (canhit) {
                if (!$.itr.arest) {
                  if ($.attacked(hit[t].hit(ITR, $, { x: $.ps.x, y: $.ps.y, z: $.ps.z }, vol))) { // hit you!
                    $.itr_arest_update(ITR)
                    // stalls
                    if ($.state_update('hit_stop')) {
                      ; // do nothing
                    } else {
                      switch ($.frame.N) {
                        case 86: case 87: case 91:
                          $.effect_stuck(0, 2)
                          $.trans.inc_wait(1)
                          break
                        default:
                          $.effect_stuck(0, GC.default.itr.hit_stop)
                      }
                    }

                    // attack one enemy only
                    if (ITR.arest) { break }
                  }
                }
              }
            }
            break
        }
      }
    }

    character.prototype.wpoint = function () {
      const $ = this
      if ($.hold.obj) {
        if ($.frame.D.wpoint) {
          if ($.frame.D.wpoint.kind === 1) {
            const act = $.hold.obj.act($, $.frame.D.wpoint, $.mech.make_point($.frame.D.wpoint))
            if (act.thrown) {
              $.hold.obj = null
            }
            if (act.hit !== null && act.hit !== undefined) {
              $.itr_arest_update(act)
              // stalls
              $.trans.inc_wait(GC.default.itr.hit_stop, 10)
            }
          } else if ($.frame.D.wpoint.kind === 3) {
            $.drop_weapon()
          }
        }
      }
    }

    character.prototype.opoint = function () {
      const $ = this
      if ($.frame.D.opoint) {
        if ($.frame.D.opoint.oid === 5) { // create characters
          let players = [];
          const number_of_character = Math.floor(Math.abs($.frame.D.opoint.facing) / 10);
          for (let i = 0; i < number_of_character; i++) {
            players.push({
              name: '+man',
              controller: { type: 'AIscript', id: 4 },
              type: 'computer',
              id: $.id,
              team: $.team,
              pos: {x: $.ps.x + 20*(-1*i), y: $.ps.y, z: $.ps.z},
              spec: {
                is_npc: true,
                health: {
                  hp: 20,
                  hp_full: 20,
                  hp_bound: 20,
                  mp: 100,
                  mp_full: 100,
                },
                parent: $,
              },
              
            });
          }
          if (players.length > 0) {
            $.match.create_non_player_characters(players);
          }
          return;
        }
        const ops = Futil.make_array($.frame.D.opoint)
        for (const i in ops) {
          if (Math.abs(ops[i].facing) > 10) {
            $.match.create_multiple_objects(ops[i], $, Math.floor(ops[i].facing / 10), ops[i].dvz || 3)
          } else {
            $.match.create_object(ops[i], $)
          }
        }
      }
    }

    character.prototype.hold_weapon = function (wea) {
      const $ = this
      $.hold.obj = wea
    }

    character.prototype.drop_weapon = function (dvx, dvy) {
      const $ = this
      if ($.hold.obj) {
        $.hold.obj.drop(dvx, dvy)
        $.hold.obj = null
      }
    }

    /** inter-living objects protocol: catch & throw
      for details see http://f-lf2.blogspot.hk/2013/01/inter-living-object-interactions.html
     */
    character.prototype.caught_a = function (ITR, att, attps) { // this is called when the catcher has an ITR with kind: 1 or 3
      const $ = this
      if ((ITR.kind === 1 && $.state() === 16) || // I am in dance of pain
        (ITR.kind === 3)) // that is a super catch
      {
        if ((attps.x > $.ps.x) === ($.ps.dir === 'right')) {
          $.trans.frame(ITR.caughtact[0], 22)
        } else {
          $.trans.frame(ITR.caughtact[1], 22)
        }
        $.health.fall = 0
        $.catching = att
        $.itr.attacker = att
        $.drop_weapon()
        return (attps.x > $.ps.x) === ($.ps.dir === 'right') ? 'front' : 'back'
      }
    }
    character.prototype.caught_b = function (holdpoint, cpoint, adir, vdir) { // this is called when the catcher has a cpoint with kind: 1
      const $ = this
      $.caught_b_holdpoint = holdpoint
      $.caught_b_cpoint = cpoint
      $.caught_b_adir = adir
      $.caught_b_vdir = vdir
      // store this info and process it at TU
    }
    character.prototype.caught_cpointkind = function () {
      const $ = this
      return $.frame.D.cpoint ? $.frame.D.cpoint.kind : 0
    }
    character.prototype.caught_cpointhurtable = function () {
      const $ = this
      if ($.frame.D.cpoint && $.frame.D.cpoint.hurtable !== undefined) {
        return $.frame.D.cpoint.hurtable
      } else {
        return GC.default.cpoint.hurtable
      }
    }
    character.prototype.caught_throw = function (cpoint, vdir) {  // I am being thrown
      const $ = this
      if (cpoint.vaction !== undefined) {
        $.trans.frame(cpoint.vaction, 22)
      } else {
        $.trans.frame(GC.default.cpoint.vaction, 22)
      }
      $.caught_throwz = vdir
    }
    character.prototype.caught_release = function () {
      const $ = this
      $.catching = 0
      $.trans.frame(181, 22)
      $.effect.dvx = 3 // magic number
      $.effect.dvy = -3
      $.effect.timein = -1
      $.effect.timeout = 0
    }

    return character
  })
