# Ma

> Ma (間, lit. 'gap, space, pause') is a Japanese concept of negative space, and a Japanese reading of the Sino-Japanese character 間.

## What is ma?

Ma is a high-level framework or DSL for JavaScript strongly inspired by [realtalk](https://dynamicland.org/2024/FAQ/#What), aimed to bootstrap a system similar to [Dynamicland](https://dynamicland.org)

## VERY unstable

Note, this project is still _very_ early in development, and any constructs or parts of the API are exceptionally subject to change at this point.

## Quick introduction to the concepts

Realtalk and by extension Ma is a programming system that is meant to make it easy to write programs that function both independently _and_ collaboratively. This is because it is meant for the real world, while a program is often like _executing a command_.

Programs in Ma are meant to be more similar to _processes_ or _physical objects_ or even _living things_, in that they are always active, sensing the world around them and changing their behavior depending on what is going on around them.

In Realtalk, this is achieved through four primary concepts which Ma shamelessly ~steals~ copies from Realtalk.

- **Objects** - An object is conceptually very close to what we consider an "object" in the real world. A specific book could be an object, or a piece of paper. Objects can be enhanced with computational memory and/or behavior.
- **Wishes** - A wish is a desire for something to change, for instance "I wish my neighbor was blue" or "I wish there was good documentation for this project". It can technically be anything.
- **When-statements** - A when-statement describes a reaction to a particular situation, for instance, "when I have three neighbors, then ..." or "When I have been inactive for 5 minutes, then ..."
- **Claims** - A claim is simply some information that is attached to an object, for example, "I claim I am blue" or "I claim I have the text 'I like carrots'"

For a longer introduction to these ideas, refer to [Omar Rizwan's "Notes from Dynamicland" article](https://omar.website/posts/notes-from-dynamicland-geokit/).

The core idea is that you can give real-world things (objects) the space to ask for changes (wishes), create their own memory (claims) and react to changes (when-statements).

With these concepts combined together, it's actually surprisingly easy to get a system together that exhibits interesting behavior!

### Technical details

Realtalk, and by extension Ma, is a [_reactive programming system_](https://en.wikipedia.org/wiki/Reactive_programming), which means it functions similarly to Excel in that changes propagate automatically throughout the system.

## Dependencies

- docker
- [nix](https://determinate.systems/posts/determinate-nix-installer/)

## Running

1. [ ] Run `nix develop` in a shell.
2. [ ] If you haven't, run `bun install` to install nodejs packages.
3. [ ] Run `docker compose up -d` to start redis
4. [ ] Run the ma-lang core with `bun run server.ts`
5. [ ] Run the camera with `python arucam/arucam.py`

That's all! The system is live now.

## Resources

- [Notes from Dynamicland by Omar Rizwan](https://omar.website/posts/notes-from-dynamicland-geokit/) - This serves as a great introduction to the technical ideas in Dynamicland and Realtalk
- [Online aruco tags generator](https://chev.me/arucogen/)
