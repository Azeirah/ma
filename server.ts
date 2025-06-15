import { Ma } from "./ma.ts";

export const ma = new Ma();
ma.run();

await ma.createObject(I => {
  I.am("Color swatch");
  I.claim("color", "red");
  I.handleWish(
    wish => "newColor" in wish,
    (me, wish) => me.claim("color", wish["newColor"])
  );

  I.handleWish(
    wish => "newColor" in wish,
    (me, wish) => console.log(`I changed color to ${I.get('color')}`)
  );
});

await ma.createObject((I, ma) => {
  I.am("Color changer");
  I.wish(it => it.has("color"), { newColor: "blue" });

  ma.when(
    it => it.has("color"),
    them => {
      for (const it of them) {
        console.log(`${it.get("name")} is ${it.get("color")}`);
      }
    }
  );
});
