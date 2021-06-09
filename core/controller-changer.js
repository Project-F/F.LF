// a key changer utility

define(['core/controller', 'core/util'], function (Fcontroller, Futil) {
  /*\
   * controller_changer
   [ class ]
   * a simplistic key changer for @controller
   - config (object)
   | config=
   | {
   | div, //DOM node
   | controller, //can be a single F.controller or an array of F.controllers
   |   //if it is an array, will create player1, player2 etc
   | onchange //function be called on change key
   | }
  \*/
  function keychanger(config) {
    let change_active = false
    const div = config.div
    let controllers = config.controller

    div.style.textAlign = 'center'

    controllers = Futil.make_array(controllers)
    for (let i = 0; i < controllers.length; i++) {
      add_player(controllers[i], i)
    }

    // the ok button
    const rule = create_at(div, 'div')
    rule.style.clear = 'both'
    /* var ok = create_at(div,'button');
    ok.innerHTML='close';
    ok.style.width='120px';
    ok.onclick= function()
    {
      div.style.display='none';
    } */

    function add_player(con, num) {
      if (num !== 0) {
        const sep = create_at(div, 'div')
        sep.style.float = 'left'
        sep.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'
      }

      const table = create_at(div, 'table')
      table.style.float = 'left'

      const row = []
      row[0] = create_at(table, 'tr')
      const head = add_cell(row[0], 'player ' + (num + 1))
      head.colSpan = '2'

      let i = 1
      for (const I in con.config) {
        row[i] = create_at(table, 'tr')
        add_pair(row[i], I)
        i++
      }

      function add_pair(R, name) {
        add_cell(R, name)
        const cell = add_cell(R, con.config[name])
        cell.style.cursor = 'pointer'
        cell.onclick = function () {
          if (!change_active) {
            change_active = true
            const This = this
            This.style.backgroundColor = '#FAA'
            const hold = window.onkeydown
            window.onkeydown = function (e) {
              if (!e) e = window.event
              const keycode = e.keyCode
              const keyname = Fcontroller.keycode_to_keyname(keycode)
              window.onkeydown = hold
              cell.innerHTML = keyname
              con.config[name] = keyname
              con.keycode[name] = keycode
              This.style.backgroundColor = '#EEE'
              change_active = false
              if (config.onchange) {
                config.onchange(con, name, keyname, keycode)
              }
            }
          }
        }
      }
    }

    function create_at(parent, tag, id) {
      const E = document.createElement(tag)
      parent.appendChild(E)
      if (id) { E.id = id }
      return E
    }

    function add_cell(row, content) {
      const td = create_at(row, 'td')
      td.innerHTML = content
      td.style.border = '1px solid #AAA'
      td.style.backgroundColor = '#EEE'
      td.style.fontFamily = 'monospace'
      td.style.width = '40px'
      td.style.textAlign = 'center'
      return td
    }
  }

  return keychanger
})
