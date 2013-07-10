var Mopidy = require('mopidy').Mopidy;
var config = require('./etc/config.json');
var pg = require('pg');
var albumData = require('./lib/models/album');
var artistData = require('./lib/models/artist');
var trackData = require('./lib/models/track');
var playedTrackData = require('./lib/models/played-track');
var pgClient, pgDone, mopidy;


console.log('Connecting: PostgreSQL');
pg.connect(config.pgConnectionUri, pgConnected);

function pgConnected(err, client, done) {
  if (err) {
    console.error(err);
    return;
  }

  pgClient = client;
  pgDone = done;

  console.log('Connecting: Mopidy');
  mopidy = new Mopidy({
    webSocketUrl: config.mopidyWebSocketUrl
  });
  mopidy.once('state:online', mopidyConnected);
}

function mopidyConnected() {
  console.log('Connected: Mopidy');
  mopidy.on('event:trackPlaybackStarted', function (data) {
    logPlaying(data.tl_track.track);
  });
}

function logPlaying(track) {
  logArtist(track.artists[0], function (err, artist) {
    if (err) {
      console.error(err);
    }
    else {
      logAlbum(track.album, artist.artist_id, function (err, album) {
        if (err) {
          console.error(err);
        }
        else {
          logTrack(track, album.album_id, artist.artist_id, function (err, track) {
            if (err) {
              console.error(err);
            }
            else {
              logPlayedTrack(track.track_id, function (err) {
                if (err) {
                  console.error(err);
                }
              });
            }
          });
        }
      });
    }
  });
}

function logTrack(track, albumId, artistId, callback) {
  var settings = {
    client: pgClient,
    uri: track.uri,
    name: track.name,
    albumId: albumId,
    artistId: artistId,
    userId: 1
  };
  trackData(settings).save(callback);
}

function logArtist(artist, callback) {
  var settings = {
    client: pgClient,
    uri: artist.uri,
    name: artist.name,
    userId: 1
  };
  artistData(settings).save(callback);
}

function logAlbum(album, artistId, callback) {
  var settings = {
    client: pgClient,
    uri: album.uri,
    name: album.name,
    artistId: artistId,
    userId: 1
  };
  albumData(settings).save(callback);
}

function logPlayedTrack(trackId, callback) {
  var settings = {
    client: pgClient,
    trackId: trackId,
    userId: 1
  };
  playedTrackData(settings).save(callback);
}
