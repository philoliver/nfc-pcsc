"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pcsclite = require('pcsclite');

var _pcsclite2 = _interopRequireDefault(_pcsclite);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _Reader = require('./Reader');

var _Reader2 = _interopRequireDefault(_Reader);

var _ACR122Reader = require('./ACR122Reader');

var _ACR122Reader2 = _interopRequireDefault(_ACR122Reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NFC = function (_EventEmitter) {
	_inherits(NFC, _EventEmitter);

	function NFC(logger) {
		_classCallCheck(this, NFC);

		var _this = _possibleConstructorReturn(this, (NFC.__proto__ || Object.getPrototypeOf(NFC)).call(this));

		_this.pcsc = null;
		_this.logger = null;


		_this.pcsc = (0, _pcsclite2.default)();

		if (logger) {
			_this.logger = logger;
		} else {
			_this.logger = {
				log: function log() {},
				debug: function debug() {},
				info: function info() {},
				warn: function warn() {},
				error: function error() {}
			};
		}

		_this.pcsc.on('reader', function (reader) {

			_this.logger.info('New reader detected', reader.name);

			// create special object for ARC122U reader with commands specific to this reader
			if (reader.name.toLowerCase().indexOf('acr122') !== -1) {

				var _device = new _ACR122Reader2.default(reader, _this.logger);

				_this.emit('reader', _device);

				return;
			}

			var device = new _Reader2.default(reader, _this.logger);

			_this.emit('reader', device);
		});

		_this.pcsc.on('error', function (err) {

			_this.logger.info('PCSC error', err.message);

			_this.emit('error', err);
		});

		return _this;
	}

	_createClass(NFC, [{
		key: 'close',
		value: function close() {

			this.pcsc.close();
		}
	}]);

	return NFC;
}(_events2.default);

exports.default = NFC;