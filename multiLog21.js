(function() {
  var LogHarvester, LogStream, events, fs, net, winston,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  fs = require('fs');

  net = require('net');

  events = require('events');

  winston = require('winston');

  chokidar = require('chokidar');

  moment = require('moment');

  /*
  LogStream is a group of local files paths.  It watches each file for
  changes, extracts new log messages, and emits 'new_log' events.
   */

  LogStream = (function(_super) {
    __extends(LogStream, _super);

    function LogStream(_at_name, _at_paths, _at__log) {
      this.name = _at_name;
      this.paths = _at_paths;
      this._log = _at__log;
    }

    LogStream.prototype.watch = function() {
      var path, _i, _len, _ref;
      this._log.info("Starting log stream: '" + this.name + "'");
      _ref = this.paths;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        path = _ref[_i];
        this._watchFile(path);
      }
chokidar.watch(this.paths, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  //console.log(event, path);
  if( event == 'add'){

	this._log.info('new chokidar file'+path);
	this._watchFile(path);
  }
});
      return this;
    };

    LogStream.prototype._watchFile = function(path) {
      var currSize, watcher;
      if (!fs.existsSync(path)) {
        this._log.error("File doesn't exist: '" + path + "'");
//        setTimeout(((function(_this) {
//          return function() {
//            return _this._watchFile(path);
//          };
//        })(this)), 1000);
        return;
      }
      this._log.info("Watching file: '" + path + "'");
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
//	_this._log.info("new content :"+line);	
		console.log(line);
              //_results.push(_this.emit('new_log', line));
            }
          }
          return _results;
        };
      })(this));
    };

    return LogStream;

  })(events.EventEmitter);

//  console.log(moment().format('YYYYMMDDHH'));
  var pathPrefix = '/data/logs/';
  var filePrefix = moment().format('YYYYMMDDHH');
  var fileName = ""+filePrefix+".log";
  var paths = new Array('teacher/', 'service_course/', 'service_classtool/').map(val => pathPrefix+val+fileName);
  var logStream = new LogStream('dir_file', paths, winston);
  logStream.watch();

}).call(this);
