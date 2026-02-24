// Cookie Editor
(function() {
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(Boolean).map(c => {
    const [name, ...rest] = c.split('=');
    return { name: name.trim(), value: rest.join('=') };
  });
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
    background:'#161b22',border:'1px solid #30363d',borderRadius:'12px',
    padding:'20px',zIndex:'999999',maxWidth:'500px',width:'90%',maxHeight:'70vh',
    overflow:'auto',boxShadow:'0 8px 40px rgba(0,0,0,.6)',fontSize:'12px'
  });
  panel.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:12px;font-family:sans-serif"><span style="font-weight:700;color:#7c5cff">🍪 Cookies (' + cookies.length + ')</span><span onclick="this.parentElement.parentElement.remove()" style="cursor:pointer;color:#8b949e">✕</span></div>';
  cookies.forEach(c => {
    const row = document.createElement('div');
    row.style.cssText = 'padding:6px 0;border-bottom:1px solid #21283b;display:flex;justify-content:space-between;align-items:center;font-family:monospace';
    row.innerHTML = '<div style="flex:1;min-width:0"><strong style="color:#58a6ff">' + c.name + '</strong><br><span style="color:#8b949e;word-break:break-all">' + (c.value.length>50?c.value.substring(0,50)+'...':c.value) + '</span></div>';
    const del = document.createElement('button');
    del.textContent = '🗑';
    del.style.cssText = 'background:none;border:none;cursor:pointer;font-size:14px;margin-left:8px';
    del.onclick = () => { document.cookie = c.name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; row.remove(); };
    row.appendChild(del);
    panel.appendChild(row);
  });
  document.body.appendChild(panel);
})();
