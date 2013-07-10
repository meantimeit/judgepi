function ArtistData() {
}

ArtistData.prototype.setName = function (name) {
  this._name = name;
};

ArtistData.prototype.setUri = function (uri) {
  this._uri = uri;
};

ArtistData.prototype.setClient = function (client) {
  this._client = client;
};

ArtistData.prototype.setId = function (id) {
  this._id = id;
};

ArtistData.prototype.setUserId = function (userId) {
  this._userId = userId;
};

ArtistData.prototype.save = function (callback) {
  this._saveCallback = callback;

  if (this._isNew()) {
    this._checkExists();
  }
  else {
    console.log('not done this yet');
  }
};

ArtistData.prototype.fetch = function (callback) {
  this._client.query(this._sql.findById, this._getFetchValues(), function (err, results) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results.rows[0]);
  });
};

ArtistData.prototype._sql = {
  findById: 'SELECT artist_id, name, uri, insert_date, insert_by, update_date, update_by FROM artist WHERE artist_id = $1 AND deleted_date IS NULL',
  findByName: 'SELECT artist_id, name, uri, insert_date, insert_by, update_date, update_by FROM artist WHERE name = $1 AND deleted_date IS NULL',
  insert: 'INSERT INTO artist (name, uri, insert_date, insert_by) VALUES ($1, $2, NOW(), $3) RETURNING artist_id'
};

ArtistData.prototype._isNew = function () {
  return this._id === undefined;
};

ArtistData.prototype._checkExists = function () {
  this._client.query(this._sql.findByName, [ this._name ], this._onCheckExists.bind(this));
};

ArtistData.prototype._onCheckExists = function (err, result) {
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

ArtistData.prototype._insertNew = function () {
  this._client.query(this._sql.insert, this._getInsertValues(), this._onInsertNew.bind(this));
};

ArtistData.prototype._getInsertValues = function () {
  return [ this._name, this._uri, this._userId ];
};

ArtistData.prototype._getCheckExistsValues = function () {
  return [ this._name ];
};

ArtistData.prototype._getFetchValues = function () {
  return [ this._id ];
};

ArtistData.prototype._onInsertNew = function (err, result) {
  if (err) {
    this._saveCallback(err);
  }
  else {
    this.setId(result.rows[0].artist_id);
    this.fetch(this._saveCallback);
  }
};

function artistData(settings) {
  var artist = new ArtistData();

  artist.setClient(settings.client);

  if (settings.id) {
    artist.setId(settings.id);
  }

  if (settings.uri) {
    artist.setUri(settings.uri);
  }

  if (settings.name) {
    artist.setName(settings.name);
  }

  if (settings.userId) {
    artist.setUserId(settings.userId);
  }

  return {
    save: artist.save.bind(artist),
    fetch: artist.fetch.bind(artist)
  };
}

module.exports = artistData;
