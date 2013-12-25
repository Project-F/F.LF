//component test of background.js
requirejs.config({
	baseUrl: '../../',
	config:
	{
		'F.core/sprite':
		{
			baseUrl: '../../LFrelease/LF2_19/'
		}
	}
});

requirejs(['LF/background',
'F.core/css!LF/application.css',
'LFrelease/LF2_19/bg/hkc/bg',
'LFrelease/LF2_19/bg/lf/bg',
'LFrelease/LF2_19/bg/sp/bg',
'LFrelease/LF2_19/bg/gw/bg',
'LFrelease/LF2_19/bg/qi/bg',
'LFrelease/LF2_19/bg/ft/bg',
'LFrelease/LF2_19/bg/cuhk/bg',
'LFrelease/LF2_19/bg/thv/bg',
'LFrelease/LF2_19/bg/template/bg'
],function(background,css_loaded)
{
	for( var i=2; i<arguments.length; i++)
	{
		var LFwindow = document.getElementById('template').cloneNode(true);
		LFwindow.id='bg'+(i-1);
		document.body.appendChild(LFwindow);
		new background({
			layers: LFwindow.getElementsByClassName('background')[0],
			scrollbar: true,
			standalone: { carousel: 'linear'}
		},arguments[i],1);
	}
});