"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Reader2 = require('./Reader');

var _Reader3 = _interopRequireDefault(_Reader2);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ACR122Reader = function (_Reader) {
	_inherits(ACR122Reader, _Reader);

	function ACR122Reader() {
		_classCallCheck(this, ACR122Reader);

		return _possibleConstructorReturn(this, (ACR122Reader.__proto__ || Object.getPrototypeOf(ACR122Reader)).apply(this, arguments));
	}

	_createClass(ACR122Reader, [{
		key: 'inAutoPoll',
		value: function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
				var payload, packet, response;
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								payload = [0xD4, 0x60, 0xFF, // PollNr (0xFF = Endless polling)
								0x01, // Period (0x01 – 0x0F) indicates the polling period in units of 150 ms
								0x00 // Type 1 0x00 = Generic passive 106 kbps (ISO/IEC14443-4A, Mifare and DEP)
								];

								// CMD: Direct Transmit (to inner PN532 chip InAutoPoll CMD)

								packet = new Buffer([0xff, // Class
								0x00, // INS
								0x00, // P1
								0x00, // P2
								payload.length].concat(payload));


								console.log(packet);

								response = null;
								_context.prev = 4;
								_context.next = 7;
								return this.control(packet, 2);

							case 7:
								response = _context.sent;


								this.logger.info('response received', response);

								// Red OFF Green OFF  0x00
								// Red ON  Green OFF  0x01
								// Red OFF Green ON   0x02
								// Red ON  Green ON   0x03

								console.log(response.slice(1));

								_context.next = 15;
								break;

							case 12:
								_context.prev = 12;
								_context.t0 = _context['catch'](4);
								throw _context.t0;

							case 15:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this, [[4, 12]]);
			}));

			function inAutoPoll() {
				return _ref.apply(this, arguments);
			}

			return inAutoPoll;
		}()
	}, {
		key: 'led',
		value: function () {
			var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_led, blinking) {
				var packet, response;
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:

								// P2: LED State Control (1 byte = 8 bits)
								// format:
								/*
         +-----+----------------------------------+-------------------------------------+
         | Bit |               Item               |             Description             |
         +-----+----------------------------------+-------------------------------------+
         |   0 | Final Red LED State              | 1 = On; 0 = Off                     |
         |   1 | Final Green LED State            | 1 = On; 0 = Off                     |
         |   2 | Red LED State Mask               | 1 = Update the State; 0 = No change |
         |   3 | Green LED State Mask             | 1 = Update the State; 0 = No change |
         |   4 | Initial Red LED Blinking State   | 1 = On; 0 = Off                     |
         |   5 | Initial Green LED Blinking State | 1 = On; 0 = Off                     |
         |   6 | Red LED Blinking Mask            | 1 = Blink ; 0 = Not Blink            |
         |   7 | Green LED Blinking Mask          | 1 = Blink ; 0 = Not Blink            |
         +-----+----------------------------------+-------------------------------------+
         */

								//const led = 0b00001111;
								//const led = 0x50;

								// Data In: Blinking Duration Control (4 bytes)
								// Byte 0: T1 Duration Initial Blinking State (Unit = 100 ms)
								// Byte 1: T2 Duration Toggle Blinking State (Unit = 100 ms)
								// Byte 2: Number of repetition
								// Byte 3: Link to Buzzer
								// - 00: The buzzer will not turn on
								// - 01: The buzzer will turn on during the T1 Duration
								// - 02: The buzzer will turn on during the T2 Duration
								// - 03: The buzzer will turn on during the T1 and T2 Duration

								// const blinking = [
								// 	0x00,
								// 	0x00,
								// 	0x00,
								// 	0x00
								// ];


								// CMD: Bi-Color LED and Buzzer Control
								packet = new Buffer([0xff, // Class
								0x00, // INS
								0x40, // P1
								_led, // P2: LED State Control
								0x04].concat(_toConsumableArray(blinking)));


								console.log(packet);

								response = null;
								_context2.prev = 3;
								_context2.next = 6;
								return this.control(packet, 2);

							case 6:
								response = _context2.sent;


								this.logger.info('response received', response);

								// Red OFF Green OFF  0x00
								// Red ON  Green OFF  0x01
								// Red OFF Green ON   0x02
								// Red ON  Green ON   0x03

								console.log(response.slice(1));

								_context2.next = 14;
								break;

							case 11:
								_context2.prev = 11;
								_context2.t0 = _context2['catch'](3);
								throw _context2.t0;

							case 14:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this, [[3, 11]]);
			}));

			function led(_x, _x2) {
				return _ref2.apply(this, arguments);
			}

			return led;
		}()
	}, {
		key: 'setBuzzerOutput',
		value: function () {
			var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
				var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
				var packet, response, statusCode;
				return regeneratorRuntime.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:

								// CMD: Set Buzzer Output Enable for Card Detection
								packet = new Buffer([0xff, // Class
								0x00, // INS
								0x52, // P1
								enabled ? 0xff : 0x00, // P2: PollBuzzStatus
								0x00]);


								console.log(packet);

								response = null;
								_context3.prev = 3;
								_context3.next = 6;
								return this.control(packet, 2);

							case 6:
								response = _context3.sent;


								this.logger.info('response received', response);

								_context3.next = 13;
								break;

							case 10:
								_context3.prev = 10;
								_context3.t0 = _context3['catch'](3);
								throw _context3.t0;

							case 13:
								statusCode = response.readUInt16BE(0);


								if (statusCode !== 0x9000) {
									//throw new LoadAuthenticationKeyError(OPERATION_FAILED, `Load authentication key operation failed: Status code: ${statusCode}`);
								}

							case 15:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, this, [[3, 10]]);
			}));

			function setBuzzerOutput() {
				return _ref3.apply(this, arguments);
			}

			return setBuzzerOutput;
		}()
	}, {
		key: 'setPICC',
		value: function () {
			var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(picc) {
				var packet, response;
				return regeneratorRuntime.wrap(function _callee4$(_context4) {
					while (1) {
						switch (_context4.prev = _context4.next) {
							case 0:

								// just enable Auto ATS Generation
								// const picc = 0b01000000;

								// CMD: Set PICC Operating Parameter
								packet = new Buffer([0xff, // Class
								0x00, // INS
								0x51, // P1
								picc, // P2: New PICC Operating Parameter
								0x00]);


								console.log(packet);

								response = null;
								_context4.prev = 3;
								_context4.next = 6;
								return this.control(packet, 1);

							case 6:
								response = _context4.sent;


								this.logger.info('response received', response);

								_context4.next = 13;
								break;

							case 10:
								_context4.prev = 10;
								_context4.t0 = _context4['catch'](3);
								throw _context4.t0;

							case 13:
							case 'end':
								return _context4.stop();
						}
					}
				}, _callee4, this, [[3, 10]]);
			}));

			function setPICC(_x4) {
				return _ref4.apply(this, arguments);
			}

			return setPICC;
		}()
	}]);

	return ACR122Reader;
}(_Reader3.default);

exports.default = ACR122Reader;