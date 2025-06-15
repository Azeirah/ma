import { ALIVE, Ma } from "./ma.ts";
import { createClient } from "redis";

export const ma = new Ma();
ma.run();

await ma.createObject(I => {
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

await ma.createObject((I, ma) => {
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
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    I.wish(it => it.has("color"), { newColor: randColor });
  }, 2000);
});

await ma.createObject(async (I, ma) => {
  I.am("The identity manager");

  const client = createClient({ url: "redis://localhost:6380" }).on(
    "error",
    err => console.error(err)
  );

  await client.connect();
  const info = await client.info("server");
  console.log("Connected to redis", info);

  I.claim("identities", []);

  const kernelIds = ma.get("objects");
  console.log(
    "Living objects in the kernel",
    Object.values(kernelIds).map(o => o.id + " " + o.get("name"))
  );

  await client.subscribe("identity", (message, channel) => {
    const kernelIds = ma.get("objects");
    const messageIds = JSON.parse(message).map(o => o.id);

    for (const previousTickAlive of Object.values(kernelIds)) {
      //
      if (
        !messageIds.includes(previousTickAlive.id) &&
        previousTickAlive[ALIVE]
      ) {
        // console.log(`Id ${previousTickAlive.id} left, disabling it`);
        ma.disableObject(previousTickAlive.id);
      }
    }

    for (const nowAlive of messageIds) {
      if (kernelIds.hasOwnProperty(nowAlive) && !kernelIds[nowAlive][ALIVE]) {
        // console.log(`Id ${nowAlive} entered, enabling it`);
        ma.enableObject(nowAlive);
      }
    }

    //
    // for (const nowAlive of aliveIds) {
    //   if (!alive.includes(nowAlive)) {
    //
    //   }
    // }
  });
});
