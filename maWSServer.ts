import { WebSocketServer } from "ws";
import { Ma } from "./ma.ts";

function codeToString(
  code: number
): "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" {
  if (code === 0) {
    return "CONNECTING";
  } else if (code === 1) {
    return "OPEN";
  } else if (code === 2) {
    return "CLOSING";
  }

  return "CLOSED";
}

export const createMaWSServer = async (ma: Ma) => {
  await ma.createObject(I => {
    I.am("Ma websocket server");
    I.claim("port", 8337);
    I.claim("name", "Ma websocket server");
    I.claim("connections", 0);

    const wss = new WebSocketServer({ port: I.get("port") });

    wss.on("connection", ws => {
      ma.createObject(it => {
        it.is(`Websocket connection ${I.get("connections")}`);
        it.claims("connection status", codeToString(ws.readyState));

        ws.on("close", () => {
          I.updateClaim("connections", connections => connections + 1);
          it.destroy();
        });
      });

      I.updateClaim("connections", connections => connections + 1);
    });
  });
};
