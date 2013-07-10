function PlayedTrackData() {
}

PlayedTrackData.prototype.setClient = function (client) {
  this._client = client;
};

PlayedTrackData.prototype.setUserId = function (userId) {
  this._userId = userId;
};

PlayedTrackData.prototype.setTrackId = function (trackId) {
  this._trackId = trackId;
};

PlayedTrackData.prototype.save = function (callback) {
  this._saveCallback = callback;
  this._insertNew();
};

PlayedTrackData.prototype._sql = {
  insert: 'INSERT INTO played_track (track_id, played_date, insert_date, insert_by) VALUES ($1, NOW(), NOW(), $2)'
};

PlayedTrackData.prototype._insertNew = function () {
  this._client.query(this._sql.insert, this._getInsertValues(), this._onInsertNew.bind(this));
};

PlayedTrackData.prototype._getInsertValues = function () {
  return [ this._trackId, this._userId ];
};

PlayedTrackData.prototype._onInsertNew = function (err, result) {
  if (err) {
    this._saveCallback(err);
  }
  else {
    this._saveCallback();
  }
};

function playedTrackData(settings) {
  var track = new PlayedTrackData();

  track.setClient(settings.client);

  if (settings.userId) {
    track.setUserId(settings.userId);
  }

  if (settings.trackId) {
    track.setTrackId(settings.trackId);
  }

  return {
    save: track.save.bind(track)
  };
}

module.exports = playedTrackData;
