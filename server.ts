import { ALIVE, Ma, MaObject } from "./ma.ts";
import { createClient } from "redis";
import { exec } from "node:child_process";

export const ma = new Ma();
ma.run();

await ma.createObject(0, async (I, ma) => {
    I.am("A registered aruco tag inspector");
    console.log("====================");
    console.log("Hi! I'll let you know which aruco tags are registered in the kernel");
    const objectsInKernel = ma.get("objects");

    for (const [id, obj] of Object.entries(objectsInKernel)) {
      console.log(`Object ${id} is ${obj[ALIVE] ? "alive" : "not alive"}`);
    }
    console.log("====================");
});

await ma.createObject(1, async (I, ma) => {
  I.am("The identity manager");
   const client = createClient({ url: "redis://localhost:6380" }).on(
     "error",
     err => console.error(err)
   );
  await client.connect();

  await client.subscribe("identity", async (msgStr, channel) => {
    const objectsInKernel = ma.get("objects");
    const message = JSON.parse(msgStr);
    const messageIds = message.map(o => o.id);

    for (let {id, corners} of message) {
      // await I.wish((it) => it.id === id, () => ({ corners }));
      if (id in objectsInKernel) {
        (objectsInKernel[id] as MaObject).updateClaim("position", () => corners)
      } else {
        console.log(`Id ${id} not in kernel`)
      }
    }

    for (const previousTickAlive of Object.values(objectsInKernel)) {
      //
      if (
        !messageIds.includes(previousTickAlive.id) &&
        previousTickAlive[ALIVE]
      ) {
        ma.disableObject(previousTickAlive.id);
      }
    }

    for (const nowAlive of messageIds) {
      if (objectsInKernel.hasOwnProperty(nowAlive) && !objectsInKernel[nowAlive][ALIVE]) {
        ma.enableObject(nowAlive);
      }
    }
  });
}, true);


await ma.createObject(2, I => {
  I.am("Color swatch");
  I.claim("color", "red");

  I.handleWish(
    wish => "newColor" in wish,
    (me, wish) => {
      me.claim("color", wish["newColor"]);
      console.log(`I changed color to ${I.get("color")}`);
    }
  );
});

await ma.createObject(3, (I, ma) => {
  const colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "gray",
    "purple",
    "teal",
    "orange",
  ];
  I.am("Color changer");

  I.wish(it => it.has("color"), { newColor: "blue" });

  setInterval(function () {
    if (I[ALIVE]) {
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      I.wish(it => it.has("color"), { newColor: randColor });
    }
  }, 2000);
});

await ma.createObject(4, I => {
  I.am("Window mover");
  setInterval(function () {
    if (I[ALIVE] && I.has('position')) {
      let position = I.get('position')[0];
      console.log(`hyprctl dispatch movewindowpixel exact ${position[0]} ${position[1]}, activewindow`);

     exec(`hyprctl dispatch movewindowpixel exact ${position[0]} ${position[1]}, activewindow`)
    }
  }, 100);
});


