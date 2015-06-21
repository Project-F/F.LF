(function (){

if( document.getElementById('flf-config'))
{
	var flf_config = document.getElementById('flf-config').innerHTML;
	flf_config = JSON.parse(flf_config);
	requirejs.config(
	{
		baseUrl: flf_config.root || '',
		paths:
		{
		},
		config:
		{
		}
	});
}

requirejs(['core/support',
'LF/loader!'+flf_config.package,'LF/manager',
'LF/util','./buildinfo.js','core/css!LF/application.css'],
function(Fsupport,
package,Manager,
util,buildinfo){

	if(typeof(console) === 'undefined') {
		console = {};
		console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
	}

	console.log(util.div('projectFmessage').innerHTML);

	if( flf_config.package.indexOf('http')===0)
	{
		package.path = flf_config.package;
		package.location = flf_config.package;
	}
	else
	{
		package.path = util.normalize_path(flf_config.package);
		package.location = util.normalize_path(flf_config.root+flf_config.package);
	}

	//analytics
	if( window.location.href.indexOf('http')===0)
	{
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');
		ga('create', 'UA-37320960-5', 'tyt2y3.github.io');
		ga('send', 'pageview');
	}

	util.div('window_caption_title').innerHTML = buildinfo.version;

	var manager = new Manager(package, buildinfo);

});

}());
