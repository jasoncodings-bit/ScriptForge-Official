// Image Downloader
(function() {
  const images = [...new Set(Array.from(document.querySelectorAll('img[src]')).map(i => i.src).filter(s => s.startsWith('http')))];
  if (images.length === 0) { alert('No images found'); return; }
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
    background:'#161b22',border:'1px solid #30363d',borderRadius:'12px',
    padding:'20px',zIndex:'999999',maxWidth:'600px',width:'90%',maxHeight:'70vh',
    overflow:'auto',boxShadow:'0 8px 40px rgba(0,0,0,.6)'
  });
  panel.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-weight:700;color:#7c5cff">📸 ' + images.length + ' Images</span><span onclick="this.parentElement.parentElement.remove()" style="cursor:pointer;color:#8b949e">✕</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px">' +
    images.slice(0, 50).map(src => '<a href="'+src+'" target="_blank" download><img src="'+src+'" style="width:100%;height:80px;object-fit:cover;border-radius:6px;border:1px solid #30363d"></a>').join('') + '</div>';
  document.body.appendChild(panel);
})();