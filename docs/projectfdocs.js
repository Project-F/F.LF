setTimeout(function () {
  const hl = document.getElementById('headline')
  const L = hl.innerHTML.split('/')
  let st = ''
  for (let i = 0; i < L.length; i++) {
    st += i === 0 ? '' : '/'
    switch (L[i]) {
      case 'F.LF': st += '<a href="index.html">F.LF</a>'; break
      default: st += L[i]
    }
  }
  hl.innerHTML = st
}, 2000)

document.addEventListener('DOMContentLoaded', function () {
  const xmp = document.getElementsByTagName('xmp')[0]
  xmp.style.display = 'none'
  xmp.setAttribute('theme', 'projectf')
  const script = document.createElement('script')
  script.src = 'strapdown_0_2/strapdown.js'
  document.head.appendChild(script)
});

(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "7e9t7td3ig");
