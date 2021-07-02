/*\
 * sprite
 *
 * sprite-animator for LF2
\*/
define(['LF/sprite-select', 'core/animator'], function (Fsprite, Fanimator) {
  /*\
   * sprite
   [ class ]
   - bmp (object) data structure as defined in data files
   - parent (DOM node) where to append the new sprite
  \*/
  function sprite(bmp, parent) {
    /*\
     * sprite.num_of_images
     [ property ]
    \*/
    const num_of_images = this.num_of_images = bmp.file.length
    /*\
     * sprite.w
     [ property ]
     * width
    \*/
    /*\
     * sprite.h
     [ property ]
     * height
    \*/
    const w = this.w = bmp.file[0].w + 1
    const h = this.h = bmp.file[0].h + 1
    /*\
     * sprite.ani
     [ property ]
     - Fanimator (object)
    \*/
    const ani = this.ani = []
    /*\
     * sprite.dir
     [ property ]
     * `'left'` or `'right'`
    \*/
    this.dir = 'right'
    /*\
     * sprite.cur_img
     [ property ]
     * current image index
    \*/
    this.cur_img = 0

    const sp_con =
    {
      canvas: parent,
      wh: { w: w, h: h },
      img: {}
    }
    /*\
     * sprite.sp
     [ property ]
     - Fsprite (object)
    \*/
    const sp = this.sp = new Fsprite(sp_con)

    for (let i = 0; i < bmp.file.length; i++) {
      let imgpath = ''
      for (const j in bmp.file[i]) {
        if (typeof bmp.file[i][j] === 'string' &&
          j.indexOf('file') === 0) {
          imgpath = bmp.file[i][j]
        }
      }
      if (imgpath === '') {
        console.log('cannot find img path in data:\n' + JSON.stringify(bmp.file[i]))
      }
      sp.add_img(imgpath, i)

      const ani_con =
      {
        x: 0,
        y: 0, // top left margin of the frames
        w: bmp.file[i].w + 1,
        h: bmp.file[i].h + 1, // width, height of a frame
        gx: bmp.file[i].row,
        gy: bmp.file[i].col, // define a gx*gy grid of frames
        tar: sp, // target sprite
        borderleft: 0,
        bordertop: 0,
        borderright: 1,
        borderbottom: 1
      }
      ani.length++
      ani[i] = new Fanimator(ani_con)
    }
  }

  /*\
   * sprite.destroy
   [ method ]
   * clear memory so that itself and the DOM nodes can be garbage collected
  \*/
  sprite.prototype.destroy = function () {
    this.sp.remove()
    this.sp = null
    this.ani.length = 0
  }

  /*\
   * sprite.show_pic
   [ method ]
   - I (number) picture index to show
  \*/
  sprite.prototype.show_pic = function (I) {
    let slot = 0
    for (let k = 0; k < this.ani.length; k++) {
      const i = I - this.ani[k].config.gx * this.ani[k].config.gy
      if (i >= 0) {
        I = i
        slot++
      } else {
        break
      }
    }
    if (slot >= this.ani.length) {
      slot = this.ani.length - 1
      I = 999
    }
    this.cur_img = slot
    this.sp.switch_img(this.cur_img)
    this.ani[this.cur_img].set_frame(I)
    this.w = this.ani[this.cur_img].config.w
    this.h = this.ani[this.cur_img].config.h
  }
  /*\
   * sprite.switch_lr
   [ method ]
   * switch sprite direction
   - dir (string) `'left'` or `'right'`
  \*/
  sprite.prototype.switch_lr = function (dir) // switch to `dir`
  {
    if (dir !== this.dir) {
      this.dir = dir
      this.sp.set_flipx(dir === 'left')
    }
  }
  /*\
   * sprite.set_xy
   [ method ]
   - x (number)
   - y (number)
  \*/
  sprite.prototype.set_x_y = function (x, y) {
    this.sp.set_x_y(x, y)
  }
  /*\
   * sprite.set_z
   [ method ]
   - Z (number)
  \*/
  sprite.prototype.set_z = function (Z) {
    this.sp.set_z(Z)
  }
  /*\
   * sprite.show
   [ method ]
  \*/
  sprite.prototype.show = function () {
    this.sp.show()
  }
  /*\
   * sprite.hide
   [ method ]
  \*/
  sprite.prototype.hide = function () {
    this.sp.hide()
  }

  return sprite
})
