var util = require('util'),
    xml2js = require('xml2js'),
    encode = require('escape-html');

// Note contents are actually embedded XML documents
// wrapped in a CDATA section, so they get passed though
// into the JSON. We strip out everything surrounding
// the inner (HTML) markup and use it as-is, but encoded
// to it can go in a OPML text attribute.

// stuff to strip
const RE_pi       = /\<\?xml .+?\?\>/;
const RE_dt       = /\<\!DOCTYPE en-note .+?\>/;
const RE_enOpen   = /\<en-note .*?\>/;
const RE_enClose  = /\<\/en-note\>/;

// stripper
function RE_strip(re, s) {
  return s.replace(re, '');
}

// fixup a note body
function cleanupContent(content) {
  content = RE_strip(RE_pi, content);
  content = RE_strip(RE_dt, content);
  content = RE_strip(RE_enOpen, content);
  content = RE_strip(RE_enClose, content);
  content = encode(content);
  return content;
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

  return opml.join("\n");;
}

// enex (XML) -> JSON -> OPML
function process(enex) {
  return jsonToOpml(enexToJson(enex));  
}

// entry point
exports.convert = function(data, callback) {
  var parser = new xml2js.Parser();

  console.log("Starting conversion...");
  try {
    parser.parseString(data, function(err, result) {
      if (err) {
        console.log("Parser error: " + e);
        callback(err);
      } else {
        console.log("Conversion complete");
        var opml = process(result);
        callback(null, opml);
      }
    });
  } catch (e) {
    callback(e);
  }
}

