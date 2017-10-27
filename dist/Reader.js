"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CONNECT_MODE_CARD = exports.CONNECT_MODE_DIRECT = exports.KEY_TYPE_B = exports.KEY_TYPE_A = exports.TAG_ISO_14443_4 = exports.TAG_ISO_14443_3 = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TAG_ISO_14443_3 = exports.TAG_ISO_14443_3 = 'TAG_ISO_14443_3';
var TAG_ISO_14443_4 = exports.TAG_ISO_14443_4 = 'TAG_ISO_14443_4';

var KEY_TYPE_A = exports.KEY_TYPE_A = 0x60;
var KEY_TYPE_B = exports.KEY_TYPE_B = 0x61;

var CONNECT_MODE_DIRECT = exports.CONNECT_MODE_DIRECT = 'CONNECT_MODE_DIRECT';
var CONNECT_MODE_CARD = exports.CONNECT_MODE_CARD = 'CONNECT_MODE_CARD';

var Reader = function (_EventEmitter) {
	_inherits(Reader, _EventEmitter);

	_createClass(Reader, [{
		key: 'aid',
		get: function get() {
			return this._aid;
		},
		set: function set(value) {

			this.logger.info('Setting AID to', value);
			this._aid = value;

			var parsedAid = Reader.parseAid(value);
			this.logger.info('AID parsed', parsedAid);
			this._parsedAid = parsedAid;
		}
	}, {
		key: 'name',
		get: function get() {
			return this.reader.name;
		}
	}], [{
		key: 'reverseBuffer',
		value: function reverseBuffer(src) {

			var buffer = new Buffer(src.length);

			for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
				buffer[i] = src[j];
				buffer[j] = src[i];
			}

			return buffer;
		}
	}, {
		key: 'parseAid',
		value: function parseAid(str) {

			var result = [];

			for (var i = 0; i < str.length; i += 2) {
				result.push(parseInt(str.substr(i, 2), 16));
			}

			return result;
		}
	}, {
		key: 'selectStandardByAtr',
		value: function selectStandardByAtr(atr) {

			// TODO: better detecting card types
			if (atr[5] && atr[5] === 0x4f) {
				return TAG_ISO_14443_3;
			} else {
				return TAG_ISO_14443_4;
			}
		}
	}]);

	function Reader(reader, logger) {
		var _this2 = this;

		_classCallCheck(this, Reader);

		var _this = _possibleConstructorReturn(this, (Reader.__proto__ || Object.getPrototypeOf(Reader)).call(this));

		_this.reader = null;
		_this.logger = null;
		_this.connection = null;
		_this.card = null;
		_this.autoProcessing = true;
		_this._aid = null;
		_this._parsedAid = null;
		_this.keyStorage = {
			'0': null,
			'1': null
		};
		_this.pendingLoadAuthenticationKey = {};


		_this.reader = reader;

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

		_this.reader.on('error', function (err) {

			_this.logger.error(err);

			_this.emit('error', err);
		});

		_this.reader.on('status', function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(status) {
				var changes, atr;
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:

								_this.logger.debug('status', status);

								// check what has changed
								changes = _this.reader.state ^ status.state;


								_this.logger.debug('changes', changes);

								if (!changes) {
									_context.next = 36;
									break;
								}

								if (!(changes & _this.reader.SCARD_STATE_EMPTY && status.state & _this.reader.SCARD_STATE_EMPTY)) {
									_context.next = 19;
									break;
								}

								_this.logger.info('card removed');

								if (_this.card) {
									_this.emit('card.off', _extends({}, _this.card));
								}

								_context.prev = 7;


								_this.card = null;

								if (!_this.connection) {
									_context.next = 12;
									break;
								}

								_context.next = 12;
								return _this.disconnect();

							case 12:
								_context.next = 17;
								break;

							case 14:
								_context.prev = 14;
								_context.t0 = _context['catch'](7);


								_this.emit(_context.t0);

							case 17:
								_context.next = 36;
								break;

							case 19:
								if (!(changes & _this.reader.SCARD_STATE_PRESENT && status.state & _this.reader.SCARD_STATE_PRESENT)) {
									_context.next = 36;
									break;
								}

								atr = status.atr;


								_this.logger.info('card inserted', atr);

								_this.card = {};

								if (atr) {
									_this.card.atr = atr;
									_this.card.standard = Reader.selectStandardByAtr(atr);
									_this.card.type = _this.card.standard;
								}

								_context.prev = 24;
								_context.next = 27;
								return _this.connect();

							case 27:
								if (_this.autoProcessing) {
									_context.next = 30;
									break;
								}

								_this.emit('card', _this.card);
								return _context.abrupt('return');

							case 30:

								_this.handleTag();

								_context.next = 36;
								break;

							case 33:
								_context.prev = 33;
								_context.t1 = _context['catch'](24);


								_this.emit(_context.t1);

							case 36:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, _this2, [[7, 14], [24, 33]]);
			}));

			return function (_x) {
				return _ref.apply(this, arguments);
			};
		}());

		_this.reader.on('end', function () {

			_this.logger.info('reader removed');

			_this.emit('end');
		});

		return _this;
	}

	_createClass(Reader, [{
		key: 'connect',
		value: function connect() {
			var _modes,
			    _this3 = this;

			var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : CONNECT_MODE_CARD;


			var modes = (_modes = {}, _defineProperty(_modes, CONNECT_MODE_DIRECT, this.reader.SCARD_SHARE_DIRECT), _defineProperty(_modes, CONNECT_MODE_CARD, this.reader.SCARD_SHARE_SHARED), _modes);

			if (!modes[mode]) {
				throw new _errors.ConnectError('invalid_mode', 'Invalid mode');
			}

			this.logger.info('trying to connect', mode, modes[mode]);

			return new Promise(function (resolve, reject) {

				// connect card
				_this3.reader.connect({
					share_mode: modes[mode]
					//protocol: this.reader.SCARD_PROTOCOL_UNDEFINED
				}, function (err, protocol) {

					if (err) {
						var error = new _errors.ConnectError(_errors.FAILURE, 'An error occurred while connecting.', err);
						_this3.logger.error(error);
						return reject(error);
					}

					_this3.connection = {
						type: modes[mode],
						protocol: protocol
					};

					_this3.logger.info('connected', _this3.connection);

					return resolve(_this3.connection);
				});
			});
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			var _this4 = this;

			if (!this.connection) {
				throw new _errors.DisconnectError('not_connected', 'Reader in not connected. No need for disconnecting.');
			}

			this.logger.info('trying to disconnect', this.connection);

			return new Promise(function (resolve, reject) {

				// disconnect removed
				_this4.reader.disconnect(_this4.reader.SCARD_LEAVE_CARD, function (err) {

					if (err) {
						var error = new _errors.DisconnectError(_errors.FAILURE, 'An error occurred while disconnecting.', err);
						_this4.logger.error(error);
						return reject(error);
					}

					_this4.connection = null;

					_this4.logger.info('disconnected');

					return resolve(true);
				});
			});
		}
	}, {
		key: 'transmit',
		value: function transmit(data, responseMaxLength) {
			var _this5 = this;

			if (!this.card || !this.connection) {
				throw new _errors.TransmitError(_errors.CARD_NOT_CONNECTED, 'No card or connection available.');
			}

			return new Promise(function (resolve, reject) {

				_this5.logger.log('transmitting', data, responseMaxLength);

				_this5.reader.transmit(data, responseMaxLength, _this5.connection.protocol, function (err, response) {

					if (err) {
						var error = new _errors.TransmitError(_errors.FAILURE, 'An error occurred while transmitting.', err);
						return reject(error);
					}

					return resolve(response);
				});
			});
		}
	}, {
		key: 'control',
		value: function control(data, responseMaxLength) {
			var _this6 = this;

			if (!this.connection) {
				throw new _errors.ControlError('not_connected', 'No connection available.');
			}

			return new Promise(function (resolve, reject) {

				_this6.logger.log('transmitting control', data, responseMaxLength);

				_this6.reader.control(data, _this6.reader.IOCTL_CCID_ESCAPE, responseMaxLength, function (err, response) {

					if (err) {
						var error = new _errors.ControlError(_errors.FAILURE, 'An error occurred while transmitting control.', err);
						return reject(error);
					}

					return resolve(response);
				});
			});
		}
	}, {
		key: 'loadAuthenticationKey',
		value: function () {
			var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(keyNumber, key) {
				var keyData, packet, response, statusCode;
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								if (keyNumber === 0 || keyNumber === 1) {
									_context2.next = 2;
									break;
								}

								throw new _errors.LoadAuthenticationKeyError('invalid_key_number');

							case 2:
								keyData = Reader.parseAid(key);

								if (!(keyData.length !== 6)) {
									_context2.next = 5;
									break;
								}

								throw new _errors.LoadAuthenticationKeyError('invalid_key');

							case 5:

								// CMD: Load Authentication Keys
								packet = new Buffer([0xff, // Class
								0x82, // INS
								0x00, // P1: Key Structure (0x00 = Key is loaded into the reader volatile memory.)
								keyNumber, // P2: Key Number (00h ~ 01h = Key Location. The keys will disappear once the reader is disconnected from the PC)
								0x06].concat(_toConsumableArray(keyData)));
								response = null;
								_context2.prev = 7;
								_context2.next = 10;
								return this.transmit(packet, 2);

							case 10:
								response = _context2.sent;


								this.logger.info('response received', response);

								_context2.next = 17;
								break;

							case 14:
								_context2.prev = 14;
								_context2.t0 = _context2['catch'](7);
								throw new _errors.LoadAuthenticationKeyError(null, null, _context2.t0);

							case 17:
								statusCode = response.readUInt16BE(0);

								if (!(statusCode !== 0x9000)) {
									_context2.next = 20;
									break;
								}

								throw new _errors.LoadAuthenticationKeyError(_errors.OPERATION_FAILED, 'Load authentication key operation failed: Status code: ' + statusCode);

							case 20:

								this.keyStorage[keyNumber] = key;

								return _context2.abrupt('return', keyNumber);

							case 22:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this, [[7, 14]]);
			}));

			function loadAuthenticationKey(_x3, _x4) {
				return _ref2.apply(this, arguments);
			}

			return loadAuthenticationKey;
		}()

		// for PC/SC V2.01 use obsolete = true
		// for PC/SC V2.07 use obsolete = false [default]

	}, {
		key: 'authenticate',
		value: function () {
			var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(blockNumber, keyType, key) {
				var _this7 = this;

				var obsolete = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
				var keyNumber, freeNumber, packet, response, statusCode;
				return regeneratorRuntime.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								keyNumber = Object.keys(this.keyStorage).find(function (n) {
									return _this7.keyStorage[n] === key;
								});

								// key is not in the storage

								if (keyNumber) {
									_context3.next = 25;
									break;
								}

								if (!this.pendingLoadAuthenticationKey[key]) {
									_context3.next = 14;
									break;
								}

								_context3.prev = 3;
								_context3.next = 6;
								return this.pendingLoadAuthenticationKey[key];

							case 6:
								keyNumber = _context3.sent;
								_context3.next = 12;
								break;

							case 9:
								_context3.prev = 9;
								_context3.t0 = _context3['catch'](3);
								throw new _errors.AuthenticationError('unable_to_load_key', 'Could not load authentication key into reader.', _context3.t0);

							case 12:
								_context3.next = 25;
								break;

							case 14:

								// set key number to first
								keyNumber = Object.keys(this.keyStorage)[0];

								// if this number is not free
								if (this.keyStorage[keyNumber] !== null) {
									// try to find any free number
									freeNumber = Object.keys(this.keyStorage).find(function (n) {
										return _this7.keyStorage[n] === null;
									});
									// if we find, we use it, otherwise the first will be used and rewritten

									if (freeNumber) {
										keyNumber = freeNumber;
									}
								}

								_context3.prev = 16;

								this.pendingLoadAuthenticationKey[key] = this.loadAuthenticationKey(parseInt(keyNumber), key);
								_context3.next = 20;
								return this.pendingLoadAuthenticationKey[key];

							case 20:
								_context3.next = 25;
								break;

							case 22:
								_context3.prev = 22;
								_context3.t1 = _context3['catch'](16);
								throw new _errors.AuthenticationError('unable_to_load_key', 'Could not load authentication key into reader.', _context3.t1);

							case 25:
								packet = !obsolete ?
								// CMD: Authentication
								new Buffer([0xff, // Class
								0x86, // INS
								0x00, // P1
								0x00, // P2
								0x05, // Lc
								// Data In: Authenticate Data Bytes (5 bytes)
								0x01, // Byte 1: Version
								0x00, // Byte 2
								blockNumber, // Byte 3: Block Number
								keyType, // Byte 4: Key Type
								keyNumber]) :
								// CMD: Authentication (obsolete)
								new Buffer([0xff, // Class
								0x88, // INS
								0x00, // P1
								blockNumber, // P2: Block Number
								keyType, // P3: Key Type
								keyNumber // Data In: Key Number
								]);
								response = null;
								_context3.prev = 27;
								_context3.next = 30;
								return this.transmit(packet, 2);

							case 30:
								response = _context3.sent;


								this.logger.info('response received', response);

								_context3.next = 37;
								break;

							case 34:
								_context3.prev = 34;
								_context3.t2 = _context3['catch'](27);
								throw new _errors.AuthenticationError(null, null, _context3.t2);

							case 37:
								statusCode = response.readUInt16BE(0);

								if (!(statusCode !== 0x9000)) {
									_context3.next = 41;
									break;
								}

								this.logger.error('[authentication operation failed][request packet]', packet);
								throw new _errors.AuthenticationError(_errors.OPERATION_FAILED, 'Authentication operation failed: Status code: 0x' + statusCode.toString(16));

							case 41:
								return _context3.abrupt('return', true);

							case 42:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, this, [[3, 9], [16, 22], [27, 34]]);
			}));

			function authenticate(_x5, _x6, _x7) {
				return _ref3.apply(this, arguments);
			}

			return authenticate;
		}()
	}, {
		key: 'read',
		value: function () {
			var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(blockNumber, length) {
				var blockSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
				var packetSize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 16;
				var p, commands, i, block, size, packet, response, statusCode, data;
				return regeneratorRuntime.wrap(function _callee4$(_context4) {
					while (1) {
						switch (_context4.prev = _context4.next) {
							case 0:
								if (this.card) {
									_context4.next = 2;
									break;
								}

								throw new _errors.ReadError(_errors.CARD_NOT_CONNECTED);

							case 2:

								this.logger.info('reading data from card', this.card);

								if (!(length > packetSize)) {
									_context4.next = 8;
									break;
								}

								p = Math.ceil(length / packetSize);
								commands = [];


								for (i = 0; i < p; i++) {
									block = blockNumber + i * packetSize / blockSize;
									size = (i + 1) * packetSize < length ? packetSize : length - i * packetSize;

									// console.log(i, block, size);

									commands.push(this.read(block, size, blockSize, packetSize));
								}

								return _context4.abrupt('return', Promise.all(commands).then(function (values) {
									// console.log(values);
									return Buffer.concat(values, length);
								}));

							case 8:

								// APDU CMD: Read Binary Blocks
								packet = new Buffer([0xff, // Class
								0xb0, // Ins
								0x00, // P1
								blockNumber, // P2: Block Number
								length // Le: Number of Bytes to Read (Maximum 16 bytes)
								]);
								response = null;
								_context4.prev = 10;
								_context4.next = 13;
								return this.transmit(packet, length + 2);

							case 13:
								response = _context4.sent;


								this.logger.info('response received', response);

								_context4.next = 20;
								break;

							case 17:
								_context4.prev = 17;
								_context4.t0 = _context4['catch'](10);
								throw new _errors.ReadError(null, null, _context4.t0);

							case 20:
								statusCode = response.slice(-2).readUInt16BE(0);

								if (!(statusCode !== 0x9000)) {
									_context4.next = 23;
									break;
								}

								throw new _errors.ReadError(_errors.OPERATION_FAILED, 'Read operation failed: Status code: 0x' + statusCode.toString(16));

							case 23:
								data = new Buffer(response.slice(0, -2));


								this.logger.info('data', data);

								return _context4.abrupt('return', data);

							case 26:
							case 'end':
								return _context4.stop();
						}
					}
				}, _callee4, this, [[10, 17]]);
			}));

			function read(_x9, _x10) {
				return _ref4.apply(this, arguments);
			}

			return read;
		}()
	}, {
		key: 'write',
		value: function () {
			var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(blockNumber, data) {
				var blockSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
				var p, commands, i, block, start, end, part, packetHeader, packet, response, statusCode;
				return regeneratorRuntime.wrap(function _callee5$(_context5) {
					while (1) {
						switch (_context5.prev = _context5.next) {
							case 0:
								if (this.card) {
									_context5.next = 2;
									break;
								}

								throw new _errors.WriteError(_errors.CARD_NOT_CONNECTED);

							case 2:

								this.logger.info('writing data to card', this.card);

								if (!(data.length < blockSize || data.length % blockSize !== 0)) {
									_context5.next = 5;
									break;
								}

								throw new _errors.WriteError('invalid_data_length', 'Invalid data length. You can only update the entire data block(s).');

							case 5:
								if (!(data.length > blockSize)) {
									_context5.next = 10;
									break;
								}

								p = data.length / blockSize;
								commands = [];


								for (i = 0; i < p; i++) {
									block = blockNumber + i;
									start = i * blockSize;
									end = (i + 1) * blockSize;
									part = data.slice(start, end);

									// console.log(i, block, start, end, part);

									commands.push(this.write(block, part, blockSize));
								}

								return _context5.abrupt('return', Promise.all(commands).then(function (values) {
									// console.log(values);
									return values;
								}));

							case 10:

								// APDU CMD: Update Binary Block
								packetHeader = new Buffer([0xff, // Class
								0xd6, // Ins
								0x00, // P1
								blockNumber, // P2: Block Number
								blockSize]);
								packet = Buffer.concat([packetHeader, data]);
								response = null;
								_context5.prev = 13;
								_context5.next = 16;
								return this.transmit(packet, 2);

							case 16:
								response = _context5.sent;


								this.logger.info('response received', response);

								_context5.next = 23;
								break;

							case 20:
								_context5.prev = 20;
								_context5.t0 = _context5['catch'](13);
								throw new _errors.WriteError(null, null, _context5.t0);

							case 23:
								statusCode = response.readUInt16BE(0);


								this.logger.info("Recived status code: ", "0x" + statusCode.toString(16));

								if (!(statusCode !== 0x9000)) {
									_context5.next = 27;
									break;
								}

								throw new _errors.WriteError(_errors.OPERATION_FAILED, 'Write operation failed: Status code: 0x' + statusCode.toString(16));

							case 27:
								return _context5.abrupt('return', true);

							case 28:
							case 'end':
								return _context5.stop();
						}
					}
				}, _callee5, this, [[13, 20]]);
			}));

			function write(_x13, _x14) {
				return _ref5.apply(this, arguments);
			}

			return write;
		}()
	}, {
		key: 'handleTag',
		value: function handleTag() {

			if (!this.card) {
				return false;
			}

			this.logger.info('handling tag', this.card);

			switch (this.card.standard) {

				case TAG_ISO_14443_3:
					return this.handle_Iso_14443_3_Tag();

				case TAG_ISO_14443_4:
					return this.handle_Iso_14443_4_Tag();

				default:
					return this.handle_Iso_14443_3_Tag();

			}
		}

		// TODO: improve error handling and debugging

	}, {
		key: 'handle_Iso_14443_3_Tag',
		value: function () {
			var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
				var packet, response, error, statusCode, _error, uid, _error2;

				return regeneratorRuntime.wrap(function _callee6$(_context6) {
					while (1) {
						switch (_context6.prev = _context6.next) {
							case 0:
								if (!(!this.card || !this.connection)) {
									_context6.next = 2;
									break;
								}

								return _context6.abrupt('return', false);

							case 2:

								this.logger.info('processing ISO 14443-3 tag', this.card);

								// APDU CMD: Get Data
								packet = new Buffer([0xff, // Class
								0xca, // INS
								0x00, // P1: Get current card UID
								0x00, // P2
								0x00 // Le: Full Length of UID
								]);
								_context6.prev = 4;
								_context6.next = 7;
								return this.transmit(packet, 12);

							case 7:
								response = _context6.sent;

								if (!(response.length < 2)) {
									_context6.next = 12;
									break;
								}

								error = new _errors.GetUIDError('invalid_response', 'Invalid response length ' + response.length + '. Expected minimal length was 2 bytes.');

								this.emit('error', error);

								return _context6.abrupt('return');

							case 12:

								// last 2 bytes are the status code
								statusCode = response.slice(-2).readUInt16BE(0);

								// an error occurred

								if (!(statusCode !== 0x9000)) {
									_context6.next = 17;
									break;
								}

								_error = new _errors.GetUIDError(_errors.OPERATION_FAILED, 'Could not get card UID.');

								this.emit('error', _error);

								return _context6.abrupt('return');

							case 17:

								// strip out the status code (the rest is UID)
								uid = response.slice(0, -2).toString('hex');
								// const uidReverse = Reader.reverseBuffer(response.slice(0, -2)).toString('hex');

								this.card.uid = uid;

								this.emit('card', _extends({}, this.card));

								_context6.next = 26;
								break;

							case 22:
								_context6.prev = 22;
								_context6.t0 = _context6['catch'](4);
								_error2 = new _errors.GetUIDError(null, null, _context6.t0);


								this.emit('error', _error2);

							case 26:
							case 'end':
								return _context6.stop();
						}
					}
				}, _callee6, this, [[4, 22]]);
			}));

			function handle_Iso_14443_3_Tag() {
				return _ref6.apply(this, arguments);
			}

			return handle_Iso_14443_3_Tag;
		}()

		// TODO: improve error handling and debugging

	}, {
		key: 'handle_Iso_14443_4_Tag',
		value: function () {
			var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
				var err, packetHeader, aid, packet, response, _err, _err2, statusCode, _err3, data, error;

				return regeneratorRuntime.wrap(function _callee7$(_context7) {
					while (1) {
						switch (_context7.prev = _context7.next) {
							case 0:
								if (!(!this.card || !this.connection)) {
									_context7.next = 2;
									break;
								}

								return _context7.abrupt('return', false);

							case 2:

								this.logger.info('processing ISO 14443-4 tag', this.card);

								if (this._parsedAid) {
									_context7.next = 7;
									break;
								}

								err = new Error('Cannot process ISO 14443-4 tag because AID was not set.');

								this.emit('error', err);

								return _context7.abrupt('return');

							case 7:

								// APDU CMD: Select Apdu
								packetHeader = Buffer.from([0x00, // Class
								0xa4, // INS
								0x04, // P1
								0x00, // P2
								0x05 // Le
								]);
								aid = Buffer.from(this._parsedAid);
								packet = Buffer.concat([packetHeader, aid]);
								_context7.prev = 10;
								_context7.next = 13;
								return this.transmit(packet, 40);

							case 13:
								response = _context7.sent;

								if (!(response.length === 2 && response.readUInt16BE(0) === 0x6a82)) {
									_context7.next = 18;
									break;
								}

								_err = new Error('Not found response. Tag not compatible with AID ' + this._aid + '.');

								this.emit('error', _err);

								return _context7.abrupt('return');

							case 18:
								if (!(response.length < 2)) {
									_context7.next = 22;
									break;
								}

								_err2 = new Error('Invalid response length ' + response.length + '. Expected minimal length was 2 bytes.');

								this.emit('error', _err2);

								return _context7.abrupt('return');

							case 22:

								// another possibility const statusCode = parseInt(response.slice(-2).toString('hex'), 16)
								statusCode = response.slice(-2).readUInt16BE(0);

								// an error occurred

								if (!(statusCode !== 0x9000)) {
									_context7.next = 27;
									break;
								}

								_err3 = new Error('Response status error.');

								this.emit('error', _err3);

								return _context7.abrupt('return');

							case 27:

								// strip out the status code
								data = response.slice(0, -2);


								this.logger.info('Data cropped', data);

								this.emit('card', _extends({}, this.card, {
									data: data
								}));

								_context7.next = 36;
								break;

							case 32:
								_context7.prev = 32;
								_context7.t0 = _context7['catch'](10);
								error = new _errors.GetUIDError(null, null, _context7.t0);


								this.emit('error', error);

							case 36:
							case 'end':
								return _context7.stop();
						}
					}
				}, _callee7, this, [[10, 32]]);
			}));

			function handle_Iso_14443_4_Tag() {
				return _ref7.apply(this, arguments);
			}

			return handle_Iso_14443_4_Tag;
		}()
	}, {
		key: 'close',
		value: function close() {

			this.reader.close();
		}
	}]);

	return Reader;
}(_events2.default);

exports.default = Reader;