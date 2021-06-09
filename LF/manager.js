define(['LF/global', 'LF/network', 'LF/soundpack', 'LF/match', 'LF/util', 'LF/touchcontroller', 'third_party/random',
  'core/util', 'LF/sprite-select', 'core/sprite-dom', 'core/animator', 'core/controller', 'core/resourcemap', 'core/support'],
  function (global, network, Soundpack, Match, util, Touchcontroller, Random,
    Futil, Fsprite, Fsprite_dom, Fanimator, Fcontroller, Fresourcemap, Fsupport) {
    function Manager(pack, buildinfo) {
      const param = util.location_parameters()

      const sel = pack.data.UI.data.character_selection
      let char_list,
        img_list,
        AI_list,
        bg_list,
        diff_list,
        timer,
        randomseed,
        resourcemap
      const manager = this
      let settings
      let session
      let controllers
      let window_state

      this.create = function () {
        require(['core/css!' + pack.path + 'UI/UI.css'], function () { })

        // window sizing
        window_state =
        {
          maximized: false,
          wide: false,
          allow_wide: false
        }
        function onresize() {
          if (window.innerWidth < global.application.window.outer_width ||
            window.innerHeight < global.application.window.outer_height) {
            if (!window_state.maximized) {
              util.div('maximize_button').onclick()
            }
          }
          resizer()
        }
        function getFeature(from, feature) {
          function cap(a) {
            return a.charAt(0).toUpperCase() + a.substr(1)
          }
          const val = from[feature] || from[Fsupport.prefix_js + cap(feature)]
          if (typeof val === 'function') {
            return val.bind(from)
          }
          return val
        }
        util.div('maximize_button').onclick = function () {
          if (Fsupport.css2dtransform) {
            if (window.innerWidth < 400 || window.innerHeight < 400) {
              var fullscreen = getFeature(document.body, 'requestFullscreen')
              var fullscreen_state = getFeature(document, 'fullscreenElement')
            }
            if (!window_state.maximized || (fullscreen && !fullscreen_state)) {
              if (fullscreen) {
                fullscreen()
              }
              window_state.maximized = true
              document.body.style.background = manager.UI_list[manager.active_UI].bgcolor || '#676767'
              this.firstChild.innerHTML = '&#9724;'
              util.container.classList.add('maximized')
              util.div('extra_UI').classList.add('maximized')
              resizer()
            } else {
              const exit_fullscreen = getFeature(document, 'exitFullscreen')
              if (exit_fullscreen) {
                exit_fullscreen()
              }
              this.firstChild.innerHTML = '&#9723;'
              util.container.classList.remove('maximized')
              util.div('extra_UI').classList.remove('maximized')
              document.body.style.background = ''
              resizer(1)
              window_state.maximized = false
              if (window_state.wide) {
                window_state.wide = false
                util.container.classList.remove('wideWindow')
                if (util.div('canvas').width) {
                  const owidth = global.application.window.width
                  util.div('canvas').width = owidth
                  util.div('canvas').style.left = 0
                  manager.canvas.set_x_y(0, 0)
                  manager.canvas.set_w(owidth)
                }
                manager.background_layer.set_x_y(0, 0)
                manager.panel_layer.set_alpha(1.0)
                manager.canvas.render()
              }
            }
          }
        }
        util.div('alert_box_ok').onclick = function () {
          hide(util.div('alert_box'))
        }
        manager.alert = function (mess) {
          console.error(mess)
          util.div('alert_message').innerHTML = mess
          show(util.div('alert_box'))
        }
        hide(util.div('alert_box'))

        session =
        {
          network: false,
          control: null,
          player: []
        }

        const settings_format_version = 1.00002
        settings =
        {
          version: settings_format_version,
          control:
            [
              {
                type: 'keyboard',
                config: { up: 'w', down: 'x', left: 'a', right: 'd', def: 'z', jump: 'q', att: 's' }
              },
              {
                type: 'keyboard',
                config: { up: 'u', down: 'm', left: 'h', right: 'k', def: ',', jump: 'i', att: 'j' }
              }
            ],
          player:
            [
              { name: 'player1' }, { name: 'player2' }
            ],
          server:
          {
            'Project F Official Lobby': 'http://lobby.projectf.hk'
          },
          support_sound: false
        }
        if (Fsupport.localStorage) {
          if (Fsupport.localStorage.getItem('F.LF/settings')) {
            const obj = JSON.parse(Fsupport.localStorage.getItem('F.LF/settings'))
            if (obj.version === settings_format_version) {
              settings = obj
            }
          }
        }
        for (var i = 0; i < settings.player.length; i++) {
          session.player[i] = settings.player[i]
        }

        // touch
        document.addEventListener('touchstart', ontouch, false)
        function ontouch() {
          settings.control[0].type = 'touch'
          session.control[0] = controllers.touch.c
          session.control.f = controllers.touch.f
          document.removeEventListener('touchstart', ontouch, false)
        }

        // control
        const functionkey_config = { esc: 'esc', F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10' }
        controllers =
        {
          keyboard:
          {
            c0: new Fcontroller(settings.control[0].config),
            c1: new Fcontroller(settings.control[1].config),
            f: new Fcontroller(functionkey_config)
          },
          touch:
          {
            c: new Touchcontroller({ layout: 'gamepad' }),
            f: new Touchcontroller({ layout: 'functionkey' })
          }
        }
        controllers.touch.c.hide()
        controllers.touch.f.hide()
        session.control =
        {
          f: controllers.keyboard.f,
          length: 2,
          my_offset: 0
        }
        for (var i = 0; i < session.control.length; i++) {
          switch (settings.control[i].type) {
            case 'keyboard':
              session.control[i] = controllers.keyboard['c' + i]
              break
            case 'touch':
              session.control[i] = controllers.touch.c
              session.control.f = controllers.touch.f
              console.log(session.control.f.type)
              break
          }
        }

        // setup resource map
        util.organize_package(pack)
        resourcemap = new Fresourcemap(util.setup_resourcemap(pack))
        Fsprite.masterconfig_set('resourcemap', resourcemap)
        Fsprite_dom.masterconfig_set('resourcemap', resourcemap)

        // icon
        const icon = document.createElement('link')
        icon.rel = 'icon'
        icon.href = Fsprite.resolve_resource(pack.data.icon)
        document.head.appendChild(icon)

        // sound
        if (!settings.support_sound) {
          manager.sound = new Soundpack(null)
          Soundpack.support(function (features) {
            settings.support_sound = true
            setup_sound()
          })
        } else {
          setup_sound()
        }
        function setup_sound() {
          manager.sound = new Soundpack({
            packs: pack.data.sound,
            resourcemap: resourcemap
          })
        }

        // rand
        manager.random = function () {
          return randomseed.next()
        }
        randomseed = new Random()
        randomseed.seed(824163532)

        // prepare
        char_list = util.select_from(pack.data.object, { type: 'character' })
        char_list[-1] = { name: 'Random' }
        img_list = Futil.extract_array(char_list, 'pic').pic
        img_list.waiting = sel.waiting.pic
        img_list[-1] = pack.data.UI.data.character_selection.random.pic
        AI_list = pack.data.AI.slice(0)
        AI_list[-1] = { name: 'Random' }
        bg_list = pack.data.background.slice(0)
        bg_list[-1] = { name: 'Random' }
        diff_list = ['Easy', 'Normal', 'Difficult']

        this.create_UI()
        if (param.demo) {
          this.start_demo(true)
        } else if (param.demo_display) {
          this.start_demo(false)
          util.div('maximize_button').onclick()
        } else if (param.debug) {
          this.start_debug()
        } else {
          this.switch_UI('frontpage')
        }

        if (param.debug_a) {
          this.network_debug('active')
        }
        if (param.debug_b) {
          this.network_debug('passive')
        }
        //
        window.addEventListener('resize', onresize, false)
        onresize()
      }
      function create_network_controllers(server, param) {
        const handler = {
          on: function (event, mess) {
            switch (event) {
              case 'open':
                var controller_config = { up: 'w', down: 'x', left: 'a', right: 'd', def: 'z', jump: 'q', att: 's' }
                if (param.role === 'active') {
                  session.control[0] = new network.controller('local', session.control[0])
                  session.control[1] = new network.controller('local', session.control[1])
                  session.control[2] = new network.controller('remote', controller_config)
                  session.control[3] = new network.controller('remote', controller_config)
                  session.control.length = 4
                  session.control.f = new network.controller('dual', session.control.f)
                } else if (param.role === 'passive') {
                  const hold0 = session.control[0]
                  const hold1 = session.control[1]
                  session.control[2] = new network.controller('local', hold0)
                  session.control[3] = new network.controller('local', hold1)
                  session.control[0] = new network.controller('remote', controller_config)
                  session.control[1] = new network.controller('remote', controller_config)
                  session.control.my_offset = 2
                  session.control.length = 4
                  session.control.f = new network.controller('dual', session.control.f)
                }
                network.transfer(
                  'session', // name
                  function () { // send
                    return {
                      buildversion: buildinfo.version,
                      player: settings.player
                    }
                  },
                  function (info) { // receive
                    if (buildinfo.version !== info.buildversion) {
                      manager.alert('Your program version (' + buildinfo.timestamp + ') is incompatible with your peer (' + info.buildversion + '). Please reload.')
                    }
                    if (param.role === 'active') {
                      session.player[0] = settings.player[0]
                      session.player[1] = settings.player[1]
                      session.player[2] = info.player[0]
                      session.player[3] = info.player[1]
                    } else if (param.role === 'passive') {
                      session.player[0] = info.player[0]
                      session.player[1] = info.player[1]
                      session.player[2] = settings.player[0]
                      session.player[3] = settings.player[1]
                    }
                    manager.UI_list.settings.keychanger.call(manager.UI_list.settings)
                    util.div('network_game_cancel').innerHTML = 'OK'
                  })
                break
              case 'close':
                manager.alert('peer disconnected')
                break
              case 'log':
                console.log(mess)
                util.div('network_log').value += mess + '\n'
                break
              case 'error':
                manager.alert(mess)
                break
              case 'sync_error':
                manager.alert('FATAL: synchronization error')
                break
            }
          }
        }
        network.setup({
          server: server,
          param: param
        }, handler)
      }
      this.UI_list =
      {
        frontpage:
        {
          bgcolor: pack.data.UI.data.frontpage.bg_color,
          create: function () {
            new Fsprite_dom({
              canvas: util.div('frontpage_content'),
              img: pack.data.UI.data.frontpage.pic,
              wh: 'fit'
            })
            this.dialog = new vertical_menu_dialog({
              canvas: util.div('frontpage_content'),
              data: pack.data.UI.data.frontpage_dialog,
              mousehover: true,
              onclick: function (I) {
                if (I === 0) {
                  manager.start_game()
                } else if (I === 1) {
                  if (window.location.href.indexOf('http') === 0) {
                    manager.switch_UI('network_game')
                  } else {
                    manager.alert('network game must run under http://')
                  }
                } else if (I === 2) {
                  manager.switch_UI('settings')
                }
              }
            })
          },
          onactive: function () {
            this.demax(!window_state.maximized)
          },
          deactive: function () {
            this.demax(true)
          },
          demax: function (demax) {
            if (!demax) // maximize
            {
              var holder = util.div('frontpage')
              holder.parentNode.removeChild(holder)
              holder.classList.add('maximized')
              util.root.insertBefore(holder, util.root.firstChild)
              hide(util.div('window'))
              const canx = window.innerWidth / 2 - parseInt(window.getComputedStyle(util.div('frontpage_content'), null).getPropertyValue('width')) / 2
              if (canx < 0) {
                util.div('frontpage_content').style.left = canx + 'px'
              }
            } else // demaximize
            {
              var holder = util.div('frontpage')
              holder.parentNode.removeChild(holder)
              holder.classList.remove('maximized')
              util.div('window').insertBefore(holder, util.div('window').firstChild)
              show(util.div('window'))
              util.div('frontpage_content').style.left = ''
            }
          }
        },
        settings:
        {
          bgcolor: pack.data.UI.data.settings.bg_color,
          create: function () {
            new Fsprite_dom({
              canvas: util.div('settings'),
              img: pack.data.UI.data.settings.pic,
              wh: 'fit'
            })
            new vertical_menu_dialog({
              canvas: util.div('settings'),
              data: pack.data.UI.data.settings.ok_button,
              mousehover: true,
              onclick: function (I) {
                manager.switch_UI('frontpage')
              }
            })
            this.keychanger.call(this)
          },
          keychanger: function () {
            var keychanger = util.div('keychanger')
            if (keychanger) {
              keychanger.parentNode.removeChild(keychanger)
            }
            var keychanger = document.createElement('div')
            keychanger.className = 'keychanger'
            util.div('settings').appendChild(keychanger)
            const brbr = create_at(keychanger, 'br')
            const table = create_at(keychanger, 'table')
            const row = []
            let change_active = false
            const column = this.column = []

            table.style.display = 'inline-block'
            for (var i = 0; i < 9; i++) {
              row[i] = create_at(table, 'tr')
            }
            var i = 0
            left_cell(row[i++], 'name')
            left_cell(row[i++], 'type')
            for (const I in settings.control[0].config) {
              left_cell(row[i++], I)
            }
            for (var i = 0; i < session.control.length; i++) {
              column[i] = new Control(i)
            }

            function Control(num) {
              const This = this
              const name = right_cell(row[0], '')
              const type = right_cell(row[1], '')
              const cells = {}
              let i = 2
              for (const I in settings.control[0].config) {
                cells[I] = add_changer(row[i++], I)
              }
              this.update = update
              update()
              if (session.control[num].role === undefined) {
                name.onclick = function () {
                  name.innerHTML = settings.player[num - session.control.my_offset].name = (prompt('Enter player name:', name.innerHTML) || name.innerHTML)
                }
                type.onclick = function () {
                  if (session.control[num].type === 'keyboard') { // switch to touch
                    settings.control[num].type = 'touch'
                    session.control[num] = controllers.touch.c
                    session.control.f = controllers.touch.f
                  } else { // switch to keyboard
                    settings.control[num].type = 'keyboard'
                    session.control[num] = controllers.keyboard['c' + num]
                    session.control.f = controllers.keyboard.f
                  }
                  update()
                }
              }
              function add_changer(R, name) {
                const cell = right_cell(R, '')
                let target
                cell.onclick = function () {
                  if (session.control[num].type === 'keyboard') {
                    if (!change_active) {
                      change_active = true
                      target = this
                      target.style.color = '#000'
                      target.style.backgroundColor = '#FFF'
                      document.addEventListener('keydown', keydown, true)
                    } else {
                      if (target) {
                        target.style.color = ''
                        target.style.backgroundColor = ''
                        target = null
                        change_active = false
                      }
                      document.removeEventListener('keydown', keydown, true)
                    }
                  }
                }
                function keydown(e) {
                  const con = session.control[num]
                  if (!e) { e = window.event }
                  const value = e.keyCode
                  cell.innerHTML = Fcontroller.keycode_to_keyname(value)
                  con.config[name] = Fcontroller.keycode_to_keyname(value)
                  con.keycode[name] = value
                  target.style.color = ''
                  target.style.backgroundColor = ''
                  change_active = false
                  document.removeEventListener('keydown', keydown, true)
                }
                return cell
              }
              function update() {
                const con = session.control[num]
                name.innerHTML = session.player[num].name
                type.innerHTML = con.role === 'remote' ? 'network' : con.type
                for (const I in cells) {
                  if (con.type === 'keyboard') {
                    cells[I].innerHTML = con.config[I]
                  } else {
                    cells[I].innerHTML = '-'
                  }
                }
              }
            }

            function create_at(parent, tag, id) {
              const E = document.createElement(tag)
              parent.appendChild(E)
              if (id) {
                E.id = id
              }
              return E
            }

            function add_cell(row, content, bg_color, text_color) {
              const td = create_at(row, 'td')
              td.innerHTML = content
              if (bg_color) {
                td.style.backgroundColor = bg_color
              }
              if (text_color) {
                td.style.color = text_color
              }
              return td
            }
            function left_cell(A, B) {
              const bg_color = pack.data.UI.data.settings.leftmost_column_bg_color
              const text_color = pack.data.UI.data.settings.leftmost_column_text_color
              const cell = add_cell(A, B, bg_color, text_color)
              cell.style.textAlign = 'right'
              cell.style.width = '80px'
              cell.style.padding = '0 20px'
              return cell
            }
            function right_cell(A, B) {
              const cell = add_cell(A, B)
              cell.style.cursor = 'pointer'
              return cell
            }
          },
          onactive: function () {
            for (let i = 0; i < this.column.length; i++) {
              this.column[i].update()
            }
          }
        },
        network_game:
        {
          bgcolor: pack.data.UI.data.network_game.bg_color,
          create: function () {
            const This = this
            this.last_value = 'http://myserver.com:8080'
            for (const S in settings.server) {
              var op = document.createElement('option')
              op.innerHTML = op.value = S
              util.div('server_select').appendChild(op)
            }
            var op = document.createElement('option')
            let last_option
            op.value = 'third_party_server'
            op.innerHTML = 'third party server'
            util.div('server_select').appendChild(op)
            util.div('server_select').onchange = function () {
              if (this.value === 'third_party_server') {
                util.div('server_address').value = (prompt('Enter server address: ', This.last_value) || This.last_value)
                util.div('server_address').readOnly = false
              } else {
                if (last_option === 'third_party_server') {
                  This.last_value = util.div('server_address').value
                }
                util.div('server_address').value = settings.server[this.value]
                util.div('server_address').readOnly = true
              }
              last_option = this.value
            }
            util.div('server_select').onchange()
            util.div('network_game_cancel').innerHTML = 'Cancel'
            util.div('network_game_cancel').onclick = function () {
              manager.switch_UI('frontpage')
            }
            if (param.server) {
              const address = param.server.replace(/\|/g, '/')
              util.div('server_select').value = 'third_party_server'
              util.div('server_address').value = address
            }
            util.div('server_connect').onclick = function () {
              const server_address = normalize_address(util.div('server_address').value)
              if (!This.connecting) {
                const request = new XMLHttpRequest()
                request.onreadystatechange = function () {
                  if (this.readyState === 4) {
                    This.connecting = false
                    if (this.status === 200) {
                      const server = JSON.parse(this.responseText)
                      if (!settings.server[server.name]) { settings.server[server.name] = server_address }
                      manager.UI_list.lobby.start(server)
                      manager.switch_UI('lobby')
                    } else {
                      manager.alert('[' + this.status + '] Failed to connect to server')
                    }
                  }
                }
                request.open('GET', server_address + '/protocol', true)
                request.responseType = 'text'
                request.timeout = 2000
                request.send()
                This.connecting = true
              }
            }
            function normalize_address(str) {
              if (str.charAt(str.length - 1) === '/') {
                return str.slice(0, str.length - 1)
              }
              return str
            }
          },
          onactive: function () {
            Fcontroller.block(false)
          },
          deactive: function () {
            Fcontroller.block(true)
          }
        },
        lobby:
        {
          start: function (server) {
            const iframe = util.div('lobby_window')
            iframe.src = server.address + '/lobby'
            iframe.onload = function () {
              iframe.contentWindow.postMessage({
                init: true,
                protocol: 'F.Lobby 0.1',
                room: 'F.LF'
              }, server.address)
            }
            util.div('lobby', 'close_button').onclick = function () {
              manager.switch_UI('network_game')
            }
            // cross window communication
            window.addEventListener('message', windowMessage, false)
            function windowMessage(event) {
              if (event.origin !== server.address) {
                return
              }
              if (event.data.event === 'start') {
                create_network_controllers(server, event.data)
                util.div('server_connect').onclick = null
                util.div('server_connect').innerHTML = '|'
                manager.switch_UI('network_game')
              }
            }
          }
        },
        character_selection:
        {
          bgcolor: pack.data.UI.data.character_selection.bg_color,
          onactive: function () {
            if (session.control.f.paused) {
              session.control.f.paused(true)
            }
          },
          deactive: function () {
            if (session.control.f.paused) {
              session.control.f.paused(false)
            }
          },
          create: function () {
            this.state =
            {
              t: 0,
              step: 0,
              setting_computer: -1
            }

            const bg = new Fsprite_dom({
              canvas: util.div('character_selection'),
              img: pack.data.UI.data.character_selection.pic,
              wh: 'fit'
            })

            const players = this.players = []
            for (var i = 0; i < 8; i++) {
              // sprite & animator
              const sp = new Fsprite_dom({
                canvas: util.div('character_selection'),
                img: img_list,
                xywh: {
                  x: sel.posx[i % 4],
                  y: sel.posy[i - i % 4],
                  w: sel.box_width,
                  h: sel.box_height
                }
              })
              const ani_config =
              {
                x: 0,
                y: 0, // top left margin of the frames
                w: sel.box_width,
                h: sel.box_height, // width, height of a frame
                gx: 10,
                gy: 1, // define a gx*gy grid of frames
                tar: sp // target F_sprite
              }
              const ani = new Fanimator(ani_config)
              // text boxes
              const textbox = []
              for (let j = 0; j < 3; j++) {
                textbox.push(create_textbox({
                  canvas: util.div('character_selection'),
                  xywh: {
                    x: sel.posx[i % 4],
                    y: sel.posy[i - i % 4 + j + 1],
                    w: sel.text.box_width,
                    h: sel.text.box_height
                  }
                }))
              }
              //
              this.players.push({
                sp: sp,
                ani: ani,
                textbox: textbox
              })
            }

            this.dialog = new vertical_menu_dialog({
              canvas: util.div('character_selection'),
              data: pack.data.UI.data.vs_mode_dialog
            })
            this.how_many = new horizontal_number_dialog({
              canvas: util.div('character_selection'),
              data: pack.data.UI.data.how_many_computer_players
            })
            const TBX = ['background_textbox', 'difficulty_textbox']
            for (var i in TBX) {
              const textarea = pack.data.UI.data.vs_mode_dialog.text[i]
              this.dialog[TBX[i]] = create_textbox({
                canvas: this.dialog.dia,
                xywh: {
                  x: textarea[0],
                  y: textarea[1],
                  w: textarea[2],
                  h: textarea[3]
                },
                color: pack.data.UI.data.vs_mode_dialog.text_color
              })
            }
            this.options = {}

            this.steps = [
              { // step 0
                // human players select characters
                key: function (i, key) {
                  switch (key) {
                    case 'att':
                      players[i].use = true
                      players[i].type = 'human'
                      players[i].name = session.player[i] ? session.player[i].name : ''
                      players[i].step < 3 ? players[i].step++ : null
                      var finished = true
                      for (let k = 0; k < players.length; k++) {
                        finished = finished && (players[k].use ? players[k].step === 3 : true)
                      }
                      if (finished) {
                        this.set_step(1)
                      }
                      manager.sound.play('1/m_join')
                      break
                    case 'jump':
                      if (players[i].step > 0) {
                        players[i].step--
                        if (players[i].step === 0) {
                          players[i].use = false
                        }
                      }
                      manager.sound.play('1/m_cancel')
                      break
                    case 'right':
                      if (players[i].step === 1) {
                        players[i].selected++
                        if (players[i].selected >= char_list.length) {
                          players[i].selected = -1
                        }
                      }
                      if (players[i].step === 2) {
                        players[i].team++
                        if (players[i].team > 4) {
                          players[i].team = 0
                        }
                      }
                      break
                    case 'left':
                      if (players[i].step === 1) {
                        players[i].selected--
                        if (players[i].selected < -1) {
                          players[i].selected = char_list.length - 1
                        }
                      }
                      if (players[i].step === 2) {
                        players[i].team--
                        if (players[i].team < 0) {
                          players[i].team = 4
                        }
                      }
                      break
                  }
                },
                show: function () {
                  for (let i = 0; i < players.length; i++) {
                    switch (players[i].step) {
                      case 0:
                        players[i].textbox[0].innerHTML = 'Join?'
                        players[i].textbox[1].innerHTML = ''
                        players[i].textbox[2].innerHTML = ''
                        players[i].sp.switch_img('waiting')
                        break
                      case 1:
                        players[i].textbox[0].style.color = static_color(i)
                        players[i].textbox[0].innerHTML = players[i].name
                        players[i].textbox[1].innerHTML = char_list[players[i].selected].name
                        players[i].textbox[2].innerHTML = ''
                        players[i].ani.rewind()
                        players[i].sp.switch_img(players[i].selected)
                        break
                      case 2:
                        players[i].textbox[1].style.color = static_color(i)
                        players[i].textbox[2].innerHTML = players[i].team === 0 ? 'Independent' : 'Team ' + players[i].team
                        break
                      case 3:
                        players[i].textbox[2].style.color = static_color(i)
                        break
                    }
                  }
                },
                enter: function () {
                  for (let i = 0; i < players.length; i++) {
                    players[i].sp.show()
                    for (let j = 0; j < players[i].textbox.length; j++) {
                      show(players[i].textbox[j])
                    }
                  }
                },
                leave: function () {
                  for (let i = 0; i < players.length; i++) {
                    if (!players[i].use) {
                      players[i].sp.hide()
                      for (let j = 0; j < players[i].textbox.length; j++) {
                        hide(players[i].textbox[j])
                      }
                    } else {
                      players[i].textbox[players[i].textbox.length - 1].style.color = static_color(i)
                    }
                  }
                }
              },
              {
                // step 1
                // how many computers
                key: function (i, key) {
                  switch (key) {
                    case 'att':
                      this.state.num_of_computers = parseInt(this.how_many.active_item)
                      this.set_step(2)
                      break
                    case 'left':
                      this.how_many.nav_left()
                      break
                    case 'right':
                      this.how_many.nav_right()
                      break
                  }
                },
                show: function () {
                },
                enter: function () {
                  let low = 0; let high
                  let used = 0
                  for (var i = 0; i < players.length; i++) {
                    if (players[i].use) {
                      used++
                    }
                  }
                  high = players.length - used
                  let same_team = true
                  let last_item
                  for (var i = 0; i < players.length; i++) {
                    if (players[i].use) {
                      if (last_item === undefined) {
                        last_item = i
                      } else {
                        same_team = same_team && players[i].team === players[last_item].team && players[i].team !== 0
                      }
                    }
                  }
                  if (same_team) {
                    low = 1
                  }
                  this.how_many.init(low, high)
                  this.how_many.show()
                },
                leave: function () {
                  this.how_many.hide()
                }
              },
              { // step 2
                // select computers
                key: function step1_key(i, key) {
                  switch (key) {
                    case 'att':
                      i = this.state.setting_computer
                      players[i].step++
                      if (players[i].step === 3) {
                        this.state.already_set_computer++
                        this.steps[this.state.step].next_computer_slot.call(this)
                      }
                      manager.sound.play('1/m_join')
                      break
                    case 'jump':
                      i = this.state.setting_computer
                      if (players[i].step > 0) {
                        players[i].step--
                      }
                      manager.sound.play('1/m_cancel')
                      break
                    case 'right':
                      i = this.state.setting_computer
                      if (players[i].step === 1) {
                        players[i].selected++
                        if (players[i].selected >= char_list.length) {
                          players[i].selected = 0
                        }
                      }
                      if (players[i].step === 2) {
                        players[i].team++
                        if (players[i].team > 4) {
                          players[i].team = 0
                        }
                      }
                      if (players[i].step === 0 && players[i].type === 'computer') {
                        players[i].selected_AI++
                        if (players[i].selected_AI >= AI_list.length) {
                          players[i].selected_AI = -1
                        }
                      }
                      break
                    case 'left':
                      i = this.state.setting_computer
                      if (players[i].step === 1) {
                        players[i].selected--
                        if (players[i].selected < 0) {
                          players[i].selected = char_list.length - 1
                        }
                      }
                      if (players[i].step === 2) {
                        players[i].team--
                        if (players[i].team < 0) {
                          players[i].team = 4
                        }
                      }
                      if (players[i].step === 0 && players[i].type === 'computer') {
                        players[i].selected_AI--
                        if (players[i].selected_AI < -1) {
                          players[i].selected_AI = AI_list.length - 1
                        }
                      }
                      break
                  }
                },
                show: function () {
                  for (let i = 0; i < players.length; i++) {
                    switch (players[i].step) {
                      case 0:
                        players[i].name = AI_list[players[i].selected_AI].name
                        players[i].textbox[0].innerHTML = players[i].name
                        players[i].textbox[1].innerHTML = char_list[players[i].selected].name
                        players[i].textbox[2].innerHTML = ''
                        players[i].ani.rewind()
                        players[i].sp.switch_img(players[i].selected)
                        break
                      case 1:
                        players[i].textbox[0].style.color = static_color(i)
                        players[i].textbox[1].innerHTML = char_list[players[i].selected].name
                        players[i].textbox[2].innerHTML = ''
                        players[i].sp.switch_img(players[i].selected)
                        break
                      case 2:
                        players[i].textbox[1].style.color = static_color(i)
                        players[i].textbox[2].innerHTML = players[i].team === 0 ? 'Independent' : 'Team ' + players[i].team
                        break
                      case 3:
                        players[i].textbox[2].style.color = static_color(i)
                        break
                    }
                  }
                },
                enter: function () {
                  this.state.already_set_computer = 0
                  this.steps[this.state.step].next_computer_slot.call(this)
                },
                next_computer_slot: function () {
                  if (this.state.num_of_computers === this.state.already_set_computer) {
                    this.set_step(3)
                    return
                  }
                  let next
                  for (var i = 0; i < players.length; i++) {
                    if (!players[i].use) {
                      next = i
                      break
                    }
                  }
                  if (next !== undefined) {
                    var i = this.state.setting_computer = next
                    players[i].use = true
                    players[i].step = 0
                    players[i].type = 'computer'
                    players[i].sp.show()
                    for (let j = 0; j < players[i].textbox.length; j++) {
                      show(players[i].textbox[j])
                    }
                  }
                }
              },
              { // step 3
                // dialog menu
                key: function step2_key(i, key) {
                  switch (key) {
                    case 'att':
                      manager.sound.play('1/m_ok')
                      switch (this.dialog.active_item) {
                        case 0: manager.start_match({
                          players: this.players,
                          options: this.options
                        }); return // Fight!
                        case 1:
                          this.reset()
                          this.set_step(0)
                          return // Reset All
                        case 2: // Reset Random
                          this.steps[this.state.step].update_random.call(this)
                          return
                        case 3: break // Background
                        case 4: break // Difficulty
                        case 5: // Exit
                          manager.switch_UI('frontpage')
                          break
                      }
                      if (this.dialog.active_item === 3) {
                        step2_key.call(this, i, 'right')
                      }
                      break
                    case 'jump':
                      // cannot go back
                      break
                    case 'right':
                      if (this.dialog.active_item === 3) {
                        this.options.background++
                        if (this.options.background >= bg_list.length) {
                          this.options.background = -1
                        }
                      }
                      break
                    case 'left':
                      if (this.dialog.active_item === 3) {
                        this.options.background--
                        if (this.options.background < -1) {
                          this.options.background = bg_list.length - 1
                        }
                      }
                      break
                    case 'up':
                      this.dialog.nav_up()
                      break
                    case 'down':
                      this.dialog.nav_down()
                      break
                  }
                },
                show: function () {
                  this.dialog.show()
                  for (let i = 0; i < players.length; i++) {
                    switch (players[i].step) {
                      case 3:
                        players[i].textbox[2].style.color = static_color(i)
                        break
                    }
                  }
                  this.dialog.background_textbox.innerHTML = bg_list[this.options.background].name
                  this.dialog.difficulty_textbox.innerHTML = diff_list[this.options.difficulty]
                },
                enter: function () {
                  this.state.random_slot = {}
                  this.state.random_AI = {}
                  for (let i = 0; i < players.length; i++) {
                    if (players[i].selected === -1) {
                      this.state.random_slot[i] = true
                    }
                    if (players[i].selected_AI === -1) {
                      this.state.random_AI[i] = true
                    }
                  }
                  this.steps[this.state.step].update_random.call(this)
                },
                update_random: function () {
                  for (var i in this.state.random_slot) {
                    players[i].selected = Math.floor(randomseed.next() * char_list.length)
                    players[i].textbox[1].innerHTML = char_list[players[i].selected].name
                    players[i].sp.switch_img(players[i].selected)
                  }
                  for (var i in this.state.random_AI) {
                    if (players[i].type === 'computer') {
                      players[i].selected_AI = Math.floor(randomseed.next() * AI_list.length)
                      players[i].name = players[i].textbox[0].innerHTML = AI_list[players[i].selected_AI].name
                    }
                  }
                }
              }
            ]

            this.reset()

            function static_color(i) {
              return players[i].type === 'human' ? sel.text.color[2] : sel.text.color[3]
            }
          },
          reset: function () {
            const players = this.players
            this.state.step = 0
            this.dialog.hide()
            this.dialog.activate_item(0)
            this.how_many.hide()
            for (let i = 0; i < players.length; i++) {
              players[i].use = false
              players[i].step = 0
              players[i].type = 'human'
              players[i].name = ''
              players[i].team = 0
              players[i].selected = -1
              players[i].selected_AI = -1
            }
            this.options.background = -1
            this.options.difficulty = 2
            this.steps[this.state.step].show.call(this)
          },
          key: function (controller_num, key) {
            const players = this.players
            const i = controller_num
            if (this.state.step > 0 && players[i].type !== 'human') {
              return
            }
            this.steps[this.state.step].key.call(this, i, key)
            this.steps[this.state.step].show.call(this)
          },
          set_step: function (newstep) {
            if (this.steps[this.state.step].leave) {
              this.steps[this.state.step].leave.call(this)
            }
            this.state.step = newstep
            if (this.steps[this.state.step].enter) {
              this.steps[this.state.step].enter.call(this)
            }
          },
          frame: function () {
            const players = this.players
            const t = this.state.t
            for (var i in players) {
              switch (players[i].step) {
                case 0:
                  if (this.state.step === 0) {
                    players[i].ani.set_frame(t % 2)
                  }
                  players[i].textbox[0].style.color = sel.text.color[t % 2]
                  break
                case 1:
                  players[i].textbox[1].style.color = sel.text.color[t % 2]
                  break
                case 2:
                  players[i].textbox[2].style.color = sel.text.color[t % 2]
                  break
              }
            }
            for (var i = 0; i < session.control.length; i++) {
              session.control[i].fetch()
            }
            manager.sound.TU()
            this.state.t++
          }
        },
        gameplay:
        {
          allow_wide: true,
          create: function () {
            if (util.div('pause_message')) {
              const dat = pack.data.UI.data.message_overlay
              manager.overlay_mess = new Fsprite_dom({
                div: util.div('pause_message'),
                img: dat.pic
              })
              manager.overlay_mess.hide()
            }
            manager.gameplay = util.div('gameplay')
            manager.canvas = get_canvas()
            manager.background_layer = new Fsprite({
              canvas: manager.canvas,
              type: 'group'
            })
            manager.panel_layer = new Fsprite({
              canvas: manager.canvas,
              type: 'group',
              wh: { w: pack.data.UI.data.panel.width, h: pack.data.UI.data.panel.height }
            })
            manager.summary = new summary_dialog({
              div: util.div('summary_dialog'),
              data: pack.data.UI.data.summary
            })

            if (Fsprite.renderer === 'DOM') {
              manager.panel_layer.el.className = 'panel'
              manager.background_layer.el.className = 'background'
            }
            const panels = []
            for (let i = 0; i < 8; i++) {
              const pane = new Fsprite({
                canvas: manager.panel_layer,
                img: pack.data.UI.data.panel.pic,
                wh: 'fit'
              })
              pane.set_x_y(pack.data.UI.data.panel.pane_width * (i % 4), pack.data.UI.data.panel.pane_height * Math.floor(i / 4))
              panels.push(pane)
            }
            function get_canvas() {
              if (Fsprite.renderer === 'DOM') {
                return new Fsprite({
                  div: util.div('gameplay'),
                  type: 'group'
                })
              } else if (Fsprite.renderer === 'canvas') {
                const canvas_node = util.div('gameplay').getElementsByClassName('canvas')[0]
                canvas_node.width = global.application.window.width
                canvas_node.height = global.application.window.height
                return new Fsprite({
                  canvas: canvas_node,
                  type: 'group',
                  bgcolor: '#676767',
                  wh: { w: global.application.window.width, h: global.application.window.height }
                })
              }
            }
          }
        }
      }
      function resizer(ratio) {
        const demax = ratio === 1
        if (window_state.maximized) {
          const landscape = false
          // if (window.innerWidth < 400 && window.innerWidth < window.innerHeight)
          // landscape = true;
          const last_window_state_wide = window_state.wide
          let want_wide
          if (!landscape) {
            want_wide = window.innerWidth / window.innerHeight > 15 / 9
          } else {
            want_wide = window.innerHeight / window.innerWidth > 15 / 9
          }
          if (want_wide) {
            if (window_state.allow_wide && !window_state.wide) {
              window_state.wide = true
              util.container.classList.add('wideWindow')
              // double arrow symbol '&#8622;&#8596;'
            }
          }
          if (window_state.wide &&
            (!window_state.allow_wide || !want_wide)) {
            window_state.wide = false
            util.container.classList.remove('wideWindow')
          }
          let fratio = ratio
          if (typeof ratio !== 'number') {
            const width = parseInt(window.getComputedStyle(util.container, null).getPropertyValue('width'))
            const height = parseInt(window.getComputedStyle(util.container, null).getPropertyValue('height'))
            this.width = width
            if (height > 100) { this.height = height }
            if (!landscape) {
              var ratioh = window.innerHeight / this.height
              var ratiow = window.innerWidth / this.width
            } else {
              var ratioh = window.innerHeight / this.width
              var ratiow = window.innerWidth / this.height
            }
            ratio = ratioh < ratiow ? ratioh : ratiow
            fratio = ratio
            ratio = Math.floor(ratio * 100) / 100
          }
          if (manager.active_UI === 'frontpage') {
            manager.UI_list.frontpage.demax(demax)
          }
          if (!ratio) { return }
          let canx = 0; let cany = 0
          if (!landscape) {
            canx = window.innerWidth / 2 - parseInt(window.getComputedStyle(util.container, null).getPropertyValue('width')) / 2 * ratio
          } else {
            cany = window.innerHeight / 2 - parseInt(window.getComputedStyle(util.container, null).getPropertyValue('width')) / 2 * ratio
          }
          if (demax) { canx = 0 }
          if (Fsupport.css3dtransform) {
            util.container.style[Fsupport.css3dtransform + 'Origin'] = '0 0'
            util.container.style[Fsupport.css3dtransform] =
              'translate3d(' + canx + 'px,' + cany + 'px,0) ' +
              'scale3d(' + ratio + ',' + ratio + ',1.0) ' +
              (landscape ? 'translateX(' + (window_state.wide ? 450 : 580) + 'px) rotateZ(90deg) ' : '')
          } else if (Fsupport.css2dtransform) {
            util.container.style[Fsupport.css2dtransform + 'Origin'] = '0 0'
            util.container.style[Fsupport.css2dtransform] =
              'translate(' + canx + 'px,0) ' +
              'scale(' + ratio + ',' + ratio + ') '
          }
          if (last_window_state_wide !== window_state.wide) { // wide state changed
            if (window_state.wide) {
              manager.background_layer.set_x_y(0, -pack.data.UI.data.panel.height)
              manager.panel_layer.set_alpha(0.5)
            } else {
              manager.background_layer.set_x_y(0, 0)
              manager.panel_layer.set_alpha(1.0)
            }
            if (util.div('canvas').width) { // using canvas rendering backend
              const owidth = global.application.window.width
              const wide_width = global.application.window.wide_width
              if (window_state.wide) { // widen the canvas
                util.div('canvas').width = wide_width
                const offx = Math.floor((wide_width - owidth) / 2)
                util.div('canvas').style.left = -offx + 'px'
                manager.canvas.set_x_y(offx, 0)
                manager.canvas.set_w(wide_width)
              } else { // restore the canvas
                util.div('canvas').width = owidth
                util.div('canvas').style.left = 0
                manager.canvas.set_x_y(0, 0)
                manager.canvas.set_w(owidth)
              }
              manager.canvas.render()
            }
          }
        }
      }
      this.frame = function () {
        this.dispatch_event('frame')
      }
      this.key = function () {
        this.dispatch_event('key', arguments)
      }
      this.dispatch_event = function (event, args) {
        const active = this.UI_list[this.active_UI]
        if (active && active[event]) {
          active[event].apply(active, args)
        }
      }
      this.create_UI = function () {
        for (const I in this.UI_list) {
          if (this.UI_list[I].create) {
            this.UI_list[I].create.call(this.UI_list[I])
          }
        }
      }
      this.switch_UI = function (page) {
        this.dispatch_event('deactive')
        this.active_UI = page
        for (const P in this.UI_list) {
          util.div(P).style.display = page === P ? '' : 'none'
        }
        if (window_state.allow_wide !== this.UI_list[page].allow_wide) {
          window_state.allow_wide = this.UI_list[page].allow_wide
          if (window_state.maximized && window_state.wide !== window_state.allow_wide) {
            resizer()
          }
        }
        util.div('window').style.background = this.UI_list[page].bgcolor || ''
        if (window_state.maximized) {
          document.body.style.background = this.UI_list[page].bgcolor || '#676767'
        }
        this.dispatch_event('onactive')
      }
      this.match_end = function (event) {
        this.switch_UI('character_selection')

        // create timer
        const This = this
        if (timer) network.clearInterval(timer)
        timer = network.setInterval(function () { This.frame() }, 1000 / 12)
        // create controller listener
        for (let i = 0; i < session.control.length; i++) {
          (function (i) {
            session.control[i].child = [{
              key: function (K, D) { if (D) This.key(i, K) }
            }]
          }(i))
        }
        session.control.f.child = []
        if (session.control.f.hide) {
          session.control.f.hide()
        }
      }
      this.start_game = function () {
        // save settings
        if (Fsupport.localStorage) {
          Fsupport.localStorage.setItem('F.LF/settings', JSON.stringify(settings))
        }

        // controller
        for (var i = 0; i < session.control.length; i++) {
          session.control[i].sync = true
        }
        session.control.f.sync = true
        for (var i = 0; i < session.control.length; i++) {
          if (session.control[i].type === 'touch') {
            session.control[i].show()
            Touchcontroller.enable(true)
          }
        }
        if (session.control.f.show) {
          session.control.f.show()
        }

        // start
        manager.sound.play('1/m_ok')
        manager.match_end()
        manager.switch_UI('character_selection')
      }
      this.start_match = function (config) {
        this.switch_UI('gameplay')

        if (timer) {
          network.clearInterval(timer)
          timer = null
        }

        for (let i = 0; i < session.control.length; i++) {
          session.control[i].child = []
        }
        if (!config.demo_mode) {
          session.control.f.child = []
          if (session.control.f.show) {
            session.control.f.show()
          }
        }

        const match = new Match
          ({
            manager: this,
            'package': pack
          })
        match.create
          ({
            control: config.demo_mode ? null : session.control.f,
            player: get_players(),
            background: { id: get_background() },
            set: {
              weapon: true,
              demo_mode: config.demo_mode
            }
          })
        return match

        function get_players() {
          const players = config.players
          const arr = []
          for (let i = 0; i < players.length; i++) {
            if (players[i].use) {
              arr.push({
                name: players[i].name,
                controller: players[i].type === 'human' ? session.control[i] : { type: 'AIscript', id: AI_list[players[i].selected_AI].id },
                id: char_list[players[i].selected].id,
                team: players[i].team === 0 ? 10 + i : players[i].team
              })
            }
          }
          return arr
        }
        function get_background() {
          const options = config.options
          if (options.background === -1) {
            return bg_list[Math.floor(randomseed.next() * bg_list.length)].id
          } else {
            return bg_list[options.background].id
          }
        }
      }
      this.network_debug = function (role) {
        create_network_controllers({
          address: 'http://localhost:8001',
          library: 'network.js',
          path: '/peer'
        }, {
          id1: role === 'active' ? 'a' : 'b',
          id2: role === 'active' ? 'b' : 'a',
          role: role
        })
      }
      this.start_debug = function () {
        const match = this.start_match({
          players: [
            {
              use: true,
              name: 'Player1',
              type: 'human',
              selected: 3,
              team: 1
            },
            {
              use: true,
              name: 'Player2',
              type: 'human',
              selected: 3,
              team: 2
            }
          ],
          options: {
            background: -1, // random
            difficulty: 2 // difficult
          }
        })
      }
      this.start_demo = function (playable) {
        const This = this
        if (playable) {
          util.div('top_status').innerHTML = "F.LF is running in Demo mode, press `Esc` or click <button class='here_button' style='width:100px;letter-spacing:3px;'>here</button> to start game."
          util.div('top_status').style.zIndex = 1000
          util.div('here_button').onclick = start_game

          session.control.f.child = [{
            key: function (K, D) { if (K === 'esc' && D) { start_game() } }
          }]
          session.control.f.sync = false
        }
        function start_game() {
          match.destroy()
          util.div('top_status').innerHTML = ''
          util.div('top_status').style.zIndex = undefined
          This.switch_UI('frontpage')
        }
        var match = this.start_match({
          demo_mode: true,
          players: [
            {
              use: true,
              name: 'CRUSHER',
              type: 'computer',
              selected: 10,
              selected_AI: 0,
              team: 1
            },
            {
              use: true,
              name: 'dumbass',
              type: 'computer',
              selected: 8,
              selected_AI: 2,
              team: 2
            }
          ],
          options: {
            background: 6,
            difficulty: 2
          }
        })
      }
      // constructor
      this.create()
    }

    // util
    function show(div) {
      div.style.display = ''
    }
    function hide(div) {
      div.style.display = 'none'
    }
    function show_hide(div) {
      div.style.display = div.style.display === '' ? 'none' : ''
    }
    function defined(x) {
      return x !== undefined && x !== null
    }
    function point_in_rect(x, y, R) {
      return (inbetween(x, R[0], R[0] + R[2]) && inbetween(y, R[1], R[1] + R[3]))
      function inbetween(x, L, R) {
        let l, r
        if (L <= R) { l = L; r = R } else { l = R; r = L }
        return x >= l && x <= r
      }
    }
    function create_textbox(config) {
      const box = new Fsprite_dom({
        canvas: config.canvas,
        xywh: config.xywh
      })
      box.el.classList.add('textbox')
      if (config.color) {
        box.el.style.color = config.color
      }
      box.el.style['line-height'] = config.xywh[3] + 'px'
      return box.el
    }
    function vertical_menu_dialog(config) {
      const This = this
      const data = this.data = config.data
      this.dia = new Fsprite_dom({ canvas: config.canvas, type: 'group' })
      this.bg = new Fsprite_dom({ canvas: this.dia, img: data.bg })
      this.menu = new Fsprite_dom({ canvas: this.dia, img: data.pic })
      this.it = new Fsprite_dom({ canvas: this.dia, img: data.pic })
      this.dia.set_x_y(data.x, data.y)
      for (var I in { bg: 0, menu: 0 }) {
        this[I].set_x_y(0, 0)
      }
      for (var I in { dia: 0, bg: 0, menu: 0 }) {
        this[I].set_w_h(data.width, data.height)
      }
      if (config.mousehover) { // activate items automatically by mouse hovering
        const trans = function (el, e) {
          const rect = el.getBoundingClientRect()
          const x = e.clientX - rect.left - el.clientLeft + el.scrollLeft
          const y = e.clientY - rect.top - el.clientTop + el.scrollTop
          return { x: x, y: y }
        }
        this.dia.el.onmousemove = function (e) {
          e = e || event
          const P = trans(this, e)
          This.mousemove(P.x, P.y)
        }
        this.dia.el.onmouseout = function (e) {
          This.mousemove(-10, -10)
        }
        this.it.hide()
        if (config.onclick) {
          this.onclick = config.onclick
          this.dia.el.onmousedown = function (e) {
            e = e || event
            const P = trans(this, e)
            This.mousedown(P.x, P.y)
          }
        }
      } else {
        this.activate_item(0)
      }
    }
    const vmdp = vertical_menu_dialog.prototype
    vmdp.activate_item = function (num) {
      if (num !== null && num !== undefined) {
        this.active_item = num
      } else {
        num = this.active_item
      }
      const item = this.data.item[num]
      this.it.set_x_y(item[0], item[1])
      this.it.set_img_x_y(-this.data.width - item[0], -item[1])
      this.it.set_w_h(item[2], item[3])
    }
    vmdp.nav_up = function () {
      if (this.active_item > 0) {
        this.active_item--
      } else {
        this.active_item = this.data.item.length - 1
      }
      this.activate_item()
    }
    vmdp.nav_down = function () {
      if (this.active_item < this.data.item.length - 1) {
        this.active_item++
      } else {
        this.active_item = 0
      }
      this.activate_item()
    }
    vmdp.show = function () {
      this.dia.show()
    }
    vmdp.hide = function () {
      this.dia.hide()
    }
    vmdp.get_mouse_target = function (x, y) {
      let target
      for (let i = 0; i < this.data.item.length; i++) {
        if (point_in_rect(x, y, this.data.item[i])) {
          target = i
          break
        }
      }
      return target
    }
    vmdp.mousemove = function (x, y) {
      const target = this.get_mouse_target(x, y)
      if (defined(target)) {
        this.activate_item(target)
        this.it.show()
      } else {
        this.it.hide()
      }
    }
    vmdp.mousedown = function (x, y) {
      const target = this.get_mouse_target(x, y)
      if (this.onclick && defined(target)) {
        this.onclick(target)
      }
    }
    function horizontal_number_dialog(config) {
      const This = this
      const data = this.data = config.data
      this.dia = new Fsprite_dom({ canvas: config.canvas, type: 'group' })
      this.dia.set_x_y(data.x, data.y)
      this.bg = new Fsprite_dom({ canvas: this.dia, img: data.bg })
      this.bg.set_x_y(0, 0)
      for (const I in { dia: 0, bg: 0 }) {
        this[I].set_w_h(data.width, data.height)
      }
      this.it = []
      this.active_item = 0
      for (let i = 0; i <= 7; i++) {
        const sp = new Fsprite_dom({ canvas: this.dia })
        sp.set_x_y(data.item_x + i * data.item_space, data.item_y)
        sp.set_w_h(data.item_width, data.item_height)
        sp.el.classList.add('textbox')
        sp.el.style['line-height'] = data.item_height + 'px'
        sp.el.innerHTML = i + ''
        this.it[i] = sp
      }
    }
    const hndp = horizontal_number_dialog.prototype
    hndp.init = function (lower_bound, upper_bound) {
      for (var i = 0; i < this.it.length; i++) {
        this.it[i].el.style.color = this.data.inactive_color
      }
      for (var i = lower_bound; i <= upper_bound; i++) {
        this.it[i].el.style.color = this.data.active_color
      }
      this.activate_item(lower_bound)
      this.lower_bound = lower_bound
      this.upper_bound = upper_bound
    }
    hndp.activate_item = function (num) {
      var it = this.it[this.active_item]
      it.el.style.border = ''
      this.active_item = num
      var it = this.it[this.active_item]
      it.el.style.border = '1px solid white'
    }
    hndp.nav_left = function () {
      this.activate_item(
        this.active_item > this.lower_bound
          ? this.active_item - 1
          : this.upper_bound
      )
    }
    hndp.nav_right = function () {
      this.activate_item(
        this.active_item < this.upper_bound
          ? this.active_item + 1
          : this.lower_bound
      )
    }
    hndp.show = function () {
      this.dia.show()
    }
    hndp.hide = function () {
      this.dia.hide()
    }
    function summary_dialog(config) {
      const data = this.data = config.data
      this.status_colors = [data.text_color[6], data.text_color[7]]
      this.dialog = new Fsprite_dom({
        div: config.div,
        type: 'group',
        wh: { w: data.width, h: 100 }
      })
      this.hide()
      for (const part in { head: 1, foot: 1 }) {
        this[part + '_holder'] = new Fsprite_dom({
          canvas: this.dialog,
          type: 'group'
        })
        this[part] = new Fsprite_dom({
          canvas: this[part + '_holder'],
          img: data.pic,
          wh: { w: data.width, h: data[part][3] }
        })
        this[part].set_img_x_y(-data[part][0], -data[part][1])
      }
      this.rows = []
      for (let i = 0; i < 8; i++) {
        const gp = new Fsprite_dom({
          canvas: this.dialog,
          type: 'group'
        })
        const bg = new Fsprite_dom({
          canvas: gp,
          img: data.pic,
          wh: { w: data.width, h: data.body[3] }
        })
        bg.set_img_x_y(-data.body[0], -data.body[1])
        const icon = new Fsprite_dom({
          canvas: gp,
          xywh: data.icon
        })
        this.rows[i] = {
          gp: gp,
          icon: icon,
          boxes: []
        }
        for (let j = 0; j < data.text.length; j++) {
          const tb = create_textbox({
            canvas: gp,
            xywh: data.text[j],
            color: data.text_color[j]
          })
          this.rows[i].boxes.push(tb)
        }
        // name
        this.rows[i].boxes[0].style['font-size'] = '10px'
        // status
        this.rows[i].boxes[6].style['font-size'] = '9px'
      }
      this.time = create_textbox({
        canvas: this.foot_holder,
        xywh: data.time,
        color: data.time_color
      })
    }
    summary_dialog.prototype.show = function () {
      this.dialog.show()
    }
    summary_dialog.prototype.hide = function () {
      this.dialog.hide()
    }
    summary_dialog.prototype.set_rows = function (num) {
      let y = this.data.head[3]
      for (let i = 0; i < 8; i++) {
        this.rows[i].gp.set_x_y(0, y)
        if (i < num) {
          y += this.data.body[3]
          this.rows[i].gp.show()
        } else {
          this.rows[i].gp.hide()
        }
      }
      this.foot_holder.set_x_y(0, y)
      y += this.data.foot[3]
      this.dialog.set_h(y)
    }
    summary_dialog.prototype.set_info = function (info) {
      /* info=
      [
        [ Icon, Name, Kill, Attack, HP Lost, MP Usage, Picking, Status ]...
      ]
      */
      this.set_rows(info.length)
      for (let i = 0; i < info.length; i++) {
        this.set_row_data(i, info[i])
      }
    }
    summary_dialog.prototype.set_time = function (time) {
      this.time.innerHTML = time
    }
    summary_dialog.prototype.set_row_data = function (i, data) {
      const row = this.rows[i].boxes
      const icon = this.rows[i].icon
      icon.remove_img('0')
      icon.add_img(data[0], '0')
      for (let i = 1; i < data.length; i++) {
        row[i - 1].innerHTML = data[i]
      }
      if (data[7].indexOf('Win') !== -1) {
        row[6].style.color = this.status_colors[0]
      } else {
        row[6].style.color = this.status_colors[1]
      }
    }

    return Manager
  })
