var mh = {

  module:   "moorehead",
  version:  "0.2",
  
  log: function(msg) {
    if (console !== undefined) {
      console.log(msg);
    }
  },
  
  hello: function() {
    var s = this.module + " " + this.version;
    this.log(s);
    return s;
  },

  // based on code at http://stackoverflow.com/questions/5357442/how-to-inspect-javascript-objects
  inspect: function(obj) {
    var out = [];
    for(var p in obj) {
      var t = typeof obj[p];
      out.push(t + ":" + p + " = " + obj[p]);
    }
    return out.join('\n');
  }
  
  
 
};

