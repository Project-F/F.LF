/*\
 * mechanics
 *
 * mechanical properties that all living objects should have
 * performance:
 *  - objects are being created on every call of `body`
\*/

define(['LF/global'], function (Global) {
  const GC = Global.gameplay

  /*\
   * mech
   [ class ]
   * mech is a state-less helper class that processes most of the mechanics of living objects
  \*/
  function mech(parent) {
    const spec = parent.match.spec
    if (spec[parent.id] && spec[parent.id].mass !== undefined && spec[parent.id].mass !== null) {
      this.mass = spec[parent.id].mass
    } else {
      this.mass = Global.gameplay.default.machanics.mass
    }

    this.ps
    this.sp = parent.sp
    this.frame = parent.frame
    this.parent = parent
    this.vol_body = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, length: 0, empty_data: {}, max: 6 }
    this.bg = parent.bg
    this.sha = parent.shadow
  }

  // return the array of volume of the current frame, that volume can be bdy,itr or other
  mech.prototype.body = function (obj, filter, offset) {
    const ps = this.ps
    const sp = this.sp
    const off = offset
    if (!obj) {
      obj = this.frame.D.bdy
    }
    // if parent object is in `super` effect, returns no body volume
    if (obj === this.frame.D.bdy && this.parent.effect.super) {
      return this.body_empty()
    }
    // if meets certain criteria (as in most cases), will use optimized version
    if (obj === this.frame.D.bdy && !filter && (!(obj instanceof Array) || obj.length <= this.vol_body.max)) {
      return this.body_body(offset)
    }

    if (obj instanceof Array) { // many bdy
      if (!filter && obj.length === 2) { // unroll the loop
        return ([this.volume(obj[0], off),
        this.volume(obj[1], off)
        ])
      } else if (!filter && obj.length === 3) { // unroll the loop
        return ([this.volume(obj[0], off),
        this.volume(obj[1], off),
        this.volume(obj[2], off)
        ])
      } else {
        const B = []
        for (const i in obj) {
          if (!filter || filter(obj[i])) { B.push(this.volume(obj[i], off)) }
        }
        return B
      }
    } else { // 1 bdy only
      if (!filter || filter(obj)) {
        return [this.volume(obj, off)]
      } else {
        return []
      }
    }
  }

  // returns a pseudo array with zero element
  mech.prototype.body_empty = function () {
    this.vol_body.length = 0
    return this.vol_body
  }

  // a slightly optimized version, creating less new objects
  mech.prototype.body_body = function (V) {
    const O = this.frame.D.bdy
    const ps = this.ps
    const sp = this.sp

    if (!O) { // no bdy
      var B = this.vol_body[0]
      if (V) {
        B.x = V.x
        B.y = V.y
        B.z = V.z
      } else {
        B.x = ps.sx
        B.y = ps.sy
        B.z = ps.sz
      }
      B.vx = 0
      B.vy = 0
      B.w = 0
      B.h = 0
      B.zwidth = 0
      B.data = this.vol_body.empty_data
      this.vol_body.length = 1
    } else if (O instanceof Array) {  // many bdy
      for (let i = 0; i < O.length; i++) {
        var B = this.vol_body[i]
        var vx = O[i].x
        if (ps.dir === 'left') {
          vx = sp.w - O[i].x - O[i].w
        }
        if (V) {
          B.x = ps.sx + V.x
          B.y = ps.sy + V.y
          B.z = ps.sz + V.z
        } else {
          B.x = ps.sx
          B.y = ps.sy
          B.z = ps.sz
        }
        B.vx = vx
        B.vy = O[i].y
        B.w = O[i].w
        B.h = O[i].h
        B.zwidth = O[i].zwidth ? O[i].zwidth : GC.default.itr.zwidth
        B.data = O[i]
      }
      this.vol_body.length = O.length
    } else {  // 1 bdy only
      var B = this.vol_body[0]
      var vx = O.x
      if (ps.dir === 'left') { vx = sp.w - O.x - O.w }
      if (V) {
        B.x = ps.sx + V.x
        B.y = ps.sy + V.y
        B.z = ps.sz + V.z
      } else {
        B.x = ps.sx
        B.y = ps.sy
        B.z = ps.sz
      }
      B.vx = vx
      B.vy = O.y
      B.w = O.w
      B.h = O.h
      B.zwidth = O.zwidth ? O.zwidth : GC.default.itr.zwidth
      B.data = O
      this.vol_body.length = 1
    }
    return this.vol_body
  }

  /** make a `volume` that is compatible with `scene` query
    param O volume in data
    param V offset
   */
  mech.prototype.volume = function (O, V) {
    const ps = this.ps
    const sp = this.sp

    if (!O) {
      if (!V) {
        return {
          x: ps.sx,
          y: ps.sy,
          z: ps.sz,
          vx: 0,
          vy: 0,
          w: 0,
          h: 0,
          zwidth: 0,
          data: {}
        }
      } else {
        return {
          x: V.x,
          y: V.y,
          z: V.z,
          vx: 0,
          vy: 0,
          w: 0,
          h: 0,
          zwidth: 0,
          data: {}
        }
      }
    }

    let vx = O.x
    if (ps.dir === 'left') {
      vx = sp.w - O.x - O.w
    }

    if (!V) {
      return {
        x: ps.sx,
        y: ps.sy,
        z: ps.sz,
        vx: vx,
        vy: O.y,
        w: O.w,
        h: O.h,
        zwidth: O.zwidth ? O.zwidth : GC.default.itr.zwidth,
        data: O
      }
    } else {
      return {
        x: ps.sx + V.x,
        y: ps.sy + V.y,
        z: ps.sz + V.z,
        vx: vx,
        vy: O.y,
        w: O.w,
        h: O.h,
        zwidth: O.zwidth ? O.zwidth : GC.default.itr.zwidth,
        data: O
      }
    }
  }

  mech.prototype.make_point = function (a, prefix) {
    const ps = this.ps
    const sp = this.sp

    if (a && !prefix) {
      if (ps.dir === 'right') {
        return { x: ps.sx + a.x, y: ps.sy + a.y, z: ps.sz + a.y }
      } else {
        return { x: ps.sx + sp.w - a.x, y: ps.sy + a.y, z: ps.sz + a.y }
      }
    } else if (a && prefix) {
      if (ps.dir === 'right') {
        return { x: ps.sx + a[prefix + 'x'], y: ps.sy + a[prefix + 'y'], z: ps.sz + a[prefix + 'y'] }
      } else {
        return { x: ps.sx + sp.w - a[prefix + 'x'], y: ps.sy + a[prefix + 'y'], z: ps.sz + a[prefix + 'y'] }
      }
    } else {
      console.log('mechanics: make point failed')
      return { x: ps.sx, y: ps.sy, z: ps.sz }
    }
  }

  // move myself *along xz* to coincide point a with point b such that point b is a point of myself
  mech.prototype.coincideXZ = function (a, b) {
    const ps = this.ps
    const sp = this.sp
    const fD = this.frame.D

    const vx = a.x - b.x
    const vz = a.z - b.z
    ps.x += vx
    ps.z += vz
    ps.sx = ps.dir === 'right' ? (ps.x - fD.centerx) : (ps.x + fD.centerx - sp.w)
  }

  // move myself *along xy* to coincide point a with point b such that point b is a point of myself
  mech.prototype.coincideXY = function (a, b) {
    const ps = this.ps
    const sp = this.sp
    const fD = this.frame.D

    const vx = a.x - b.x
    const vy = a.y - b.y
    ps.x += vx
    ps.y += vy
    ps.sx = ps.dir === 'right' ? (ps.x - fD.centerx) : (ps.x + fD.centerx - sp.w)
    ps.sy = ps.y - fD.centery
  }

  mech.prototype.create_metric = function () {
    this.ps = {
      sx: 0,
      sy: 0,
      sz: 0, // sprite origin, read-only
      x: 0,
      y: 0,
      z: 0, // feet position as in centerx,centery
      vx: 0,
      vy: 0,
      vz: 0, // velocity
      zz: 0, // z order deviation
      dir: 'right', // direction
      fric: 1 // factor of friction
    }
    return this.ps
  }

  mech.prototype.reset = function () {
    const ps = this.ps
    ps.sx = 0; ps.sy = 0; ps.sz = 0
    ps.x = 0; ps.y = 0; ps.z = 0
    ps.vx = 0; ps.vy = 0; ps.vz = 0
    ps.zz = 0
    ps.dir = 'right'
    ps.fric = 1
  }

  // place the feet position of the object at x,y,z
  mech.prototype.set_pos = function (x, y, z) {
    const ps = this.ps
    const sp = this.sp
    const fD = this.frame.D

    ps.x = x; ps.y = y; ps.z = z
    if (ps.z < this.bg.zboundary[0]) { // z bounding
      ps.z = this.bg.zboundary[0]
    }
    if (ps.z > this.bg.zboundary[1]) {
      ps.z = this.bg.zboundary[1]
    }

    ps.sx = ps.dir === 'right' ? (ps.x - fD.centerx) : (ps.x + fD.centerx - sp.w)
    ps.sy = y - fD.centery
    ps.sz = z
  }

  mech.prototype.dynamics = function () {
    const ps = this.ps
    const sp = this.sp
    const fD = this.frame.D
    const GC = Global.gameplay

    if (!this.blocking_xz()) {
      ps.x += ps.vx
      ps.z += ps.vz
    } else {  // blocked by obstacle
      ps.x += ps.vx * 0.1
      ps.z += ps.vz * 0.1
    }
    if (this.floor_xbound) {
      if (ps.x < 0) {
        ps.x = 0
      }
      if (ps.x > this.bg.width) {
        ps.x = this.bg.width
      }
    }
    if (ps.z < this.bg.zboundary[0]) { // z bounding
      ps.z = this.bg.zboundary[0]
    }
    if (ps.z > this.bg.zboundary[1]) {
      ps.z = this.bg.zboundary[1]
    }

    ps.y += ps.vy

    ps.sx = ps.dir === 'right' ? (ps.x - fD.centerx) : (ps.x + fD.centerx - sp.w)
    ps.sy = ps.y - fD.centery
    ps.sz = ps.z

    if (ps.y > 0) { // never below the ground
      ps.y = 0
      ps.sy = ps.y - fD.centery
    }

    sp.set_x_y(Math.floor(ps.sx), Math.floor(ps.sy + ps.sz)) // projection onto screen
    sp.set_z(Math.floor(ps.sz + ps.zz)) // z ordering
    if (this.sha) {
      this.sha.set_x_y(Math.floor(ps.x - this.bg.shadow.x), Math.floor(ps.z - this.bg.shadow.y))
      this.sha.set_z(Math.floor(ps.sz - 1))
    }

    if (ps.y === 0 && this.mass > 0) // only when on the ground
    {
      // simple friction
      if (ps.vx) { ps.vx += (ps.vx > 0 ? -1 : 1) * ps.fric }
      if (ps.vz) { ps.vz += (ps.vz > 0 ? -1 : 1) * ps.fric }
      if (ps.vx !== 0 && ps.vx > -GC.min_speed && ps.vx < GC.min_speed) { ps.vx = 0 } // defined minimum speed
      if (ps.vz !== 0 && ps.vz > -GC.min_speed && ps.vz < GC.min_speed) { ps.vz = 0 }
    }

    if (ps.y < 0) {
      ps.vy += this.mass * GC.gravity
    }
  }

  mech.prototype.unit_friction = function () {
    const ps = this.ps
    if (ps.y === 0) // only when on the ground
    {
      if (ps.vx) { ps.vx += (ps.vx > 0 ? -1 : 1) }
      if (ps.vz) { ps.vz += (ps.vz > 0 ? -1 : 1) }
    }
  }

  mech.prototype.linear_friction = function (x, z) {
    const ps = this.ps
    if (x && ps.vx) { ps.vx += ps.vx > 0 ? -x : x }
    if (z && ps.vz) { ps.vz += ps.vz > 0 ? -z : z }
  }

  // return true if there is a blocking itr:kind:14 ahead
  mech.prototype.blocking_xz = function () {
    const offset = {
      x: this.ps.vx,
      y: 0,
      z: this.ps.vz
    }

    if (this.parent.type !== 'character') {
      return false
    }

    const body = this.body(null, null, offset)
    for (let i = 0; i < body.length; i++) {
      body[i].zwidth = 0
      const result = this.parent.scene.query(body[i], this.parent, { tag: 'itr:14' })
      if (result.length > 0) {
        return true
      }
    }
  }

  mech.prototype.project = function () {
    const ps = this.ps
    const sp = this.sp
    sp.set_x_y(ps.sx, ps.sy + ps.sz) // projection onto screen
    sp.set_z(ps.sz + ps.zz) // z ordering
  }

  mech.prototype.speed = function () {
    const ps = this.ps
    return Math.sqrt(ps.vx * ps.vx + ps.vy * ps.vy)
  }

  return mech
})
