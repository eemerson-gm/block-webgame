import { NextApiRequest, NextApiResponse } from "next";
import WebSocket from "ws";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const wss = new WebSocket.Server({ noServer: true });
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("received: %s", message);
      ws.send(message);
    });
  });
  // Upgrade HTTP request to WebSocket connection
  if (!res.writableEnded) {
    res.writeHead(101, {
      "Content-Type": "text/plain",
      Connection: "Upgrade",
      Upgrade: "websocket",
    });
    res.end();
  }
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), function done(ws) {
    wss.emit("connection", ws, req);
  });
}
