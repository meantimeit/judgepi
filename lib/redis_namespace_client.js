var redis = require('redis');
var EventEmitter = require('events').EventEmitter;

function RedisNamespaced() {
  EventEmitter.apply(this, arguments);
  this._separator = ':';
}
RedisNamespaced.prototype = Object.create(EventEmitter.prototype, { constructor: RedisNamespaced });

RedisNamespaced.prototype.setClient = function (client) {
  this._client = client;
};

RedisNamespaced.prototype.setNamespace = function (namespace) {
  this._namespace = namespace;
};

RedisNamespaced.prototype.set = function (key, value, callback) {
  this._client.set(this._namespacedKey(key), value, callback);
};

RedisNamespaced.prototype.get = function (key, callback) {
  this._client.get(this._namespacedKey(key), callback);
};

RedisNamespaced.prototype._namespacedKey = function (key) {
  return this._namespace + this._separator + key;
};

function createClient(redis, callback) {
  
}

module.exports = redisClient;
