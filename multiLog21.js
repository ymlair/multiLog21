(function() {
  var LogStream, events, fs,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  fs = require('fs');

  events = require('events');

  chokidar = require('chokidar');

  /*
  LogStream is a group of local files paths.  It watches each file for
  changes, extracts new log messages, and emits 'new_log' events.
   */

  LogStream = (function(_super) {
    __extends(LogStream, _super);

    function LogStream(_at_name, _at_paths) {
      this.name = _at_name;
      this.paths = _at_paths;
    }

    LogStream.prototype.watch = function() {
      var path, _i, _len, _ref;
      console.log("Starting log stream: '" + this.name + "'");
      _ref = this.paths;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        path = _ref[_i];
        this._watchFile(path);
      }

    // chokidar monitor new file 
    chokidar.watch(this.paths, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
      //console.log(event, path);
      if( event == 'add'){
    
    	console.log('new chokidar file'+path);
    	this._watchFile(path);
      }
    });

      return this;
    };

    LogStream.prototype._watchFile = function(path) {
      var currSize, watcher;
      if (!fs.existsSync(path)) {
        console.log("File doesn't exist: '" + path + "'");
        return;
      }
      console.log("Watching file: '" + path + "'");
      currSize = fs.statSync(path).size;
      return watcher = fs.watch(path, (function(_this) {
        return function(event, filename) {
          if (event === 'rename') {
            watcher.close();
            _this._watchFile(path);
          }
          if (event === 'change') {
            return fs.stat(path, function(err, stat) {
              _this._readNewLogs(path, stat.size, currSize);
              return currSize = stat.size;
            });
          }
        };
      })(this));
    };

    LogStream.prototype._readNewLogs = function(path, curr, prev) {
      var rstream;
      if (curr < prev) {
        return;
      }
      rstream = fs.createReadStream(path, {
        encoding: 'utf8',
        start: prev,
        end: curr
      });
      return rstream.on('data', (function(_this) {
        return function(data) {
          var line, lines, _i, _len, _results;
          lines = data.split("\n");
          _results = [];
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            if (line) {
		console.log(line);
            }
          }
          return _results;
        };
      })(this));
    };

    return LogStream;

  })(events.EventEmitter);


   Date.prototype.Format = function(fmt)
        { //author: meizz
            var o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt))
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            for(var k in o)
                if(new RegExp("("+ k +")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            return fmt;
  };
 
  console.log(new Date().Format('yyyy-MM-dd hh:mm:ss.S q'));

  var pathPrefix = '/data/logs/';
  var filePrefix = new Date().Format('yyyyMMddhh');
  var fileName = "error_"+filePrefix+".log";
  var paths = new Array('teacher/', 'service_course/', 'service_classtool/').map(val => pathPrefix+val+fileName);
  var logStream = new LogStream('dir_file', paths);
  logStream.watch();

}).call(this);
