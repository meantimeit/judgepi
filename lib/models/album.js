function AlbumData() {
}

AlbumData.prototype.setName = function (name) {
  this._name = name;
};

AlbumData.prototype.setUri = function (uri) {
  this._uri = uri;
};

AlbumData.prototype.setClient = function (client) {
  this._client = client;
};

AlbumData.prototype.setId = function (id) {
  this._id = id;
};

AlbumData.prototype.setUserId = function (userId) {
  this._userId = userId;
};

AlbumData.prototype.setArtistId = function (artistId) {
  this._artistId = artistId;
};

AlbumData.prototype.save = function (callback) {
  this._saveCallback = callback;

  if (this._isNew()) {
    this._checkExists();
  }
  else {
    this.fetch(callback);
  }
};

AlbumData.prototype.fetch = function (callback) {
  this._client.query(this._sql.findById, this._getFetchValues(), function (err, results) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results.rows[0]);
  });
};

AlbumData.prototype._sql = {
  findById: 'SELECT album_id, artist_id, name, uri, insert_date, insert_by, update_date, update_by FROM album WHERE album_id = $1 AND deleted_date IS NULL',
  findByName: 'SELECT album_id, artist_id, name, uri, insert_date, insert_by, update_date, update_by FROM album WHERE name = $1 AND deleted_date IS NULL',
  insert: 'INSERT INTO album (name, uri, artist_id, insert_date, insert_by) VALUES ($1, $2, $3, NOW(), $4) RETURNING album_id'
};

AlbumData.prototype._isNew = function () {
  return this._id === undefined;
};

AlbumData.prototype._checkExists = function () {
  this._client.query(this._sql.findByName, [ this._name ], this._onCheckExists.bind(this));
};

AlbumData.prototype._onCheckExists = function (err, result) {
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

AlbumData.prototype._insertNew = function () {
  this._client.query(this._sql.insert, this._getInsertValues(), this._onInsertNew.bind(this));
};

AlbumData.prototype._getInsertValues = function () {
  return [ this._name, this._uri, this._artistId || null, this._userId ];
};

AlbumData.prototype._getCheckExistsValues = function () {
  return [ this._name ];
};

AlbumData.prototype._getFetchValues = function () {
  return [ this._id ];
};

AlbumData.prototype._onInsertNew = function (err, result) {
  if (err) {
    this._saveCallback(err);
  }
  else {
    this.setId(result.rows[0].album_id);
    this.fetch(this._saveCallback);
  }
};

function albumData(settings) {
  var album = new AlbumData();

  album.setClient(settings.client);

  if (settings.id) {
    album.setId(settings.id);
  }

  if (settings.uri) {
    album.setUri(settings.uri);
  }

  if (settings.name) {
    album.setName(settings.name);
  }

  if (settings.userId) {
    album.setUserId(settings.userId);
  }

  if (settings.artistId) {
    album.setArtistId(settings.artistId);
  }

  return {
    save: album.save.bind(album),
    fetch: album.fetch.bind(album)
  };
}

module.exports = albumData;
