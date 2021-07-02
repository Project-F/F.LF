/*\
 * scene
 *
 * scene in F.LF; keeps a list a characters and items
 | vol= //the volume format
 | {
 |  x, y, z, //the reference point
 |  vx, vy, w, h, //the volume defined with reference to (x,y,z)
 |  zwidth  //zwidth spans into the +ve and -ve direction
 | }
\*/

define(['core/util', 'core/collision'], function (Futil, Fcollision) {
  function scene(config) {
    this.live = {} // list of living objects
    this.uid = 0
  }

  scene.prototype.add = function (C) {
    this.uid++ // starts from 1
    C.uid = this.uid
    this.live[C.uid] = C
    return C.uid
  }

  scene.prototype.replace = function (target, by) {
    delete this.live[target.uid]
    this.live[target.uid] = by
    return target.uid
  }

  scene.prototype.remove = function (C) {
    const uid = C.uid
    delete this.live[C.uid]
    C.uid = -1
    return uid
  }

  /*\
   * scene.query
   [ method ]
   - volume (object)
   - exclude (object) or (array of objects)
   - where (object) what to intersect with
   * examples, can mixin the following properties
   | {tag:'body'} intersect with body
   | {tag:'itr:2'} intersect with itr kind:2
   | {type:'character'} with character only
   | {not_team:1} exclude team
   | {filter:function}
   | {sort:function} sort the result (ascending order) using the specified cost function
   = (array) all the objects whose volume intersect with the specified volume
  \*/
  scene.prototype.query = function (volume, exclude, where) {
    const result = []
    let tag = where.tag
    if (!tag) tag = 'body'
    let tagvalue = 0
    const tag_split = tag.split(':')
    tag = 'vol_' + tag_split[0]
    tagvalue = tag_split[1]

    for (const i in this.live) {
      let excluded = false
      if (exclude instanceof Array) {
        for (let ex = 0; ex < exclude.length; ex++) {
          if (this.live[i] === exclude[ex]) {
            excluded = true
            break
          }
        }
      } else if (exclude) {
        if (this.live[i] === exclude) {
          excluded = true
        }
      }
      if (excluded) {
        continue
      }

      if (where.team && this.live[i].team !== where.team) {
        continue
      }

      if (where.not_team && this.live[i].team === where.not_team) {
        continue
      }

      if (where.type && this.live[i].type !== where.type) {
        continue
      }

      if (where.not_type && this.live[i].type === where.not_type) {
        continue
      }

      if (where.filter && !where.filter(this.live[i])) {
        continue
      }

      if (volume === null) {
        result.push(this.live[i])
      } else if (this.live[i][tag]) {
        const vol = this.live[i][tag](tagvalue)
        for (let j = 0; j < vol.length; j++) {
          if (this.intersect(volume, vol[j])) {
            result.push(this.live[i])
            break
          }
        }
      }
    }
    if (where.sort) {
      if (where.sort === 'distance' && !(exclude instanceof Array)) { // sort according to distance from exclude
        where.sort = function (obj) {
          const dx = obj.ps.x - exclude.ps.x
          const dz = obj.ps.z - exclude.ps.z
          return Math.sqrt(dx * dx + dz * dz)
        }
      }
      result.sort(function (a, b) {
        return where.sort(a) - where.sort(b) // ascending order
      })
    }
    return result
  }

  // return true if volume A and B intersect
  scene.prototype.intersect = function (A, B) {
    // less garbage version
    const A_left = A.x + A.vx; const A_top = A.y + A.vy; const A_right = A.x + A.vx + A.w; const A_bottom = A.y + A.vy + A.h
    const B_left = B.x + B.vx; const B_top = B.y + B.vy; const B_right = B.x + B.vx + B.w; const B_bottom = B.y + B.vy + B.h

    return (Fcollision.rect_flat(
      A_left, A_top, A_right, A_bottom,
      B_left, B_top, B_right, B_bottom) &&
      Fcollision.rect_flat(
        A.z - A.zwidth, 0, A.z + A.zwidth, 1,
        B.z - B.zwidth, 0, B.z + B.zwidth, 1)
    )
  }
  scene.prototype.intersect_old = function (A, B) {
    const AV = { left: A.x + A.vx, top: A.y + A.vy, right: A.x + A.vx + A.w, bottom: A.y + A.vy + A.h }
    const BV = { left: B.x + B.vx, top: B.y + B.vy, right: B.x + B.vx + B.w, bottom: B.y + B.vy + B.h }

    return (Fcollision.rect(AV, BV) && Fcollision.rect(
      { left: A.z - A.zwidth, top: 0, right: A.z + A.zwidth, bottom: 1 },
      { left: B.z - B.zwidth, top: 0, right: B.z + B.zwidth, bottom: 1 }
    ))
  }

  // return the distance between object A and B, as measured at center points
  scene.prototype.distance = function (A, B) {
    const dx = (A.x + A.centerx) - (B.x + B.centerx)
    const dy = A.y - B.y
    const dz = (A.z + A.centery) - (B.z + B.centery)

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  return scene
})
