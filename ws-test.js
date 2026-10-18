// ws-test.js — smoke test signaling server: join, roster, relay, leave
const WebSocket = require('ws');
const URL = process.env.WS_URL || 'ws://127.0.0.1:3777/ws';

function client(name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const c = { ws, name, events: [] };
    ws.on('open', () => resolve(c));
    ws.on('error', reject);
    ws.on('message', (d) => { try { c.events.push(JSON.parse(d.toString())); } catch {} });
    c.send = (o) => ws.send(JSON.stringify(o));
    c.waitEvent = (type, ms = 4000) => new Promise((res, rej) => {
      const t0 = Date.now();
      const iv = setInterval(() => {
        const m = c.events.find((e) => e.type === type);
        if (m) { clearInterval(iv); res(m); }
        else if (Date.now() - t0 > ms) { clearInterval(iv); rej(new Error(name + ' timeout waiting for ' + type)); }
      }, 40);
    });
  });
}

(async () => {
  const a = await client('A');
  a.send({ type: 'join', room: 'test-room', name: 'Kucing Oren' });
  const wa = await a.waitEvent('welcome');
  if (!wa.id || wa.peers.length !== 0) throw new Error('welcome A bad');
  console.log('1. A join ok, id=' + wa.id.slice(0, 8));

  const b = await client('B');
  b.send({ type: 'join', room: 'test-room', name: 'Bebek Galak' });
  const wb = await b.waitEvent('welcome');
  if (wb.peers.length !== 1 || wb.peers[0].id !== wa.id) throw new Error('B should see exactly A');
  console.log('2. B join ok, roster sees A');

  const pj = await a.waitEvent('peer-join');
  if (pj.id !== wb.id || pj.name !== 'Bebek Galak') throw new Error('A should see B join');
  console.log('3. A notified of B join');

  a.send({ type: 'signal', to: wb.id, data: { type: 'offer', sdp: 'TEST-SDP' } });
  const sig = await b.waitEvent('signal');
  if (sig.from !== wa.id || sig.data.sdp !== 'TEST-SDP') throw new Error('signal relay A->B broken');
  console.log('4. signal relay A->B ok');

  b.send({ type: 'signal', to: wa.id, data: { type: 'answer', sdp: 'ANS-SDP' } });
  const sig2 = await a.waitEvent('signal');
  if (sig2.from !== wb.id || sig2.data.sdp !== 'ANS-SDP') throw new Error('signal relay B->A broken');
  console.log('5. signal relay B->A ok');

  b.ws.close();
  const pl = await a.waitEvent('peer-leave');
  if (pl.id !== wb.id) throw new Error('peer-leave broken');
  console.log('6. peer-leave ok');

  a.ws.close();
  console.log('ALL WS TESTS PASSED');
  process.exit(0);
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
