import { randomBytes, createHash } from "crypto";

export function generateUniqueHash(bytes = 16) {
  return new Promise<string>((resolve, reject) => {
    randomBytes(bytes, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const hash = createHash("sha256");
        hash.update(buffer);
        resolve(hash.digest("hex"));
      }
    });
  });
}

export function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashList(strings: string[]) {
  const concatenated = strings.join("");
  return hash(concatenated);
}

generateUniqueHash().then(hash => console.log(hash));
