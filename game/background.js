// component test of background.js
requirejs.config({
  baseUrl: '../',
  paths:
	{
	},
  config:
	{
	  'core/sprite-dom':
		{
		  baseUrl: '../../LF2_19/'
		},
	  'core/sprite-canvas':
		{
		  baseUrl: '../../LF2_19/'
		}
	}
})

requirejs([
  'LF/global',
  'LF/sprite-select',
  'LF/background',
  'core/css!LF/application.css',
  '../LF2_19/bg/hkc/bg',
  '../LF2_19/bg/lf/bg',
  '../LF2_19/bg/sp/bg',
  '../LF2_19/bg/gw/bg',
  '../LF2_19/bg/qi/bg',
  '../LF2_19/bg/ft/bg',
  '../LF2_19/bg/cuhk/bg',
  '../LF2_19/bg/thv/bg',
  '../LF2_19/bg/template/bg'
], function (global, Fsprite, background) {
  for (let i = 4; i < arguments.length; i++) {
    var LFwindow = document.getElementById('template').cloneNode(true)
    LFwindow.id = 'bg' + (i - 3)
    document.body.appendChild(LFwindow)
    const canvas = get_canvas()
    const background_layer = new Fsprite({ canvas: canvas, type: 'group' })
    background_layer.set_x_y(0, -128)
    if (Fsprite.renderer === 'DOM') { background_layer.el.className = 'background' }
    new background({
      layers: background_layer,
      scrollbar: util_div('gameplay'),
      standalone: { carousel: 'linear', canvas: canvas }
    }, arguments[i], 1)
  }

  function get_canvas () {
    if (Fsprite.renderer === 'DOM') {
      const group = new Fsprite({ div: util_div('gameplay'), type: 'group' })
      // group.set_w_h(global.application.window.width,global.application.window.height);
      return group
    } else if (Fsprite.renderer === 'canvas') {
      const canvas_node = util_div('gameplay').getElementsByClassName('canvas')[0]
      canvas_node.width = global.application.window.width
      canvas_node.height = global.application.window.height
      return new Fsprite({ canvas: canvas_node, type: 'group' })
    }
  }

  function util_div (classname) {
    return LFwindow.getElementsByClassName(classname)[0]
  }
})
