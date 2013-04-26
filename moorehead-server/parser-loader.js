var util = require('util'),
    fs = require('fs'),
    enexToOpml = require('./enexToOpml');
    
    
function process(err, data) {
  if (err) {
    util.puts(err);
    throw(err);
  }
  
  enexToOpml.convert(data, function(opml) {
    util.puts(opml);
    fs.writeFile(__dirname + "/public/ds-notebook.opml", opml, function(err) {
      if (err) {
        util.puts(err);
        throw err;
      }
    });
  });
}

fs.readFile(__dirname + '/public/ds-notebook.xml', process);


