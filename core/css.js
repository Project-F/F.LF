/*\
 * css
 * css is a requirejs plugin that loads a css file and inject it into a page.
 * 
 * note that this loader will return immediately,
 * regardless of whether the browser had finished parsing the stylesheet.
 *
 * this css loader is implemented for file optimization and depedency managment
| requirejs(['css!style.css','css!more.css'],function(css1,css2){
|	console.log(css1+','+css2); //true if successfully loaded
| });
\*/

define({
	load: function (name, require, load, config) {
		function inject(filename)
		{
			var head = document.getElementsByTagName('head')[0];
			var link = document.createElement('link');
			link.href = filename;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			head.appendChild(link);
		}
		inject(requirejs.toUrl(name));
		load(true);
	},
	pluginBuilder: './css-build'
});
