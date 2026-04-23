const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const io = new Server(server, {
  maxHttpBufferSize: 1e8,
  cors: { origin: CORS_ORIGIN }
});

// Blocked file extensions (potential malware)
const BLOCKED_EXTENSIONS = [
  'exe','bat','cmd','com','msi','scr','pif','vbs','vbe','js','jse',
  'wsf','wsh','ps1','ps2','psc1','psc2','msh','msh1','msh2',
  'inf','reg','rgs','sct','shb','shs','ws','lnk','cpl','hta',
  'dll','sys','drv','ocx','cgi','sh','bash','shell','command',
  'action','bin','osx','workflow','app','ipa','apk','deb','rpm'
];

app.get('/api/blocked-extensions', (req, res) => {
  res.json(BLOCKED_EXTENSIONS);
});

// Room management
const rooms = new Map(); // roomId -> Map(socketId -> peerInfo)
// Network peer tracking for same-network discovery
const networkPeers = new Map(); // subnet -> Map(socketId -> peerInfo)

function generateRoomId() {
  return crypto.randomBytes(3).toString('hex');
}

function getClientIP(socket) {
  let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  return ip;
}

function getSubnet(ip) {
  // For IPv4: use first 3 octets as subnet identifier
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    return ip.split('.').slice(0, 3).join('.');
  }
  // For localhost / IPv6 fallback
  return ip;
}

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);
  let currentRoom = null;
  const clientIP = getClientIP(socket);
  const subnet = getSubnet(clientIP);

  socket.on('create-room', (peerInfo, callback) => {
    const roomId = generateRoomId();
    currentRoom = roomId;

    const fullInfo = { ...peerInfo, id: socket.id, ip: clientIP };

    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    rooms.get(roomId).set(socket.id, fullInfo);
    socket.join(roomId);

    // Register for same-network discovery
    if (!networkPeers.has(subnet)) networkPeers.set(subnet, new Map());
    networkPeers.get(subnet).set(socket.id, { ...fullInfo, roomId });
    socket.join(`net:${subnet}`);

    // Notify same-network peers about this new peer
    socket.to(`net:${subnet}`).emit('network-peer-joined', {
      ...fullInfo,
      roomId
    });

    // Send existing same-network peers
    const netPeers = [];
    networkPeers.get(subnet).forEach((p, id) => {
      if (id !== socket.id) netPeers.push(p);
    });

    callback({ roomId, peerId: socket.id, networkPeers: netPeers });
    console.log(`Room created: ${roomId} by ${peerInfo.deviceName} (${clientIP})`);
  });

  socket.on('join-room', (data, callback) => {
    const { roomId, peerInfo } = data;

    if (!rooms.has(roomId)) {
      callback({ error: 'Oda bulunamadı' });
      return;
    }

    currentRoom = roomId;
    const fullInfo = { ...peerInfo, id: socket.id, ip: clientIP };
    rooms.get(roomId).set(socket.id, fullInfo);
    socket.join(roomId);

    // Register for same-network discovery
    if (!networkPeers.has(subnet)) networkPeers.set(subnet, new Map());
    networkPeers.get(subnet).set(socket.id, { ...fullInfo, roomId });
    socket.join(`net:${subnet}`);

    // Notify existing room peers
    socket.to(roomId).emit('peer-joined', { ...fullInfo });

    // Notify same-network peers
    socket.to(`net:${subnet}`).emit('network-peer-joined', {
      ...fullInfo,
      roomId
    });

    // Send existing room peers
    const existingPeers = [];
    rooms.get(roomId).forEach((peer, id) => {
      if (id !== socket.id) existingPeers.push(peer);
    });

    // Send existing same-network peers
    const netPeers = [];
    networkPeers.get(subnet).forEach((p, id) => {
      if (id !== socket.id) netPeers.push(p);
    });

    callback({ success: true, peerId: socket.id, peers: existingPeers, networkPeers: netPeers });
    console.log(`${peerInfo.deviceName} joined room ${roomId} (${clientIP})`);
  });

  // File validation
  socket.on('validate-files', (files, callback) => {
    const results = files.map(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return { name: f.name, blocked: BLOCKED_EXTENSIONS.includes(ext), ext };
    });
    callback(results);
  });

  // WebRTC Signaling
  socket.on('rtc-offer', (data) => {
    io.to(data.to).emit('rtc-offer', { from: socket.id, offer: data.offer });
  });
  socket.on('rtc-answer', (data) => {
    io.to(data.to).emit('rtc-answer', { from: socket.id, answer: data.answer });
  });
  socket.on('rtc-ice-candidate', (data) => {
    io.to(data.to).emit('rtc-ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  // File transfer signaling
  socket.on('file-request', (data) => {
    io.to(data.to).emit('file-request', {
      from: socket.id,
      files: data.files,
      senderName: data.senderName
    });
  });
  socket.on('file-response', (data) => {
    io.to(data.to).emit('file-response', {
      from: socket.id,
      accepted: data.accepted
    });
  });

  socket.on('update-device-name', (newName) => {
    if (currentRoom && rooms.has(currentRoom)) {
      const peer = rooms.get(currentRoom).get(socket.id);
      if (peer) {
        peer.deviceName = newName;
        socket.to(currentRoom).emit('peer-updated', { id: socket.id, deviceName: newName });
      }
    }
    // Update network peer info too
    if (networkPeers.has(subnet)) {
      const np = networkPeers.get(subnet).get(socket.id);
      if (np) {
        np.deviceName = newName;
        socket.to(`net:${subnet}`).emit('network-peer-updated', { id: socket.id, deviceName: newName });
      }
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.delete(socket.id);
      socket.to(currentRoom).emit('peer-left', { id: socket.id });
      if (room.size === 0) {
        rooms.delete(currentRoom);
        console.log(`Room ${currentRoom} deleted (empty)`);
      }
    }
    // Remove from network peers
    if (networkPeers.has(subnet)) {
      networkPeers.get(subnet).delete(socket.id);
      socket.to(`net:${subnet}`).emit('network-peer-left', { id: socket.id });
      if (networkPeers.get(subnet).size === 0) networkPeers.delete(subnet);
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Değişiklik