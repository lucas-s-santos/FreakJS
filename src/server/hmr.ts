import type { ServerWebSocket } from "bun";

interface HmrData {
  type: "reload";
  path?: string;
}

const clients = new Set<ServerWebSocket<unknown>>();

export function setupHmr() {
  function broadcastReload(payload: { path?: string } = {}) {
    const msg = JSON.stringify({ type: "reload", ...payload } satisfies HmrData);
    for (const ws of clients) {
      try { ws.send(msg); } catch { /* client disconnected */ }
    }
  }

  const websocket = {
    open(ws: ServerWebSocket<unknown>) {
      clients.add(ws);
    },
    close(ws: ServerWebSocket<unknown>) {
      clients.delete(ws);
    },
    message() {},
  };

  return { broadcastReload, websocket };
}

// Injected as inline <script> in every dev-mode HTML response
export const HMR_CLIENT_SCRIPT = `<script>
(function(){
  var ws;
  function connect(){
    ws = new WebSocket('ws://' + location.host + '/_freakjs/hmr');
    ws.onmessage = function(e){
      var msg = JSON.parse(e.data);
      if(msg.type === 'reload') location.reload();
    };
    ws.onclose = function(){
      setTimeout(connect, 1000);
    };
  }
  connect();
})();
</script>`;
