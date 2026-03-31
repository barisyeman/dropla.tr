'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Footer from './Footer';

// ─── Constants ───
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const BLOCKED_EXT = ['exe','bat','cmd','com','msi','scr','pif','vbs','vbe','js','jse','wsf','wsh','ps1','ps2','psc1','psc2','msh','msh1','msh2','inf','reg','rgs','sct','shb','shs','ws','lnk','cpl','hta','dll','sys','drv','ocx','cgi','sh','bash','shell','command','action','bin','osx','workflow','app','ipa','apk','deb','rpm'];
const ICE = [{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
const CHUNK = 262144;

interface PeerInfo {
  id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  roomId?: string;
  ip?: string;
}

interface FileRequest {
  from: string;
  files: { name: string; size: number; type: string }[];
  senderName: string;
  senderPeerInfo?: PeerInfo;
}

// ─── Helpers ───
function detectDevice() {
  const u = navigator.userAgent;
  let t = 'unknown', b = 'Bilinmiyor', o = '';
  if (/Mobi|Android/i.test(u)) t = 'mobile';
  else if (/Tablet|iPad/i.test(u)) t = 'tablet';
  else t = 'desktop';
  if (/Chrome/i.test(u) && !/Edg/i.test(u)) b = 'Chrome';
  else if (/Safari/i.test(u) && !/Chrome/i.test(u)) b = 'Safari';
  else if (/Firefox/i.test(u)) b = 'Firefox';
  else if (/Edg/i.test(u)) b = 'Edge';
  if (/Windows/i.test(u)) o = 'Windows';
  else if (/Mac/i.test(u)) o = 'macOS';
  else if (/Linux/i.test(u) && !/Android/i.test(u)) o = 'Linux';
  else if (/Android/i.test(u)) o = 'Android';
  else if (/iPhone|iPad/i.test(u)) o = 'iOS';
  return { type: t, browser: b, os: o, defaultName: `${o} ${b}` };
}

function devIcon(t: string) {
  const icons: Record<string, string> = {
    desktop: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    mobile: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/>',
    unknown: '<circle cx="12" cy="12" r="10"/>',
  };
  return icons[t] || icons.unknown;
}

function avatarBg(t: string) {
  const bgs: Record<string, string> = {
    desktop: 'linear-gradient(145deg,#5856d6,#af52de)',
    mobile: 'linear-gradient(145deg,#ff9500,#ff6723)',
    tablet: 'linear-gradient(145deg,#34c759,#30d158)',
    unknown: 'linear-gradient(145deg,#8e8e93,#636366)',
  };
  return bgs[t] || bgs.unknown;
}

function isBlocked(name: string) {
  const e = name.split('.').pop()?.toLowerCase() || '';
  return BLOCKED_EXT.includes(e);
}

function fileCls(n: string) {
  const e = n.split('.').pop()?.toLowerCase() || '';
  if ('jpg jpeg png gif svg webp bmp'.includes(e)) return 'img';
  if ('doc docx pdf txt rtf md'.includes(e)) return 'doc';
  if ('mp4 avi mov mkv wmv webm'.includes(e)) return 'vid';
  if ('zip rar 7z tar gz'.includes(e)) return 'zip';
  return 'oth';
}

function fileExt(n: string) {
  return (n.split('.').pop() || '').toUpperCase().slice(0, 4);
}

function fmtSize(b: number) {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
}

function esc(t: string) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

// ─── Main Component ───
export default function DropApp() {
  // Refs for mutable state that doesn't need re-renders
  const socketRef = useRef<Socket | null>(null);
  const myPeerIdRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const deviceNameRef = useRef('');
  const peersRef = useRef<Map<string, PeerInfo>>(new Map());
  const netPeersRef = useRef<Map<string, PeerInfo>>(new Map());
  const selectedFilesRef = useRef<File[]>([]);
  const targetPeerIdRef = useRef<string | null>(null);
  const pendingRequestRef = useRef<FileRequest | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const receivingBuffersRef = useRef<Record<string, ArrayBuffer[]>>({});
  const receivingMetaRef = useRef<Record<string, { name: string; size: number; mimeType: string; index: number; total: number }>>({});
  const sendQueueRef = useRef<File[]>([]);
  const myDeviceInfoRef = useRef({ type: 'desktop', deviceType: 'desktop', deviceName: 'Ben', browser: '', os: '' });
  const targetDeviceInfoRef = useRef({ type: 'desktop', deviceType: 'desktop', deviceName: 'Alıcı' });
  const tapAnimIdRef = useRef<number | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const tapCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initDoneRef = useRef(false);

  // State for UI re-renders
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate(c => c + 1), []);

  // ─── Toast ───
  const showToast = useCallback((msg: string) => {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }, []);

  // ─── QR Code ───
  const updateLink = useCallback(() => {
    const url = `${window.location.origin}?room=${roomIdRef.current}`;
    const el = document.getElementById('shareLink');
    if (el) el.textContent = url;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const QRious = (window as any).QRious;
      if (QRious && qrCanvasRef.current) {
        new QRious({ element: qrCanvasRef.current, value: url, size: 200, foreground: '#1d1d1f', background: '#ffffff', level: 'M' });
      }
    } catch {}
  }, []);

  // ─── Transfer Animation ───
  const runParticleAnim = useCallback((isSending: boolean) => {
    const canvas = tapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const wrap = canvas.parentElement;
    const W = Math.max(wrap?.offsetWidth || 120, 80);
    const H = 68;
    canvas.width = W;
    canvas.height = H;

    const particles: { x: number; y: number; vy: number; spd: number; sz: number; hue: number; alpha: number; maxX: number }[] = [];
    let frameN = 0;
    const hueBase = isSending ? 215 : 140;
    const saturation = isSending ? 85 : 78;
    const lightness = isSending ? 55 : 45;

    function spawn() {
      const y = H / 2 + (Math.random() - 0.5) * 36;
      const spd = 2.2 + Math.random() * 2.8;
      const sz = 1.8 + Math.random() * 2.8;
      const hue = hueBase + Math.floor((Math.random() - 0.5) * 25);
      particles.push({ x: 8, y, vy: (Math.random() - 0.5) * 0.6, spd, sz, hue, alpha: 0, maxX: W - 8 });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      frameN++;
      const g = ctx!.createLinearGradient(0, H / 2, W, H / 2);
      g.addColorStop(0, `hsla(${hueBase},${saturation}%,${lightness}%,0.5)`);
      g.addColorStop(0.5, `hsla(${hueBase},${saturation}%,${lightness}%,0.15)`);
      g.addColorStop(1, `hsla(${hueBase},${saturation}%,${lightness}%,0.5)`);
      ctx!.strokeStyle = g; ctx!.lineWidth = 1.5;
      ctx!.setLineDash([5, 9]); ctx!.lineDashOffset = -frameN * 0.6;
      ctx!.beginPath(); ctx!.moveTo(8, H / 2); ctx!.lineTo(W - 8, H / 2); ctx!.stroke();
      ctx!.setLineDash([]);

      const pulse = Math.sin(frameN * 0.12) * 3;
      [8, W - 8].forEach(px => {
        ctx!.beginPath(); ctx!.arc(px, H / 2, 7 + pulse, 0, Math.PI * 2);
        ctx!.strokeStyle = `hsla(${hueBase},${saturation}%,${lightness}%,0.5)`; ctx!.lineWidth = 1.5; ctx!.stroke();
        ctx!.beginPath(); ctx!.arc(px, H / 2, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hueBase},${saturation}%,${lightness}%,0.9)`; ctx!.fill();
      });

      if (frameN % 2 === 0) spawn();
      if (frameN % 4 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.spd; p.y += p.vy;
        const prog = p.x / p.maxX;
        p.alpha = prog < 0.12 ? (prog / 0.12) : prog > 0.88 ? ((1 - prog) / 0.12) : 1;
        if (p.x >= p.maxX) { particles.splice(i, 1); continue; }
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.sz * 2.8, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue},${saturation}%,${lightness}%,${p.alpha * 0.2})`; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue},${saturation}%,${lightness}%,${p.alpha})`; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.sz * 0.38, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue},${saturation}%,${Math.min(lightness + 30, 90)}%,${p.alpha * 0.7})`; ctx!.fill();
      }
      tapAnimIdRef.current = requestAnimationFrame(draw);
    }
    draw();
  }, []);

  const showTapOverlay = useCallback((leftInfo: { deviceType?: string; type?: string; deviceName?: string }, rightInfo: { deviceType?: string; type?: string; deviceName?: string }, isSending: boolean, statusText?: string) => {
    const la = document.getElementById('tapAvatarLeft');
    const lt = leftInfo.deviceType || leftInfo.type || 'desktop';
    if (la) { la.className = 'tap-avatar ' + lt; la.style.background = avatarBg(lt); }
    const il = document.getElementById('tapIconLeft');
    if (il) il.innerHTML = devIcon(lt);
    const nl = document.getElementById('tapNameLeft');
    if (nl) nl.textContent = leftInfo.deviceName || 'Gönderen';

    const ra = document.getElementById('tapAvatarRight');
    const rt = rightInfo.deviceType || rightInfo.type || 'desktop';
    if (ra) { ra.className = 'tap-avatar ' + rt; ra.style.background = avatarBg(rt); }
    const ir = document.getElementById('tapIconRight');
    if (ir) ir.innerHTML = devIcon(rt);
    const nr = document.getElementById('tapNameRight');
    if (nr) nr.textContent = rightInfo.deviceName || 'Alıcı';

    const st = document.getElementById('tapStatus');
    if (st) st.textContent = statusText || 'Aktarılıyor...';
    const pb = document.getElementById('tapProgBar');
    if (pb) (pb as HTMLElement).style.width = '0%';
    const rb = document.getElementById('tapRingBar');
    if (rb) (rb as unknown as HTMLElement).style.strokeDashoffset = '226.19';
    const rp = document.getElementById('tapRingPct');
    if (rp) rp.textContent = '0%';
    const tf = document.getElementById('tapFilename');
    if (tf) tf.textContent = 'Hazırlanıyor...';

    document.getElementById('tapOverlay')?.classList.add('active');

    if (tapAnimIdRef.current) { cancelAnimationFrame(tapAnimIdRef.current); tapAnimIdRef.current = null; }
    runParticleAnim(isSending);
  }, [runParticleAnim]);

  const updateTapProgress = useCallback((pct: number, filename?: string) => {
    const pb = document.getElementById('tapProgBar');
    if (pb) (pb as HTMLElement).style.width = pct + '%';
    const bar = document.getElementById('tapRingBar');
    if (bar) (bar as unknown as HTMLElement).style.strokeDashoffset = String(226.19 - (pct / 100) * 226.19);
    const lbl = document.getElementById('tapRingPct');
    if (lbl) lbl.textContent = pct + '%';
    if (filename) {
      const fn = document.getElementById('tapFilename');
      if (fn) fn.textContent = filename;
    }
  }, []);

  const stopTapAnim = useCallback(() => {
    if (tapAnimIdRef.current) { cancelAnimationFrame(tapAnimIdRef.current); tapAnimIdRef.current = null; }
    document.getElementById('tapOverlay')?.classList.remove('active');
  }, []);

  // ─── WebRTC ───
  const setupDC = useCallback((ch: RTCDataChannel, pid: string) => {
    ch.binaryType = 'arraybuffer';
    dataChannelsRef.current.set(pid, ch);
    ch.onopen = () => {
      if (sendQueueRef.current.length) processSendFn(pid);
    };
    ch.onmessage = (e) => handleDataFn(e.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makePC = useCallback((pid: string, init: boolean) => {
    if (peerConnectionsRef.current.has(pid)) peerConnectionsRef.current.get(pid)!.close();
    const pc = new RTCPeerConnection({ iceServers: ICE });
    peerConnectionsRef.current.set(pid, pc);
    pc.onicecandidate = (e) => {
      if (e.candidate) socketRef.current?.emit('rtc-ice-candidate', { to: pid, candidate: e.candidate });
    };
    pc.ondatachannel = (e) => setupDC(e.channel, pid);
    if (init) setupDC(pc.createDataChannel('ft', { ordered: true, maxRetransmits: 30 }), pid);
    return pc;
  }, [setupDC]);

  const cleanPC = useCallback((pid: string) => {
    const pc = peerConnectionsRef.current.get(pid);
    if (pc) pc.close();
    peerConnectionsRef.current.delete(pid);
    dataChannelsRef.current.delete(pid);
  }, []);

  // ─── Progress UI ───
  const showProgress = useCallback(() => {
    document.getElementById('transferOverlay')?.classList.add('open');
    const box = document.getElementById('transferBox');
    if (box) box.innerHTML = `<div class="prw"><svg viewBox="0 0 110 110"><circle class="pr-track" cx="55" cy="55" r="46" fill="none" stroke-width="6"/><circle class="pr-bar" id="progressBar" cx="55" cy="55" r="46" fill="none" stroke-width="6" stroke-dasharray="289.03" stroke-dashoffset="289.03"/></svg><div class="pr-lbl" id="progressLabel">0%</div></div><div class="tf-title" id="transferTitle">Aktarılıyor...</div><div class="tf-file" id="transferFile"></div>`;
  }, []);

  const updateProg = useCallback((pct: number, fname?: string) => {
    const b = document.getElementById('progressBar');
    if (b) (b as unknown as HTMLElement).style.strokeDashoffset = String(289.03 - (pct / 100) * 289.03);
    const l = document.getElementById('progressLabel');
    if (l) l.textContent = pct + '%';
    const f = document.getElementById('transferFile');
    if (f && fname) f.textContent = fname;
  }, []);

  const showComplete = useCallback((msg: string) => {
    const box = document.getElementById('transferBox');
    if (box) box.innerHTML = `<div class="done-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><div class="tf-title">${msg}</div><div class="tf-file">Transfer tamamlandı</div><button class="btn-done" id="btnDone">Tamam</button>`;
    document.getElementById('btnDone')?.addEventListener('click', () => {
      document.getElementById('transferOverlay')?.classList.remove('open');
      selectedFilesRef.current = [];
      sendQueueRef.current = [];
    });
  }, []);

  // ─── Download file ───
  const dlFile = useCallback((blob: Blob, name: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  // ─── Handle incoming data ───
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleDataFn(data: string | ArrayBuffer) {
    if (typeof data === 'string') {
      const m = JSON.parse(data);
      if (m.type === 'file-meta') {
        receivingMetaRef.current[m.index] = m;
        receivingBuffersRef.current[m.index] = [];
        if (m.index === 0) {
          const st = document.getElementById('tapStatus');
          if (st) st.textContent = 'Alınıyor...';
          showProgress();
        }
        const fn = document.getElementById('tapFilename');
        if (fn) fn.textContent = m.name;
        const tt = document.getElementById('transferTitle');
        if (tt) tt.textContent = `${m.name} alınıyor...`;
      } else if (m.type === 'file-end') {
        const meta = receivingMetaRef.current[m.index];
        const blob = new Blob(receivingBuffersRef.current[m.index], { type: meta.mimeType });
        dlFile(blob, meta.name);
        delete receivingBuffersRef.current[m.index];
        delete receivingMetaRef.current[m.index];
      } else if (m.type === 'transfer-complete') {
        stopTapAnim();
        showComplete('Alındı!');
      }
    } else {
      const idx = Object.keys(receivingBuffersRef.current).pop();
      if (idx !== undefined) {
        receivingBuffersRef.current[idx].push(data);
        const meta = receivingMetaRef.current[idx];
        if (meta) {
          const got = receivingBuffersRef.current[idx].reduce((a, b) => a + b.byteLength, 0);
          const pct = Math.round(got / meta.size * 100);
          updateProg(pct, meta.name);
          updateTapProgress(pct, meta.name);
        }
      }
    }
  }

  // ─── Send files ───
  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function processSendFn(pid: string) {
    const dc = dataChannelsRef.current.get(pid);
    if (!dc || dc.readyState !== 'open') return;
    const total = sendQueueRef.current.reduce((a, f) => a + f.size, 0);
    let sent = 0, lastProg = 0;
    for (let i = 0; i < sendQueueRef.current.length; i++) {
      const f = sendQueueRef.current[i];
      dc.send(JSON.stringify({ type: 'file-meta', name: f.name, size: f.size, mimeType: f.type, index: i, total: sendQueueRef.current.length }));
      const buf = await f.arrayBuffer();
      let off = 0;
      while (off < buf.byteLength) {
        if (dc.bufferedAmount > 1048576) { await new Promise(r => setTimeout(r, 10)); continue; }
        const end = Math.min(off + CHUNK, buf.byteLength);
        const c = buf.slice(off, end);
        dc.send(c);
        off = end;
        sent += c.byteLength;
        const pct = Math.round(sent / total * 100);
        if (pct !== lastProg) { lastProg = pct; updateProg(pct, f.name); updateTapProgress(pct, f.name); }
      }
      dc.send(JSON.stringify({ type: 'file-end', index: i }));
    }
    dc.send(JSON.stringify({ type: 'transfer-complete' }));
    setTimeout(() => { stopTapAnim(); showComplete('Gönderildi!'); }, 400);
  }

  const startTransfer = useCallback(async (pid: string) => {
    showProgress();
    const pc = makePC(pid, true);
    const o = await pc.createOffer();
    await pc.setLocalDescription(o);
    socketRef.current?.emit('rtc-offer', { to: pid, offer: o });
    sendQueueRef.current = [...selectedFilesRef.current];
    await new Promise<void>(r => {
      const i = setInterval(() => {
        const dc = dataChannelsRef.current.get(pid);
        if (dc?.readyState === 'open') { clearInterval(i); r(); }
      }, 100);
      setTimeout(() => { clearInterval(i); r(); }, 10000);
    });
    processSendFn(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makePC, showProgress]);

  // ─── Render helpers ───
  const renderPeers = useCallback(() => {
    const el = document.getElementById('peersContent');
    const cnt = document.getElementById('peerCount');
    if (!el || !cnt) return;
    const peers = peersRef.current;
    if (peers.size > 0) { cnt.style.display = ''; cnt.textContent = String(peers.size); } else { cnt.style.display = 'none'; }
    if (!peers.size) {
      el.innerHTML = `<div class="peers-empty-state"><div class="radar"><div class="radar-circle"></div><div class="radar-circle"></div><div class="radar-circle"></div><div class="radar-circle"></div><div class="radar-center"></div><div class="radar-sweep"></div><div class="floating-dot fd1"></div><div class="floating-dot fd2"></div><div class="floating-dot fd3"></div></div><div class="empty-title">Cihaz aranıyor...</div><div className="empty-desc">Paylaşım linkini göndererek veya QR kodu okutarak başka cihazları bağlayın</div></div>`;
      return;
    }
    el.innerHTML = '<div class="peer-grid">' + Array.from(peers.values()).map(p => renderPeerCard(p, false)).join('') + '</div>';
  }, []);

  const renderNetPeers = useCallback(() => {
    const sec = document.getElementById('networkSection');
    const grid = document.getElementById('netPeersGrid');
    const cnt = document.getElementById('netCount');
    if (!sec || !grid || !cnt) return;
    const uniqueNet = Array.from(netPeersRef.current.values()).filter(p => !peersRef.current.has(p.id));
    if (!uniqueNet.length) { sec.style.display = 'none'; return; }
    sec.style.display = '';
    cnt.textContent = String(uniqueNet.length);
    grid.innerHTML = uniqueNet.map(p => renderPeerCard(p, true)).join('');
  }, []);

  // ─── File management ───
  const renderFiles = useCallback(() => {
    const files = selectedFilesRef.current;
    const validFiles = files.filter(f => !isBlocked(f.name));
    const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement | null;
    if (sendBtn) sendBtn.disabled = !validFiles.length;
    const list = document.getElementById('fileList');
    if (list) {
      list.innerHTML = files.map((f, i) => {
        const blocked = isBlocked(f.name);
        return `<div class="file-entry${blocked ? ' blocked' : ''}">
          <div class="file-badge ${blocked ? 'danger' : fileCls(f.name)}">${blocked ? '&#x26A0;' : fileExt(f.name)}</div>
          <div class="fm"><div class="name">${esc(f.name)}</div><div class="size">${fmtSize(f.size)}</div>${blocked ? '<div class="blocked-msg">Bu dosya türü güvenlik nedeniyle engellenmiştir</div>' : ''}</div>
          <button class="btn-rm" data-idx="${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>`;
      }).join('');
      // Attach remove handlers
      list.querySelectorAll('.btn-rm').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0');
          selectedFilesRef.current.splice(idx, 1);
          renderFiles();
        });
      });
    }
    selectedFilesRef.current = selectedFilesRef.current.filter(f => !isBlocked(f.name));
    if (selectedFilesRef.current.length === 0 && sendBtn) sendBtn.disabled = true;
  }, []);

  const addFiles = useCallback((fl: FileList) => {
    for (const f of Array.from(fl)) selectedFilesRef.current.push(f);
    renderFiles();
  }, [renderFiles]);

  // ─── Init ───
  useEffect(() => {
    console.log('[Dropla.tr] useEffect fired');

    // Load QRious if not already loaded
    if (!document.querySelector('script[src*="qrious"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.onload = () => {
        console.log('[Dropla.tr] QRious loaded');
        if (roomIdRef.current) updateLink();
      };
      document.head.appendChild(script);
    }

    const d = detectDevice();
    deviceNameRef.current = d.defaultName;
    myDeviceInfoRef.current = { type: d.type, deviceType: d.type, deviceName: d.defaultName, browser: d.browser, os: d.os };

    const navIcon = document.getElementById('navDevIcon');
    if (navIcon) navIcon.innerHTML = devIcon(d.type);
    const navName = document.getElementById('navDevName');
    if (navName) navName.textContent = d.defaultName;

    console.log('[Dropla.tr] Connecting to backend:', BACKEND_URL);
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => console.log('[Dropla.tr] Socket connected:', socket.id));
    socket.on('connect_error', (err) => console.error('[Dropla.tr] Socket connection error:', err.message));

    const r = new URLSearchParams(window.location.search).get('room');

    function createRoom() {
      socket.emit('create-room', { deviceName: deviceNameRef.current, deviceType: d.type, browser: d.browser, os: d.os }, (r: { roomId: string; peerId: string; networkPeers?: PeerInfo[] }) => {
        roomIdRef.current = r.roomId;
        myPeerIdRef.current = r.peerId;
        updateLink();
        if (r.networkPeers) r.networkPeers.forEach(p => { if (p.id !== myPeerIdRef.current) netPeersRef.current.set(p.id, p); });
        renderNetPeers();
      });
    }

    function joinRoom(room: string) {
      socket.emit('join-room', { roomId: room, peerInfo: { deviceName: deviceNameRef.current, deviceType: d.type, browser: d.browser, os: d.os } }, (r: { error?: string; peerId: string; peers: PeerInfo[]; networkPeers?: PeerInfo[] }) => {
        if (r.error) { showToast('Oda bulunamadı!'); createRoom(); return; }
        roomIdRef.current = room;
        myPeerIdRef.current = r.peerId;
        updateLink();
        r.peers.forEach(p => peersRef.current.set(p.id, p));
        if (r.networkPeers) r.networkPeers.forEach(p => { if (p.id !== myPeerIdRef.current) netPeersRef.current.set(p.id, p); });
        renderPeers();
        renderNetPeers();
      });
    }

    if (r) joinRoom(r); else createRoom();

    // Setup drag-drop
    const z = document.getElementById('dropZone');
    if (z) {
      z.ondragover = (e) => { e.preventDefault(); z.classList.add('over'); };
      z.ondragleave = () => z.classList.remove('over');
      z.ondrop = (e) => { e.preventDefault(); z.classList.remove('over'); if (e.dataTransfer?.files) addFiles(e.dataTransfer.files); };
    }

    // Socket events
    socket.on('peer-joined', (p: PeerInfo) => { peersRef.current.set(p.id, p); renderPeers(); showToast(`${p.deviceName} bağlandı`); });
    socket.on('peer-left', (d: { id: string }) => { const p = peersRef.current.get(d.id); if (p) showToast(`${p.deviceName} ayrıldı`); peersRef.current.delete(d.id); cleanPC(d.id); renderPeers(); });
    socket.on('peer-updated', (d: { id: string; deviceName: string }) => { const p = peersRef.current.get(d.id); if (p) { p.deviceName = d.deviceName; renderPeers(); } });
    socket.on('network-peer-joined', (p: PeerInfo) => { if (p.id !== myPeerIdRef.current) { netPeersRef.current.set(p.id, p); renderNetPeers(); } });
    socket.on('network-peer-left', (d: { id: string }) => { netPeersRef.current.delete(d.id); renderNetPeers(); });
    socket.on('network-peer-updated', (d: { id: string; deviceName: string }) => { const p = netPeersRef.current.get(d.id); if (p) { p.deviceName = d.deviceName; renderNetPeers(); } });

    socket.on('rtc-offer', async (d: { from: string; offer: RTCSessionDescriptionInit }) => {
      const pc = makePC(d.from, false);
      await pc.setRemoteDescription(new RTCSessionDescription(d.offer));
      const a = await pc.createAnswer();
      await pc.setLocalDescription(a);
      socket.emit('rtc-answer', { to: d.from, answer: a });
    });
    socket.on('rtc-answer', async (d: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionsRef.current.get(d.from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(d.answer));
    });
    socket.on('rtc-ice-candidate', (d: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current.get(d.from);
      if (pc && d.candidate) pc.addIceCandidate(new RTCIceCandidate(d.candidate));
    });

    socket.on('file-request', (d: FileRequest) => {
      pendingRequestRef.current = d;
      const senderPeer = peersRef.current.get(d.from) || netPeersRef.current.get(d.from) || { deviceName: d.senderName, deviceType: 'unknown', id: d.from, browser: '', os: '' };
      pendingRequestRef.current.senderPeerInfo = senderPeer;
      const sn = document.getElementById('senderNameEl');
      if (sn) sn.textContent = d.senderName;
      const il = document.getElementById('incomingList');
      if (il) il.innerHTML = d.files.map(f => `<div class="inc-item"><div class="inc-dot"></div><span>${esc(f.name)} (${fmtSize(f.size)})</span></div>`).join('');
      document.getElementById('receiveOverlay')?.classList.add('open');
    });

    socket.on('file-response', async (d: { from: string; accepted: boolean }) => {
      if (d.accepted) {
        showToast('Kabul edildi!');
        const receiverInfo = peersRef.current.get(targetPeerIdRef.current!) || netPeersRef.current.get(targetPeerIdRef.current!) || targetDeviceInfoRef.current;
        showTapOverlay(myDeviceInfoRef.current, receiverInfo, true, 'Gönderiliyor...');
        await startTransfer(d.from);
      } else {
        showToast('Reddedildi');
        document.getElementById('sendOverlay')?.classList.remove('open');
        selectedFilesRef.current = [];
        targetPeerIdRef.current = null;
      }
    });

    // Global functions for onclick handlers in innerHTML
    (window as any).__openSendModal = (pid: string) => {
      targetPeerIdRef.current = pid;
      selectedFilesRef.current = [];
      const fl = document.getElementById('fileList');
      if (fl) fl.innerHTML = '';
      const sb = document.getElementById('sendBtn') as HTMLButtonElement | null;
      if (sb) sb.disabled = true;
      const p = peersRef.current.get(pid) || netPeersRef.current.get(pid);
      targetDeviceInfoRef.current = p ? { type: p.deviceType, deviceType: p.deviceType, deviceName: p.deviceName } : { type: 'unknown', deviceType: 'unknown', deviceName: 'Alıcı' };
      const stn = document.getElementById('sendTargetName');
      if (stn) stn.textContent = p ? p.deviceName : '';
      document.getElementById('sendOverlay')?.classList.add('open');
    };

    (window as any).__closeSendModal = () => {
      document.getElementById('sendOverlay')?.classList.remove('open');
      selectedFilesRef.current = [];
      targetPeerIdRef.current = null;
    };

    (window as any).__sendFileRequest = () => {
      if (!targetPeerIdRef.current || !selectedFilesRef.current.length) return;
      socket.emit('file-request', {
        to: targetPeerIdRef.current,
        files: selectedFilesRef.current.map(f => ({ name: f.name, size: f.size, type: f.type })),
        senderName: deviceNameRef.current,
      });
      document.getElementById('sendOverlay')?.classList.remove('open');
      showToast('İstek gönderildi...');
    };

    (window as any).__respondToRequest = (ok: boolean) => {
      document.getElementById('receiveOverlay')?.classList.remove('open');
      socket.emit('file-response', { to: pendingRequestRef.current!.from, accepted: ok });
      if (ok) {
        const senderInfo = pendingRequestRef.current!.senderPeerInfo || { deviceName: 'Gönderen', deviceType: 'unknown' };
        showTapOverlay(senderInfo, myDeviceInfoRef.current, false, 'Bekleniyor...');
      }
    };

    (window as any).__toggleNameEdit = () => {
      const bar = document.getElementById('nameEditBar');
      if (!bar) return;
      if (bar.classList.contains('open')) {
        bar.classList.remove('open');
      } else {
        bar.classList.add('open');
        const inp = document.getElementById('nameInput') as HTMLInputElement;
        if (inp) { inp.value = deviceNameRef.current; setTimeout(() => { inp.focus(); inp.select(); }, 100); }
      }
    };

    (window as any).__saveName = () => {
      const inp = document.getElementById('nameInput') as HTMLInputElement;
      const v = inp?.value.trim() || deviceNameRef.current;
      deviceNameRef.current = v;
      myDeviceInfoRef.current.deviceName = v;
      const nn = document.getElementById('navDevName');
      if (nn) nn.textContent = v;
      document.getElementById('nameEditBar')?.classList.remove('open');
      socket.emit('update-device-name', v);
      showToast('Cihaz adı güncellendi');
    };

    (window as any).__copyLink = () => {
      navigator.clipboard.writeText(`${window.location.origin}?room=${roomIdRef.current}`).then(() => {
        const b = document.getElementById('copyBtn');
        const l = document.getElementById('copyLabel');
        if (b) b.classList.add('copied');
        if (l) l.textContent = 'Kopyalandı!';
        setTimeout(() => {
          if (b) b.classList.remove('copied');
          if (l) l.textContent = 'Kopyala';
        }, 2000);
      });
    };

    return () => {
      console.log('[Dropla.tr] Cleanup - disconnecting socket');
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
          <span className="nav-title">Dropla.tr</span>
        </div>
        <div className="nav-right">
          <div className="nav-device" onClick={() => (window as any).__toggleNameEdit()}>
            <div className="nav-device-icon">
              <svg id="navDevIcon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></svg>
            </div>
            <span id="navDevName"></span>
            <div className="dot"></div>
          </div>
        </div>
      </nav>

      {/* Name Edit Bar */}
      <div className="name-edit-bar" id="nameEditBar">
        <input id="nameInput" maxLength={30} placeholder="Cihaz adınızı yazın..." />
        <button onClick={() => (window as any).__saveName()}>Kaydet</button>
        <button className="cancel-edit" onClick={() => (window as any).__toggleNameEdit()}>İptal</button>
      </div>

      {/* Main Content */}
      <div className="main">
        <div className="left-col">
          <div className="share-panel">
            <div className="label">Paylaşım Bağlantısı</div>
            <div className="link-box">
              <div className="link-url" id="shareLink">Oluşturuluyor...</div>
              <button className="btn-pill bp-blue" id="copyBtn" onClick={() => (window as any).__copyLink()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span id="copyLabel">Kopyala</span>
              </button>
            </div>
            <div className="qr-section">
              <canvas ref={qrCanvasRef}></canvas>
              <p className="qr-label">QR kodu tarayarak veya linki paylaşarak<br/>başka cihazları davet edin</p>
            </div>
            <div className="share-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p><strong>Güvende.</strong> Dosyalar doğrudan iki cihaz arasında aktarılır — hiçbir sunucuya uğramaz, kimse göremez.</p>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div id="networkSection" style={{ display: 'none', marginBottom: 28 }}>
            <div className="section-header">
              <h2>Aynı Ağdaki Cihazlar</h2>
              <span className="badge badge-green" id="netCount">0</span>
            </div>
            <div className="net-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
              Yerel ağ üzerinden otomatik keşfedildi
            </div>
            <div className="peer-grid" id="netPeersGrid"></div>
          </div>
          <div className="section-header">
            <h2>Bağlı Cihazlar</h2>
            <span className="badge badge-blue" id="peerCount" style={{ display: 'none' }}>0</span>
          </div>
          <div id="peersContent">
            <div className="peers-empty-state">
              <div className="radar">
                <div className="radar-circle"></div><div className="radar-circle"></div><div className="radar-circle"></div><div className="radar-circle"></div>
                <div className="radar-center"></div><div className="radar-sweep"></div>
                <div className="floating-dot fd1"></div><div className="floating-dot fd2"></div><div className="floating-dot fd3"></div>
              </div>
              <div className="empty-title">Cihaz araniyor...</div>
              <div className="empty-desc">Paylasim linkini gondererek veya QR kodu okutarak baska cihazlari baglayin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bottom-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="f-icon enc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h3>Şifreli Bağlantı</h3>
            <p>İki cihaz arasındaki bağlantı tamamen şifrelidir. Aktarım sırasında hiç kimse dosyalarınıza erişemez.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon p2p"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>
            <h3>Sunucu Yok</h3>
            <p>Dosyalarınız hiçbir sunucuya yüklenmez. Doğrudan cihazdan cihaza gider — daha hızlı, daha güvenli.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon fast"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
            <h3>Anında Paylaş</h3>
            <p>Kayıt yok, uygulama yok, kurulum yok. Linki aç, dosyayı seç, gönder. Her cihazda çalışır.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Transfer Animation Overlay */}
      <div className="transfer-anim-overlay" id="tapOverlay">
        <div className="tap-card">
          <div className="tap-scene">
            <div className="tap-device">
              <div className="tap-avatar desktop" id="tapAvatarLeft">
                <div className="tap-avatar-ring"></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" id="tapIconLeft"></svg>
              </div>
              <div className="tap-name" id="tapNameLeft">Ben</div>
            </div>
            <div className="tap-canvas-wrap">
              <canvas ref={tapCanvasRef}></canvas>
            </div>
            <div className="tap-device">
              <div className="tap-avatar desktop" id="tapAvatarRight">
                <div className="tap-avatar-ring"></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" id="tapIconRight"></svg>
              </div>
              <div className="tap-name" id="tapNameRight">Alıcı</div>
            </div>
          </div>
          <div className="tap-ring-wrap">
            <svg viewBox="0 0 88 88">
              <circle className="tap-ring-track" cx="44" cy="44" r="36" fill="none" strokeWidth="6"/>
              <circle className="tap-ring-bar" id="tapRingBar" cx="44" cy="44" r="36" fill="none" strokeWidth="6" strokeDasharray="226.19" strokeDashoffset="226.19"/>
            </svg>
            <div className="tap-ring-pct" id="tapRingPct">0%</div>
          </div>
          <div className="tap-status" id="tapStatus">Gönderiliyor...</div>
          <div className="tap-filename" id="tapFilename">Hazırlanıyor...</div>
          <div className="tap-prog"><div className="tap-prog-bar" id="tapProgBar"></div></div>
        </div>
      </div>

      {/* Send Modal */}
      <div className="overlay" id="sendOverlay">
        <div className="sheet"><div className="sheet-handle"></div><div className="sheet-body">
          <div className="sheet-title">Dosya Gönder</div>
          <div className="sheet-subtitle"><span id="sendTargetName"></span> cihazına</div>
          <div className="drop-zone" id="dropZone" onClick={() => fileInputRef.current?.click()}>
            <div className="drop-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
            <h3>Dosya seçin veya sürükleyin</h3>
            <p>Tüm güvenli dosya türleri desteklenir</p>
          </div>
          <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
          <div className="file-list" id="fileList"></div>
          <div className="sheet-actions">
            <button className="btn-a ba-cancel" onClick={() => (window as any).__closeSendModal()}>İptal</button>
            <button className="btn-a ba-send" id="sendBtn" disabled onClick={() => (window as any).__sendFileRequest()}>Gönder</button>
          </div>
        </div></div>
      </div>

      {/* Receive Modal */}
      <div className="overlay" id="receiveOverlay">
        <div className="sheet"><div className="sheet-handle"></div><div className="sheet-body">
          <div className="sheet-title">Dosya İsteği</div>
          <div className="sheet-subtitle"><strong id="senderNameEl"></strong> size dosya göndermek istiyor</div>
          <div className="incoming-list" id="incomingList"></div>
          <div className="sheet-actions">
            <button className="btn-a ba-reject" onClick={() => (window as any).__respondToRequest(false)}>Reddet</button>
            <button className="btn-a ba-accept" onClick={() => (window as any).__respondToRequest(true)}>Kabul Et</button>
          </div>
        </div></div>
      </div>

      {/* Transfer Progress Overlay */}
      <div className="tf-overlay" id="transferOverlay">
        <div className="tf-box" id="transferBox">
          <div className="prw">
            <svg viewBox="0 0 110 110">
              <circle className="pr-track" cx="55" cy="55" r="46" fill="none" strokeWidth="6"/>
              <circle className="pr-bar" id="progressBar" cx="55" cy="55" r="46" fill="none" strokeWidth="6" strokeDasharray="289.03" strokeDashoffset="289.03"/>
            </svg>
            <div className="pr-lbl" id="progressLabel">0%</div>
          </div>
          <div className="tf-title" id="transferTitle">Aktarılıyor...</div>
          <div className="tf-file" id="transferFile"></div>
        </div>
      </div>

      {/* Toast */}
      <div className="toast" id="toast"></div>
    </>
  );
}

// Peer card render helper (used for innerHTML injection)
function renderPeerCard(p: PeerInfo, isNet: boolean) {
  const netTag = isNet ? `<div class="net-tag">Yerel Ağ</div>` : '';
  return `<div class="peer-card" onclick="__openSendModal('${p.id}')">
  ${netTag}
  <div class="avatar ${p.deviceType}"><div class="pulse-ring"></div><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${devIcon(p.deviceType)}</svg></div>
  <div class="p-name">${esc(p.deviceName)}</div>
  <div class="p-sub">${p.os} · ${p.browser}</div>
  <div class="send-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Gönder</div>
</div>`;
}
