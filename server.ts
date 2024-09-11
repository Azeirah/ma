import { Ma } from "./ma.ts";

export const ma = new Ma();
ma.run();

await ma.createObject((I, ma) => {
  I.am("Inspector");

  ma.when(
    () => true,
    them => {
      const amount = them.length;
      console.log(`There are ${amount} objects in ma:`);
      for (const it of them) {
        console.log(`${it.get("name") ?? "nameless#" + it.id}`);
      }
    }
  );
});

await ma.createObject(I => {
  I.am("Color swatch");
  I.claim("color", "red");
  I.handleWish(
    wish => "newColor" in wish,
    (me, wish) => me.claim("color", wish["newColor"])
  );
});

await ma.createObject((I, ma) => {
  I.am("Color changer");
  I.wish(it => it.has("color"), { newColor: "blue" });

  ma.when(
    it => it.has("color"),
    them => {
      for (const it of them) {
        console.log(`${it.id} is ${it.get("color")}`);
      }
    }
  );
});
