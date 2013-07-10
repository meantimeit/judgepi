function TrackData() {
}

TrackData.prototype.setName = function (name) {
  this._name = name;
};

TrackData.prototype.setUri = function (uri) {
  this._uri = uri;
};

TrackData.prototype.setClient = function (client) {
  this._client = client;
};

TrackData.prototype.setId = function (id) {
  this._id = id;
};

TrackData.prototype.setUserId = function (userId) {
  this._userId = userId;
};

TrackData.prototype.setArtistId = function (artistId) {
  this._artistId = artistId;
};

TrackData.prototype.setAlbumId = function (albumId) {
  this._albumId = albumId;
};

TrackData.prototype.save = function (callback) {
  this._saveCallback = callback;

  if (this._isNew()) {
    this._checkExists();
  }
  else {
    this.fetch(callback);
  }
};

TrackData.prototype.fetch = function (callback) {
  this._client.query(this._sql.findById, this._getFetchValues(), function (err, results) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results.rows[0]);
  });
};

TrackData.prototype._sql = {
  findById: 'SELECT track_id, album_id, artist_id, name, uri, insert_date, insert_by, update_date, update_by FROM track WHERE track_id = $1 AND deleted_date IS NULL',
  findByName: 'SELECT track_id, album_id, artist_id, name, uri, insert_date, insert_by, update_date, update_by FROM track WHERE name = $1 AND album_id = $2 AND artist_id = $3 AND deleted_date IS NULL',
  insert: 'INSERT INTO track (name, uri, album_id, artist_id, insert_date, insert_by) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING track_id'
};

TrackData.prototype._isNew = function () {
  return this._id === undefined;
};

TrackData.prototype._checkExists = function () {
  this._client.query(this._sql.findByName, [ this._name, this._albumId, this._artistId ], this._onCheckExists.bind(this));
};

TrackData.prototype._onCheckExists = function (err, result) {
  if (err) {
    this._saveCallback(err);
  }
  else if (result.rows.length > 0) {
    this._saveCallback(null, result.rows[0]);
  }
  else {
    this._insertNew();
  }
};

TrackData.prototype._insertNew = function () {
  this._client.query(this._sql.insert, this._getInsertValues(), this._onInsertNew.bind(this));
};

TrackData.prototype._getInsertValues = function () {
  return [ this._name, this._uri, this._albumId, this._artistId || null, this._userId ];
};

TrackData.prototype._getCheckExistsValues = function () {
  return [ this._name ];
};

TrackData.prototype._getFetchValues = function () {
  return [ this._id ];
};

TrackData.prototype._onInsertNew = function (err, result) {
  if (err) {
    this._saveCallback(err);
  }
  else {
    this.setId(result.rows[0].track_id);
    this.fetch(this._saveCallback);
  }
};

function trackData(settings) {
  var track = new TrackData();

  track.setClient(settings.client);

  if (settings.id) {
    track.setId(settings.id);
  }

  if (settings.uri) {
    track.setUri(settings.uri);
  }

  if (settings.name) {
    track.setName(settings.name);
  }

  if (settings.userId) {
    track.setUserId(settings.userId);
  }

  if (settings.artistId) {
    track.setArtistId(settings.artistId);
  }

  if (settings.albumId) {
    track.setAlbumId(settings.albumId);
  }

  return {
    save: track.save.bind(track),
    fetch: track.fetch.bind(track)
  };
}

module.exports = trackData;
