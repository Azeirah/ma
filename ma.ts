function genHexString(len: number) {
    const hex = '0123456789ABCDEF';
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
}

type WishMessage = any;
type WishMatcher = (wish: WishMessage) => boolean;
type WishHandler = (me: MaObject, wish: WishMessage) => void;

type Wish = { sender: MaObject, patternFn: MaObjectMatcher, wish: WishMessage };

type MaObjectMatcher = (it: MaObject) => boolean;
type MaAction = (it: MaObject) => void;

export class MaObject {
  protected claims: Map<any, any>;
  private wishHandlers: Map<string, {
    patternFn: WishMatcher,
    handler: WishHandler;
  }>;

  constructor(public id: string, private runtime: Ma|null) {
    this.claims = new Map();
    this.wishHandlers = new Map();
  }

  claim(key: string, value: unknown) {
    this.claims.set(key, value);
  }

  handleWish(patternFn: WishMatcher, handler: WishHandler) {
    this.wishHandlers.set(patternFn.toString(), {patternFn, handler});
  }

  receiveWish(sender: MaObject, wish: WishMessage) {
    this.wishHandlers.forEach(({patternFn, handler}) => {
      if (patternFn(wish)) {
        console.log(`${this.id} received a wish from ${sender.id}`);
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
    return this.claims.has(key);
  }

  get(key: string) {
    return this.claims.get(key);
  }
}


export class Ma extends MaObject {
  constructor() {
    super("Ma", null);

    this.claims.set("whens", []);
    this.claims.set('wishQueue', []);
    this.claims.set("objects", {
      "Ma": this
    });
  }

  createObject(program: (I: MaObject, ma: Ma) => void) {
    const id = genHexString(16);
    const obj = new MaObject(id, this);
    this.get('objects')[id] = obj;
    program(obj, this);
    return obj;
  }

  when(condition: MaObjectMatcher, action: MaAction) {
    this.get('whens').push({ condition, action });
  }

  broadcastWish(sender: MaObject, patternFn: MaObjectMatcher, wish: WishMessage) {
    this.get('wishQueue').push({sender, patternFn, wish});
  }

  evaluateWishes() {
    while (this.get('wishQueue').length) {
      const {sender, patternFn, wish} = this.get('wishQueue').pop() as Wish;
      const objects = Object.values(this.get('objects')) as MaObject[];
      for (const obj of objects) {
        if (patternFn(obj)) {
          obj.receiveWish(sender, wish);
        }
      }
    }
  }

  evaluateWhens() {
    const whens = this.get('whens') as  {condition: MaObjectMatcher, action: MaAction}[];

    whens.forEach(({ condition, action }) => {
      const objects = Object.values(this.get('objects')) as MaObject[];
      objects.forEach((object) => {
        if (condition(object)) {
          action(object);
        }
      });
    });
  }

  run() {
    setTimeout(() => {
      this.evaluateWhens();
      this.evaluateWishes();

      this.run();
    }, 1000/60);
  }
}