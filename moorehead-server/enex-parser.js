var util = require('util'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    encode = require('escape-html');

const RE_pi       = /\<\?xml .+?\?\>/;
const RE_dt       = /\<\!DOCTYPE en-note .+?\>/;
const RE_enOpen   = /\<en-note .*?\>/;
const RE_enClose  = /\<\/en-note\>/;

function RE_strip(re, s) {
  return s.replace(re, '');
}

function enexToJson(enex) {
  var json = [];
  
  for (var i in enex["en-export"].note) {
    var _note = enex["en-export"].note[i];
    
    var _title = _note.title[0];
    var _content = cleanupContent(_note.content[0]);
    
    json.push({
      title: _title,
      content: _content
    });
  }
  
  return json;
}

function cleanupContent(content) {
    content = RE_strip(RE_pi, content);
    content = RE_strip(RE_dt, content);
    content = RE_strip(RE_enOpen, content);
    content = RE_strip(RE_enClose, content);
    content = encode(content);
  return content;
}

function jsonToOpml(notebook) {
  var opml = [];

  opml.push("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>");
  opml.push(util.format("<opml version=\"2.0\"><head></head><body>"));  
  for (var i in notebook) {
    var n = notebook[i];
    //opml.push(util.format("<outline type=\"en-title\" text=\"%s\"><outline type=\"en-content\" text=\"%s\"/></outline>", n.title, n.content));
    opml.push(util.format("<outline text=\"%s\"><outline text=\"%s\"/></outline>", n.title, n.content));
  }
  opml.push("</body></opml>");

  return opml;
}

function process(enex) {
  var json = enexToJson(enex);
  //util.puts(util.inspect(json, { showHidden: true, depth: null }));

  var opml = jsonToOpml(json);
  util.puts(util.inspect(opml, { showHidden: true, depth: null }));
  
  fs.writeFile(__dirname + "/public/ds-notebook.opml", opml.join("\n"), function(err) {
    if (err) {
      util.puts(err);
      throw err;
    }
  });
}

var _callback = null;

var parser = new xml2js.Parser();
parser.on('end', function(result) {
  var opml = process(result);
  _callback(opml);
});

export.convert = function(filename, callback) {
  fs.readFile(__dirname + '/public/' filename, function(err, data) {
    if (err) {
      util.puts(err);
      throw(err);
    }
    
    _callback = done;
    parser.parseString(data);
  });
}

