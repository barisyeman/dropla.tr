const socket=io();
let myPeerId=null,roomId=null,deviceName='';
const peers=new Map(),netPeers=new Map();
let selectedFiles=[],targetPeerId=null,pendingRequest=null;
const peerConnections=new Map(),dataChannels=new Map();
let receivingBuffers={},receivingMeta={},sendQueue=[];
let myDeviceInfo={type:'desktop',deviceType:'desktop',deviceName:'Ben'};
let targetDeviceInfo={type:'desktop',deviceType:'desktop',deviceName:'Alıcı'};

const BLOCKED_EXT=['exe','bat','cmd','com','msi','scr','pif','vbs','vbe','js','jse','wsf','wsh','ps1','ps2','psc1','psc2','msh','msh1','msh2','inf','reg','rgs','sct','shb','shs','ws','lnk','cpl','hta','dll','sys','drv','ocx','cgi','sh','bash','shell','command','action','bin','osx','workflow','app','ipa','apk','deb','rpm'];
const ICE=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];

function detectDevice(){
  const u=navigator.userAgent;let t='unknown',b='Bilinmiyor',o='';
  if(/Mobi|Android/i.test(u))t='mobile';
  else if(/Tablet|iPad/i.test(u))t='tablet';
  else t='desktop';
  if(/Chrome/i.test(u)&&!/Edg/i.test(u))b='Chrome';
  else if(/Safari/i.test(u)&&!/Chrome/i.test(u))b='Safari';
  else if(/Firefox/i.test(u))b='Firefox';
  else if(/Edg/i.test(u))b='Edge';
  if(/Windows/i.test(u))o='Windows';
  else if(/Mac/i.test(u))o='macOS';
  else if(/Linux/i.test(u)&&!/Android/i.test(u))o='Linux';
  else if(/Android/i.test(u))o='Android';
  else if(/iPhone|iPad/i.test(u))o='iOS';
  return{type:t,browser:b,os:o,defaultName:`${o} ${b}`};
}

function devIcon(t){
  return{
    desktop:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    mobile:'<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/>',
    tablet:'<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/>',
    unknown:'<circle cx="12" cy="12" r="10"/>'
  }[t]||'<circle cx="12" cy="12" r="10"/>';
}

function avatarBg(t){
  return{
    desktop:'linear-gradient(145deg,#5856d6,#af52de)',
    mobile:'linear-gradient(145deg,#ff9500,#ff6723)',
    tablet:'linear-gradient(145deg,#34c759,#30d158)',
    unknown:'linear-gradient(145deg,#8e8e93,#636366)'
  }[t]||'linear-gradient(145deg,#8e8e93,#636366)';
}

/* ═══ Transfer Animation ═══ */
let tapAnimId=null;

function showTapOverlay(leftInfo, rightInfo, isSending, statusText, subText){
  // Set left avatar (sender)
  const la=document.getElementById('tapAvatarLeft');
  const lt=leftInfo.deviceType||leftInfo.type||'desktop';
  la.className='tap-avatar '+lt;
  la.style.background=avatarBg(lt);
  document.getElementById('tapIconLeft').innerHTML=devIcon(lt);
  document.getElementById('tapNameLeft').textContent=leftInfo.deviceName||'Gönderen';

  // Set right avatar (receiver)
  const ra=document.getElementById('tapAvatarRight');
  const rt=rightInfo.deviceType||rightInfo.type||'desktop';
  ra.className='tap-avatar '+rt;
  ra.style.background=avatarBg(rt);
  document.getElementById('tapIconRight').innerHTML=devIcon(rt);
  document.getElementById('tapNameRight').textContent=rightInfo.deviceName||'Alıcı';

  document.getElementById('tapStatus').textContent=statusText||'Aktarılıyor...';
  document.getElementById('tapProgBar').style.width='0%';
  const rb=document.getElementById('tapRingBar');if(rb)rb.style.strokeDashoffset='226.19';
  const rp=document.getElementById('tapRingPct');if(rp)rp.textContent='0%';
  const tf=document.getElementById('tapFilename');if(tf)tf.textContent='Hazırlanıyor...';
  document.getElementById('tapOverlay').classList.add('active');

  if(tapAnimId){cancelAnimationFrame(tapAnimId);tapAnimId=null;}
  runParticleAnim(isSending);
}

function runParticleAnim(isSending){
  const canvas=document.getElementById('tapCanvas');
  const ctx=canvas.getContext('2d');
  const wrap=canvas.parentElement;
  const W=Math.max(wrap.offsetWidth||120, 80);
  const H=68;
  canvas.width=W;canvas.height=H;

  const particles=[];
  let frameN=0;

  // Color: blue-purple for sending, green for receiving
  const hueBase=isSending?215:140;
  const saturation=isSending?85:78;
  const lightness=isSending?55:45;

  function spawn(){
    const y=H/2+(Math.random()-0.5)*36;
    const spd=2.2+Math.random()*2.8;
    const sz=1.8+Math.random()*2.8;
    const hue=hueBase+Math.floor((Math.random()-0.5)*25);
    const maxX=W-8;
    particles.push({x:8,y,vy:(Math.random()-0.5)*0.6,spd,sz,hue,alpha:0,maxX,done:false});
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    frameN++;

    // Dashed beam
    const g=ctx.createLinearGradient(0,H/2,W,H/2);
    g.addColorStop(0,`hsla(${hueBase},${saturation}%,${lightness}%,0.5)`);
    g.addColorStop(0.5,`hsla(${hueBase},${saturation}%,${lightness}%,0.15)`);
    g.addColorStop(1,`hsla(${hueBase},${saturation}%,${lightness}%,0.5)`);
    ctx.strokeStyle=g;ctx.lineWidth=1.5;
    ctx.setLineDash([5,9]);ctx.lineDashOffset=-frameN*0.6;
    ctx.beginPath();ctx.moveTo(8,H/2);ctx.lineTo(W-8,H/2);ctx.stroke();
    ctx.setLineDash([]);

    // Endpoint pulse rings
    const pulse=Math.sin(frameN*0.12)*3;
    [8,W-8].forEach(px=>{
      ctx.beginPath();ctx.arc(px,H/2,7+pulse,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${hueBase},${saturation}%,${lightness}%,0.5)`;ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.arc(px,H/2,3,0,Math.PI*2);
      ctx.fillStyle=`hsla(${hueBase},${saturation}%,${lightness}%,0.9)`;ctx.fill();
    });

    // Spawn
    if(frameN%2===0)spawn();
    if(frameN%4===0)spawn();

    // Update particles
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.x+=p.spd;p.y+=p.vy;
      const prog=p.x/p.maxX;
      p.alpha=prog<0.12?(prog/0.12):prog>0.88?((1-prog)/0.12):1;
      if(p.x>=p.maxX){particles.splice(i,1);continue;}

      // Glow halo
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz*2.8,0,Math.PI*2);
      ctx.fillStyle=`hsla(${p.hue},${saturation}%,${lightness}%,${p.alpha*0.2})`;ctx.fill();
      // Core dot
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);
      ctx.fillStyle=`hsla(${p.hue},${saturation}%,${lightness}%,${p.alpha})`;ctx.fill();
      // Bright center
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz*0.38,0,Math.PI*2);
      ctx.fillStyle=`hsla(${p.hue},${saturation}%,${Math.min(lightness+30,90)}%,${p.alpha*0.7})`;ctx.fill();
    }

    tapAnimId=requestAnimationFrame(draw);
  }
  draw();
}

function updateTapProgress(pct, filename){
  document.getElementById('tapProgBar').style.width=pct+'%';
  const bar=document.getElementById('tapRingBar');
  if(bar) bar.style.strokeDashoffset=226.19-(pct/100)*226.19;
  const lbl=document.getElementById('tapRingPct');
  if(lbl) lbl.textContent=pct+'%';
  if(filename){const fn=document.getElementById('tapFilename');if(fn)fn.textContent=filename;}
}

function stopTapAnim(){
  if(tapAnimId){cancelAnimationFrame(tapAnimId);tapAnimId=null;}
  document.getElementById('tapOverlay').classList.remove('active');
}

/* ═══ Init ═══ */
function init(){
  const d=detectDevice();
  deviceName=d.defaultName;
  myDeviceInfo={type:d.type,deviceType:d.type,deviceName,browser:d.browser,os:d.os};
  document.getElementById('navDevIcon').innerHTML=devIcon(d.type);
  document.getElementById('navDevName').textContent=deviceName;
  const r=new URLSearchParams(location.search).get('room');
  r?joinRoom(r,d):createRoom(d);
  setupDrop();setupSocket();
}

function createRoom(d){
  socket.emit('create-room',{deviceName,deviceType:d.type,browser:d.browser,os:d.os},r=>{
    roomId=r.roomId;myPeerId=r.peerId;updateLink();
    if(r.networkPeers)r.networkPeers.forEach(p=>{if(p.id!==myPeerId)netPeers.set(p.id,p)});
    renderNetPeers();
  });
}
function joinRoom(room,d){
  socket.emit('join-room',{roomId:room,peerInfo:{deviceName,deviceType:d.type,browser:d.browser,os:d.os}},r=>{
    if(r.error){showToast('Oda bulunamadı!');createRoom(d);return;}
    roomId=room;myPeerId=r.peerId;updateLink();
    r.peers.forEach(p=>peers.set(p.id,p));
    if(r.networkPeers)r.networkPeers.forEach(p=>{if(p.id!==myPeerId)netPeers.set(p.id,p)});
    renderPeers();renderNetPeers();
  });
}
function updateLink(){
  const url=`${location.origin}?room=${roomId}`;
  document.getElementById('shareLink').textContent=url;
  try{new QRious({element:document.getElementById('qrCanvas'),value:url,size:200,foreground:'#1d1d1f',background:'#ffffff',level:'M'})}catch(e){}
}

function toggleNameEdit(){
  const bar=document.getElementById('nameEditBar');
  if(bar.classList.contains('open')){bar.classList.remove('open');}
  else{bar.classList.add('open');const inp=document.getElementById('nameInput');inp.value=deviceName;setTimeout(()=>{inp.focus();inp.select();},100);}
}
function saveName(){
  const v=document.getElementById('nameInput').value.trim()||deviceName;
  deviceName=v;myDeviceInfo.deviceName=v;
  document.getElementById('navDevName').textContent=v;
  document.getElementById('nameEditBar').classList.remove('open');
  socket.emit('update-device-name',v);showToast('Cihaz adı güncellendi');
}

function setupSocket(){
  socket.on('peer-joined',p=>{peers.set(p.id,p);renderPeers();showToast(`${p.deviceName} bağlandı`)});
  socket.on('peer-left',d=>{const p=peers.get(d.id);if(p)showToast(`${p.deviceName} ayrıldı`);peers.delete(d.id);cleanPC(d.id);renderPeers()});
  socket.on('peer-updated',d=>{const p=peers.get(d.id);if(p){p.deviceName=d.deviceName;renderPeers()}});
  socket.on('network-peer-joined',p=>{if(p.id!==myPeerId){netPeers.set(p.id,p);renderNetPeers()}});
  socket.on('network-peer-left',d=>{netPeers.delete(d.id);renderNetPeers()});
  socket.on('network-peer-updated',d=>{const p=netPeers.get(d.id);if(p){p.deviceName=d.deviceName;renderNetPeers()}});

  socket.on('rtc-offer',async d=>{
    const pc=makePC(d.from,false);
    await pc.setRemoteDescription(new RTCSessionDescription(d.offer));
    const a=await pc.createAnswer();
    await pc.setLocalDescription(a);
    socket.emit('rtc-answer',{to:d.from,answer:a});
  });
  socket.on('rtc-answer',async d=>{const pc=peerConnections.get(d.from);if(pc)await pc.setRemoteDescription(new RTCSessionDescription(d.answer))});
  socket.on('rtc-ice-candidate',d=>{const pc=peerConnections.get(d.from);if(pc&&d.candidate)pc.addIceCandidate(new RTCIceCandidate(d.candidate))});

  socket.on('file-request',d=>{
    pendingRequest=d;
    const senderPeer=peers.get(d.from)||netPeers.get(d.from)||{deviceName:d.senderName,deviceType:'unknown'};
    pendingRequest.senderPeerInfo=senderPeer;
    document.getElementById('senderNameEl').textContent=d.senderName;
    document.getElementById('incomingList').innerHTML=d.files.map(f=>`<div class="inc-item"><div class="inc-dot"></div><span>${esc(f.name)} (${fmtSize(f.size)})</span></div>`).join('');
    document.getElementById('receiveOverlay').classList.add('open');
  });

  socket.on('file-response',async d=>{
    if(d.accepted){
      showToast('Kabul edildi!');
      // My device (left) → target device (right)
      const receiverInfo=peers.get(targetPeerId)||netPeers.get(targetPeerId)||targetDeviceInfo;
      showTapOverlay(myDeviceInfo, receiverInfo, true, 'Gönderiliyor...', 'Dosya güvenli şekilde aktarılıyor');
      await startTransfer(d.from);
    }else{
      showToast('Reddedildi');closeSendModal();
    }
  });
}

function makePC(pid,init){
  if(peerConnections.has(pid))peerConnections.get(pid).close();
  const pc=new RTCPeerConnection({iceServers:ICE});
  peerConnections.set(pid,pc);
  pc.onicecandidate=e=>{if(e.candidate)socket.emit('rtc-ice-candidate',{to:pid,candidate:e.candidate})};
  pc.ondatachannel=e=>setupDC(e.channel,pid);
  if(init){setupDC(pc.createDataChannel('ft',{ordered:true,maxRetransmits:30}),pid);}
  return pc;
}
function setupDC(ch,pid){
  ch.binaryType='arraybuffer';dataChannels.set(pid,ch);
  ch.onopen=()=>{if(sendQueue.length)processSend(pid)};
  ch.onmessage=e=>handleData(e.data);
}
function cleanPC(pid){const pc=peerConnections.get(pid);if(pc)pc.close();peerConnections.delete(pid);dataChannels.delete(pid);}

const CHUNK=262144;
async function startTransfer(pid){
  showProgress();
  const pc=makePC(pid,true);
  const o=await pc.createOffer();await pc.setLocalDescription(o);
  socket.emit('rtc-offer',{to:pid,offer:o});
  sendQueue=[...selectedFiles];
  await new Promise(r=>{
    const i=setInterval(()=>{const dc=dataChannels.get(pid);if(dc?.readyState==='open'){clearInterval(i);r();}},100);
    setTimeout(()=>{clearInterval(i);r()},10000);
  });
  processSend(pid);
}

async function processSend(pid){
  const dc=dataChannels.get(pid);
  if(!dc||dc.readyState!=='open')return;
  const total=sendQueue.reduce((a,f)=>a+f.size,0);
  let sent=0,lastProg=0;
  for(let i=0;i<sendQueue.length;i++){
    const f=sendQueue[i];
    dc.send(JSON.stringify({type:'file-meta',name:f.name,size:f.size,mimeType:f.type,index:i,total:sendQueue.length}));
    const buf=await f.arrayBuffer();let off=0;
    while(off<buf.byteLength){
      if(dc.bufferedAmount>1048576){await new Promise(r=>setTimeout(r,10));continue;}
      const end=Math.min(off+CHUNK,buf.byteLength);const c=buf.slice(off,end);
      dc.send(c);off=end;sent+=c.byteLength;
      const pct=Math.round(sent/total*100);
      if(pct!==lastProg){lastProg=pct;updateProg(pct,f.name);updateTapProgress(pct,f.name);}
    }
    dc.send(JSON.stringify({type:'file-end',index:i}));
  }
  dc.send(JSON.stringify({type:'transfer-complete'}));
  setTimeout(()=>{stopTapAnim();showComplete('Gönderildi!');},400);
}

function handleData(data){
  if(typeof data==='string'){
    const m=JSON.parse(data);
    if(m.type==='file-meta'){
      receivingMeta[m.index]=m;receivingBuffers[m.index]=[];
      if(m.index===0){
        // Animasyon zaten respondToRequest'te başladı, sadece statusu güncelle
        const st=document.getElementById('tapStatus');if(st)st.textContent='Alınıyor...';
        showProgress();
      }
      const fn=document.getElementById('tapFilename');if(fn)fn.textContent=m.name;
      document.getElementById('transferTitle').textContent=`${m.name} alınıyor...`;
    }else if(m.type==='file-end'){
      const meta=receivingMeta[m.index];
      const blob=new Blob(receivingBuffers[m.index],{type:meta.mimeType});
      dlFile(blob,meta.name);delete receivingBuffers[m.index];delete receivingMeta[m.index];
    }else if(m.type==='transfer-complete'){
      stopTapAnim();showComplete('Alındı!');
    }
  }else{
    const idx=Object.keys(receivingBuffers).pop();
    if(idx!==undefined){
      receivingBuffers[idx].push(data);
      const meta=receivingMeta[idx];
      if(meta){
        const got=receivingBuffers[idx].reduce((a,b)=>a+b.byteLength,0);
        const pct=Math.round(got/meta.size*100);
        updateProg(pct,meta.name);updateTapProgress(pct,meta.name);
      }
    }
  }
}
function dlFile(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);}

function renderPeerCard(p,isNet){
  const netTag=isNet?`<div class="net-tag">Yerel Ağ</div>`:'';
  return`<div class="peer-card" onclick="openSendModal('${p.id}')">
  ${netTag}
  <div class="avatar ${p.deviceType}"><div class="pulse-ring"></div><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${devIcon(p.deviceType)}</svg></div>
  <div class="p-name">${esc(p.deviceName)}</div>
  <div class="p-sub">${p.os} · ${p.browser}</div>
  <div class="send-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Gönder</div>
</div>`;
}

function renderPeers(){
  const el=document.getElementById('peersContent');
  const cnt=document.getElementById('peerCount');
  if(peers.size>0){cnt.style.display='';cnt.textContent=peers.size;}else{cnt.style.display='none';}
  if(!peers.size){el.innerHTML=`<div class="peers-empty-state"><div class="radar"><div class="radar-circle"></div><div class="radar-circle"></div><div class="radar-circle"></div><div class="radar-circle"></div><div class="radar-center"></div><div class="radar-sweep"></div><div class="floating-dot fd1"></div><div class="floating-dot fd2"></div><div class="floating-dot fd3"></div></div><div class="empty-title">Cihaz aranıyor...</div><div class="empty-desc">Paylaşım linkini göndererek veya QR kodu okutarak başka cihazları bağlayın</div></div>`;return;}
  el.innerHTML='<div class="peer-grid">'+Array.from(peers.values()).map(p=>renderPeerCard(p,false)).join('')+'</div>';
}

function renderNetPeers(){
  const sec=document.getElementById('networkSection');
  const grid=document.getElementById('netPeersGrid');
  const cnt=document.getElementById('netCount');
  const uniqueNet=Array.from(netPeers.values()).filter(p=>!peers.has(p.id));
  if(!uniqueNet.length){sec.style.display='none';return;}
  sec.style.display='';cnt.textContent=uniqueNet.length;
  grid.innerHTML=uniqueNet.map(p=>renderPeerCard(p,true)).join('');
}

function openSendModal(pid){
  targetPeerId=pid;selectedFiles=[];
  document.getElementById('fileList').innerHTML='';
  document.getElementById('sendBtn').disabled=true;
  const p=peers.get(pid)||netPeers.get(pid);
  targetDeviceInfo=p||{deviceName:'Alıcı',deviceType:'unknown'};
  document.getElementById('sendTargetName').textContent=p?p.deviceName:'';
  document.getElementById('sendOverlay').classList.add('open');
}
function closeSendModal(){document.getElementById('sendOverlay').classList.remove('open');selectedFiles=[];targetPeerId=null;}
function sendFileRequest(){
  if(!targetPeerId||!selectedFiles.length)return;
  socket.emit('file-request',{to:targetPeerId,files:selectedFiles.map(f=>({name:f.name,size:f.size,type:f.type})),senderName:deviceName});
  document.getElementById('sendOverlay').classList.remove('open');
  showToast('İstek gönderildi...');
}
function respondToRequest(ok){
  document.getElementById('receiveOverlay').classList.remove('open');
  socket.emit('file-response',{to:pendingRequest.from,accepted:ok});
  if(ok){
    // Alıcı tarafında hemen animasyonu başlat — gönderenden gelecek
    const senderInfo=pendingRequest.senderPeerInfo||{deviceName:'Gönderen',deviceType:'unknown'};
    showTapOverlay(senderInfo, myDeviceInfo, false, 'Bekleniyor...', 'Dosya geliyor...');
  }
}

function showProgress(){
  document.getElementById('transferOverlay').classList.add('open');
  document.getElementById('transferBox').innerHTML=`<div class="prw"><svg viewBox="0 0 110 110"><circle class="pr-track" cx="55" cy="55" r="46" fill="none" stroke-width="6"/><circle class="pr-bar" id="progressBar" cx="55" cy="55" r="46" fill="none" stroke-width="6" stroke-dasharray="289.03" stroke-dashoffset="289.03"/></svg><div class="pr-lbl" id="progressLabel">0%</div></div><div class="tf-title" id="transferTitle">Aktarılıyor...</div><div class="tf-file" id="transferFile"></div>`;
}
function updateProg(pct,fname){
  const b=document.getElementById('progressBar');if(b)b.style.strokeDashoffset=289.03-(pct/100)*289.03;
  const l=document.getElementById('progressLabel');if(l)l.textContent=pct+'%';
  const f=document.getElementById('transferFile');if(f&&fname)f.textContent=fname;
}
function showComplete(msg){
  document.getElementById('transferBox').innerHTML=`<div class="done-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><div class="tf-title">${msg}</div><div class="tf-file">Transfer tamamlandı</div><button class="btn-done" onclick="closeTransfer()">Tamam</button>`;
}
function closeTransfer(){document.getElementById('transferOverlay').classList.remove('open');selectedFiles=[];sendQueue=[];}

function setupDrop(){
  const z=document.getElementById('dropZone'),inp=document.getElementById('fileInput');
  z.ondragover=e=>{e.preventDefault();z.classList.add('over')};
  z.ondragleave=()=>z.classList.remove('over');
  z.ondrop=e=>{e.preventDefault();z.classList.remove('over');addFiles(e.dataTransfer.files)};
  inp.onchange=()=>{addFiles(inp.files);inp.value='';};
}
function addFiles(fl){for(const f of fl)selectedFiles.push(f);renderFiles();}
function removeFile(i){selectedFiles.splice(i,1);renderFiles();}
function isBlocked(name){const e=name.split('.').pop().toLowerCase();return BLOCKED_EXT.includes(e);}
function renderFiles(){
  const validFiles=selectedFiles.filter(f=>!isBlocked(f.name));
  document.getElementById('sendBtn').disabled=!validFiles.length;
  document.getElementById('fileList').innerHTML=selectedFiles.map((f,i)=>{
    const blocked=isBlocked(f.name);
    return`<div class="file-entry${blocked?' blocked':''}">
      <div class="file-badge ${blocked?'danger':fileCls(f.name)}">${blocked?'⚠':fileExt(f.name)}</div>
      <div class="fm"><div class="name">${esc(f.name)}</div><div class="size">${fmtSize(f.size)}</div>${blocked?'<div class="blocked-msg">Bu dosya türü güvenlik nedeniyle engellenmiştir</div>':''}</div>
      <button class="btn-rm" onclick="removeFile(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`;
  }).join('');
  selectedFiles=selectedFiles.filter(f=>!isBlocked(f.name));
  if(selectedFiles.length===0)document.getElementById('sendBtn').disabled=true;
}

function fileCls(n){const e=n.split('.').pop().toLowerCase();if('jpg jpeg png gif svg webp bmp'.includes(e))return'img';if('doc docx pdf txt rtf md'.includes(e))return'doc';if('mp4 avi mov mkv wmv webm'.includes(e))return'vid';if('zip rar 7z tar gz'.includes(e))return'zip';return'oth';}
function fileExt(n){return n.split('.').pop().toUpperCase().slice(0,4);}
function fmtSize(b){if(!b)return'0 B';const k=1024,s=['B','KB','MB','GB'];const i=Math.floor(Math.log(b)/Math.log(k));return parseFloat((b/Math.pow(k,i)).toFixed(1))+' '+s[i];}
function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function copyLink(){
  navigator.clipboard.writeText(`${location.origin}?room=${roomId}`).then(()=>{
    const b=document.getElementById('copyBtn'),l=document.getElementById('copyLabel');
    b.classList.add('copied');l.textContent='Kopyalandı!';
    setTimeout(()=>{b.classList.remove('copied');l.textContent='Kopyala';},2000);
  });
}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);}

init();