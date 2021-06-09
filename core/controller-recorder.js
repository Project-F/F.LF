define(['core/util'], function (F) // exports 2 classes `control_recorder` and `control_player` in an object
{
  /*\
   * control_recorder
   [ class ]
   * controller recorder to record activity of a controller
   - target_controller (object) target @controller
   * record format is:
   | [
   | //   { time,    key,    down }
   |      {"t":13,"k":"left","d":1} //,,,
   | ]
  \*/
  function control_recorder(target_controller) {
    this.time = 0
    this.rec = []
    target_controller.child.push(this)
  }

  /*\
   * control_recorder.key
   * supply keys to control_recorder
   [ method ]
   - k (string) key name
   - down (boolean)
  \*/
  control_recorder.prototype.key = function (k, down) {
    this.rec.push({ t: this.time, k: k, d: down })
  }
  /*\
   * control_recorder.frame
   * a tick of time
   [ method ]
   * for details see [http://project--f.blogspot.hk/2013/04/time-model-and-determinism.html](http://project--f.blogspot.hk/2013/04/time-model-and-determinism.html)
  \*/
  control_recorder.prototype.frame = function () {
    this.time += 1
  }
  /*\
   * control_recorder.export_str
   * export to JSON
   [ method ]
   = (string) JSON
  \*/
  control_recorder.prototype.export_str = function () {
    let str = ''
    str += '[\n'
    for (let i = 0; i < this.rec.length; i++) {
      if (i !== 0) { str += ',' }
      str += JSON.stringify(this.rec[i])
    }
    str += '\n]'
    this.rec = []
    return str
  }

  /*\
   * control_player
   * control player to playback activity of a controller
   [ class ]
   * compatible with @controller and please refer to controller for specification
   - control_config (object) config used for controller
   - record (array)
   * [example](http://tyt2y3.github.com/LFrelease/demo/milestone/2012June-min.html)
  \*/
  function control_player(control_config, record) {
    this.I = 0
    this.time = 0
    this.rec = record
    /*\
     * control_player.state
     - (object)
     [ property ]
    \*/
    this.state = F.extend_object({}, control_config)
    for (const j in this.state) { this.state[j] = 0 }
    /*\
     * control_player.child
     - (array)
     [ property ]
    \*/
    this.child = []
    /*\
     * control_player.sync
     - (boolean)
     [ property ]
    \*/
    this.sync = false
  }

  /*\
   * control_player.frame
   * a tick of time
   [ method ]
  \*/
  control_player.prototype.frame = function () {
    this.time++
    if (this.sync === false) { this.fetch() }
  }
  /*\
   * control_player.fetch
   [ method ]
  \*/
  control_player.prototype.fetch = function () {
    let I = this.I
    const rec = this.rec
    for (; rec[I].t <= this.time; I++) {
      for (const i in this.child) { this.child[i].key(rec[I].k, rec[I].d) }
      this.state[rec[I].k] = rec[I].d

      if (I === rec.length - 1) // loop
      { I = 0 }
    }
    this.I = I
  }
  /*\
   * control_player.clear_states
   [ method ]
  \*/
  control_player.prototype.clear_states = function () { }
  /*\
   * control_player.flush
   [ method ]
  \*/
  control_player.prototype.flush = function () { }

  return {
    control_recorder: control_recorder,
    control_player: control_player
  }
})
