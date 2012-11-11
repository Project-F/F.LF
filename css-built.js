/**	`css-built` is a version of the `css` plugin to be used after optimization.
	before optimization, the method is to load the css file by a `link` element.
	after optimization, since the content of the css file is already embedded
	into the built file into a module, the method is to inject the styles
	into the HTML doc by a `style` element.
 */

define(function() {
	var loaded=false;

	return {
		load: function (name, require, load, config) {
			if( !loaded)
			{
				loaded=true;
				embed_css = function (content)
				{
					var head = document.getElementsByTagName('head')[0],
						style = document.createElement('style'),
						rules = document.createTextNode(content);

					style.type = 'text/css';
					if(style.styleSheet)
						style.styleSheet.cssText = rules.nodeValue;
					else style.appendChild(rules);
					head.appendChild(style);
				}
				require(['cssout'], function(data){
					embed_css(data.content);
					load(true);
				});
			}
			else
				load(false);
		},
		pluginBuilder: './css-build'
	}
});
