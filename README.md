# node-consul-event-cache

This is designed to be used with `node-consul` and the watch command with `consul.event.list` this library turns each event received into an node event, and keeps track so duplicates are not sent.

If multiple events are received with single update, the cache library will trigger 2 separate change events.

## Example

```javascript
var consul = require('consul')()

var EventCache = require('consul-event-cache')

var cache = new EventCache()

consul
  .watch({
    method: consul.event.list
  })
  .on('error', function(err) {
    console.log('error', err)
  })
  .on('change', cache.update.bind(cache))

cache
  .on('error', function(err) {
    console.log('error', err)
  })
  .on('change', function(event) {
    // a single event
    console.log(event)
  })
```
