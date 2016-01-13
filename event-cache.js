var util = require('util')
var after = require('after')
var debug = require('debug')('consul-event-cache')
var MemDB = require('memdb')

var db = MemDB()

var ConsulEventCache = function(opts) {
  if (!(this instanceof ConsulEventCache)) {
    return new ConsulEventCache(opts)
  }

  this.initial = true
}
util.inherits(ConsulEventCache, require('events').EventEmitter)

ConsulEventCache.prototype.update = function ConsulEventCacheUpdate(events) {
  var self = this

  var done = after(events.length, function(err) {
    if (err) {
      self.emit('error', err)
    }

    self.initial = false
  })

  events.forEach(function(event) {
    debug('event loop: %s', event.ID)

    db.get(event.ID, function(err, existingEvent) {
      if (err && !err.notFound) {
        debug('event get error: %s, %j', event.ID, err)
        return done(err)
      }

      try {
        existingEvent = JSON.parse(existingEvent)
      } catch(e) {
        existingEvent = event
      }

      db.put(event.ID, JSON.stringify(event), function(err1) {
        if (err1) {
          debug('event put error: %s, %j', event.ID, err1)
          return done(err1)
        }
        
        if (self.initial == true) {
          return done()
        }

        if (err && err.notFound) {
          debug('new event: %s', event.ID)
          self.emit('change', existingEvent)
        }

        return done()
      })
    })
  })
}

module.exports = ConsulEventCache

