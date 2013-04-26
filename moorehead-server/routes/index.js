var http = require('http'),
    url = require('url'),
    enexToOpml = require('../enexToOpml');

function downloadAndConvert(requestedUrl, callback) {
  var parsed = url.parse(requestedUrl);
  var options = {
      host: parsed.host,
      port: parsed.port || 80,
      path: parsed.pathname
  };
  var inData = [];

  console.log("fetching infile from " + requestedUrl);
  http.get(options, function(res) {
      res.on('data', function(chunk) {
        inData.push(chunk);
      }).on('end', function() {
        console.log("fetch complete");
        enexToOpml.convert(inData.join(''), function(err, opml) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, opml);
          }
        });
      });
  }).on('error', function(e) {
    console.log("GET error: " + e);
    callback(e);
  });
}

// GET
exports.index = function(req, res, next) {
  if (null != req.query.url) {
    downloadAndConvert(req.query.url, function(err, opml) {
      if (err) {
        console.log(err);
        return next(new Error(err));
      } else {
        console.log("Writing response...");
        res.set("Content-Type", "text/xml");
        res.send(200, opml);
        res.end();
      }
    });
  } else {
    res.render('index', {
      title:  'Moorehead Test Server',
      usage:   'Usage: http://this.server//?url=ENCODED_URL_OF_EVERNOTE_EXPORT_FILE'
    });
  }
};

