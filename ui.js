/* Hand-drawn, code-native pixel icons and character portraits. */
window.CheeseUI = (() => {
  const art = {
    cheese:'<path fill="#b5803f" d="M1 8 13 2l2 2v10L3 16l-2-2z"/><path fill="#efbe62" d="M3 10 15 4v9L3 15z"/><path fill="#ffe5a0" d="M1 8 13 2l2 2L3 10z"/><path fill="#cd9647" d="M1 8l2 2v5l-2-2z"/><path fill="#ac7937" d="M6 9h2v2H6zm5-3h2v2h-2zm0 5h2v2h-2z"/>',
    heart:'<path fill="#913f48" d="M2 2h4v2h4V2h4v2h2v5h-2v2h-2v2h-2v2H6v-2H4v-2H2V9H0V4h2z"/><path fill="#ef8674" d="M2 3h4v2h4V3h3v2h2v3h-2v2h-2v2H9v2H7v-2H5v-2H3V8H1V5h1z"/><path fill="#ffc4a0" d="M3 4h3v2H3z"/>',
    mushroom:'<path fill="#e2d4a0" d="M7 7h3v7H5v-2h2z"/><path fill="#9c4a43" d="M2 5h2V3h2V2h5v2h2v2h2v4H1V7h1z"/><path fill="#d97956" d="M3 5h2V3h5v2h2v2h2v2H2V7h1z"/><path fill="#ffdda0" d="M5 4h2v2H5zm5 3h2v2h-2zM3 7h2v2H3z"/>',
    berry:'<path fill="#739b67" d="M7 1h2v4h3V2h3v3h-3v2H8V5H4V2h3z"/><path fill="#a75576" d="M4 6h4v5H2V8h2zm6 0h4v2h2v4h-6zm-4 5h5v4H6z"/><path fill="#e598a0" d="M4 7h2v2H4zm7 0h2v2h-2zm-4 5h2v1H7z"/>',
    stew:'<path fill="#e9d7a4" d="M1 7h14v4h-2v2H3v-2H1z"/><path fill="#a77649" d="M2 7h12v3H2zM4 13h8v2H4z"/><path fill="#d4af64" d="M4 7h3v2H4zm5 1h3v1H9z"/><path fill="#faf0c2" d="M5 1h2v2H5zm3 3h2v2H8zm3-4h2v3h-2z"/>',
    sword:'<path fill="#709d9a" d="M11 1h4v4h-2v2h-2v2H9v2H7V9H5V7h2V5h2V3h2z"/><path fill="#e1e9bd" d="M12 2h2v2h-2v2h-2v2H8V6h2V4h2z"/><path fill="#ddb65e" d="M3 6h2v2h2v2h2v2H7v-2H5V8H3z"/><path fill="#aa7351" d="M3 10h2v3H2v2H0v-2h2v-2h1z"/>',
    boot:'<path fill="#deb975" d="M5 2h7v3H5z"/><path fill="#a66d45" d="M6 5h6v6h2v3H3v-3h3z"/><path fill="#ebce90" d="M7 6h3v2H7zm0 3h3v2H7z"/><path fill="#604c36" d="M3 14h12v2H3z"/>',
    charm:'<path fill="#a68d58" d="M4 1h2v4h4V1h2v5h-2v2H6V6H4z"/><path fill="#c76353" d="M5 7h6v2h2v4h-2v2H5v-2H3V9h2z"/><path fill="#f2b279" d="M6 8h4v2H6z"/>',
    herb:'<path fill="#c49d62" d="M7 5h2v10H7z"/><path fill="#97b876" d="M2 4h4v2h2v3H4V7H2zm7-2h4v4h-2v2H9zm0 8h5v2h-2v2H9z"/>',
    map:'<path fill="#b49f70" d="M1 3h4V1h5v2h5v11h-5v-2H6v2H1z"/><path fill="#eedfb0" d="M2 4h3v8H2zm4-2h3v9H6zm4 2h4v9h-4z"/><path fill="#86a078" d="M3 6h2v2H3zm4-2h2v3H7zm4 5h2v2h-2z"/>',
    book:'<path fill="#af704e" d="M2 2h12v13H2z"/><path fill="#f2d99b" d="M4 1h10v11H4z"/><path fill="#d3a155" d="M3 2h2v12H3zM7 4h5v1H7zm0 3h4v1H7z"/>',
    bag:'<path fill="#9b704a" d="M5 1h6v4H5zM3 5h10v2h2v8H1V7h2z"/><path fill="#d3a665" d="M5 6h6v2h3v5H2V8h3z"/><path fill="#f5d896" d="M7 3h2v2H7zm0 5h2v4H7z"/>',
    sound:'<path fill="currentColor" d="M1 6h3l4-4v12l-4-4H1zm9-2h2v2h-2zm2 2h2v4h-2zm-2 4h2v2h-2z"/>',
    flag:'<path fill="#a38b5a" d="M3 1h2v14H3z"/><path fill="#efc577" d="M5 2h8v6H5z"/><path fill="#bc8152" d="M10 8h4v2h-4z"/>',
    note:'<path fill="#e9d7a4" d="M3 1h8l3 3v11H3z"/><path fill="#aa8957" d="M6 5h5v1H6zm0 3h5v1H6zm0 3h3v1H6z"/>',
    lock:'<path fill="#d0b77e" d="M4 1h8v7h-2V3H6v5H4z"/><path fill="#9a8053" d="M2 7h12v8H2z"/><path fill="#f1d694" d="M7 9h2v4H7z"/>'
  };
  const icon = name => `<svg class="pixel-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false" shape-rendering="crispEdges">${art[name]||art.cheese}</svg>`;
  function portrait(canvas,npc){
    const c=canvas.getContext('2d');canvas.width=48;canvas.height=48;c.imageSmoothingEnabled=false;
    const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    r(0,0,48,48,'#263d36');r(3,3,42,42,'#344b3d');r(3,33,42,12,'#283d33');
    [[7,10],[39,7],[36,27],[9,29]].forEach(([x,y])=>r(x,y,2,2,'#6f8060'));
    if(!npc){r(13,9,22,31,'#9c8557');r(11,7,22,31,'#e6d19b');r(16,13,12,2,'#ad9160');r(16,19,12,2,'#ad9160');r(16,25,8,2,'#ad9160');r(25,29,5,5,'#bc6c4c');return;}
    if(npc.type==='fox'){
      r(12,32,24,13,'#6d7755');r(16,30,16,7,'#eee0b3');r(10,9,8,20,'#a7663d');r(30,9,8,20,'#a7663d');r(12,12,4,10,'#e6b884');r(32,12,4,10,'#e6b884');r(13,20,22,15,'#cb9156');r(9,25,30,6,'#cb9156');r(15,28,18,9,'#f0dcaf');r(18,32,12,7,'#f0dcaf');r(17,24,3,3,'#263b32');r(28,24,3,3,'#263b32');r(22,30,5,3,'#354435');r(21,41,7,3,'#d8b76c');return;
    }
    if(npc.type==='tiny'){
      r(12,18,24,22,'#ca6658');r(16,14,16,4,'#ca6658');r(9,23,30,12,'#ca6658');r(16,22,16,12,'#f2d89f');r(18,25,2,3,'#314237');r(28,25,2,3,'#314237');r(21,31,7,2,'#b48c57');r(14,40,6,5,'#795d41');r(28,40,6,5,'#795d41');r(11,12,8,3,'#ecd597');return;
    }
    const skin=npc.id==='nella'?'#c99873':npc.id==='marn'?'#d9ac7f':'#edc18b';
    r(11,35,26,10,npc.color);r(17,28,14,11,skin);r(14,17,20,15,skin);r(12,20,24,7,skin);r(17,23,3,3,'#293b32');r(28,23,3,3,'#293b32');r(22,29,5,1,'#ab7451');
    if(npc.type==='knight'){r(12,10,24,11,'#9ba594');r(15,7,18,5,'#c8cbb0');r(22,3,6,5,'#bf7054');r(12,18,4,16,'#8e998c');r(32,18,4,16,'#8e998c');r(17,34,14,6,'#d6b373');r(22,39,5,5,'#edce89');}
    else if(npc.id==='marn'){r(12,12,24,9,'#d7d3bb');r(10,17,5,13,'#d7d3bb');r(33,17,5,13,'#d7d3bb');r(15,9,18,5,'#ece1c3');r(20,35,9,10,'#f1d9aa');}
    else if(npc.id==='hollis'){r(14,12,21,9,'#6b6343');r(10,16,29,4,'#c5a657');r(17,9,15,8,'#d4ba6c');r(21,5,6,4,'#e3cf8b');r(17,22,6,5,'#5b6655');r(26,22,6,5,'#5b6655');r(23,23,3,1,'#dcd8ae');}
    else if(npc.id==='gert'){r(11,15,28,5,'#c0ac72');r(16,10,17,6,'#c0ac72');r(15,28,19,5,'#86734e');r(21,36,6,5,'#e7cb83');}
    else{r(14,11,21,9,'#574b3b');r(12,16,7,12,'#574b3b');r(29,16,6,4,'#574b3b');r(12,15,24,3,'#a8c5a4');r(16,34,17,4,'#d3e0b5');}
  }
  document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
  return {icon,portrait};
})();
