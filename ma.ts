import { generateUniqueHash, hash, hashList } from "./hash.ts";
import type { JsonValue } from "type-fest";

type WishMessage = Record<string, JsonValue>;
type WishMatcher = (wish: WishMessage) => boolean;
type WishHandler = (me: MaObject, wish: WishMessage) => void;

type Wish = { sender: MaObject; patternFn: MaObjectMatcher; wish: WishMessage };

type MaObjectMatcher = (it: MaObject) => boolean;
type MaAction = (it: MaObject[]) => void;

export class MaObject {
  protected claimsCollection: Map<any, any>;
  private wishHandlers: Map<
    string,
    {
      patternFn: WishMatcher;
      handler: WishHandler;
    }
  >;

  _____overrideIdentity(id: string) {
    this.id = id;
  }

  constructor(
    public id: string,
    private runtime: Ma | null,
  ) {
    this.claimsCollection = new Map();
    this.wishHandlers = new Map();
  }

  am(name: string) {
    this.claim("name", name);
  }

  /**
   * @alias this.am
   * @param name
   */
  is(name: string) {
    this.am(name);
  }

  claim(key: string, value: unknown) {
    this.claimsCollection.set(key, value);
  }

  claims(key: string, value: unknown) {
    this.claim(key, value);
  }

  getClaimNames() {
    return [...this.claimsCollection.keys()];
  }

  updateClaim(key: string, updateFn: (prevValue: any) => any) {
    this.claim(key, updateFn(this.get(key)));
  }

  handleWish(patternFn: WishMatcher, handler: WishHandler) {
    this.wishHandlers.set(patternFn.toString(), { patternFn, handler });
  }

  receiveWish(sender: MaObject, wish: WishMessage) {
    this.wishHandlers.forEach(({ patternFn, handler }) => {
      if (patternFn(wish)) {
        // console.log(`${this.id} received a wish from ${sender.id}`);
        handler(this, wish);
      }
    });
  }

  wish(patternFn: MaObjectMatcher, wish: WishMessage) {
    if (this.runtime) {
      this.runtime.broadcastWish(this, patternFn, wish);
    }
  }

  has(key: string) {
    return this.claimsCollection.has(key);
  }

  get(key: string) {
    return this.claimsCollection.get(key);
  }

  destroy() {}
}

type When = {
  condition: MaObjectMatcher;
  action: MaAction;
  hashedMatches: null | string;
};

export class Ma extends MaObject {
  constructor() {
    super("Ma", null);

    this.is("Ma runtime");

    this.claimsCollection.set("whens", {});
    this.claimsCollection.set("wishQueue", []);
    this.claimsCollection.set("objects", {
      Ma: this,
    });
  }

  async createObject(program: (I: MaObject, ma: Ma) => void) {
    const id = await generateUniqueHash(16);
    const obj = new MaObject(id, this);
    this.get("objects")[id] = obj;
    program(obj, this);
    return obj;
  }

  when(condition: MaObjectMatcher, action: MaAction) {
    this.updateClaim("whens", whens => {
      const hashed = hash(condition.toString() + action.toString());
      return {
        ...whens,
        [hashed]: {
          hashedMatches: null,
          condition,
          action,
        },
      };
    });
  }

  broadcastWish(
    sender: MaObject,
    patternFn: MaObjectMatcher,
    wish: WishMessage
  ) {
    this.get("wishQueue").push({ sender, patternFn, wish });
  }

  evaluateWishes() {
    while (this.get("wishQueue").length) {
      const { sender, patternFn, wish } = this.get("wishQueue").pop() as Wish;
      const objects = Object.values(this.get("objects")) as MaObject[];
      for (const obj of objects) {
        if (patternFn(obj)) {
          obj.receiveWish(sender, wish);
        }
      }
    }
  }

  evaluateWhens() {
    const whens = this.get("whens") as Record<string, When>;

    for (const [
      whenHash,
      { condition, action, hashedMatches },
    ] of Object.entries(whens)) {
      const objects = Object.values(this.get("objects")) as MaObject[];
      const matches = objects.filter(condition);
      const unique = hash(matches.map(({ id }) => id).join(""));

      if (unique !== hashedMatches) {
        action(matches);
        this.updateClaim("whens", whens => {
          return {
            ...whens,
            [whenHash]: {
              condition,
              action,
              hashedMatches: unique,
            },
          };
        });
      }
    }
  }

  run() {
    setTimeout(() => {
      this.evaluateWhens();
      this.evaluateWishes();

      this.run();
    }, 1000 / 2);
  }
}
