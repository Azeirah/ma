## Legend

- #wish - Something that could be added

## Sunday 15th of June, 2025

- #wish Property access would be nicer with magic getters like in Laravel.

## Saturday 2nd of August, 2025

- I'm looking into how dependency graphs are done for claims and when-statements
  - Folk uses a log-reduce reactive graph
  - Folk uses a really convoluted claim and statement system
  - "Adventures in Dynamicland" uses minikanren, with the 3-tuple system (much cleaner than Folk)
  - Dynamicland uses nl-datalog by Alex Warth, again, the 3-tuple system
- Looks like I should use datascript, and add a little bit of syntactic sugar on top.
  - For the reactive handling, the log-reduce pattern from Folk is clean.

```js
// claims sugar for DataScript in Ma
ma.assert("map", "is geomap of", "bbox", {
  zoom: 11,
  center: [100, 200],
  tileUrl: "https://..."
});

// The above code maps to
d.transact(conn, [{
  ":db/id": -1,
  ":ma/subject": "map",
  ":ma/relation": "is geomap of", 
  ":ma/object": "bbox",
  ":properties/zoom": 11,
  ":properties/center": [100, 200],
  ":properties/tileUrl": "https://..."
}];
```

```js
// Spatial relationships
ma.track(["<object>", "is on", "<surface>"], ({object, surface}) => {
  console.log(`${object} is on ${surface}`)
})

// User interactions  
ma.track(["<user>", "moved", "<item>"], ({user, item, properties}) => {
  console.log(`${user} moved ${item} to ${properties.position}`)
})

// System events
ma.track(["<sensor>", "detected", "<event>"], ({sensor, event, properties}) => {
  console.log(`${sensor} detected ${event} at ${properties.timestamp}`)
})
```
