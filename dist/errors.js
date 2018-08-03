"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UNKNOWN_ERROR = exports.UNKNOWN_ERROR = 'unknown_error';

var BaseError = exports.BaseError = function (_Error) {
	_inherits(BaseError, _Error);

	function BaseError(code, message, previousError) {
		_classCallCheck(this, BaseError);

		var _this = _possibleConstructorReturn(this, (BaseError.__proto__ || Object.getPrototypeOf(BaseError)).call(this, message));

		Error.captureStackTrace(_this, _this.constructor);

		_this.name = 'BaseError';

		if (!message && previousError) {
			_this.message = previousError.message;
		}

		_this.code = code;

		if (previousError) {
			_this.previous = previousError;
		}

		return _this;
	}

	return BaseError;
}(Error);

var FAILURE = exports.FAILURE = 'failure';
var CARD_NOT_CONNECTED = exports.CARD_NOT_CONNECTED = 'card_not_connected';
var OPERATION_FAILED = exports.OPERATION_FAILED = 'operation_failed';

var TransmitError = exports.TransmitError = function (_BaseError) {
	_inherits(TransmitError, _BaseError);

	function TransmitError(code, message, previousError) {
		_classCallCheck(this, TransmitError);

		var _this2 = _possibleConstructorReturn(this, (TransmitError.__proto__ || Object.getPrototypeOf(TransmitError)).call(this, code, message, previousError));

		_this2.name = 'TransmitError';

		return _this2;
	}

	return TransmitError;
}(BaseError);

var ControlError = exports.ControlError = function (_BaseError2) {
	_inherits(ControlError, _BaseError2);

	function ControlError(code, message, previousError) {
		_classCallCheck(this, ControlError);

		var _this3 = _possibleConstructorReturn(this, (ControlError.__proto__ || Object.getPrototypeOf(ControlError)).call(this, code, message, previousError));

		_this3.name = 'ControlError';

		return _this3;
	}

	return ControlError;
}(BaseError);

var ReadError = exports.ReadError = function (_BaseError3) {
	_inherits(ReadError, _BaseError3);

	function ReadError(code, message, previousError) {
		_classCallCheck(this, ReadError);

		var _this4 = _possibleConstructorReturn(this, (ReadError.__proto__ || Object.getPrototypeOf(ReadError)).call(this, code, message, previousError));

		_this4.name = 'ReadError';

		return _this4;
	}

	return ReadError;
}(BaseError);

var WriteError = exports.WriteError = function (_BaseError4) {
	_inherits(WriteError, _BaseError4);

	function WriteError(code, message, previousError) {
		_classCallCheck(this, WriteError);

		var _this5 = _possibleConstructorReturn(this, (WriteError.__proto__ || Object.getPrototypeOf(WriteError)).call(this, code, message, previousError));

		_this5.name = 'WriteError';

		return _this5;
	}

	return WriteError;
}(BaseError);

var LoadAuthenticationKeyError = exports.LoadAuthenticationKeyError = function (_BaseError5) {
	_inherits(LoadAuthenticationKeyError, _BaseError5);

	function LoadAuthenticationKeyError(code, message, previousError) {
		_classCallCheck(this, LoadAuthenticationKeyError);

		var _this6 = _possibleConstructorReturn(this, (LoadAuthenticationKeyError.__proto__ || Object.getPrototypeOf(LoadAuthenticationKeyError)).call(this, code, message, previousError));

		_this6.name = 'LoadAuthenticationKeyError';

		return _this6;
	}

	return LoadAuthenticationKeyError;
}(BaseError);

var AuthenticationError = exports.AuthenticationError = function (_BaseError6) {
	_inherits(AuthenticationError, _BaseError6);

	function AuthenticationError(code, message, previousError) {
		_classCallCheck(this, AuthenticationError);

		var _this7 = _possibleConstructorReturn(this, (AuthenticationError.__proto__ || Object.getPrototypeOf(AuthenticationError)).call(this, code, message, previousError));

		_this7.name = 'AuthenticationError';

		return _this7;
	}

	return AuthenticationError;
}(BaseError);

var ConnectError = exports.ConnectError = function (_BaseError7) {
	_inherits(ConnectError, _BaseError7);

	function ConnectError(code, message, previousError) {
		_classCallCheck(this, ConnectError);

		var _this8 = _possibleConstructorReturn(this, (ConnectError.__proto__ || Object.getPrototypeOf(ConnectError)).call(this, code, message, previousError));

		_this8.name = 'ConnectError';

		return _this8;
	}

	return ConnectError;
}(BaseError);

var DisconnectError = exports.DisconnectError = function (_BaseError8) {
	_inherits(DisconnectError, _BaseError8);

	function DisconnectError(code, message, previousError) {
		_classCallCheck(this, DisconnectError);

		var _this9 = _possibleConstructorReturn(this, (DisconnectError.__proto__ || Object.getPrototypeOf(DisconnectError)).call(this, code, message, previousError));

		_this9.name = 'DisconnectError';

		return _this9;
	}

	return DisconnectError;
}(BaseError);

var GetUIDError = exports.GetUIDError = function (_BaseError9) {
	_inherits(GetUIDError, _BaseError9);

	function GetUIDError(code, message, previousError) {
		_classCallCheck(this, GetUIDError);

		var _this10 = _possibleConstructorReturn(this, (GetUIDError.__proto__ || Object.getPrototypeOf(GetUIDError)).call(this, code, message, previousError));

		_this10.name = 'GetUIDError';

		return _this10;
	}

	return GetUIDError;
}(BaseError);