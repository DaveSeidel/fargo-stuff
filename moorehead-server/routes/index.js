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
            callback({ convertError: err});
          }
          else {
            callback({ opml: opml });
          }
        });
      });
  }).on('error', function(e) {
    console.log("GET error: " + e);
    callback({ networkError: e });
  });
}

function sendUsage(res, err) {
  if (err) {
    console.log(err);
  }

  res.render('index', {
    title: 'Moorehead Test Server',
    usage: 'Usage: http://this.server//?url=ENCODED_URL_OF_EVERNOTE_EXPORT_FILE',
    error: err
  });
}

function sendOpml(res, opml) {
  res.set("Content-Type", "text/xml");
  res.send(200, opml);
  res.end();
}

// GET
exports.index = function(req, res, next) {
  var url = req.query.url

  if (null != url && url.length > 0) {
    downloadAndConvert(url, function(status) {
      var e = null;
      if (status.networkError) {
        var e = new Error(status.networkError);
        e.message = "Network error. Requested URL: \"" + url + "\"\n" + e.message;
      } else if (status.convertError ) {
        var e = new Error(status.convertError);
        e.message = "Parser or conversion error\n" + e.message;
      } else {
        console.log("Writing response...");
        sendOpml(res, status.opml);
      }
      if (e) {
        sendUsage(res, e);
      }
    });
  } else {
    sendUsage(res);
  }
};

