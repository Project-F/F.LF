setTimeout( function()
{
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	ga('create', 'UA-37320960-5', 'tyt2y3.github.io');
	ga('send', 'pageview');

	var hl=document.getElementById('headline');
	var L=hl.innerHTML.split('/');
	var st='';
	for( var i=0; i<L.length; i++)
	{
		st+= i===0?'':'/';
		switch (L[i])
		{
			case 'F.LF': st+= '<a href="index.html">F.LF</a>'; break;
			default: st+=L[i];
		}
	}
	hl.innerHTML=st;
}, 2000);
