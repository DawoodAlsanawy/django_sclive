(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["elastic-apm-rum"] = factory();
	else
		root["elastic-apm-rum"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../rum-core/dist/es/bootstrap.js":
/*!****************************************!*\
  !*** ../rum-core/dist/es/bootstrap.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bootstrap: function() { return /* binding */ bootstrap; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_patching__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/patching */ "../rum-core/dist/es/common/patching/index.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./state */ "../rum-core/dist/es/state.js");



var enabled = false;
function bootstrap() {
  if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.isPlatformSupported)()) {
    (0,_common_patching__WEBPACK_IMPORTED_MODULE_1__.patchAll)();
    _state__WEBPACK_IMPORTED_MODULE_2__.state.bootstrapTime = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.now)();
    enabled = true;
  } else if (_common_utils__WEBPACK_IMPORTED_MODULE_0__.isBrowser) {
    console.log('[Elastic APM] platform is not supported!');
  }

  return enabled;
}

/***/ }),

/***/ "../rum-core/dist/es/common/after-frame.js":
/*!*************************************************!*\
  !*** ../rum-core/dist/es/common/after-frame.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ afterFrame; }
/* harmony export */ });
var RAF_TIMEOUT = 100;
function afterFrame(callback) {
  var handler = function handler() {
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    setTimeout(callback);
  };

  var timeout = setTimeout(handler, RAF_TIMEOUT);
  var raf = requestAnimationFrame(handler);
}

/***/ }),

/***/ "../rum-core/dist/es/common/apm-server.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/common/apm-server.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _queue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queue */ "../rum-core/dist/es/common/queue.js");
/* harmony import */ var _throttle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./throttle */ "../rum-core/dist/es/common/throttle.js");
/* harmony import */ var _ndjson__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ndjson */ "../rum-core/dist/es/common/ndjson.js");
/* harmony import */ var _truncate__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./truncate */ "../rum-core/dist/es/common/truncate.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _compress__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./compress */ "../rum-core/dist/es/common/compress.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _http_fetch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./http/fetch */ "../rum-core/dist/es/common/http/fetch.js");
/* harmony import */ var _http_xhr__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./http/xhr */ "../rum-core/dist/es/common/http/xhr.js");











var THROTTLE_INTERVAL = 60000;

var ApmServer = function () {
  function ApmServer(configService, loggingService) {
    this._configService = configService;
    this._loggingService = loggingService;
    this.queue = undefined;
    this.throttleEvents = _utils__WEBPACK_IMPORTED_MODULE_0__.noop;
  }

  var _proto = ApmServer.prototype;

  _proto.init = function init() {
    var _this = this;

    var queueLimit = this._configService.get('queueLimit');

    var flushInterval = this._configService.get('flushInterval');

    var limit = this._configService.get('eventsLimit');

    var onFlush = function onFlush(events) {
      var promise = _this.sendEvents(events);

      if (promise) {
        promise.catch(function (reason) {
          _this._loggingService.warn('Failed sending events!', _this._constructError(reason));
        });
      }
    };

    this.queue = new _queue__WEBPACK_IMPORTED_MODULE_1__["default"](onFlush, {
      queueLimit: queueLimit,
      flushInterval: flushInterval
    });
    this.throttleEvents = (0,_throttle__WEBPACK_IMPORTED_MODULE_2__["default"])(this.queue.add.bind(this.queue), function () {
      return _this._loggingService.warn('Dropped events due to throttling!');
    }, {
      limit: limit,
      interval: THROTTLE_INTERVAL
    });

    this._configService.observeEvent(_constants__WEBPACK_IMPORTED_MODULE_3__.QUEUE_FLUSH, function () {
      _this.queue.flush();
    });
  };

  _proto._postJson = function _postJson(endPoint, payload) {
    var _this2 = this;

    var headers = {
      'Content-Type': 'application/x-ndjson'
    };

    var apmRequest = this._configService.get('apmRequest');

    var params = {
      payload: payload,
      headers: headers,
      beforeSend: apmRequest
    };
    return (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressPayload)(params).catch(function (error) {
      if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
        _this2._loggingService.debug('Compressing the payload using CompressionStream API failed', error.message);
      }

      return params;
    }).then(function (result) {
      return _this2._makeHttpRequest('POST', endPoint, result);
    }).then(function (_ref) {
      var responseText = _ref.responseText;
      return responseText;
    });
  };

  _proto._constructError = function _constructError(reason) {
    var url = reason.url,
        status = reason.status,
        responseText = reason.responseText;

    if (typeof status == 'undefined') {
      return reason;
    }

    var message = url + ' HTTP status: ' + status;

    if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__ && responseText) {
      try {
        var serverErrors = [];
        var response = JSON.parse(responseText);

        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(function (err) {
            return serverErrors.push(err.message);
          });
          message += ' ' + serverErrors.join(',');
        }
      } catch (e) {
        this._loggingService.debug('Error parsing response from APM server', e);
      }
    }

    return new Error(message);
  };

  _proto._makeHttpRequest = function _makeHttpRequest(method, url, _temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        _ref2$timeout = _ref2.timeout,
        timeout = _ref2$timeout === void 0 ? _constants__WEBPACK_IMPORTED_MODULE_3__.HTTP_REQUEST_TIMEOUT : _ref2$timeout,
        payload = _ref2.payload,
        headers = _ref2.headers,
        beforeSend = _ref2.beforeSend;

    var sendCredentials = this._configService.get('sendCredentials');

    if (!beforeSend && (0,_http_fetch__WEBPACK_IMPORTED_MODULE_6__.shouldUseFetchWithKeepAlive)(method, payload)) {
      return (0,_http_fetch__WEBPACK_IMPORTED_MODULE_6__.sendFetchRequest)(method, url, {
        keepalive: true,
        timeout: timeout,
        payload: payload,
        headers: headers,
        sendCredentials: sendCredentials
      }).catch(function (reason) {
        if (reason instanceof TypeError) {
          return (0,_http_xhr__WEBPACK_IMPORTED_MODULE_7__.sendXHR)(method, url, {
            timeout: timeout,
            payload: payload,
            headers: headers,
            beforeSend: beforeSend,
            sendCredentials: sendCredentials
          });
        }

        throw reason;
      });
    }

    return (0,_http_xhr__WEBPACK_IMPORTED_MODULE_7__.sendXHR)(method, url, {
      timeout: timeout,
      payload: payload,
      headers: headers,
      beforeSend: beforeSend,
      sendCredentials: sendCredentials
    });
  };

  _proto.fetchConfig = function fetchConfig(serviceName, environment) {
    var _this3 = this;

    var _this$getEndpoints = this.getEndpoints(),
        configEndpoint = _this$getEndpoints.configEndpoint;

    if (!serviceName) {
      return _polyfills__WEBPACK_IMPORTED_MODULE_8__.Promise.reject('serviceName is required for fetching central config.');
    }

    configEndpoint += "?service.name=" + serviceName;

    if (environment) {
      configEndpoint += "&service.environment=" + environment;
    }

    var localConfig = this._configService.getLocalConfig();

    if (localConfig) {
      configEndpoint += "&ifnonematch=" + localConfig.etag;
    }

    var apmRequest = this._configService.get('apmRequest');

    return this._makeHttpRequest('GET', configEndpoint, {
      timeout: 5000,
      beforeSend: apmRequest
    }).then(function (xhr) {
      var status = xhr.status,
          responseText = xhr.responseText;

      if (status === 304) {
        return localConfig;
      } else {
        var remoteConfig = JSON.parse(responseText);
        var etag = xhr.getResponseHeader('etag');

        if (etag) {
          remoteConfig.etag = etag.replace(/["]/g, '');

          _this3._configService.setLocalConfig(remoteConfig, true);
        }

        return remoteConfig;
      }
    }).catch(function (reason) {
      var error = _this3._constructError(reason);

      return _polyfills__WEBPACK_IMPORTED_MODULE_8__.Promise.reject(error);
    });
  };

  _proto.createMetaData = function createMetaData() {
    var cfg = this._configService;
    var metadata = {
      service: {
        name: cfg.get('serviceName'),
        version: cfg.get('serviceVersion'),
        agent: {
          name: 'rum-js',
          version: cfg.version
        },
        language: {
          name: 'javascript'
        },
        environment: cfg.get('environment')
      },
      labels: cfg.get('context.tags')
    };
    return (0,_truncate__WEBPACK_IMPORTED_MODULE_9__.truncateModel)(_truncate__WEBPACK_IMPORTED_MODULE_9__.METADATA_MODEL, metadata);
  };

  _proto.addError = function addError(error) {
    var _this$throttleEvents;

    this.throttleEvents((_this$throttleEvents = {}, _this$throttleEvents[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS] = error, _this$throttleEvents));
  };

  _proto.addTransaction = function addTransaction(transaction) {
    var _this$throttleEvents2;

    this.throttleEvents((_this$throttleEvents2 = {}, _this$throttleEvents2[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS] = transaction, _this$throttleEvents2));
  };

  _proto.ndjsonErrors = function ndjsonErrors(errors, compress) {
    var key = compress ? 'e' : 'error';
    return errors.map(function (error) {
      var _NDJSON$stringify;

      return _ndjson__WEBPACK_IMPORTED_MODULE_10__["default"].stringify((_NDJSON$stringify = {}, _NDJSON$stringify[key] = compress ? (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressError)(error) : error, _NDJSON$stringify));
    });
  };

  _proto.ndjsonMetricsets = function ndjsonMetricsets(metricsets) {
    return metricsets.map(function (metricset) {
      return _ndjson__WEBPACK_IMPORTED_MODULE_10__["default"].stringify({
        metricset: metricset
      });
    }).join('');
  };

  _proto.ndjsonTransactions = function ndjsonTransactions(transactions, compress) {
    var _this4 = this;

    var key = compress ? 'x' : 'transaction';
    return transactions.map(function (tr) {
      var _NDJSON$stringify2;

      var spans = '',
          breakdowns = '';

      if (!compress) {
        if (tr.spans) {
          spans = tr.spans.map(function (span) {
            return _ndjson__WEBPACK_IMPORTED_MODULE_10__["default"].stringify({
              span: span
            });
          }).join('');
          delete tr.spans;
        }

        if (tr.breakdown) {
          breakdowns = _this4.ndjsonMetricsets(tr.breakdown);
          delete tr.breakdown;
        }
      }

      return _ndjson__WEBPACK_IMPORTED_MODULE_10__["default"].stringify((_NDJSON$stringify2 = {}, _NDJSON$stringify2[key] = compress ? (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressTransaction)(tr) : tr, _NDJSON$stringify2)) + spans + breakdowns;
    });
  };

  _proto.sendEvents = function sendEvents(events) {
    var _payload, _NDJSON$stringify3;

    if (events.length === 0) {
      return;
    }

    var transactions = [];
    var errors = [];

    for (var i = 0; i < events.length; i++) {
      var event = events[i];

      if (event[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS]) {
        transactions.push(event[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS]);
      }

      if (event[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS]) {
        errors.push(event[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS]);
      }
    }

    if (transactions.length === 0 && errors.length === 0) {
      return;
    }

    var cfg = this._configService;
    var payload = (_payload = {}, _payload[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS] = transactions, _payload[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS] = errors, _payload);
    var filteredPayload = cfg.applyFilters(payload);

    if (!filteredPayload) {
      this._loggingService.warn('Dropped payload due to filtering!');

      return;
    }

    var apiVersion = cfg.get('apiVersion');
    var compress = apiVersion > 2;
    var ndjson = [];
    var metadata = this.createMetaData();
    var metadataKey = compress ? 'm' : 'metadata';
    ndjson.push(_ndjson__WEBPACK_IMPORTED_MODULE_10__["default"].stringify((_NDJSON$stringify3 = {}, _NDJSON$stringify3[metadataKey] = compress ? (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressMetadata)(metadata) : metadata, _NDJSON$stringify3)));
    ndjson = ndjson.concat(this.ndjsonErrors(filteredPayload[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS], compress), this.ndjsonTransactions(filteredPayload[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS], compress));
    var ndjsonPayload = ndjson.join('');

    var _this$getEndpoints2 = this.getEndpoints(),
        intakeEndpoint = _this$getEndpoints2.intakeEndpoint;

    return this._postJson(intakeEndpoint, ndjsonPayload);
  };

  _proto.getEndpoints = function getEndpoints() {
    var serverUrl = this._configService.get('serverUrl');

    var apiVersion = this._configService.get('apiVersion');

    var serverUrlPrefix = this._configService.get('serverUrlPrefix') || "/intake/v" + apiVersion + "/rum/events";
    var intakeEndpoint = serverUrl + serverUrlPrefix;
    var configEndpoint = serverUrl + "/config/v1/rum/agents";
    return {
      intakeEndpoint: intakeEndpoint,
      configEndpoint: configEndpoint
    };
  };

  return ApmServer;
}();

/* harmony default export */ __webpack_exports__["default"] = (ApmServer);

/***/ }),

/***/ "../rum-core/dist/es/common/compress.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/compress.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compressError: function() { return /* binding */ compressError; },
/* harmony export */   compressMetadata: function() { return /* binding */ compressMetadata; },
/* harmony export */   compressMetricsets: function() { return /* binding */ compressMetricsets; },
/* harmony export */   compressPayload: function() { return /* binding */ compressPayload; },
/* harmony export */   compressTransaction: function() { return /* binding */ compressTransaction; }
/* harmony export */ });
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _performance_monitoring_navigation_marks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../performance-monitoring/navigation/marks */ "../rum-core/dist/es/performance-monitoring/navigation/marks.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");




function compressStackFrames(frames) {
  return frames.map(function (frame) {
    return {
      ap: frame.abs_path,
      f: frame.filename,
      fn: frame.function,
      li: frame.lineno,
      co: frame.colno
    };
  });
}

function compressResponse(response) {
  return {
    ts: response.transfer_size,
    ebs: response.encoded_body_size,
    dbs: response.decoded_body_size
  };
}

function compressHTTP(http) {
  var compressed = {};
  var method = http.method,
      status_code = http.status_code,
      url = http.url,
      response = http.response;
  compressed.url = url;

  if (method) {
    compressed.mt = method;
  }

  if (status_code) {
    compressed.sc = status_code;
  }

  if (response) {
    compressed.r = compressResponse(response);
  }

  return compressed;
}

function compressContext(context) {
  if (!context) {
    return null;
  }

  var compressed = {};
  var page = context.page,
      http = context.http,
      response = context.response,
      destination = context.destination,
      user = context.user,
      custom = context.custom;

  if (page) {
    compressed.p = {
      rf: page.referer,
      url: page.url
    };
  }

  if (http) {
    compressed.h = compressHTTP(http);
  }

  if (response) {
    compressed.r = compressResponse(response);
  }

  if (destination) {
    var service = destination.service;
    compressed.dt = {
      se: {
        n: service.name,
        t: service.type,
        rc: service.resource
      },
      ad: destination.address,
      po: destination.port
    };
  }

  if (user) {
    compressed.u = {
      id: user.id,
      un: user.username,
      em: user.email
    };
  }

  if (custom) {
    compressed.cu = custom;
  }

  return compressed;
}

function compressMarks(marks) {
  if (!marks) {
    return null;
  }

  var compressedNtMarks = compressNavigationTimingMarks(marks.navigationTiming);
  var compressed = {
    nt: compressedNtMarks,
    a: compressAgentMarks(compressedNtMarks, marks.agent)
  };
  return compressed;
}

function compressNavigationTimingMarks(ntMarks) {
  if (!ntMarks) {
    return null;
  }

  var compressed = {};
  _performance_monitoring_navigation_marks__WEBPACK_IMPORTED_MODULE_0__.COMPRESSED_NAV_TIMING_MARKS.forEach(function (mark, index) {
    var mapping = _performance_monitoring_navigation_marks__WEBPACK_IMPORTED_MODULE_0__.NAVIGATION_TIMING_MARKS[index];
    compressed[mark] = ntMarks[mapping];
  });
  return compressed;
}

function compressAgentMarks(compressedNtMarks, agentMarks) {
  var compressed = {};

  if (compressedNtMarks) {
    compressed = {
      fb: compressedNtMarks.rs,
      di: compressedNtMarks.di,
      dc: compressedNtMarks.dc
    };
  }

  if (agentMarks) {
    var fp = agentMarks.firstContentfulPaint;
    var lp = agentMarks.largestContentfulPaint;

    if (fp) {
      compressed.fp = fp;
    }

    if (lp) {
      compressed.lp = lp;
    }
  }

  if (Object.keys(compressed).length === 0) {
    return null;
  }

  return compressed;
}

function compressMetadata(metadata) {
  var service = metadata.service,
      labels = metadata.labels;
  var agent = service.agent,
      language = service.language;
  return {
    se: {
      n: service.name,
      ve: service.version,
      a: {
        n: agent.name,
        ve: agent.version
      },
      la: {
        n: language.name
      },
      en: service.environment
    },
    l: labels
  };
}
function compressTransaction(transaction) {
  var spans = transaction.spans.map(function (span) {
    var spanData = {
      id: span.id,
      n: span.name,
      t: span.type,
      s: span.start,
      d: span.duration,
      c: compressContext(span.context),
      o: span.outcome,
      sr: span.sample_rate
    };

    if (span.parent_id !== transaction.id) {
      spanData.pid = span.parent_id;
    }

    if (span.sync === true) {
      spanData.sy = true;
    }

    if (span.subtype) {
      spanData.su = span.subtype;
    }

    if (span.action) {
      spanData.ac = span.action;
    }

    return spanData;
  });
  var tr = {
    id: transaction.id,
    tid: transaction.trace_id,
    n: transaction.name,
    t: transaction.type,
    d: transaction.duration,
    c: compressContext(transaction.context),
    k: compressMarks(transaction.marks),
    me: compressMetricsets(transaction.breakdown),
    y: spans,
    yc: {
      sd: spans.length
    },
    sm: transaction.sampled,
    sr: transaction.sample_rate,
    o: transaction.outcome
  };

  if (transaction.experience) {
    var _transaction$experien = transaction.experience,
        cls = _transaction$experien.cls,
        fid = _transaction$experien.fid,
        tbt = _transaction$experien.tbt,
        longtask = _transaction$experien.longtask;
    tr.exp = {
      cls: cls,
      fid: fid,
      tbt: tbt,
      lt: longtask
    };
  }

  if (transaction.session) {
    var _transaction$session = transaction.session,
        id = _transaction$session.id,
        sequence = _transaction$session.sequence;
    tr.ses = {
      id: id,
      seq: sequence
    };
  }

  return tr;
}
function compressError(error) {
  var exception = error.exception;
  var compressed = {
    id: error.id,
    cl: error.culprit,
    ex: {
      mg: exception.message,
      st: compressStackFrames(exception.stacktrace),
      t: error.type
    },
    c: compressContext(error.context)
  };
  var transaction = error.transaction;

  if (transaction) {
    compressed.tid = error.trace_id;
    compressed.pid = error.parent_id;
    compressed.xid = error.transaction_id;
    compressed.x = {
      t: transaction.type,
      sm: transaction.sampled
    };
  }

  return compressed;
}
function compressMetricsets(breakdowns) {
  return breakdowns.map(function (_ref) {
    var span = _ref.span,
        samples = _ref.samples;
    return {
      y: {
        t: span.type
      },
      sa: {
        ysc: {
          v: samples['span.self_time.count'].value
        },
        yss: {
          v: samples['span.self_time.sum.us'].value
        }
      }
    };
  });
}
function compressPayload(params, type) {
  if (type === void 0) {
    type = 'gzip';
  }

  var isCompressionStreamSupported = typeof CompressionStream === 'function';
  return new _polyfills__WEBPACK_IMPORTED_MODULE_1__.Promise(function (resolve) {
    if (!isCompressionStreamSupported) {
      return resolve(params);
    }

    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isBeaconInspectionEnabled)()) {
      return resolve(params);
    }

    var payload = params.payload,
        headers = params.headers,
        beforeSend = params.beforeSend;
    var payloadStream = new Blob([payload]).stream();
    var compressedStream = payloadStream.pipeThrough(new CompressionStream(type));
    return new Response(compressedStream).blob().then(function (payload) {
      headers['Content-Encoding'] = type;
      return resolve({
        payload: payload,
        headers: headers,
        beforeSend: beforeSend
      });
    });
  });
}

/***/ }),

/***/ "../rum-core/dist/es/common/config-service.js":
/*!****************************************************!*\
  !*** ../rum-core/dist/es/common/config-service.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _event_handler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-handler */ "../rum-core/dist/es/common/event-handler.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}





function getConfigFromScript() {
  var script = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCurrentScript)();
  var config = getDataAttributesFromNode(script);
  return config;
}

function getDataAttributesFromNode(node) {
  if (!node) {
    return {};
  }

  var dataAttrs = {};
  var dataRegex = /^data-([\w-]+)$/;
  var attrs = node.attributes;

  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];

    if (dataRegex.test(attr.nodeName)) {
      var key = attr.nodeName.match(dataRegex)[1];
      var camelCasedkey = key.split('-').map(function (value, index) {
        return index > 0 ? value.charAt(0).toUpperCase() + value.substring(1) : value;
      }).join('');
      dataAttrs[camelCasedkey] = attr.value || attr.nodeValue;
    }
  }

  return dataAttrs;
}

var Config = function () {
  function Config() {
    this.config = {
      serviceName: '',
      serviceVersion: '',
      environment: '',
      serverUrl: 'http://localhost:8200',
      serverUrlPrefix: '',
      active: true,
      instrument: true,
      disableInstrumentations: [],
      logLevel: 'warn',
      breakdownMetrics: false,
      ignoreTransactions: [],
      eventsLimit: 80,
      queueLimit: -1,
      flushInterval: 500,
      distributedTracing: true,
      distributedTracingOrigins: [],
      distributedTracingHeaderName: 'traceparent',
      pageLoadTraceId: '',
      pageLoadSpanId: '',
      pageLoadSampled: false,
      pageLoadTransactionName: '',
      propagateTracestate: false,
      transactionSampleRate: 1.0,
      centralConfig: false,
      monitorLongtasks: true,
      apiVersion: 2,
      context: {},
      session: false,
      apmRequest: null,
      sendCredentials: false
    };
    this.events = new _event_handler__WEBPACK_IMPORTED_MODULE_1__["default"]();
    this.filters = [];
    this.version = '';
  }

  var _proto = Config.prototype;

  _proto.init = function init() {
    var scriptData = getConfigFromScript();
    this.setConfig(scriptData);
  };

  _proto.setVersion = function setVersion(version) {
    this.version = version;
  };

  _proto.addFilter = function addFilter(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Argument to must be function');
    }

    this.filters.push(cb);
  };

  _proto.applyFilters = function applyFilters(data) {
    for (var i = 0; i < this.filters.length; i++) {
      data = this.filters[i](data);

      if (!data) {
        return;
      }
    }

    return data;
  };

  _proto.get = function get(key) {
    return key.split('.').reduce(function (obj, objKey) {
      return obj && obj[objKey];
    }, this.config);
  };

  _proto.setUserContext = function setUserContext(userContext) {
    if (userContext === void 0) {
      userContext = {};
    }

    var context = {};
    var _userContext = userContext,
        id = _userContext.id,
        username = _userContext.username,
        email = _userContext.email;

    if (typeof id === 'number' || typeof id === 'string') {
      context.id = id;
    }

    if (typeof username === 'string') {
      context.username = username;
    }

    if (typeof email === 'string') {
      context.email = email;
    }

    this.config.context.user = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.extend)(this.config.context.user || {}, context);
  };

  _proto.setCustomContext = function setCustomContext(customContext) {
    if (customContext === void 0) {
      customContext = {};
    }

    this.config.context.custom = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.extend)(this.config.context.custom || {}, customContext);
  };

  _proto.addLabels = function addLabels(tags) {
    var _this = this;

    if (!this.config.context.tags) {
      this.config.context.tags = {};
    }

    var keys = Object.keys(tags);
    keys.forEach(function (k) {
      return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.setLabel)(k, tags[k], _this.config.context.tags);
    });
  };

  _proto.setConfig = function setConfig(properties) {
    if (properties === void 0) {
      properties = {};
    }

    var _properties = properties,
        transactionSampleRate = _properties.transactionSampleRate,
        serverUrl = _properties.serverUrl;

    if (serverUrl) {
      properties.serverUrl = serverUrl.replace(/\/+$/, '');
    }

    if (!(0,_utils__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(transactionSampleRate)) {
      if (transactionSampleRate < 0.0001 && transactionSampleRate > 0) {
        transactionSampleRate = 0.0001;
      }

      properties.transactionSampleRate = Math.round(transactionSampleRate * 10000) / 10000;
    }

    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.merge)(this.config, properties);
    this.events.send(_constants__WEBPACK_IMPORTED_MODULE_2__.CONFIG_CHANGE, [this.config]);
  };

  _proto.validate = function validate(properties) {
    if (properties === void 0) {
      properties = {};
    }

    var requiredKeys = ['serviceName', 'serverUrl'];
    var allKeys = Object.keys(this.config);
    var errors = {
      missing: [],
      invalid: [],
      unknown: []
    };
    Object.keys(properties).forEach(function (key) {
      if (requiredKeys.indexOf(key) !== -1 && !properties[key]) {
        errors.missing.push(key);
      }

      if (allKeys.indexOf(key) === -1) {
        errors.unknown.push(key);
      }
    });

    if (properties.serviceName && !/^[a-zA-Z0-9 _-]+$/.test(properties.serviceName)) {
      errors.invalid.push({
        key: 'serviceName',
        value: properties.serviceName,
        allowed: 'a-z, A-Z, 0-9, _, -, <space>'
      });
    }

    var sampleRate = properties.transactionSampleRate;

    if (typeof sampleRate !== 'undefined' && (typeof sampleRate !== 'number' || isNaN(sampleRate) || sampleRate < 0 || sampleRate > 1)) {
      errors.invalid.push({
        key: 'transactionSampleRate',
        value: sampleRate,
        allowed: 'Number between 0 and 1'
      });
    }

    return errors;
  };

  _proto.getLocalConfig = function getLocalConfig() {
    var storage = sessionStorage;

    if (this.config.session) {
      storage = localStorage;
    }

    var config = storage.getItem(_constants__WEBPACK_IMPORTED_MODULE_2__.LOCAL_CONFIG_KEY);

    if (config) {
      return JSON.parse(config);
    }
  };

  _proto.setLocalConfig = function setLocalConfig(config, merge) {
    if (config) {
      if (merge) {
        var prevConfig = this.getLocalConfig();
        config = _extends({}, prevConfig, config);
      }

      var storage = sessionStorage;

      if (this.config.session) {
        storage = localStorage;
      }

      storage.setItem(_constants__WEBPACK_IMPORTED_MODULE_2__.LOCAL_CONFIG_KEY, JSON.stringify(config));
    }
  };

  _proto.dispatchEvent = function dispatchEvent(name, args) {
    this.events.send(name, args);
  };

  _proto.observeEvent = function observeEvent(name, fn) {
    return this.events.observe(name, fn);
  };

  return Config;
}();

/* harmony default export */ __webpack_exports__["default"] = (Config);

/***/ }),

/***/ "../rum-core/dist/es/common/constants.js":
/*!***********************************************!*\
  !*** ../rum-core/dist/es/common/constants.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ADD_EVENT_LISTENER_STR: function() { return /* binding */ ADD_EVENT_LISTENER_STR; },
/* harmony export */   AFTER_EVENT: function() { return /* binding */ AFTER_EVENT; },
/* harmony export */   APM_SERVER: function() { return /* binding */ APM_SERVER; },
/* harmony export */   BEFORE_EVENT: function() { return /* binding */ BEFORE_EVENT; },
/* harmony export */   CLICK: function() { return /* binding */ CLICK; },
/* harmony export */   CONFIG_CHANGE: function() { return /* binding */ CONFIG_CHANGE; },
/* harmony export */   CONFIG_SERVICE: function() { return /* binding */ CONFIG_SERVICE; },
/* harmony export */   ERROR: function() { return /* binding */ ERROR; },
/* harmony export */   ERRORS: function() { return /* binding */ ERRORS; },
/* harmony export */   ERROR_LOGGING: function() { return /* binding */ ERROR_LOGGING; },
/* harmony export */   EVENT: function() { return /* binding */ EVENT; },
/* harmony export */   EVENT_TARGET: function() { return /* binding */ EVENT_TARGET; },
/* harmony export */   FETCH: function() { return /* binding */ FETCH; },
/* harmony export */   FIRST_CONTENTFUL_PAINT: function() { return /* binding */ FIRST_CONTENTFUL_PAINT; },
/* harmony export */   FIRST_INPUT: function() { return /* binding */ FIRST_INPUT; },
/* harmony export */   HISTORY: function() { return /* binding */ HISTORY; },
/* harmony export */   HTTP_REQUEST_TIMEOUT: function() { return /* binding */ HTTP_REQUEST_TIMEOUT; },
/* harmony export */   HTTP_REQUEST_TYPE: function() { return /* binding */ HTTP_REQUEST_TYPE; },
/* harmony export */   INVOKE: function() { return /* binding */ INVOKE; },
/* harmony export */   KEYWORD_LIMIT: function() { return /* binding */ KEYWORD_LIMIT; },
/* harmony export */   LARGEST_CONTENTFUL_PAINT: function() { return /* binding */ LARGEST_CONTENTFUL_PAINT; },
/* harmony export */   LAYOUT_SHIFT: function() { return /* binding */ LAYOUT_SHIFT; },
/* harmony export */   LOCAL_CONFIG_KEY: function() { return /* binding */ LOCAL_CONFIG_KEY; },
/* harmony export */   LOGGING_SERVICE: function() { return /* binding */ LOGGING_SERVICE; },
/* harmony export */   LONG_TASK: function() { return /* binding */ LONG_TASK; },
/* harmony export */   MAX_SPAN_DURATION: function() { return /* binding */ MAX_SPAN_DURATION; },
/* harmony export */   MEASURE: function() { return /* binding */ MEASURE; },
/* harmony export */   NAME_UNKNOWN: function() { return /* binding */ NAME_UNKNOWN; },
/* harmony export */   NAVIGATION: function() { return /* binding */ NAVIGATION; },
/* harmony export */   OUTCOME_FAILURE: function() { return /* binding */ OUTCOME_FAILURE; },
/* harmony export */   OUTCOME_SUCCESS: function() { return /* binding */ OUTCOME_SUCCESS; },
/* harmony export */   OUTCOME_UNKNOWN: function() { return /* binding */ OUTCOME_UNKNOWN; },
/* harmony export */   PAGE_EXIT: function() { return /* binding */ PAGE_EXIT; },
/* harmony export */   PAGE_LOAD: function() { return /* binding */ PAGE_LOAD; },
/* harmony export */   PAGE_LOAD_DELAY: function() { return /* binding */ PAGE_LOAD_DELAY; },
/* harmony export */   PAINT: function() { return /* binding */ PAINT; },
/* harmony export */   PERFORMANCE_MONITORING: function() { return /* binding */ PERFORMANCE_MONITORING; },
/* harmony export */   QUEUE_ADD_TRANSACTION: function() { return /* binding */ QUEUE_ADD_TRANSACTION; },
/* harmony export */   QUEUE_FLUSH: function() { return /* binding */ QUEUE_FLUSH; },
/* harmony export */   REMOVE_EVENT_LISTENER_STR: function() { return /* binding */ REMOVE_EVENT_LISTENER_STR; },
/* harmony export */   RESOURCE: function() { return /* binding */ RESOURCE; },
/* harmony export */   RESOURCE_INITIATOR_TYPES: function() { return /* binding */ RESOURCE_INITIATOR_TYPES; },
/* harmony export */   REUSABILITY_THRESHOLD: function() { return /* binding */ REUSABILITY_THRESHOLD; },
/* harmony export */   ROUTE_CHANGE: function() { return /* binding */ ROUTE_CHANGE; },
/* harmony export */   SCHEDULE: function() { return /* binding */ SCHEDULE; },
/* harmony export */   SESSION_TIMEOUT: function() { return /* binding */ SESSION_TIMEOUT; },
/* harmony export */   TEMPORARY_TYPE: function() { return /* binding */ TEMPORARY_TYPE; },
/* harmony export */   TRANSACTIONS: function() { return /* binding */ TRANSACTIONS; },
/* harmony export */   TRANSACTION_END: function() { return /* binding */ TRANSACTION_END; },
/* harmony export */   TRANSACTION_IGNORE: function() { return /* binding */ TRANSACTION_IGNORE; },
/* harmony export */   TRANSACTION_SERVICE: function() { return /* binding */ TRANSACTION_SERVICE; },
/* harmony export */   TRANSACTION_START: function() { return /* binding */ TRANSACTION_START; },
/* harmony export */   TRANSACTION_TYPE_ORDER: function() { return /* binding */ TRANSACTION_TYPE_ORDER; },
/* harmony export */   TRUNCATED_TYPE: function() { return /* binding */ TRUNCATED_TYPE; },
/* harmony export */   TYPE_CUSTOM: function() { return /* binding */ TYPE_CUSTOM; },
/* harmony export */   USER_INTERACTION: function() { return /* binding */ USER_INTERACTION; },
/* harmony export */   USER_TIMING_THRESHOLD: function() { return /* binding */ USER_TIMING_THRESHOLD; },
/* harmony export */   XMLHTTPREQUEST: function() { return /* binding */ XMLHTTPREQUEST; }
/* harmony export */ });
var SCHEDULE = 'schedule';
var INVOKE = 'invoke';
var ADD_EVENT_LISTENER_STR = 'addEventListener';
var REMOVE_EVENT_LISTENER_STR = 'removeEventListener';
var RESOURCE_INITIATOR_TYPES = ['link', 'css', 'script', 'img', 'xmlhttprequest', 'fetch', 'beacon', 'iframe'];
var REUSABILITY_THRESHOLD = 5000;
var MAX_SPAN_DURATION = 5 * 60 * 1000;
var PAGE_LOAD_DELAY = 1000;
var PAGE_LOAD = 'page-load';
var ROUTE_CHANGE = 'route-change';
var TYPE_CUSTOM = 'custom';
var USER_INTERACTION = 'user-interaction';
var HTTP_REQUEST_TYPE = 'http-request';
var TEMPORARY_TYPE = 'temporary';
var NAME_UNKNOWN = 'Unknown';
var PAGE_EXIT = 'page-exit';
var TRANSACTION_TYPE_ORDER = [PAGE_LOAD, ROUTE_CHANGE, USER_INTERACTION, HTTP_REQUEST_TYPE, TYPE_CUSTOM, TEMPORARY_TYPE];
var OUTCOME_SUCCESS = 'success';
var OUTCOME_FAILURE = 'failure';
var OUTCOME_UNKNOWN = 'unknown';
var USER_TIMING_THRESHOLD = 60;
var TRANSACTION_START = 'transaction:start';
var TRANSACTION_END = 'transaction:end';
var CONFIG_CHANGE = 'config:change';
var QUEUE_FLUSH = 'queue:flush';
var QUEUE_ADD_TRANSACTION = 'queue:add_transaction';
var TRANSACTION_IGNORE = 'transaction:ignore';
var XMLHTTPREQUEST = 'xmlhttprequest';
var FETCH = 'fetch';
var HISTORY = 'history';
var EVENT_TARGET = 'eventtarget';
var CLICK = 'click';
var ERROR = 'error';
var BEFORE_EVENT = ':before';
var AFTER_EVENT = ':after';
var LOCAL_CONFIG_KEY = 'elastic_apm_config';
var LONG_TASK = 'longtask';
var PAINT = 'paint';
var MEASURE = 'measure';
var NAVIGATION = 'navigation';
var RESOURCE = 'resource';
var FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';
var LARGEST_CONTENTFUL_PAINT = 'largest-contentful-paint';
var FIRST_INPUT = 'first-input';
var LAYOUT_SHIFT = 'layout-shift';
var EVENT = 'event';
var ERRORS = 'errors';
var TRANSACTIONS = 'transactions';
var CONFIG_SERVICE = 'ConfigService';
var LOGGING_SERVICE = 'LoggingService';
var TRANSACTION_SERVICE = 'TransactionService';
var APM_SERVER = 'ApmServer';
var PERFORMANCE_MONITORING = 'PerformanceMonitoring';
var ERROR_LOGGING = 'ErrorLogging';
var TRUNCATED_TYPE = '.truncated';
var KEYWORD_LIMIT = 1024;
var SESSION_TIMEOUT = 30 * 60000;
var HTTP_REQUEST_TIMEOUT = 10000;


/***/ }),

/***/ "../rum-core/dist/es/common/context.js":
/*!*********************************************!*\
  !*** ../rum-core/dist/es/common/context.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addSpanContext: function() { return /* binding */ addSpanContext; },
/* harmony export */   addTransactionContext: function() { return /* binding */ addTransactionContext; },
/* harmony export */   getPageContext: function() { return /* binding */ getPageContext; }
/* harmony export */ });
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./url */ "../rum-core/dist/es/common/url.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");
var _excluded = ["tags"];

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}




var LEFT_SQUARE_BRACKET = 91;
var RIGHT_SQUARE_BRACKET = 93;
var EXTERNAL = 'external';
var RESOURCE = 'resource';
var HARD_NAVIGATION = 'hard-navigation';

function getPortNumber(port, protocol) {
  if (port === '') {
    port = protocol === 'http:' ? '80' : protocol === 'https:' ? '443' : '';
  }

  return port;
}

function getResponseContext(perfTimingEntry) {
  var transferSize = perfTimingEntry.transferSize,
      encodedBodySize = perfTimingEntry.encodedBodySize,
      decodedBodySize = perfTimingEntry.decodedBodySize,
      serverTiming = perfTimingEntry.serverTiming;
  var respContext = {
    transfer_size: transferSize,
    encoded_body_size: encodedBodySize,
    decoded_body_size: decodedBodySize
  };
  var serverTimingStr = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getServerTimingInfo)(serverTiming);

  if (serverTimingStr) {
    respContext.headers = {
      'server-timing': serverTimingStr
    };
  }

  return respContext;
}

function getDestination(parsedUrl) {
  var port = parsedUrl.port,
      protocol = parsedUrl.protocol,
      hostname = parsedUrl.hostname;
  var portNumber = getPortNumber(port, protocol);
  var ipv6Hostname = hostname.charCodeAt(0) === LEFT_SQUARE_BRACKET && hostname.charCodeAt(hostname.length - 1) === RIGHT_SQUARE_BRACKET;
  var address = hostname;

  if (ipv6Hostname) {
    address = hostname.slice(1, -1);
  }

  return {
    service: {
      resource: hostname + ':' + portNumber,
      name: '',
      type: ''
    },
    address: address,
    port: Number(portNumber)
  };
}

function getResourceContext(data) {
  var entry = data.entry,
      url = data.url;
  var parsedUrl = new _url__WEBPACK_IMPORTED_MODULE_1__.Url(url);
  var destination = getDestination(parsedUrl);
  return {
    http: {
      url: url,
      response: getResponseContext(entry)
    },
    destination: destination
  };
}

function getExternalContext(data) {
  var url = data.url,
      method = data.method,
      target = data.target,
      response = data.response;
  var parsedUrl = new _url__WEBPACK_IMPORTED_MODULE_1__.Url(url);
  var destination = getDestination(parsedUrl);
  var context = {
    http: {
      method: method,
      url: parsedUrl.href
    },
    destination: destination
  };
  var statusCode;

  if (target && typeof target.status !== 'undefined') {
    statusCode = target.status;
  } else if (response) {
    statusCode = response.status;
  }

  context.http.status_code = statusCode;
  return context;
}

function getNavigationContext(data) {
  var url = data.url;
  var parsedUrl = new _url__WEBPACK_IMPORTED_MODULE_1__.Url(url);
  var destination = getDestination(parsedUrl);
  return {
    destination: destination
  };
}

function getPageContext() {
  return {
    page: {
      referer: document.referrer,
      url: location.href
    }
  };
}
function addSpanContext(span, data) {
  if (!data) {
    return;
  }

  var type = span.type;
  var context;

  switch (type) {
    case EXTERNAL:
      context = getExternalContext(data);
      break;

    case RESOURCE:
      context = getResourceContext(data);
      break;

    case HARD_NAVIGATION:
      context = getNavigationContext(data);
      break;
  }

  span.addContext(context);
}
function addTransactionContext(transaction, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      tags = _ref.tags,
      configContext = _objectWithoutPropertiesLoose(_ref, _excluded);

  var pageContext = getPageContext();
  var responseContext = {};

  if (transaction.type === _constants__WEBPACK_IMPORTED_MODULE_2__.PAGE_EXIT) {
    transaction.ensureContext();

    if (transaction.context.page && transaction.context.page.url) {
      pageContext.page.url = transaction.context.page.url;
    }
  } else if (transaction.type === _constants__WEBPACK_IMPORTED_MODULE_2__.PAGE_LOAD && (0,_utils__WEBPACK_IMPORTED_MODULE_0__.isPerfTimelineSupported)()) {
    var entries = _utils__WEBPACK_IMPORTED_MODULE_0__.PERF.getEntriesByType(_constants__WEBPACK_IMPORTED_MODULE_2__.NAVIGATION);

    if (entries && entries.length > 0) {
      responseContext = {
        response: getResponseContext(entries[0])
      };
    }
  }

  transaction.addContext(pageContext, responseContext, configContext);
}

/***/ }),

/***/ "../rum-core/dist/es/common/event-handler.js":
/*!***************************************************!*\
  !*** ../rum-core/dist/es/common/event-handler.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");


var EventHandler = function () {
  function EventHandler() {
    this.observers = {};
  }

  var _proto = EventHandler.prototype;

  _proto.observe = function observe(name, fn) {
    var _this = this;

    if (typeof fn === 'function') {
      if (!this.observers[name]) {
        this.observers[name] = [];
      }

      this.observers[name].push(fn);
      return function () {
        var index = _this.observers[name].indexOf(fn);

        if (index > -1) {
          _this.observers[name].splice(index, 1);
        }
      };
    }
  };

  _proto.sendOnly = function sendOnly(name, args) {
    var obs = this.observers[name];

    if (obs) {
      obs.forEach(function (fn) {
        try {
          fn.apply(undefined, args);
        } catch (error) {
          console.log(error, error.stack);
        }
      });
    }
  };

  _proto.send = function send(name, args) {
    this.sendOnly(name + _constants__WEBPACK_IMPORTED_MODULE_0__.BEFORE_EVENT, args);
    this.sendOnly(name, args);
    this.sendOnly(name + _constants__WEBPACK_IMPORTED_MODULE_0__.AFTER_EVENT, args);
  };

  return EventHandler;
}();

/* harmony default export */ __webpack_exports__["default"] = (EventHandler);

/***/ }),

/***/ "../rum-core/dist/es/common/http/fetch.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/common/http/fetch.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BYTE_LIMIT: function() { return /* binding */ BYTE_LIMIT; },
/* harmony export */   isFetchSupported: function() { return /* binding */ isFetchSupported; },
/* harmony export */   sendFetchRequest: function() { return /* binding */ sendFetchRequest; },
/* harmony export */   shouldUseFetchWithKeepAlive: function() { return /* binding */ shouldUseFetchWithKeepAlive; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _response_status__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./response-status */ "../rum-core/dist/es/common/http/response-status.js");
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}



var BYTE_LIMIT = 60 * 1000;
function shouldUseFetchWithKeepAlive(method, payload) {
  if (!isFetchSupported()) {
    return false;
  }

  var isKeepAliveSupported = ('keepalive' in new Request(''));

  if (!isKeepAliveSupported) {
    return false;
  }

  var size = calculateSize(payload);
  return method === 'POST' && size < BYTE_LIMIT;
}
function sendFetchRequest(method, url, _ref) {
  var _ref$keepalive = _ref.keepalive,
      keepalive = _ref$keepalive === void 0 ? false : _ref$keepalive,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? _constants__WEBPACK_IMPORTED_MODULE_0__.HTTP_REQUEST_TIMEOUT : _ref$timeout,
      payload = _ref.payload,
      headers = _ref.headers,
      sendCredentials = _ref.sendCredentials;
  var timeoutConfig = {};

  if (typeof AbortController === 'function') {
    var controller = new AbortController();
    timeoutConfig.signal = controller.signal;
    setTimeout(function () {
      return controller.abort();
    }, timeout);
  }

  var fetchResponse;
  return window.fetch(url, _extends({
    body: payload,
    headers: headers,
    method: method,
    keepalive: keepalive,
    credentials: sendCredentials ? 'include' : 'omit'
  }, timeoutConfig)).then(function (response) {
    fetchResponse = response;
    return fetchResponse.text();
  }).then(function (responseText) {
    var bodyResponse = {
      url: url,
      status: fetchResponse.status,
      responseText: responseText
    };

    if (!(0,_response_status__WEBPACK_IMPORTED_MODULE_1__.isResponseSuccessful)(fetchResponse.status)) {
      throw bodyResponse;
    }

    return bodyResponse;
  });
}
function isFetchSupported() {
  return typeof window.fetch === 'function' && typeof window.Request === 'function';
}

function calculateSize(payload) {
  if (!payload) {
    return 0;
  }

  if (payload instanceof Blob) {
    return payload.size;
  }

  return new Blob([payload]).size;
}

/***/ }),

/***/ "../rum-core/dist/es/common/http/response-status.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/common/http/response-status.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isResponseSuccessful: function() { return /* binding */ isResponseSuccessful; }
/* harmony export */ });
function isResponseSuccessful(status) {
  if (status === 0 || status > 399 && status < 600) {
    return false;
  }

  return true;
}

/***/ }),

/***/ "../rum-core/dist/es/common/http/xhr.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/http/xhr.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sendXHR: function() { return /* binding */ sendXHR; }
/* harmony export */ });
/* harmony import */ var _patching_patch_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../patching/patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _response_status__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./response-status */ "../rum-core/dist/es/common/http/response-status.js");
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../polyfills */ "../rum-core/dist/es/common/polyfills.js");



function sendXHR(method, url, _ref) {
  var _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? HTTP_REQUEST_TIMEOUT : _ref$timeout,
      payload = _ref.payload,
      headers = _ref.headers,
      beforeSend = _ref.beforeSend,
      sendCredentials = _ref.sendCredentials;
  return new _polyfills__WEBPACK_IMPORTED_MODULE_0__.Promise(function (resolve, reject) {
    var xhr = new window.XMLHttpRequest();
    xhr[_patching_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_IGNORE] = true;
    xhr.open(method, url, true);
    xhr.timeout = timeout;
    xhr.withCredentials = sendCredentials;

    if (headers) {
      for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var status = xhr.status,
            responseText = xhr.responseText;

        if ((0,_response_status__WEBPACK_IMPORTED_MODULE_2__.isResponseSuccessful)(status)) {
          resolve(xhr);
        } else {
          reject({
            url: url,
            status: status,
            responseText: responseText
          });
        }
      }
    };

    xhr.onerror = function () {
      var status = xhr.status,
          responseText = xhr.responseText;
      reject({
        url: url,
        status: status,
        responseText: responseText
      });
    };

    var canSend = true;

    if (typeof beforeSend === 'function') {
      canSend = beforeSend({
        url: url,
        method: method,
        headers: headers,
        payload: payload,
        xhr: xhr
      });
    }

    if (canSend) {
      xhr.send(payload);
    } else {
      reject({
        url: url,
        status: 0,
        responseText: 'Request rejected by user configuration.'
      });
    }
  });
}

/***/ }),

/***/ "../rum-core/dist/es/common/instrument.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/common/instrument.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getInstrumentationFlags: function() { return /* binding */ getInstrumentationFlags; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");

function getInstrumentationFlags(instrument, disabledInstrumentations) {
  var _flags;

  var flags = (_flags = {}, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.ERROR] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.EVENT_TARGET] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.CLICK] = false, _flags);

  if (!instrument) {
    return flags;
  }

  Object.keys(flags).forEach(function (key) {
    if (disabledInstrumentations.indexOf(key) === -1) {
      flags[key] = true;
    }
  });
  return flags;
}

/***/ }),

/***/ "../rum-core/dist/es/common/logging-service.js":
/*!*****************************************************!*\
  !*** ../rum-core/dist/es/common/logging-service.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");


var LoggingService = function () {
  function LoggingService(spec) {
    if (spec === void 0) {
      spec = {};
    }

    this.levels = ['trace', 'debug', 'info', 'warn', 'error'];
    this.level = spec.level || 'warn';
    this.prefix = spec.prefix || '';
    this.resetLogMethods();
  }

  var _proto = LoggingService.prototype;

  _proto.shouldLog = function shouldLog(level) {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.level);
  };

  _proto.setLevel = function setLevel(level) {
    if (level === this.level) {
      return;
    }

    this.level = level;
    this.resetLogMethods();
  };

  _proto.resetLogMethods = function resetLogMethods() {
    var _this = this;

    this.levels.forEach(function (level) {
      _this[level] = _this.shouldLog(level) ? log : _utils__WEBPACK_IMPORTED_MODULE_0__.noop;

      function log() {
        var normalizedLevel = level;

        if (level === 'trace' || level === 'debug') {
          normalizedLevel = 'info';
        }

        var args = arguments;
        args[0] = this.prefix + args[0];

        if (console) {
          var realMethod = console[normalizedLevel] || console.log;

          if (typeof realMethod === 'function') {
            realMethod.apply(console, args);
          }
        }
      }
    });
  };

  return LoggingService;
}();

/* harmony default export */ __webpack_exports__["default"] = (LoggingService);

/***/ }),

/***/ "../rum-core/dist/es/common/ndjson.js":
/*!********************************************!*\
  !*** ../rum-core/dist/es/common/ndjson.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var NDJSON = function () {
  function NDJSON() {}

  NDJSON.stringify = function stringify(object) {
    return JSON.stringify(object) + '\n';
  };

  return NDJSON;
}();

/* harmony default export */ __webpack_exports__["default"] = (NDJSON);

/***/ }),

/***/ "../rum-core/dist/es/common/observers/page-clicks.js":
/*!***********************************************************!*\
  !*** ../rum-core/dist/es/common/observers/page-clicks.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   observePageClicks: function() { return /* binding */ observePageClicks; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");

var INTERACTIVE_SELECTOR = 'a[data-transaction-name], button[data-transaction-name]';
function observePageClicks(transactionService) {
  var clickHandler = function clickHandler(event) {
    if (event.target instanceof Element) {
      createUserInteractionTransaction(transactionService, event.target);
    }
  };

  var eventName = 'click';
  var useCapture = true;
  window.addEventListener(eventName, clickHandler, useCapture);
  return function () {
    window.removeEventListener(eventName, clickHandler, useCapture);
  };
}

function createUserInteractionTransaction(transactionService, target) {
  var _getTransactionMetada = getTransactionMetadata(target),
      transactionName = _getTransactionMetada.transactionName,
      context = _getTransactionMetada.context;

  var tr = transactionService.startTransaction("Click - " + transactionName, _constants__WEBPACK_IMPORTED_MODULE_0__.USER_INTERACTION, {
    managed: true,
    canReuse: true,
    reuseThreshold: 300
  });

  if (tr && context) {
    tr.addContext(context);
  }
}

function getTransactionMetadata(target) {
  var metadata = {
    transactionName: null,
    context: null
  };
  metadata.transactionName = buildTransactionName(target);
  var classes = target.getAttribute('class');

  if (classes) {
    metadata.context = {
      custom: {
        classes: classes
      }
    };
  }

  return metadata;
}

function buildTransactionName(target) {
  var dtName = findCustomTransactionName(target);

  if (dtName) {
    return dtName;
  }

  var tagName = target.tagName.toLowerCase();
  var name = target.getAttribute('name');

  if (!!name) {
    return tagName + "[\"" + name + "\"]";
  }

  return tagName;
}

function findCustomTransactionName(target) {
  if (target.closest) {
    var element = target.closest(INTERACTIVE_SELECTOR);
    return element ? element.dataset.transactionName : null;
  }

  return target.dataset.transactionName;
}

/***/ }),

/***/ "../rum-core/dist/es/common/observers/page-visibility.js":
/*!***************************************************************!*\
  !*** ../rum-core/dist/es/common/observers/page-visibility.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   observePageVisibility: function() { return /* binding */ observePageVisibility; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _performance_monitoring_metrics_inp_report__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../performance-monitoring/metrics/inp/report */ "../rum-core/dist/es/performance-monitoring/metrics/inp/report.js");




function observePageVisibility(configService, transactionService) {
  if (document.visibilityState === 'hidden') {
    _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = 0;
  }

  var visibilityChangeHandler = function visibilityChangeHandler() {
    if (document.visibilityState === 'hidden') {
      onPageHidden(configService, transactionService);
    }
  };

  var pageHideHandler = function pageHideHandler() {
    return onPageHidden(configService, transactionService);
  };

  var useCapture = true;
  window.addEventListener('visibilitychange', visibilityChangeHandler, useCapture);
  window.addEventListener('pagehide', pageHideHandler, useCapture);
  return function () {
    window.removeEventListener('visibilitychange', visibilityChangeHandler, useCapture);
    window.removeEventListener('pagehide', pageHideHandler, useCapture);
  };
}

function onPageHidden(configService, transactionService) {
  var inpTr = (0,_performance_monitoring_metrics_inp_report__WEBPACK_IMPORTED_MODULE_1__.reportInp)(transactionService);

  if (inpTr) {
    var unobserve = configService.observeEvent(_constants__WEBPACK_IMPORTED_MODULE_2__.QUEUE_ADD_TRANSACTION, function () {
      endManagedTransaction(configService, transactionService);
      unobserve();
    });
  } else {
    endManagedTransaction(configService, transactionService);
  }
}

function endManagedTransaction(configService, transactionService) {
  var tr = transactionService.getCurrentTransaction();

  if (tr) {
    var unobserveDiscard = configService.observeEvent(_constants__WEBPACK_IMPORTED_MODULE_2__.TRANSACTION_IGNORE, function () {
      _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.now)();
      unobserveDiscard();
      unobserveQueueAdd();
    });
    var unobserveQueueAdd = configService.observeEvent(_constants__WEBPACK_IMPORTED_MODULE_2__.QUEUE_ADD_TRANSACTION, function () {
      configService.dispatchEvent(_constants__WEBPACK_IMPORTED_MODULE_2__.QUEUE_FLUSH);
      _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.now)();
      unobserveQueueAdd();
      unobserveDiscard();
    });
    tr.end();
  } else {
    configService.dispatchEvent(_constants__WEBPACK_IMPORTED_MODULE_2__.QUEUE_FLUSH);
    _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.now)();
  }
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/fetch-patch.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/common/patching/fetch-patch.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   patchFetch: function() { return /* binding */ patchFetch; }
/* harmony export */ });
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _patch_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _http_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../http/fetch */ "../rum-core/dist/es/common/http/fetch.js");





function patchFetch(callback) {
  if (!(0,_http_fetch__WEBPACK_IMPORTED_MODULE_0__.isFetchSupported)()) {
    return;
  }

  function scheduleTask(task) {
    task.state = _constants__WEBPACK_IMPORTED_MODULE_1__.SCHEDULE;
    callback(_constants__WEBPACK_IMPORTED_MODULE_1__.SCHEDULE, task);
  }

  function invokeTask(task) {
    task.state = _constants__WEBPACK_IMPORTED_MODULE_1__.INVOKE;
    callback(_constants__WEBPACK_IMPORTED_MODULE_1__.INVOKE, task);
  }

  function handleResponseError(task, error) {
    task.data.aborted = isAbortError(error);
    task.data.error = error;
    invokeTask(task);
  }

  function readStream(stream, task) {
    var reader = stream.getReader();

    var read = function read() {
      reader.read().then(function (_ref) {
        var done = _ref.done;

        if (done) {
          invokeTask(task);
        } else {
          read();
        }
      }, function (error) {
        handleResponseError(task, error);
      });
    };

    read();
  }

  var nativeFetch = window.fetch;

  window.fetch = function (input, init) {
    var fetchSelf = this;
    var args = arguments;
    var request, url;
    var isURL = input instanceof URL;

    if (typeof input === 'string' || isURL) {
      request = new Request(input, init);

      if (isURL) {
        url = request.url;
      } else {
        url = input;
      }
    } else if (input) {
      request = input;
      url = request.url;
    } else {
      return nativeFetch.apply(fetchSelf, args);
    }

    var task = {
      source: _constants__WEBPACK_IMPORTED_MODULE_1__.FETCH,
      state: '',
      type: 'macroTask',
      data: {
        target: request,
        method: request.method,
        url: url,
        aborted: false
      }
    };
    return new _polyfills__WEBPACK_IMPORTED_MODULE_2__.Promise(function (resolve, reject) {
      _patch_utils__WEBPACK_IMPORTED_MODULE_3__.globalState.fetchInProgress = true;
      scheduleTask(task);
      var promise;

      try {
        promise = nativeFetch.apply(fetchSelf, [request]);
      } catch (error) {
        reject(error);
        task.data.error = error;
        invokeTask(task);
        _patch_utils__WEBPACK_IMPORTED_MODULE_3__.globalState.fetchInProgress = false;
        return;
      }

      promise.then(function (response) {
        var clonedResponse = response.clone ? response.clone() : {};
        resolve(response);
        (0,_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMicroTask)(function () {
          task.data.response = response;
          var body = clonedResponse.body;

          if (body) {
            readStream(body, task);
          } else {
            invokeTask(task);
          }
        });
      }, function (error) {
        reject(error);
        (0,_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMicroTask)(function () {
          handleResponseError(task, error);
        });
      });
      _patch_utils__WEBPACK_IMPORTED_MODULE_3__.globalState.fetchInProgress = false;
    });
  };
}

function isAbortError(error) {
  return error && error.name === 'AbortError';
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/history-patch.js":
/*!************************************************************!*\
  !*** ../rum-core/dist/es/common/patching/history-patch.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   patchHistory: function() { return /* binding */ patchHistory; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");

function patchHistory(callback) {
  if (!window.history) {
    return;
  }

  var nativePushState = history.pushState;

  if (typeof nativePushState === 'function') {
    history.pushState = function (state, title, url) {
      var task = {
        source: _constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY,
        data: {
          state: state,
          title: title,
          url: url
        }
      };
      callback(_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE, task);
      nativePushState.apply(this, arguments);
    };
  }
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/index.js":
/*!****************************************************!*\
  !*** ../rum-core/dist/es/common/patching/index.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   patchAll: function() { return /* binding */ patchAll; },
/* harmony export */   patchEventHandler: function() { return /* binding */ patchEventHandler; }
/* harmony export */ });
/* harmony import */ var _xhr_patch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./xhr-patch */ "../rum-core/dist/es/common/patching/xhr-patch.js");
/* harmony import */ var _fetch_patch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fetch-patch */ "../rum-core/dist/es/common/patching/fetch-patch.js");
/* harmony import */ var _history_patch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./history-patch */ "../rum-core/dist/es/common/patching/history-patch.js");
/* harmony import */ var _event_handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../event-handler */ "../rum-core/dist/es/common/event-handler.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");





var patchEventHandler = new _event_handler__WEBPACK_IMPORTED_MODULE_0__["default"]();
var alreadyPatched = false;

function patchAll() {
  if (!alreadyPatched) {
    alreadyPatched = true;
    (0,_xhr_patch__WEBPACK_IMPORTED_MODULE_1__.patchXMLHttpRequest)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.XMLHTTPREQUEST, [event, task]);
    });
    (0,_fetch_patch__WEBPACK_IMPORTED_MODULE_3__.patchFetch)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.FETCH, [event, task]);
    });
    (0,_history_patch__WEBPACK_IMPORTED_MODULE_4__.patchHistory)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.HISTORY, [event, task]);
    });
  }

  return patchEventHandler;
}



/***/ }),

/***/ "../rum-core/dist/es/common/patching/patch-utils.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/common/patching/patch-utils.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   XHR_IGNORE: function() { return /* binding */ XHR_IGNORE; },
/* harmony export */   XHR_METHOD: function() { return /* binding */ XHR_METHOD; },
/* harmony export */   XHR_SYNC: function() { return /* binding */ XHR_SYNC; },
/* harmony export */   XHR_URL: function() { return /* binding */ XHR_URL; },
/* harmony export */   apmSymbol: function() { return /* binding */ apmSymbol; },
/* harmony export */   globalState: function() { return /* binding */ globalState; },
/* harmony export */   patchMethod: function() { return /* binding */ patchMethod; }
/* harmony export */ });
var globalState = {
  fetchInProgress: false
};
function apmSymbol(name) {
  return '__apm_symbol__' + name;
}

function isPropertyWritable(propertyDesc) {
  if (!propertyDesc) {
    return true;
  }

  if (propertyDesc.writable === false) {
    return false;
  }

  return !(typeof propertyDesc.get === 'function' && typeof propertyDesc.set === 'undefined');
}

function attachOriginToPatched(patched, original) {
  patched[apmSymbol('OriginalDelegate')] = original;
}

function patchMethod(target, name, patchFn) {
  var proto = target;

  while (proto && !proto.hasOwnProperty(name)) {
    proto = Object.getPrototypeOf(proto);
  }

  if (!proto && target[name]) {
    proto = target;
  }

  var delegateName = apmSymbol(name);
  var delegate;

  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name];
    var desc = proto && Object.getOwnPropertyDescriptor(proto, name);

    if (isPropertyWritable(desc)) {
      var patchDelegate = patchFn(delegate, delegateName, name);

      proto[name] = function () {
        return patchDelegate(this, arguments);
      };

      attachOriginToPatched(proto[name], delegate);
    }
  }

  return delegate;
}
var XHR_IGNORE = apmSymbol('xhrIgnore');
var XHR_SYNC = apmSymbol('xhrSync');
var XHR_URL = apmSymbol('xhrURL');
var XHR_METHOD = apmSymbol('xhrMethod');

/***/ }),

/***/ "../rum-core/dist/es/common/patching/xhr-patch.js":
/*!********************************************************!*\
  !*** ../rum-core/dist/es/common/patching/xhr-patch.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   patchXMLHttpRequest: function() { return /* binding */ patchXMLHttpRequest; }
/* harmony export */ });
/* harmony import */ var _patch_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");


function patchXMLHttpRequest(callback) {
  var XMLHttpRequestPrototype = XMLHttpRequest.prototype;

  if (!XMLHttpRequestPrototype || !XMLHttpRequestPrototype[_constants__WEBPACK_IMPORTED_MODULE_0__.ADD_EVENT_LISTENER_STR]) {
    return;
  }

  var READY_STATE_CHANGE = 'readystatechange';
  var LOAD = 'load';
  var ERROR = 'error';
  var TIMEOUT = 'timeout';
  var ABORT = 'abort';

  function invokeTask(task, status) {
    if (task.state !== _constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE) {
      task.state = _constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE;
      task.data.status = status;
      callback(_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE, task);
    }
  }

  function scheduleTask(task) {
    if (task.state === _constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE) {
      return;
    }

    task.state = _constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE;
    callback(_constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE, task);
    var target = task.data.target;

    function addListener(name) {
      target[_constants__WEBPACK_IMPORTED_MODULE_0__.ADD_EVENT_LISTENER_STR](name, function (_ref) {
        var type = _ref.type;

        if (type === READY_STATE_CHANGE) {
          if (target.readyState === 4 && target.status !== 0) {
            invokeTask(task, 'success');
          }
        } else {
          var status = type === LOAD ? 'success' : type;
          invokeTask(task, status);
        }
      });
    }

    addListener(READY_STATE_CHANGE);
    addListener(LOAD);
    addListener(TIMEOUT);
    addListener(ERROR);
    addListener(ABORT);
  }

  var openNative = (0,_patch_utils__WEBPACK_IMPORTED_MODULE_1__.patchMethod)(XMLHttpRequestPrototype, 'open', function () {
    return function (self, args) {
      if (!self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_IGNORE]) {
        self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_METHOD] = args[0];
        self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_URL] = args[1];
        self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_SYNC] = args[2] === false;
      }

      return openNative.apply(self, args);
    };
  });
  var sendNative = (0,_patch_utils__WEBPACK_IMPORTED_MODULE_1__.patchMethod)(XMLHttpRequestPrototype, 'send', function () {
    return function (self, args) {
      if (self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_IGNORE]) {
        return sendNative.apply(self, args);
      }

      var task = {
        source: _constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST,
        state: '',
        type: 'macroTask',
        data: {
          target: self,
          method: self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_METHOD],
          sync: self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_SYNC],
          url: self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_URL],
          status: ''
        }
      };

      try {
        scheduleTask(task);
        return sendNative.apply(self, args);
      } catch (e) {
        invokeTask(task, ERROR);
        throw e;
      }
    };
  });
}

/***/ }),

/***/ "../rum-core/dist/es/common/polyfills.js":
/*!***********************************************!*\
  !*** ../rum-core/dist/es/common/polyfills.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Promise: function() { return /* binding */ Promise; }
/* harmony export */ });
/* harmony import */ var promise_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! promise-polyfill */ "../../node_modules/promise-polyfill/src/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");


var local = {};

if (_utils__WEBPACK_IMPORTED_MODULE_1__.isBrowser) {
  local = window;
} else if (typeof self !== 'undefined') {
  local = self;
}

var Promise = 'Promise' in local ? local.Promise : promise_polyfill__WEBPACK_IMPORTED_MODULE_0__["default"];


/***/ }),

/***/ "../rum-core/dist/es/common/queue.js":
/*!*******************************************!*\
  !*** ../rum-core/dist/es/common/queue.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var Queue = function () {
  function Queue(onFlush, opts) {
    if (opts === void 0) {
      opts = {};
    }

    this.onFlush = onFlush;
    this.items = [];
    this.queueLimit = opts.queueLimit || -1;
    this.flushInterval = opts.flushInterval || 0;
    this.timeoutId = undefined;
  }

  var _proto = Queue.prototype;

  _proto._setTimer = function _setTimer() {
    var _this = this;

    this.timeoutId = setTimeout(function () {
      return _this.flush();
    }, this.flushInterval);
  };

  _proto._clear = function _clear() {
    if (typeof this.timeoutId !== 'undefined') {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.items = [];
  };

  _proto.flush = function flush() {
    this.onFlush(this.items);

    this._clear();
  };

  _proto.add = function add(item) {
    this.items.push(item);

    if (this.queueLimit !== -1 && this.items.length >= this.queueLimit) {
      this.flush();
    } else {
      if (typeof this.timeoutId === 'undefined') {
        this._setTimer();
      }
    }
  };

  return Queue;
}();

/* harmony default export */ __webpack_exports__["default"] = (Queue);

/***/ }),

/***/ "../rum-core/dist/es/common/service-factory.js":
/*!*****************************************************!*\
  !*** ../rum-core/dist/es/common/service-factory.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ServiceFactory: function() { return /* binding */ ServiceFactory; },
/* harmony export */   serviceCreators: function() { return /* binding */ serviceCreators; }
/* harmony export */ });
/* harmony import */ var _apm_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./apm-server */ "../rum-core/dist/es/common/apm-server.js");
/* harmony import */ var _config_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config-service */ "../rum-core/dist/es/common/config-service.js");
/* harmony import */ var _logging_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logging-service */ "../rum-core/dist/es/common/logging-service.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
var _serviceCreators;






var serviceCreators = (_serviceCreators = {}, _serviceCreators[_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE] = function () {
  return new _config_service__WEBPACK_IMPORTED_MODULE_1__["default"]();
}, _serviceCreators[_constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE] = function () {
  return new _logging_service__WEBPACK_IMPORTED_MODULE_2__["default"]({
    prefix: '[Elastic APM] '
  });
}, _serviceCreators[_constants__WEBPACK_IMPORTED_MODULE_0__.APM_SERVER] = function (factory) {
  var _factory$getService = factory.getService([_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE, _constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE]),
      configService = _factory$getService[0],
      loggingService = _factory$getService[1];

  return new _apm_server__WEBPACK_IMPORTED_MODULE_3__["default"](configService, loggingService);
}, _serviceCreators);

var ServiceFactory = function () {
  function ServiceFactory() {
    this.instances = {};
    this.initialized = false;
  }

  var _proto = ServiceFactory.prototype;

  _proto.init = function init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    var configService = this.getService(_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.init();

    var _this$getService = this.getService([_constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE, _constants__WEBPACK_IMPORTED_MODULE_0__.APM_SERVER]),
        loggingService = _this$getService[0],
        apmServer = _this$getService[1];

    configService.events.observe(_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_CHANGE, function () {
      var logLevel = configService.get('logLevel');
      loggingService.setLevel(logLevel);
    });
    apmServer.init();
  };

  _proto.getService = function getService(name) {
    var _this = this;

    if (typeof name === 'string') {
      if (!this.instances[name]) {
        if (typeof serviceCreators[name] === 'function') {
          this.instances[name] = serviceCreators[name](this);
        } else if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
          console.log('Cannot get service, No creator for: ' + name);
        }
      }

      return this.instances[name];
    } else if (Array.isArray(name)) {
      return name.map(function (n) {
        return _this.getService(n);
      });
    }
  };

  return ServiceFactory;
}();



/***/ }),

/***/ "../rum-core/dist/es/common/throttle.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/throttle.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ throttle; }
/* harmony export */ });
function throttle(fn, onThrottle, opts) {
  var context = this;
  var limit = opts.limit;
  var interval = opts.interval;
  var counter = 0;
  var timeoutId;
  return function () {
    counter++;

    if (typeof timeoutId === 'undefined') {
      timeoutId = setTimeout(function () {
        counter = 0;
        timeoutId = undefined;
      }, interval);
    }

    if (counter > limit && typeof onThrottle === 'function') {
      return onThrottle.apply(context, arguments);
    } else {
      return fn.apply(context, arguments);
    }
  };
}

/***/ }),

/***/ "../rum-core/dist/es/common/truncate.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/truncate.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ERROR_MODEL: function() { return /* binding */ ERROR_MODEL; },
/* harmony export */   METADATA_MODEL: function() { return /* binding */ METADATA_MODEL; },
/* harmony export */   RESPONSE_MODEL: function() { return /* binding */ RESPONSE_MODEL; },
/* harmony export */   SPAN_MODEL: function() { return /* binding */ SPAN_MODEL; },
/* harmony export */   TRANSACTION_MODEL: function() { return /* binding */ TRANSACTION_MODEL; },
/* harmony export */   truncate: function() { return /* binding */ truncate; },
/* harmony export */   truncateModel: function() { return /* binding */ truncateModel; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");

var METADATA_MODEL = {
  service: {
    name: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
    version: true,
    agent: {
      version: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true]
    },
    environment: true
  },
  labels: {
    '*': true
  }
};
var RESPONSE_MODEL = {
  '*': true,
  headers: {
    '*': true
  }
};
var DESTINATION_MODEL = {
  address: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT],
  service: {
    '*': [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true]
  }
};
var CONTEXT_MODEL = {
  user: {
    id: true,
    email: true,
    username: true
  },
  tags: {
    '*': true
  },
  http: {
    response: RESPONSE_MODEL
  },
  destination: DESTINATION_MODEL,
  response: RESPONSE_MODEL
};
var SPAN_MODEL = {
  name: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  type: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  trace_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  parent_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  transaction_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  subtype: true,
  action: true,
  context: CONTEXT_MODEL
};
var TRANSACTION_MODEL = {
  name: true,
  parent_id: true,
  type: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  trace_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  span_count: {
    started: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true]
  },
  context: CONTEXT_MODEL
};
var ERROR_MODEL = {
  id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  trace_id: true,
  transaction_id: true,
  parent_id: true,
  culprit: true,
  exception: {
    type: true
  },
  transaction: {
    type: true
  },
  context: CONTEXT_MODEL
};

function truncate(value, limit, required, placeholder) {
  if (limit === void 0) {
    limit = _constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT;
  }

  if (required === void 0) {
    required = false;
  }

  if (placeholder === void 0) {
    placeholder = 'N/A';
  }

  if (required && isEmpty(value)) {
    value = placeholder;
  }

  if (typeof value === 'string') {
    return value.substring(0, limit);
  }

  return value;
}

function isEmpty(value) {
  return value == null || value === '' || typeof value === 'undefined';
}

function replaceValue(target, key, currModel) {
  var value = truncate(target[key], currModel[0], currModel[1]);

  if (isEmpty(value)) {
    delete target[key];
    return;
  }

  target[key] = value;
}

function truncateModel(model, target, childTarget) {
  if (model === void 0) {
    model = {};
  }

  if (childTarget === void 0) {
    childTarget = target;
  }

  var keys = Object.keys(model);
  var emptyArr = [];

  var _loop = function _loop(i) {
    var currKey = keys[i];
    var currModel = model[currKey] === true ? emptyArr : model[currKey];

    if (!Array.isArray(currModel)) {
      truncateModel(currModel, target, childTarget[currKey]);
    } else {
      if (currKey === '*') {
        Object.keys(childTarget).forEach(function (key) {
          return replaceValue(childTarget, key, currModel);
        });
      } else {
        replaceValue(childTarget, currKey, currModel);
      }
    }
  };

  for (var i = 0; i < keys.length; i++) {
    _loop(i);
  }

  return target;
}



/***/ }),

/***/ "../rum-core/dist/es/common/url.js":
/*!*****************************************!*\
  !*** ../rum-core/dist/es/common/url.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Url: function() { return /* binding */ Url; },
/* harmony export */   slugifyUrl: function() { return /* binding */ slugifyUrl; }
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");


function isDefaultPort(port, protocol) {
  switch (protocol) {
    case 'http:':
      return port === '80';

    case 'https:':
      return port === '443';
  }

  return true;
}

var RULES = [['#', 'hash'], ['?', 'query'], ['/', 'path'], ['@', 'auth', 1], [NaN, 'host', undefined, 1]];
var PROTOCOL_REGEX = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
var Url = function () {
  function Url(url) {
    var _this$extractProtocol = this.extractProtocol(url || ''),
        protocol = _this$extractProtocol.protocol,
        address = _this$extractProtocol.address,
        slashes = _this$extractProtocol.slashes;

    var relative = !protocol && !slashes;
    var location = this.getLocation();
    var instructions = RULES.slice();
    address = address.replace('\\', '/');

    if (!slashes) {
      instructions[2] = [NaN, 'path'];
    }

    var index;

    for (var i = 0; i < instructions.length; i++) {
      var instruction = instructions[i];
      var parse = instruction[0];
      var key = instruction[1];

      if (typeof parse === 'string') {
        index = address.indexOf(parse);

        if (~index) {
          var instLength = instruction[2];

          if (instLength) {
            var newIndex = address.lastIndexOf(parse);
            index = Math.max(index, newIndex);
            this[key] = address.slice(0, index);
            address = address.slice(index + instLength);
          } else {
            this[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else {
        this[key] = address;
        address = '';
      }

      this[key] = this[key] || (relative && instruction[3] ? location[key] || '' : '');
      if (instruction[3]) this[key] = this[key].toLowerCase();
    }

    if (relative && this.path.charAt(0) !== '/') {
      this.path = '/' + this.path;
    }

    this.relative = relative;
    this.protocol = protocol || location.protocol;
    this.hostname = this.host;
    this.port = '';

    if (/:\d+$/.test(this.host)) {
      var value = this.host.split(':');
      var port = value.pop();
      var hostname = value.join(':');

      if (isDefaultPort(port, this.protocol)) {
        this.host = hostname;
      } else {
        this.port = port;
      }

      this.hostname = hostname;
    }

    this.origin = this.protocol && this.host && this.protocol !== 'file:' ? this.protocol + '//' + this.host : 'null';
    this.href = this.toString();
  }

  var _proto = Url.prototype;

  _proto.toString = function toString() {
    var result = this.protocol;
    result += '//';

    if (this.auth) {
      var REDACTED = '[REDACTED]';
      var userpass = this.auth.split(':');
      var username = userpass[0] ? REDACTED : '';
      var password = userpass[1] ? ':' + REDACTED : '';
      result += username + password + '@';
    }

    result += this.host;
    result += this.path;
    result += this.query;
    result += this.hash;
    return result;
  };

  _proto.getLocation = function getLocation() {
    var globalVar = {};

    if (_utils__WEBPACK_IMPORTED_MODULE_0__.isBrowser) {
      globalVar = window;
    }

    return globalVar.location;
  };

  _proto.extractProtocol = function extractProtocol(url) {
    var match = PROTOCOL_REGEX.exec(url);
    return {
      protocol: match[1] ? match[1].toLowerCase() : '',
      slashes: !!match[2],
      address: match[3]
    };
  };

  return Url;
}();
function slugifyUrl(urlStr, depth) {
  if (depth === void 0) {
    depth = 2;
  }

  var parsedUrl = new Url(urlStr);
  var query = parsedUrl.query,
      path = parsedUrl.path;
  var pathParts = path.substring(1).split('/');
  var redactString = ':id';
  var wildcard = '*';
  var specialCharsRegex = /\W|_/g;
  var digitsRegex = /[0-9]/g;
  var lowerCaseRegex = /[a-z]/g;
  var upperCaseRegex = /[A-Z]/g;
  var redactedParts = [];
  var redactedBefore = false;

  for (var index = 0; index < pathParts.length; index++) {
    var part = pathParts[index];

    if (redactedBefore || index > depth - 1) {
      if (part) {
        redactedParts.push(wildcard);
      }

      break;
    }

    var numberOfSpecialChars = (part.match(specialCharsRegex) || []).length;

    if (numberOfSpecialChars >= 2) {
      redactedParts.push(redactString);
      redactedBefore = true;
      continue;
    }

    var numberOfDigits = (part.match(digitsRegex) || []).length;

    if (numberOfDigits > 3 || part.length > 3 && numberOfDigits / part.length >= 0.3) {
      redactedParts.push(redactString);
      redactedBefore = true;
      continue;
    }

    var numberofUpperCase = (part.match(upperCaseRegex) || []).length;
    var numberofLowerCase = (part.match(lowerCaseRegex) || []).length;
    var lowerCaseRate = numberofLowerCase / part.length;
    var upperCaseRate = numberofUpperCase / part.length;

    if (part.length > 5 && (upperCaseRate > 0.3 && upperCaseRate < 0.6 || lowerCaseRate > 0.3 && lowerCaseRate < 0.6)) {
      redactedParts.push(redactString);
      redactedBefore = true;
      continue;
    }

    part && redactedParts.push(part);
  }

  var redacted = '/' + (redactedParts.length >= 2 ? redactedParts.join('/') : redactedParts.join('')) + (query ? '?{query}' : '');
  return redacted;
}

/***/ }),

/***/ "../rum-core/dist/es/common/utils.js":
/*!*******************************************!*\
  !*** ../rum-core/dist/es/common/utils.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PERF: function() { return /* binding */ PERF; },
/* harmony export */   baseExtend: function() { return /* binding */ baseExtend; },
/* harmony export */   bytesToHex: function() { return /* binding */ bytesToHex; },
/* harmony export */   checkSameOrigin: function() { return /* binding */ checkSameOrigin; },
/* harmony export */   extend: function() { return /* binding */ extend; },
/* harmony export */   find: function() { return /* binding */ find; },
/* harmony export */   generateRandomId: function() { return /* binding */ generateRandomId; },
/* harmony export */   getCurrentScript: function() { return /* binding */ getCurrentScript; },
/* harmony export */   getDtHeaderValue: function() { return /* binding */ getDtHeaderValue; },
/* harmony export */   getDuration: function() { return /* binding */ getDuration; },
/* harmony export */   getEarliestSpan: function() { return /* binding */ getEarliestSpan; },
/* harmony export */   getElasticScript: function() { return /* binding */ getElasticScript; },
/* harmony export */   getLatestNonXHRSpan: function() { return /* binding */ getLatestNonXHRSpan; },
/* harmony export */   getLatestXHRSpan: function() { return /* binding */ getLatestXHRSpan; },
/* harmony export */   getServerTimingInfo: function() { return /* binding */ getServerTimingInfo; },
/* harmony export */   getTSHeaderValue: function() { return /* binding */ getTSHeaderValue; },
/* harmony export */   getTime: function() { return /* binding */ getTime; },
/* harmony export */   getTimeOrigin: function() { return /* binding */ getTimeOrigin; },
/* harmony export */   isBeaconInspectionEnabled: function() { return /* binding */ isBeaconInspectionEnabled; },
/* harmony export */   isBrowser: function() { return /* binding */ isBrowser; },
/* harmony export */   isCORSSupported: function() { return /* binding */ isCORSSupported; },
/* harmony export */   isDtHeaderValid: function() { return /* binding */ isDtHeaderValid; },
/* harmony export */   isFunction: function() { return /* binding */ isFunction; },
/* harmony export */   isObject: function() { return /* binding */ isObject; },
/* harmony export */   isPerfInteractionCountSupported: function() { return /* binding */ isPerfInteractionCountSupported; },
/* harmony export */   isPerfTimelineSupported: function() { return /* binding */ isPerfTimelineSupported; },
/* harmony export */   isPerfTypeSupported: function() { return /* binding */ isPerfTypeSupported; },
/* harmony export */   isPlatformSupported: function() { return /* binding */ isPlatformSupported; },
/* harmony export */   isRedirectInfoAvailable: function() { return /* binding */ isRedirectInfoAvailable; },
/* harmony export */   isUndefined: function() { return /* binding */ isUndefined; },
/* harmony export */   merge: function() { return /* binding */ merge; },
/* harmony export */   noop: function() { return /* binding */ noop; },
/* harmony export */   now: function() { return /* binding */ now; },
/* harmony export */   parseDtHeaderValue: function() { return /* binding */ parseDtHeaderValue; },
/* harmony export */   removeInvalidChars: function() { return /* binding */ removeInvalidChars; },
/* harmony export */   rng: function() { return /* binding */ rng; },
/* harmony export */   scheduleMacroTask: function() { return /* binding */ scheduleMacroTask; },
/* harmony export */   scheduleMicroTask: function() { return /* binding */ scheduleMicroTask; },
/* harmony export */   setLabel: function() { return /* binding */ setLabel; },
/* harmony export */   setRequestHeader: function() { return /* binding */ setRequestHeader; },
/* harmony export */   stripQueryStringFromUrl: function() { return /* binding */ stripQueryStringFromUrl; }
/* harmony export */ });
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills */ "../rum-core/dist/es/common/polyfills.js");

var slice = [].slice;
var isBrowser = typeof window !== 'undefined';
var PERF = isBrowser && typeof performance !== 'undefined' ? performance : {};

function isCORSSupported() {
  var xhr = new window.XMLHttpRequest();
  return 'withCredentials' in xhr;
}

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToHex(buffer) {
  var hexOctets = [];

  for (var _i = 0; _i < buffer.length; _i++) {
    hexOctets.push(byteToHex[buffer[_i]]);
  }

  return hexOctets.join('');
}

var destination = new Uint8Array(16);

function rng() {
  if (typeof crypto != 'undefined' && typeof crypto.getRandomValues == 'function') {
    return crypto.getRandomValues(destination);
  } else if (typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function') {
    return msCrypto.getRandomValues(destination);
  }

  return destination;
}

function generateRandomId(length) {
  var id = bytesToHex(rng());
  return id.substr(0, length);
}

function getDtHeaderValue(span) {
  var dtVersion = '00';
  var dtUnSampledFlags = '00';
  var dtSampledFlags = '01';

  if (span && span.traceId && span.id && span.parentId) {
    var flags = span.sampled ? dtSampledFlags : dtUnSampledFlags;
    var id = span.sampled ? span.id : span.parentId;
    return dtVersion + '-' + span.traceId + '-' + id + '-' + flags;
  }
}

function parseDtHeaderValue(value) {
  var parsed = /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/.exec(value);

  if (parsed) {
    var flags = parsed[4];
    var sampled = flags !== '00';
    return {
      traceId: parsed[2],
      id: parsed[3],
      sampled: sampled
    };
  }
}

function isDtHeaderValid(header) {
  return /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header) && header.slice(3, 35) !== '00000000000000000000000000000000' && header.slice(36, 52) !== '0000000000000000';
}

function getTSHeaderValue(_ref) {
  var sampleRate = _ref.sampleRate;

  if (typeof sampleRate !== 'number' || String(sampleRate).length > 256) {
    return;
  }

  var NAMESPACE = 'es';
  var SEPARATOR = '=';
  return "" + NAMESPACE + SEPARATOR + "s:" + sampleRate;
}

function setRequestHeader(target, name, value) {
  if (typeof target.setRequestHeader === 'function') {
    target.setRequestHeader(name, value);
  } else if (target.headers && typeof target.headers.append === 'function') {
    target.headers.append(name, value);
  } else {
    target[name] = value;
  }
}

function checkSameOrigin(source, target) {
  var isSame = false;

  if (typeof target === 'string') {
    isSame = source === target;
  } else if (target && typeof target.test === 'function') {
    isSame = target.test(source);
  } else if (Array.isArray(target)) {
    target.forEach(function (t) {
      if (!isSame) {
        isSame = checkSameOrigin(source, t);
      }
    });
  }

  return isSame;
}

function isPlatformSupported() {
  return isBrowser && typeof Set === 'function' && typeof JSON.stringify === 'function' && PERF && typeof PERF.now === 'function' && isCORSSupported();
}

function setLabel(key, value, obj) {
  if (!obj || !key) return;
  var skey = removeInvalidChars(key);
  var valueType = typeof value;

  if (value != undefined && valueType !== 'boolean' && valueType !== 'number') {
    value = String(value);
  }

  obj[skey] = value;
  return obj;
}

function getServerTimingInfo(serverTimingEntries) {
  if (serverTimingEntries === void 0) {
    serverTimingEntries = [];
  }

  var serverTimingInfo = [];
  var entrySeparator = ', ';
  var valueSeparator = ';';

  for (var _i2 = 0; _i2 < serverTimingEntries.length; _i2++) {
    var _serverTimingEntries$ = serverTimingEntries[_i2],
        name = _serverTimingEntries$.name,
        duration = _serverTimingEntries$.duration,
        description = _serverTimingEntries$.description;
    var timingValue = name;

    if (description) {
      timingValue += valueSeparator + 'desc=' + description;
    }

    if (duration) {
      timingValue += valueSeparator + 'dur=' + duration;
    }

    serverTimingInfo.push(timingValue);
  }

  return serverTimingInfo.join(entrySeparator);
}

function getTimeOrigin() {
  return PERF.timing.fetchStart;
}

function stripQueryStringFromUrl(url) {
  return url && url.split('?')[0];
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isFunction(value) {
  return typeof value === 'function';
}

function baseExtend(dst, objs, deep) {
  for (var i = 0, ii = objs.length; i < ii; ++i) {
    var obj = objs[i];
    if (!isObject(obj) && !isFunction(obj)) continue;
    var keys = Object.keys(obj);

    for (var j = 0, jj = keys.length; j < jj; j++) {
      var key = keys[j];
      var src = obj[key];

      if (deep && isObject(src)) {
        if (!isObject(dst[key])) dst[key] = Array.isArray(src) ? [] : {};
        baseExtend(dst[key], [src], false);
      } else {
        dst[key] = src;
      }
    }
  }

  return dst;
}

function getElasticScript() {
  if (typeof document !== 'undefined') {
    var scripts = document.getElementsByTagName('script');

    for (var i = 0, l = scripts.length; i < l; i++) {
      var sc = scripts[i];

      if (sc.src.indexOf('elastic') > 0) {
        return sc;
      }
    }
  }
}

function getCurrentScript() {
  if (typeof document !== 'undefined') {
    var currentScript = document.currentScript;

    if (!currentScript) {
      return getElasticScript();
    }

    return currentScript;
  }
}

function extend(dst) {
  return baseExtend(dst, slice.call(arguments, 1), false);
}

function merge(dst) {
  return baseExtend(dst, slice.call(arguments, 1), true);
}

function isUndefined(obj) {
  return typeof obj === 'undefined';
}

function noop() {}

function find(array, predicate, thisArg) {
  if (array == null) {
    throw new TypeError('array is null or not defined');
  }

  var o = Object(array);
  var len = o.length >>> 0;

  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }

  var k = 0;

  while (k < len) {
    var kValue = o[k];

    if (predicate.call(thisArg, kValue, k, o)) {
      return kValue;
    }

    k++;
  }

  return undefined;
}

function removeInvalidChars(key) {
  return key.replace(/[.*"]/g, '_');
}

function getLatestSpan(spans, typeFilter) {
  var latestSpan = null;

  for (var _i3 = 0; _i3 < spans.length; _i3++) {
    var span = spans[_i3];

    if (typeFilter && typeFilter(span.type) && (!latestSpan || latestSpan._end < span._end)) {
      latestSpan = span;
    }
  }

  return latestSpan;
}

function getLatestNonXHRSpan(spans) {
  return getLatestSpan(spans, function (type) {
    return String(type).indexOf('external') === -1;
  });
}

function getLatestXHRSpan(spans) {
  return getLatestSpan(spans, function (type) {
    return String(type).indexOf('external') !== -1;
  });
}

function getEarliestSpan(spans) {
  var earliestSpan = spans[0];

  for (var _i4 = 1; _i4 < spans.length; _i4++) {
    var span = spans[_i4];

    if (earliestSpan._start > span._start) {
      earliestSpan = span;
    }
  }

  return earliestSpan;
}

function now() {
  return PERF.now();
}

function getTime(time) {
  return typeof time === 'number' && time >= 0 ? time : now();
}

function getDuration(start, end) {
  if (isUndefined(end) || isUndefined(start)) {
    return null;
  }

  return parseInt(end - start);
}

function scheduleMacroTask(callback) {
  setTimeout(callback, 0);
}

function scheduleMicroTask(callback) {
  _polyfills__WEBPACK_IMPORTED_MODULE_0__.Promise.resolve().then(callback);
}

function isPerfTimelineSupported() {
  return typeof PERF.getEntriesByType === 'function';
}

function isPerfTypeSupported(type) {
  return typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.indexOf(type) >= 0;
}

function isPerfInteractionCountSupported() {
  return 'interactionCount' in performance;
}

function isBeaconInspectionEnabled() {
  var flagName = '_elastic_inspect_beacon_';

  if (sessionStorage.getItem(flagName) != null) {
    return true;
  }

  if (!window.URL || !window.URLSearchParams) {
    return false;
  }

  try {
    var parsedUrl = new URL(window.location.href);
    var isFlagSet = parsedUrl.searchParams.has(flagName);

    if (isFlagSet) {
      sessionStorage.setItem(flagName, true);
    }

    return isFlagSet;
  } catch (e) {}

  return false;
}

function isRedirectInfoAvailable(timing) {
  return timing.redirectStart > 0;
}



/***/ }),

/***/ "../rum-core/dist/es/error-logging/error-logging.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/error-logging/error-logging.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _stack_trace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stack-trace */ "../rum-core/dist/es/error-logging/stack-trace.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/context */ "../rum-core/dist/es/common/context.js");
/* harmony import */ var _common_truncate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/truncate */ "../rum-core/dist/es/common/truncate.js");
/* harmony import */ var error_stack_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! error-stack-parser */ "../../node_modules/error-stack-parser/error-stack-parser.js");
/* harmony import */ var error_stack_parser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(error_stack_parser__WEBPACK_IMPORTED_MODULE_0__);
var _excluded = ["tags"];

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}






var IGNORE_KEYS = ['stack', 'message'];
var PROMISE_REJECTION_PREFIX = 'Unhandled promise rejection: ';

function getErrorProperties(error) {
  var propertyFound = false;
  var properties = {};
  Object.keys(error).forEach(function (key) {
    if (IGNORE_KEYS.indexOf(key) >= 0) {
      return;
    }

    var val = error[key];

    if (val == null || typeof val === 'function') {
      return;
    }

    if (typeof val === 'object') {
      if (typeof val.toISOString !== 'function') return;
      val = val.toISOString();
    }

    properties[key] = val;
    propertyFound = true;
  });

  if (propertyFound) {
    return properties;
  }
}

var ErrorLogging = function () {
  function ErrorLogging(apmServer, configService, transactionService) {
    this._apmServer = apmServer;
    this._configService = configService;
    this._transactionService = transactionService;
  }

  var _proto = ErrorLogging.prototype;

  _proto.createErrorDataModel = function createErrorDataModel(errorEvent) {
    var frames = (0,_stack_trace__WEBPACK_IMPORTED_MODULE_1__.createStackTraces)((error_stack_parser__WEBPACK_IMPORTED_MODULE_0___default()), errorEvent);
    var filteredFrames = (0,_stack_trace__WEBPACK_IMPORTED_MODULE_1__.filterInvalidFrames)(frames);
    var culprit = '(inline script)';
    var lastFrame = filteredFrames[filteredFrames.length - 1];

    if (lastFrame && lastFrame.filename) {
      culprit = lastFrame.filename;
    }

    var message = errorEvent.message,
        error = errorEvent.error;
    var errorMessage = message;
    var errorType = '';
    var errorContext = {};

    if (error && typeof error === 'object') {
      errorMessage = errorMessage || error.message;
      errorType = error.name;
      var customProperties = getErrorProperties(error);

      if (customProperties) {
        errorContext.custom = customProperties;
      }
    }

    if (!errorType) {
      if (errorMessage && errorMessage.indexOf(':') > -1) {
        errorType = errorMessage.split(':')[0];
      }
    }

    var currentTransaction = this._transactionService.getCurrentTransaction();

    var transactionContext = currentTransaction ? currentTransaction.context : {};

    var _this$_configService$ = this._configService.get('context'),
        tags = _this$_configService$.tags,
        configContext = _objectWithoutPropertiesLoose(_this$_configService$, _excluded);

    var pageContext = (0,_common_context__WEBPACK_IMPORTED_MODULE_2__.getPageContext)();
    var context = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.merge)({}, pageContext, transactionContext, configContext, errorContext);
    var errorObject = {
      id: (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.generateRandomId)(),
      culprit: culprit,
      exception: {
        message: errorMessage,
        stacktrace: filteredFrames,
        type: errorType
      },
      context: context
    };

    if (currentTransaction) {
      errorObject = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.extend)(errorObject, {
        trace_id: currentTransaction.traceId,
        parent_id: currentTransaction.id,
        transaction_id: currentTransaction.id,
        transaction: {
          type: currentTransaction.type,
          sampled: currentTransaction.sampled
        }
      });
    }

    return (0,_common_truncate__WEBPACK_IMPORTED_MODULE_4__.truncateModel)(_common_truncate__WEBPACK_IMPORTED_MODULE_4__.ERROR_MODEL, errorObject);
  };

  _proto.logErrorEvent = function logErrorEvent(errorEvent) {
    if (typeof errorEvent === 'undefined') {
      return;
    }

    var errorObject = this.createErrorDataModel(errorEvent);

    if (typeof errorObject.exception.message === 'undefined') {
      return;
    }

    this._apmServer.addError(errorObject);
  };

  _proto.registerListeners = function registerListeners() {
    var _this = this;

    window.addEventListener('error', function (errorEvent) {
      return _this.logErrorEvent(errorEvent);
    });
    window.addEventListener('unhandledrejection', function (promiseRejectionEvent) {
      return _this.logPromiseEvent(promiseRejectionEvent);
    });
  };

  _proto.logPromiseEvent = function logPromiseEvent(promiseRejectionEvent) {
    var reason = promiseRejectionEvent.reason;

    if (reason == null) {
      reason = '<no reason specified>';
    }

    var errorEvent;

    if (typeof reason.message === 'string') {
      var name = reason.name ? reason.name + ': ' : '';
      errorEvent = {
        error: reason,
        message: PROMISE_REJECTION_PREFIX + name + reason.message
      };
    } else {
      errorEvent = this._parseRejectReason(reason);
    }

    this.logErrorEvent(errorEvent);
  };

  _proto.logError = function logError(messageOrError) {
    var errorEvent = {};

    if (typeof messageOrError === 'string') {
      errorEvent.message = messageOrError;
    } else {
      errorEvent.error = messageOrError;
    }

    return this.logErrorEvent(errorEvent);
  };

  _proto._parseRejectReason = function _parseRejectReason(reason) {
    var errorEvent = {
      message: PROMISE_REJECTION_PREFIX
    };

    if (Array.isArray(reason)) {
      errorEvent.message += '<object>';
    } else if (typeof reason === 'object') {
      try {
        errorEvent.message += JSON.stringify(reason);
        errorEvent.error = reason;
      } catch (error) {
        errorEvent.message += '<object>';
      }
    } else if (typeof reason === 'function') {
      errorEvent.message += '<function>';
    } else {
      errorEvent.message += reason;
    }

    return errorEvent;
  };

  return ErrorLogging;
}();

/* harmony default export */ __webpack_exports__["default"] = (ErrorLogging);

/***/ }),

/***/ "../rum-core/dist/es/error-logging/index.js":
/*!**************************************************!*\
  !*** ../rum-core/dist/es/error-logging/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerServices: function() { return /* binding */ registerServices; }
/* harmony export */ });
/* harmony import */ var _error_logging__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./error-logging */ "../rum-core/dist/es/error-logging/error-logging.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_service_factory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/service-factory */ "../rum-core/dist/es/common/service-factory.js");




function registerServices() {
  _common_service_factory__WEBPACK_IMPORTED_MODULE_0__.serviceCreators[_common_constants__WEBPACK_IMPORTED_MODULE_1__.ERROR_LOGGING] = function (serviceFactory) {
    var _serviceFactory$getSe = serviceFactory.getService([_common_constants__WEBPACK_IMPORTED_MODULE_1__.APM_SERVER, _common_constants__WEBPACK_IMPORTED_MODULE_1__.CONFIG_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_SERVICE]),
        apmServer = _serviceFactory$getSe[0],
        configService = _serviceFactory$getSe[1],
        transactionService = _serviceFactory$getSe[2];

    return new _error_logging__WEBPACK_IMPORTED_MODULE_2__["default"](apmServer, configService, transactionService);
  };
}



/***/ }),

/***/ "../rum-core/dist/es/error-logging/stack-trace.js":
/*!********************************************************!*\
  !*** ../rum-core/dist/es/error-logging/stack-trace.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createStackTraces: function() { return /* binding */ createStackTraces; },
/* harmony export */   filterInvalidFrames: function() { return /* binding */ filterInvalidFrames; }
/* harmony export */ });
function filePathToFileName(fileUrl) {
  var origin = window.location.origin || window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

  if (fileUrl.indexOf(origin) > -1) {
    fileUrl = fileUrl.replace(origin + '/', '');
  }

  return fileUrl;
}

function cleanFilePath(filePath) {
  if (filePath === void 0) {
    filePath = '';
  }

  if (filePath === '<anonymous>') {
    filePath = '';
  }

  return filePath;
}

function isFileInline(fileUrl) {
  if (fileUrl) {
    return window.location.href.indexOf(fileUrl) === 0;
  }

  return false;
}

function normalizeStackFrames(stackFrames) {
  return stackFrames.map(function (frame) {
    if (frame.functionName) {
      frame.functionName = normalizeFunctionName(frame.functionName);
    }

    return frame;
  });
}

function normalizeFunctionName(fnName) {
  var parts = fnName.split('/');

  if (parts.length > 1) {
    fnName = ['Object', parts[parts.length - 1]].join('.');
  } else {
    fnName = parts[0];
  }

  fnName = fnName.replace(/.<$/gi, '.<anonymous>');
  fnName = fnName.replace(/^Anonymous function$/, '<anonymous>');
  parts = fnName.split('.');

  if (parts.length > 1) {
    fnName = parts[parts.length - 1];
  } else {
    fnName = parts[0];
  }

  return fnName;
}

function isValidStackTrace(stackTraces) {
  if (stackTraces.length === 0) {
    return false;
  }

  if (stackTraces.length === 1) {
    var stackTrace = stackTraces[0];
    return 'lineNumber' in stackTrace;
  }

  return true;
}

function createStackTraces(stackParser, errorEvent) {
  var error = errorEvent.error,
      filename = errorEvent.filename,
      lineno = errorEvent.lineno,
      colno = errorEvent.colno;
  var stackTraces = [];

  if (error) {
    try {
      stackTraces = stackParser.parse(error);
    } catch (e) {}
  }

  if (!isValidStackTrace(stackTraces)) {
    stackTraces = [{
      fileName: filename,
      lineNumber: lineno,
      columnNumber: colno
    }];
  }

  var normalizedStackTraces = normalizeStackFrames(stackTraces);
  return normalizedStackTraces.map(function (stack) {
    var fileName = stack.fileName,
        lineNumber = stack.lineNumber,
        columnNumber = stack.columnNumber,
        _stack$functionName = stack.functionName,
        functionName = _stack$functionName === void 0 ? '<anonymous>' : _stack$functionName;

    if (!fileName && !lineNumber) {
      return {};
    }

    if (!columnNumber && !lineNumber) {
      return {};
    }

    var filePath = cleanFilePath(fileName);
    var cleanedFileName = filePathToFileName(filePath);

    if (isFileInline(filePath)) {
      cleanedFileName = '(inline script)';
    }

    return {
      abs_path: fileName,
      filename: cleanedFileName,
      function: functionName,
      lineno: lineNumber,
      colno: columnNumber
    };
  });
}
function filterInvalidFrames(frames) {
  return frames.filter(function (_ref) {
    var filename = _ref.filename,
        lineno = _ref.lineno;
    return typeof filename !== 'undefined' && typeof lineno !== 'undefined';
  });
}

/***/ }),

/***/ "../rum-core/dist/es/index.js":
/*!************************************!*\
  !*** ../rum-core/dist/es/index.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APM_SERVER: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.APM_SERVER; },
/* harmony export */   CLICK: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.CLICK; },
/* harmony export */   CONFIG_SERVICE: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.CONFIG_SERVICE; },
/* harmony export */   ERROR: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.ERROR; },
/* harmony export */   ERROR_LOGGING: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.ERROR_LOGGING; },
/* harmony export */   EVENT_TARGET: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.EVENT_TARGET; },
/* harmony export */   LOGGING_SERVICE: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.LOGGING_SERVICE; },
/* harmony export */   PAGE_LOAD: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.PAGE_LOAD; },
/* harmony export */   PAGE_LOAD_DELAY: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.PAGE_LOAD_DELAY; },
/* harmony export */   PERFORMANCE_MONITORING: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.PERFORMANCE_MONITORING; },
/* harmony export */   ServiceFactory: function() { return /* reexport safe */ _common_service_factory__WEBPACK_IMPORTED_MODULE_2__.ServiceFactory; },
/* harmony export */   TRANSACTION_SERVICE: function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.TRANSACTION_SERVICE; },
/* harmony export */   afterFrame: function() { return /* reexport safe */ _common_after_frame__WEBPACK_IMPORTED_MODULE_7__["default"]; },
/* harmony export */   bootstrap: function() { return /* reexport safe */ _bootstrap__WEBPACK_IMPORTED_MODULE_10__.bootstrap; },
/* harmony export */   createServiceFactory: function() { return /* binding */ createServiceFactory; },
/* harmony export */   createTracer: function() { return /* reexport safe */ _opentracing__WEBPACK_IMPORTED_MODULE_6__.createTracer; },
/* harmony export */   getInstrumentationFlags: function() { return /* reexport safe */ _common_instrument__WEBPACK_IMPORTED_MODULE_5__.getInstrumentationFlags; },
/* harmony export */   isBrowser: function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.isBrowser; },
/* harmony export */   isPlatformSupported: function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.isPlatformSupported; },
/* harmony export */   observePageClicks: function() { return /* reexport safe */ _common_observers__WEBPACK_IMPORTED_MODULE_12__.observePageClicks; },
/* harmony export */   observePageVisibility: function() { return /* reexport safe */ _common_observers__WEBPACK_IMPORTED_MODULE_11__.observePageVisibility; },
/* harmony export */   observeUserInteractions: function() { return /* reexport safe */ _performance_monitoring__WEBPACK_IMPORTED_MODULE_9__.observeUserInteractions; },
/* harmony export */   patchAll: function() { return /* reexport safe */ _common_patching__WEBPACK_IMPORTED_MODULE_3__.patchAll; },
/* harmony export */   patchEventHandler: function() { return /* reexport safe */ _common_patching__WEBPACK_IMPORTED_MODULE_3__.patchEventHandler; },
/* harmony export */   scheduleMacroTask: function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMacroTask; },
/* harmony export */   scheduleMicroTask: function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMicroTask; }
/* harmony export */ });
/* harmony import */ var _error_logging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error-logging */ "../rum-core/dist/es/error-logging/index.js");
/* harmony import */ var _performance_monitoring__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./performance-monitoring */ "../rum-core/dist/es/performance-monitoring/index.js");
/* harmony import */ var _performance_monitoring__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./performance-monitoring */ "../rum-core/dist/es/performance-monitoring/metrics/inp/process.js");
/* harmony import */ var _common_service_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/service-factory */ "../rum-core/dist/es/common/service-factory.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_patching__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/patching */ "../rum-core/dist/es/common/patching/index.js");
/* harmony import */ var _common_observers__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./common/observers */ "../rum-core/dist/es/common/observers/page-visibility.js");
/* harmony import */ var _common_observers__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./common/observers */ "../rum-core/dist/es/common/observers/page-clicks.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_instrument__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./common/instrument */ "../rum-core/dist/es/common/instrument.js");
/* harmony import */ var _common_after_frame__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./common/after-frame */ "../rum-core/dist/es/common/after-frame.js");
/* harmony import */ var _bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./bootstrap */ "../rum-core/dist/es/bootstrap.js");
/* harmony import */ var _opentracing__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./opentracing */ "../rum-core/dist/es/opentracing/index.js");












function createServiceFactory() {
  (0,_performance_monitoring__WEBPACK_IMPORTED_MODULE_0__.registerServices)();
  (0,_error_logging__WEBPACK_IMPORTED_MODULE_1__.registerServices)();
  var serviceFactory = new _common_service_factory__WEBPACK_IMPORTED_MODULE_2__.ServiceFactory();
  return serviceFactory;
}



/***/ }),

/***/ "../rum-core/dist/es/opentracing/index.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/opentracing/index.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Span: function() { return /* reexport safe */ _span__WEBPACK_IMPORTED_MODULE_2__["default"]; },
/* harmony export */   Tracer: function() { return /* reexport safe */ _tracer__WEBPACK_IMPORTED_MODULE_1__["default"]; },
/* harmony export */   createTracer: function() { return /* binding */ createTracer; }
/* harmony export */ });
/* harmony import */ var _tracer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tracer */ "../rum-core/dist/es/opentracing/tracer.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/opentracing/span.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");




function createTracer(serviceFactory) {
  var performanceMonitoring = serviceFactory.getService(_common_constants__WEBPACK_IMPORTED_MODULE_0__.PERFORMANCE_MONITORING);
  var transactionService = serviceFactory.getService(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
  var errorLogging = serviceFactory.getService(_common_constants__WEBPACK_IMPORTED_MODULE_0__.ERROR_LOGGING);
  var loggingService = serviceFactory.getService(_common_constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE);
  return new _tracer__WEBPACK_IMPORTED_MODULE_1__["default"](performanceMonitoring, transactionService, loggingService, errorLogging);
}



/***/ }),

/***/ "../rum-core/dist/es/opentracing/span.js":
/*!***********************************************!*\
  !*** ../rum-core/dist/es/opentracing/span.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var opentracing_lib_span__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! opentracing/lib/span */ "../../node_modules/opentracing/lib/span.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _performance_monitoring_transaction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../performance-monitoring/transaction */ "../rum-core/dist/es/performance-monitoring/transaction.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}





var Span = function (_otSpan) {
  _inheritsLoose(Span, _otSpan);

  function Span(tracer, span) {
    var _this;

    _this = _otSpan.call(this) || this;
    _this.__tracer = tracer;
    _this.span = span;
    _this.isTransaction = span instanceof _performance_monitoring_transaction__WEBPACK_IMPORTED_MODULE_1__["default"];
    _this.spanContext = {
      id: span.id,
      traceId: span.traceId,
      sampled: span.sampled
    };
    return _this;
  }

  var _proto = Span.prototype;

  _proto._context = function _context() {
    return this.spanContext;
  };

  _proto._tracer = function _tracer() {
    return this.__tracer;
  };

  _proto._setOperationName = function _setOperationName(name) {
    this.span.name = name;
  };

  _proto._addTags = function _addTags(keyValuePairs) {
    var tags = (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.extend)({}, keyValuePairs);

    if (tags.type) {
      this.span.type = tags.type;
      delete tags.type;
    }

    if (this.isTransaction) {
      var userId = tags['user.id'];
      var username = tags['user.username'];
      var email = tags['user.email'];

      if (userId || username || email) {
        this.span.addContext({
          user: {
            id: userId,
            username: username,
            email: email
          }
        });
        delete tags['user.id'];
        delete tags['user.username'];
        delete tags['user.email'];
      }
    }

    this.span.addLabels(tags);
  };

  _proto._log = function _log(log, timestamp) {
    if (log.event === 'error') {
      if (log['error.object']) {
        this.__tracer.errorLogging.logError(log['error.object']);
      } else if (log.message) {
        this.__tracer.errorLogging.logError(log.message);
      }
    }
  };

  _proto._finish = function _finish(finishTime) {
    this.span.end();

    if (finishTime) {
      this.span._end = finishTime - (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.getTimeOrigin)();
    }
  };

  return Span;
}(opentracing_lib_span__WEBPACK_IMPORTED_MODULE_0__.Span);

/* harmony default export */ __webpack_exports__["default"] = (Span);

/***/ }),

/***/ "../rum-core/dist/es/opentracing/tracer.js":
/*!*************************************************!*\
  !*** ../rum-core/dist/es/opentracing/tracer.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var opentracing_lib_tracer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! opentracing/lib/tracer */ "../../node_modules/opentracing/lib/tracer.js");
/* harmony import */ var opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! opentracing/lib/constants */ "../../node_modules/opentracing/lib/constants.js");
/* harmony import */ var opentracing_lib_span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! opentracing/lib/span */ "../../node_modules/opentracing/lib/span.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/opentracing/span.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}








var Tracer = function (_otTracer) {
  _inheritsLoose(Tracer, _otTracer);

  function Tracer(performanceMonitoring, transactionService, loggingService, errorLogging) {
    var _this;

    _this = _otTracer.call(this) || this;
    _this.performanceMonitoring = performanceMonitoring;
    _this.transactionService = transactionService;
    _this.loggingService = loggingService;
    _this.errorLogging = errorLogging;
    return _this;
  }

  var _proto = Tracer.prototype;

  _proto._startSpan = function _startSpan(name, options) {
    var spanOptions = {
      managed: true
    };

    if (options) {
      spanOptions.timestamp = options.startTime;

      if (options.childOf) {
        spanOptions.parentId = options.childOf.id;
      } else if (options.references && options.references.length > 0) {
        if (options.references.length > 1) {
          if (_state__WEBPACK_IMPORTED_MODULE_3__.__DEV__) {
            this.loggingService.debug('Elastic APM OpenTracing: Unsupported number of references, only the first childOf reference will be recorded.');
          }
        }

        var childRef = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.find)(options.references, function (ref) {
          return ref.type() === opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.REFERENCE_CHILD_OF;
        });

        if (childRef) {
          spanOptions.parentId = childRef.referencedContext().id;
        }
      }
    }

    var span;
    var currentTransaction = this.transactionService.getCurrentTransaction();

    if (currentTransaction) {
      span = this.transactionService.startSpan(name, undefined, spanOptions);
    } else {
      span = this.transactionService.startTransaction(name, undefined, spanOptions);
    }

    if (!span) {
      return new opentracing_lib_span__WEBPACK_IMPORTED_MODULE_2__.Span();
    }

    if (spanOptions.timestamp) {
      span._start = spanOptions.timestamp - (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.getTimeOrigin)();
    }

    var otSpan = new _span__WEBPACK_IMPORTED_MODULE_5__["default"](this, span);

    if (options && options.tags) {
      otSpan.addTags(options.tags);
    }

    return otSpan;
  };

  _proto._inject = function _inject(spanContext, format, carrier) {
    switch (format) {
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_TEXT_MAP:
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_HTTP_HEADERS:
        this.performanceMonitoring.injectDtHeader(spanContext, carrier);
        break;

      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_BINARY:
        if (_state__WEBPACK_IMPORTED_MODULE_3__.__DEV__) {
          this.loggingService.debug('Elastic APM OpenTracing: binary carrier format is not supported.');
        }

        break;
    }
  };

  _proto._extract = function _extract(format, carrier) {
    var ctx;

    switch (format) {
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_TEXT_MAP:
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_HTTP_HEADERS:
        ctx = this.performanceMonitoring.extractDtHeader(carrier);
        break;

      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_BINARY:
        if (_state__WEBPACK_IMPORTED_MODULE_3__.__DEV__) {
          this.loggingService.debug('Elastic APM OpenTracing: binary carrier format is not supported.');
        }

        break;
    }

    if (!ctx) {
      ctx = null;
    }

    return ctx;
  };

  return Tracer;
}(opentracing_lib_tracer__WEBPACK_IMPORTED_MODULE_0__.Tracer);

/* harmony default export */ __webpack_exports__["default"] = (Tracer);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/breakdown.js":
/*!***************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/breakdown.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   captureBreakdown: function() { return /* binding */ captureBreakdown; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");


var pageLoadBreakdowns = [['domainLookupStart', 'domainLookupEnd', 'DNS'], ['connectStart', 'connectEnd', 'TCP'], ['requestStart', 'responseStart', 'Request'], ['responseStart', 'responseEnd', 'Response'], ['domLoading', 'domComplete', 'Processing'], ['loadEventStart', 'loadEventEnd', 'Load']];

function getValue(value) {
  return {
    value: value
  };
}

function calculateSelfTime(transaction) {
  var spans = transaction.spans,
      _start = transaction._start,
      _end = transaction._end;

  if (spans.length === 0) {
    return transaction.duration();
  }

  spans.sort(function (span1, span2) {
    return span1._start - span2._start;
  });
  var span = spans[0];
  var spanEnd = span._end;
  var spanStart = span._start;
  var lastContinuousEnd = spanEnd;
  var selfTime = spanStart - _start;

  for (var i = 1; i < spans.length; i++) {
    span = spans[i];
    spanStart = span._start;
    spanEnd = span._end;

    if (spanStart > lastContinuousEnd) {
      selfTime += spanStart - lastContinuousEnd;
      lastContinuousEnd = spanEnd;
    } else if (spanEnd > lastContinuousEnd) {
      lastContinuousEnd = spanEnd;
    }
  }

  if (lastContinuousEnd < _end) {
    selfTime += _end - lastContinuousEnd;
  }

  return selfTime;
}

function groupSpans(transaction) {
  var spanMap = {};
  var transactionSelfTime = calculateSelfTime(transaction);
  spanMap['app'] = {
    count: 1,
    duration: transactionSelfTime
  };
  var spans = transaction.spans;

  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];
    var duration = span.duration();

    if (duration === 0 || duration == null) {
      continue;
    }

    var type = span.type,
        subtype = span.subtype;
    var key = type.replace(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRUNCATED_TYPE, '');

    if (subtype) {
      key += '.' + subtype;
    }

    if (!spanMap[key]) {
      spanMap[key] = {
        duration: 0,
        count: 0
      };
    }

    spanMap[key].count++;
    spanMap[key].duration += duration;
  }

  return spanMap;
}

function getSpanBreakdown(transactionDetails, _ref) {
  var details = _ref.details,
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 1 : _ref$count,
      duration = _ref.duration;
  return {
    transaction: transactionDetails,
    span: details,
    samples: {
      'span.self_time.count': getValue(count),
      'span.self_time.sum.us': getValue(duration * 1000)
    }
  };
}

function captureBreakdown(transaction, timings) {
  if (timings === void 0) {
    timings = _common_utils__WEBPACK_IMPORTED_MODULE_1__.PERF.timing;
  }

  var breakdowns = [];
  var name = transaction.name,
      type = transaction.type,
      sampled = transaction.sampled;
  var transactionDetails = {
    name: name,
    type: type
  };

  if (!sampled) {
    return breakdowns;
  }

  if (type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD && timings) {
    for (var i = 0; i < pageLoadBreakdowns.length; i++) {
      var current = pageLoadBreakdowns[i];
      var start = timings[current[0]];
      var end = timings[current[1]];
      var duration = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getDuration)(start, end);

      if (duration === 0 || duration == null) {
        continue;
      }

      breakdowns.push(getSpanBreakdown(transactionDetails, {
        details: {
          type: current[2]
        },
        duration: duration
      }));
    }
  } else {
    var spanMap = groupSpans(transaction);
    Object.keys(spanMap).forEach(function (key) {
      var _key$split = key.split('.'),
          type = _key$split[0],
          subtype = _key$split[1];

      var _spanMap$key = spanMap[key],
          duration = _spanMap$key.duration,
          count = _spanMap$key.count;
      breakdowns.push(getSpanBreakdown(transactionDetails, {
        details: {
          type: type,
          subtype: subtype
        },
        duration: duration,
        count: count
      }));
    });
  }

  return breakdowns;
}

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/index.js":
/*!***********************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/index.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   observeUserInteractions: function() { return /* reexport safe */ _metrics_inp_process__WEBPACK_IMPORTED_MODULE_4__.observeUserInteractions; },
/* harmony export */   registerServices: function() { return /* binding */ registerServices; },
/* harmony export */   reportInp: function() { return /* reexport safe */ _metrics_inp_report__WEBPACK_IMPORTED_MODULE_5__.reportInp; }
/* harmony export */ });
/* harmony import */ var _performance_monitoring__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./performance-monitoring */ "../rum-core/dist/es/performance-monitoring/performance-monitoring.js");
/* harmony import */ var _transaction_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transaction-service */ "../rum-core/dist/es/performance-monitoring/transaction-service.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_service_factory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/service-factory */ "../rum-core/dist/es/common/service-factory.js");
/* harmony import */ var _metrics_inp_process__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./metrics/inp/process */ "../rum-core/dist/es/performance-monitoring/metrics/inp/process.js");
/* harmony import */ var _metrics_inp_report__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./metrics/inp/report */ "../rum-core/dist/es/performance-monitoring/metrics/inp/report.js");







function registerServices() {
  _common_service_factory__WEBPACK_IMPORTED_MODULE_0__.serviceCreators[_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_SERVICE] = function (serviceFactory) {
    var _serviceFactory$getSe = serviceFactory.getService([_common_constants__WEBPACK_IMPORTED_MODULE_1__.LOGGING_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.CONFIG_SERVICE]),
        loggingService = _serviceFactory$getSe[0],
        configService = _serviceFactory$getSe[1];

    return new _transaction_service__WEBPACK_IMPORTED_MODULE_2__["default"](loggingService, configService);
  };

  _common_service_factory__WEBPACK_IMPORTED_MODULE_0__.serviceCreators[_common_constants__WEBPACK_IMPORTED_MODULE_1__.PERFORMANCE_MONITORING] = function (serviceFactory) {
    var _serviceFactory$getSe2 = serviceFactory.getService([_common_constants__WEBPACK_IMPORTED_MODULE_1__.APM_SERVER, _common_constants__WEBPACK_IMPORTED_MODULE_1__.CONFIG_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.LOGGING_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_SERVICE]),
        apmServer = _serviceFactory$getSe2[0],
        configService = _serviceFactory$getSe2[1],
        loggingService = _serviceFactory$getSe2[2],
        transactionService = _serviceFactory$getSe2[3];

    return new _performance_monitoring__WEBPACK_IMPORTED_MODULE_3__["default"](apmServer, configService, loggingService, transactionService);
  };
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/metrics/inp/process.js":
/*!*************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/metrics/inp/process.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calculateInp: function() { return /* binding */ calculateInp; },
/* harmony export */   inpState: function() { return /* binding */ inpState; },
/* harmony export */   interactionCount: function() { return /* binding */ interactionCount; },
/* harmony export */   observeUserInteractions: function() { return /* binding */ observeUserInteractions; },
/* harmony export */   processUserInteractions: function() { return /* binding */ processUserInteractions; },
/* harmony export */   restoreINPState: function() { return /* binding */ restoreINPState; }
/* harmony export */ });
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _metrics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../metrics */ "../rum-core/dist/es/performance-monitoring/metrics/metrics.js");



var INP_THRESHOLD = 40;
var MAX_INTERACTIONS_TO_CONSIDER = 10;
var inpState = {
  minInteractionId: Infinity,
  maxInteractionId: 0,
  interactionCount: 0,
  longestInteractions: []
};
function observeUserInteractions(recorder) {
  if (recorder === void 0) {
    recorder = new _metrics__WEBPACK_IMPORTED_MODULE_0__.PerfEntryRecorder(processUserInteractions);
  }

  var isPerfCountSupported = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.isPerfInteractionCountSupported)();
  var durationThreshold = isPerfCountSupported ? INP_THRESHOLD : 16;
  recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_2__.EVENT, {
    buffered: true,
    durationThreshold: durationThreshold
  });

  if (!isPerfCountSupported) {
    recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_2__.FIRST_INPUT);
  }
}
function processUserInteractions(list) {
  var entries = list.getEntries();
  entries.forEach(function (entry) {
    if (!entry.interactionId) {
      return;
    }

    updateInteractionCount(entry);

    if (entry.duration < INP_THRESHOLD) {
      return;
    }

    storeUserInteraction(entry);
  });
}
function calculateInp() {
  if (inpState.longestInteractions.length === 0) {
    if (interactionCount() > 0) {
      return 0;
    }

    return;
  }

  var interactionIndex = Math.min(inpState.longestInteractions.length - 1, Math.floor(interactionCount() / 50));
  var inp = inpState.longestInteractions[interactionIndex].duration;
  return inp;
}
function interactionCount() {
  return performance.interactionCount || inpState.interactionCount;
}
function restoreINPState() {
  inpState.minInteractionId = Infinity;
  inpState.maxInteractionId = 0;
  inpState.interactionCount = 0;
  inpState.longestInteractions = [];
}

function storeUserInteraction(entry) {
  var leastSlow = inpState.longestInteractions[inpState.longestInteractions.length - 1];

  if (typeof leastSlow !== 'undefined' && entry.duration <= leastSlow.duration && entry.interactionId != leastSlow.id) {
    return;
  }

  var filteredInteraction = inpState.longestInteractions.filter(function (interaction) {
    return interaction.id === entry.interactionId;
  });

  if (filteredInteraction.length > 0) {
    var foundInteraction = filteredInteraction[0];
    foundInteraction.duration = Math.max(foundInteraction.duration, entry.duration);
  } else {
    inpState.longestInteractions.push({
      id: entry.interactionId,
      duration: entry.duration
    });
  }

  inpState.longestInteractions.sort(function (a, b) {
    return b.duration - a.duration;
  });
  inpState.longestInteractions.splice(MAX_INTERACTIONS_TO_CONSIDER);
}

function updateInteractionCount(entry) {
  if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.isPerfInteractionCountSupported)()) {
    return;
  }

  inpState.minInteractionId = Math.min(inpState.minInteractionId, entry.interactionId);
  inpState.maxInteractionId = Math.max(inpState.maxInteractionId, entry.interactionId);
  inpState.interactionCount = (inpState.maxInteractionId - inpState.minInteractionId) / 7 + 1;
}

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/metrics/inp/report.js":
/*!************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/metrics/inp/report.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   reportInp: function() { return /* binding */ reportInp; }
/* harmony export */ });
/* harmony import */ var _process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./process */ "../rum-core/dist/es/performance-monitoring/metrics/inp/process.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../common/constants */ "../rum-core/dist/es/common/constants.js");



function reportInp(transactionService) {
  var inp = (0,_process__WEBPACK_IMPORTED_MODULE_0__.calculateInp)();

  if (inp >= 0) {
    var startTime = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.now)();
    var inpTr = transactionService.startTransaction(_common_constants__WEBPACK_IMPORTED_MODULE_2__.PAGE_EXIT, _common_constants__WEBPACK_IMPORTED_MODULE_2__.PAGE_EXIT, {
      startTime: startTime
    });
    var navigations = performance.getEntriesByType('navigation');

    if (navigations.length > 0) {
      var hardNavigationUrl = navigations[0].name;
      inpTr.addContext({
        page: {
          url: hardNavigationUrl
        }
      });
    }

    inpTr.addLabels({
      inp_value: inp
    });
    var endTime = startTime + inp + 1;
    inpTr.end(endTime);
    (0,_process__WEBPACK_IMPORTED_MODULE_0__.restoreINPState)();
    return inpTr;
  }
}

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/metrics/metrics.js":
/*!*********************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/metrics/metrics.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PerfEntryRecorder: function() { return /* binding */ PerfEntryRecorder; },
/* harmony export */   calculateCumulativeLayoutShift: function() { return /* binding */ calculateCumulativeLayoutShift; },
/* harmony export */   calculateTotalBlockingTime: function() { return /* binding */ calculateTotalBlockingTime; },
/* harmony export */   captureObserverEntries: function() { return /* binding */ captureObserverEntries; },
/* harmony export */   createFirstInputDelaySpan: function() { return /* binding */ createFirstInputDelaySpan; },
/* harmony export */   createLongTaskSpans: function() { return /* binding */ createLongTaskSpans; },
/* harmony export */   createTotalBlockingTimeSpan: function() { return /* binding */ createTotalBlockingTimeSpan; },
/* harmony export */   metrics: function() { return /* binding */ metrics; }
/* harmony export */ });
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../span */ "../rum-core/dist/es/performance-monitoring/span.js");
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}




var metrics = {
  fid: 0,
  fcp: 0,
  tbt: {
    start: Infinity,
    duration: 0
  },
  cls: {
    score: 0,
    firstEntryTime: Number.NEGATIVE_INFINITY,
    prevEntryTime: Number.NEGATIVE_INFINITY,
    currentSessionScore: 0
  },
  longtask: {
    count: 0,
    duration: 0,
    max: 0
  }
};
var LONG_TASK_THRESHOLD = 50;
function createLongTaskSpans(longtasks, agg) {
  var spans = [];

  for (var i = 0; i < longtasks.length; i++) {
    var _longtasks$i = longtasks[i],
        name = _longtasks$i.name,
        startTime = _longtasks$i.startTime,
        duration = _longtasks$i.duration,
        attribution = _longtasks$i.attribution;
    var end = startTime + duration;
    var span = new _span__WEBPACK_IMPORTED_MODULE_0__["default"]("Longtask(" + name + ")", _common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK, {
      startTime: startTime
    });
    agg.count++;
    agg.duration += duration;
    agg.max = Math.max(duration, agg.max);

    if (attribution.length > 0) {
      var _attribution$ = attribution[0],
          _name = _attribution$.name,
          containerType = _attribution$.containerType,
          containerName = _attribution$.containerName,
          containerId = _attribution$.containerId;
      var customContext = {
        attribution: _name,
        type: containerType
      };

      if (containerName) {
        customContext.name = containerName;
      }

      if (containerId) {
        customContext.id = containerId;
      }

      span.addContext({
        custom: customContext
      });
    }

    span.end(end);
    spans.push(span);
  }

  return spans;
}
function createFirstInputDelaySpan(fidEntries) {
  var firstInput = fidEntries[0];

  if (firstInput) {
    var startTime = firstInput.startTime,
        processingStart = firstInput.processingStart;
    var span = new _span__WEBPACK_IMPORTED_MODULE_0__["default"]('First Input Delay', _common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_INPUT, {
      startTime: startTime
    });
    span.end(processingStart);
    return span;
  }
}
function createTotalBlockingTimeSpan(tbtObject) {
  var start = tbtObject.start,
      duration = tbtObject.duration;
  var tbtSpan = new _span__WEBPACK_IMPORTED_MODULE_0__["default"]('Total Blocking Time', _common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK, {
    startTime: start
  });
  tbtSpan.end(start + duration);
  return tbtSpan;
}
function calculateTotalBlockingTime(longtaskEntries) {
  longtaskEntries.forEach(function (entry) {
    var name = entry.name,
        startTime = entry.startTime,
        duration = entry.duration;

    if (startTime < metrics.fcp) {
      return;
    }

    if (name !== 'self' && name.indexOf('same-origin') === -1) {
      return;
    }

    metrics.tbt.start = Math.min(metrics.tbt.start, startTime);
    var blockingTime = duration - LONG_TASK_THRESHOLD;

    if (blockingTime > 0) {
      metrics.tbt.duration += blockingTime;
    }
  });
}
function calculateCumulativeLayoutShift(clsEntries) {
  clsEntries.forEach(function (entry) {
    if (!entry.hadRecentInput && entry.value) {
      var shouldCreateNewSession = entry.startTime - metrics.cls.firstEntryTime > 5000 || entry.startTime - metrics.cls.prevEntryTime > 1000;

      if (shouldCreateNewSession) {
        metrics.cls.firstEntryTime = entry.startTime;
        metrics.cls.currentSessionScore = 0;
      }

      metrics.cls.prevEntryTime = entry.startTime;
      metrics.cls.currentSessionScore += entry.value;
      metrics.cls.score = Math.max(metrics.cls.score, metrics.cls.currentSessionScore);
    }
  });
}
function captureObserverEntries(list, _ref) {
  var isHardNavigation = _ref.isHardNavigation,
      trStart = _ref.trStart;
  var longtaskEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK).filter(function (entry) {
    return entry.startTime >= trStart;
  });
  var longTaskSpans = createLongTaskSpans(longtaskEntries, metrics.longtask);
  var result = {
    spans: longTaskSpans,
    marks: {}
  };

  if (!isHardNavigation) {
    return result;
  }

  var lcpEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LARGEST_CONTENTFUL_PAINT);
  var lastLcpEntry = lcpEntries[lcpEntries.length - 1];

  if (lastLcpEntry) {
    var lcp = parseInt(lastLcpEntry.startTime);
    metrics.lcp = lcp;
    result.marks.largestContentfulPaint = lcp;
  }

  var timing = _common_utils__WEBPACK_IMPORTED_MODULE_2__.PERF.timing;
  var unloadDiff = timing.fetchStart - timing.navigationStart;

  if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.isRedirectInfoAvailable)(timing)) {
    unloadDiff = 0;
  }

  var fcpEntry = list.getEntriesByName(_common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_CONTENTFUL_PAINT)[0];

  if (fcpEntry) {
    var fcp = parseInt(unloadDiff >= 0 ? fcpEntry.startTime - unloadDiff : fcpEntry.startTime);
    metrics.fcp = fcp;
    result.marks.firstContentfulPaint = fcp;
  }

  var fidEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_INPUT);
  var fidSpan = createFirstInputDelaySpan(fidEntries);

  if (fidSpan) {
    metrics.fid = fidSpan.duration();
    result.spans.push(fidSpan);
  }

  calculateTotalBlockingTime(longtaskEntries);
  var clsEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LAYOUT_SHIFT);
  calculateCumulativeLayoutShift(clsEntries);
  return result;
}
var PerfEntryRecorder = function () {
  function PerfEntryRecorder(callback) {
    this.po = {
      observe: _common_utils__WEBPACK_IMPORTED_MODULE_2__.noop,
      disconnect: _common_utils__WEBPACK_IMPORTED_MODULE_2__.noop
    };

    if (window.PerformanceObserver) {
      this.po = new PerformanceObserver(callback);
    }
  }

  var _proto = PerfEntryRecorder.prototype;

  _proto.start = function start(type, options) {
    if (options === void 0) {
      options = {
        buffered: true
      };
    }

    try {
      if (!(0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.isPerfTypeSupported)(type)) {
        return;
      }

      this.po.observe(_extends({
        type: type
      }, options));
    } catch (_) {}
  };

  _proto.stop = function stop() {
    this.po.disconnect();
  };

  return PerfEntryRecorder;
}();

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/navigation/capture-navigation.js":
/*!***********************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/navigation/capture-navigation.js ***!
  \***********************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   captureNavigation: function() { return /* binding */ captureNavigation; },
/* harmony export */   createNavigationTimingSpans: function() { return /* reexport safe */ _navigation_timing__WEBPACK_IMPORTED_MODULE_2__.createNavigationTimingSpans; },
/* harmony export */   createResourceTimingSpans: function() { return /* reexport safe */ _resource_timing__WEBPACK_IMPORTED_MODULE_4__.createResourceTimingSpans; },
/* harmony export */   createUserTimingSpans: function() { return /* reexport safe */ _user_timing__WEBPACK_IMPORTED_MODULE_6__.createUserTimingSpans; },
/* harmony export */   getPageLoadMarks: function() { return /* reexport safe */ _marks__WEBPACK_IMPORTED_MODULE_3__.getPageLoadMarks; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _navigation_timing__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./navigation-timing */ "../rum-core/dist/es/performance-monitoring/navigation/navigation-timing.js");
/* harmony import */ var _user_timing__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./user-timing */ "../rum-core/dist/es/performance-monitoring/navigation/user-timing.js");
/* harmony import */ var _resource_timing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./resource-timing */ "../rum-core/dist/es/performance-monitoring/navigation/resource-timing.js");
/* harmony import */ var _marks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./marks */ "../rum-core/dist/es/performance-monitoring/navigation/marks.js");








function captureNavigation(transaction) {
  if (!transaction.captureTimings) {
    if (transaction.type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD) {
      transaction._start = 0;
    }

    return;
  }

  var trEnd = transaction._end;

  if (transaction.type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD) {
    if (transaction.marks && transaction.marks.custom) {
      var customMarks = transaction.marks.custom;
      Object.keys(customMarks).forEach(function (key) {
        customMarks[key] += transaction._start;
      });
    }

    var trStart = 0;
    transaction._start = trStart;
    var timings = _common_utils__WEBPACK_IMPORTED_MODULE_1__.PERF.timing;
    var baseTime = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.isRedirectInfoAvailable)(timings) ? timings.redirectStart : timings.fetchStart;
    (0,_navigation_timing__WEBPACK_IMPORTED_MODULE_2__.createNavigationTimingSpans)(timings, baseTime, trStart, trEnd).forEach(function (span) {
      span.traceId = transaction.traceId;
      span.sampled = transaction.sampled;

      if (span.pageResponse && transaction.options.pageLoadSpanId) {
        span.id = transaction.options.pageLoadSpanId;
      }

      transaction.spans.push(span);
    });
    transaction.addMarks((0,_marks__WEBPACK_IMPORTED_MODULE_3__.getPageLoadMarks)(timings));
  }

  if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.isPerfTimelineSupported)()) {
    var _trStart = transaction._start;
    var resourceEntries = _common_utils__WEBPACK_IMPORTED_MODULE_1__.PERF.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_0__.RESOURCE);
    (0,_resource_timing__WEBPACK_IMPORTED_MODULE_4__.createResourceTimingSpans)(resourceEntries, _state__WEBPACK_IMPORTED_MODULE_5__.state.bootstrapTime, _trStart, trEnd).forEach(function (span) {
      return transaction.spans.push(span);
    });
    var userEntries = _common_utils__WEBPACK_IMPORTED_MODULE_1__.PERF.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_0__.MEASURE);
    (0,_user_timing__WEBPACK_IMPORTED_MODULE_6__.createUserTimingSpans)(userEntries, _trStart, trEnd).forEach(function (span) {
      return transaction.spans.push(span);
    });
  }
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/navigation/marks.js":
/*!**********************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/navigation/marks.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COMPRESSED_NAV_TIMING_MARKS: function() { return /* binding */ COMPRESSED_NAV_TIMING_MARKS; },
/* harmony export */   NAVIGATION_TIMING_MARKS: function() { return /* binding */ NAVIGATION_TIMING_MARKS; },
/* harmony export */   getPageLoadMarks: function() { return /* binding */ getPageLoadMarks; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/utils */ "../rum-core/dist/es/common/utils.js");

var NAVIGATION_TIMING_MARKS = ['fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'connectEnd', 'requestStart', 'responseStart', 'responseEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd'];
var COMPRESSED_NAV_TIMING_MARKS = ['fs', 'ls', 'le', 'cs', 'ce', 'qs', 'rs', 're', 'dl', 'di', 'ds', 'de', 'dc', 'es', 'ee'];

function getPageLoadMarks(timing) {
  var marks = getNavigationTimingMarks(timing);

  if (marks == null) {
    return null;
  }

  return {
    navigationTiming: marks,
    agent: {
      timeToFirstByte: marks.responseStart,
      domInteractive: marks.domInteractive,
      domComplete: marks.domComplete
    }
  };
}

function getNavigationTimingMarks(timing) {
  var redirectStart = timing.redirectStart,
      fetchStart = timing.fetchStart,
      navigationStart = timing.navigationStart,
      responseStart = timing.responseStart,
      responseEnd = timing.responseEnd;

  if (fetchStart >= navigationStart && responseStart >= fetchStart && responseEnd >= responseStart) {
    var marks = {};
    NAVIGATION_TIMING_MARKS.forEach(function (timingKey) {
      var m = timing[timingKey];

      if (m && m >= fetchStart) {
        if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.isRedirectInfoAvailable)(timing)) {
          marks[timingKey] = parseInt(m - redirectStart);
        } else {
          marks[timingKey] = parseInt(m - fetchStart);
        }
      }
    });
    return marks;
  }

  return null;
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/navigation/navigation-timing.js":
/*!**********************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/navigation/navigation-timing.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNavigationTimingSpans: function() { return /* binding */ createNavigationTimingSpans; }
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/performance-monitoring/navigation/utils.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../span */ "../rum-core/dist/es/performance-monitoring/span.js");


var eventPairs = [['redirectStart', 'redirectEnd', 'Redirect'], ['domainLookupStart', 'domainLookupEnd', 'Domain lookup'], ['connectStart', 'connectEnd', 'Making a connection to the server'], ['requestStart', 'responseEnd', 'Requesting and receiving the document'], ['domLoading', 'domInteractive', 'Parsing the document, executing sync. scripts'], ['domContentLoadedEventStart', 'domContentLoadedEventEnd', 'Fire "DOMContentLoaded" event'], ['loadEventStart', 'loadEventEnd', 'Fire "load" event']];

function createNavigationTimingSpans(timings, baseTime, trStart, trEnd) {
  var spans = [];

  for (var i = 0; i < eventPairs.length; i++) {
    var start = timings[eventPairs[i][0]];
    var end = timings[eventPairs[i][1]];

    if (!(0,_utils__WEBPACK_IMPORTED_MODULE_0__.shouldCreateSpan)(start, end, trStart, trEnd, baseTime)) {
      continue;
    }

    var span = new _span__WEBPACK_IMPORTED_MODULE_1__["default"](eventPairs[i][2], 'hard-navigation.browser-timing');
    var data = null;

    if (eventPairs[i][0] === 'requestStart') {
      span.pageResponse = true;
      data = {
        url: location.origin
      };
    }

    span._start = start - baseTime;
    span.end(end - baseTime, data);
    spans.push(span);
  }

  return spans;
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/navigation/resource-timing.js":
/*!********************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/navigation/resource-timing.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createResourceTimingSpans: function() { return /* binding */ createResourceTimingSpans; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/performance-monitoring/navigation/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../span */ "../rum-core/dist/es/performance-monitoring/span.js");





function createResourceTimingSpan(resourceTimingEntry) {
  var name = resourceTimingEntry.name,
      initiatorType = resourceTimingEntry.initiatorType,
      startTime = resourceTimingEntry.startTime,
      responseEnd = resourceTimingEntry.responseEnd;
  var kind = 'resource';

  if (initiatorType) {
    kind += '.' + initiatorType;
  }

  var spanName = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.stripQueryStringFromUrl)(name);
  var span = new _span__WEBPACK_IMPORTED_MODULE_1__["default"](spanName, kind);
  span._start = startTime;
  span.end(responseEnd, {
    url: name,
    entry: resourceTimingEntry
  });
  return span;
}

function isCapturedByPatching(resourceStartTime, requestPatchTime) {
  return requestPatchTime != null && resourceStartTime > requestPatchTime;
}

function isIntakeAPIEndpoint(url) {
  return /intake\/v\d+\/rum\/events/.test(url);
}

function createResourceTimingSpans(entries, requestPatchTime, trStart, trEnd) {
  var spans = [];

  for (var i = 0; i < entries.length; i++) {
    var _entries$i = entries[i],
        initiatorType = _entries$i.initiatorType,
        name = _entries$i.name,
        startTime = _entries$i.startTime,
        responseEnd = _entries$i.responseEnd;

    if (_common_constants__WEBPACK_IMPORTED_MODULE_2__.RESOURCE_INITIATOR_TYPES.indexOf(initiatorType) === -1 || name == null) {
      continue;
    }

    if ((initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') && (isIntakeAPIEndpoint(name) || isCapturedByPatching(startTime, requestPatchTime))) {
      continue;
    }

    if ((0,_utils__WEBPACK_IMPORTED_MODULE_3__.shouldCreateSpan)(startTime, responseEnd, trStart, trEnd)) {
      spans.push(createResourceTimingSpan(entries[i]));
    }
  }

  return spans;
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/navigation/user-timing.js":
/*!****************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/navigation/user-timing.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createUserTimingSpans: function() { return /* binding */ createUserTimingSpans; }
/* harmony export */ });
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/performance-monitoring/navigation/utils.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../span */ "../rum-core/dist/es/performance-monitoring/span.js");




function createUserTimingSpans(entries, trStart, trEnd) {
  var userTimingSpans = [];

  for (var i = 0; i < entries.length; i++) {
    var _entries$i = entries[i],
        name = _entries$i.name,
        startTime = _entries$i.startTime,
        duration = _entries$i.duration;
    var end = startTime + duration;

    if (duration <= _common_constants__WEBPACK_IMPORTED_MODULE_0__.USER_TIMING_THRESHOLD || !(0,_utils__WEBPACK_IMPORTED_MODULE_1__.shouldCreateSpan)(startTime, end, trStart, trEnd)) {
      continue;
    }

    var kind = 'app';
    var span = new _span__WEBPACK_IMPORTED_MODULE_2__["default"](name, kind);
    span._start = startTime;
    span.end(end);
    userTimingSpans.push(span);
  }

  return userTimingSpans;
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/navigation/utils.js":
/*!**********************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/navigation/utils.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   shouldCreateSpan: function() { return /* binding */ shouldCreateSpan; }
/* harmony export */ });
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/constants */ "../rum-core/dist/es/common/constants.js");


function shouldCreateSpan(start, end, trStart, trEnd, baseTime) {
  if (baseTime === void 0) {
    baseTime = 0;
  }

  return typeof start === 'number' && typeof end === 'number' && start >= baseTime && end > start && start - baseTime >= trStart && end - baseTime <= trEnd && end - start < _common_constants__WEBPACK_IMPORTED_MODULE_0__.MAX_SPAN_DURATION && start - baseTime < _common_constants__WEBPACK_IMPORTED_MODULE_0__.MAX_SPAN_DURATION && end - baseTime < _common_constants__WEBPACK_IMPORTED_MODULE_0__.MAX_SPAN_DURATION;
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/performance-monitoring.js":
/*!****************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/performance-monitoring.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   adjustTransaction: function() { return /* binding */ adjustTransaction; },
/* harmony export */   "default": function() { return /* binding */ PerformanceMonitoring; },
/* harmony export */   groupSmallContinuouslySimilarSpans: function() { return /* binding */ groupSmallContinuouslySimilarSpans; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_url__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/url */ "../rum-core/dist/es/common/url.js");
/* harmony import */ var _common_patching__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/patching */ "../rum-core/dist/es/common/patching/index.js");
/* harmony import */ var _common_patching_patch_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/patching/patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_truncate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/truncate */ "../rum-core/dist/es/common/truncate.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");







var SIMILAR_SPAN_TO_TRANSACTION_RATIO = 0.05;
var TRANSACTION_DURATION_THRESHOLD = 60000;
function groupSmallContinuouslySimilarSpans(originalSpans, transDuration, threshold) {
  originalSpans.sort(function (spanA, spanB) {
    return spanA._start - spanB._start;
  });
  var spans = [];
  var lastCount = 1;
  originalSpans.forEach(function (span, index) {
    if (spans.length === 0) {
      spans.push(span);
    } else {
      var lastSpan = spans[spans.length - 1];
      var isContinuouslySimilar = lastSpan.type === span.type && lastSpan.subtype === span.subtype && lastSpan.action === span.action && lastSpan.name === span.name && span.duration() / transDuration < threshold && (span._start - lastSpan._end) / transDuration < threshold;
      var isLastSpan = originalSpans.length === index + 1;

      if (isContinuouslySimilar) {
        lastCount++;
        lastSpan._end = span._end;
      }

      if (lastCount > 1 && (!isContinuouslySimilar || isLastSpan)) {
        lastSpan.name = lastCount + 'x ' + lastSpan.name;
        lastCount = 1;
      }

      if (!isContinuouslySimilar) {
        spans.push(span);
      }
    }
  });
  return spans;
}
function adjustTransaction(transaction) {
  if (transaction.sampled) {
    var filterdSpans = transaction.spans.filter(function (span) {
      return span.duration() > 0 && span._start >= transaction._start && span._end <= transaction._end;
    });

    if (transaction.isManaged()) {
      var duration = transaction.duration();
      var similarSpans = groupSmallContinuouslySimilarSpans(filterdSpans, duration, SIMILAR_SPAN_TO_TRANSACTION_RATIO);
      transaction.spans = similarSpans;
    } else {
      transaction.spans = filterdSpans;
    }
  } else {
    transaction.resetFields();
  }

  return transaction;
}

var PerformanceMonitoring = function () {
  function PerformanceMonitoring(apmServer, configService, loggingService, transactionService) {
    this._apmServer = apmServer;
    this._configService = configService;
    this._logginService = loggingService;
    this._transactionService = transactionService;
  }

  var _proto = PerformanceMonitoring.prototype;

  _proto.init = function init(flags) {
    var _this = this;

    if (flags === void 0) {
      flags = {};
    }

    this._configService.events.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_END + _common_constants__WEBPACK_IMPORTED_MODULE_0__.AFTER_EVENT, function (tr) {
      var payload = _this.createTransactionPayload(tr);

      if (payload) {
        _this._apmServer.addTransaction(payload);

        _this._configService.dispatchEvent(_common_constants__WEBPACK_IMPORTED_MODULE_0__.QUEUE_ADD_TRANSACTION);
      }
    });

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY, this.getHistorySub());
    }

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST, this.getXHRSub());
    }

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH, this.getFetchSub());
    }
  };

  _proto.getHistorySub = function getHistorySub() {
    var transactionService = this._transactionService;
    return function (event, task) {
      if (task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY && event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE) {
        transactionService.startTransaction(task.data.title, 'route-change', {
          managed: true,
          canReuse: true
        });
      }
    };
  };

  _proto.getXHRSub = function getXHRSub() {
    var _this2 = this;

    return function (event, task) {
      if (task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST && !_common_patching_patch_utils__WEBPACK_IMPORTED_MODULE_2__.globalState.fetchInProgress) {
        _this2.processAPICalls(event, task);
      }
    };
  };

  _proto.getFetchSub = function getFetchSub() {
    var _this3 = this;

    return function (event, task) {
      if (task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH) {
        _this3.processAPICalls(event, task);
      }
    };
  };

  _proto.processAPICalls = function processAPICalls(event, task) {
    var configService = this._configService;
    var transactionService = this._transactionService;

    if (task.data && task.data.url) {
      var endpoints = this._apmServer.getEndpoints();

      var isOwnEndpoint = Object.keys(endpoints).some(function (endpoint) {
        return task.data.url.indexOf(endpoints[endpoint]) !== -1;
      });

      if (isOwnEndpoint) {
        return;
      }
    }

    if (event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE && task.data) {
      var data = task.data;
      var requestUrl = new _common_url__WEBPACK_IMPORTED_MODULE_3__.Url(data.url);
      var spanName = data.method + ' ' + (requestUrl.relative ? requestUrl.path : (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.stripQueryStringFromUrl)(requestUrl.href));

      if (!transactionService.getCurrentTransaction()) {
        transactionService.startTransaction(spanName, _common_constants__WEBPACK_IMPORTED_MODULE_0__.HTTP_REQUEST_TYPE, {
          managed: true
        });
      }

      var span = transactionService.startSpan(spanName, 'external.http', {
        blocking: true
      });

      if (!span) {
        return;
      }

      var isDtEnabled = configService.get('distributedTracing');
      var dtOrigins = configService.get('distributedTracingOrigins');
      var currentUrl = new _common_url__WEBPACK_IMPORTED_MODULE_3__.Url(window.location.href);
      var isSameOrigin = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.checkSameOrigin)(requestUrl.origin, currentUrl.origin) || (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.checkSameOrigin)(requestUrl.origin, dtOrigins);
      var target = data.target;

      if (isDtEnabled && isSameOrigin && target) {
        this.injectDtHeader(span, target);
        var propagateTracestate = configService.get('propagateTracestate');

        if (propagateTracestate) {
          this.injectTSHeader(span, target);
        }
      } else if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
        this._logginService.debug("Could not inject distributed tracing header to the request origin ('" + requestUrl.origin + "') from the current origin ('" + currentUrl.origin + "')");
      }

      if (data.sync) {
        span.sync = data.sync;
      }

      data.span = span;
    } else if (event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE) {
      var _data = task.data;

      if (_data && _data.span) {
        var _span = _data.span,
            response = _data.response,
            _target = _data.target;
        var status;

        if (response) {
          status = response.status;
        } else {
          status = _target.status;
        }

        var outcome;

        if (_data.status != 'abort' && !_data.aborted) {
          if (status >= 400 || status == 0) {
            outcome = _common_constants__WEBPACK_IMPORTED_MODULE_0__.OUTCOME_FAILURE;
          } else {
            outcome = _common_constants__WEBPACK_IMPORTED_MODULE_0__.OUTCOME_SUCCESS;
          }
        } else {
          outcome = _common_constants__WEBPACK_IMPORTED_MODULE_0__.OUTCOME_UNKNOWN;
        }

        _span.outcome = outcome;
        var tr = transactionService.getCurrentTransaction();

        if (tr && tr.type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.HTTP_REQUEST_TYPE) {
          tr.outcome = outcome;
        }

        transactionService.endSpan(_span, _data);
      }
    }
  };

  _proto.injectDtHeader = function injectDtHeader(span, target) {
    var headerName = this._configService.get('distributedTracingHeaderName');

    var headerValue = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.getDtHeaderValue)(span);
    var isHeaderValid = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.isDtHeaderValid)(headerValue);

    if (isHeaderValid && headerValue && headerName) {
      (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.setRequestHeader)(target, headerName, headerValue);
    }
  };

  _proto.injectTSHeader = function injectTSHeader(span, target) {
    var headerValue = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.getTSHeaderValue)(span);

    if (headerValue) {
      (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.setRequestHeader)(target, 'tracestate', headerValue);
    }
  };

  _proto.extractDtHeader = function extractDtHeader(target) {
    var configService = this._configService;
    var headerName = configService.get('distributedTracingHeaderName');

    if (target) {
      return (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.parseDtHeaderValue)(target[headerName]);
    }
  };

  _proto.filterTransaction = function filterTransaction(tr) {
    var duration = tr.duration();

    if (!duration) {
      if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
        var message = "transaction(" + tr.id + ", " + tr.name + ") was discarded! ";

        if (duration === 0) {
          message += "Transaction duration is 0";
        } else {
          message += "Transaction wasn't ended";
        }

        this._logginService.debug(message);
      }

      return false;
    }

    if (tr.isManaged()) {
      if (duration > TRANSACTION_DURATION_THRESHOLD) {
        if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
          this._logginService.debug("transaction(" + tr.id + ", " + tr.name + ") was discarded! Transaction duration (" + duration + ") is greater than managed transaction threshold (" + TRANSACTION_DURATION_THRESHOLD + ")");
        }

        return false;
      }

      if (tr.sampled && tr.spans.length === 0) {
        if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
          this._logginService.debug("transaction(" + tr.id + ", " + tr.name + ") was discarded! Transaction does not have any spans");
        }

        return false;
      }
    }

    return true;
  };

  _proto.createTransactionDataModel = function createTransactionDataModel(transaction) {
    var transactionStart = transaction._start;
    var spans = transaction.spans.map(function (span) {
      var spanData = {
        id: span.id,
        transaction_id: transaction.id,
        parent_id: span.parentId || transaction.id,
        trace_id: transaction.traceId,
        name: span.name,
        type: span.type,
        subtype: span.subtype,
        action: span.action,
        sync: span.sync,
        start: parseInt(span._start - transactionStart),
        duration: span.duration(),
        context: span.context,
        outcome: span.outcome,
        sample_rate: span.sampleRate
      };
      return (0,_common_truncate__WEBPACK_IMPORTED_MODULE_6__.truncateModel)(_common_truncate__WEBPACK_IMPORTED_MODULE_6__.SPAN_MODEL, spanData);
    });
    var transactionData = {
      id: transaction.id,
      trace_id: transaction.traceId,
      session: transaction.session,
      name: transaction.name,
      type: transaction.type,
      duration: transaction.duration(),
      spans: spans,
      context: transaction.context,
      marks: transaction.marks,
      breakdown: transaction.breakdownTimings,
      span_count: {
        started: spans.length
      },
      sampled: transaction.sampled,
      sample_rate: transaction.sampleRate,
      experience: transaction.experience,
      outcome: transaction.outcome
    };
    return (0,_common_truncate__WEBPACK_IMPORTED_MODULE_6__.truncateModel)(_common_truncate__WEBPACK_IMPORTED_MODULE_6__.TRANSACTION_MODEL, transactionData);
  };

  _proto.createTransactionPayload = function createTransactionPayload(transaction) {
    var adjustedTransaction = adjustTransaction(transaction);
    var filtered = this.filterTransaction(adjustedTransaction);

    if (filtered) {
      return this.createTransactionDataModel(transaction);
    }

    this._configService.dispatchEvent(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_IGNORE);
  };

  return PerformanceMonitoring;
}();



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/span-base.js":
/*!***************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/span-base.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");



var SpanBase = function () {
  function SpanBase(name, type, options) {
    if (options === void 0) {
      options = {};
    }

    if (!name) {
      name = _common_constants__WEBPACK_IMPORTED_MODULE_0__.NAME_UNKNOWN;
    }

    if (!type) {
      type = _common_constants__WEBPACK_IMPORTED_MODULE_0__.TYPE_CUSTOM;
    }

    this.name = name;
    this.type = type;
    this.options = options;
    this.id = options.id || (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.generateRandomId)(16);
    this.traceId = options.traceId;
    this.sampled = options.sampled;
    this.sampleRate = options.sampleRate;
    this.timestamp = options.timestamp;
    this._start = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getTime)(options.startTime);
    this._end = undefined;
    this.ended = false;
    this.outcome = undefined;
    this.onEnd = options.onEnd;
  }

  var _proto = SpanBase.prototype;

  _proto.ensureContext = function ensureContext() {
    if (!this.context) {
      this.context = {};
    }
  };

  _proto.addLabels = function addLabels(tags) {
    this.ensureContext();
    var ctx = this.context;

    if (!ctx.tags) {
      ctx.tags = {};
    }

    var keys = Object.keys(tags);
    keys.forEach(function (k) {
      return (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.setLabel)(k, tags[k], ctx.tags);
    });
  };

  _proto.addContext = function addContext() {
    for (var _len = arguments.length, context = new Array(_len), _key = 0; _key < _len; _key++) {
      context[_key] = arguments[_key];
    }

    if (context.length === 0) return;
    this.ensureContext();
    _common_utils__WEBPACK_IMPORTED_MODULE_1__.merge.apply(void 0, [this.context].concat(context));
  };

  _proto.end = function end(endTime) {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this._end = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getTime)(endTime);
    this.callOnEnd();
  };

  _proto.callOnEnd = function callOnEnd() {
    if (typeof this.onEnd === 'function') {
      this.onEnd(this);
    }
  };

  _proto.duration = function duration() {
    return (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getDuration)(this._start, this._end);
  };

  return SpanBase;
}();

/* harmony default export */ __webpack_exports__["default"] = (SpanBase);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/span.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/span.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _span_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./span-base */ "../rum-core/dist/es/performance-monitoring/span-base.js");
/* harmony import */ var _common_context__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/context */ "../rum-core/dist/es/common/context.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}




var Span = function (_SpanBase) {
  _inheritsLoose(Span, _SpanBase);

  function Span(name, type, options) {
    var _this;

    _this = _SpanBase.call(this, name, type, options) || this;
    _this.parentId = _this.options.parentId;
    _this.subtype = undefined;
    _this.action = undefined;

    if (_this.type.indexOf('.') !== -1) {
      var fields = _this.type.split('.', 3);

      _this.type = fields[0];
      _this.subtype = fields[1];
      _this.action = fields[2];
    }

    _this.sync = _this.options.sync;
    return _this;
  }

  var _proto = Span.prototype;

  _proto.end = function end(endTime, data) {
    _SpanBase.prototype.end.call(this, endTime);

    (0,_common_context__WEBPACK_IMPORTED_MODULE_0__.addSpanContext)(this, data);
  };

  return Span;
}(_span_base__WEBPACK_IMPORTED_MODULE_1__["default"]);

/* harmony default export */ __webpack_exports__["default"] = (Span);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/transaction-service.js":
/*!*************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/transaction-service.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_polyfills__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../common/polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _transaction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transaction */ "../rum-core/dist/es/performance-monitoring/transaction.js");
/* harmony import */ var _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metrics/metrics */ "../rum-core/dist/es/performance-monitoring/metrics/metrics.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _navigation_capture_navigation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./navigation/capture-navigation */ "../rum-core/dist/es/performance-monitoring/navigation/capture-navigation.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_context__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../common/context */ "../rum-core/dist/es/common/context.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _common_url__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/url */ "../rum-core/dist/es/common/url.js");










var TransactionService = function () {
  function TransactionService(logger, config) {
    var _this = this;

    this._config = config;
    this._logger = logger;
    this.currentTransaction = undefined;
    this.respIntervalId = undefined;
    this.recorder = new _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.PerfEntryRecorder(function (list) {
      var tr = _this.getCurrentTransaction();

      if (tr && tr.captureTimings) {
        var _tr$spans;

        var isHardNavigation = tr.type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD;

        var _captureObserverEntri = (0,_metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.captureObserverEntries)(list, {
          isHardNavigation: isHardNavigation,
          trStart: isHardNavigation ? 0 : tr._start
        }),
            spans = _captureObserverEntri.spans,
            marks = _captureObserverEntri.marks;

        (_tr$spans = tr.spans).push.apply(_tr$spans, spans);

        tr.addMarks({
          agent: marks
        });
      }
    });
  }

  var _proto = TransactionService.prototype;

  _proto.createCurrentTransaction = function createCurrentTransaction(name, type, options) {
    var tr = new _transaction__WEBPACK_IMPORTED_MODULE_2__["default"](name, type, options);
    this.currentTransaction = tr;
    return tr;
  };

  _proto.getCurrentTransaction = function getCurrentTransaction() {
    if (this.currentTransaction && !this.currentTransaction.ended) {
      return this.currentTransaction;
    }
  };

  _proto.createOptions = function createOptions(options) {
    var config = this._config.config;
    var presetOptions = {
      transactionSampleRate: config.transactionSampleRate
    };
    var perfOptions = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.extend)(presetOptions, options);

    if (perfOptions.managed) {
      perfOptions = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.extend)({
        pageLoadTraceId: config.pageLoadTraceId,
        pageLoadSampled: config.pageLoadSampled,
        pageLoadSpanId: config.pageLoadSpanId,
        pageLoadTransactionName: config.pageLoadTransactionName
      }, perfOptions);
    }

    return perfOptions;
  };

  _proto.startManagedTransaction = function startManagedTransaction(name, type, perfOptions) {
    var tr = this.getCurrentTransaction();
    var isRedefined = false;

    if (!tr) {
      tr = this.createCurrentTransaction(name, type, perfOptions);
    } else if (tr.canReuse() && perfOptions.canReuse) {
      var redefineType = tr.type;
      var currentTypeOrder = _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE_ORDER.indexOf(tr.type);
      var redefineTypeOrder = _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE_ORDER.indexOf(type);

      if (currentTypeOrder >= 0 && redefineTypeOrder < currentTypeOrder) {
        redefineType = type;
      }

      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        this._logger.debug("redefining transaction(" + tr.id + ", " + tr.name + ", " + tr.type + ")", 'to', "(" + (name || tr.name) + ", " + redefineType + ")", tr);
      }

      tr.redefine(name, redefineType, perfOptions);
      isRedefined = true;
    } else {
      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        this._logger.debug("ending previous transaction(" + tr.id + ", " + tr.name + ")", tr);
      }

      tr.end();
      tr = this.createCurrentTransaction(name, type, perfOptions);
    }

    if (tr.type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD) {
      if (!isRedefined) {
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LARGEST_CONTENTFUL_PAINT);
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.PAINT);
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_INPUT);
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LAYOUT_SHIFT);
      }

      if (perfOptions.pageLoadTraceId) {
        tr.traceId = perfOptions.pageLoadTraceId;
      }

      if (perfOptions.pageLoadSampled) {
        tr.sampled = perfOptions.pageLoadSampled;
      }

      if (tr.name === _common_constants__WEBPACK_IMPORTED_MODULE_1__.NAME_UNKNOWN && perfOptions.pageLoadTransactionName) {
        tr.name = perfOptions.pageLoadTransactionName;
      }
    }

    if (!isRedefined && this._config.get('monitorLongtasks')) {
      this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK);
    }

    if (tr.sampled) {
      tr.captureTimings = true;
    }

    return tr;
  };

  _proto.startTransaction = function startTransaction(name, type, options) {
    var _this2 = this;

    var perfOptions = this.createOptions(options);
    var tr;
    var fireOnstartHook = true;

    if (perfOptions.managed) {
      var current = this.currentTransaction;
      tr = this.startManagedTransaction(name, type, perfOptions);

      if (current === tr) {
        fireOnstartHook = false;
      }
    } else {
      tr = new _transaction__WEBPACK_IMPORTED_MODULE_2__["default"](name, type, perfOptions);
    }

    tr.onEnd = function () {
      return _this2.handleTransactionEnd(tr);
    };

    if (fireOnstartHook) {
      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        this._logger.debug("startTransaction(" + tr.id + ", " + tr.name + ", " + tr.type + ")");
      }

      this._config.events.send(_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_START, [tr]);
    }

    return tr;
  };

  _proto.handleTransactionEnd = function handleTransactionEnd(tr) {
    var _this3 = this;

    this.recorder.stop();
    var currentUrl = window.location.href;
    return _common_polyfills__WEBPACK_IMPORTED_MODULE_5__.Promise.resolve().then(function () {
      var name = tr.name,
          type = tr.type;
      var lastHiddenStart = _state__WEBPACK_IMPORTED_MODULE_4__.state.lastHiddenStart;

      if (lastHiddenStart >= tr._start) {
        if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
          _this3._logger.debug("transaction(" + tr.id + ", " + name + ", " + type + ") was discarded! The page was hidden during the transaction!");
        }

        _this3._config.dispatchEvent(_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_IGNORE);

        return;
      }

      if (_this3.shouldIgnoreTransaction(name) || type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.TEMPORARY_TYPE) {
        if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
          _this3._logger.debug("transaction(" + tr.id + ", " + name + ", " + type + ") is ignored");
        }

        _this3._config.dispatchEvent(_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_IGNORE);

        return;
      }

      if (type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD) {
        var pageLoadTransactionName = _this3._config.get('pageLoadTransactionName');

        if (name === _common_constants__WEBPACK_IMPORTED_MODULE_1__.NAME_UNKNOWN && pageLoadTransactionName) {
          tr.name = pageLoadTransactionName;
        }

        if (tr.captureTimings) {
          var cls = _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.cls,
              fid = _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.fid,
              tbt = _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.tbt,
              longtask = _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.longtask;

          if (tbt.duration > 0) {
            tr.spans.push((0,_metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.createTotalBlockingTimeSpan)(tbt));
          }

          tr.experience = {};

          if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.isPerfTypeSupported)(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK)) {
            tr.experience.tbt = tbt.duration;
          }

          if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.isPerfTypeSupported)(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LAYOUT_SHIFT)) {
            tr.experience.cls = cls.score;
          }

          if (fid > 0) {
            tr.experience.fid = fid;
          }

          if (longtask.count > 0) {
            tr.experience.longtask = {
              count: longtask.count,
              sum: longtask.duration,
              max: longtask.max
            };
          }
        }

        _this3.setSession(tr);
      }

      if (tr.name === _common_constants__WEBPACK_IMPORTED_MODULE_1__.NAME_UNKNOWN) {
        tr.name = (0,_common_url__WEBPACK_IMPORTED_MODULE_6__.slugifyUrl)(currentUrl);
      }

      (0,_navigation_capture_navigation__WEBPACK_IMPORTED_MODULE_7__.captureNavigation)(tr);

      _this3.adjustTransactionTime(tr);

      var breakdownMetrics = _this3._config.get('breakdownMetrics');

      if (breakdownMetrics) {
        tr.captureBreakdown();
      }

      var configContext = _this3._config.get('context');

      (0,_common_context__WEBPACK_IMPORTED_MODULE_8__.addTransactionContext)(tr, configContext);

      _this3._config.events.send(_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_END, [tr]);

      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        _this3._logger.debug("end transaction(" + tr.id + ", " + tr.name + ", " + tr.type + ")", tr);
      }
    }, function (err) {
      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        _this3._logger.debug("error ending transaction(" + tr.id + ", " + tr.name + ")", err);
      }
    });
  };

  _proto.setSession = function setSession(tr) {
    var session = this._config.get('session');

    if (session) {
      if (typeof session == 'boolean') {
        tr.session = {
          id: (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.generateRandomId)(16),
          sequence: 1
        };
      } else {
        if (session.timestamp && Date.now() - session.timestamp > _common_constants__WEBPACK_IMPORTED_MODULE_1__.SESSION_TIMEOUT) {
          tr.session = {
            id: (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.generateRandomId)(16),
            sequence: 1
          };
        } else {
          tr.session = {
            id: session.id,
            sequence: session.sequence ? session.sequence + 1 : 1
          };
        }
      }

      var sessionConfig = {
        session: {
          id: tr.session.id,
          sequence: tr.session.sequence,
          timestamp: Date.now()
        }
      };

      this._config.setConfig(sessionConfig);

      this._config.setLocalConfig(sessionConfig, true);
    }
  };

  _proto.adjustTransactionTime = function adjustTransactionTime(transaction) {
    var spans = transaction.spans;
    var earliestSpan = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.getEarliestSpan)(spans);

    if (earliestSpan && earliestSpan._start < transaction._start) {
      transaction._start = earliestSpan._start;
    }

    var latestSpan = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.getLatestNonXHRSpan)(spans) || {};
    var latestSpanEnd = latestSpan._end || 0;

    if (transaction.type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD) {
      var transactionEndWithoutDelay = transaction._end - _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD_DELAY;
      var lcp = _metrics_metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.lcp || 0;
      var latestXHRSpan = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.getLatestXHRSpan)(spans) || {};
      var latestXHRSpanEnd = latestXHRSpan._end || 0;
      transaction._end = Math.max(latestSpanEnd, latestXHRSpanEnd, lcp, transactionEndWithoutDelay);
    } else if (latestSpanEnd > transaction._end) {
      transaction._end = latestSpanEnd;
    }

    this.truncateSpans(spans, transaction._end);
  };

  _proto.truncateSpans = function truncateSpans(spans, transactionEnd) {
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];

      if (span._end > transactionEnd) {
        span._end = transactionEnd;
        span.type += _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRUNCATED_TYPE;
      }

      if (span._start > transactionEnd) {
        span._start = transactionEnd;
      }
    }
  };

  _proto.shouldIgnoreTransaction = function shouldIgnoreTransaction(transactionName) {
    var ignoreList = this._config.get('ignoreTransactions');

    if (ignoreList && ignoreList.length) {
      for (var i = 0; i < ignoreList.length; i++) {
        var element = ignoreList[i];

        if (typeof element.test === 'function') {
          if (element.test(transactionName)) {
            return true;
          }
        } else if (element === transactionName) {
          return true;
        }
      }
    }

    return false;
  };

  _proto.startSpan = function startSpan(name, type, options) {
    var tr = this.getCurrentTransaction();

    if (!tr) {
      tr = this.createCurrentTransaction(undefined, _common_constants__WEBPACK_IMPORTED_MODULE_1__.TEMPORARY_TYPE, this.createOptions({
        canReuse: true,
        managed: true
      }));
    }

    var span = tr.startSpan(name, type, options);

    if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
      this._logger.debug("startSpan(" + name + ", " + span.type + ")", "on transaction(" + tr.id + ", " + tr.name + ")");
    }

    return span;
  };

  _proto.endSpan = function endSpan(span, context) {
    if (!span) {
      return;
    }

    if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
      var tr = this.getCurrentTransaction();
      tr && this._logger.debug("endSpan(" + span.name + ", " + span.type + ")", "on transaction(" + tr.id + ", " + tr.name + ")");
    }

    span.end(null, context);
  };

  return TransactionService;
}();

/* harmony default export */ __webpack_exports__["default"] = (TransactionService);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/transaction.js":
/*!*****************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/transaction.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/performance-monitoring/span.js");
/* harmony import */ var _span_base__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./span-base */ "../rum-core/dist/es/performance-monitoring/span-base.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _breakdown__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./breakdown */ "../rum-core/dist/es/performance-monitoring/breakdown.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}







var Transaction = function (_SpanBase) {
  _inheritsLoose(Transaction, _SpanBase);

  function Transaction(name, type, options) {
    var _this;

    _this = _SpanBase.call(this, name, type, options) || this;
    _this.traceId = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.generateRandomId)();
    _this.marks = undefined;
    _this.spans = [];
    _this._activeSpans = {};
    _this._activeTasks = new Set();
    _this.blocked = false;
    _this.captureTimings = false;
    _this.breakdownTimings = [];
    _this.sampleRate = _this.options.transactionSampleRate;
    _this.sampled = Math.random() <= _this.sampleRate;
    return _this;
  }

  var _proto = Transaction.prototype;

  _proto.addMarks = function addMarks(obj) {
    this.marks = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.merge)(this.marks || {}, obj);
  };

  _proto.mark = function mark(key) {
    var skey = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.removeInvalidChars)(key);

    var markTime = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.now)() - this._start;

    var custom = {};
    custom[skey] = markTime;
    this.addMarks({
      custom: custom
    });
  };

  _proto.canReuse = function canReuse() {
    var threshold = this.options.reuseThreshold || _common_constants__WEBPACK_IMPORTED_MODULE_1__.REUSABILITY_THRESHOLD;
    return !!this.options.canReuse && !this.ended && (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.now)() - this._start < threshold;
  };

  _proto.redefine = function redefine(name, type, options) {
    if (name) {
      this.name = name;
    }

    if (type) {
      this.type = type;
    }

    if (options) {
      this.options.reuseThreshold = options.reuseThreshold;
      (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.extend)(this.options, options);
    }
  };

  _proto.startSpan = function startSpan(name, type, options) {
    var _this2 = this;

    if (this.ended) {
      return;
    }

    var opts = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.extend)({}, options);

    opts.onEnd = function (trc) {
      _this2._onSpanEnd(trc);
    };

    opts.traceId = this.traceId;
    opts.sampled = this.sampled;
    opts.sampleRate = this.sampleRate;

    if (!opts.parentId) {
      opts.parentId = this.id;
    }

    var span = new _span__WEBPACK_IMPORTED_MODULE_2__["default"](name, type, opts);
    this._activeSpans[span.id] = span;

    if (opts.blocking) {
      this.addTask(span.id);
    }

    return span;
  };

  _proto.isFinished = function isFinished() {
    return !this.blocked && this._activeTasks.size === 0;
  };

  _proto.detectFinish = function detectFinish() {
    if (this.isFinished()) this.end();
  };

  _proto.end = function end(endTime) {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this._end = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.getTime)(endTime);

    for (var sid in this._activeSpans) {
      var span = this._activeSpans[sid];
      span.type = span.type + _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRUNCATED_TYPE;
      span.end(endTime);
    }

    this.callOnEnd();
  };

  _proto.captureBreakdown = function captureBreakdown() {
    this.breakdownTimings = (0,_breakdown__WEBPACK_IMPORTED_MODULE_3__.captureBreakdown)(this);
  };

  _proto.block = function block(flag) {
    this.blocked = flag;

    if (!this.blocked) {
      this.detectFinish();
    }
  };

  _proto.addTask = function addTask(taskId) {
    if (!taskId) {
      taskId = 'task-' + (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.generateRandomId)(16);
    }

    this._activeTasks.add(taskId);

    return taskId;
  };

  _proto.removeTask = function removeTask(taskId) {
    var deleted = this._activeTasks.delete(taskId);

    deleted && this.detectFinish();
  };

  _proto.resetFields = function resetFields() {
    this.spans = [];
    this.sampleRate = 0;
  };

  _proto._onSpanEnd = function _onSpanEnd(span) {
    this.spans.push(span);
    delete this._activeSpans[span.id];
    this.removeTask(span.id);
  };

  _proto.isManaged = function isManaged() {
    return !!this.options.managed;
  };

  return Transaction;
}(_span_base__WEBPACK_IMPORTED_MODULE_4__["default"]);

/* harmony default export */ __webpack_exports__["default"] = (Transaction);

/***/ }),

/***/ "../rum-core/dist/es/state.js":
/*!************************************!*\
  !*** ../rum-core/dist/es/state.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __DEV__: function() { return /* binding */ __DEV__; },
/* harmony export */   state: function() { return /* binding */ state; }
/* harmony export */ });
var __DEV__ = "development" !== 'production';

var state = {
  bootstrapTime: null,
  lastHiddenStart: Number.MIN_SAFE_INTEGER
};


/***/ }),

/***/ "./src/apm-base.js":
/*!*************************!*\
  !*** ./src/apm-base.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ApmBase; }
/* harmony export */ });
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/instrument.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/observers/page-visibility.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/observers/page-clicks.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/performance-monitoring/metrics/inp/process.js");


var ApmBase = function () {
  function ApmBase(serviceFactory, disable) {
    this._disable = disable;
    this.serviceFactory = serviceFactory;
    this._initialized = false;
  }

  var _proto = ApmBase.prototype;

  _proto.isEnabled = function isEnabled() {
    return !this._disable;
  };

  _proto.isActive = function isActive() {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    return this.isEnabled() && this._initialized && configService.get('active');
  };

  _proto.init = function init(config) {
    var _this = this;

    if (this.isEnabled() && !this._initialized) {
      this._initialized = true;

      var _this$serviceFactory$ = this.serviceFactory.getService([_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE]),
          configService = _this$serviceFactory$[0],
          loggingService = _this$serviceFactory$[1],
          transactionService = _this$serviceFactory$[2];

      configService.setVersion('5.16.0');
      this.config(config);
      var logLevel = configService.get('logLevel');
      loggingService.setLevel(logLevel);
      var isConfigActive = configService.get('active');

      if (isConfigActive) {
        this.serviceFactory.init();
        var flags = (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__.getInstrumentationFlags)(configService.get('instrument'), configService.get('disableInstrumentations'));
        var performanceMonitoring = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PERFORMANCE_MONITORING);
        performanceMonitoring.init(flags);

        if (flags[_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.ERROR]) {
          var errorLogging = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.ERROR_LOGGING);
          errorLogging.registerListeners();
        }

        if (configService.get('session')) {
          var localConfig = configService.getLocalConfig();

          if (localConfig && localConfig.session) {
            configService.setConfig({
              session: localConfig.session
            });
          }
        }

        var sendPageLoad = function sendPageLoad() {
          return flags[_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD] && _this._sendPageLoadMetrics();
        };

        if (configService.get('centralConfig')) {
          this.fetchCentralConfig().then(sendPageLoad);
        } else {
          sendPageLoad();
        }

        (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__.observePageVisibility)(configService, transactionService);

        if (flags[_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.EVENT_TARGET] && flags[_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CLICK]) {
          (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_3__.observePageClicks)(transactionService);
        }

        (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_4__.observeUserInteractions)();
      } else {
        this._disable = true;
        loggingService.warn('RUM agent is inactive');
      }
    }

    return this;
  };

  _proto.fetchCentralConfig = function fetchCentralConfig() {
    var _this$serviceFactory$2 = this.serviceFactory.getService([_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.APM_SERVER, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE]),
        apmServer = _this$serviceFactory$2[0],
        loggingService = _this$serviceFactory$2[1],
        configService = _this$serviceFactory$2[2];

    return apmServer.fetchConfig(configService.get('serviceName'), configService.get('environment')).then(function (config) {
      var transactionSampleRate = config['transaction_sample_rate'];

      if (transactionSampleRate) {
        transactionSampleRate = Number(transactionSampleRate);
        var _config2 = {
          transactionSampleRate: transactionSampleRate
        };

        var _configService$valida = configService.validate(_config2),
            invalid = _configService$valida.invalid;

        if (invalid.length === 0) {
          configService.setConfig(_config2);
        } else {
          var _invalid$ = invalid[0],
              key = _invalid$.key,
              value = _invalid$.value,
              allowed = _invalid$.allowed;
          loggingService.warn("invalid value \"" + value + "\" for " + key + ". Allowed: " + allowed + ".");
        }
      }

      return config;
    }).catch(function (error) {
      loggingService.warn('failed fetching config:', error);
    });
  };

  _proto._sendPageLoadMetrics = function _sendPageLoadMetrics() {
    var tr = this.startTransaction(undefined, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD, {
      managed: true,
      canReuse: true
    });

    if (!tr) {
      return;
    }

    tr.addTask(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD);

    var sendPageLoadMetrics = function sendPageLoadMetrics() {
      setTimeout(function () {
        return tr.removeTask(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD);
      }, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD_DELAY);
    };

    if (document.readyState === 'complete') {
      sendPageLoadMetrics();
    } else {
      window.addEventListener('load', sendPageLoadMetrics);
    }
  };

  _proto.observe = function observe(name, fn) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.events.observe(name, fn);
  };

  _proto.config = function config(_config) {
    var _this$serviceFactory$3 = this.serviceFactory.getService([_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE]),
        configService = _this$serviceFactory$3[0],
        loggingService = _this$serviceFactory$3[1];

    var _configService$valida2 = configService.validate(_config),
        missing = _configService$valida2.missing,
        invalid = _configService$valida2.invalid,
        unknown = _configService$valida2.unknown;

    if (unknown.length > 0) {
      var message = 'Unknown config options are specified for RUM agent: ' + unknown.join(', ');
      loggingService.warn(message);
    }

    if (missing.length === 0 && invalid.length === 0) {
      configService.setConfig(_config);
    } else {
      var separator = ', ';
      var _message = "RUM agent isn't correctly configured. ";

      if (missing.length > 0) {
        _message += missing.join(separator) + ' is missing';

        if (invalid.length > 0) {
          _message += separator;
        }
      }

      invalid.forEach(function (_ref, index) {
        var key = _ref.key,
            value = _ref.value,
            allowed = _ref.allowed;
        _message += key + " \"" + value + "\" contains invalid characters! (allowed: " + allowed + ")" + (index !== invalid.length - 1 ? separator : '');
      });
      loggingService.error(_message);
      configService.setConfig({
        active: false
      });
    }
  };

  _proto.setUserContext = function setUserContext(userContext) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.setUserContext(userContext);
  };

  _proto.setCustomContext = function setCustomContext(customContext) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.setCustomContext(customContext);
  };

  _proto.addLabels = function addLabels(labels) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.addLabels(labels);
  };

  _proto.setInitialPageLoadName = function setInitialPageLoadName(name) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.setConfig({
      pageLoadTransactionName: name
    });
  };

  _proto.startTransaction = function startTransaction(name, type, options) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
      return transactionService.startTransaction(name, type, options);
    }
  };

  _proto.startSpan = function startSpan(name, type, options) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
      return transactionService.startSpan(name, type, options);
    }
  };

  _proto.getCurrentTransaction = function getCurrentTransaction() {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
      return transactionService.getCurrentTransaction();
    }
  };

  _proto.captureError = function captureError(error) {
    if (this.isEnabled()) {
      var errorLogging = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.ERROR_LOGGING);
      return errorLogging.logError(error);
    }
  };

  _proto.addFilter = function addFilter(fn) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.addFilter(fn);
  };

  return ApmBase;
}();



/***/ }),

/***/ "../../node_modules/error-stack-parser/error-stack-parser.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/error-stack-parser/error-stack-parser.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! stackframe */ "../../node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    function _map(array, fn, thisArg) {
        if (typeof Array.prototype.map === 'function') {
            return array.map(fn, thisArg);
        } else {
            var output = new Array(array.length);
            for (var i = 0; i < array.length; i++) {
                output[i] = fn.call(thisArg, array[i]);
            }
            return output;
        }
    }

    function _filter(array, fn, thisArg) {
        if (typeof Array.prototype.filter === 'function') {
            return array.filter(fn, thisArg);
        } else {
            var output = [];
            for (var i = 0; i < array.length; i++) {
                if (fn.call(thisArg, array[i])) {
                    output.push(array[i]);
                }
            }
            return output;
        }
    }

    function _indexOf(array, target) {
        if (typeof Array.prototype.indexOf === 'function') {
            return array.indexOf(target);
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === target) {
                    return i;
                }
            }
            return -1;
        }
    }

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return _map(filtered, function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = _indexOf(['eval', '<anonymous>'], locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame(functionName, undefined, fileName, locationParts[1], locationParts[2], line);
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return _map(filtered, function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame(line);
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;
                    return new StackFrame(functionName,
                        undefined,
                        locationParts[0],
                        locationParts[1],
                        locationParts[2],
                        line);
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame(
                            match[3] || undefined,
                            undefined,
                            match[2],
                            match[1],
                            undefined,
                            lines[i]
                        )
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return _map(filtered, function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');
                return new StackFrame(
                    functionName,
                    args,
                    locationParts[0],
                    locationParts[1],
                    locationParts[2],
                    line);
            }, this);
        }
    };
}));



/***/ }),

/***/ "../../node_modules/opentracing/lib/constants.js":
/*!*******************************************************!*\
  !*** ../../node_modules/opentracing/lib/constants.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * The FORMAT_BINARY format represents SpanContexts in an opaque binary
 * carrier.
 *
 * Tracer.inject() will set the buffer field to an Array-like (Array,
 * ArrayBuffer, or TypedBuffer) object containing the injected binary data.
 * Any valid Object can be used as long as the buffer field of the object
 * can be set.
 *
 * Tracer.extract() will look for `carrier.buffer`, and that field is
 * expected to be an Array-like object (Array, ArrayBuffer, or
 * TypedBuffer).
 */
exports.FORMAT_BINARY = 'binary';
/**
 * The FORMAT_TEXT_MAP format represents SpanContexts using a
 * string->string map (backed by a Javascript Object) as a carrier.
 *
 * NOTE: Unlike FORMAT_HTTP_HEADERS, FORMAT_TEXT_MAP places no restrictions
 * on the characters used in either the keys or the values of the map
 * entries.
 *
 * The FORMAT_TEXT_MAP carrier map may contain unrelated data (e.g.,
 * arbitrary gRPC metadata); as such, the Tracer implementation should use
 * a prefix or other convention to distinguish Tracer-specific key:value
 * pairs.
 */
exports.FORMAT_TEXT_MAP = 'text_map';
/**
 * The FORMAT_HTTP_HEADERS format represents SpanContexts using a
 * character-restricted string->string map (backed by a Javascript Object)
 * as a carrier.
 *
 * Keys and values in the FORMAT_HTTP_HEADERS carrier must be suitable for
 * use as HTTP headers (without modification or further escaping). That is,
 * the keys have a greatly restricted character set, casing for the keys
 * may not be preserved by various intermediaries, and the values should be
 * URL-escaped.
 *
 * The FORMAT_HTTP_HEADERS carrier map may contain unrelated data (e.g.,
 * arbitrary HTTP headers); as such, the Tracer implementation should use a
 * prefix or other convention to distinguish Tracer-specific key:value
 * pairs.
 */
exports.FORMAT_HTTP_HEADERS = 'http_headers';
/**
 * A Span may be the "child of" a parent Span. In a “child of” reference,
 * the parent Span depends on the child Span in some capacity.
 *
 * See more about reference types at https://github.com/opentracing/specification
 */
exports.REFERENCE_CHILD_OF = 'child_of';
/**
 * Some parent Spans do not depend in any way on the result of their child
 * Spans. In these cases, we say merely that the child Span “follows from”
 * the parent Span in a causal sense.
 *
 * See more about reference types at https://github.com/opentracing/specification
 */
exports.REFERENCE_FOLLOWS_FROM = 'follows_from';
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/functions.js":
/*!*******************************************************!*\
  !*** ../../node_modules/opentracing/lib/functions.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Constants = __webpack_require__(/*! ./constants */ "../../node_modules/opentracing/lib/constants.js");
var reference_1 = __webpack_require__(/*! ./reference */ "../../node_modules/opentracing/lib/reference.js");
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
/**
 * Return a new REFERENCE_CHILD_OF reference.
 *
 * @param {SpanContext} spanContext - the parent SpanContext instance to
 *        reference.
 * @return a REFERENCE_CHILD_OF reference pointing to `spanContext`
 */
function childOf(spanContext) {
    // Allow the user to pass a Span instead of a SpanContext
    if (spanContext instanceof span_1.default) {
        spanContext = spanContext.context();
    }
    return new reference_1.default(Constants.REFERENCE_CHILD_OF, spanContext);
}
exports.childOf = childOf;
/**
 * Return a new REFERENCE_FOLLOWS_FROM reference.
 *
 * @param {SpanContext} spanContext - the parent SpanContext instance to
 *        reference.
 * @return a REFERENCE_FOLLOWS_FROM reference pointing to `spanContext`
 */
function followsFrom(spanContext) {
    // Allow the user to pass a Span instead of a SpanContext
    if (spanContext instanceof span_1.default) {
        spanContext = spanContext.context();
    }
    return new reference_1.default(Constants.REFERENCE_FOLLOWS_FROM, spanContext);
}
exports.followsFrom = followsFrom;
//# sourceMappingURL=functions.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/noop.js":
/*!**************************************************!*\
  !*** ../../node_modules/opentracing/lib/noop.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
var span_context_1 = __webpack_require__(/*! ./span_context */ "../../node_modules/opentracing/lib/span_context.js");
var tracer_1 = __webpack_require__(/*! ./tracer */ "../../node_modules/opentracing/lib/tracer.js");
exports.tracer = null;
exports.spanContext = null;
exports.span = null;
// Deferred initialization to avoid a dependency cycle where Tracer depends on
// Span which depends on the noop tracer.
function initialize() {
    exports.tracer = new tracer_1.default();
    exports.span = new span_1.default();
    exports.spanContext = new span_context_1.default();
}
exports.initialize = initialize;
//# sourceMappingURL=noop.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/reference.js":
/*!*******************************************************!*\
  !*** ../../node_modules/opentracing/lib/reference.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
/**
 * Reference pairs a reference type constant (e.g., REFERENCE_CHILD_OF or
 * REFERENCE_FOLLOWS_FROM) with the SpanContext it points to.
 *
 * See the exported childOf() and followsFrom() functions at the package level.
 */
var Reference = /** @class */ (function () {
    /**
     * Initialize a new Reference instance.
     *
     * @param {string} type - the Reference type constant (e.g.,
     *        REFERENCE_CHILD_OF or REFERENCE_FOLLOWS_FROM).
     * @param {SpanContext} referencedContext - the SpanContext being referred
     *        to. As a convenience, a Span instance may be passed in instead
     *        (in which case its .context() is used here).
     */
    function Reference(type, referencedContext) {
        this._type = type;
        this._referencedContext = (referencedContext instanceof span_1.default ?
            referencedContext.context() :
            referencedContext);
    }
    /**
     * @return {string} The Reference type (e.g., REFERENCE_CHILD_OF or
     *         REFERENCE_FOLLOWS_FROM).
     */
    Reference.prototype.type = function () {
        return this._type;
    };
    /**
     * @return {SpanContext} The SpanContext being referred to (e.g., the
     *         parent in a REFERENCE_CHILD_OF Reference).
     */
    Reference.prototype.referencedContext = function () {
        return this._referencedContext;
    };
    return Reference;
}());
exports["default"] = Reference;
//# sourceMappingURL=reference.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/span.js":
/*!**************************************************!*\
  !*** ../../node_modules/opentracing/lib/span.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var noop = __webpack_require__(/*! ./noop */ "../../node_modules/opentracing/lib/noop.js");
/**
 * Span represents a logical unit of work as part of a broader Trace. Examples
 * of span might include remote procedure calls or a in-process function calls
 * to sub-components. A Trace has a single, top-level "root" Span that in turn
 * may have zero or more child Spans, which in turn may have children.
 */
var Span = /** @class */ (function () {
    function Span() {
    }
    // ---------------------------------------------------------------------- //
    // OpenTracing API methods
    // ---------------------------------------------------------------------- //
    /**
     * Returns the SpanContext object associated with this Span.
     *
     * @return {SpanContext}
     */
    Span.prototype.context = function () {
        return this._context();
    };
    /**
     * Returns the Tracer object used to create this Span.
     *
     * @return {Tracer}
     */
    Span.prototype.tracer = function () {
        return this._tracer();
    };
    /**
     * Sets the string name for the logical operation this span represents.
     *
     * @param {string} name
     */
    Span.prototype.setOperationName = function (name) {
        this._setOperationName(name);
        return this;
    };
    /**
     * Sets a key:value pair on this Span that also propagates to future
     * children of the associated Span.
     *
     * setBaggageItem() enables powerful functionality given a full-stack
     * opentracing integration (e.g., arbitrary application data from a web
     * client can make it, transparently, all the way into the depths of a
     * storage system), and with it some powerful costs: use this feature with
     * care.
     *
     * IMPORTANT NOTE #1: setBaggageItem() will only propagate baggage items to
     * *future* causal descendants of the associated Span.
     *
     * IMPORTANT NOTE #2: Use this thoughtfully and with care. Every key and
     * value is copied into every local *and remote* child of the associated
     * Span, and that can add up to a lot of network and cpu overhead.
     *
     * @param {string} key
     * @param {string} value
     */
    Span.prototype.setBaggageItem = function (key, value) {
        this._setBaggageItem(key, value);
        return this;
    };
    /**
     * Returns the value for a baggage item given its key.
     *
     * @param  {string} key
     *         The key for the given trace attribute.
     * @return {string}
     *         String value for the given key, or undefined if the key does not
     *         correspond to a set trace attribute.
     */
    Span.prototype.getBaggageItem = function (key) {
        return this._getBaggageItem(key);
    };
    /**
     * Adds a single tag to the span.  See `addTags()` for details.
     *
     * @param {string} key
     * @param {any} value
     */
    Span.prototype.setTag = function (key, value) {
        // NOTE: the call is normalized to a call to _addTags()
        this._addTags((_a = {}, _a[key] = value, _a));
        return this;
        var _a;
    };
    /**
     * Adds the given key value pairs to the set of span tags.
     *
     * Multiple calls to addTags() results in the tags being the superset of
     * all calls.
     *
     * The behavior of setting the same key multiple times on the same span
     * is undefined.
     *
     * The supported type of the values is implementation-dependent.
     * Implementations are expected to safely handle all types of values but
     * may choose to ignore unrecognized / unhandle-able values (e.g. objects
     * with cyclic references, function objects).
     *
     * @return {[type]} [description]
     */
    Span.prototype.addTags = function (keyValueMap) {
        this._addTags(keyValueMap);
        return this;
    };
    /**
     * Add a log record to this Span, optionally at a user-provided timestamp.
     *
     * For example:
     *
     *     span.log({
     *         size: rpc.size(),  // numeric value
     *         URI: rpc.URI(),  // string value
     *         payload: rpc.payload(),  // Object value
     *         "keys can be arbitrary strings": rpc.foo(),
     *     });
     *
     *     span.log({
     *         "error.description": someError.description(),
     *     }, someError.timestampMillis());
     *
     * @param {object} keyValuePairs
     *        An object mapping string keys to arbitrary value types. All
     *        Tracer implementations should support bool, string, and numeric
     *        value types, and some may also support Object values.
     * @param {number} timestamp
     *        An optional parameter specifying the timestamp in milliseconds
     *        since the Unix epoch. Fractional values are allowed so that
     *        timestamps with sub-millisecond accuracy can be represented. If
     *        not specified, the implementation is expected to use its notion
     *        of the current time of the call.
     */
    Span.prototype.log = function (keyValuePairs, timestamp) {
        this._log(keyValuePairs, timestamp);
        return this;
    };
    /**
     * DEPRECATED
     */
    Span.prototype.logEvent = function (eventName, payload) {
        return this._log({ event: eventName, payload: payload });
    };
    /**
     * Sets the end timestamp and finalizes Span state.
     *
     * With the exception of calls to Span.context() (which are always allowed),
     * finish() must be the last call made to any span instance, and to do
     * otherwise leads to undefined behavior.
     *
     * @param  {number} finishTime
     *         Optional finish time in milliseconds as a Unix timestamp. Decimal
     *         values are supported for timestamps with sub-millisecond accuracy.
     *         If not specified, the current time (as defined by the
     *         implementation) will be used.
     */
    Span.prototype.finish = function (finishTime) {
        this._finish(finishTime);
        // Do not return `this`. The Span generally should not be used after it
        // is finished so chaining is not desired in this context.
    };
    // ---------------------------------------------------------------------- //
    // Derived classes can choose to implement the below
    // ---------------------------------------------------------------------- //
    // By default returns a no-op SpanContext.
    Span.prototype._context = function () {
        return noop.spanContext;
    };
    // By default returns a no-op tracer.
    //
    // The base class could store the tracer that created it, but it does not
    // in order to ensure the no-op span implementation has zero members,
    // which allows V8 to aggressively optimize calls to such objects.
    Span.prototype._tracer = function () {
        return noop.tracer;
    };
    // By default does nothing
    Span.prototype._setOperationName = function (name) {
    };
    // By default does nothing
    Span.prototype._setBaggageItem = function (key, value) {
    };
    // By default does nothing
    Span.prototype._getBaggageItem = function (key) {
        return undefined;
    };
    // By default does nothing
    //
    // NOTE: both setTag() and addTags() map to this function. keyValuePairs
    // will always be an associative array.
    Span.prototype._addTags = function (keyValuePairs) {
    };
    // By default does nothing
    Span.prototype._log = function (keyValuePairs, timestamp) {
    };
    // By default does nothing
    //
    // finishTime is expected to be either a number or undefined.
    Span.prototype._finish = function (finishTime) {
    };
    return Span;
}());
exports.Span = Span;
exports["default"] = Span;
//# sourceMappingURL=span.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/span_context.js":
/*!**********************************************************!*\
  !*** ../../node_modules/opentracing/lib/span_context.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * SpanContext represents Span state that must propagate to descendant Spans
 * and across process boundaries.
 *
 * SpanContext is logically divided into two pieces: the user-level "Baggage"
 * (see setBaggageItem and getBaggageItem) that propagates across Span
 * boundaries and any Tracer-implementation-specific fields that are needed to
 * identify or otherwise contextualize the associated Span instance (e.g., a
 * <trace_id, span_id, sampled> tuple).
 */
var SpanContext = /** @class */ (function () {
    function SpanContext() {
    }
    return SpanContext;
}());
exports.SpanContext = SpanContext;
exports["default"] = SpanContext;
//# sourceMappingURL=span_context.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/tracer.js":
/*!****************************************************!*\
  !*** ../../node_modules/opentracing/lib/tracer.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Functions = __webpack_require__(/*! ./functions */ "../../node_modules/opentracing/lib/functions.js");
var Noop = __webpack_require__(/*! ./noop */ "../../node_modules/opentracing/lib/noop.js");
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
/**
 * Tracer is the entry-point between the instrumentation API and the tracing
 * implementation.
 *
 * The default object acts as a no-op implementation.
 *
 * Note to implementators: derived classes can choose to directly implement the
 * methods in the "OpenTracing API methods" section, or optionally the subset of
 * underscore-prefixed methods to pick up the argument checking and handling
 * automatically from the base class.
 */
var Tracer = /** @class */ (function () {
    function Tracer() {
    }
    // ---------------------------------------------------------------------- //
    // OpenTracing API methods
    // ---------------------------------------------------------------------- //
    /**
     * Starts and returns a new Span representing a logical unit of work.
     *
     * For example:
     *
     *     // Start a new (parentless) root Span:
     *     var parent = Tracer.startSpan('DoWork');
     *
     *     // Start a new (child) Span:
     *     var child = Tracer.startSpan('load-from-db', {
     *         childOf: parent.context(),
     *     });
     *
     *     // Start a new async (FollowsFrom) Span:
     *     var child = Tracer.startSpan('async-cache-write', {
     *         references: [
     *             opentracing.followsFrom(parent.context())
     *         ],
     *     });
     *
     * @param {string} name - the name of the operation (REQUIRED).
     * @param {SpanOptions} [options] - options for the newly created span.
     * @return {Span} - a new Span object.
     */
    Tracer.prototype.startSpan = function (name, options) {
        if (options === void 0) { options = {}; }
        // Convert options.childOf to fields.references as needed.
        if (options.childOf) {
            // Convert from a Span or a SpanContext into a Reference.
            var childOf = Functions.childOf(options.childOf);
            if (options.references) {
                options.references.push(childOf);
            }
            else {
                options.references = [childOf];
            }
            delete (options.childOf);
        }
        return this._startSpan(name, options);
    };
    /**
     * Injects the given SpanContext instance for cross-process propagation
     * within `carrier`. The expected type of `carrier` depends on the value of
     * `format.
     *
     * OpenTracing defines a common set of `format` values (see
     * FORMAT_TEXT_MAP, FORMAT_HTTP_HEADERS, and FORMAT_BINARY), and each has
     * an expected carrier type.
     *
     * Consider this pseudocode example:
     *
     *     var clientSpan = ...;
     *     ...
     *     // Inject clientSpan into a text carrier.
     *     var headersCarrier = {};
     *     Tracer.inject(clientSpan.context(), Tracer.FORMAT_HTTP_HEADERS, headersCarrier);
     *     // Incorporate the textCarrier into the outbound HTTP request header
     *     // map.
     *     Object.assign(outboundHTTPReq.headers, headersCarrier);
     *     // ... send the httpReq
     *
     * @param  {SpanContext} spanContext - the SpanContext to inject into the
     *         carrier object. As a convenience, a Span instance may be passed
     *         in instead (in which case its .context() is used for the
     *         inject()).
     * @param  {string} format - the format of the carrier.
     * @param  {any} carrier - see the documentation for the chosen `format`
     *         for a description of the carrier object.
     */
    Tracer.prototype.inject = function (spanContext, format, carrier) {
        // Allow the user to pass a Span instead of a SpanContext
        if (spanContext instanceof span_1.default) {
            spanContext = spanContext.context();
        }
        return this._inject(spanContext, format, carrier);
    };
    /**
     * Returns a SpanContext instance extracted from `carrier` in the given
     * `format`.
     *
     * OpenTracing defines a common set of `format` values (see
     * FORMAT_TEXT_MAP, FORMAT_HTTP_HEADERS, and FORMAT_BINARY), and each has
     * an expected carrier type.
     *
     * Consider this pseudocode example:
     *
     *     // Use the inbound HTTP request's headers as a text map carrier.
     *     var headersCarrier = inboundHTTPReq.headers;
     *     var wireCtx = Tracer.extract(Tracer.FORMAT_HTTP_HEADERS, headersCarrier);
     *     var serverSpan = Tracer.startSpan('...', { childOf : wireCtx });
     *
     * @param  {string} format - the format of the carrier.
     * @param  {any} carrier - the type of the carrier object is determined by
     *         the format.
     * @return {SpanContext}
     *         The extracted SpanContext, or null if no such SpanContext could
     *         be found in `carrier`
     */
    Tracer.prototype.extract = function (format, carrier) {
        return this._extract(format, carrier);
    };
    // ---------------------------------------------------------------------- //
    // Derived classes can choose to implement the below
    // ---------------------------------------------------------------------- //
    // NOTE: the input to this method is *always* an associative array. The
    // public-facing startSpan() method normalizes the arguments so that
    // all N implementations do not need to worry about variations in the call
    // signature.
    //
    // The default behavior returns a no-op span.
    Tracer.prototype._startSpan = function (name, fields) {
        return Noop.span;
    };
    // The default behavior is a no-op.
    Tracer.prototype._inject = function (spanContext, format, carrier) {
    };
    // The default behavior is to return a no-op SpanContext.
    Tracer.prototype._extract = function (format, carrier) {
        return Noop.spanContext;
    };
    return Tracer;
}());
exports.Tracer = Tracer;
exports["default"] = Tracer;
//# sourceMappingURL=tracer.js.map

/***/ }),

/***/ "../../node_modules/promise-polyfill/src/finally.js":
/*!**********************************************************!*\
  !*** ../../node_modules/promise-polyfill/src/finally.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        // @ts-ignore
        return constructor.reject(reason);
      });
    }
  );
}

/* harmony default export */ __webpack_exports__["default"] = (finallyConstructor);


/***/ }),

/***/ "../../node_modules/promise-polyfill/src/index.js":
/*!********************************************************!*\
  !*** ../../node_modules/promise-polyfill/src/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _finally__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./finally */ "../../node_modules/promise-polyfill/src/finally.js");


// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined');
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = _finally__WEBPACK_IMPORTED_MODULE_0__["default"];

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediate === 'function' &&
    function(fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

/* harmony default export */ __webpack_exports__["default"] = (Promise);


/***/ }),

/***/ "../../node_modules/stackframe/stackframe.js":
/*!***************************************************!*\
  !*** ../../node_modules/stackframe/stackframe.js ***!
  \***************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function StackFrame(functionName, args, fileName, lineNumber, columnNumber, source) {
        if (functionName !== undefined) {
            this.setFunctionName(functionName);
        }
        if (args !== undefined) {
            this.setArgs(args);
        }
        if (fileName !== undefined) {
            this.setFileName(fileName);
        }
        if (lineNumber !== undefined) {
            this.setLineNumber(lineNumber);
        }
        if (columnNumber !== undefined) {
            this.setColumnNumber(columnNumber);
        }
        if (source !== undefined) {
            this.setSource(source);
        }
    }

    StackFrame.prototype = {
        getFunctionName: function () {
            return this.functionName;
        },
        setFunctionName: function (v) {
            this.functionName = String(v);
        },

        getArgs: function () {
            return this.args;
        },
        setArgs: function (v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        // NOTE: Property name may be misleading as it includes the path,
        // but it somewhat mirrors V8's JavaScriptStackTraceApi
        // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi and Gecko's
        // http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIException.idl#14
        getFileName: function () {
            return this.fileName;
        },
        setFileName: function (v) {
            this.fileName = String(v);
        },

        getLineNumber: function () {
            return this.lineNumber;
        },
        setLineNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Line Number must be a Number');
            }
            this.lineNumber = Number(v);
        },

        getColumnNumber: function () {
            return this.columnNumber;
        },
        setColumnNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Column Number must be a Number');
            }
            this.columnNumber = Number(v);
        },

        getSource: function () {
            return this.source;
        },
        setSource: function (v) {
            this.source = String(v);
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    return StackFrame;
}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApmBase: function() { return /* reexport safe */ _apm_base__WEBPACK_IMPORTED_MODULE_0__["default"]; },
/* harmony export */   apm: function() { return /* binding */ apmBase; },
/* harmony export */   apmBase: function() { return /* binding */ apmBase; },
/* harmony export */   init: function() { return /* binding */ init; }
/* harmony export */ });
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/bootstrap.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/index.js");
/* harmony import */ var _apm_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./apm-base */ "./src/apm-base.js");



function getApmBase() {
  if (_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__.isBrowser && window.elasticApm) {
    return window.elasticApm;
  }

  var enabled = (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__.bootstrap)();
  var serviceFactory = (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_3__.createServiceFactory)();
  var apmBase = new _apm_base__WEBPACK_IMPORTED_MODULE_0__["default"](serviceFactory, !enabled);

  if (_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__.isBrowser) {
    window.elasticApm = apmBase;
  }

  return apmBase;
}

var apmBase = getApmBase();
var init = apmBase.init.bind(apmBase);
/* harmony default export */ __webpack_exports__["default"] = (init);

}();
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxhc3RpYy1hcG0tcnVtLnVtZC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBREE7O0FBSUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7O0FBSUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBT0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTs7QUFFQTtBQUNBOztBQUVBO0FBQUE7O0FBR0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUFBOztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFEQTtBQUdBO0FBVkE7QUFZQTtBQWJBO0FBZUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUFBOztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFBQTs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcFdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBOztBQUVBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUlBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFQQTtBQVNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQUE7QUFFQTtBQUFBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFEQTtBQUdBO0FBVkE7QUFZQTtBQWJBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUkE7O0FBV0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQWZBOztBQWtCQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFNQTs7QUFFQTtBQUNBO0FBQUE7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFSQTtBQVVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBSkE7QUFKQTtBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUFBO0FBQUE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzFVQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE5QkE7QUFnQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQUE7QUFBQTtBQUFBOztBQUtBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQUE7QUFBQTs7QUFJQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6REE7O0FBRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7O0FBRUE7QUFDQTtBQUNBO0FBREE7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBUEE7QUFTQTs7QUFFQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBTEE7QUFPQTs7QUFFQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUxBO0FBT0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBWEE7O0FBY0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUlBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDM0tBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuREE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU9BOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBOztBQU1BO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFBQTs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDaEJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FDM0RBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7O0FBTUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBS0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBSkE7QUFXQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUZBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQUpBOztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQzdGQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckRBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQUE7QUFBQTs7QUFJQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQUE7QUFBQTs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQU5BO0FBUUE7QUFDQTtBQURBO0FBVEE7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBYkE7QUFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVRBO0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFUQTtBQVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFEQTtBQUdBO0FBWkE7O0FBZUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkpBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFMQTs7QUFRQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUlBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcFhBOztBQUVBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUFBO0FBQUE7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQVJBOztBQVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUpBO0FBU0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQURBOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxTUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTs7QUFLQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2JBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBOztBQUVBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1BO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakJBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNWQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFFQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFEQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzRkE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBREE7O0FBSUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQVhBO0FBYUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBWEE7O0FBY0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzSEE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQURBO0FBR0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7O0FBSUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQUE7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUhBO0FBUUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFHQTtBQUNBO0FBQ0E7QUFGQTs7QUFLQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBSkE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFJQTtBQUFBO0FBQUE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQU5BO0FBUUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFJQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQU1BO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQURBO0FBS0E7O0FBRUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUJBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBYkE7QUFtQkE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBO0FBQ0E7QUFDQTtBQUZBOztBQUtBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQURBO0FBR0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFJQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7O0FBS0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTs7QUFLQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQURBO0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkRBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUZBO0FBUUE7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1BO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUlBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMURBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFCQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFEQTtBQUdBOztBQUVBO0FBQ0E7QUFEQTs7QUFJQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUFBO0FBQUE7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWRBO0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFqQkE7QUFtQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQy9WQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7O0FDdkZBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUVBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBRkE7QUFBQTtBQUFBOztBQU9BOztBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBTUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7O0FBS0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQURBOztBQVFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3BaQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFFQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7O0FDMUtBOztBQUVBO0FBQ0E7QUFDQTtBQUZBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN1QkE7O0FBa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUFBOztBQUNBO0FBQ0E7O0FBQ0E7QUFBQTtBQUFBO0FBQUE7O0FBWUE7QUFDQTtBQUlBO0FBQ0E7QUFJQTs7QUFDQTtBQUNBO0FBRUE7QUFLQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBOztBQUVBO0FBQUE7QUFBQTs7QUFHQTtBQUlBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUNBO0FBQ0E7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTs7QUFPQTtBQUNBO0FBQUE7QUFBQTtBQUFBOztBQVVBO0FBTUE7O0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFDQTtBQUFBOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFHQTtBQUNBOztBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFLQTtBQUNBO0FBQ0E7QUFGQTs7QUFLQTtBQUNBO0FBQ0E7O0FBRUE7O0FBQ0E7QUFPQTtBQUFBO0FBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBaUJBO0FBQ0E7QUFBQTtBQUFBOztBQUlBO0FBQUE7QUFBQTtBQUFBOztBQUNBO0FBQ0E7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDeFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDUEE7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNtQkE7QUFLQTs7QUFNQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFFQTtBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2Jvb3RzdHJhcC5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2FmdGVyLWZyYW1lLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vYXBtLXNlcnZlci5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2NvbXByZXNzLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vY29uZmlnLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9jb250ZXh0LmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vZXZlbnQtaGFuZGxlci5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2h0dHAvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9odHRwL3Jlc3BvbnNlLXN0YXR1cy5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2h0dHAveGhyLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vaW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2xvZ2dpbmctc2VydmljZS5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL25kanNvbi5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL29ic2VydmVycy9wYWdlLWNsaWNrcy5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL29ic2VydmVycy9wYWdlLXZpc2liaWxpdHkuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9wYXRjaGluZy9mZXRjaC1wYXRjaC5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3BhdGNoaW5nL2hpc3RvcnktcGF0Y2guanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9wYXRjaGluZy9pbmRleC5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3BhdGNoaW5nL3BhdGNoLXV0aWxzLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcGF0Y2hpbmcveGhyLXBhdGNoLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcG9seWZpbGxzLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcXVldWUuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9zZXJ2aWNlLWZhY3RvcnkuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi90aHJvdHRsZS5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3RydW5jYXRlLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vdXJsLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vdXRpbHMuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL2Vycm9yLWxvZ2dpbmcvZXJyb3ItbG9nZ2luZy5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvZXJyb3ItbG9nZ2luZy9pbmRleC5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvZXJyb3ItbG9nZ2luZy9zdGFjay10cmFjZS5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL29wZW50cmFjaW5nL2luZGV4LmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9vcGVudHJhY2luZy9zcGFuLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9vcGVudHJhY2luZy90cmFjZXIuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvYnJlYWtkb3duLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL2luZGV4LmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL21ldHJpY3MvaW5wL3Byb2Nlc3MuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvbWV0cmljcy9pbnAvcmVwb3J0LmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL21ldHJpY3MvbWV0cmljcy5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9uYXZpZ2F0aW9uL2NhcHR1cmUtbmF2aWdhdGlvbi5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9uYXZpZ2F0aW9uL21hcmtzLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL25hdmlnYXRpb24vbmF2aWdhdGlvbi10aW1pbmcuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvbmF2aWdhdGlvbi9yZXNvdXJjZS10aW1pbmcuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvbmF2aWdhdGlvbi91c2VyLXRpbWluZy5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9uYXZpZ2F0aW9uL3V0aWxzLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3Jpbmcvc3Bhbi1iYXNlLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL3NwYW4uanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvdHJhbnNhY3Rpb24tc2VydmljZS5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy90cmFuc2FjdGlvbi5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uL3J1bS1jb3JlL2Rpc3QvZXMvc3RhdGUuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uL3NyYy9hcG0tYmFzZS5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uLy4uL25vZGVfbW9kdWxlcy9lcnJvci1zdGFjay1wYXJzZXIvZXJyb3Itc3RhY2stcGFyc2VyLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vLi4vbm9kZV9tb2R1bGVzL29wZW50cmFjaW5nL2xpYi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi8uLi9ub2RlX21vZHVsZXMvb3BlbnRyYWNpbmcvbGliL2Z1bmN0aW9ucy5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uLy4uL25vZGVfbW9kdWxlcy9vcGVudHJhY2luZy9saWIvbm9vcC5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uLy4uL25vZGVfbW9kdWxlcy9vcGVudHJhY2luZy9saWIvcmVmZXJlbmNlLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vLi4vbm9kZV9tb2R1bGVzL29wZW50cmFjaW5nL2xpYi9zcGFuLmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vLi4vbm9kZV9tb2R1bGVzL29wZW50cmFjaW5nL2xpYi9zcGFuX2NvbnRleHQuanMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS8uLi8uLi9ub2RlX21vZHVsZXMvb3BlbnRyYWNpbmcvbGliL3RyYWNlci5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9taXNlLXBvbHlmaWxsL3NyYy9maW5hbGx5LmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvc3JjL2luZGV4LmpzIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vLi4vLi4vbm9kZV9tb2R1bGVzL3N0YWNrZnJhbWUvc3RhY2tmcmFtZS5qcyIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vQGVsYXN0aWMvYXBtLXJ1bS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BlbGFzdGljL2FwbS1ydW0vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9AZWxhc3RpYy9hcG0tcnVtLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImVsYXN0aWMtYXBtLXJ1bVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJlbGFzdGljLWFwbS1ydW1cIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCJpbXBvcnQgeyBpc1BsYXRmb3JtU3VwcG9ydGVkLCBpc0Jyb3dzZXIsIG5vdyB9IGZyb20gJy4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IHBhdGNoQWxsIH0gZnJvbSAnLi9jb21tb24vcGF0Y2hpbmcnO1xuaW1wb3J0IHsgc3RhdGUgfSBmcm9tICcuL3N0YXRlJztcbnZhciBlbmFibGVkID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gYm9vdHN0cmFwKCkge1xuICBpZiAoaXNQbGF0Zm9ybVN1cHBvcnRlZCgpKSB7XG4gICAgcGF0Y2hBbGwoKTtcbiAgICBzdGF0ZS5ib290c3RyYXBUaW1lID0gbm93KCk7XG4gICAgZW5hYmxlZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoaXNCcm93c2VyKSB7XG4gICAgY29uc29sZS5sb2coJ1tFbGFzdGljIEFQTV0gcGxhdGZvcm0gaXMgbm90IHN1cHBvcnRlZCEnKTtcbiAgfVxuXG4gIHJldHVybiBlbmFibGVkO1xufSIsInZhciBSQUZfVElNRU9VVCA9IDEwMDtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFmdGVyRnJhbWUoY2FsbGJhY2spIHtcbiAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZShyYWYpO1xuICAgIHNldFRpbWVvdXQoY2FsbGJhY2spO1xuICB9O1xuXG4gIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChoYW5kbGVyLCBSQUZfVElNRU9VVCk7XG4gIHZhciByYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaGFuZGxlcik7XG59IiwiaW1wb3J0IFF1ZXVlIGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IHRocm90dGxlIGZyb20gJy4vdGhyb3R0bGUnO1xuaW1wb3J0IE5ESlNPTiBmcm9tICcuL25kanNvbic7XG5pbXBvcnQgeyB0cnVuY2F0ZU1vZGVsLCBNRVRBREFUQV9NT0RFTCB9IGZyb20gJy4vdHJ1bmNhdGUnO1xuaW1wb3J0IHsgRVJST1JTLCBIVFRQX1JFUVVFU1RfVElNRU9VVCwgUVVFVUVfRkxVU0gsIFRSQU5TQUNUSU9OUyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuL3BvbHlmaWxscyc7XG5pbXBvcnQgeyBjb21wcmVzc01ldGFkYXRhLCBjb21wcmVzc1RyYW5zYWN0aW9uLCBjb21wcmVzc0Vycm9yLCBjb21wcmVzc1BheWxvYWQgfSBmcm9tICcuL2NvbXByZXNzJztcbmltcG9ydCB7IF9fREVWX18gfSBmcm9tICcuLi9zdGF0ZSc7XG5pbXBvcnQgeyBzZW5kRmV0Y2hSZXF1ZXN0LCBzaG91bGRVc2VGZXRjaFdpdGhLZWVwQWxpdmUgfSBmcm9tICcuL2h0dHAvZmV0Y2gnO1xuaW1wb3J0IHsgc2VuZFhIUiB9IGZyb20gJy4vaHR0cC94aHInO1xudmFyIFRIUk9UVExFX0lOVEVSVkFMID0gNjAwMDA7XG5cbnZhciBBcG1TZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEFwbVNlcnZlcihjb25maWdTZXJ2aWNlLCBsb2dnaW5nU2VydmljZSkge1xuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2UgPSBjb25maWdTZXJ2aWNlO1xuICAgIHRoaXMuX2xvZ2dpbmdTZXJ2aWNlID0gbG9nZ2luZ1NlcnZpY2U7XG4gICAgdGhpcy5xdWV1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRocm90dGxlRXZlbnRzID0gbm9vcDtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBBcG1TZXJ2ZXIucHJvdG90eXBlO1xuXG4gIF9wcm90by5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIHF1ZXVlTGltaXQgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgncXVldWVMaW1pdCcpO1xuXG4gICAgdmFyIGZsdXNoSW50ZXJ2YWwgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnZmx1c2hJbnRlcnZhbCcpO1xuXG4gICAgdmFyIGxpbWl0ID0gdGhpcy5fY29uZmlnU2VydmljZS5nZXQoJ2V2ZW50c0xpbWl0Jyk7XG5cbiAgICB2YXIgb25GbHVzaCA9IGZ1bmN0aW9uIG9uRmx1c2goZXZlbnRzKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IF90aGlzLnNlbmRFdmVudHMoZXZlbnRzKTtcblxuICAgICAgaWYgKHByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgX3RoaXMuX2xvZ2dpbmdTZXJ2aWNlLndhcm4oJ0ZhaWxlZCBzZW5kaW5nIGV2ZW50cyEnLCBfdGhpcy5fY29uc3RydWN0RXJyb3IocmVhc29uKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnF1ZXVlID0gbmV3IFF1ZXVlKG9uRmx1c2gsIHtcbiAgICAgIHF1ZXVlTGltaXQ6IHF1ZXVlTGltaXQsXG4gICAgICBmbHVzaEludGVydmFsOiBmbHVzaEludGVydmFsXG4gICAgfSk7XG4gICAgdGhpcy50aHJvdHRsZUV2ZW50cyA9IHRocm90dGxlKHRoaXMucXVldWUuYWRkLmJpbmQodGhpcy5xdWV1ZSksIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5fbG9nZ2luZ1NlcnZpY2Uud2FybignRHJvcHBlZCBldmVudHMgZHVlIHRvIHRocm90dGxpbmchJyk7XG4gICAgfSwge1xuICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgaW50ZXJ2YWw6IFRIUk9UVExFX0lOVEVSVkFMXG4gICAgfSk7XG5cbiAgICB0aGlzLl9jb25maWdTZXJ2aWNlLm9ic2VydmVFdmVudChRVUVVRV9GTFVTSCwgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMucXVldWUuZmx1c2goKTtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uX3Bvc3RKc29uID0gZnVuY3Rpb24gX3Bvc3RKc29uKGVuZFBvaW50LCBwYXlsb2FkKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC1uZGpzb24nXG4gICAgfTtcblxuICAgIHZhciBhcG1SZXF1ZXN0ID0gdGhpcy5fY29uZmlnU2VydmljZS5nZXQoJ2FwbVJlcXVlc3QnKTtcblxuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgIGJlZm9yZVNlbmQ6IGFwbVJlcXVlc3RcbiAgICB9O1xuICAgIHJldHVybiBjb21wcmVzc1BheWxvYWQocGFyYW1zKS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIF90aGlzMi5fbG9nZ2luZ1NlcnZpY2UuZGVidWcoJ0NvbXByZXNzaW5nIHRoZSBwYXlsb2FkIHVzaW5nIENvbXByZXNzaW9uU3RyZWFtIEFQSSBmYWlsZWQnLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIHJldHVybiBfdGhpczIuX21ha2VIdHRwUmVxdWVzdCgnUE9TVCcsIGVuZFBvaW50LCByZXN1bHQpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciByZXNwb25zZVRleHQgPSBfcmVmLnJlc3BvbnNlVGV4dDtcbiAgICAgIHJldHVybiByZXNwb25zZVRleHQ7XG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLl9jb25zdHJ1Y3RFcnJvciA9IGZ1bmN0aW9uIF9jb25zdHJ1Y3RFcnJvcihyZWFzb24pIHtcbiAgICB2YXIgdXJsID0gcmVhc29uLnVybCxcbiAgICAgICAgc3RhdHVzID0gcmVhc29uLnN0YXR1cyxcbiAgICAgICAgcmVzcG9uc2VUZXh0ID0gcmVhc29uLnJlc3BvbnNlVGV4dDtcblxuICAgIGlmICh0eXBlb2Ygc3RhdHVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gcmVhc29uO1xuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0gdXJsICsgJyBIVFRQIHN0YXR1czogJyArIHN0YXR1cztcblxuICAgIGlmIChfX0RFVl9fICYmIHJlc3BvbnNlVGV4dCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHNlcnZlckVycm9ycyA9IFtdO1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9ycyAmJiByZXNwb25zZS5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJlc3BvbnNlLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXJ2ZXJFcnJvcnMucHVzaChlcnIubWVzc2FnZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbWVzc2FnZSArPSAnICcgKyBzZXJ2ZXJFcnJvcnMuam9pbignLCcpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2xvZ2dpbmdTZXJ2aWNlLmRlYnVnKCdFcnJvciBwYXJzaW5nIHJlc3BvbnNlIGZyb20gQVBNIHNlcnZlcicsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH07XG5cbiAgX3Byb3RvLl9tYWtlSHR0cFJlcXVlc3QgPSBmdW5jdGlvbiBfbWFrZUh0dHBSZXF1ZXN0KG1ldGhvZCwgdXJsLCBfdGVtcCkge1xuICAgIHZhciBfcmVmMiA9IF90ZW1wID09PSB2b2lkIDAgPyB7fSA6IF90ZW1wLFxuICAgICAgICBfcmVmMiR0aW1lb3V0ID0gX3JlZjIudGltZW91dCxcbiAgICAgICAgdGltZW91dCA9IF9yZWYyJHRpbWVvdXQgPT09IHZvaWQgMCA/IEhUVFBfUkVRVUVTVF9USU1FT1VUIDogX3JlZjIkdGltZW91dCxcbiAgICAgICAgcGF5bG9hZCA9IF9yZWYyLnBheWxvYWQsXG4gICAgICAgIGhlYWRlcnMgPSBfcmVmMi5oZWFkZXJzLFxuICAgICAgICBiZWZvcmVTZW5kID0gX3JlZjIuYmVmb3JlU2VuZDtcblxuICAgIHZhciBzZW5kQ3JlZGVudGlhbHMgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnc2VuZENyZWRlbnRpYWxzJyk7XG5cbiAgICBpZiAoIWJlZm9yZVNlbmQgJiYgc2hvdWxkVXNlRmV0Y2hXaXRoS2VlcEFsaXZlKG1ldGhvZCwgcGF5bG9hZCkpIHtcbiAgICAgIHJldHVybiBzZW5kRmV0Y2hSZXF1ZXN0KG1ldGhvZCwgdXJsLCB7XG4gICAgICAgIGtlZXBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgc2VuZENyZWRlbnRpYWxzOiBzZW5kQ3JlZGVudGlhbHNcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICAgIHJldHVybiBzZW5kWEhSKG1ldGhvZCwgdXJsLCB7XG4gICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBiZWZvcmVTZW5kLFxuICAgICAgICAgICAgc2VuZENyZWRlbnRpYWxzOiBzZW5kQ3JlZGVudGlhbHNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBzZW5kWEhSKG1ldGhvZCwgdXJsLCB7XG4gICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICBiZWZvcmVTZW5kOiBiZWZvcmVTZW5kLFxuICAgICAgc2VuZENyZWRlbnRpYWxzOiBzZW5kQ3JlZGVudGlhbHNcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uZmV0Y2hDb25maWcgPSBmdW5jdGlvbiBmZXRjaENvbmZpZyhzZXJ2aWNlTmFtZSwgZW52aXJvbm1lbnQpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHZhciBfdGhpcyRnZXRFbmRwb2ludHMgPSB0aGlzLmdldEVuZHBvaW50cygpLFxuICAgICAgICBjb25maWdFbmRwb2ludCA9IF90aGlzJGdldEVuZHBvaW50cy5jb25maWdFbmRwb2ludDtcblxuICAgIGlmICghc2VydmljZU5hbWUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnc2VydmljZU5hbWUgaXMgcmVxdWlyZWQgZm9yIGZldGNoaW5nIGNlbnRyYWwgY29uZmlnLicpO1xuICAgIH1cblxuICAgIGNvbmZpZ0VuZHBvaW50ICs9IFwiP3NlcnZpY2UubmFtZT1cIiArIHNlcnZpY2VOYW1lO1xuXG4gICAgaWYgKGVudmlyb25tZW50KSB7XG4gICAgICBjb25maWdFbmRwb2ludCArPSBcIiZzZXJ2aWNlLmVudmlyb25tZW50PVwiICsgZW52aXJvbm1lbnQ7XG4gICAgfVxuXG4gICAgdmFyIGxvY2FsQ29uZmlnID0gdGhpcy5fY29uZmlnU2VydmljZS5nZXRMb2NhbENvbmZpZygpO1xuXG4gICAgaWYgKGxvY2FsQ29uZmlnKSB7XG4gICAgICBjb25maWdFbmRwb2ludCArPSBcIiZpZm5vbmVtYXRjaD1cIiArIGxvY2FsQ29uZmlnLmV0YWc7XG4gICAgfVxuXG4gICAgdmFyIGFwbVJlcXVlc3QgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnYXBtUmVxdWVzdCcpO1xuXG4gICAgcmV0dXJuIHRoaXMuX21ha2VIdHRwUmVxdWVzdCgnR0VUJywgY29uZmlnRW5kcG9pbnQsIHtcbiAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICBiZWZvcmVTZW5kOiBhcG1SZXF1ZXN0XG4gICAgfSkudGhlbihmdW5jdGlvbiAoeGhyKSB7XG4gICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cyxcbiAgICAgICAgICByZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuXG4gICAgICBpZiAoc3RhdHVzID09PSAzMDQpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsQ29uZmlnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlbW90ZUNvbmZpZyA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KTtcbiAgICAgICAgdmFyIGV0YWcgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2V0YWcnKTtcblxuICAgICAgICBpZiAoZXRhZykge1xuICAgICAgICAgIHJlbW90ZUNvbmZpZy5ldGFnID0gZXRhZy5yZXBsYWNlKC9bXCJdL2csICcnKTtcblxuICAgICAgICAgIF90aGlzMy5fY29uZmlnU2VydmljZS5zZXRMb2NhbENvbmZpZyhyZW1vdGVDb25maWcsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlbW90ZUNvbmZpZztcbiAgICAgIH1cbiAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICB2YXIgZXJyb3IgPSBfdGhpczMuX2NvbnN0cnVjdEVycm9yKHJlYXNvbik7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLmNyZWF0ZU1ldGFEYXRhID0gZnVuY3Rpb24gY3JlYXRlTWV0YURhdGEoKSB7XG4gICAgdmFyIGNmZyA9IHRoaXMuX2NvbmZpZ1NlcnZpY2U7XG4gICAgdmFyIG1ldGFkYXRhID0ge1xuICAgICAgc2VydmljZToge1xuICAgICAgICBuYW1lOiBjZmcuZ2V0KCdzZXJ2aWNlTmFtZScpLFxuICAgICAgICB2ZXJzaW9uOiBjZmcuZ2V0KCdzZXJ2aWNlVmVyc2lvbicpLFxuICAgICAgICBhZ2VudDoge1xuICAgICAgICAgIG5hbWU6ICdydW0tanMnLFxuICAgICAgICAgIHZlcnNpb246IGNmZy52ZXJzaW9uXG4gICAgICAgIH0sXG4gICAgICAgIGxhbmd1YWdlOiB7XG4gICAgICAgICAgbmFtZTogJ2phdmFzY3JpcHQnXG4gICAgICAgIH0sXG4gICAgICAgIGVudmlyb25tZW50OiBjZmcuZ2V0KCdlbnZpcm9ubWVudCcpXG4gICAgICB9LFxuICAgICAgbGFiZWxzOiBjZmcuZ2V0KCdjb250ZXh0LnRhZ3MnKVxuICAgIH07XG4gICAgcmV0dXJuIHRydW5jYXRlTW9kZWwoTUVUQURBVEFfTU9ERUwsIG1ldGFkYXRhKTtcbiAgfTtcblxuICBfcHJvdG8uYWRkRXJyb3IgPSBmdW5jdGlvbiBhZGRFcnJvcihlcnJvcikge1xuICAgIHZhciBfdGhpcyR0aHJvdHRsZUV2ZW50cztcblxuICAgIHRoaXMudGhyb3R0bGVFdmVudHMoKF90aGlzJHRocm90dGxlRXZlbnRzID0ge30sIF90aGlzJHRocm90dGxlRXZlbnRzW0VSUk9SU10gPSBlcnJvciwgX3RoaXMkdGhyb3R0bGVFdmVudHMpKTtcbiAgfTtcblxuICBfcHJvdG8uYWRkVHJhbnNhY3Rpb24gPSBmdW5jdGlvbiBhZGRUcmFuc2FjdGlvbih0cmFuc2FjdGlvbikge1xuICAgIHZhciBfdGhpcyR0aHJvdHRsZUV2ZW50czI7XG5cbiAgICB0aGlzLnRocm90dGxlRXZlbnRzKChfdGhpcyR0aHJvdHRsZUV2ZW50czIgPSB7fSwgX3RoaXMkdGhyb3R0bGVFdmVudHMyW1RSQU5TQUNUSU9OU10gPSB0cmFuc2FjdGlvbiwgX3RoaXMkdGhyb3R0bGVFdmVudHMyKSk7XG4gIH07XG5cbiAgX3Byb3RvLm5kanNvbkVycm9ycyA9IGZ1bmN0aW9uIG5kanNvbkVycm9ycyhlcnJvcnMsIGNvbXByZXNzKSB7XG4gICAgdmFyIGtleSA9IGNvbXByZXNzID8gJ2UnIDogJ2Vycm9yJztcbiAgICByZXR1cm4gZXJyb3JzLm1hcChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIHZhciBfTkRKU09OJHN0cmluZ2lmeTtcblxuICAgICAgcmV0dXJuIE5ESlNPTi5zdHJpbmdpZnkoKF9OREpTT04kc3RyaW5naWZ5ID0ge30sIF9OREpTT04kc3RyaW5naWZ5W2tleV0gPSBjb21wcmVzcyA/IGNvbXByZXNzRXJyb3IoZXJyb3IpIDogZXJyb3IsIF9OREpTT04kc3RyaW5naWZ5KSk7XG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLm5kanNvbk1ldHJpY3NldHMgPSBmdW5jdGlvbiBuZGpzb25NZXRyaWNzZXRzKG1ldHJpY3NldHMpIHtcbiAgICByZXR1cm4gbWV0cmljc2V0cy5tYXAoZnVuY3Rpb24gKG1ldHJpY3NldCkge1xuICAgICAgcmV0dXJuIE5ESlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtZXRyaWNzZXQ6IG1ldHJpY3NldFxuICAgICAgfSk7XG4gICAgfSkuam9pbignJyk7XG4gIH07XG5cbiAgX3Byb3RvLm5kanNvblRyYW5zYWN0aW9ucyA9IGZ1bmN0aW9uIG5kanNvblRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbnMsIGNvbXByZXNzKSB7XG4gICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICB2YXIga2V5ID0gY29tcHJlc3MgPyAneCcgOiAndHJhbnNhY3Rpb24nO1xuICAgIHJldHVybiB0cmFuc2FjdGlvbnMubWFwKGZ1bmN0aW9uICh0cikge1xuICAgICAgdmFyIF9OREpTT04kc3RyaW5naWZ5MjtcblxuICAgICAgdmFyIHNwYW5zID0gJycsXG4gICAgICAgICAgYnJlYWtkb3ducyA9ICcnO1xuXG4gICAgICBpZiAoIWNvbXByZXNzKSB7XG4gICAgICAgIGlmICh0ci5zcGFucykge1xuICAgICAgICAgIHNwYW5zID0gdHIuc3BhbnMubWFwKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICAgICAgICByZXR1cm4gTkRKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHNwYW46IHNwYW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICAgIGRlbGV0ZSB0ci5zcGFucztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ci5icmVha2Rvd24pIHtcbiAgICAgICAgICBicmVha2Rvd25zID0gX3RoaXM0Lm5kanNvbk1ldHJpY3NldHModHIuYnJlYWtkb3duKTtcbiAgICAgICAgICBkZWxldGUgdHIuYnJlYWtkb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBOREpTT04uc3RyaW5naWZ5KChfTkRKU09OJHN0cmluZ2lmeTIgPSB7fSwgX05ESlNPTiRzdHJpbmdpZnkyW2tleV0gPSBjb21wcmVzcyA/IGNvbXByZXNzVHJhbnNhY3Rpb24odHIpIDogdHIsIF9OREpTT04kc3RyaW5naWZ5MikpICsgc3BhbnMgKyBicmVha2Rvd25zO1xuICAgIH0pO1xuICB9O1xuXG4gIF9wcm90by5zZW5kRXZlbnRzID0gZnVuY3Rpb24gc2VuZEV2ZW50cyhldmVudHMpIHtcbiAgICB2YXIgX3BheWxvYWQsIF9OREpTT04kc3RyaW5naWZ5MztcblxuICAgIGlmIChldmVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zYWN0aW9ucyA9IFtdO1xuICAgIHZhciBlcnJvcnMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICAgIGlmIChldmVudFtUUkFOU0FDVElPTlNdKSB7XG4gICAgICAgIHRyYW5zYWN0aW9ucy5wdXNoKGV2ZW50W1RSQU5TQUNUSU9OU10pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnRbRVJST1JTXSkge1xuICAgICAgICBlcnJvcnMucHVzaChldmVudFtFUlJPUlNdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCAmJiBlcnJvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNmZyA9IHRoaXMuX2NvbmZpZ1NlcnZpY2U7XG4gICAgdmFyIHBheWxvYWQgPSAoX3BheWxvYWQgPSB7fSwgX3BheWxvYWRbVFJBTlNBQ1RJT05TXSA9IHRyYW5zYWN0aW9ucywgX3BheWxvYWRbRVJST1JTXSA9IGVycm9ycywgX3BheWxvYWQpO1xuICAgIHZhciBmaWx0ZXJlZFBheWxvYWQgPSBjZmcuYXBwbHlGaWx0ZXJzKHBheWxvYWQpO1xuXG4gICAgaWYgKCFmaWx0ZXJlZFBheWxvYWQpIHtcbiAgICAgIHRoaXMuX2xvZ2dpbmdTZXJ2aWNlLndhcm4oJ0Ryb3BwZWQgcGF5bG9hZCBkdWUgdG8gZmlsdGVyaW5nIScpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGFwaVZlcnNpb24gPSBjZmcuZ2V0KCdhcGlWZXJzaW9uJyk7XG4gICAgdmFyIGNvbXByZXNzID0gYXBpVmVyc2lvbiA+IDI7XG4gICAgdmFyIG5kanNvbiA9IFtdO1xuICAgIHZhciBtZXRhZGF0YSA9IHRoaXMuY3JlYXRlTWV0YURhdGEoKTtcbiAgICB2YXIgbWV0YWRhdGFLZXkgPSBjb21wcmVzcyA/ICdtJyA6ICdtZXRhZGF0YSc7XG4gICAgbmRqc29uLnB1c2goTkRKU09OLnN0cmluZ2lmeSgoX05ESlNPTiRzdHJpbmdpZnkzID0ge30sIF9OREpTT04kc3RyaW5naWZ5M1ttZXRhZGF0YUtleV0gPSBjb21wcmVzcyA/IGNvbXByZXNzTWV0YWRhdGEobWV0YWRhdGEpIDogbWV0YWRhdGEsIF9OREpTT04kc3RyaW5naWZ5MykpKTtcbiAgICBuZGpzb24gPSBuZGpzb24uY29uY2F0KHRoaXMubmRqc29uRXJyb3JzKGZpbHRlcmVkUGF5bG9hZFtFUlJPUlNdLCBjb21wcmVzcyksIHRoaXMubmRqc29uVHJhbnNhY3Rpb25zKGZpbHRlcmVkUGF5bG9hZFtUUkFOU0FDVElPTlNdLCBjb21wcmVzcykpO1xuICAgIHZhciBuZGpzb25QYXlsb2FkID0gbmRqc29uLmpvaW4oJycpO1xuXG4gICAgdmFyIF90aGlzJGdldEVuZHBvaW50czIgPSB0aGlzLmdldEVuZHBvaW50cygpLFxuICAgICAgICBpbnRha2VFbmRwb2ludCA9IF90aGlzJGdldEVuZHBvaW50czIuaW50YWtlRW5kcG9pbnQ7XG5cbiAgICByZXR1cm4gdGhpcy5fcG9zdEpzb24oaW50YWtlRW5kcG9pbnQsIG5kanNvblBheWxvYWQpO1xuICB9O1xuXG4gIF9wcm90by5nZXRFbmRwb2ludHMgPSBmdW5jdGlvbiBnZXRFbmRwb2ludHMoKSB7XG4gICAgdmFyIHNlcnZlclVybCA9IHRoaXMuX2NvbmZpZ1NlcnZpY2UuZ2V0KCdzZXJ2ZXJVcmwnKTtcblxuICAgIHZhciBhcGlWZXJzaW9uID0gdGhpcy5fY29uZmlnU2VydmljZS5nZXQoJ2FwaVZlcnNpb24nKTtcblxuICAgIHZhciBzZXJ2ZXJVcmxQcmVmaXggPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnc2VydmVyVXJsUHJlZml4JykgfHwgXCIvaW50YWtlL3ZcIiArIGFwaVZlcnNpb24gKyBcIi9ydW0vZXZlbnRzXCI7XG4gICAgdmFyIGludGFrZUVuZHBvaW50ID0gc2VydmVyVXJsICsgc2VydmVyVXJsUHJlZml4O1xuICAgIHZhciBjb25maWdFbmRwb2ludCA9IHNlcnZlclVybCArIFwiL2NvbmZpZy92MS9ydW0vYWdlbnRzXCI7XG4gICAgcmV0dXJuIHtcbiAgICAgIGludGFrZUVuZHBvaW50OiBpbnRha2VFbmRwb2ludCxcbiAgICAgIGNvbmZpZ0VuZHBvaW50OiBjb25maWdFbmRwb2ludFxuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIEFwbVNlcnZlcjtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgQXBtU2VydmVyOyIsImltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuL3BvbHlmaWxscyc7XG5pbXBvcnQgeyBOQVZJR0FUSU9OX1RJTUlOR19NQVJLUywgQ09NUFJFU1NFRF9OQVZfVElNSU5HX01BUktTIH0gZnJvbSAnLi4vcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9uYXZpZ2F0aW9uL21hcmtzJztcbmltcG9ydCB7IGlzQmVhY29uSW5zcGVjdGlvbkVuYWJsZWQgfSBmcm9tICcuL3V0aWxzJztcblxuZnVuY3Rpb24gY29tcHJlc3NTdGFja0ZyYW1lcyhmcmFtZXMpIHtcbiAgcmV0dXJuIGZyYW1lcy5tYXAoZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFwOiBmcmFtZS5hYnNfcGF0aCxcbiAgICAgIGY6IGZyYW1lLmZpbGVuYW1lLFxuICAgICAgZm46IGZyYW1lLmZ1bmN0aW9uLFxuICAgICAgbGk6IGZyYW1lLmxpbmVubyxcbiAgICAgIGNvOiBmcmFtZS5jb2xub1xuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb21wcmVzc1Jlc3BvbnNlKHJlc3BvbnNlKSB7XG4gIHJldHVybiB7XG4gICAgdHM6IHJlc3BvbnNlLnRyYW5zZmVyX3NpemUsXG4gICAgZWJzOiByZXNwb25zZS5lbmNvZGVkX2JvZHlfc2l6ZSxcbiAgICBkYnM6IHJlc3BvbnNlLmRlY29kZWRfYm9keV9zaXplXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbXByZXNzSFRUUChodHRwKSB7XG4gIHZhciBjb21wcmVzc2VkID0ge307XG4gIHZhciBtZXRob2QgPSBodHRwLm1ldGhvZCxcbiAgICAgIHN0YXR1c19jb2RlID0gaHR0cC5zdGF0dXNfY29kZSxcbiAgICAgIHVybCA9IGh0dHAudXJsLFxuICAgICAgcmVzcG9uc2UgPSBodHRwLnJlc3BvbnNlO1xuICBjb21wcmVzc2VkLnVybCA9IHVybDtcblxuICBpZiAobWV0aG9kKSB7XG4gICAgY29tcHJlc3NlZC5tdCA9IG1ldGhvZDtcbiAgfVxuXG4gIGlmIChzdGF0dXNfY29kZSkge1xuICAgIGNvbXByZXNzZWQuc2MgPSBzdGF0dXNfY29kZTtcbiAgfVxuXG4gIGlmIChyZXNwb25zZSkge1xuICAgIGNvbXByZXNzZWQuciA9IGNvbXByZXNzUmVzcG9uc2UocmVzcG9uc2UpO1xuICB9XG5cbiAgcmV0dXJuIGNvbXByZXNzZWQ7XG59XG5cbmZ1bmN0aW9uIGNvbXByZXNzQ29udGV4dChjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGNvbXByZXNzZWQgPSB7fTtcbiAgdmFyIHBhZ2UgPSBjb250ZXh0LnBhZ2UsXG4gICAgICBodHRwID0gY29udGV4dC5odHRwLFxuICAgICAgcmVzcG9uc2UgPSBjb250ZXh0LnJlc3BvbnNlLFxuICAgICAgZGVzdGluYXRpb24gPSBjb250ZXh0LmRlc3RpbmF0aW9uLFxuICAgICAgdXNlciA9IGNvbnRleHQudXNlcixcbiAgICAgIGN1c3RvbSA9IGNvbnRleHQuY3VzdG9tO1xuXG4gIGlmIChwYWdlKSB7XG4gICAgY29tcHJlc3NlZC5wID0ge1xuICAgICAgcmY6IHBhZ2UucmVmZXJlcixcbiAgICAgIHVybDogcGFnZS51cmxcbiAgICB9O1xuICB9XG5cbiAgaWYgKGh0dHApIHtcbiAgICBjb21wcmVzc2VkLmggPSBjb21wcmVzc0hUVFAoaHR0cCk7XG4gIH1cblxuICBpZiAocmVzcG9uc2UpIHtcbiAgICBjb21wcmVzc2VkLnIgPSBjb21wcmVzc1Jlc3BvbnNlKHJlc3BvbnNlKTtcbiAgfVxuXG4gIGlmIChkZXN0aW5hdGlvbikge1xuICAgIHZhciBzZXJ2aWNlID0gZGVzdGluYXRpb24uc2VydmljZTtcbiAgICBjb21wcmVzc2VkLmR0ID0ge1xuICAgICAgc2U6IHtcbiAgICAgICAgbjogc2VydmljZS5uYW1lLFxuICAgICAgICB0OiBzZXJ2aWNlLnR5cGUsXG4gICAgICAgIHJjOiBzZXJ2aWNlLnJlc291cmNlXG4gICAgICB9LFxuICAgICAgYWQ6IGRlc3RpbmF0aW9uLmFkZHJlc3MsXG4gICAgICBwbzogZGVzdGluYXRpb24ucG9ydFxuICAgIH07XG4gIH1cblxuICBpZiAodXNlcikge1xuICAgIGNvbXByZXNzZWQudSA9IHtcbiAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgdW46IHVzZXIudXNlcm5hbWUsXG4gICAgICBlbTogdXNlci5lbWFpbFxuICAgIH07XG4gIH1cblxuICBpZiAoY3VzdG9tKSB7XG4gICAgY29tcHJlc3NlZC5jdSA9IGN1c3RvbTtcbiAgfVxuXG4gIHJldHVybiBjb21wcmVzc2VkO1xufVxuXG5mdW5jdGlvbiBjb21wcmVzc01hcmtzKG1hcmtzKSB7XG4gIGlmICghbWFya3MpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBjb21wcmVzc2VkTnRNYXJrcyA9IGNvbXByZXNzTmF2aWdhdGlvblRpbWluZ01hcmtzKG1hcmtzLm5hdmlnYXRpb25UaW1pbmcpO1xuICB2YXIgY29tcHJlc3NlZCA9IHtcbiAgICBudDogY29tcHJlc3NlZE50TWFya3MsXG4gICAgYTogY29tcHJlc3NBZ2VudE1hcmtzKGNvbXByZXNzZWROdE1hcmtzLCBtYXJrcy5hZ2VudClcbiAgfTtcbiAgcmV0dXJuIGNvbXByZXNzZWQ7XG59XG5cbmZ1bmN0aW9uIGNvbXByZXNzTmF2aWdhdGlvblRpbWluZ01hcmtzKG50TWFya3MpIHtcbiAgaWYgKCFudE1hcmtzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgY29tcHJlc3NlZCA9IHt9O1xuICBDT01QUkVTU0VEX05BVl9USU1JTkdfTUFSS1MuZm9yRWFjaChmdW5jdGlvbiAobWFyaywgaW5kZXgpIHtcbiAgICB2YXIgbWFwcGluZyA9IE5BVklHQVRJT05fVElNSU5HX01BUktTW2luZGV4XTtcbiAgICBjb21wcmVzc2VkW21hcmtdID0gbnRNYXJrc1ttYXBwaW5nXTtcbiAgfSk7XG4gIHJldHVybiBjb21wcmVzc2VkO1xufVxuXG5mdW5jdGlvbiBjb21wcmVzc0FnZW50TWFya3MoY29tcHJlc3NlZE50TWFya3MsIGFnZW50TWFya3MpIHtcbiAgdmFyIGNvbXByZXNzZWQgPSB7fTtcblxuICBpZiAoY29tcHJlc3NlZE50TWFya3MpIHtcbiAgICBjb21wcmVzc2VkID0ge1xuICAgICAgZmI6IGNvbXByZXNzZWROdE1hcmtzLnJzLFxuICAgICAgZGk6IGNvbXByZXNzZWROdE1hcmtzLmRpLFxuICAgICAgZGM6IGNvbXByZXNzZWROdE1hcmtzLmRjXG4gICAgfTtcbiAgfVxuXG4gIGlmIChhZ2VudE1hcmtzKSB7XG4gICAgdmFyIGZwID0gYWdlbnRNYXJrcy5maXJzdENvbnRlbnRmdWxQYWludDtcbiAgICB2YXIgbHAgPSBhZ2VudE1hcmtzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnQ7XG5cbiAgICBpZiAoZnApIHtcbiAgICAgIGNvbXByZXNzZWQuZnAgPSBmcDtcbiAgICB9XG5cbiAgICBpZiAobHApIHtcbiAgICAgIGNvbXByZXNzZWQubHAgPSBscDtcbiAgICB9XG4gIH1cblxuICBpZiAoT2JqZWN0LmtleXMoY29tcHJlc3NlZCkubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gY29tcHJlc3NlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXByZXNzTWV0YWRhdGEobWV0YWRhdGEpIHtcbiAgdmFyIHNlcnZpY2UgPSBtZXRhZGF0YS5zZXJ2aWNlLFxuICAgICAgbGFiZWxzID0gbWV0YWRhdGEubGFiZWxzO1xuICB2YXIgYWdlbnQgPSBzZXJ2aWNlLmFnZW50LFxuICAgICAgbGFuZ3VhZ2UgPSBzZXJ2aWNlLmxhbmd1YWdlO1xuICByZXR1cm4ge1xuICAgIHNlOiB7XG4gICAgICBuOiBzZXJ2aWNlLm5hbWUsXG4gICAgICB2ZTogc2VydmljZS52ZXJzaW9uLFxuICAgICAgYToge1xuICAgICAgICBuOiBhZ2VudC5uYW1lLFxuICAgICAgICB2ZTogYWdlbnQudmVyc2lvblxuICAgICAgfSxcbiAgICAgIGxhOiB7XG4gICAgICAgIG46IGxhbmd1YWdlLm5hbWVcbiAgICAgIH0sXG4gICAgICBlbjogc2VydmljZS5lbnZpcm9ubWVudFxuICAgIH0sXG4gICAgbDogbGFiZWxzXG4gIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcHJlc3NUcmFuc2FjdGlvbih0cmFuc2FjdGlvbikge1xuICB2YXIgc3BhbnMgPSB0cmFuc2FjdGlvbi5zcGFucy5tYXAoZnVuY3Rpb24gKHNwYW4pIHtcbiAgICB2YXIgc3BhbkRhdGEgPSB7XG4gICAgICBpZDogc3Bhbi5pZCxcbiAgICAgIG46IHNwYW4ubmFtZSxcbiAgICAgIHQ6IHNwYW4udHlwZSxcbiAgICAgIHM6IHNwYW4uc3RhcnQsXG4gICAgICBkOiBzcGFuLmR1cmF0aW9uLFxuICAgICAgYzogY29tcHJlc3NDb250ZXh0KHNwYW4uY29udGV4dCksXG4gICAgICBvOiBzcGFuLm91dGNvbWUsXG4gICAgICBzcjogc3Bhbi5zYW1wbGVfcmF0ZVxuICAgIH07XG5cbiAgICBpZiAoc3Bhbi5wYXJlbnRfaWQgIT09IHRyYW5zYWN0aW9uLmlkKSB7XG4gICAgICBzcGFuRGF0YS5waWQgPSBzcGFuLnBhcmVudF9pZDtcbiAgICB9XG5cbiAgICBpZiAoc3Bhbi5zeW5jID09PSB0cnVlKSB7XG4gICAgICBzcGFuRGF0YS5zeSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHNwYW4uc3VidHlwZSkge1xuICAgICAgc3BhbkRhdGEuc3UgPSBzcGFuLnN1YnR5cGU7XG4gICAgfVxuXG4gICAgaWYgKHNwYW4uYWN0aW9uKSB7XG4gICAgICBzcGFuRGF0YS5hYyA9IHNwYW4uYWN0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBzcGFuRGF0YTtcbiAgfSk7XG4gIHZhciB0ciA9IHtcbiAgICBpZDogdHJhbnNhY3Rpb24uaWQsXG4gICAgdGlkOiB0cmFuc2FjdGlvbi50cmFjZV9pZCxcbiAgICBuOiB0cmFuc2FjdGlvbi5uYW1lLFxuICAgIHQ6IHRyYW5zYWN0aW9uLnR5cGUsXG4gICAgZDogdHJhbnNhY3Rpb24uZHVyYXRpb24sXG4gICAgYzogY29tcHJlc3NDb250ZXh0KHRyYW5zYWN0aW9uLmNvbnRleHQpLFxuICAgIGs6IGNvbXByZXNzTWFya3ModHJhbnNhY3Rpb24ubWFya3MpLFxuICAgIG1lOiBjb21wcmVzc01ldHJpY3NldHModHJhbnNhY3Rpb24uYnJlYWtkb3duKSxcbiAgICB5OiBzcGFucyxcbiAgICB5Yzoge1xuICAgICAgc2Q6IHNwYW5zLmxlbmd0aFxuICAgIH0sXG4gICAgc206IHRyYW5zYWN0aW9uLnNhbXBsZWQsXG4gICAgc3I6IHRyYW5zYWN0aW9uLnNhbXBsZV9yYXRlLFxuICAgIG86IHRyYW5zYWN0aW9uLm91dGNvbWVcbiAgfTtcblxuICBpZiAodHJhbnNhY3Rpb24uZXhwZXJpZW5jZSkge1xuICAgIHZhciBfdHJhbnNhY3Rpb24kZXhwZXJpZW4gPSB0cmFuc2FjdGlvbi5leHBlcmllbmNlLFxuICAgICAgICBjbHMgPSBfdHJhbnNhY3Rpb24kZXhwZXJpZW4uY2xzLFxuICAgICAgICBmaWQgPSBfdHJhbnNhY3Rpb24kZXhwZXJpZW4uZmlkLFxuICAgICAgICB0YnQgPSBfdHJhbnNhY3Rpb24kZXhwZXJpZW4udGJ0LFxuICAgICAgICBsb25ndGFzayA9IF90cmFuc2FjdGlvbiRleHBlcmllbi5sb25ndGFzaztcbiAgICB0ci5leHAgPSB7XG4gICAgICBjbHM6IGNscyxcbiAgICAgIGZpZDogZmlkLFxuICAgICAgdGJ0OiB0YnQsXG4gICAgICBsdDogbG9uZ3Rhc2tcbiAgICB9O1xuICB9XG5cbiAgaWYgKHRyYW5zYWN0aW9uLnNlc3Npb24pIHtcbiAgICB2YXIgX3RyYW5zYWN0aW9uJHNlc3Npb24gPSB0cmFuc2FjdGlvbi5zZXNzaW9uLFxuICAgICAgICBpZCA9IF90cmFuc2FjdGlvbiRzZXNzaW9uLmlkLFxuICAgICAgICBzZXF1ZW5jZSA9IF90cmFuc2FjdGlvbiRzZXNzaW9uLnNlcXVlbmNlO1xuICAgIHRyLnNlcyA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHNlcTogc2VxdWVuY2VcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHRyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXByZXNzRXJyb3IoZXJyb3IpIHtcbiAgdmFyIGV4Y2VwdGlvbiA9IGVycm9yLmV4Y2VwdGlvbjtcbiAgdmFyIGNvbXByZXNzZWQgPSB7XG4gICAgaWQ6IGVycm9yLmlkLFxuICAgIGNsOiBlcnJvci5jdWxwcml0LFxuICAgIGV4OiB7XG4gICAgICBtZzogZXhjZXB0aW9uLm1lc3NhZ2UsXG4gICAgICBzdDogY29tcHJlc3NTdGFja0ZyYW1lcyhleGNlcHRpb24uc3RhY2t0cmFjZSksXG4gICAgICB0OiBlcnJvci50eXBlXG4gICAgfSxcbiAgICBjOiBjb21wcmVzc0NvbnRleHQoZXJyb3IuY29udGV4dClcbiAgfTtcbiAgdmFyIHRyYW5zYWN0aW9uID0gZXJyb3IudHJhbnNhY3Rpb247XG5cbiAgaWYgKHRyYW5zYWN0aW9uKSB7XG4gICAgY29tcHJlc3NlZC50aWQgPSBlcnJvci50cmFjZV9pZDtcbiAgICBjb21wcmVzc2VkLnBpZCA9IGVycm9yLnBhcmVudF9pZDtcbiAgICBjb21wcmVzc2VkLnhpZCA9IGVycm9yLnRyYW5zYWN0aW9uX2lkO1xuICAgIGNvbXByZXNzZWQueCA9IHtcbiAgICAgIHQ6IHRyYW5zYWN0aW9uLnR5cGUsXG4gICAgICBzbTogdHJhbnNhY3Rpb24uc2FtcGxlZFxuICAgIH07XG4gIH1cblxuICByZXR1cm4gY29tcHJlc3NlZDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc01ldHJpY3NldHMoYnJlYWtkb3ducykge1xuICByZXR1cm4gYnJlYWtkb3ducy5tYXAoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgc3BhbiA9IF9yZWYuc3BhbixcbiAgICAgICAgc2FtcGxlcyA9IF9yZWYuc2FtcGxlcztcbiAgICByZXR1cm4ge1xuICAgICAgeToge1xuICAgICAgICB0OiBzcGFuLnR5cGVcbiAgICAgIH0sXG4gICAgICBzYToge1xuICAgICAgICB5c2M6IHtcbiAgICAgICAgICB2OiBzYW1wbGVzWydzcGFuLnNlbGZfdGltZS5jb3VudCddLnZhbHVlXG4gICAgICAgIH0sXG4gICAgICAgIHlzczoge1xuICAgICAgICAgIHY6IHNhbXBsZXNbJ3NwYW4uc2VsZl90aW1lLnN1bS51cyddLnZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc1BheWxvYWQocGFyYW1zLCB0eXBlKSB7XG4gIGlmICh0eXBlID09PSB2b2lkIDApIHtcbiAgICB0eXBlID0gJ2d6aXAnO1xuICB9XG5cbiAgdmFyIGlzQ29tcHJlc3Npb25TdHJlYW1TdXBwb3J0ZWQgPSB0eXBlb2YgQ29tcHJlc3Npb25TdHJlYW0gPT09ICdmdW5jdGlvbic7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGlmICghaXNDb21wcmVzc2lvblN0cmVhbVN1cHBvcnRlZCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUocGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCZWFjb25JbnNwZWN0aW9uRW5hYmxlZCgpKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShwYXJhbXMpO1xuICAgIH1cblxuICAgIHZhciBwYXlsb2FkID0gcGFyYW1zLnBheWxvYWQsXG4gICAgICAgIGhlYWRlcnMgPSBwYXJhbXMuaGVhZGVycyxcbiAgICAgICAgYmVmb3JlU2VuZCA9IHBhcmFtcy5iZWZvcmVTZW5kO1xuICAgIHZhciBwYXlsb2FkU3RyZWFtID0gbmV3IEJsb2IoW3BheWxvYWRdKS5zdHJlYW0oKTtcbiAgICB2YXIgY29tcHJlc3NlZFN0cmVhbSA9IHBheWxvYWRTdHJlYW0ucGlwZVRocm91Z2gobmV3IENvbXByZXNzaW9uU3RyZWFtKHR5cGUpKTtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGNvbXByZXNzZWRTdHJlYW0pLmJsb2IoKS50aGVuKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICBoZWFkZXJzWydDb250ZW50LUVuY29kaW5nJ10gPSB0eXBlO1xuICAgICAgcmV0dXJuIHJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBiZWZvcmVTZW5kOiBiZWZvcmVTZW5kXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59IiwiZnVuY3Rpb24gX2V4dGVuZHMoKSB7IF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTsgcmV0dXJuIF9leHRlbmRzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cblxuaW1wb3J0IHsgZ2V0Q3VycmVudFNjcmlwdCwgc2V0TGFiZWwsIG1lcmdlLCBleHRlbmQsIGlzVW5kZWZpbmVkIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZXZlbnQtaGFuZGxlcic7XG5pbXBvcnQgeyBDT05GSUdfQ0hBTkdFLCBMT0NBTF9DT05GSUdfS0VZIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5mdW5jdGlvbiBnZXRDb25maWdGcm9tU2NyaXB0KCkge1xuICB2YXIgc2NyaXB0ID0gZ2V0Q3VycmVudFNjcmlwdCgpO1xuICB2YXIgY29uZmlnID0gZ2V0RGF0YUF0dHJpYnV0ZXNGcm9tTm9kZShzY3JpcHQpO1xuICByZXR1cm4gY29uZmlnO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhQXR0cmlidXRlc0Zyb21Ob2RlKG5vZGUpIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgdmFyIGRhdGFBdHRycyA9IHt9O1xuICB2YXIgZGF0YVJlZ2V4ID0gL15kYXRhLShbXFx3LV0rKSQvO1xuICB2YXIgYXR0cnMgPSBub2RlLmF0dHJpYnV0ZXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBhdHRyID0gYXR0cnNbaV07XG5cbiAgICBpZiAoZGF0YVJlZ2V4LnRlc3QoYXR0ci5ub2RlTmFtZSkpIHtcbiAgICAgIHZhciBrZXkgPSBhdHRyLm5vZGVOYW1lLm1hdGNoKGRhdGFSZWdleClbMV07XG4gICAgICB2YXIgY2FtZWxDYXNlZGtleSA9IGtleS5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBpbmRleCA+IDAgPyB2YWx1ZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHZhbHVlLnN1YnN0cmluZygxKSA6IHZhbHVlO1xuICAgICAgfSkuam9pbignJyk7XG4gICAgICBkYXRhQXR0cnNbY2FtZWxDYXNlZGtleV0gPSBhdHRyLnZhbHVlIHx8IGF0dHIubm9kZVZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRhQXR0cnM7XG59XG5cbnZhciBDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENvbmZpZygpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHNlcnZpY2VOYW1lOiAnJyxcbiAgICAgIHNlcnZpY2VWZXJzaW9uOiAnJyxcbiAgICAgIGVudmlyb25tZW50OiAnJyxcbiAgICAgIHNlcnZlclVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODIwMCcsXG4gICAgICBzZXJ2ZXJVcmxQcmVmaXg6ICcnLFxuICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgaW5zdHJ1bWVudDogdHJ1ZSxcbiAgICAgIGRpc2FibGVJbnN0cnVtZW50YXRpb25zOiBbXSxcbiAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICBicmVha2Rvd25NZXRyaWNzOiBmYWxzZSxcbiAgICAgIGlnbm9yZVRyYW5zYWN0aW9uczogW10sXG4gICAgICBldmVudHNMaW1pdDogODAsXG4gICAgICBxdWV1ZUxpbWl0OiAtMSxcbiAgICAgIGZsdXNoSW50ZXJ2YWw6IDUwMCxcbiAgICAgIGRpc3RyaWJ1dGVkVHJhY2luZzogdHJ1ZSxcbiAgICAgIGRpc3RyaWJ1dGVkVHJhY2luZ09yaWdpbnM6IFtdLFxuICAgICAgZGlzdHJpYnV0ZWRUcmFjaW5nSGVhZGVyTmFtZTogJ3RyYWNlcGFyZW50JyxcbiAgICAgIHBhZ2VMb2FkVHJhY2VJZDogJycsXG4gICAgICBwYWdlTG9hZFNwYW5JZDogJycsXG4gICAgICBwYWdlTG9hZFNhbXBsZWQ6IGZhbHNlLFxuICAgICAgcGFnZUxvYWRUcmFuc2FjdGlvbk5hbWU6ICcnLFxuICAgICAgcHJvcGFnYXRlVHJhY2VzdGF0ZTogZmFsc2UsXG4gICAgICB0cmFuc2FjdGlvblNhbXBsZVJhdGU6IDEuMCxcbiAgICAgIGNlbnRyYWxDb25maWc6IGZhbHNlLFxuICAgICAgbW9uaXRvckxvbmd0YXNrczogdHJ1ZSxcbiAgICAgIGFwaVZlcnNpb246IDIsXG4gICAgICBjb250ZXh0OiB7fSxcbiAgICAgIHNlc3Npb246IGZhbHNlLFxuICAgICAgYXBtUmVxdWVzdDogbnVsbCxcbiAgICAgIHNlbmRDcmVkZW50aWFsczogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIHRoaXMuZmlsdGVycyA9IFtdO1xuICAgIHRoaXMudmVyc2lvbiA9ICcnO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IENvbmZpZy5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBzY3JpcHREYXRhID0gZ2V0Q29uZmlnRnJvbVNjcmlwdCgpO1xuICAgIHRoaXMuc2V0Q29uZmlnKHNjcmlwdERhdGEpO1xuICB9O1xuXG4gIF9wcm90by5zZXRWZXJzaW9uID0gZnVuY3Rpb24gc2V0VmVyc2lvbih2ZXJzaW9uKSB7XG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbjtcbiAgfTtcblxuICBfcHJvdG8uYWRkRmlsdGVyID0gZnVuY3Rpb24gYWRkRmlsdGVyKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcmd1bWVudCB0byBtdXN0IGJlIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgdGhpcy5maWx0ZXJzLnB1c2goY2IpO1xuICB9O1xuXG4gIF9wcm90by5hcHBseUZpbHRlcnMgPSBmdW5jdGlvbiBhcHBseUZpbHRlcnMoZGF0YSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5maWx0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkYXRhID0gdGhpcy5maWx0ZXJzW2ldKGRhdGEpO1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIF9wcm90by5nZXQgPSBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIGtleS5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbiAob2JqLCBvYmpLZXkpIHtcbiAgICAgIHJldHVybiBvYmogJiYgb2JqW29iaktleV07XG4gICAgfSwgdGhpcy5jb25maWcpO1xuICB9O1xuXG4gIF9wcm90by5zZXRVc2VyQ29udGV4dCA9IGZ1bmN0aW9uIHNldFVzZXJDb250ZXh0KHVzZXJDb250ZXh0KSB7XG4gICAgaWYgKHVzZXJDb250ZXh0ID09PSB2b2lkIDApIHtcbiAgICAgIHVzZXJDb250ZXh0ID0ge307XG4gICAgfVxuXG4gICAgdmFyIGNvbnRleHQgPSB7fTtcbiAgICB2YXIgX3VzZXJDb250ZXh0ID0gdXNlckNvbnRleHQsXG4gICAgICAgIGlkID0gX3VzZXJDb250ZXh0LmlkLFxuICAgICAgICB1c2VybmFtZSA9IF91c2VyQ29udGV4dC51c2VybmFtZSxcbiAgICAgICAgZW1haWwgPSBfdXNlckNvbnRleHQuZW1haWw7XG5cbiAgICBpZiAodHlwZW9mIGlkID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb250ZXh0LmlkID0gaWQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB1c2VybmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnRleHQudXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGVtYWlsID09PSAnc3RyaW5nJykge1xuICAgICAgY29udGV4dC5lbWFpbCA9IGVtYWlsO1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnLmNvbnRleHQudXNlciA9IGV4dGVuZCh0aGlzLmNvbmZpZy5jb250ZXh0LnVzZXIgfHwge30sIGNvbnRleHQpO1xuICB9O1xuXG4gIF9wcm90by5zZXRDdXN0b21Db250ZXh0ID0gZnVuY3Rpb24gc2V0Q3VzdG9tQ29udGV4dChjdXN0b21Db250ZXh0KSB7XG4gICAgaWYgKGN1c3RvbUNvbnRleHQgPT09IHZvaWQgMCkge1xuICAgICAgY3VzdG9tQ29udGV4dCA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnLmNvbnRleHQuY3VzdG9tID0gZXh0ZW5kKHRoaXMuY29uZmlnLmNvbnRleHQuY3VzdG9tIHx8IHt9LCBjdXN0b21Db250ZXh0KTtcbiAgfTtcblxuICBfcHJvdG8uYWRkTGFiZWxzID0gZnVuY3Rpb24gYWRkTGFiZWxzKHRhZ3MpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5jb250ZXh0LnRhZ3MpIHtcbiAgICAgIHRoaXMuY29uZmlnLmNvbnRleHQudGFncyA9IHt9O1xuICAgIH1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGFncyk7XG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gc2V0TGFiZWwoaywgdGFnc1trXSwgX3RoaXMuY29uZmlnLmNvbnRleHQudGFncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLnNldENvbmZpZyA9IGZ1bmN0aW9uIHNldENvbmZpZyhwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHZvaWQgMCkge1xuICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgIH1cblxuICAgIHZhciBfcHJvcGVydGllcyA9IHByb3BlcnRpZXMsXG4gICAgICAgIHRyYW5zYWN0aW9uU2FtcGxlUmF0ZSA9IF9wcm9wZXJ0aWVzLnRyYW5zYWN0aW9uU2FtcGxlUmF0ZSxcbiAgICAgICAgc2VydmVyVXJsID0gX3Byb3BlcnRpZXMuc2VydmVyVXJsO1xuXG4gICAgaWYgKHNlcnZlclVybCkge1xuICAgICAgcHJvcGVydGllcy5zZXJ2ZXJVcmwgPSBzZXJ2ZXJVcmwucmVwbGFjZSgvXFwvKyQvLCAnJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0cmFuc2FjdGlvblNhbXBsZVJhdGUpKSB7XG4gICAgICBpZiAodHJhbnNhY3Rpb25TYW1wbGVSYXRlIDwgMC4wMDAxICYmIHRyYW5zYWN0aW9uU2FtcGxlUmF0ZSA+IDApIHtcbiAgICAgICAgdHJhbnNhY3Rpb25TYW1wbGVSYXRlID0gMC4wMDAxO1xuICAgICAgfVxuXG4gICAgICBwcm9wZXJ0aWVzLnRyYW5zYWN0aW9uU2FtcGxlUmF0ZSA9IE1hdGgucm91bmQodHJhbnNhY3Rpb25TYW1wbGVSYXRlICogMTAwMDApIC8gMTAwMDA7XG4gICAgfVxuXG4gICAgbWVyZ2UodGhpcy5jb25maWcsIHByb3BlcnRpZXMpO1xuICAgIHRoaXMuZXZlbnRzLnNlbmQoQ09ORklHX0NIQU5HRSwgW3RoaXMuY29uZmlnXSk7XG4gIH07XG5cbiAgX3Byb3RvLnZhbGlkYXRlID0gZnVuY3Rpb24gdmFsaWRhdGUocHJvcGVydGllcykge1xuICAgIGlmIChwcm9wZXJ0aWVzID09PSB2b2lkIDApIHtcbiAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICB9XG5cbiAgICB2YXIgcmVxdWlyZWRLZXlzID0gWydzZXJ2aWNlTmFtZScsICdzZXJ2ZXJVcmwnXTtcbiAgICB2YXIgYWxsS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY29uZmlnKTtcbiAgICB2YXIgZXJyb3JzID0ge1xuICAgICAgbWlzc2luZzogW10sXG4gICAgICBpbnZhbGlkOiBbXSxcbiAgICAgIHVua25vd246IFtdXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmIChyZXF1aXJlZEtleXMuaW5kZXhPZihrZXkpICE9PSAtMSAmJiAhcHJvcGVydGllc1trZXldKSB7XG4gICAgICAgIGVycm9ycy5taXNzaW5nLnB1c2goa2V5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFsbEtleXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgICBlcnJvcnMudW5rbm93bi5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocHJvcGVydGllcy5zZXJ2aWNlTmFtZSAmJiAhL15bYS16QS1aMC05IF8tXSskLy50ZXN0KHByb3BlcnRpZXMuc2VydmljZU5hbWUpKSB7XG4gICAgICBlcnJvcnMuaW52YWxpZC5wdXNoKHtcbiAgICAgICAga2V5OiAnc2VydmljZU5hbWUnLFxuICAgICAgICB2YWx1ZTogcHJvcGVydGllcy5zZXJ2aWNlTmFtZSxcbiAgICAgICAgYWxsb3dlZDogJ2EteiwgQS1aLCAwLTksIF8sIC0sIDxzcGFjZT4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgc2FtcGxlUmF0ZSA9IHByb3BlcnRpZXMudHJhbnNhY3Rpb25TYW1wbGVSYXRlO1xuXG4gICAgaWYgKHR5cGVvZiBzYW1wbGVSYXRlICE9PSAndW5kZWZpbmVkJyAmJiAodHlwZW9mIHNhbXBsZVJhdGUgIT09ICdudW1iZXInIHx8IGlzTmFOKHNhbXBsZVJhdGUpIHx8IHNhbXBsZVJhdGUgPCAwIHx8IHNhbXBsZVJhdGUgPiAxKSkge1xuICAgICAgZXJyb3JzLmludmFsaWQucHVzaCh7XG4gICAgICAgIGtleTogJ3RyYW5zYWN0aW9uU2FtcGxlUmF0ZScsXG4gICAgICAgIHZhbHVlOiBzYW1wbGVSYXRlLFxuICAgICAgICBhbGxvd2VkOiAnTnVtYmVyIGJldHdlZW4gMCBhbmQgMSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBlcnJvcnM7XG4gIH07XG5cbiAgX3Byb3RvLmdldExvY2FsQ29uZmlnID0gZnVuY3Rpb24gZ2V0TG9jYWxDb25maWcoKSB7XG4gICAgdmFyIHN0b3JhZ2UgPSBzZXNzaW9uU3RvcmFnZTtcblxuICAgIGlmICh0aGlzLmNvbmZpZy5zZXNzaW9uKSB7XG4gICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIH1cblxuICAgIHZhciBjb25maWcgPSBzdG9yYWdlLmdldEl0ZW0oTE9DQUxfQ09ORklHX0tFWSk7XG5cbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjb25maWcpO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uc2V0TG9jYWxDb25maWcgPSBmdW5jdGlvbiBzZXRMb2NhbENvbmZpZyhjb25maWcsIG1lcmdlKSB7XG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgaWYgKG1lcmdlKSB7XG4gICAgICAgIHZhciBwcmV2Q29uZmlnID0gdGhpcy5nZXRMb2NhbENvbmZpZygpO1xuICAgICAgICBjb25maWcgPSBfZXh0ZW5kcyh7fSwgcHJldkNvbmZpZywgY29uZmlnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0b3JhZ2UgPSBzZXNzaW9uU3RvcmFnZTtcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLnNlc3Npb24pIHtcbiAgICAgICAgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICAgIH1cblxuICAgICAgc3RvcmFnZS5zZXRJdGVtKExPQ0FMX0NPTkZJR19LRVksIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobmFtZSwgYXJncykge1xuICAgIHRoaXMuZXZlbnRzLnNlbmQobmFtZSwgYXJncyk7XG4gIH07XG5cbiAgX3Byb3RvLm9ic2VydmVFdmVudCA9IGZ1bmN0aW9uIG9ic2VydmVFdmVudChuYW1lLCBmbikge1xuICAgIHJldHVybiB0aGlzLmV2ZW50cy5vYnNlcnZlKG5hbWUsIGZuKTtcbiAgfTtcblxuICByZXR1cm4gQ29uZmlnO1xufSgpO1xuXG5leHBvcnQgZGVmYXVsdCBDb25maWc7IiwidmFyIFNDSEVEVUxFID0gJ3NjaGVkdWxlJztcbnZhciBJTlZPS0UgPSAnaW52b2tlJztcbnZhciBBRERfRVZFTlRfTElTVEVORVJfU1RSID0gJ2FkZEV2ZW50TGlzdGVuZXInO1xudmFyIFJFTU9WRV9FVkVOVF9MSVNURU5FUl9TVFIgPSAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG52YXIgUkVTT1VSQ0VfSU5JVElBVE9SX1RZUEVTID0gWydsaW5rJywgJ2NzcycsICdzY3JpcHQnLCAnaW1nJywgJ3htbGh0dHByZXF1ZXN0JywgJ2ZldGNoJywgJ2JlYWNvbicsICdpZnJhbWUnXTtcbnZhciBSRVVTQUJJTElUWV9USFJFU0hPTEQgPSA1MDAwO1xudmFyIE1BWF9TUEFOX0RVUkFUSU9OID0gNSAqIDYwICogMTAwMDtcbnZhciBQQUdFX0xPQURfREVMQVkgPSAxMDAwO1xudmFyIFBBR0VfTE9BRCA9ICdwYWdlLWxvYWQnO1xudmFyIFJPVVRFX0NIQU5HRSA9ICdyb3V0ZS1jaGFuZ2UnO1xudmFyIFRZUEVfQ1VTVE9NID0gJ2N1c3RvbSc7XG52YXIgVVNFUl9JTlRFUkFDVElPTiA9ICd1c2VyLWludGVyYWN0aW9uJztcbnZhciBIVFRQX1JFUVVFU1RfVFlQRSA9ICdodHRwLXJlcXVlc3QnO1xudmFyIFRFTVBPUkFSWV9UWVBFID0gJ3RlbXBvcmFyeSc7XG52YXIgTkFNRV9VTktOT1dOID0gJ1Vua25vd24nO1xudmFyIFBBR0VfRVhJVCA9ICdwYWdlLWV4aXQnO1xudmFyIFRSQU5TQUNUSU9OX1RZUEVfT1JERVIgPSBbUEFHRV9MT0FELCBST1VURV9DSEFOR0UsIFVTRVJfSU5URVJBQ1RJT04sIEhUVFBfUkVRVUVTVF9UWVBFLCBUWVBFX0NVU1RPTSwgVEVNUE9SQVJZX1RZUEVdO1xudmFyIE9VVENPTUVfU1VDQ0VTUyA9ICdzdWNjZXNzJztcbnZhciBPVVRDT01FX0ZBSUxVUkUgPSAnZmFpbHVyZSc7XG52YXIgT1VUQ09NRV9VTktOT1dOID0gJ3Vua25vd24nO1xudmFyIFVTRVJfVElNSU5HX1RIUkVTSE9MRCA9IDYwO1xudmFyIFRSQU5TQUNUSU9OX1NUQVJUID0gJ3RyYW5zYWN0aW9uOnN0YXJ0JztcbnZhciBUUkFOU0FDVElPTl9FTkQgPSAndHJhbnNhY3Rpb246ZW5kJztcbnZhciBDT05GSUdfQ0hBTkdFID0gJ2NvbmZpZzpjaGFuZ2UnO1xudmFyIFFVRVVFX0ZMVVNIID0gJ3F1ZXVlOmZsdXNoJztcbnZhciBRVUVVRV9BRERfVFJBTlNBQ1RJT04gPSAncXVldWU6YWRkX3RyYW5zYWN0aW9uJztcbnZhciBUUkFOU0FDVElPTl9JR05PUkUgPSAndHJhbnNhY3Rpb246aWdub3JlJztcbnZhciBYTUxIVFRQUkVRVUVTVCA9ICd4bWxodHRwcmVxdWVzdCc7XG52YXIgRkVUQ0ggPSAnZmV0Y2gnO1xudmFyIEhJU1RPUlkgPSAnaGlzdG9yeSc7XG52YXIgRVZFTlRfVEFSR0VUID0gJ2V2ZW50dGFyZ2V0JztcbnZhciBDTElDSyA9ICdjbGljayc7XG52YXIgRVJST1IgPSAnZXJyb3InO1xudmFyIEJFRk9SRV9FVkVOVCA9ICc6YmVmb3JlJztcbnZhciBBRlRFUl9FVkVOVCA9ICc6YWZ0ZXInO1xudmFyIExPQ0FMX0NPTkZJR19LRVkgPSAnZWxhc3RpY19hcG1fY29uZmlnJztcbnZhciBMT05HX1RBU0sgPSAnbG9uZ3Rhc2snO1xudmFyIFBBSU5UID0gJ3BhaW50JztcbnZhciBNRUFTVVJFID0gJ21lYXN1cmUnO1xudmFyIE5BVklHQVRJT04gPSAnbmF2aWdhdGlvbic7XG52YXIgUkVTT1VSQ0UgPSAncmVzb3VyY2UnO1xudmFyIEZJUlNUX0NPTlRFTlRGVUxfUEFJTlQgPSAnZmlyc3QtY29udGVudGZ1bC1wYWludCc7XG52YXIgTEFSR0VTVF9DT05URU5URlVMX1BBSU5UID0gJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCc7XG52YXIgRklSU1RfSU5QVVQgPSAnZmlyc3QtaW5wdXQnO1xudmFyIExBWU9VVF9TSElGVCA9ICdsYXlvdXQtc2hpZnQnO1xudmFyIEVWRU5UID0gJ2V2ZW50JztcbnZhciBFUlJPUlMgPSAnZXJyb3JzJztcbnZhciBUUkFOU0FDVElPTlMgPSAndHJhbnNhY3Rpb25zJztcbnZhciBDT05GSUdfU0VSVklDRSA9ICdDb25maWdTZXJ2aWNlJztcbnZhciBMT0dHSU5HX1NFUlZJQ0UgPSAnTG9nZ2luZ1NlcnZpY2UnO1xudmFyIFRSQU5TQUNUSU9OX1NFUlZJQ0UgPSAnVHJhbnNhY3Rpb25TZXJ2aWNlJztcbnZhciBBUE1fU0VSVkVSID0gJ0FwbVNlcnZlcic7XG52YXIgUEVSRk9STUFOQ0VfTU9OSVRPUklORyA9ICdQZXJmb3JtYW5jZU1vbml0b3JpbmcnO1xudmFyIEVSUk9SX0xPR0dJTkcgPSAnRXJyb3JMb2dnaW5nJztcbnZhciBUUlVOQ0FURURfVFlQRSA9ICcudHJ1bmNhdGVkJztcbnZhciBLRVlXT1JEX0xJTUlUID0gMTAyNDtcbnZhciBTRVNTSU9OX1RJTUVPVVQgPSAzMCAqIDYwMDAwO1xudmFyIEhUVFBfUkVRVUVTVF9USU1FT1VUID0gMTAwMDA7XG5leHBvcnQgeyBTQ0hFRFVMRSwgSU5WT0tFLCBBRERfRVZFTlRfTElTVEVORVJfU1RSLCBSRU1PVkVfRVZFTlRfTElTVEVORVJfU1RSLCBSRVNPVVJDRV9JTklUSUFUT1JfVFlQRVMsIFJFVVNBQklMSVRZX1RIUkVTSE9MRCwgTUFYX1NQQU5fRFVSQVRJT04sIFBBR0VfTE9BRF9ERUxBWSwgUEFHRV9MT0FELCBST1VURV9DSEFOR0UsIE5BTUVfVU5LTk9XTiwgUEFHRV9FWElULCBUWVBFX0NVU1RPTSwgVVNFUl9USU1JTkdfVEhSRVNIT0xELCBUUkFOU0FDVElPTl9TVEFSVCwgVFJBTlNBQ1RJT05fRU5ELCBDT05GSUdfQ0hBTkdFLCBRVUVVRV9GTFVTSCwgUVVFVUVfQUREX1RSQU5TQUNUSU9OLCBUUkFOU0FDVElPTl9JR05PUkUsIFhNTEhUVFBSRVFVRVNULCBGRVRDSCwgSElTVE9SWSwgRVZFTlRfVEFSR0VULCBDTElDSywgRVJST1IsIEJFRk9SRV9FVkVOVCwgQUZURVJfRVZFTlQsIExPQ0FMX0NPTkZJR19LRVksIEhUVFBfUkVRVUVTVF9UWVBFLCBMT05HX1RBU0ssIFBBSU5ULCBNRUFTVVJFLCBOQVZJR0FUSU9OLCBSRVNPVVJDRSwgRklSU1RfQ09OVEVOVEZVTF9QQUlOVCwgTEFSR0VTVF9DT05URU5URlVMX1BBSU5ULCBLRVlXT1JEX0xJTUlULCBURU1QT1JBUllfVFlQRSwgVVNFUl9JTlRFUkFDVElPTiwgVFJBTlNBQ1RJT05fVFlQRV9PUkRFUiwgRVJST1JTLCBUUkFOU0FDVElPTlMsIENPTkZJR19TRVJWSUNFLCBMT0dHSU5HX1NFUlZJQ0UsIFRSQU5TQUNUSU9OX1NFUlZJQ0UsIEFQTV9TRVJWRVIsIFBFUkZPUk1BTkNFX01PTklUT1JJTkcsIEVSUk9SX0xPR0dJTkcsIFRSVU5DQVRFRF9UWVBFLCBGSVJTVF9JTlBVVCwgTEFZT1VUX1NISUZULCBFVkVOVCwgT1VUQ09NRV9TVUNDRVNTLCBPVVRDT01FX0ZBSUxVUkUsIE9VVENPTUVfVU5LTk9XTiwgU0VTU0lPTl9USU1FT1VULCBIVFRQX1JFUVVFU1RfVElNRU9VVCB9OyIsInZhciBfZXhjbHVkZWQgPSBbXCJ0YWdzXCJdO1xuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShzb3VyY2UsIGV4Y2x1ZGVkKSB7IGlmIChzb3VyY2UgPT0gbnVsbCkgcmV0dXJuIHt9OyB2YXIgdGFyZ2V0ID0ge307IHZhciBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTsgdmFyIGtleSwgaTsgZm9yIChpID0gMDsgaSA8IHNvdXJjZUtleXMubGVuZ3RoOyBpKyspIHsga2V5ID0gc291cmNlS2V5c1tpXTsgaWYgKGV4Y2x1ZGVkLmluZGV4T2Yoa2V5KSA+PSAwKSBjb250aW51ZTsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmltcG9ydCB7IFVybCB9IGZyb20gJy4vdXJsJztcbmltcG9ydCB7IFBBR0VfTE9BRCwgUEFHRV9FWElULCBOQVZJR0FUSU9OIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgZ2V0U2VydmVyVGltaW5nSW5mbywgUEVSRiwgaXNQZXJmVGltZWxpbmVTdXBwb3J0ZWQgfSBmcm9tICcuL3V0aWxzJztcbnZhciBMRUZUX1NRVUFSRV9CUkFDS0VUID0gOTE7XG52YXIgUklHSFRfU1FVQVJFX0JSQUNLRVQgPSA5MztcbnZhciBFWFRFUk5BTCA9ICdleHRlcm5hbCc7XG52YXIgUkVTT1VSQ0UgPSAncmVzb3VyY2UnO1xudmFyIEhBUkRfTkFWSUdBVElPTiA9ICdoYXJkLW5hdmlnYXRpb24nO1xuXG5mdW5jdGlvbiBnZXRQb3J0TnVtYmVyKHBvcnQsIHByb3RvY29sKSB7XG4gIGlmIChwb3J0ID09PSAnJykge1xuICAgIHBvcnQgPSBwcm90b2NvbCA9PT0gJ2h0dHA6JyA/ICc4MCcgOiBwcm90b2NvbCA9PT0gJ2h0dHBzOicgPyAnNDQzJyA6ICcnO1xuICB9XG5cbiAgcmV0dXJuIHBvcnQ7XG59XG5cbmZ1bmN0aW9uIGdldFJlc3BvbnNlQ29udGV4dChwZXJmVGltaW5nRW50cnkpIHtcbiAgdmFyIHRyYW5zZmVyU2l6ZSA9IHBlcmZUaW1pbmdFbnRyeS50cmFuc2ZlclNpemUsXG4gICAgICBlbmNvZGVkQm9keVNpemUgPSBwZXJmVGltaW5nRW50cnkuZW5jb2RlZEJvZHlTaXplLFxuICAgICAgZGVjb2RlZEJvZHlTaXplID0gcGVyZlRpbWluZ0VudHJ5LmRlY29kZWRCb2R5U2l6ZSxcbiAgICAgIHNlcnZlclRpbWluZyA9IHBlcmZUaW1pbmdFbnRyeS5zZXJ2ZXJUaW1pbmc7XG4gIHZhciByZXNwQ29udGV4dCA9IHtcbiAgICB0cmFuc2Zlcl9zaXplOiB0cmFuc2ZlclNpemUsXG4gICAgZW5jb2RlZF9ib2R5X3NpemU6IGVuY29kZWRCb2R5U2l6ZSxcbiAgICBkZWNvZGVkX2JvZHlfc2l6ZTogZGVjb2RlZEJvZHlTaXplXG4gIH07XG4gIHZhciBzZXJ2ZXJUaW1pbmdTdHIgPSBnZXRTZXJ2ZXJUaW1pbmdJbmZvKHNlcnZlclRpbWluZyk7XG5cbiAgaWYgKHNlcnZlclRpbWluZ1N0cikge1xuICAgIHJlc3BDb250ZXh0LmhlYWRlcnMgPSB7XG4gICAgICAnc2VydmVyLXRpbWluZyc6IHNlcnZlclRpbWluZ1N0clxuICAgIH07XG4gIH1cblxuICByZXR1cm4gcmVzcENvbnRleHQ7XG59XG5cbmZ1bmN0aW9uIGdldERlc3RpbmF0aW9uKHBhcnNlZFVybCkge1xuICB2YXIgcG9ydCA9IHBhcnNlZFVybC5wb3J0LFxuICAgICAgcHJvdG9jb2wgPSBwYXJzZWRVcmwucHJvdG9jb2wsXG4gICAgICBob3N0bmFtZSA9IHBhcnNlZFVybC5ob3N0bmFtZTtcbiAgdmFyIHBvcnROdW1iZXIgPSBnZXRQb3J0TnVtYmVyKHBvcnQsIHByb3RvY29sKTtcbiAgdmFyIGlwdjZIb3N0bmFtZSA9IGhvc3RuYW1lLmNoYXJDb2RlQXQoMCkgPT09IExFRlRfU1FVQVJFX0JSQUNLRVQgJiYgaG9zdG5hbWUuY2hhckNvZGVBdChob3N0bmFtZS5sZW5ndGggLSAxKSA9PT0gUklHSFRfU1FVQVJFX0JSQUNLRVQ7XG4gIHZhciBhZGRyZXNzID0gaG9zdG5hbWU7XG5cbiAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgIGFkZHJlc3MgPSBob3N0bmFtZS5zbGljZSgxLCAtMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNlcnZpY2U6IHtcbiAgICAgIHJlc291cmNlOiBob3N0bmFtZSArICc6JyArIHBvcnROdW1iZXIsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIHR5cGU6ICcnXG4gICAgfSxcbiAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgIHBvcnQ6IE51bWJlcihwb3J0TnVtYmVyKVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRSZXNvdXJjZUNvbnRleHQoZGF0YSkge1xuICB2YXIgZW50cnkgPSBkYXRhLmVudHJ5LFxuICAgICAgdXJsID0gZGF0YS51cmw7XG4gIHZhciBwYXJzZWRVcmwgPSBuZXcgVXJsKHVybCk7XG4gIHZhciBkZXN0aW5hdGlvbiA9IGdldERlc3RpbmF0aW9uKHBhcnNlZFVybCk7XG4gIHJldHVybiB7XG4gICAgaHR0cDoge1xuICAgICAgdXJsOiB1cmwsXG4gICAgICByZXNwb25zZTogZ2V0UmVzcG9uc2VDb250ZXh0KGVudHJ5KVxuICAgIH0sXG4gICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEV4dGVybmFsQ29udGV4dChkYXRhKSB7XG4gIHZhciB1cmwgPSBkYXRhLnVybCxcbiAgICAgIG1ldGhvZCA9IGRhdGEubWV0aG9kLFxuICAgICAgdGFyZ2V0ID0gZGF0YS50YXJnZXQsXG4gICAgICByZXNwb25zZSA9IGRhdGEucmVzcG9uc2U7XG4gIHZhciBwYXJzZWRVcmwgPSBuZXcgVXJsKHVybCk7XG4gIHZhciBkZXN0aW5hdGlvbiA9IGdldERlc3RpbmF0aW9uKHBhcnNlZFVybCk7XG4gIHZhciBjb250ZXh0ID0ge1xuICAgIGh0dHA6IHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiBwYXJzZWRVcmwuaHJlZlxuICAgIH0sXG4gICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gIH07XG4gIHZhciBzdGF0dXNDb2RlO1xuXG4gIGlmICh0YXJnZXQgJiYgdHlwZW9mIHRhcmdldC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3RhdHVzQ29kZSA9IHRhcmdldC5zdGF0dXM7XG4gIH0gZWxzZSBpZiAocmVzcG9uc2UpIHtcbiAgICBzdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xuICB9XG5cbiAgY29udGV4dC5odHRwLnN0YXR1c19jb2RlID0gc3RhdHVzQ29kZTtcbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbmZ1bmN0aW9uIGdldE5hdmlnYXRpb25Db250ZXh0KGRhdGEpIHtcbiAgdmFyIHVybCA9IGRhdGEudXJsO1xuICB2YXIgcGFyc2VkVXJsID0gbmV3IFVybCh1cmwpO1xuICB2YXIgZGVzdGluYXRpb24gPSBnZXREZXN0aW5hdGlvbihwYXJzZWRVcmwpO1xuICByZXR1cm4ge1xuICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFnZUNvbnRleHQoKSB7XG4gIHJldHVybiB7XG4gICAgcGFnZToge1xuICAgICAgcmVmZXJlcjogZG9jdW1lbnQucmVmZXJyZXIsXG4gICAgICB1cmw6IGxvY2F0aW9uLmhyZWZcbiAgICB9XG4gIH07XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkU3BhbkNvbnRleHQoc3BhbiwgZGF0YSkge1xuICBpZiAoIWRhdGEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdHlwZSA9IHNwYW4udHlwZTtcbiAgdmFyIGNvbnRleHQ7XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBFWFRFUk5BTDpcbiAgICAgIGNvbnRleHQgPSBnZXRFeHRlcm5hbENvbnRleHQoZGF0YSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgUkVTT1VSQ0U6XG4gICAgICBjb250ZXh0ID0gZ2V0UmVzb3VyY2VDb250ZXh0KGRhdGEpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIEhBUkRfTkFWSUdBVElPTjpcbiAgICAgIGNvbnRleHQgPSBnZXROYXZpZ2F0aW9uQ29udGV4dChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgc3Bhbi5hZGRDb250ZXh0KGNvbnRleHQpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRyYW5zYWN0aW9uQ29udGV4dCh0cmFuc2FjdGlvbiwgX3RlbXApIHtcbiAgdmFyIF9yZWYgPSBfdGVtcCA9PT0gdm9pZCAwID8ge30gOiBfdGVtcCxcbiAgICAgIHRhZ3MgPSBfcmVmLnRhZ3MsXG4gICAgICBjb25maWdDb250ZXh0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoX3JlZiwgX2V4Y2x1ZGVkKTtcblxuICB2YXIgcGFnZUNvbnRleHQgPSBnZXRQYWdlQ29udGV4dCgpO1xuICB2YXIgcmVzcG9uc2VDb250ZXh0ID0ge307XG5cbiAgaWYgKHRyYW5zYWN0aW9uLnR5cGUgPT09IFBBR0VfRVhJVCkge1xuICAgIHRyYW5zYWN0aW9uLmVuc3VyZUNvbnRleHQoKTtcblxuICAgIGlmICh0cmFuc2FjdGlvbi5jb250ZXh0LnBhZ2UgJiYgdHJhbnNhY3Rpb24uY29udGV4dC5wYWdlLnVybCkge1xuICAgICAgcGFnZUNvbnRleHQucGFnZS51cmwgPSB0cmFuc2FjdGlvbi5jb250ZXh0LnBhZ2UudXJsO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0cmFuc2FjdGlvbi50eXBlID09PSBQQUdFX0xPQUQgJiYgaXNQZXJmVGltZWxpbmVTdXBwb3J0ZWQoKSkge1xuICAgIHZhciBlbnRyaWVzID0gUEVSRi5nZXRFbnRyaWVzQnlUeXBlKE5BVklHQVRJT04pO1xuXG4gICAgaWYgKGVudHJpZXMgJiYgZW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXNwb25zZUNvbnRleHQgPSB7XG4gICAgICAgIHJlc3BvbnNlOiBnZXRSZXNwb25zZUNvbnRleHQoZW50cmllc1swXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdHJhbnNhY3Rpb24uYWRkQ29udGV4dChwYWdlQ29udGV4dCwgcmVzcG9uc2VDb250ZXh0LCBjb25maWdDb250ZXh0KTtcbn0iLCJpbXBvcnQgeyBCRUZPUkVfRVZFTlQsIEFGVEVSX0VWRU5UIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG52YXIgRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFdmVudEhhbmRsZXIoKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBFdmVudEhhbmRsZXIucHJvdG90eXBlO1xuXG4gIF9wcm90by5vYnNlcnZlID0gZnVuY3Rpb24gb2JzZXJ2ZShuYW1lLCBmbikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoIXRoaXMub2JzZXJ2ZXJzW25hbWVdKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzW25hbWVdID0gW107XG4gICAgICB9XG5cbiAgICAgIHRoaXMub2JzZXJ2ZXJzW25hbWVdLnB1c2goZm4pO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gX3RoaXMub2JzZXJ2ZXJzW25hbWVdLmluZGV4T2YoZm4pO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgX3RoaXMub2JzZXJ2ZXJzW25hbWVdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5zZW5kT25seSA9IGZ1bmN0aW9uIHNlbmRPbmx5KG5hbWUsIGFyZ3MpIHtcbiAgICB2YXIgb2JzID0gdGhpcy5vYnNlcnZlcnNbbmFtZV07XG5cbiAgICBpZiAob2JzKSB7XG4gICAgICBvYnMuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmbi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLCBlcnJvci5zdGFjayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uc2VuZCA9IGZ1bmN0aW9uIHNlbmQobmFtZSwgYXJncykge1xuICAgIHRoaXMuc2VuZE9ubHkobmFtZSArIEJFRk9SRV9FVkVOVCwgYXJncyk7XG4gICAgdGhpcy5zZW5kT25seShuYW1lLCBhcmdzKTtcbiAgICB0aGlzLnNlbmRPbmx5KG5hbWUgKyBBRlRFUl9FVkVOVCwgYXJncyk7XG4gIH07XG5cbiAgcmV0dXJuIEV2ZW50SGFuZGxlcjtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRIYW5kbGVyOyIsImZ1bmN0aW9uIF9leHRlbmRzKCkgeyBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07IHJldHVybiBfZXh0ZW5kcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG5cbmltcG9ydCB7IEhUVFBfUkVRVUVTVF9USU1FT1VUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IGlzUmVzcG9uc2VTdWNjZXNzZnVsIH0gZnJvbSAnLi9yZXNwb25zZS1zdGF0dXMnO1xuZXhwb3J0IHZhciBCWVRFX0xJTUlUID0gNjAgKiAxMDAwO1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFVzZUZldGNoV2l0aEtlZXBBbGl2ZShtZXRob2QsIHBheWxvYWQpIHtcbiAgaWYgKCFpc0ZldGNoU3VwcG9ydGVkKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgaXNLZWVwQWxpdmVTdXBwb3J0ZWQgPSAoJ2tlZXBhbGl2ZScgaW4gbmV3IFJlcXVlc3QoJycpKTtcblxuICBpZiAoIWlzS2VlcEFsaXZlU3VwcG9ydGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHNpemUgPSBjYWxjdWxhdGVTaXplKHBheWxvYWQpO1xuICByZXR1cm4gbWV0aG9kID09PSAnUE9TVCcgJiYgc2l6ZSA8IEJZVEVfTElNSVQ7XG59XG5leHBvcnQgZnVuY3Rpb24gc2VuZEZldGNoUmVxdWVzdChtZXRob2QsIHVybCwgX3JlZikge1xuICB2YXIgX3JlZiRrZWVwYWxpdmUgPSBfcmVmLmtlZXBhbGl2ZSxcbiAgICAgIGtlZXBhbGl2ZSA9IF9yZWYka2VlcGFsaXZlID09PSB2b2lkIDAgPyBmYWxzZSA6IF9yZWYka2VlcGFsaXZlLFxuICAgICAgX3JlZiR0aW1lb3V0ID0gX3JlZi50aW1lb3V0LFxuICAgICAgdGltZW91dCA9IF9yZWYkdGltZW91dCA9PT0gdm9pZCAwID8gSFRUUF9SRVFVRVNUX1RJTUVPVVQgOiBfcmVmJHRpbWVvdXQsXG4gICAgICBwYXlsb2FkID0gX3JlZi5wYXlsb2FkLFxuICAgICAgaGVhZGVycyA9IF9yZWYuaGVhZGVycyxcbiAgICAgIHNlbmRDcmVkZW50aWFscyA9IF9yZWYuc2VuZENyZWRlbnRpYWxzO1xuICB2YXIgdGltZW91dENvbmZpZyA9IHt9O1xuXG4gIGlmICh0eXBlb2YgQWJvcnRDb250cm9sbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgdGltZW91dENvbmZpZy5zaWduYWwgPSBjb250cm9sbGVyLnNpZ25hbDtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb250cm9sbGVyLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICB2YXIgZmV0Y2hSZXNwb25zZTtcbiAgcmV0dXJuIHdpbmRvdy5mZXRjaCh1cmwsIF9leHRlbmRzKHtcbiAgICBib2R5OiBwYXlsb2FkLFxuICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgbWV0aG9kOiBtZXRob2QsXG4gICAga2VlcGFsaXZlOiBrZWVwYWxpdmUsXG4gICAgY3JlZGVudGlhbHM6IHNlbmRDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6ICdvbWl0J1xuICB9LCB0aW1lb3V0Q29uZmlnKSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICBmZXRjaFJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgcmV0dXJuIGZldGNoUmVzcG9uc2UudGV4dCgpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZVRleHQpIHtcbiAgICB2YXIgYm9keVJlc3BvbnNlID0ge1xuICAgICAgdXJsOiB1cmwsXG4gICAgICBzdGF0dXM6IGZldGNoUmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2VUZXh0OiByZXNwb25zZVRleHRcbiAgICB9O1xuXG4gICAgaWYgKCFpc1Jlc3BvbnNlU3VjY2Vzc2Z1bChmZXRjaFJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICAgIHRocm93IGJvZHlSZXNwb25zZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYm9keVJlc3BvbnNlO1xuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0ZldGNoU3VwcG9ydGVkKCkge1xuICByZXR1cm4gdHlwZW9mIHdpbmRvdy5mZXRjaCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygd2luZG93LlJlcXVlc3QgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVNpemUocGF5bG9hZCkge1xuICBpZiAoIXBheWxvYWQpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgQmxvYikge1xuICAgIHJldHVybiBwYXlsb2FkLnNpemU7XG4gIH1cblxuICByZXR1cm4gbmV3IEJsb2IoW3BheWxvYWRdKS5zaXplO1xufSIsImV4cG9ydCBmdW5jdGlvbiBpc1Jlc3BvbnNlU3VjY2Vzc2Z1bChzdGF0dXMpIHtcbiAgaWYgKHN0YXR1cyA9PT0gMCB8fCBzdGF0dXMgPiAzOTkgJiYgc3RhdHVzIDwgNjAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59IiwiaW1wb3J0IHsgWEhSX0lHTk9SRSB9IGZyb20gJy4uL3BhdGNoaW5nL3BhdGNoLXV0aWxzJztcbmltcG9ydCB7IGlzUmVzcG9uc2VTdWNjZXNzZnVsIH0gZnJvbSAnLi9yZXNwb25zZS1zdGF0dXMnO1xuaW1wb3J0IHsgUHJvbWlzZSB9IGZyb20gJy4uL3BvbHlmaWxscyc7XG5leHBvcnQgZnVuY3Rpb24gc2VuZFhIUihtZXRob2QsIHVybCwgX3JlZikge1xuICB2YXIgX3JlZiR0aW1lb3V0ID0gX3JlZi50aW1lb3V0LFxuICAgICAgdGltZW91dCA9IF9yZWYkdGltZW91dCA9PT0gdm9pZCAwID8gSFRUUF9SRVFVRVNUX1RJTUVPVVQgOiBfcmVmJHRpbWVvdXQsXG4gICAgICBwYXlsb2FkID0gX3JlZi5wYXlsb2FkLFxuICAgICAgaGVhZGVycyA9IF9yZWYuaGVhZGVycyxcbiAgICAgIGJlZm9yZVNlbmQgPSBfcmVmLmJlZm9yZVNlbmQsXG4gICAgICBzZW5kQ3JlZGVudGlhbHMgPSBfcmVmLnNlbmRDcmVkZW50aWFscztcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhocltYSFJfSUdOT1JFXSA9IHRydWU7XG4gICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgIHhoci50aW1lb3V0ID0gdGltZW91dDtcbiAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gc2VuZENyZWRlbnRpYWxzO1xuXG4gICAgaWYgKGhlYWRlcnMpIHtcbiAgICAgIGZvciAodmFyIGhlYWRlciBpbiBoZWFkZXJzKSB7XG4gICAgICAgIGlmIChoZWFkZXJzLmhhc093blByb3BlcnR5KGhlYWRlcikpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIGhlYWRlcnNbaGVhZGVyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzLFxuICAgICAgICAgICAgcmVzcG9uc2VUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgICBpZiAoaXNSZXNwb25zZVN1Y2Nlc3NmdWwoc3RhdHVzKSkge1xuICAgICAgICAgIHJlc29sdmUoeGhyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICAgIHJlc3BvbnNlVGV4dDogcmVzcG9uc2VUZXh0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cyxcbiAgICAgICAgICByZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgcmVqZWN0KHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICByZXNwb25zZVRleHQ6IHJlc3BvbnNlVGV4dFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBjYW5TZW5kID0gdHJ1ZTtcblxuICAgIGlmICh0eXBlb2YgYmVmb3JlU2VuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FuU2VuZCA9IGJlZm9yZVNlbmQoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgIHhocjogeGhyXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY2FuU2VuZCkge1xuICAgICAgeGhyLnNlbmQocGF5bG9hZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlamVjdCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgIHJlc3BvbnNlVGV4dDogJ1JlcXVlc3QgcmVqZWN0ZWQgYnkgdXNlciBjb25maWd1cmF0aW9uLidcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59IiwiaW1wb3J0IHsgWE1MSFRUUFJFUVVFU1QsIEZFVENILCBISVNUT1JZLCBQQUdFX0xPQUQsIEVSUk9SLCBFVkVOVF9UQVJHRVQsIENMSUNLIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RydW1lbnRhdGlvbkZsYWdzKGluc3RydW1lbnQsIGRpc2FibGVkSW5zdHJ1bWVudGF0aW9ucykge1xuICB2YXIgX2ZsYWdzO1xuXG4gIHZhciBmbGFncyA9IChfZmxhZ3MgPSB7fSwgX2ZsYWdzW1hNTEhUVFBSRVFVRVNUXSA9IGZhbHNlLCBfZmxhZ3NbRkVUQ0hdID0gZmFsc2UsIF9mbGFnc1tISVNUT1JZXSA9IGZhbHNlLCBfZmxhZ3NbUEFHRV9MT0FEXSA9IGZhbHNlLCBfZmxhZ3NbRVJST1JdID0gZmFsc2UsIF9mbGFnc1tFVkVOVF9UQVJHRVRdID0gZmFsc2UsIF9mbGFnc1tDTElDS10gPSBmYWxzZSwgX2ZsYWdzKTtcblxuICBpZiAoIWluc3RydW1lbnQpIHtcbiAgICByZXR1cm4gZmxhZ3M7XG4gIH1cblxuICBPYmplY3Qua2V5cyhmbGFncykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGRpc2FibGVkSW5zdHJ1bWVudGF0aW9ucy5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICBmbGFnc1trZXldID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZmxhZ3M7XG59IiwiaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4vdXRpbHMnO1xuXG52YXIgTG9nZ2luZ1NlcnZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIExvZ2dpbmdTZXJ2aWNlKHNwZWMpIHtcbiAgICBpZiAoc3BlYyA9PT0gdm9pZCAwKSB7XG4gICAgICBzcGVjID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5sZXZlbHMgPSBbJ3RyYWNlJywgJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddO1xuICAgIHRoaXMubGV2ZWwgPSBzcGVjLmxldmVsIHx8ICd3YXJuJztcbiAgICB0aGlzLnByZWZpeCA9IHNwZWMucHJlZml4IHx8ICcnO1xuICAgIHRoaXMucmVzZXRMb2dNZXRob2RzKCk7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gTG9nZ2luZ1NlcnZpY2UucHJvdG90eXBlO1xuXG4gIF9wcm90by5zaG91bGRMb2cgPSBmdW5jdGlvbiBzaG91bGRMb2cobGV2ZWwpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbHMuaW5kZXhPZihsZXZlbCkgPj0gdGhpcy5sZXZlbHMuaW5kZXhPZih0aGlzLmxldmVsKTtcbiAgfTtcblxuICBfcHJvdG8uc2V0TGV2ZWwgPSBmdW5jdGlvbiBzZXRMZXZlbChsZXZlbCkge1xuICAgIGlmIChsZXZlbCA9PT0gdGhpcy5sZXZlbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgICB0aGlzLnJlc2V0TG9nTWV0aG9kcygpO1xuICB9O1xuXG4gIF9wcm90by5yZXNldExvZ01ldGhvZHMgPSBmdW5jdGlvbiByZXNldExvZ01ldGhvZHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMubGV2ZWxzLmZvckVhY2goZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgICBfdGhpc1tsZXZlbF0gPSBfdGhpcy5zaG91bGRMb2cobGV2ZWwpID8gbG9nIDogbm9vcDtcblxuICAgICAgZnVuY3Rpb24gbG9nKCkge1xuICAgICAgICB2YXIgbm9ybWFsaXplZExldmVsID0gbGV2ZWw7XG5cbiAgICAgICAgaWYgKGxldmVsID09PSAndHJhY2UnIHx8IGxldmVsID09PSAnZGVidWcnKSB7XG4gICAgICAgICAgbm9ybWFsaXplZExldmVsID0gJ2luZm8nO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIGFyZ3NbMF0gPSB0aGlzLnByZWZpeCArIGFyZ3NbMF07XG5cbiAgICAgICAgaWYgKGNvbnNvbGUpIHtcbiAgICAgICAgICB2YXIgcmVhbE1ldGhvZCA9IGNvbnNvbGVbbm9ybWFsaXplZExldmVsXSB8fCBjb25zb2xlLmxvZztcblxuICAgICAgICAgIGlmICh0eXBlb2YgcmVhbE1ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmVhbE1ldGhvZC5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gTG9nZ2luZ1NlcnZpY2U7XG59KCk7XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2dpbmdTZXJ2aWNlOyIsInZhciBOREpTT04gPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE5ESlNPTigpIHt9XG5cbiAgTkRKU09OLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIHN0cmluZ2lmeShvYmplY3QpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqZWN0KSArICdcXG4nO1xuICB9O1xuXG4gIHJldHVybiBOREpTT047XG59KCk7XG5cbmV4cG9ydCBkZWZhdWx0IE5ESlNPTjsiLCJpbXBvcnQgeyBVU0VSX0lOVEVSQUNUSU9OIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbnZhciBJTlRFUkFDVElWRV9TRUxFQ1RPUiA9ICdhW2RhdGEtdHJhbnNhY3Rpb24tbmFtZV0sIGJ1dHRvbltkYXRhLXRyYW5zYWN0aW9uLW5hbWVdJztcbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlUGFnZUNsaWNrcyh0cmFuc2FjdGlvblNlcnZpY2UpIHtcbiAgdmFyIGNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICBjcmVhdGVVc2VySW50ZXJhY3Rpb25UcmFuc2FjdGlvbih0cmFuc2FjdGlvblNlcnZpY2UsIGV2ZW50LnRhcmdldCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBldmVudE5hbWUgPSAnY2xpY2snO1xuICB2YXIgdXNlQ2FwdHVyZSA9IHRydWU7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2xpY2tIYW5kbGVyLCB1c2VDYXB0dXJlKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNsaWNrSGFuZGxlciwgdXNlQ2FwdHVyZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVVzZXJJbnRlcmFjdGlvblRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uU2VydmljZSwgdGFyZ2V0KSB7XG4gIHZhciBfZ2V0VHJhbnNhY3Rpb25NZXRhZGEgPSBnZXRUcmFuc2FjdGlvbk1ldGFkYXRhKHRhcmdldCksXG4gICAgICB0cmFuc2FjdGlvbk5hbWUgPSBfZ2V0VHJhbnNhY3Rpb25NZXRhZGEudHJhbnNhY3Rpb25OYW1lLFxuICAgICAgY29udGV4dCA9IF9nZXRUcmFuc2FjdGlvbk1ldGFkYS5jb250ZXh0O1xuXG4gIHZhciB0ciA9IHRyYW5zYWN0aW9uU2VydmljZS5zdGFydFRyYW5zYWN0aW9uKFwiQ2xpY2sgLSBcIiArIHRyYW5zYWN0aW9uTmFtZSwgVVNFUl9JTlRFUkFDVElPTiwge1xuICAgIG1hbmFnZWQ6IHRydWUsXG4gICAgY2FuUmV1c2U6IHRydWUsXG4gICAgcmV1c2VUaHJlc2hvbGQ6IDMwMFxuICB9KTtcblxuICBpZiAodHIgJiYgY29udGV4dCkge1xuICAgIHRyLmFkZENvbnRleHQoY29udGV4dCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHJhbnNhY3Rpb25NZXRhZGF0YSh0YXJnZXQpIHtcbiAgdmFyIG1ldGFkYXRhID0ge1xuICAgIHRyYW5zYWN0aW9uTmFtZTogbnVsbCxcbiAgICBjb250ZXh0OiBudWxsXG4gIH07XG4gIG1ldGFkYXRhLnRyYW5zYWN0aW9uTmFtZSA9IGJ1aWxkVHJhbnNhY3Rpb25OYW1lKHRhcmdldCk7XG4gIHZhciBjbGFzc2VzID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnY2xhc3MnKTtcblxuICBpZiAoY2xhc3Nlcykge1xuICAgIG1ldGFkYXRhLmNvbnRleHQgPSB7XG4gICAgICBjdXN0b206IHtcbiAgICAgICAgY2xhc3NlczogY2xhc3Nlc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gbWV0YWRhdGE7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVHJhbnNhY3Rpb25OYW1lKHRhcmdldCkge1xuICB2YXIgZHROYW1lID0gZmluZEN1c3RvbVRyYW5zYWN0aW9uTmFtZSh0YXJnZXQpO1xuXG4gIGlmIChkdE5hbWUpIHtcbiAgICByZXR1cm4gZHROYW1lO1xuICB9XG5cbiAgdmFyIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICB2YXIgbmFtZSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcblxuICBpZiAoISFuYW1lKSB7XG4gICAgcmV0dXJuIHRhZ05hbWUgKyBcIltcXFwiXCIgKyBuYW1lICsgXCJcXFwiXVwiO1xuICB9XG5cbiAgcmV0dXJuIHRhZ05hbWU7XG59XG5cbmZ1bmN0aW9uIGZpbmRDdXN0b21UcmFuc2FjdGlvbk5hbWUodGFyZ2V0KSB7XG4gIGlmICh0YXJnZXQuY2xvc2VzdCkge1xuICAgIHZhciBlbGVtZW50ID0gdGFyZ2V0LmNsb3Nlc3QoSU5URVJBQ1RJVkVfU0VMRUNUT1IpO1xuICAgIHJldHVybiBlbGVtZW50ID8gZWxlbWVudC5kYXRhc2V0LnRyYW5zYWN0aW9uTmFtZSA6IG51bGw7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0LmRhdGFzZXQudHJhbnNhY3Rpb25OYW1lO1xufSIsImltcG9ydCB7IFFVRVVFX0FERF9UUkFOU0FDVElPTiwgUVVFVUVfRkxVU0gsIFRSQU5TQUNUSU9OX0lHTk9SRSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gJy4uLy4uL3N0YXRlJztcbmltcG9ydCB7IG5vdyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHJlcG9ydElucCB9IGZyb20gJy4uLy4uL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvbWV0cmljcy9pbnAvcmVwb3J0JztcbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlUGFnZVZpc2liaWxpdHkoY29uZmlnU2VydmljZSwgdHJhbnNhY3Rpb25TZXJ2aWNlKSB7XG4gIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICdoaWRkZW4nKSB7XG4gICAgc3RhdGUubGFzdEhpZGRlblN0YXJ0ID0gMDtcbiAgfVxuXG4gIHZhciB2aXNpYmlsaXR5Q2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uIHZpc2liaWxpdHlDaGFuZ2VIYW5kbGVyKCkge1xuICAgIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICdoaWRkZW4nKSB7XG4gICAgICBvblBhZ2VIaWRkZW4oY29uZmlnU2VydmljZSwgdHJhbnNhY3Rpb25TZXJ2aWNlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHBhZ2VIaWRlSGFuZGxlciA9IGZ1bmN0aW9uIHBhZ2VIaWRlSGFuZGxlcigpIHtcbiAgICByZXR1cm4gb25QYWdlSGlkZGVuKGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSk7XG4gIH07XG5cbiAgdmFyIHVzZUNhcHR1cmUgPSB0cnVlO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLCB1c2VDYXB0dXJlKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BhZ2VoaWRlJywgcGFnZUhpZGVIYW5kbGVyLCB1c2VDYXB0dXJlKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLCB1c2VDYXB0dXJlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGFnZWhpZGUnLCBwYWdlSGlkZUhhbmRsZXIsIHVzZUNhcHR1cmUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvblBhZ2VIaWRkZW4oY29uZmlnU2VydmljZSwgdHJhbnNhY3Rpb25TZXJ2aWNlKSB7XG4gIHZhciBpbnBUciA9IHJlcG9ydElucCh0cmFuc2FjdGlvblNlcnZpY2UpO1xuXG4gIGlmIChpbnBUcikge1xuICAgIHZhciB1bm9ic2VydmUgPSBjb25maWdTZXJ2aWNlLm9ic2VydmVFdmVudChRVUVVRV9BRERfVFJBTlNBQ1RJT04sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGVuZE1hbmFnZWRUcmFuc2FjdGlvbihjb25maWdTZXJ2aWNlLCB0cmFuc2FjdGlvblNlcnZpY2UpO1xuICAgICAgdW5vYnNlcnZlKCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZW5kTWFuYWdlZFRyYW5zYWN0aW9uKGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5kTWFuYWdlZFRyYW5zYWN0aW9uKGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSkge1xuICB2YXIgdHIgPSB0cmFuc2FjdGlvblNlcnZpY2UuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG5cbiAgaWYgKHRyKSB7XG4gICAgdmFyIHVub2JzZXJ2ZURpc2NhcmQgPSBjb25maWdTZXJ2aWNlLm9ic2VydmVFdmVudChUUkFOU0FDVElPTl9JR05PUkUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0YXRlLmxhc3RIaWRkZW5TdGFydCA9IG5vdygpO1xuICAgICAgdW5vYnNlcnZlRGlzY2FyZCgpO1xuICAgICAgdW5vYnNlcnZlUXVldWVBZGQoKTtcbiAgICB9KTtcbiAgICB2YXIgdW5vYnNlcnZlUXVldWVBZGQgPSBjb25maWdTZXJ2aWNlLm9ic2VydmVFdmVudChRVUVVRV9BRERfVFJBTlNBQ1RJT04sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbmZpZ1NlcnZpY2UuZGlzcGF0Y2hFdmVudChRVUVVRV9GTFVTSCk7XG4gICAgICBzdGF0ZS5sYXN0SGlkZGVuU3RhcnQgPSBub3coKTtcbiAgICAgIHVub2JzZXJ2ZVF1ZXVlQWRkKCk7XG4gICAgICB1bm9ic2VydmVEaXNjYXJkKCk7XG4gICAgfSk7XG4gICAgdHIuZW5kKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnU2VydmljZS5kaXNwYXRjaEV2ZW50KFFVRVVFX0ZMVVNIKTtcbiAgICBzdGF0ZS5sYXN0SGlkZGVuU3RhcnQgPSBub3coKTtcbiAgfVxufSIsImltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuLi9wb2x5ZmlsbHMnO1xuaW1wb3J0IHsgZ2xvYmFsU3RhdGUgfSBmcm9tICcuL3BhdGNoLXV0aWxzJztcbmltcG9ydCB7IFNDSEVEVUxFLCBJTlZPS0UsIEZFVENIIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IHNjaGVkdWxlTWljcm9UYXNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgaXNGZXRjaFN1cHBvcnRlZCB9IGZyb20gJy4uL2h0dHAvZmV0Y2gnO1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoRmV0Y2goY2FsbGJhY2spIHtcbiAgaWYgKCFpc0ZldGNoU3VwcG9ydGVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBzY2hlZHVsZVRhc2sodGFzaykge1xuICAgIHRhc2suc3RhdGUgPSBTQ0hFRFVMRTtcbiAgICBjYWxsYmFjayhTQ0hFRFVMRSwgdGFzayk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VUYXNrKHRhc2spIHtcbiAgICB0YXNrLnN0YXRlID0gSU5WT0tFO1xuICAgIGNhbGxiYWNrKElOVk9LRSwgdGFzayk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZUVycm9yKHRhc2ssIGVycm9yKSB7XG4gICAgdGFzay5kYXRhLmFib3J0ZWQgPSBpc0Fib3J0RXJyb3IoZXJyb3IpO1xuICAgIHRhc2suZGF0YS5lcnJvciA9IGVycm9yO1xuICAgIGludm9rZVRhc2sodGFzayk7XG4gIH1cblxuICBmdW5jdGlvbiByZWFkU3RyZWFtKHN0cmVhbSwgdGFzaykge1xuICAgIHZhciByZWFkZXIgPSBzdHJlYW0uZ2V0UmVhZGVyKCk7XG5cbiAgICB2YXIgcmVhZCA9IGZ1bmN0aW9uIHJlYWQoKSB7XG4gICAgICByZWFkZXIucmVhZCgpLnRoZW4oZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgdmFyIGRvbmUgPSBfcmVmLmRvbmU7XG5cbiAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICBpbnZva2VUYXNrKHRhc2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYWQoKTtcbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIGhhbmRsZVJlc3BvbnNlRXJyb3IodGFzaywgZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlYWQoKTtcbiAgfVxuXG4gIHZhciBuYXRpdmVGZXRjaCA9IHdpbmRvdy5mZXRjaDtcblxuICB3aW5kb3cuZmV0Y2ggPSBmdW5jdGlvbiAoaW5wdXQsIGluaXQpIHtcbiAgICB2YXIgZmV0Y2hTZWxmID0gdGhpcztcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgcmVxdWVzdCwgdXJsO1xuICAgIHZhciBpc1VSTCA9IGlucHV0IGluc3RhbmNlb2YgVVJMO1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHwgaXNVUkwpIHtcbiAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdCk7XG5cbiAgICAgIGlmIChpc1VSTCkge1xuICAgICAgICB1cmwgPSByZXF1ZXN0LnVybDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybCA9IGlucHV0O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5wdXQpIHtcbiAgICAgIHJlcXVlc3QgPSBpbnB1dDtcbiAgICAgIHVybCA9IHJlcXVlc3QudXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmF0aXZlRmV0Y2guYXBwbHkoZmV0Y2hTZWxmLCBhcmdzKTtcbiAgICB9XG5cbiAgICB2YXIgdGFzayA9IHtcbiAgICAgIHNvdXJjZTogRkVUQ0gsXG4gICAgICBzdGF0ZTogJycsXG4gICAgICB0eXBlOiAnbWFjcm9UYXNrJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGFyZ2V0OiByZXF1ZXN0LFxuICAgICAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgYWJvcnRlZDogZmFsc2VcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBnbG9iYWxTdGF0ZS5mZXRjaEluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgc2NoZWR1bGVUYXNrKHRhc2spO1xuICAgICAgdmFyIHByb21pc2U7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHByb21pc2UgPSBuYXRpdmVGZXRjaC5hcHBseShmZXRjaFNlbGYsIFtyZXF1ZXN0XSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB0YXNrLmRhdGEuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgaW52b2tlVGFzayh0YXNrKTtcbiAgICAgICAgZ2xvYmFsU3RhdGUuZmV0Y2hJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICB2YXIgY2xvbmVkUmVzcG9uc2UgPSByZXNwb25zZS5jbG9uZSA/IHJlc3BvbnNlLmNsb25lKCkgOiB7fTtcbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIHNjaGVkdWxlTWljcm9UYXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0YXNrLmRhdGEucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgICB2YXIgYm9keSA9IGNsb25lZFJlc3BvbnNlLmJvZHk7XG5cbiAgICAgICAgICBpZiAoYm9keSkge1xuICAgICAgICAgICAgcmVhZFN0cmVhbShib2R5LCB0YXNrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW52b2tlVGFzayh0YXNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIHNjaGVkdWxlTWljcm9UYXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBoYW5kbGVSZXNwb25zZUVycm9yKHRhc2ssIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGdsb2JhbFN0YXRlLmZldGNoSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBpc0Fib3J0RXJyb3IoZXJyb3IpIHtcbiAgcmV0dXJuIGVycm9yICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJztcbn0iLCJpbXBvcnQgeyBJTlZPS0UsIEhJU1RPUlkgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoSGlzdG9yeShjYWxsYmFjaykge1xuICBpZiAoIXdpbmRvdy5oaXN0b3J5KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG5hdGl2ZVB1c2hTdGF0ZSA9IGhpc3RvcnkucHVzaFN0YXRlO1xuXG4gIGlmICh0eXBlb2YgbmF0aXZlUHVzaFN0YXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUsIHRpdGxlLCB1cmwpIHtcbiAgICAgIHZhciB0YXNrID0ge1xuICAgICAgICBzb3VyY2U6IEhJU1RPUlksXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgIHVybDogdXJsXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjYWxsYmFjayhJTlZPS0UsIHRhc2spO1xuICAgICAgbmF0aXZlUHVzaFN0YXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxufSIsImltcG9ydCB7IHBhdGNoWE1MSHR0cFJlcXVlc3QgfSBmcm9tICcuL3hoci1wYXRjaCc7XG5pbXBvcnQgeyBwYXRjaEZldGNoIH0gZnJvbSAnLi9mZXRjaC1wYXRjaCc7XG5pbXBvcnQgeyBwYXRjaEhpc3RvcnkgfSBmcm9tICcuL2hpc3RvcnktcGF0Y2gnO1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9ldmVudC1oYW5kbGVyJztcbmltcG9ydCB7IEhJU1RPUlksIEZFVENILCBYTUxIVFRQUkVRVUVTVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG52YXIgcGF0Y2hFdmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG52YXIgYWxyZWFkeVBhdGNoZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gcGF0Y2hBbGwoKSB7XG4gIGlmICghYWxyZWFkeVBhdGNoZWQpIHtcbiAgICBhbHJlYWR5UGF0Y2hlZCA9IHRydWU7XG4gICAgcGF0Y2hYTUxIdHRwUmVxdWVzdChmdW5jdGlvbiAoZXZlbnQsIHRhc2spIHtcbiAgICAgIHBhdGNoRXZlbnRIYW5kbGVyLnNlbmQoWE1MSFRUUFJFUVVFU1QsIFtldmVudCwgdGFza10pO1xuICAgIH0pO1xuICAgIHBhdGNoRmV0Y2goZnVuY3Rpb24gKGV2ZW50LCB0YXNrKSB7XG4gICAgICBwYXRjaEV2ZW50SGFuZGxlci5zZW5kKEZFVENILCBbZXZlbnQsIHRhc2tdKTtcbiAgICB9KTtcbiAgICBwYXRjaEhpc3RvcnkoZnVuY3Rpb24gKGV2ZW50LCB0YXNrKSB7XG4gICAgICBwYXRjaEV2ZW50SGFuZGxlci5zZW5kKEhJU1RPUlksIFtldmVudCwgdGFza10pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBhdGNoRXZlbnRIYW5kbGVyO1xufVxuXG5leHBvcnQgeyBwYXRjaEFsbCwgcGF0Y2hFdmVudEhhbmRsZXIgfTsiLCJleHBvcnQgdmFyIGdsb2JhbFN0YXRlID0ge1xuICBmZXRjaEluUHJvZ3Jlc3M6IGZhbHNlXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGFwbVN5bWJvbChuYW1lKSB7XG4gIHJldHVybiAnX19hcG1fc3ltYm9sX18nICsgbmFtZTtcbn1cblxuZnVuY3Rpb24gaXNQcm9wZXJ0eVdyaXRhYmxlKHByb3BlcnR5RGVzYykge1xuICBpZiAoIXByb3BlcnR5RGVzYykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHByb3BlcnR5RGVzYy53cml0YWJsZSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gISh0eXBlb2YgcHJvcGVydHlEZXNjLmdldCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgcHJvcGVydHlEZXNjLnNldCA9PT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hPcmlnaW5Ub1BhdGNoZWQocGF0Y2hlZCwgb3JpZ2luYWwpIHtcbiAgcGF0Y2hlZFthcG1TeW1ib2woJ09yaWdpbmFsRGVsZWdhdGUnKV0gPSBvcmlnaW5hbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoTWV0aG9kKHRhcmdldCwgbmFtZSwgcGF0Y2hGbikge1xuICB2YXIgcHJvdG8gPSB0YXJnZXQ7XG5cbiAgd2hpbGUgKHByb3RvICYmICFwcm90by5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgfVxuXG4gIGlmICghcHJvdG8gJiYgdGFyZ2V0W25hbWVdKSB7XG4gICAgcHJvdG8gPSB0YXJnZXQ7XG4gIH1cblxuICB2YXIgZGVsZWdhdGVOYW1lID0gYXBtU3ltYm9sKG5hbWUpO1xuICB2YXIgZGVsZWdhdGU7XG5cbiAgaWYgKHByb3RvICYmICEoZGVsZWdhdGUgPSBwcm90b1tkZWxlZ2F0ZU5hbWVdKSkge1xuICAgIGRlbGVnYXRlID0gcHJvdG9bZGVsZWdhdGVOYW1lXSA9IHByb3RvW25hbWVdO1xuICAgIHZhciBkZXNjID0gcHJvdG8gJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbmFtZSk7XG5cbiAgICBpZiAoaXNQcm9wZXJ0eVdyaXRhYmxlKGRlc2MpKSB7XG4gICAgICB2YXIgcGF0Y2hEZWxlZ2F0ZSA9IHBhdGNoRm4oZGVsZWdhdGUsIGRlbGVnYXRlTmFtZSwgbmFtZSk7XG5cbiAgICAgIHByb3RvW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcGF0Y2hEZWxlZ2F0ZSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgICAgYXR0YWNoT3JpZ2luVG9QYXRjaGVkKHByb3RvW25hbWVdLCBkZWxlZ2F0ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlbGVnYXRlO1xufVxuZXhwb3J0IHZhciBYSFJfSUdOT1JFID0gYXBtU3ltYm9sKCd4aHJJZ25vcmUnKTtcbmV4cG9ydCB2YXIgWEhSX1NZTkMgPSBhcG1TeW1ib2woJ3hoclN5bmMnKTtcbmV4cG9ydCB2YXIgWEhSX1VSTCA9IGFwbVN5bWJvbCgneGhyVVJMJyk7XG5leHBvcnQgdmFyIFhIUl9NRVRIT0QgPSBhcG1TeW1ib2woJ3hock1ldGhvZCcpOyIsImltcG9ydCB7IHBhdGNoTWV0aG9kLCBYSFJfU1lOQywgWEhSX1VSTCwgWEhSX01FVEhPRCwgWEhSX0lHTk9SRSB9IGZyb20gJy4vcGF0Y2gtdXRpbHMnO1xuaW1wb3J0IHsgU0NIRURVTEUsIElOVk9LRSwgWE1MSFRUUFJFUVVFU1QsIEFERF9FVkVOVF9MSVNURU5FUl9TVFIgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoWE1MSHR0cFJlcXVlc3QoY2FsbGJhY2spIHtcbiAgdmFyIFhNTEh0dHBSZXF1ZXN0UHJvdG90eXBlID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlO1xuXG4gIGlmICghWE1MSHR0cFJlcXVlc3RQcm90b3R5cGUgfHwgIVhNTEh0dHBSZXF1ZXN0UHJvdG90eXBlW0FERF9FVkVOVF9MSVNURU5FUl9TVFJdKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIFJFQURZX1NUQVRFX0NIQU5HRSA9ICdyZWFkeXN0YXRlY2hhbmdlJztcbiAgdmFyIExPQUQgPSAnbG9hZCc7XG4gIHZhciBFUlJPUiA9ICdlcnJvcic7XG4gIHZhciBUSU1FT1VUID0gJ3RpbWVvdXQnO1xuICB2YXIgQUJPUlQgPSAnYWJvcnQnO1xuXG4gIGZ1bmN0aW9uIGludm9rZVRhc2sodGFzaywgc3RhdHVzKSB7XG4gICAgaWYgKHRhc2suc3RhdGUgIT09IElOVk9LRSkge1xuICAgICAgdGFzay5zdGF0ZSA9IElOVk9LRTtcbiAgICAgIHRhc2suZGF0YS5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICBjYWxsYmFjayhJTlZPS0UsIHRhc2spO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlVGFzayh0YXNrKSB7XG4gICAgaWYgKHRhc2suc3RhdGUgPT09IFNDSEVEVUxFKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGFzay5zdGF0ZSA9IFNDSEVEVUxFO1xuICAgIGNhbGxiYWNrKFNDSEVEVUxFLCB0YXNrKTtcbiAgICB2YXIgdGFyZ2V0ID0gdGFzay5kYXRhLnRhcmdldDtcblxuICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKG5hbWUpIHtcbiAgICAgIHRhcmdldFtBRERfRVZFTlRfTElTVEVORVJfU1RSXShuYW1lLCBmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICB2YXIgdHlwZSA9IF9yZWYudHlwZTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gUkVBRFlfU1RBVEVfQ0hBTkdFKSB7XG4gICAgICAgICAgaWYgKHRhcmdldC5yZWFkeVN0YXRlID09PSA0ICYmIHRhcmdldC5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgICAgIGludm9rZVRhc2sodGFzaywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHN0YXR1cyA9IHR5cGUgPT09IExPQUQgPyAnc3VjY2VzcycgOiB0eXBlO1xuICAgICAgICAgIGludm9rZVRhc2sodGFzaywgc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXIoUkVBRFlfU1RBVEVfQ0hBTkdFKTtcbiAgICBhZGRMaXN0ZW5lcihMT0FEKTtcbiAgICBhZGRMaXN0ZW5lcihUSU1FT1VUKTtcbiAgICBhZGRMaXN0ZW5lcihFUlJPUik7XG4gICAgYWRkTGlzdGVuZXIoQUJPUlQpO1xuICB9XG5cbiAgdmFyIG9wZW5OYXRpdmUgPSBwYXRjaE1ldGhvZChYTUxIdHRwUmVxdWVzdFByb3RvdHlwZSwgJ29wZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICBpZiAoIXNlbGZbWEhSX0lHTk9SRV0pIHtcbiAgICAgICAgc2VsZltYSFJfTUVUSE9EXSA9IGFyZ3NbMF07XG4gICAgICAgIHNlbGZbWEhSX1VSTF0gPSBhcmdzWzFdO1xuICAgICAgICBzZWxmW1hIUl9TWU5DXSA9IGFyZ3NbMl0gPT09IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3Blbk5hdGl2ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9O1xuICB9KTtcbiAgdmFyIHNlbmROYXRpdmUgPSBwYXRjaE1ldGhvZChYTUxIdHRwUmVxdWVzdFByb3RvdHlwZSwgJ3NlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICBpZiAoc2VsZltYSFJfSUdOT1JFXSkge1xuICAgICAgICByZXR1cm4gc2VuZE5hdGl2ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRhc2sgPSB7XG4gICAgICAgIHNvdXJjZTogWE1MSFRUUFJFUVVFU1QsXG4gICAgICAgIHN0YXRlOiAnJyxcbiAgICAgICAgdHlwZTogJ21hY3JvVGFzaycsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXJnZXQ6IHNlbGYsXG4gICAgICAgICAgbWV0aG9kOiBzZWxmW1hIUl9NRVRIT0RdLFxuICAgICAgICAgIHN5bmM6IHNlbGZbWEhSX1NZTkNdLFxuICAgICAgICAgIHVybDogc2VsZltYSFJfVVJMXSxcbiAgICAgICAgICBzdGF0dXM6ICcnXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHNjaGVkdWxlVGFzayh0YXNrKTtcbiAgICAgICAgcmV0dXJuIHNlbmROYXRpdmUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGludm9rZVRhc2sodGFzaywgRVJST1IpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSIsImltcG9ydCBQcm9taXNlUG9sbHlmaWxsIGZyb20gJ3Byb21pc2UtcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNCcm93c2VyIH0gZnJvbSAnLi91dGlscyc7XG52YXIgbG9jYWwgPSB7fTtcblxuaWYgKGlzQnJvd3Nlcikge1xuICBsb2NhbCA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gIGxvY2FsID0gc2VsZjtcbn1cblxudmFyIFByb21pc2UgPSAnUHJvbWlzZScgaW4gbG9jYWwgPyBsb2NhbC5Qcm9taXNlIDogUHJvbWlzZVBvbGx5ZmlsbDtcbmV4cG9ydCB7IFByb21pc2UgfTsiLCJ2YXIgUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFF1ZXVlKG9uRmx1c2gsIG9wdHMpIHtcbiAgICBpZiAob3B0cyA9PT0gdm9pZCAwKSB7XG4gICAgICBvcHRzID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5vbkZsdXNoID0gb25GbHVzaDtcbiAgICB0aGlzLml0ZW1zID0gW107XG4gICAgdGhpcy5xdWV1ZUxpbWl0ID0gb3B0cy5xdWV1ZUxpbWl0IHx8IC0xO1xuICAgIHRoaXMuZmx1c2hJbnRlcnZhbCA9IG9wdHMuZmx1c2hJbnRlcnZhbCB8fCAwO1xuICAgIHRoaXMudGltZW91dElkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFF1ZXVlLnByb3RvdHlwZTtcblxuICBfcHJvdG8uX3NldFRpbWVyID0gZnVuY3Rpb24gX3NldFRpbWVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLnRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLmZsdXNoKCk7XG4gICAgfSwgdGhpcy5mbHVzaEludGVydmFsKTtcbiAgfTtcblxuICBfcHJvdG8uX2NsZWFyID0gZnVuY3Rpb24gX2NsZWFyKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50aW1lb3V0SWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgdGhpcy50aW1lb3V0SWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5pdGVtcyA9IFtdO1xuICB9O1xuXG4gIF9wcm90by5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHRoaXMub25GbHVzaCh0aGlzLml0ZW1zKTtcblxuICAgIHRoaXMuX2NsZWFyKCk7XG4gIH07XG5cbiAgX3Byb3RvLmFkZCA9IGZ1bmN0aW9uIGFkZChpdGVtKSB7XG4gICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuXG4gICAgaWYgKHRoaXMucXVldWVMaW1pdCAhPT0gLTEgJiYgdGhpcy5pdGVtcy5sZW5ndGggPj0gdGhpcy5xdWV1ZUxpbWl0KSB7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy50aW1lb3V0SWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuX3NldFRpbWVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBRdWV1ZTtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7IiwidmFyIF9zZXJ2aWNlQ3JlYXRvcnM7XG5cbmltcG9ydCBBcG1TZXJ2ZXIgZnJvbSAnLi9hcG0tc2VydmVyJztcbmltcG9ydCBDb25maWdTZXJ2aWNlIGZyb20gJy4vY29uZmlnLXNlcnZpY2UnO1xuaW1wb3J0IExvZ2dpbmdTZXJ2aWNlIGZyb20gJy4vbG9nZ2luZy1zZXJ2aWNlJztcbmltcG9ydCB7IENPTkZJR19DSEFOR0UsIENPTkZJR19TRVJWSUNFLCBMT0dHSU5HX1NFUlZJQ0UsIEFQTV9TRVJWRVIgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBfX0RFVl9fIH0gZnJvbSAnLi4vc3RhdGUnO1xudmFyIHNlcnZpY2VDcmVhdG9ycyA9IChfc2VydmljZUNyZWF0b3JzID0ge30sIF9zZXJ2aWNlQ3JlYXRvcnNbQ09ORklHX1NFUlZJQ0VdID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IENvbmZpZ1NlcnZpY2UoKTtcbn0sIF9zZXJ2aWNlQ3JlYXRvcnNbTE9HR0lOR19TRVJWSUNFXSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBMb2dnaW5nU2VydmljZSh7XG4gICAgcHJlZml4OiAnW0VsYXN0aWMgQVBNXSAnXG4gIH0pO1xufSwgX3NlcnZpY2VDcmVhdG9yc1tBUE1fU0VSVkVSXSA9IGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gIHZhciBfZmFjdG9yeSRnZXRTZXJ2aWNlID0gZmFjdG9yeS5nZXRTZXJ2aWNlKFtDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFXSksXG4gICAgICBjb25maWdTZXJ2aWNlID0gX2ZhY3RvcnkkZ2V0U2VydmljZVswXSxcbiAgICAgIGxvZ2dpbmdTZXJ2aWNlID0gX2ZhY3RvcnkkZ2V0U2VydmljZVsxXTtcblxuICByZXR1cm4gbmV3IEFwbVNlcnZlcihjb25maWdTZXJ2aWNlLCBsb2dnaW5nU2VydmljZSk7XG59LCBfc2VydmljZUNyZWF0b3JzKTtcblxudmFyIFNlcnZpY2VGYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTZXJ2aWNlRmFjdG9yeSgpIHtcbiAgICB0aGlzLmluc3RhbmNlcyA9IHt9O1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBTZXJ2aWNlRmFjdG9yeS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgdmFyIGNvbmZpZ1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoQ09ORklHX1NFUlZJQ0UpO1xuICAgIGNvbmZpZ1NlcnZpY2UuaW5pdCgpO1xuXG4gICAgdmFyIF90aGlzJGdldFNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoW0xPR0dJTkdfU0VSVklDRSwgQVBNX1NFUlZFUl0pLFxuICAgICAgICBsb2dnaW5nU2VydmljZSA9IF90aGlzJGdldFNlcnZpY2VbMF0sXG4gICAgICAgIGFwbVNlcnZlciA9IF90aGlzJGdldFNlcnZpY2VbMV07XG5cbiAgICBjb25maWdTZXJ2aWNlLmV2ZW50cy5vYnNlcnZlKENPTkZJR19DSEFOR0UsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBsb2dMZXZlbCA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdsb2dMZXZlbCcpO1xuICAgICAgbG9nZ2luZ1NlcnZpY2Uuc2V0TGV2ZWwobG9nTGV2ZWwpO1xuICAgIH0pO1xuICAgIGFwbVNlcnZlci5pbml0KCk7XG4gIH07XG5cbiAgX3Byb3RvLmdldFNlcnZpY2UgPSBmdW5jdGlvbiBnZXRTZXJ2aWNlKG5hbWUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF0aGlzLmluc3RhbmNlc1tuYW1lXSkge1xuICAgICAgICBpZiAodHlwZW9mIHNlcnZpY2VDcmVhdG9yc1tuYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuaW5zdGFuY2VzW25hbWVdID0gc2VydmljZUNyZWF0b3JzW25hbWVdKHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGdldCBzZXJ2aWNlLCBObyBjcmVhdG9yIGZvcjogJyArIG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlc1tuYW1lXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgIHJldHVybiBuYW1lLm1hcChmdW5jdGlvbiAobikge1xuICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U2VydmljZShuKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU2VydmljZUZhY3Rvcnk7XG59KCk7XG5cbmV4cG9ydCB7IHNlcnZpY2VDcmVhdG9ycywgU2VydmljZUZhY3RvcnkgfTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aHJvdHRsZShmbiwgb25UaHJvdHRsZSwgb3B0cykge1xuICB2YXIgY29udGV4dCA9IHRoaXM7XG4gIHZhciBsaW1pdCA9IG9wdHMubGltaXQ7XG4gIHZhciBpbnRlcnZhbCA9IG9wdHMuaW50ZXJ2YWw7XG4gIHZhciBjb3VudGVyID0gMDtcbiAgdmFyIHRpbWVvdXRJZDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBjb3VudGVyKys7XG5cbiAgICBpZiAodHlwZW9mIHRpbWVvdXRJZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgdGltZW91dElkID0gdW5kZWZpbmVkO1xuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIGlmIChjb3VudGVyID4gbGltaXQgJiYgdHlwZW9mIG9uVGhyb3R0bGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvblRocm90dGxlLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn0iLCJpbXBvcnQgeyBLRVlXT1JEX0xJTUlUIH0gZnJvbSAnLi9jb25zdGFudHMnO1xudmFyIE1FVEFEQVRBX01PREVMID0ge1xuICBzZXJ2aWNlOiB7XG4gICAgbmFtZTogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICAgIHZlcnNpb246IHRydWUsXG4gICAgYWdlbnQ6IHtcbiAgICAgIHZlcnNpb246IFtLRVlXT1JEX0xJTUlULCB0cnVlXVxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQ6IHRydWVcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgJyonOiB0cnVlXG4gIH1cbn07XG52YXIgUkVTUE9OU0VfTU9ERUwgPSB7XG4gICcqJzogdHJ1ZSxcbiAgaGVhZGVyczoge1xuICAgICcqJzogdHJ1ZVxuICB9XG59O1xudmFyIERFU1RJTkFUSU9OX01PREVMID0ge1xuICBhZGRyZXNzOiBbS0VZV09SRF9MSU1JVF0sXG4gIHNlcnZpY2U6IHtcbiAgICAnKic6IFtLRVlXT1JEX0xJTUlULCB0cnVlXVxuICB9XG59O1xudmFyIENPTlRFWFRfTU9ERUwgPSB7XG4gIHVzZXI6IHtcbiAgICBpZDogdHJ1ZSxcbiAgICBlbWFpbDogdHJ1ZSxcbiAgICB1c2VybmFtZTogdHJ1ZVxuICB9LFxuICB0YWdzOiB7XG4gICAgJyonOiB0cnVlXG4gIH0sXG4gIGh0dHA6IHtcbiAgICByZXNwb25zZTogUkVTUE9OU0VfTU9ERUxcbiAgfSxcbiAgZGVzdGluYXRpb246IERFU1RJTkFUSU9OX01PREVMLFxuICByZXNwb25zZTogUkVTUE9OU0VfTU9ERUxcbn07XG52YXIgU1BBTl9NT0RFTCA9IHtcbiAgbmFtZTogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICB0eXBlOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIGlkOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIHRyYWNlX2lkOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIHBhcmVudF9pZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICB0cmFuc2FjdGlvbl9pZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICBzdWJ0eXBlOiB0cnVlLFxuICBhY3Rpb246IHRydWUsXG4gIGNvbnRleHQ6IENPTlRFWFRfTU9ERUxcbn07XG52YXIgVFJBTlNBQ1RJT05fTU9ERUwgPSB7XG4gIG5hbWU6IHRydWUsXG4gIHBhcmVudF9pZDogdHJ1ZSxcbiAgdHlwZTogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICBpZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICB0cmFjZV9pZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICBzcGFuX2NvdW50OiB7XG4gICAgc3RhcnRlZDogW0tFWVdPUkRfTElNSVQsIHRydWVdXG4gIH0sXG4gIGNvbnRleHQ6IENPTlRFWFRfTU9ERUxcbn07XG52YXIgRVJST1JfTU9ERUwgPSB7XG4gIGlkOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIHRyYWNlX2lkOiB0cnVlLFxuICB0cmFuc2FjdGlvbl9pZDogdHJ1ZSxcbiAgcGFyZW50X2lkOiB0cnVlLFxuICBjdWxwcml0OiB0cnVlLFxuICBleGNlcHRpb246IHtcbiAgICB0eXBlOiB0cnVlXG4gIH0sXG4gIHRyYW5zYWN0aW9uOiB7XG4gICAgdHlwZTogdHJ1ZVxuICB9LFxuICBjb250ZXh0OiBDT05URVhUX01PREVMXG59O1xuXG5mdW5jdGlvbiB0cnVuY2F0ZSh2YWx1ZSwgbGltaXQsIHJlcXVpcmVkLCBwbGFjZWhvbGRlcikge1xuICBpZiAobGltaXQgPT09IHZvaWQgMCkge1xuICAgIGxpbWl0ID0gS0VZV09SRF9MSU1JVDtcbiAgfVxuXG4gIGlmIChyZXF1aXJlZCA9PT0gdm9pZCAwKSB7XG4gICAgcmVxdWlyZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGlmIChwbGFjZWhvbGRlciA9PT0gdm9pZCAwKSB7XG4gICAgcGxhY2Vob2xkZXIgPSAnTi9BJztcbiAgfVxuXG4gIGlmIChyZXF1aXJlZCAmJiBpc0VtcHR5KHZhbHVlKSkge1xuICAgIHZhbHVlID0gcGxhY2Vob2xkZXI7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZS5zdWJzdHJpbmcoMCwgbGltaXQpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyB8fCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVmFsdWUodGFyZ2V0LCBrZXksIGN1cnJNb2RlbCkge1xuICB2YXIgdmFsdWUgPSB0cnVuY2F0ZSh0YXJnZXRba2V5XSwgY3Vyck1vZGVsWzBdLCBjdXJyTW9kZWxbMV0pO1xuXG4gIGlmIChpc0VtcHR5KHZhbHVlKSkge1xuICAgIGRlbGV0ZSB0YXJnZXRba2V5XTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0YXJnZXRba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZU1vZGVsKG1vZGVsLCB0YXJnZXQsIGNoaWxkVGFyZ2V0KSB7XG4gIGlmIChtb2RlbCA9PT0gdm9pZCAwKSB7XG4gICAgbW9kZWwgPSB7fTtcbiAgfVxuXG4gIGlmIChjaGlsZFRhcmdldCA9PT0gdm9pZCAwKSB7XG4gICAgY2hpbGRUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1vZGVsKTtcbiAgdmFyIGVtcHR5QXJyID0gW107XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoaSkge1xuICAgIHZhciBjdXJyS2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgY3Vyck1vZGVsID0gbW9kZWxbY3VycktleV0gPT09IHRydWUgPyBlbXB0eUFyciA6IG1vZGVsW2N1cnJLZXldO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJNb2RlbCkpIHtcbiAgICAgIHRydW5jYXRlTW9kZWwoY3Vyck1vZGVsLCB0YXJnZXQsIGNoaWxkVGFyZ2V0W2N1cnJLZXldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJLZXkgPT09ICcqJykge1xuICAgICAgICBPYmplY3Qua2V5cyhjaGlsZFRhcmdldCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGxhY2VWYWx1ZShjaGlsZFRhcmdldCwga2V5LCBjdXJyTW9kZWwpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2VWYWx1ZShjaGlsZFRhcmdldCwgY3VycktleSwgY3Vyck1vZGVsKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgX2xvb3AoaSk7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5leHBvcnQgeyB0cnVuY2F0ZSwgdHJ1bmNhdGVNb2RlbCwgU1BBTl9NT0RFTCwgVFJBTlNBQ1RJT05fTU9ERUwsIEVSUk9SX01PREVMLCBNRVRBREFUQV9NT0RFTCwgUkVTUE9OU0VfTU9ERUwgfTsiLCJpbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuL3V0aWxzJztcblxuZnVuY3Rpb24gaXNEZWZhdWx0UG9ydChwb3J0LCBwcm90b2NvbCkge1xuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAnaHR0cDonOlxuICAgICAgcmV0dXJuIHBvcnQgPT09ICc4MCc7XG5cbiAgICBjYXNlICdodHRwczonOlxuICAgICAgcmV0dXJuIHBvcnQgPT09ICc0NDMnO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbnZhciBSVUxFUyA9IFtbJyMnLCAnaGFzaCddLCBbJz8nLCAncXVlcnknXSwgWycvJywgJ3BhdGgnXSwgWydAJywgJ2F1dGgnLCAxXSwgW05hTiwgJ2hvc3QnLCB1bmRlZmluZWQsIDFdXTtcbnZhciBQUk9UT0NPTF9SRUdFWCA9IC9eKFthLXpdW2EtejAtOS4rLV0qOik/KFxcL1xcLyk/KFtcXFNcXHNdKikvaTtcbmV4cG9ydCB2YXIgVXJsID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBVcmwodXJsKSB7XG4gICAgdmFyIF90aGlzJGV4dHJhY3RQcm90b2NvbCA9IHRoaXMuZXh0cmFjdFByb3RvY29sKHVybCB8fCAnJyksXG4gICAgICAgIHByb3RvY29sID0gX3RoaXMkZXh0cmFjdFByb3RvY29sLnByb3RvY29sLFxuICAgICAgICBhZGRyZXNzID0gX3RoaXMkZXh0cmFjdFByb3RvY29sLmFkZHJlc3MsXG4gICAgICAgIHNsYXNoZXMgPSBfdGhpcyRleHRyYWN0UHJvdG9jb2wuc2xhc2hlcztcblxuICAgIHZhciByZWxhdGl2ZSA9ICFwcm90b2NvbCAmJiAhc2xhc2hlcztcbiAgICB2YXIgbG9jYXRpb24gPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgdmFyIGluc3RydWN0aW9ucyA9IFJVTEVTLnNsaWNlKCk7XG4gICAgYWRkcmVzcyA9IGFkZHJlc3MucmVwbGFjZSgnXFxcXCcsICcvJyk7XG5cbiAgICBpZiAoIXNsYXNoZXMpIHtcbiAgICAgIGluc3RydWN0aW9uc1syXSA9IFtOYU4sICdwYXRoJ107XG4gICAgfVxuXG4gICAgdmFyIGluZGV4O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uc1tpXTtcbiAgICAgIHZhciBwYXJzZSA9IGluc3RydWN0aW9uWzBdO1xuICAgICAgdmFyIGtleSA9IGluc3RydWN0aW9uWzFdO1xuXG4gICAgICBpZiAodHlwZW9mIHBhcnNlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpbmRleCA9IGFkZHJlc3MuaW5kZXhPZihwYXJzZSk7XG5cbiAgICAgICAgaWYgKH5pbmRleCkge1xuICAgICAgICAgIHZhciBpbnN0TGVuZ3RoID0gaW5zdHJ1Y3Rpb25bMl07XG5cbiAgICAgICAgICBpZiAoaW5zdExlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG5ld0luZGV4ID0gYWRkcmVzcy5sYXN0SW5kZXhPZihwYXJzZSk7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGgubWF4KGluZGV4LCBuZXdJbmRleCk7XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKGluZGV4ICsgaW5zdExlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXNba2V5XSA9IGFkZHJlc3Muc2xpY2UoaW5kZXgpO1xuICAgICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1trZXldID0gYWRkcmVzcztcbiAgICAgICAgYWRkcmVzcyA9ICcnO1xuICAgICAgfVxuXG4gICAgICB0aGlzW2tleV0gPSB0aGlzW2tleV0gfHwgKHJlbGF0aXZlICYmIGluc3RydWN0aW9uWzNdID8gbG9jYXRpb25ba2V5XSB8fCAnJyA6ICcnKTtcbiAgICAgIGlmIChpbnN0cnVjdGlvblszXSkgdGhpc1trZXldID0gdGhpc1trZXldLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlICYmIHRoaXMucGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhpcy5wYXRoID0gJy8nICsgdGhpcy5wYXRoO1xuICAgIH1cblxuICAgIHRoaXMucmVsYXRpdmUgPSByZWxhdGl2ZTtcbiAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2wgfHwgbG9jYXRpb24ucHJvdG9jb2w7XG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdDtcbiAgICB0aGlzLnBvcnQgPSAnJztcblxuICAgIGlmICgvOlxcZCskLy50ZXN0KHRoaXMuaG9zdCkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuaG9zdC5zcGxpdCgnOicpO1xuICAgICAgdmFyIHBvcnQgPSB2YWx1ZS5wb3AoKTtcbiAgICAgIHZhciBob3N0bmFtZSA9IHZhbHVlLmpvaW4oJzonKTtcblxuICAgICAgaWYgKGlzRGVmYXVsdFBvcnQocG9ydCwgdGhpcy5wcm90b2NvbCkpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdG5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvcnQgPSBwb3J0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gaG9zdG5hbWU7XG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW4gPSB0aGlzLnByb3RvY29sICYmIHRoaXMuaG9zdCAmJiB0aGlzLnByb3RvY29sICE9PSAnZmlsZTonID8gdGhpcy5wcm90b2NvbCArICcvLycgKyB0aGlzLmhvc3QgOiAnbnVsbCc7XG4gICAgdGhpcy5ocmVmID0gdGhpcy50b1N0cmluZygpO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFVybC5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucHJvdG9jb2w7XG4gICAgcmVzdWx0ICs9ICcvLyc7XG5cbiAgICBpZiAodGhpcy5hdXRoKSB7XG4gICAgICB2YXIgUkVEQUNURUQgPSAnW1JFREFDVEVEXSc7XG4gICAgICB2YXIgdXNlcnBhc3MgPSB0aGlzLmF1dGguc3BsaXQoJzonKTtcbiAgICAgIHZhciB1c2VybmFtZSA9IHVzZXJwYXNzWzBdID8gUkVEQUNURUQgOiAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IHVzZXJwYXNzWzFdID8gJzonICsgUkVEQUNURUQgOiAnJztcbiAgICAgIHJlc3VsdCArPSB1c2VybmFtZSArIHBhc3N3b3JkICsgJ0AnO1xuICAgIH1cblxuICAgIHJlc3VsdCArPSB0aGlzLmhvc3Q7XG4gICAgcmVzdWx0ICs9IHRoaXMucGF0aDtcbiAgICByZXN1bHQgKz0gdGhpcy5xdWVyeTtcbiAgICByZXN1bHQgKz0gdGhpcy5oYXNoO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgX3Byb3RvLmdldExvY2F0aW9uID0gZnVuY3Rpb24gZ2V0TG9jYXRpb24oKSB7XG4gICAgdmFyIGdsb2JhbFZhciA9IHt9O1xuXG4gICAgaWYgKGlzQnJvd3Nlcikge1xuICAgICAgZ2xvYmFsVmFyID0gd2luZG93O1xuICAgIH1cblxuICAgIHJldHVybiBnbG9iYWxWYXIubG9jYXRpb247XG4gIH07XG5cbiAgX3Byb3RvLmV4dHJhY3RQcm90b2NvbCA9IGZ1bmN0aW9uIGV4dHJhY3RQcm90b2NvbCh1cmwpIHtcbiAgICB2YXIgbWF0Y2ggPSBQUk9UT0NPTF9SRUdFWC5leGVjKHVybCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3RvY29sOiBtYXRjaFsxXSA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiAnJyxcbiAgICAgIHNsYXNoZXM6ICEhbWF0Y2hbMl0sXG4gICAgICBhZGRyZXNzOiBtYXRjaFszXVxuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIFVybDtcbn0oKTtcbmV4cG9ydCBmdW5jdGlvbiBzbHVnaWZ5VXJsKHVybFN0ciwgZGVwdGgpIHtcbiAgaWYgKGRlcHRoID09PSB2b2lkIDApIHtcbiAgICBkZXB0aCA9IDI7XG4gIH1cblxuICB2YXIgcGFyc2VkVXJsID0gbmV3IFVybCh1cmxTdHIpO1xuICB2YXIgcXVlcnkgPSBwYXJzZWRVcmwucXVlcnksXG4gICAgICBwYXRoID0gcGFyc2VkVXJsLnBhdGg7XG4gIHZhciBwYXRoUGFydHMgPSBwYXRoLnN1YnN0cmluZygxKS5zcGxpdCgnLycpO1xuICB2YXIgcmVkYWN0U3RyaW5nID0gJzppZCc7XG4gIHZhciB3aWxkY2FyZCA9ICcqJztcbiAgdmFyIHNwZWNpYWxDaGFyc1JlZ2V4ID0gL1xcV3xfL2c7XG4gIHZhciBkaWdpdHNSZWdleCA9IC9bMC05XS9nO1xuICB2YXIgbG93ZXJDYXNlUmVnZXggPSAvW2Etel0vZztcbiAgdmFyIHVwcGVyQ2FzZVJlZ2V4ID0gL1tBLVpdL2c7XG4gIHZhciByZWRhY3RlZFBhcnRzID0gW107XG4gIHZhciByZWRhY3RlZEJlZm9yZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBwYXRoUGFydHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgdmFyIHBhcnQgPSBwYXRoUGFydHNbaW5kZXhdO1xuXG4gICAgaWYgKHJlZGFjdGVkQmVmb3JlIHx8IGluZGV4ID4gZGVwdGggLSAxKSB7XG4gICAgICBpZiAocGFydCkge1xuICAgICAgICByZWRhY3RlZFBhcnRzLnB1c2god2lsZGNhcmQpO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgbnVtYmVyT2ZTcGVjaWFsQ2hhcnMgPSAocGFydC5tYXRjaChzcGVjaWFsQ2hhcnNSZWdleCkgfHwgW10pLmxlbmd0aDtcblxuICAgIGlmIChudW1iZXJPZlNwZWNpYWxDaGFycyA+PSAyKSB7XG4gICAgICByZWRhY3RlZFBhcnRzLnB1c2gocmVkYWN0U3RyaW5nKTtcbiAgICAgIHJlZGFjdGVkQmVmb3JlID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBudW1iZXJPZkRpZ2l0cyA9IChwYXJ0Lm1hdGNoKGRpZ2l0c1JlZ2V4KSB8fCBbXSkubGVuZ3RoO1xuXG4gICAgaWYgKG51bWJlck9mRGlnaXRzID4gMyB8fCBwYXJ0Lmxlbmd0aCA+IDMgJiYgbnVtYmVyT2ZEaWdpdHMgLyBwYXJ0Lmxlbmd0aCA+PSAwLjMpIHtcbiAgICAgIHJlZGFjdGVkUGFydHMucHVzaChyZWRhY3RTdHJpbmcpO1xuICAgICAgcmVkYWN0ZWRCZWZvcmUgPSB0cnVlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIG51bWJlcm9mVXBwZXJDYXNlID0gKHBhcnQubWF0Y2godXBwZXJDYXNlUmVnZXgpIHx8IFtdKS5sZW5ndGg7XG4gICAgdmFyIG51bWJlcm9mTG93ZXJDYXNlID0gKHBhcnQubWF0Y2gobG93ZXJDYXNlUmVnZXgpIHx8IFtdKS5sZW5ndGg7XG4gICAgdmFyIGxvd2VyQ2FzZVJhdGUgPSBudW1iZXJvZkxvd2VyQ2FzZSAvIHBhcnQubGVuZ3RoO1xuICAgIHZhciB1cHBlckNhc2VSYXRlID0gbnVtYmVyb2ZVcHBlckNhc2UgLyBwYXJ0Lmxlbmd0aDtcblxuICAgIGlmIChwYXJ0Lmxlbmd0aCA+IDUgJiYgKHVwcGVyQ2FzZVJhdGUgPiAwLjMgJiYgdXBwZXJDYXNlUmF0ZSA8IDAuNiB8fCBsb3dlckNhc2VSYXRlID4gMC4zICYmIGxvd2VyQ2FzZVJhdGUgPCAwLjYpKSB7XG4gICAgICByZWRhY3RlZFBhcnRzLnB1c2gocmVkYWN0U3RyaW5nKTtcbiAgICAgIHJlZGFjdGVkQmVmb3JlID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHBhcnQgJiYgcmVkYWN0ZWRQYXJ0cy5wdXNoKHBhcnQpO1xuICB9XG5cbiAgdmFyIHJlZGFjdGVkID0gJy8nICsgKHJlZGFjdGVkUGFydHMubGVuZ3RoID49IDIgPyByZWRhY3RlZFBhcnRzLmpvaW4oJy8nKSA6IHJlZGFjdGVkUGFydHMuam9pbignJykpICsgKHF1ZXJ5ID8gJz97cXVlcnl9JyA6ICcnKTtcbiAgcmV0dXJuIHJlZGFjdGVkO1xufSIsImltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuL3BvbHlmaWxscyc7XG52YXIgc2xpY2UgPSBbXS5zbGljZTtcbnZhciBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbnZhciBQRVJGID0gaXNCcm93c2VyICYmIHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBwZXJmb3JtYW5jZSA6IHt9O1xuXG5mdW5jdGlvbiBpc0NPUlNTdXBwb3J0ZWQoKSB7XG4gIHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJldHVybiAnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHI7XG59XG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvSGV4KGJ1ZmZlcikge1xuICB2YXIgaGV4T2N0ZXRzID0gW107XG5cbiAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGJ1ZmZlci5sZW5ndGg7IF9pKyspIHtcbiAgICBoZXhPY3RldHMucHVzaChieXRlVG9IZXhbYnVmZmVyW19pXV0pO1xuICB9XG5cbiAgcmV0dXJuIGhleE9jdGV0cy5qb2luKCcnKTtcbn1cblxudmFyIGRlc3RpbmF0aW9uID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuXG5mdW5jdGlvbiBybmcoKSB7XG4gIGlmICh0eXBlb2YgY3J5cHRvICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhkZXN0aW5hdGlvbik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1zQ3J5cHRvICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMoZGVzdGluYXRpb24pO1xuICB9XG5cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbUlkKGxlbmd0aCkge1xuICB2YXIgaWQgPSBieXRlc1RvSGV4KHJuZygpKTtcbiAgcmV0dXJuIGlkLnN1YnN0cigwLCBsZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBnZXREdEhlYWRlclZhbHVlKHNwYW4pIHtcbiAgdmFyIGR0VmVyc2lvbiA9ICcwMCc7XG4gIHZhciBkdFVuU2FtcGxlZEZsYWdzID0gJzAwJztcbiAgdmFyIGR0U2FtcGxlZEZsYWdzID0gJzAxJztcblxuICBpZiAoc3BhbiAmJiBzcGFuLnRyYWNlSWQgJiYgc3Bhbi5pZCAmJiBzcGFuLnBhcmVudElkKSB7XG4gICAgdmFyIGZsYWdzID0gc3Bhbi5zYW1wbGVkID8gZHRTYW1wbGVkRmxhZ3MgOiBkdFVuU2FtcGxlZEZsYWdzO1xuICAgIHZhciBpZCA9IHNwYW4uc2FtcGxlZCA/IHNwYW4uaWQgOiBzcGFuLnBhcmVudElkO1xuICAgIHJldHVybiBkdFZlcnNpb24gKyAnLScgKyBzcGFuLnRyYWNlSWQgKyAnLScgKyBpZCArICctJyArIGZsYWdzO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRHRIZWFkZXJWYWx1ZSh2YWx1ZSkge1xuICB2YXIgcGFyc2VkID0gL14oW1xcZGEtZl17Mn0pLShbXFxkYS1mXXszMn0pLShbXFxkYS1mXXsxNn0pLShbXFxkYS1mXXsyfSkkLy5leGVjKHZhbHVlKTtcblxuICBpZiAocGFyc2VkKSB7XG4gICAgdmFyIGZsYWdzID0gcGFyc2VkWzRdO1xuICAgIHZhciBzYW1wbGVkID0gZmxhZ3MgIT09ICcwMCc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyYWNlSWQ6IHBhcnNlZFsyXSxcbiAgICAgIGlkOiBwYXJzZWRbM10sXG4gICAgICBzYW1wbGVkOiBzYW1wbGVkXG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0R0SGVhZGVyVmFsaWQoaGVhZGVyKSB7XG4gIHJldHVybiAvXltcXGRhLWZdezJ9LVtcXGRhLWZdezMyfS1bXFxkYS1mXXsxNn0tW1xcZGEtZl17Mn0kLy50ZXN0KGhlYWRlcikgJiYgaGVhZGVyLnNsaWNlKDMsIDM1KSAhPT0gJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyAmJiBoZWFkZXIuc2xpY2UoMzYsIDUyKSAhPT0gJzAwMDAwMDAwMDAwMDAwMDAnO1xufVxuXG5mdW5jdGlvbiBnZXRUU0hlYWRlclZhbHVlKF9yZWYpIHtcbiAgdmFyIHNhbXBsZVJhdGUgPSBfcmVmLnNhbXBsZVJhdGU7XG5cbiAgaWYgKHR5cGVvZiBzYW1wbGVSYXRlICE9PSAnbnVtYmVyJyB8fCBTdHJpbmcoc2FtcGxlUmF0ZSkubGVuZ3RoID4gMjU2KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIE5BTUVTUEFDRSA9ICdlcyc7XG4gIHZhciBTRVBBUkFUT1IgPSAnPSc7XG4gIHJldHVybiBcIlwiICsgTkFNRVNQQUNFICsgU0VQQVJBVE9SICsgXCJzOlwiICsgc2FtcGxlUmF0ZTtcbn1cblxuZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih0YXJnZXQsIG5hbWUsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdGFyZ2V0LnNldFJlcXVlc3RIZWFkZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0YXJnZXQuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0LmhlYWRlcnMgJiYgdHlwZW9mIHRhcmdldC5oZWFkZXJzLmFwcGVuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRhcmdldC5oZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0W25hbWVdID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tTYW1lT3JpZ2luKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHZhciBpc1NhbWUgPSBmYWxzZTtcblxuICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycpIHtcbiAgICBpc1NhbWUgPSBzb3VyY2UgPT09IHRhcmdldDtcbiAgfSBlbHNlIGlmICh0YXJnZXQgJiYgdHlwZW9mIHRhcmdldC50ZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaXNTYW1lID0gdGFyZ2V0LnRlc3Qoc291cmNlKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkpIHtcbiAgICB0YXJnZXQuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCFpc1NhbWUpIHtcbiAgICAgICAgaXNTYW1lID0gY2hlY2tTYW1lT3JpZ2luKHNvdXJjZSwgdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gaXNTYW1lO1xufVxuXG5mdW5jdGlvbiBpc1BsYXRmb3JtU3VwcG9ydGVkKCkge1xuICByZXR1cm4gaXNCcm93c2VyICYmIHR5cGVvZiBTZXQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIEpTT04uc3RyaW5naWZ5ID09PSAnZnVuY3Rpb24nICYmIFBFUkYgJiYgdHlwZW9mIFBFUkYubm93ID09PSAnZnVuY3Rpb24nICYmIGlzQ09SU1N1cHBvcnRlZCgpO1xufVxuXG5mdW5jdGlvbiBzZXRMYWJlbChrZXksIHZhbHVlLCBvYmopIHtcbiAgaWYgKCFvYmogfHwgIWtleSkgcmV0dXJuO1xuICB2YXIgc2tleSA9IHJlbW92ZUludmFsaWRDaGFycyhrZXkpO1xuICB2YXIgdmFsdWVUeXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQgJiYgdmFsdWVUeXBlICE9PSAnYm9vbGVhbicgJiYgdmFsdWVUeXBlICE9PSAnbnVtYmVyJykge1xuICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgfVxuXG4gIG9ialtza2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBnZXRTZXJ2ZXJUaW1pbmdJbmZvKHNlcnZlclRpbWluZ0VudHJpZXMpIHtcbiAgaWYgKHNlcnZlclRpbWluZ0VudHJpZXMgPT09IHZvaWQgMCkge1xuICAgIHNlcnZlclRpbWluZ0VudHJpZXMgPSBbXTtcbiAgfVxuXG4gIHZhciBzZXJ2ZXJUaW1pbmdJbmZvID0gW107XG4gIHZhciBlbnRyeVNlcGFyYXRvciA9ICcsICc7XG4gIHZhciB2YWx1ZVNlcGFyYXRvciA9ICc7JztcblxuICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBzZXJ2ZXJUaW1pbmdFbnRyaWVzLmxlbmd0aDsgX2kyKyspIHtcbiAgICB2YXIgX3NlcnZlclRpbWluZ0VudHJpZXMkID0gc2VydmVyVGltaW5nRW50cmllc1tfaTJdLFxuICAgICAgICBuYW1lID0gX3NlcnZlclRpbWluZ0VudHJpZXMkLm5hbWUsXG4gICAgICAgIGR1cmF0aW9uID0gX3NlcnZlclRpbWluZ0VudHJpZXMkLmR1cmF0aW9uLFxuICAgICAgICBkZXNjcmlwdGlvbiA9IF9zZXJ2ZXJUaW1pbmdFbnRyaWVzJC5kZXNjcmlwdGlvbjtcbiAgICB2YXIgdGltaW5nVmFsdWUgPSBuYW1lO1xuXG4gICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICB0aW1pbmdWYWx1ZSArPSB2YWx1ZVNlcGFyYXRvciArICdkZXNjPScgKyBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoZHVyYXRpb24pIHtcbiAgICAgIHRpbWluZ1ZhbHVlICs9IHZhbHVlU2VwYXJhdG9yICsgJ2R1cj0nICsgZHVyYXRpb247XG4gICAgfVxuXG4gICAgc2VydmVyVGltaW5nSW5mby5wdXNoKHRpbWluZ1ZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiBzZXJ2ZXJUaW1pbmdJbmZvLmpvaW4oZW50cnlTZXBhcmF0b3IpO1xufVxuXG5mdW5jdGlvbiBnZXRUaW1lT3JpZ2luKCkge1xuICByZXR1cm4gUEVSRi50aW1pbmcuZmV0Y2hTdGFydDtcbn1cblxuZnVuY3Rpb24gc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwodXJsKSB7XG4gIHJldHVybiB1cmwgJiYgdXJsLnNwbGl0KCc/JylbMF07XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGJhc2VFeHRlbmQoZHN0LCBvYmpzLCBkZWVwKSB7XG4gIGZvciAodmFyIGkgPSAwLCBpaSA9IG9ianMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHZhciBvYmogPSBvYmpzW2ldO1xuICAgIGlmICghaXNPYmplY3Qob2JqKSAmJiAhaXNGdW5jdGlvbihvYmopKSBjb250aW51ZTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgICBmb3IgKHZhciBqID0gMCwgamogPSBrZXlzLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2pdO1xuICAgICAgdmFyIHNyYyA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoZGVlcCAmJiBpc09iamVjdChzcmMpKSB7XG4gICAgICAgIGlmICghaXNPYmplY3QoZHN0W2tleV0pKSBkc3Rba2V5XSA9IEFycmF5LmlzQXJyYXkoc3JjKSA/IFtdIDoge307XG4gICAgICAgIGJhc2VFeHRlbmQoZHN0W2tleV0sIFtzcmNdLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkc3Rba2V5XSA9IHNyYztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZHN0O1xufVxuXG5mdW5jdGlvbiBnZXRFbGFzdGljU2NyaXB0KCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzY3JpcHRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHNjID0gc2NyaXB0c1tpXTtcblxuICAgICAgaWYgKHNjLnNyYy5pbmRleE9mKCdlbGFzdGljJykgPiAwKSB7XG4gICAgICAgIHJldHVybiBzYztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFNjcmlwdCgpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgY3VycmVudFNjcmlwdCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ7XG5cbiAgICBpZiAoIWN1cnJlbnRTY3JpcHQpIHtcbiAgICAgIHJldHVybiBnZXRFbGFzdGljU2NyaXB0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRTY3JpcHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0ZW5kKGRzdCkge1xuICByZXR1cm4gYmFzZUV4dGVuZChkc3QsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBtZXJnZShkc3QpIHtcbiAgcmV0dXJuIGJhc2VFeHRlbmQoZHN0LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIHRydWUpO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZmluZChhcnJheSwgcHJlZGljYXRlLCB0aGlzQXJnKSB7XG4gIGlmIChhcnJheSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJyYXkgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICB9XG5cbiAgdmFyIG8gPSBPYmplY3QoYXJyYXkpO1xuICB2YXIgbGVuID0gby5sZW5ndGggPj4+IDA7XG5cbiAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICB2YXIgayA9IDA7XG5cbiAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICB2YXIga1ZhbHVlID0gb1trXTtcblxuICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCBrVmFsdWUsIGssIG8pKSB7XG4gICAgICByZXR1cm4ga1ZhbHVlO1xuICAgIH1cblxuICAgIGsrKztcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUludmFsaWRDaGFycyhrZXkpIHtcbiAgcmV0dXJuIGtleS5yZXBsYWNlKC9bLipcIl0vZywgJ18nKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGF0ZXN0U3BhbihzcGFucywgdHlwZUZpbHRlcikge1xuICB2YXIgbGF0ZXN0U3BhbiA9IG51bGw7XG5cbiAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgc3BhbnMubGVuZ3RoOyBfaTMrKykge1xuICAgIHZhciBzcGFuID0gc3BhbnNbX2kzXTtcblxuICAgIGlmICh0eXBlRmlsdGVyICYmIHR5cGVGaWx0ZXIoc3Bhbi50eXBlKSAmJiAoIWxhdGVzdFNwYW4gfHwgbGF0ZXN0U3Bhbi5fZW5kIDwgc3Bhbi5fZW5kKSkge1xuICAgICAgbGF0ZXN0U3BhbiA9IHNwYW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxhdGVzdFNwYW47XG59XG5cbmZ1bmN0aW9uIGdldExhdGVzdE5vblhIUlNwYW4oc3BhbnMpIHtcbiAgcmV0dXJuIGdldExhdGVzdFNwYW4oc3BhbnMsIGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0eXBlKS5pbmRleE9mKCdleHRlcm5hbCcpID09PSAtMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhdGVzdFhIUlNwYW4oc3BhbnMpIHtcbiAgcmV0dXJuIGdldExhdGVzdFNwYW4oc3BhbnMsIGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0eXBlKS5pbmRleE9mKCdleHRlcm5hbCcpICE9PSAtMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEVhcmxpZXN0U3BhbihzcGFucykge1xuICB2YXIgZWFybGllc3RTcGFuID0gc3BhbnNbMF07XG5cbiAgZm9yICh2YXIgX2k0ID0gMTsgX2k0IDwgc3BhbnMubGVuZ3RoOyBfaTQrKykge1xuICAgIHZhciBzcGFuID0gc3BhbnNbX2k0XTtcblxuICAgIGlmIChlYXJsaWVzdFNwYW4uX3N0YXJ0ID4gc3Bhbi5fc3RhcnQpIHtcbiAgICAgIGVhcmxpZXN0U3BhbiA9IHNwYW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVhcmxpZXN0U3Bhbjtcbn1cblxuZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gUEVSRi5ub3coKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGltZSh0aW1lKSB7XG4gIHJldHVybiB0eXBlb2YgdGltZSA9PT0gJ251bWJlcicgJiYgdGltZSA+PSAwID8gdGltZSA6IG5vdygpO1xufVxuXG5mdW5jdGlvbiBnZXREdXJhdGlvbihzdGFydCwgZW5kKSB7XG4gIGlmIChpc1VuZGVmaW5lZChlbmQpIHx8IGlzVW5kZWZpbmVkKHN0YXJ0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlSW50KGVuZCAtIHN0YXJ0KTtcbn1cblxuZnVuY3Rpb24gc2NoZWR1bGVNYWNyb1Rhc2soY2FsbGJhY2spIHtcbiAgc2V0VGltZW91dChjYWxsYmFjaywgMCk7XG59XG5cbmZ1bmN0aW9uIHNjaGVkdWxlTWljcm9UYXNrKGNhbGxiYWNrKSB7XG4gIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBpc1BlcmZUaW1lbGluZVN1cHBvcnRlZCgpIHtcbiAgcmV0dXJuIHR5cGVvZiBQRVJGLmdldEVudHJpZXNCeVR5cGUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzUGVyZlR5cGVTdXBwb3J0ZWQodHlwZSkge1xuICByZXR1cm4gdHlwZW9mIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnICYmIFBlcmZvcm1hbmNlT2JzZXJ2ZXIuc3VwcG9ydGVkRW50cnlUeXBlcyAmJiBQZXJmb3JtYW5jZU9ic2VydmVyLnN1cHBvcnRlZEVudHJ5VHlwZXMuaW5kZXhPZih0eXBlKSA+PSAwO1xufVxuXG5mdW5jdGlvbiBpc1BlcmZJbnRlcmFjdGlvbkNvdW50U3VwcG9ydGVkKCkge1xuICByZXR1cm4gJ2ludGVyYWN0aW9uQ291bnQnIGluIHBlcmZvcm1hbmNlO1xufVxuXG5mdW5jdGlvbiBpc0JlYWNvbkluc3BlY3Rpb25FbmFibGVkKCkge1xuICB2YXIgZmxhZ05hbWUgPSAnX2VsYXN0aWNfaW5zcGVjdF9iZWFjb25fJztcblxuICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShmbGFnTmFtZSkgIT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKCF3aW5kb3cuVVJMIHx8ICF3aW5kb3cuVVJMU2VhcmNoUGFyYW1zKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdHJ5IHtcbiAgICB2YXIgcGFyc2VkVXJsID0gbmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgdmFyIGlzRmxhZ1NldCA9IHBhcnNlZFVybC5zZWFyY2hQYXJhbXMuaGFzKGZsYWdOYW1lKTtcblxuICAgIGlmIChpc0ZsYWdTZXQpIHtcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oZmxhZ05hbWUsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0ZsYWdTZXQ7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1JlZGlyZWN0SW5mb0F2YWlsYWJsZSh0aW1pbmcpIHtcbiAgcmV0dXJuIHRpbWluZy5yZWRpcmVjdFN0YXJ0ID4gMDtcbn1cblxuZXhwb3J0IHsgZXh0ZW5kLCBtZXJnZSwgaXNVbmRlZmluZWQsIG5vb3AsIGJhc2VFeHRlbmQsIGJ5dGVzVG9IZXgsIGlzQ09SU1N1cHBvcnRlZCwgaXNPYmplY3QsIGlzRnVuY3Rpb24sIGlzUGxhdGZvcm1TdXBwb3J0ZWQsIGlzRHRIZWFkZXJWYWxpZCwgcGFyc2VEdEhlYWRlclZhbHVlLCBnZXRTZXJ2ZXJUaW1pbmdJbmZvLCBnZXREdEhlYWRlclZhbHVlLCBnZXRUU0hlYWRlclZhbHVlLCBnZXRDdXJyZW50U2NyaXB0LCBnZXRFbGFzdGljU2NyaXB0LCBnZXRUaW1lT3JpZ2luLCBnZW5lcmF0ZVJhbmRvbUlkLCBnZXRFYXJsaWVzdFNwYW4sIGdldExhdGVzdE5vblhIUlNwYW4sIGdldExhdGVzdFhIUlNwYW4sIGdldER1cmF0aW9uLCBnZXRUaW1lLCBub3csIHJuZywgY2hlY2tTYW1lT3JpZ2luLCBzY2hlZHVsZU1hY3JvVGFzaywgc2NoZWR1bGVNaWNyb1Rhc2ssIHNldExhYmVsLCBzZXRSZXF1ZXN0SGVhZGVyLCBzdHJpcFF1ZXJ5U3RyaW5nRnJvbVVybCwgZmluZCwgcmVtb3ZlSW52YWxpZENoYXJzLCBQRVJGLCBpc1BlcmZUaW1lbGluZVN1cHBvcnRlZCwgaXNCcm93c2VyLCBpc1BlcmZUeXBlU3VwcG9ydGVkLCBpc1BlcmZJbnRlcmFjdGlvbkNvdW50U3VwcG9ydGVkLCBpc0JlYWNvbkluc3BlY3Rpb25FbmFibGVkLCBpc1JlZGlyZWN0SW5mb0F2YWlsYWJsZSB9OyIsInZhciBfZXhjbHVkZWQgPSBbXCJ0YWdzXCJdO1xuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShzb3VyY2UsIGV4Y2x1ZGVkKSB7IGlmIChzb3VyY2UgPT0gbnVsbCkgcmV0dXJuIHt9OyB2YXIgdGFyZ2V0ID0ge307IHZhciBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTsgdmFyIGtleSwgaTsgZm9yIChpID0gMDsgaSA8IHNvdXJjZUtleXMubGVuZ3RoOyBpKyspIHsga2V5ID0gc291cmNlS2V5c1tpXTsgaWYgKGV4Y2x1ZGVkLmluZGV4T2Yoa2V5KSA+PSAwKSBjb250aW51ZTsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmltcG9ydCB7IGNyZWF0ZVN0YWNrVHJhY2VzLCBmaWx0ZXJJbnZhbGlkRnJhbWVzIH0gZnJvbSAnLi9zdGFjay10cmFjZSc7XG5pbXBvcnQgeyBnZW5lcmF0ZVJhbmRvbUlkLCBtZXJnZSwgZXh0ZW5kIH0gZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IGdldFBhZ2VDb250ZXh0IH0gZnJvbSAnLi4vY29tbW9uL2NvbnRleHQnO1xuaW1wb3J0IHsgdHJ1bmNhdGVNb2RlbCwgRVJST1JfTU9ERUwgfSBmcm9tICcuLi9jb21tb24vdHJ1bmNhdGUnO1xuaW1wb3J0IHN0YWNrUGFyc2VyIGZyb20gJ2Vycm9yLXN0YWNrLXBhcnNlcic7XG52YXIgSUdOT1JFX0tFWVMgPSBbJ3N0YWNrJywgJ21lc3NhZ2UnXTtcbnZhciBQUk9NSVNFX1JFSkVDVElPTl9QUkVGSVggPSAnVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uOiAnO1xuXG5mdW5jdGlvbiBnZXRFcnJvclByb3BlcnRpZXMoZXJyb3IpIHtcbiAgdmFyIHByb3BlcnR5Rm91bmQgPSBmYWxzZTtcbiAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgT2JqZWN0LmtleXMoZXJyb3IpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChJR05PUkVfS0VZUy5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB2YWwgPSBlcnJvcltrZXldO1xuXG4gICAgaWYgKHZhbCA9PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsLnRvSVNPU3RyaW5nICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gICAgICB2YWwgPSB2YWwudG9JU09TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWw7XG4gICAgcHJvcGVydHlGb3VuZCA9IHRydWU7XG4gIH0pO1xuXG4gIGlmIChwcm9wZXJ0eUZvdW5kKSB7XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cbn1cblxudmFyIEVycm9yTG9nZ2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRXJyb3JMb2dnaW5nKGFwbVNlcnZlciwgY29uZmlnU2VydmljZSwgdHJhbnNhY3Rpb25TZXJ2aWNlKSB7XG4gICAgdGhpcy5fYXBtU2VydmVyID0gYXBtU2VydmVyO1xuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2UgPSBjb25maWdTZXJ2aWNlO1xuICAgIHRoaXMuX3RyYW5zYWN0aW9uU2VydmljZSA9IHRyYW5zYWN0aW9uU2VydmljZTtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBFcnJvckxvZ2dpbmcucHJvdG90eXBlO1xuXG4gIF9wcm90by5jcmVhdGVFcnJvckRhdGFNb2RlbCA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yRGF0YU1vZGVsKGVycm9yRXZlbnQpIHtcbiAgICB2YXIgZnJhbWVzID0gY3JlYXRlU3RhY2tUcmFjZXMoc3RhY2tQYXJzZXIsIGVycm9yRXZlbnQpO1xuICAgIHZhciBmaWx0ZXJlZEZyYW1lcyA9IGZpbHRlckludmFsaWRGcmFtZXMoZnJhbWVzKTtcbiAgICB2YXIgY3VscHJpdCA9ICcoaW5saW5lIHNjcmlwdCknO1xuICAgIHZhciBsYXN0RnJhbWUgPSBmaWx0ZXJlZEZyYW1lc1tmaWx0ZXJlZEZyYW1lcy5sZW5ndGggLSAxXTtcblxuICAgIGlmIChsYXN0RnJhbWUgJiYgbGFzdEZyYW1lLmZpbGVuYW1lKSB7XG4gICAgICBjdWxwcml0ID0gbGFzdEZyYW1lLmZpbGVuYW1lO1xuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0gZXJyb3JFdmVudC5tZXNzYWdlLFxuICAgICAgICBlcnJvciA9IGVycm9yRXZlbnQuZXJyb3I7XG4gICAgdmFyIGVycm9yTWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdmFyIGVycm9yVHlwZSA9ICcnO1xuICAgIHZhciBlcnJvckNvbnRleHQgPSB7fTtcblxuICAgIGlmIChlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnKSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UgfHwgZXJyb3IubWVzc2FnZTtcbiAgICAgIGVycm9yVHlwZSA9IGVycm9yLm5hbWU7XG4gICAgICB2YXIgY3VzdG9tUHJvcGVydGllcyA9IGdldEVycm9yUHJvcGVydGllcyhlcnJvcik7XG5cbiAgICAgIGlmIChjdXN0b21Qcm9wZXJ0aWVzKSB7XG4gICAgICAgIGVycm9yQ29udGV4dC5jdXN0b20gPSBjdXN0b21Qcm9wZXJ0aWVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZXJyb3JUeXBlKSB7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlICYmIGVycm9yTWVzc2FnZS5pbmRleE9mKCc6JykgPiAtMSkge1xuICAgICAgICBlcnJvclR5cGUgPSBlcnJvck1lc3NhZ2Uuc3BsaXQoJzonKVswXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY3VycmVudFRyYW5zYWN0aW9uID0gdGhpcy5fdHJhbnNhY3Rpb25TZXJ2aWNlLmdldEN1cnJlbnRUcmFuc2FjdGlvbigpO1xuXG4gICAgdmFyIHRyYW5zYWN0aW9uQ29udGV4dCA9IGN1cnJlbnRUcmFuc2FjdGlvbiA/IGN1cnJlbnRUcmFuc2FjdGlvbi5jb250ZXh0IDoge307XG5cbiAgICB2YXIgX3RoaXMkX2NvbmZpZ1NlcnZpY2UkID0gdGhpcy5fY29uZmlnU2VydmljZS5nZXQoJ2NvbnRleHQnKSxcbiAgICAgICAgdGFncyA9IF90aGlzJF9jb25maWdTZXJ2aWNlJC50YWdzLFxuICAgICAgICBjb25maWdDb250ZXh0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoX3RoaXMkX2NvbmZpZ1NlcnZpY2UkLCBfZXhjbHVkZWQpO1xuXG4gICAgdmFyIHBhZ2VDb250ZXh0ID0gZ2V0UGFnZUNvbnRleHQoKTtcbiAgICB2YXIgY29udGV4dCA9IG1lcmdlKHt9LCBwYWdlQ29udGV4dCwgdHJhbnNhY3Rpb25Db250ZXh0LCBjb25maWdDb250ZXh0LCBlcnJvckNvbnRleHQpO1xuICAgIHZhciBlcnJvck9iamVjdCA9IHtcbiAgICAgIGlkOiBnZW5lcmF0ZVJhbmRvbUlkKCksXG4gICAgICBjdWxwcml0OiBjdWxwcml0LFxuICAgICAgZXhjZXB0aW9uOiB7XG4gICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgc3RhY2t0cmFjZTogZmlsdGVyZWRGcmFtZXMsXG4gICAgICAgIHR5cGU6IGVycm9yVHlwZVxuICAgICAgfSxcbiAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICB9O1xuXG4gICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbikge1xuICAgICAgZXJyb3JPYmplY3QgPSBleHRlbmQoZXJyb3JPYmplY3QsIHtcbiAgICAgICAgdHJhY2VfaWQ6IGN1cnJlbnRUcmFuc2FjdGlvbi50cmFjZUlkLFxuICAgICAgICBwYXJlbnRfaWQ6IGN1cnJlbnRUcmFuc2FjdGlvbi5pZCxcbiAgICAgICAgdHJhbnNhY3Rpb25faWQ6IGN1cnJlbnRUcmFuc2FjdGlvbi5pZCxcbiAgICAgICAgdHJhbnNhY3Rpb246IHtcbiAgICAgICAgICB0eXBlOiBjdXJyZW50VHJhbnNhY3Rpb24udHlwZSxcbiAgICAgICAgICBzYW1wbGVkOiBjdXJyZW50VHJhbnNhY3Rpb24uc2FtcGxlZFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1bmNhdGVNb2RlbChFUlJPUl9NT0RFTCwgZXJyb3JPYmplY3QpO1xuICB9O1xuXG4gIF9wcm90by5sb2dFcnJvckV2ZW50ID0gZnVuY3Rpb24gbG9nRXJyb3JFdmVudChlcnJvckV2ZW50KSB7XG4gICAgaWYgKHR5cGVvZiBlcnJvckV2ZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBlcnJvck9iamVjdCA9IHRoaXMuY3JlYXRlRXJyb3JEYXRhTW9kZWwoZXJyb3JFdmVudCk7XG5cbiAgICBpZiAodHlwZW9mIGVycm9yT2JqZWN0LmV4Y2VwdGlvbi5tZXNzYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2FwbVNlcnZlci5hZGRFcnJvcihlcnJvck9iamVjdCk7XG4gIH07XG5cbiAgX3Byb3RvLnJlZ2lzdGVyTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChlcnJvckV2ZW50KSB7XG4gICAgICByZXR1cm4gX3RoaXMubG9nRXJyb3JFdmVudChlcnJvckV2ZW50KTtcbiAgICB9KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgZnVuY3Rpb24gKHByb21pc2VSZWplY3Rpb25FdmVudCkge1xuICAgICAgcmV0dXJuIF90aGlzLmxvZ1Byb21pc2VFdmVudChwcm9taXNlUmVqZWN0aW9uRXZlbnQpO1xuICAgIH0pO1xuICB9O1xuXG4gIF9wcm90by5sb2dQcm9taXNlRXZlbnQgPSBmdW5jdGlvbiBsb2dQcm9taXNlRXZlbnQocHJvbWlzZVJlamVjdGlvbkV2ZW50KSB7XG4gICAgdmFyIHJlYXNvbiA9IHByb21pc2VSZWplY3Rpb25FdmVudC5yZWFzb247XG5cbiAgICBpZiAocmVhc29uID09IG51bGwpIHtcbiAgICAgIHJlYXNvbiA9ICc8bm8gcmVhc29uIHNwZWNpZmllZD4nO1xuICAgIH1cblxuICAgIHZhciBlcnJvckV2ZW50O1xuXG4gICAgaWYgKHR5cGVvZiByZWFzb24ubWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBuYW1lID0gcmVhc29uLm5hbWUgPyByZWFzb24ubmFtZSArICc6ICcgOiAnJztcbiAgICAgIGVycm9yRXZlbnQgPSB7XG4gICAgICAgIGVycm9yOiByZWFzb24sXG4gICAgICAgIG1lc3NhZ2U6IFBST01JU0VfUkVKRUNUSU9OX1BSRUZJWCArIG5hbWUgKyByZWFzb24ubWVzc2FnZVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JFdmVudCA9IHRoaXMuX3BhcnNlUmVqZWN0UmVhc29uKHJlYXNvbik7XG4gICAgfVxuXG4gICAgdGhpcy5sb2dFcnJvckV2ZW50KGVycm9yRXZlbnQpO1xuICB9O1xuXG4gIF9wcm90by5sb2dFcnJvciA9IGZ1bmN0aW9uIGxvZ0Vycm9yKG1lc3NhZ2VPckVycm9yKSB7XG4gICAgdmFyIGVycm9yRXZlbnQgPSB7fTtcblxuICAgIGlmICh0eXBlb2YgbWVzc2FnZU9yRXJyb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlcnJvckV2ZW50Lm1lc3NhZ2UgPSBtZXNzYWdlT3JFcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JFdmVudC5lcnJvciA9IG1lc3NhZ2VPckVycm9yO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxvZ0Vycm9yRXZlbnQoZXJyb3JFdmVudCk7XG4gIH07XG5cbiAgX3Byb3RvLl9wYXJzZVJlamVjdFJlYXNvbiA9IGZ1bmN0aW9uIF9wYXJzZVJlamVjdFJlYXNvbihyZWFzb24pIHtcbiAgICB2YXIgZXJyb3JFdmVudCA9IHtcbiAgICAgIG1lc3NhZ2U6IFBST01JU0VfUkVKRUNUSU9OX1BSRUZJWFxuICAgIH07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWFzb24pKSB7XG4gICAgICBlcnJvckV2ZW50Lm1lc3NhZ2UgKz0gJzxvYmplY3Q+JztcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZWFzb24gPT09ICdvYmplY3QnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBlcnJvckV2ZW50Lm1lc3NhZ2UgKz0gSlNPTi5zdHJpbmdpZnkocmVhc29uKTtcbiAgICAgICAgZXJyb3JFdmVudC5lcnJvciA9IHJlYXNvbjtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGVycm9yRXZlbnQubWVzc2FnZSArPSAnPG9iamVjdD4nO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlYXNvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZXJyb3JFdmVudC5tZXNzYWdlICs9ICc8ZnVuY3Rpb24+JztcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JFdmVudC5tZXNzYWdlICs9IHJlYXNvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gZXJyb3JFdmVudDtcbiAgfTtcblxuICByZXR1cm4gRXJyb3JMb2dnaW5nO1xufSgpO1xuXG5leHBvcnQgZGVmYXVsdCBFcnJvckxvZ2dpbmc7IiwiaW1wb3J0IEVycm9yTG9nZ2luZyBmcm9tICcuL2Vycm9yLWxvZ2dpbmcnO1xuaW1wb3J0IHsgQ09ORklHX1NFUlZJQ0UsIFRSQU5TQUNUSU9OX1NFUlZJQ0UsIEVSUk9SX0xPR0dJTkcsIEFQTV9TRVJWRVIgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHNlcnZpY2VDcmVhdG9ycyB9IGZyb20gJy4uL2NvbW1vbi9zZXJ2aWNlLWZhY3RvcnknO1xuXG5mdW5jdGlvbiByZWdpc3RlclNlcnZpY2VzKCkge1xuICBzZXJ2aWNlQ3JlYXRvcnNbRVJST1JfTE9HR0lOR10gPSBmdW5jdGlvbiAoc2VydmljZUZhY3RvcnkpIHtcbiAgICB2YXIgX3NlcnZpY2VGYWN0b3J5JGdldFNlID0gc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShbQVBNX1NFUlZFUiwgQ09ORklHX1NFUlZJQ0UsIFRSQU5TQUNUSU9OX1NFUlZJQ0VdKSxcbiAgICAgICAgYXBtU2VydmVyID0gX3NlcnZpY2VGYWN0b3J5JGdldFNlWzBdLFxuICAgICAgICBjb25maWdTZXJ2aWNlID0gX3NlcnZpY2VGYWN0b3J5JGdldFNlWzFdLFxuICAgICAgICB0cmFuc2FjdGlvblNlcnZpY2UgPSBfc2VydmljZUZhY3RvcnkkZ2V0U2VbMl07XG5cbiAgICByZXR1cm4gbmV3IEVycm9yTG9nZ2luZyhhcG1TZXJ2ZXIsIGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSk7XG4gIH07XG59XG5cbmV4cG9ydCB7IHJlZ2lzdGVyU2VydmljZXMgfTsiLCJmdW5jdGlvbiBmaWxlUGF0aFRvRmlsZU5hbWUoZmlsZVVybCkge1xuICB2YXIgb3JpZ2luID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiB8fCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICsgKHdpbmRvdy5sb2NhdGlvbi5wb3J0ID8gJzonICsgd2luZG93LmxvY2F0aW9uLnBvcnQgOiAnJyk7XG5cbiAgaWYgKGZpbGVVcmwuaW5kZXhPZihvcmlnaW4pID4gLTEpIHtcbiAgICBmaWxlVXJsID0gZmlsZVVybC5yZXBsYWNlKG9yaWdpbiArICcvJywgJycpO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVVcmw7XG59XG5cbmZ1bmN0aW9uIGNsZWFuRmlsZVBhdGgoZmlsZVBhdGgpIHtcbiAgaWYgKGZpbGVQYXRoID09PSB2b2lkIDApIHtcbiAgICBmaWxlUGF0aCA9ICcnO1xuICB9XG5cbiAgaWYgKGZpbGVQYXRoID09PSAnPGFub255bW91cz4nKSB7XG4gICAgZmlsZVBhdGggPSAnJztcbiAgfVxuXG4gIHJldHVybiBmaWxlUGF0aDtcbn1cblxuZnVuY3Rpb24gaXNGaWxlSW5saW5lKGZpbGVVcmwpIHtcbiAgaWYgKGZpbGVVcmwpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZihmaWxlVXJsKSA9PT0gMDtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplU3RhY2tGcmFtZXMoc3RhY2tGcmFtZXMpIHtcbiAgcmV0dXJuIHN0YWNrRnJhbWVzLm1hcChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICBpZiAoZnJhbWUuZnVuY3Rpb25OYW1lKSB7XG4gICAgICBmcmFtZS5mdW5jdGlvbk5hbWUgPSBub3JtYWxpemVGdW5jdGlvbk5hbWUoZnJhbWUuZnVuY3Rpb25OYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnJhbWU7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVGdW5jdGlvbk5hbWUoZm5OYW1lKSB7XG4gIHZhciBwYXJ0cyA9IGZuTmFtZS5zcGxpdCgnLycpO1xuXG4gIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgZm5OYW1lID0gWydPYmplY3QnLCBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXV0uam9pbignLicpO1xuICB9IGVsc2Uge1xuICAgIGZuTmFtZSA9IHBhcnRzWzBdO1xuICB9XG5cbiAgZm5OYW1lID0gZm5OYW1lLnJlcGxhY2UoLy48JC9naSwgJy48YW5vbnltb3VzPicpO1xuICBmbk5hbWUgPSBmbk5hbWUucmVwbGFjZSgvXkFub255bW91cyBmdW5jdGlvbiQvLCAnPGFub255bW91cz4nKTtcbiAgcGFydHMgPSBmbk5hbWUuc3BsaXQoJy4nKTtcblxuICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgIGZuTmFtZSA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICB9IGVsc2Uge1xuICAgIGZuTmFtZSA9IHBhcnRzWzBdO1xuICB9XG5cbiAgcmV0dXJuIGZuTmFtZTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0YWNrVHJhY2Uoc3RhY2tUcmFjZXMpIHtcbiAgaWYgKHN0YWNrVHJhY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChzdGFja1RyYWNlcy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgc3RhY2tUcmFjZSA9IHN0YWNrVHJhY2VzWzBdO1xuICAgIHJldHVybiAnbGluZU51bWJlcicgaW4gc3RhY2tUcmFjZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhY2tUcmFjZXMoc3RhY2tQYXJzZXIsIGVycm9yRXZlbnQpIHtcbiAgdmFyIGVycm9yID0gZXJyb3JFdmVudC5lcnJvcixcbiAgICAgIGZpbGVuYW1lID0gZXJyb3JFdmVudC5maWxlbmFtZSxcbiAgICAgIGxpbmVubyA9IGVycm9yRXZlbnQubGluZW5vLFxuICAgICAgY29sbm8gPSBlcnJvckV2ZW50LmNvbG5vO1xuICB2YXIgc3RhY2tUcmFjZXMgPSBbXTtcblxuICBpZiAoZXJyb3IpIHtcbiAgICB0cnkge1xuICAgICAgc3RhY2tUcmFjZXMgPSBzdGFja1BhcnNlci5wYXJzZShlcnJvcik7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuXG4gIGlmICghaXNWYWxpZFN0YWNrVHJhY2Uoc3RhY2tUcmFjZXMpKSB7XG4gICAgc3RhY2tUcmFjZXMgPSBbe1xuICAgICAgZmlsZU5hbWU6IGZpbGVuYW1lLFxuICAgICAgbGluZU51bWJlcjogbGluZW5vLFxuICAgICAgY29sdW1uTnVtYmVyOiBjb2xub1xuICAgIH1dO1xuICB9XG5cbiAgdmFyIG5vcm1hbGl6ZWRTdGFja1RyYWNlcyA9IG5vcm1hbGl6ZVN0YWNrRnJhbWVzKHN0YWNrVHJhY2VzKTtcbiAgcmV0dXJuIG5vcm1hbGl6ZWRTdGFja1RyYWNlcy5tYXAoZnVuY3Rpb24gKHN0YWNrKSB7XG4gICAgdmFyIGZpbGVOYW1lID0gc3RhY2suZmlsZU5hbWUsXG4gICAgICAgIGxpbmVOdW1iZXIgPSBzdGFjay5saW5lTnVtYmVyLFxuICAgICAgICBjb2x1bW5OdW1iZXIgPSBzdGFjay5jb2x1bW5OdW1iZXIsXG4gICAgICAgIF9zdGFjayRmdW5jdGlvbk5hbWUgPSBzdGFjay5mdW5jdGlvbk5hbWUsXG4gICAgICAgIGZ1bmN0aW9uTmFtZSA9IF9zdGFjayRmdW5jdGlvbk5hbWUgPT09IHZvaWQgMCA/ICc8YW5vbnltb3VzPicgOiBfc3RhY2skZnVuY3Rpb25OYW1lO1xuXG4gICAgaWYgKCFmaWxlTmFtZSAmJiAhbGluZU51bWJlcikge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGlmICghY29sdW1uTnVtYmVyICYmICFsaW5lTnVtYmVyKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgdmFyIGZpbGVQYXRoID0gY2xlYW5GaWxlUGF0aChmaWxlTmFtZSk7XG4gICAgdmFyIGNsZWFuZWRGaWxlTmFtZSA9IGZpbGVQYXRoVG9GaWxlTmFtZShmaWxlUGF0aCk7XG5cbiAgICBpZiAoaXNGaWxlSW5saW5lKGZpbGVQYXRoKSkge1xuICAgICAgY2xlYW5lZEZpbGVOYW1lID0gJyhpbmxpbmUgc2NyaXB0KSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFic19wYXRoOiBmaWxlTmFtZSxcbiAgICAgIGZpbGVuYW1lOiBjbGVhbmVkRmlsZU5hbWUsXG4gICAgICBmdW5jdGlvbjogZnVuY3Rpb25OYW1lLFxuICAgICAgbGluZW5vOiBsaW5lTnVtYmVyLFxuICAgICAgY29sbm86IGNvbHVtbk51bWJlclxuICAgIH07XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckludmFsaWRGcmFtZXMoZnJhbWVzKSB7XG4gIHJldHVybiBmcmFtZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGZpbGVuYW1lID0gX3JlZi5maWxlbmFtZSxcbiAgICAgICAgbGluZW5vID0gX3JlZi5saW5lbm87XG4gICAgcmV0dXJuIHR5cGVvZiBmaWxlbmFtZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGxpbmVubyAhPT0gJ3VuZGVmaW5lZCc7XG4gIH0pO1xufSIsImltcG9ydCB7IHJlZ2lzdGVyU2VydmljZXMgYXMgcmVnaXN0ZXJFcnJvclNlcnZpY2VzIH0gZnJvbSAnLi9lcnJvci1sb2dnaW5nJztcbmltcG9ydCB7IHJlZ2lzdGVyU2VydmljZXMgYXMgcmVnaXN0ZXJQZXJmU2VydmljZXMsIG9ic2VydmVVc2VySW50ZXJhY3Rpb25zIH0gZnJvbSAnLi9wZXJmb3JtYW5jZS1tb25pdG9yaW5nJztcbmltcG9ydCB7IFNlcnZpY2VGYWN0b3J5IH0gZnJvbSAnLi9jb21tb24vc2VydmljZS1mYWN0b3J5JztcbmltcG9ydCB7IGlzUGxhdGZvcm1TdXBwb3J0ZWQsIHNjaGVkdWxlTWljcm9UYXNrLCBzY2hlZHVsZU1hY3JvVGFzaywgaXNCcm93c2VyIH0gZnJvbSAnLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgcGF0Y2hBbGwsIHBhdGNoRXZlbnRIYW5kbGVyIH0gZnJvbSAnLi9jb21tb24vcGF0Y2hpbmcnO1xuaW1wb3J0IHsgb2JzZXJ2ZVBhZ2VWaXNpYmlsaXR5LCBvYnNlcnZlUGFnZUNsaWNrcyB9IGZyb20gJy4vY29tbW9uL29ic2VydmVycyc7XG5pbXBvcnQgeyBQQUdFX0xPQURfREVMQVksIFBBR0VfTE9BRCwgRVJST1IsIENPTkZJR19TRVJWSUNFLCBMT0dHSU5HX1NFUlZJQ0UsIFRSQU5TQUNUSU9OX1NFUlZJQ0UsIEFQTV9TRVJWRVIsIFBFUkZPUk1BTkNFX01PTklUT1JJTkcsIEVSUk9SX0xPR0dJTkcsIEVWRU5UX1RBUkdFVCwgQ0xJQ0sgfSBmcm9tICcuL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgZ2V0SW5zdHJ1bWVudGF0aW9uRmxhZ3MgfSBmcm9tICcuL2NvbW1vbi9pbnN0cnVtZW50JztcbmltcG9ydCBhZnRlckZyYW1lIGZyb20gJy4vY29tbW9uL2FmdGVyLWZyYW1lJztcbmltcG9ydCB7IGJvb3RzdHJhcCB9IGZyb20gJy4vYm9vdHN0cmFwJztcbmltcG9ydCB7IGNyZWF0ZVRyYWNlciB9IGZyb20gJy4vb3BlbnRyYWNpbmcnO1xuXG5mdW5jdGlvbiBjcmVhdGVTZXJ2aWNlRmFjdG9yeSgpIHtcbiAgcmVnaXN0ZXJQZXJmU2VydmljZXMoKTtcbiAgcmVnaXN0ZXJFcnJvclNlcnZpY2VzKCk7XG4gIHZhciBzZXJ2aWNlRmFjdG9yeSA9IG5ldyBTZXJ2aWNlRmFjdG9yeSgpO1xuICByZXR1cm4gc2VydmljZUZhY3Rvcnk7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZVNlcnZpY2VGYWN0b3J5LCBTZXJ2aWNlRmFjdG9yeSwgcGF0Y2hBbGwsIHBhdGNoRXZlbnRIYW5kbGVyLCBpc1BsYXRmb3JtU3VwcG9ydGVkLCBpc0Jyb3dzZXIsIGdldEluc3RydW1lbnRhdGlvbkZsYWdzLCBjcmVhdGVUcmFjZXIsIHNjaGVkdWxlTWljcm9UYXNrLCBzY2hlZHVsZU1hY3JvVGFzaywgYWZ0ZXJGcmFtZSwgRVJST1IsIFBBR0VfTE9BRF9ERUxBWSwgUEFHRV9MT0FELCBDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBUUkFOU0FDVElPTl9TRVJWSUNFLCBBUE1fU0VSVkVSLCBQRVJGT1JNQU5DRV9NT05JVE9SSU5HLCBFUlJPUl9MT0dHSU5HLCBFVkVOVF9UQVJHRVQsIENMSUNLLCBvYnNlcnZlVXNlckludGVyYWN0aW9ucywgYm9vdHN0cmFwLCBvYnNlcnZlUGFnZVZpc2liaWxpdHksIG9ic2VydmVQYWdlQ2xpY2tzIH07IiwiaW1wb3J0IFRyYWNlciBmcm9tICcuL3RyYWNlcic7XG5pbXBvcnQgU3BhbiBmcm9tICcuL3NwYW4nO1xuaW1wb3J0IHsgVFJBTlNBQ1RJT05fU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBQRVJGT1JNQU5DRV9NT05JVE9SSU5HLCBFUlJPUl9MT0dHSU5HIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbmZ1bmN0aW9uIGNyZWF0ZVRyYWNlcihzZXJ2aWNlRmFjdG9yeSkge1xuICB2YXIgcGVyZm9ybWFuY2VNb25pdG9yaW5nID0gc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShQRVJGT1JNQU5DRV9NT05JVE9SSU5HKTtcbiAgdmFyIHRyYW5zYWN0aW9uU2VydmljZSA9IHNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoVFJBTlNBQ1RJT05fU0VSVklDRSk7XG4gIHZhciBlcnJvckxvZ2dpbmcgPSBzZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKEVSUk9SX0xPR0dJTkcpO1xuICB2YXIgbG9nZ2luZ1NlcnZpY2UgPSBzZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKExPR0dJTkdfU0VSVklDRSk7XG4gIHJldHVybiBuZXcgVHJhY2VyKHBlcmZvcm1hbmNlTW9uaXRvcmluZywgdHJhbnNhY3Rpb25TZXJ2aWNlLCBsb2dnaW5nU2VydmljZSwgZXJyb3JMb2dnaW5nKTtcbn1cblxuZXhwb3J0IHsgU3BhbiwgVHJhY2VyLCBjcmVhdGVUcmFjZXIgfTsiLCJmdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cblxuZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IG8uX19wcm90b19fID0gcDsgcmV0dXJuIG87IH07IHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7IH1cblxuaW1wb3J0IHsgU3BhbiBhcyBvdFNwYW4gfSBmcm9tICdvcGVudHJhY2luZy9saWIvc3Bhbic7XG5pbXBvcnQgeyBleHRlbmQsIGdldFRpbWVPcmlnaW4gfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IFRyYW5zYWN0aW9uIGZyb20gJy4uL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcvdHJhbnNhY3Rpb24nO1xuXG52YXIgU3BhbiA9IGZ1bmN0aW9uIChfb3RTcGFuKSB7XG4gIF9pbmhlcml0c0xvb3NlKFNwYW4sIF9vdFNwYW4pO1xuXG4gIGZ1bmN0aW9uIFNwYW4odHJhY2VyLCBzcGFuKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgX3RoaXMgPSBfb3RTcGFuLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICBfdGhpcy5fX3RyYWNlciA9IHRyYWNlcjtcbiAgICBfdGhpcy5zcGFuID0gc3BhbjtcbiAgICBfdGhpcy5pc1RyYW5zYWN0aW9uID0gc3BhbiBpbnN0YW5jZW9mIFRyYW5zYWN0aW9uO1xuICAgIF90aGlzLnNwYW5Db250ZXh0ID0ge1xuICAgICAgaWQ6IHNwYW4uaWQsXG4gICAgICB0cmFjZUlkOiBzcGFuLnRyYWNlSWQsXG4gICAgICBzYW1wbGVkOiBzcGFuLnNhbXBsZWRcbiAgICB9O1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBTcGFuLnByb3RvdHlwZTtcblxuICBfcHJvdG8uX2NvbnRleHQgPSBmdW5jdGlvbiBfY29udGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5zcGFuQ29udGV4dDtcbiAgfTtcblxuICBfcHJvdG8uX3RyYWNlciA9IGZ1bmN0aW9uIF90cmFjZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFjZXI7XG4gIH07XG5cbiAgX3Byb3RvLl9zZXRPcGVyYXRpb25OYW1lID0gZnVuY3Rpb24gX3NldE9wZXJhdGlvbk5hbWUobmFtZSkge1xuICAgIHRoaXMuc3Bhbi5uYW1lID0gbmFtZTtcbiAgfTtcblxuICBfcHJvdG8uX2FkZFRhZ3MgPSBmdW5jdGlvbiBfYWRkVGFncyhrZXlWYWx1ZVBhaXJzKSB7XG4gICAgdmFyIHRhZ3MgPSBleHRlbmQoe30sIGtleVZhbHVlUGFpcnMpO1xuXG4gICAgaWYgKHRhZ3MudHlwZSkge1xuICAgICAgdGhpcy5zcGFuLnR5cGUgPSB0YWdzLnR5cGU7XG4gICAgICBkZWxldGUgdGFncy50eXBlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzVHJhbnNhY3Rpb24pIHtcbiAgICAgIHZhciB1c2VySWQgPSB0YWdzWyd1c2VyLmlkJ107XG4gICAgICB2YXIgdXNlcm5hbWUgPSB0YWdzWyd1c2VyLnVzZXJuYW1lJ107XG4gICAgICB2YXIgZW1haWwgPSB0YWdzWyd1c2VyLmVtYWlsJ107XG5cbiAgICAgIGlmICh1c2VySWQgfHwgdXNlcm5hbWUgfHwgZW1haWwpIHtcbiAgICAgICAgdGhpcy5zcGFuLmFkZENvbnRleHQoe1xuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIGlkOiB1c2VySWQsXG4gICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICBlbWFpbDogZW1haWxcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkZWxldGUgdGFnc1sndXNlci5pZCddO1xuICAgICAgICBkZWxldGUgdGFnc1sndXNlci51c2VybmFtZSddO1xuICAgICAgICBkZWxldGUgdGFnc1sndXNlci5lbWFpbCddO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3Bhbi5hZGRMYWJlbHModGFncyk7XG4gIH07XG5cbiAgX3Byb3RvLl9sb2cgPSBmdW5jdGlvbiBfbG9nKGxvZywgdGltZXN0YW1wKSB7XG4gICAgaWYgKGxvZy5ldmVudCA9PT0gJ2Vycm9yJykge1xuICAgICAgaWYgKGxvZ1snZXJyb3Iub2JqZWN0J10pIHtcbiAgICAgICAgdGhpcy5fX3RyYWNlci5lcnJvckxvZ2dpbmcubG9nRXJyb3IobG9nWydlcnJvci5vYmplY3QnXSk7XG4gICAgICB9IGVsc2UgaWYgKGxvZy5tZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuX190cmFjZXIuZXJyb3JMb2dnaW5nLmxvZ0Vycm9yKGxvZy5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLl9maW5pc2ggPSBmdW5jdGlvbiBfZmluaXNoKGZpbmlzaFRpbWUpIHtcbiAgICB0aGlzLnNwYW4uZW5kKCk7XG5cbiAgICBpZiAoZmluaXNoVGltZSkge1xuICAgICAgdGhpcy5zcGFuLl9lbmQgPSBmaW5pc2hUaW1lIC0gZ2V0VGltZU9yaWdpbigpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3Bhbjtcbn0ob3RTcGFuKTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhbjsiLCJmdW5jdGlvbiBfaW5oZXJpdHNMb29zZShzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTsgc3ViQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3ViQ2xhc3M7IF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cblxuZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IG8uX19wcm90b19fID0gcDsgcmV0dXJuIG87IH07IHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7IH1cblxuaW1wb3J0IHsgVHJhY2VyIGFzIG90VHJhY2VyIH0gZnJvbSAnb3BlbnRyYWNpbmcvbGliL3RyYWNlcic7XG5pbXBvcnQgeyBSRUZFUkVOQ0VfQ0hJTERfT0YsIEZPUk1BVF9URVhUX01BUCwgRk9STUFUX0hUVFBfSEVBREVSUywgRk9STUFUX0JJTkFSWSB9IGZyb20gJ29wZW50cmFjaW5nL2xpYi9jb25zdGFudHMnO1xuaW1wb3J0IHsgU3BhbiBhcyBOb29wU3BhbiB9IGZyb20gJ29wZW50cmFjaW5nL2xpYi9zcGFuJztcbmltcG9ydCB7IGdldFRpbWVPcmlnaW4sIGZpbmQgfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgX19ERVZfXyB9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCBTcGFuIGZyb20gJy4vc3Bhbic7XG5cbnZhciBUcmFjZXIgPSBmdW5jdGlvbiAoX290VHJhY2VyKSB7XG4gIF9pbmhlcml0c0xvb3NlKFRyYWNlciwgX290VHJhY2VyKTtcblxuICBmdW5jdGlvbiBUcmFjZXIocGVyZm9ybWFuY2VNb25pdG9yaW5nLCB0cmFuc2FjdGlvblNlcnZpY2UsIGxvZ2dpbmdTZXJ2aWNlLCBlcnJvckxvZ2dpbmcpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBfdGhpcyA9IF9vdFRyYWNlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgX3RoaXMucGVyZm9ybWFuY2VNb25pdG9yaW5nID0gcGVyZm9ybWFuY2VNb25pdG9yaW5nO1xuICAgIF90aGlzLnRyYW5zYWN0aW9uU2VydmljZSA9IHRyYW5zYWN0aW9uU2VydmljZTtcbiAgICBfdGhpcy5sb2dnaW5nU2VydmljZSA9IGxvZ2dpbmdTZXJ2aWNlO1xuICAgIF90aGlzLmVycm9yTG9nZ2luZyA9IGVycm9yTG9nZ2luZztcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gVHJhY2VyLnByb3RvdHlwZTtcblxuICBfcHJvdG8uX3N0YXJ0U3BhbiA9IGZ1bmN0aW9uIF9zdGFydFNwYW4obmFtZSwgb3B0aW9ucykge1xuICAgIHZhciBzcGFuT3B0aW9ucyA9IHtcbiAgICAgIG1hbmFnZWQ6IHRydWVcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHNwYW5PcHRpb25zLnRpbWVzdGFtcCA9IG9wdGlvbnMuc3RhcnRUaW1lO1xuXG4gICAgICBpZiAob3B0aW9ucy5jaGlsZE9mKSB7XG4gICAgICAgIHNwYW5PcHRpb25zLnBhcmVudElkID0gb3B0aW9ucy5jaGlsZE9mLmlkO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnJlZmVyZW5jZXMgJiYgb3B0aW9ucy5yZWZlcmVuY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMucmVmZXJlbmNlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2luZ1NlcnZpY2UuZGVidWcoJ0VsYXN0aWMgQVBNIE9wZW5UcmFjaW5nOiBVbnN1cHBvcnRlZCBudW1iZXIgb2YgcmVmZXJlbmNlcywgb25seSB0aGUgZmlyc3QgY2hpbGRPZiByZWZlcmVuY2Ugd2lsbCBiZSByZWNvcmRlZC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2hpbGRSZWYgPSBmaW5kKG9wdGlvbnMucmVmZXJlbmNlcywgZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgIHJldHVybiByZWYudHlwZSgpID09PSBSRUZFUkVOQ0VfQ0hJTERfT0Y7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjaGlsZFJlZikge1xuICAgICAgICAgIHNwYW5PcHRpb25zLnBhcmVudElkID0gY2hpbGRSZWYucmVmZXJlbmNlZENvbnRleHQoKS5pZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzcGFuO1xuICAgIHZhciBjdXJyZW50VHJhbnNhY3Rpb24gPSB0aGlzLnRyYW5zYWN0aW9uU2VydmljZS5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKTtcblxuICAgIGlmIChjdXJyZW50VHJhbnNhY3Rpb24pIHtcbiAgICAgIHNwYW4gPSB0aGlzLnRyYW5zYWN0aW9uU2VydmljZS5zdGFydFNwYW4obmFtZSwgdW5kZWZpbmVkLCBzcGFuT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNwYW4gPSB0aGlzLnRyYW5zYWN0aW9uU2VydmljZS5zdGFydFRyYW5zYWN0aW9uKG5hbWUsIHVuZGVmaW5lZCwgc3Bhbk9wdGlvbnMpO1xuICAgIH1cblxuICAgIGlmICghc3Bhbikge1xuICAgICAgcmV0dXJuIG5ldyBOb29wU3BhbigpO1xuICAgIH1cblxuICAgIGlmIChzcGFuT3B0aW9ucy50aW1lc3RhbXApIHtcbiAgICAgIHNwYW4uX3N0YXJ0ID0gc3Bhbk9wdGlvbnMudGltZXN0YW1wIC0gZ2V0VGltZU9yaWdpbigpO1xuICAgIH1cblxuICAgIHZhciBvdFNwYW4gPSBuZXcgU3Bhbih0aGlzLCBzcGFuKTtcblxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudGFncykge1xuICAgICAgb3RTcGFuLmFkZFRhZ3Mob3B0aW9ucy50YWdzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3RTcGFuO1xuICB9O1xuXG4gIF9wcm90by5faW5qZWN0ID0gZnVuY3Rpb24gX2luamVjdChzcGFuQ29udGV4dCwgZm9ybWF0LCBjYXJyaWVyKSB7XG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGNhc2UgRk9STUFUX1RFWFRfTUFQOlxuICAgICAgY2FzZSBGT1JNQVRfSFRUUF9IRUFERVJTOlxuICAgICAgICB0aGlzLnBlcmZvcm1hbmNlTW9uaXRvcmluZy5pbmplY3REdEhlYWRlcihzcGFuQ29udGV4dCwgY2Fycmllcik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZPUk1BVF9CSU5BUlk6XG4gICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgdGhpcy5sb2dnaW5nU2VydmljZS5kZWJ1ZygnRWxhc3RpYyBBUE0gT3BlblRyYWNpbmc6IGJpbmFyeSBjYXJyaWVyIGZvcm1hdCBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5fZXh0cmFjdCA9IGZ1bmN0aW9uIF9leHRyYWN0KGZvcm1hdCwgY2Fycmllcikge1xuICAgIHZhciBjdHg7XG5cbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgY2FzZSBGT1JNQVRfVEVYVF9NQVA6XG4gICAgICBjYXNlIEZPUk1BVF9IVFRQX0hFQURFUlM6XG4gICAgICAgIGN0eCA9IHRoaXMucGVyZm9ybWFuY2VNb25pdG9yaW5nLmV4dHJhY3REdEhlYWRlcihjYXJyaWVyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRk9STUFUX0JJTkFSWTpcbiAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICB0aGlzLmxvZ2dpbmdTZXJ2aWNlLmRlYnVnKCdFbGFzdGljIEFQTSBPcGVuVHJhY2luZzogYmluYXJ5IGNhcnJpZXIgZm9ybWF0IGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWN0eCkge1xuICAgICAgY3R4ID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIHJldHVybiBUcmFjZXI7XG59KG90VHJhY2VyKTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhY2VyOyIsImltcG9ydCB7IGdldER1cmF0aW9uLCBQRVJGIH0gZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IFBBR0VfTE9BRCwgVFJVTkNBVEVEX1RZUEUgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbnZhciBwYWdlTG9hZEJyZWFrZG93bnMgPSBbWydkb21haW5Mb29rdXBTdGFydCcsICdkb21haW5Mb29rdXBFbmQnLCAnRE5TJ10sIFsnY29ubmVjdFN0YXJ0JywgJ2Nvbm5lY3RFbmQnLCAnVENQJ10sIFsncmVxdWVzdFN0YXJ0JywgJ3Jlc3BvbnNlU3RhcnQnLCAnUmVxdWVzdCddLCBbJ3Jlc3BvbnNlU3RhcnQnLCAncmVzcG9uc2VFbmQnLCAnUmVzcG9uc2UnXSwgWydkb21Mb2FkaW5nJywgJ2RvbUNvbXBsZXRlJywgJ1Byb2Nlc3NpbmcnXSwgWydsb2FkRXZlbnRTdGFydCcsICdsb2FkRXZlbnRFbmQnLCAnTG9hZCddXTtcblxuZnVuY3Rpb24gZ2V0VmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlU2VsZlRpbWUodHJhbnNhY3Rpb24pIHtcbiAgdmFyIHNwYW5zID0gdHJhbnNhY3Rpb24uc3BhbnMsXG4gICAgICBfc3RhcnQgPSB0cmFuc2FjdGlvbi5fc3RhcnQsXG4gICAgICBfZW5kID0gdHJhbnNhY3Rpb24uX2VuZDtcblxuICBpZiAoc3BhbnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRyYW5zYWN0aW9uLmR1cmF0aW9uKCk7XG4gIH1cblxuICBzcGFucy5zb3J0KGZ1bmN0aW9uIChzcGFuMSwgc3BhbjIpIHtcbiAgICByZXR1cm4gc3BhbjEuX3N0YXJ0IC0gc3BhbjIuX3N0YXJ0O1xuICB9KTtcbiAgdmFyIHNwYW4gPSBzcGFuc1swXTtcbiAgdmFyIHNwYW5FbmQgPSBzcGFuLl9lbmQ7XG4gIHZhciBzcGFuU3RhcnQgPSBzcGFuLl9zdGFydDtcbiAgdmFyIGxhc3RDb250aW51b3VzRW5kID0gc3BhbkVuZDtcbiAgdmFyIHNlbGZUaW1lID0gc3BhblN0YXJ0IC0gX3N0YXJ0O1xuXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgc3BhbnMubGVuZ3RoOyBpKyspIHtcbiAgICBzcGFuID0gc3BhbnNbaV07XG4gICAgc3BhblN0YXJ0ID0gc3Bhbi5fc3RhcnQ7XG4gICAgc3BhbkVuZCA9IHNwYW4uX2VuZDtcblxuICAgIGlmIChzcGFuU3RhcnQgPiBsYXN0Q29udGludW91c0VuZCkge1xuICAgICAgc2VsZlRpbWUgKz0gc3BhblN0YXJ0IC0gbGFzdENvbnRpbnVvdXNFbmQ7XG4gICAgICBsYXN0Q29udGludW91c0VuZCA9IHNwYW5FbmQ7XG4gICAgfSBlbHNlIGlmIChzcGFuRW5kID4gbGFzdENvbnRpbnVvdXNFbmQpIHtcbiAgICAgIGxhc3RDb250aW51b3VzRW5kID0gc3BhbkVuZDtcbiAgICB9XG4gIH1cblxuICBpZiAobGFzdENvbnRpbnVvdXNFbmQgPCBfZW5kKSB7XG4gICAgc2VsZlRpbWUgKz0gX2VuZCAtIGxhc3RDb250aW51b3VzRW5kO1xuICB9XG5cbiAgcmV0dXJuIHNlbGZUaW1lO1xufVxuXG5mdW5jdGlvbiBncm91cFNwYW5zKHRyYW5zYWN0aW9uKSB7XG4gIHZhciBzcGFuTWFwID0ge307XG4gIHZhciB0cmFuc2FjdGlvblNlbGZUaW1lID0gY2FsY3VsYXRlU2VsZlRpbWUodHJhbnNhY3Rpb24pO1xuICBzcGFuTWFwWydhcHAnXSA9IHtcbiAgICBjb3VudDogMSxcbiAgICBkdXJhdGlvbjogdHJhbnNhY3Rpb25TZWxmVGltZVxuICB9O1xuICB2YXIgc3BhbnMgPSB0cmFuc2FjdGlvbi5zcGFucztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICB2YXIgZHVyYXRpb24gPSBzcGFuLmR1cmF0aW9uKCk7XG5cbiAgICBpZiAoZHVyYXRpb24gPT09IDAgfHwgZHVyYXRpb24gPT0gbnVsbCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSBzcGFuLnR5cGUsXG4gICAgICAgIHN1YnR5cGUgPSBzcGFuLnN1YnR5cGU7XG4gICAgdmFyIGtleSA9IHR5cGUucmVwbGFjZShUUlVOQ0FURURfVFlQRSwgJycpO1xuXG4gICAgaWYgKHN1YnR5cGUpIHtcbiAgICAgIGtleSArPSAnLicgKyBzdWJ0eXBlO1xuICAgIH1cblxuICAgIGlmICghc3Bhbk1hcFtrZXldKSB7XG4gICAgICBzcGFuTWFwW2tleV0gPSB7XG4gICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICBjb3VudDogMFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBzcGFuTWFwW2tleV0uY291bnQrKztcbiAgICBzcGFuTWFwW2tleV0uZHVyYXRpb24gKz0gZHVyYXRpb247XG4gIH1cblxuICByZXR1cm4gc3Bhbk1hcDtcbn1cblxuZnVuY3Rpb24gZ2V0U3BhbkJyZWFrZG93bih0cmFuc2FjdGlvbkRldGFpbHMsIF9yZWYpIHtcbiAgdmFyIGRldGFpbHMgPSBfcmVmLmRldGFpbHMsXG4gICAgICBfcmVmJGNvdW50ID0gX3JlZi5jb3VudCxcbiAgICAgIGNvdW50ID0gX3JlZiRjb3VudCA9PT0gdm9pZCAwID8gMSA6IF9yZWYkY291bnQsXG4gICAgICBkdXJhdGlvbiA9IF9yZWYuZHVyYXRpb247XG4gIHJldHVybiB7XG4gICAgdHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uRGV0YWlscyxcbiAgICBzcGFuOiBkZXRhaWxzLFxuICAgIHNhbXBsZXM6IHtcbiAgICAgICdzcGFuLnNlbGZfdGltZS5jb3VudCc6IGdldFZhbHVlKGNvdW50KSxcbiAgICAgICdzcGFuLnNlbGZfdGltZS5zdW0udXMnOiBnZXRWYWx1ZShkdXJhdGlvbiAqIDEwMDApXG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUJyZWFrZG93bih0cmFuc2FjdGlvbiwgdGltaW5ncykge1xuICBpZiAodGltaW5ncyA9PT0gdm9pZCAwKSB7XG4gICAgdGltaW5ncyA9IFBFUkYudGltaW5nO1xuICB9XG5cbiAgdmFyIGJyZWFrZG93bnMgPSBbXTtcbiAgdmFyIG5hbWUgPSB0cmFuc2FjdGlvbi5uYW1lLFxuICAgICAgdHlwZSA9IHRyYW5zYWN0aW9uLnR5cGUsXG4gICAgICBzYW1wbGVkID0gdHJhbnNhY3Rpb24uc2FtcGxlZDtcbiAgdmFyIHRyYW5zYWN0aW9uRGV0YWlscyA9IHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIHR5cGU6IHR5cGVcbiAgfTtcblxuICBpZiAoIXNhbXBsZWQpIHtcbiAgICByZXR1cm4gYnJlYWtkb3ducztcbiAgfVxuXG4gIGlmICh0eXBlID09PSBQQUdFX0xPQUQgJiYgdGltaW5ncykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFnZUxvYWRCcmVha2Rvd25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VycmVudCA9IHBhZ2VMb2FkQnJlYWtkb3duc1tpXTtcbiAgICAgIHZhciBzdGFydCA9IHRpbWluZ3NbY3VycmVudFswXV07XG4gICAgICB2YXIgZW5kID0gdGltaW5nc1tjdXJyZW50WzFdXTtcbiAgICAgIHZhciBkdXJhdGlvbiA9IGdldER1cmF0aW9uKHN0YXJ0LCBlbmQpO1xuXG4gICAgICBpZiAoZHVyYXRpb24gPT09IDAgfHwgZHVyYXRpb24gPT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgYnJlYWtkb3ducy5wdXNoKGdldFNwYW5CcmVha2Rvd24odHJhbnNhY3Rpb25EZXRhaWxzLCB7XG4gICAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgICB0eXBlOiBjdXJyZW50WzJdXG4gICAgICAgIH0sXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvblxuICAgICAgfSkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgc3Bhbk1hcCA9IGdyb3VwU3BhbnModHJhbnNhY3Rpb24pO1xuICAgIE9iamVjdC5rZXlzKHNwYW5NYXApLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIF9rZXkkc3BsaXQgPSBrZXkuc3BsaXQoJy4nKSxcbiAgICAgICAgICB0eXBlID0gX2tleSRzcGxpdFswXSxcbiAgICAgICAgICBzdWJ0eXBlID0gX2tleSRzcGxpdFsxXTtcblxuICAgICAgdmFyIF9zcGFuTWFwJGtleSA9IHNwYW5NYXBba2V5XSxcbiAgICAgICAgICBkdXJhdGlvbiA9IF9zcGFuTWFwJGtleS5kdXJhdGlvbixcbiAgICAgICAgICBjb3VudCA9IF9zcGFuTWFwJGtleS5jb3VudDtcbiAgICAgIGJyZWFrZG93bnMucHVzaChnZXRTcGFuQnJlYWtkb3duKHRyYW5zYWN0aW9uRGV0YWlscywge1xuICAgICAgICBkZXRhaWxzOiB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBzdWJ0eXBlOiBzdWJ0eXBlXG4gICAgICAgIH0sXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgY291bnQ6IGNvdW50XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gYnJlYWtkb3ducztcbn0iLCJpbXBvcnQgUGVyZm9ybWFuY2VNb25pdG9yaW5nIGZyb20gJy4vcGVyZm9ybWFuY2UtbW9uaXRvcmluZyc7XG5pbXBvcnQgVHJhbnNhY3Rpb25TZXJ2aWNlIGZyb20gJy4vdHJhbnNhY3Rpb24tc2VydmljZSc7XG5pbXBvcnQgeyBBUE1fU0VSVkVSLCBDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBUUkFOU0FDVElPTl9TRVJWSUNFLCBQRVJGT1JNQU5DRV9NT05JVE9SSU5HIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBzZXJ2aWNlQ3JlYXRvcnMgfSBmcm9tICcuLi9jb21tb24vc2VydmljZS1mYWN0b3J5JztcbmltcG9ydCB7IG9ic2VydmVVc2VySW50ZXJhY3Rpb25zIH0gZnJvbSAnLi9tZXRyaWNzL2lucC9wcm9jZXNzJztcbmltcG9ydCB7IHJlcG9ydElucCB9IGZyb20gJy4vbWV0cmljcy9pbnAvcmVwb3J0JztcblxuZnVuY3Rpb24gcmVnaXN0ZXJTZXJ2aWNlcygpIHtcbiAgc2VydmljZUNyZWF0b3JzW1RSQU5TQUNUSU9OX1NFUlZJQ0VdID0gZnVuY3Rpb24gKHNlcnZpY2VGYWN0b3J5KSB7XG4gICAgdmFyIF9zZXJ2aWNlRmFjdG9yeSRnZXRTZSA9IHNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoW0xPR0dJTkdfU0VSVklDRSwgQ09ORklHX1NFUlZJQ0VdKSxcbiAgICAgICAgbG9nZ2luZ1NlcnZpY2UgPSBfc2VydmljZUZhY3RvcnkkZ2V0U2VbMF0sXG4gICAgICAgIGNvbmZpZ1NlcnZpY2UgPSBfc2VydmljZUZhY3RvcnkkZ2V0U2VbMV07XG5cbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uU2VydmljZShsb2dnaW5nU2VydmljZSwgY29uZmlnU2VydmljZSk7XG4gIH07XG5cbiAgc2VydmljZUNyZWF0b3JzW1BFUkZPUk1BTkNFX01PTklUT1JJTkddID0gZnVuY3Rpb24gKHNlcnZpY2VGYWN0b3J5KSB7XG4gICAgdmFyIF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTIgPSBzZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFtBUE1fU0VSVkVSLCBDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBUUkFOU0FDVElPTl9TRVJWSUNFXSksXG4gICAgICAgIGFwbVNlcnZlciA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTJbMF0sXG4gICAgICAgIGNvbmZpZ1NlcnZpY2UgPSBfc2VydmljZUZhY3RvcnkkZ2V0U2UyWzFdLFxuICAgICAgICBsb2dnaW5nU2VydmljZSA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTJbMl0sXG4gICAgICAgIHRyYW5zYWN0aW9uU2VydmljZSA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTJbM107XG5cbiAgICByZXR1cm4gbmV3IFBlcmZvcm1hbmNlTW9uaXRvcmluZyhhcG1TZXJ2ZXIsIGNvbmZpZ1NlcnZpY2UsIGxvZ2dpbmdTZXJ2aWNlLCB0cmFuc2FjdGlvblNlcnZpY2UpO1xuICB9O1xufVxuXG5leHBvcnQgeyByZWdpc3RlclNlcnZpY2VzLCBvYnNlcnZlVXNlckludGVyYWN0aW9ucywgcmVwb3J0SW5wIH07IiwiaW1wb3J0IHsgRVZFTlQsIEZJUlNUX0lOUFVUIH0gZnJvbSAnLi4vLi4vLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBpc1BlcmZJbnRlcmFjdGlvbkNvdW50U3VwcG9ydGVkIH0gZnJvbSAnLi4vLi4vLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IFBlcmZFbnRyeVJlY29yZGVyIH0gZnJvbSAnLi4vbWV0cmljcyc7XG52YXIgSU5QX1RIUkVTSE9MRCA9IDQwO1xudmFyIE1BWF9JTlRFUkFDVElPTlNfVE9fQ09OU0lERVIgPSAxMDtcbmV4cG9ydCB2YXIgaW5wU3RhdGUgPSB7XG4gIG1pbkludGVyYWN0aW9uSWQ6IEluZmluaXR5LFxuICBtYXhJbnRlcmFjdGlvbklkOiAwLFxuICBpbnRlcmFjdGlvbkNvdW50OiAwLFxuICBsb25nZXN0SW50ZXJhY3Rpb25zOiBbXVxufTtcbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlVXNlckludGVyYWN0aW9ucyhyZWNvcmRlcikge1xuICBpZiAocmVjb3JkZXIgPT09IHZvaWQgMCkge1xuICAgIHJlY29yZGVyID0gbmV3IFBlcmZFbnRyeVJlY29yZGVyKHByb2Nlc3NVc2VySW50ZXJhY3Rpb25zKTtcbiAgfVxuXG4gIHZhciBpc1BlcmZDb3VudFN1cHBvcnRlZCA9IGlzUGVyZkludGVyYWN0aW9uQ291bnRTdXBwb3J0ZWQoKTtcbiAgdmFyIGR1cmF0aW9uVGhyZXNob2xkID0gaXNQZXJmQ291bnRTdXBwb3J0ZWQgPyBJTlBfVEhSRVNIT0xEIDogMTY7XG4gIHJlY29yZGVyLnN0YXJ0KEVWRU5ULCB7XG4gICAgYnVmZmVyZWQ6IHRydWUsXG4gICAgZHVyYXRpb25UaHJlc2hvbGQ6IGR1cmF0aW9uVGhyZXNob2xkXG4gIH0pO1xuXG4gIGlmICghaXNQZXJmQ291bnRTdXBwb3J0ZWQpIHtcbiAgICByZWNvcmRlci5zdGFydChGSVJTVF9JTlBVVCk7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzVXNlckludGVyYWN0aW9ucyhsaXN0KSB7XG4gIHZhciBlbnRyaWVzID0gbGlzdC5nZXRFbnRyaWVzKCk7XG4gIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICBpZiAoIWVudHJ5LmludGVyYWN0aW9uSWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB1cGRhdGVJbnRlcmFjdGlvbkNvdW50KGVudHJ5KTtcblxuICAgIGlmIChlbnRyeS5kdXJhdGlvbiA8IElOUF9USFJFU0hPTEQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdG9yZVVzZXJJbnRlcmFjdGlvbihlbnRyeSk7XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUlucCgpIHtcbiAgaWYgKGlucFN0YXRlLmxvbmdlc3RJbnRlcmFjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGludGVyYWN0aW9uQ291bnQoKSA+IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpbnRlcmFjdGlvbkluZGV4ID0gTWF0aC5taW4oaW5wU3RhdGUubG9uZ2VzdEludGVyYWN0aW9ucy5sZW5ndGggLSAxLCBNYXRoLmZsb29yKGludGVyYWN0aW9uQ291bnQoKSAvIDUwKSk7XG4gIHZhciBpbnAgPSBpbnBTdGF0ZS5sb25nZXN0SW50ZXJhY3Rpb25zW2ludGVyYWN0aW9uSW5kZXhdLmR1cmF0aW9uO1xuICByZXR1cm4gaW5wO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGludGVyYWN0aW9uQ291bnQoKSB7XG4gIHJldHVybiBwZXJmb3JtYW5jZS5pbnRlcmFjdGlvbkNvdW50IHx8IGlucFN0YXRlLmludGVyYWN0aW9uQ291bnQ7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZUlOUFN0YXRlKCkge1xuICBpbnBTdGF0ZS5taW5JbnRlcmFjdGlvbklkID0gSW5maW5pdHk7XG4gIGlucFN0YXRlLm1heEludGVyYWN0aW9uSWQgPSAwO1xuICBpbnBTdGF0ZS5pbnRlcmFjdGlvbkNvdW50ID0gMDtcbiAgaW5wU3RhdGUubG9uZ2VzdEludGVyYWN0aW9ucyA9IFtdO1xufVxuXG5mdW5jdGlvbiBzdG9yZVVzZXJJbnRlcmFjdGlvbihlbnRyeSkge1xuICB2YXIgbGVhc3RTbG93ID0gaW5wU3RhdGUubG9uZ2VzdEludGVyYWN0aW9uc1tpbnBTdGF0ZS5sb25nZXN0SW50ZXJhY3Rpb25zLmxlbmd0aCAtIDFdO1xuXG4gIGlmICh0eXBlb2YgbGVhc3RTbG93ICE9PSAndW5kZWZpbmVkJyAmJiBlbnRyeS5kdXJhdGlvbiA8PSBsZWFzdFNsb3cuZHVyYXRpb24gJiYgZW50cnkuaW50ZXJhY3Rpb25JZCAhPSBsZWFzdFNsb3cuaWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmlsdGVyZWRJbnRlcmFjdGlvbiA9IGlucFN0YXRlLmxvbmdlc3RJbnRlcmFjdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChpbnRlcmFjdGlvbikge1xuICAgIHJldHVybiBpbnRlcmFjdGlvbi5pZCA9PT0gZW50cnkuaW50ZXJhY3Rpb25JZDtcbiAgfSk7XG5cbiAgaWYgKGZpbHRlcmVkSW50ZXJhY3Rpb24ubGVuZ3RoID4gMCkge1xuICAgIHZhciBmb3VuZEludGVyYWN0aW9uID0gZmlsdGVyZWRJbnRlcmFjdGlvblswXTtcbiAgICBmb3VuZEludGVyYWN0aW9uLmR1cmF0aW9uID0gTWF0aC5tYXgoZm91bmRJbnRlcmFjdGlvbi5kdXJhdGlvbiwgZW50cnkuZHVyYXRpb24pO1xuICB9IGVsc2Uge1xuICAgIGlucFN0YXRlLmxvbmdlc3RJbnRlcmFjdGlvbnMucHVzaCh7XG4gICAgICBpZDogZW50cnkuaW50ZXJhY3Rpb25JZCxcbiAgICAgIGR1cmF0aW9uOiBlbnRyeS5kdXJhdGlvblxuICAgIH0pO1xuICB9XG5cbiAgaW5wU3RhdGUubG9uZ2VzdEludGVyYWN0aW9ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICB9KTtcbiAgaW5wU3RhdGUubG9uZ2VzdEludGVyYWN0aW9ucy5zcGxpY2UoTUFYX0lOVEVSQUNUSU9OU19UT19DT05TSURFUik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUludGVyYWN0aW9uQ291bnQoZW50cnkpIHtcbiAgaWYgKGlzUGVyZkludGVyYWN0aW9uQ291bnRTdXBwb3J0ZWQoKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlucFN0YXRlLm1pbkludGVyYWN0aW9uSWQgPSBNYXRoLm1pbihpbnBTdGF0ZS5taW5JbnRlcmFjdGlvbklkLCBlbnRyeS5pbnRlcmFjdGlvbklkKTtcbiAgaW5wU3RhdGUubWF4SW50ZXJhY3Rpb25JZCA9IE1hdGgubWF4KGlucFN0YXRlLm1heEludGVyYWN0aW9uSWQsIGVudHJ5LmludGVyYWN0aW9uSWQpO1xuICBpbnBTdGF0ZS5pbnRlcmFjdGlvbkNvdW50ID0gKGlucFN0YXRlLm1heEludGVyYWN0aW9uSWQgLSBpbnBTdGF0ZS5taW5JbnRlcmFjdGlvbklkKSAvIDcgKyAxO1xufSIsImltcG9ydCB7IGNhbGN1bGF0ZUlucCwgcmVzdG9yZUlOUFN0YXRlIH0gZnJvbSAnLi9wcm9jZXNzJztcbmltcG9ydCB7IG5vdyB9IGZyb20gJy4uLy4uLy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBQQUdFX0VYSVQgfSBmcm9tICcuLi8uLi8uLi9jb21tb24vY29uc3RhbnRzJztcbmV4cG9ydCBmdW5jdGlvbiByZXBvcnRJbnAodHJhbnNhY3Rpb25TZXJ2aWNlKSB7XG4gIHZhciBpbnAgPSBjYWxjdWxhdGVJbnAoKTtcblxuICBpZiAoaW5wID49IDApIHtcbiAgICB2YXIgc3RhcnRUaW1lID0gbm93KCk7XG4gICAgdmFyIGlucFRyID0gdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0VHJhbnNhY3Rpb24oUEFHRV9FWElULCBQQUdFX0VYSVQsIHtcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lXG4gICAgfSk7XG4gICAgdmFyIG5hdmlnYXRpb25zID0gcGVyZm9ybWFuY2UuZ2V0RW50cmllc0J5VHlwZSgnbmF2aWdhdGlvbicpO1xuXG4gICAgaWYgKG5hdmlnYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBoYXJkTmF2aWdhdGlvblVybCA9IG5hdmlnYXRpb25zWzBdLm5hbWU7XG4gICAgICBpbnBUci5hZGRDb250ZXh0KHtcbiAgICAgICAgcGFnZToge1xuICAgICAgICAgIHVybDogaGFyZE5hdmlnYXRpb25VcmxcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5wVHIuYWRkTGFiZWxzKHtcbiAgICAgIGlucF92YWx1ZTogaW5wXG4gICAgfSk7XG4gICAgdmFyIGVuZFRpbWUgPSBzdGFydFRpbWUgKyBpbnAgKyAxO1xuICAgIGlucFRyLmVuZChlbmRUaW1lKTtcbiAgICByZXN0b3JlSU5QU3RhdGUoKTtcbiAgICByZXR1cm4gaW5wVHI7XG4gIH1cbn0iLCJmdW5jdGlvbiBfZXh0ZW5kcygpIHsgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9OyByZXR1cm4gX2V4dGVuZHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfVxuXG5pbXBvcnQgeyBMT05HX1RBU0ssIExBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVCwgRklSU1RfQ09OVEVOVEZVTF9QQUlOVCwgRklSU1RfSU5QVVQsIExBWU9VVF9TSElGVCB9IGZyb20gJy4uLy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbm9vcCwgUEVSRiwgaXNQZXJmVHlwZVN1cHBvcnRlZCwgaXNSZWRpcmVjdEluZm9BdmFpbGFibGUgfSBmcm9tICcuLi8uLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IFNwYW4gZnJvbSAnLi4vc3Bhbic7XG5leHBvcnQgdmFyIG1ldHJpY3MgPSB7XG4gIGZpZDogMCxcbiAgZmNwOiAwLFxuICB0YnQ6IHtcbiAgICBzdGFydDogSW5maW5pdHksXG4gICAgZHVyYXRpb246IDBcbiAgfSxcbiAgY2xzOiB7XG4gICAgc2NvcmU6IDAsXG4gICAgZmlyc3RFbnRyeVRpbWU6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSxcbiAgICBwcmV2RW50cnlUaW1lOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksXG4gICAgY3VycmVudFNlc3Npb25TY29yZTogMFxuICB9LFxuICBsb25ndGFzazoge1xuICAgIGNvdW50OiAwLFxuICAgIGR1cmF0aW9uOiAwLFxuICAgIG1heDogMFxuICB9XG59O1xudmFyIExPTkdfVEFTS19USFJFU0hPTEQgPSA1MDtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb25nVGFza1NwYW5zKGxvbmd0YXNrcywgYWdnKSB7XG4gIHZhciBzcGFucyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbG9uZ3Rhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIF9sb25ndGFza3MkaSA9IGxvbmd0YXNrc1tpXSxcbiAgICAgICAgbmFtZSA9IF9sb25ndGFza3MkaS5uYW1lLFxuICAgICAgICBzdGFydFRpbWUgPSBfbG9uZ3Rhc2tzJGkuc3RhcnRUaW1lLFxuICAgICAgICBkdXJhdGlvbiA9IF9sb25ndGFza3MkaS5kdXJhdGlvbixcbiAgICAgICAgYXR0cmlidXRpb24gPSBfbG9uZ3Rhc2tzJGkuYXR0cmlidXRpb247XG4gICAgdmFyIGVuZCA9IHN0YXJ0VGltZSArIGR1cmF0aW9uO1xuICAgIHZhciBzcGFuID0gbmV3IFNwYW4oXCJMb25ndGFzayhcIiArIG5hbWUgKyBcIilcIiwgTE9OR19UQVNLLCB7XG4gICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZVxuICAgIH0pO1xuICAgIGFnZy5jb3VudCsrO1xuICAgIGFnZy5kdXJhdGlvbiArPSBkdXJhdGlvbjtcbiAgICBhZ2cubWF4ID0gTWF0aC5tYXgoZHVyYXRpb24sIGFnZy5tYXgpO1xuXG4gICAgaWYgKGF0dHJpYnV0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBfYXR0cmlidXRpb24kID0gYXR0cmlidXRpb25bMF0sXG4gICAgICAgICAgX25hbWUgPSBfYXR0cmlidXRpb24kLm5hbWUsXG4gICAgICAgICAgY29udGFpbmVyVHlwZSA9IF9hdHRyaWJ1dGlvbiQuY29udGFpbmVyVHlwZSxcbiAgICAgICAgICBjb250YWluZXJOYW1lID0gX2F0dHJpYnV0aW9uJC5jb250YWluZXJOYW1lLFxuICAgICAgICAgIGNvbnRhaW5lcklkID0gX2F0dHJpYnV0aW9uJC5jb250YWluZXJJZDtcbiAgICAgIHZhciBjdXN0b21Db250ZXh0ID0ge1xuICAgICAgICBhdHRyaWJ1dGlvbjogX25hbWUsXG4gICAgICAgIHR5cGU6IGNvbnRhaW5lclR5cGVcbiAgICAgIH07XG5cbiAgICAgIGlmIChjb250YWluZXJOYW1lKSB7XG4gICAgICAgIGN1c3RvbUNvbnRleHQubmFtZSA9IGNvbnRhaW5lck5hbWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb250YWluZXJJZCkge1xuICAgICAgICBjdXN0b21Db250ZXh0LmlkID0gY29udGFpbmVySWQ7XG4gICAgICB9XG5cbiAgICAgIHNwYW4uYWRkQ29udGV4dCh7XG4gICAgICAgIGN1c3RvbTogY3VzdG9tQ29udGV4dFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3Bhbi5lbmQoZW5kKTtcbiAgICBzcGFucy5wdXNoKHNwYW4pO1xuICB9XG5cbiAgcmV0dXJuIHNwYW5zO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZpcnN0SW5wdXREZWxheVNwYW4oZmlkRW50cmllcykge1xuICB2YXIgZmlyc3RJbnB1dCA9IGZpZEVudHJpZXNbMF07XG5cbiAgaWYgKGZpcnN0SW5wdXQpIHtcbiAgICB2YXIgc3RhcnRUaW1lID0gZmlyc3RJbnB1dC5zdGFydFRpbWUsXG4gICAgICAgIHByb2Nlc3NpbmdTdGFydCA9IGZpcnN0SW5wdXQucHJvY2Vzc2luZ1N0YXJ0O1xuICAgIHZhciBzcGFuID0gbmV3IFNwYW4oJ0ZpcnN0IElucHV0IERlbGF5JywgRklSU1RfSU5QVVQsIHtcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lXG4gICAgfSk7XG4gICAgc3Bhbi5lbmQocHJvY2Vzc2luZ1N0YXJ0KTtcbiAgICByZXR1cm4gc3BhbjtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRvdGFsQmxvY2tpbmdUaW1lU3Bhbih0YnRPYmplY3QpIHtcbiAgdmFyIHN0YXJ0ID0gdGJ0T2JqZWN0LnN0YXJ0LFxuICAgICAgZHVyYXRpb24gPSB0YnRPYmplY3QuZHVyYXRpb247XG4gIHZhciB0YnRTcGFuID0gbmV3IFNwYW4oJ1RvdGFsIEJsb2NraW5nIFRpbWUnLCBMT05HX1RBU0ssIHtcbiAgICBzdGFydFRpbWU6IHN0YXJ0XG4gIH0pO1xuICB0YnRTcGFuLmVuZChzdGFydCArIGR1cmF0aW9uKTtcbiAgcmV0dXJuIHRidFNwYW47XG59XG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlVG90YWxCbG9ja2luZ1RpbWUobG9uZ3Rhc2tFbnRyaWVzKSB7XG4gIGxvbmd0YXNrRW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIHZhciBuYW1lID0gZW50cnkubmFtZSxcbiAgICAgICAgc3RhcnRUaW1lID0gZW50cnkuc3RhcnRUaW1lLFxuICAgICAgICBkdXJhdGlvbiA9IGVudHJ5LmR1cmF0aW9uO1xuXG4gICAgaWYgKHN0YXJ0VGltZSA8IG1ldHJpY3MuZmNwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgIT09ICdzZWxmJyAmJiBuYW1lLmluZGV4T2YoJ3NhbWUtb3JpZ2luJykgPT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWV0cmljcy50YnQuc3RhcnQgPSBNYXRoLm1pbihtZXRyaWNzLnRidC5zdGFydCwgc3RhcnRUaW1lKTtcbiAgICB2YXIgYmxvY2tpbmdUaW1lID0gZHVyYXRpb24gLSBMT05HX1RBU0tfVEhSRVNIT0xEO1xuXG4gICAgaWYgKGJsb2NraW5nVGltZSA+IDApIHtcbiAgICAgIG1ldHJpY3MudGJ0LmR1cmF0aW9uICs9IGJsb2NraW5nVGltZTtcbiAgICB9XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUN1bXVsYXRpdmVMYXlvdXRTaGlmdChjbHNFbnRyaWVzKSB7XG4gIGNsc0VudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICBpZiAoIWVudHJ5LmhhZFJlY2VudElucHV0ICYmIGVudHJ5LnZhbHVlKSB7XG4gICAgICB2YXIgc2hvdWxkQ3JlYXRlTmV3U2Vzc2lvbiA9IGVudHJ5LnN0YXJ0VGltZSAtIG1ldHJpY3MuY2xzLmZpcnN0RW50cnlUaW1lID4gNTAwMCB8fCBlbnRyeS5zdGFydFRpbWUgLSBtZXRyaWNzLmNscy5wcmV2RW50cnlUaW1lID4gMTAwMDtcblxuICAgICAgaWYgKHNob3VsZENyZWF0ZU5ld1Nlc3Npb24pIHtcbiAgICAgICAgbWV0cmljcy5jbHMuZmlyc3RFbnRyeVRpbWUgPSBlbnRyeS5zdGFydFRpbWU7XG4gICAgICAgIG1ldHJpY3MuY2xzLmN1cnJlbnRTZXNzaW9uU2NvcmUgPSAwO1xuICAgICAgfVxuXG4gICAgICBtZXRyaWNzLmNscy5wcmV2RW50cnlUaW1lID0gZW50cnkuc3RhcnRUaW1lO1xuICAgICAgbWV0cmljcy5jbHMuY3VycmVudFNlc3Npb25TY29yZSArPSBlbnRyeS52YWx1ZTtcbiAgICAgIG1ldHJpY3MuY2xzLnNjb3JlID0gTWF0aC5tYXgobWV0cmljcy5jbHMuc2NvcmUsIG1ldHJpY3MuY2xzLmN1cnJlbnRTZXNzaW9uU2NvcmUpO1xuICAgIH1cbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZU9ic2VydmVyRW50cmllcyhsaXN0LCBfcmVmKSB7XG4gIHZhciBpc0hhcmROYXZpZ2F0aW9uID0gX3JlZi5pc0hhcmROYXZpZ2F0aW9uLFxuICAgICAgdHJTdGFydCA9IF9yZWYudHJTdGFydDtcbiAgdmFyIGxvbmd0YXNrRW50cmllcyA9IGxpc3QuZ2V0RW50cmllc0J5VHlwZShMT05HX1RBU0spLmZpbHRlcihmdW5jdGlvbiAoZW50cnkpIHtcbiAgICByZXR1cm4gZW50cnkuc3RhcnRUaW1lID49IHRyU3RhcnQ7XG4gIH0pO1xuICB2YXIgbG9uZ1Rhc2tTcGFucyA9IGNyZWF0ZUxvbmdUYXNrU3BhbnMobG9uZ3Rhc2tFbnRyaWVzLCBtZXRyaWNzLmxvbmd0YXNrKTtcbiAgdmFyIHJlc3VsdCA9IHtcbiAgICBzcGFuczogbG9uZ1Rhc2tTcGFucyxcbiAgICBtYXJrczoge31cbiAgfTtcblxuICBpZiAoIWlzSGFyZE5hdmlnYXRpb24pIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGxjcEVudHJpZXMgPSBsaXN0LmdldEVudHJpZXNCeVR5cGUoTEFSR0VTVF9DT05URU5URlVMX1BBSU5UKTtcbiAgdmFyIGxhc3RMY3BFbnRyeSA9IGxjcEVudHJpZXNbbGNwRW50cmllcy5sZW5ndGggLSAxXTtcblxuICBpZiAobGFzdExjcEVudHJ5KSB7XG4gICAgdmFyIGxjcCA9IHBhcnNlSW50KGxhc3RMY3BFbnRyeS5zdGFydFRpbWUpO1xuICAgIG1ldHJpY3MubGNwID0gbGNwO1xuICAgIHJlc3VsdC5tYXJrcy5sYXJnZXN0Q29udGVudGZ1bFBhaW50ID0gbGNwO1xuICB9XG5cbiAgdmFyIHRpbWluZyA9IFBFUkYudGltaW5nO1xuICB2YXIgdW5sb2FkRGlmZiA9IHRpbWluZy5mZXRjaFN0YXJ0IC0gdGltaW5nLm5hdmlnYXRpb25TdGFydDtcblxuICBpZiAoaXNSZWRpcmVjdEluZm9BdmFpbGFibGUodGltaW5nKSkge1xuICAgIHVubG9hZERpZmYgPSAwO1xuICB9XG5cbiAgdmFyIGZjcEVudHJ5ID0gbGlzdC5nZXRFbnRyaWVzQnlOYW1lKEZJUlNUX0NPTlRFTlRGVUxfUEFJTlQpWzBdO1xuXG4gIGlmIChmY3BFbnRyeSkge1xuICAgIHZhciBmY3AgPSBwYXJzZUludCh1bmxvYWREaWZmID49IDAgPyBmY3BFbnRyeS5zdGFydFRpbWUgLSB1bmxvYWREaWZmIDogZmNwRW50cnkuc3RhcnRUaW1lKTtcbiAgICBtZXRyaWNzLmZjcCA9IGZjcDtcbiAgICByZXN1bHQubWFya3MuZmlyc3RDb250ZW50ZnVsUGFpbnQgPSBmY3A7XG4gIH1cblxuICB2YXIgZmlkRW50cmllcyA9IGxpc3QuZ2V0RW50cmllc0J5VHlwZShGSVJTVF9JTlBVVCk7XG4gIHZhciBmaWRTcGFuID0gY3JlYXRlRmlyc3RJbnB1dERlbGF5U3BhbihmaWRFbnRyaWVzKTtcblxuICBpZiAoZmlkU3Bhbikge1xuICAgIG1ldHJpY3MuZmlkID0gZmlkU3Bhbi5kdXJhdGlvbigpO1xuICAgIHJlc3VsdC5zcGFucy5wdXNoKGZpZFNwYW4pO1xuICB9XG5cbiAgY2FsY3VsYXRlVG90YWxCbG9ja2luZ1RpbWUobG9uZ3Rhc2tFbnRyaWVzKTtcbiAgdmFyIGNsc0VudHJpZXMgPSBsaXN0LmdldEVudHJpZXNCeVR5cGUoTEFZT1VUX1NISUZUKTtcbiAgY2FsY3VsYXRlQ3VtdWxhdGl2ZUxheW91dFNoaWZ0KGNsc0VudHJpZXMpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IHZhciBQZXJmRW50cnlSZWNvcmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGVyZkVudHJ5UmVjb3JkZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLnBvID0ge1xuICAgICAgb2JzZXJ2ZTogbm9vcCxcbiAgICAgIGRpc2Nvbm5lY3Q6IG5vb3BcbiAgICB9O1xuXG4gICAgaWYgKHdpbmRvdy5QZXJmb3JtYW5jZU9ic2VydmVyKSB7XG4gICAgICB0aGlzLnBvID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIoY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBQZXJmRW50cnlSZWNvcmRlci5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQodHlwZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGJ1ZmZlcmVkOiB0cnVlXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzUGVyZlR5cGVTdXBwb3J0ZWQodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBvLm9ic2VydmUoX2V4dGVuZHMoe1xuICAgICAgICB0eXBlOiB0eXBlXG4gICAgICB9LCBvcHRpb25zKSk7XG4gICAgfSBjYXRjaCAoXykge31cbiAgfTtcblxuICBfcHJvdG8uc3RvcCA9IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgdGhpcy5wby5kaXNjb25uZWN0KCk7XG4gIH07XG5cbiAgcmV0dXJuIFBlcmZFbnRyeVJlY29yZGVyO1xufSgpOyIsImltcG9ydCB7IFBFUkYsIGlzUGVyZlRpbWVsaW5lU3VwcG9ydGVkLCBpc1JlZGlyZWN0SW5mb0F2YWlsYWJsZSB9IGZyb20gJy4uLy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBQQUdFX0xPQUQsIFJFU09VUkNFLCBNRUFTVVJFIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gJy4uLy4uL3N0YXRlJztcbmltcG9ydCB7IGNyZWF0ZU5hdmlnYXRpb25UaW1pbmdTcGFucyB9IGZyb20gJy4vbmF2aWdhdGlvbi10aW1pbmcnO1xuaW1wb3J0IHsgY3JlYXRlVXNlclRpbWluZ1NwYW5zIH0gZnJvbSAnLi91c2VyLXRpbWluZyc7XG5pbXBvcnQgeyBjcmVhdGVSZXNvdXJjZVRpbWluZ1NwYW5zIH0gZnJvbSAnLi9yZXNvdXJjZS10aW1pbmcnO1xuaW1wb3J0IHsgZ2V0UGFnZUxvYWRNYXJrcyB9IGZyb20gJy4vbWFya3MnO1xuXG5mdW5jdGlvbiBjYXB0dXJlTmF2aWdhdGlvbih0cmFuc2FjdGlvbikge1xuICBpZiAoIXRyYW5zYWN0aW9uLmNhcHR1cmVUaW1pbmdzKSB7XG4gICAgaWYgKHRyYW5zYWN0aW9uLnR5cGUgPT09IFBBR0VfTE9BRCkge1xuICAgICAgdHJhbnNhY3Rpb24uX3N0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdHJFbmQgPSB0cmFuc2FjdGlvbi5fZW5kO1xuXG4gIGlmICh0cmFuc2FjdGlvbi50eXBlID09PSBQQUdFX0xPQUQpIHtcbiAgICBpZiAodHJhbnNhY3Rpb24ubWFya3MgJiYgdHJhbnNhY3Rpb24ubWFya3MuY3VzdG9tKSB7XG4gICAgICB2YXIgY3VzdG9tTWFya3MgPSB0cmFuc2FjdGlvbi5tYXJrcy5jdXN0b207XG4gICAgICBPYmplY3Qua2V5cyhjdXN0b21NYXJrcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGN1c3RvbU1hcmtzW2tleV0gKz0gdHJhbnNhY3Rpb24uX3N0YXJ0O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHRyU3RhcnQgPSAwO1xuICAgIHRyYW5zYWN0aW9uLl9zdGFydCA9IHRyU3RhcnQ7XG4gICAgdmFyIHRpbWluZ3MgPSBQRVJGLnRpbWluZztcbiAgICB2YXIgYmFzZVRpbWUgPSBpc1JlZGlyZWN0SW5mb0F2YWlsYWJsZSh0aW1pbmdzKSA/IHRpbWluZ3MucmVkaXJlY3RTdGFydCA6IHRpbWluZ3MuZmV0Y2hTdGFydDtcbiAgICBjcmVhdGVOYXZpZ2F0aW9uVGltaW5nU3BhbnModGltaW5ncywgYmFzZVRpbWUsIHRyU3RhcnQsIHRyRW5kKS5mb3JFYWNoKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICBzcGFuLnRyYWNlSWQgPSB0cmFuc2FjdGlvbi50cmFjZUlkO1xuICAgICAgc3Bhbi5zYW1wbGVkID0gdHJhbnNhY3Rpb24uc2FtcGxlZDtcblxuICAgICAgaWYgKHNwYW4ucGFnZVJlc3BvbnNlICYmIHRyYW5zYWN0aW9uLm9wdGlvbnMucGFnZUxvYWRTcGFuSWQpIHtcbiAgICAgICAgc3Bhbi5pZCA9IHRyYW5zYWN0aW9uLm9wdGlvbnMucGFnZUxvYWRTcGFuSWQ7XG4gICAgICB9XG5cbiAgICAgIHRyYW5zYWN0aW9uLnNwYW5zLnB1c2goc3Bhbik7XG4gICAgfSk7XG4gICAgdHJhbnNhY3Rpb24uYWRkTWFya3MoZ2V0UGFnZUxvYWRNYXJrcyh0aW1pbmdzKSk7XG4gIH1cblxuICBpZiAoaXNQZXJmVGltZWxpbmVTdXBwb3J0ZWQoKSkge1xuICAgIHZhciBfdHJTdGFydCA9IHRyYW5zYWN0aW9uLl9zdGFydDtcbiAgICB2YXIgcmVzb3VyY2VFbnRyaWVzID0gUEVSRi5nZXRFbnRyaWVzQnlUeXBlKFJFU09VUkNFKTtcbiAgICBjcmVhdGVSZXNvdXJjZVRpbWluZ1NwYW5zKHJlc291cmNlRW50cmllcywgc3RhdGUuYm9vdHN0cmFwVGltZSwgX3RyU3RhcnQsIHRyRW5kKS5mb3JFYWNoKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICByZXR1cm4gdHJhbnNhY3Rpb24uc3BhbnMucHVzaChzcGFuKTtcbiAgICB9KTtcbiAgICB2YXIgdXNlckVudHJpZXMgPSBQRVJGLmdldEVudHJpZXNCeVR5cGUoTUVBU1VSRSk7XG4gICAgY3JlYXRlVXNlclRpbWluZ1NwYW5zKHVzZXJFbnRyaWVzLCBfdHJTdGFydCwgdHJFbmQpLmZvckVhY2goZnVuY3Rpb24gKHNwYW4pIHtcbiAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5zcGFucy5wdXNoKHNwYW4pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IGNhcHR1cmVOYXZpZ2F0aW9uLCBjcmVhdGVOYXZpZ2F0aW9uVGltaW5nU3BhbnMsIGNyZWF0ZVJlc291cmNlVGltaW5nU3BhbnMsIGNyZWF0ZVVzZXJUaW1pbmdTcGFucywgZ2V0UGFnZUxvYWRNYXJrcyB9OyIsImltcG9ydCB7IGlzUmVkaXJlY3RJbmZvQXZhaWxhYmxlIH0gZnJvbSAnLi4vLi4vY29tbW9uL3V0aWxzJztcbnZhciBOQVZJR0FUSU9OX1RJTUlOR19NQVJLUyA9IFsnZmV0Y2hTdGFydCcsICdkb21haW5Mb29rdXBTdGFydCcsICdkb21haW5Mb29rdXBFbmQnLCAnY29ubmVjdFN0YXJ0JywgJ2Nvbm5lY3RFbmQnLCAncmVxdWVzdFN0YXJ0JywgJ3Jlc3BvbnNlU3RhcnQnLCAncmVzcG9uc2VFbmQnLCAnZG9tTG9hZGluZycsICdkb21JbnRlcmFjdGl2ZScsICdkb21Db250ZW50TG9hZGVkRXZlbnRTdGFydCcsICdkb21Db250ZW50TG9hZGVkRXZlbnRFbmQnLCAnZG9tQ29tcGxldGUnLCAnbG9hZEV2ZW50U3RhcnQnLCAnbG9hZEV2ZW50RW5kJ107XG52YXIgQ09NUFJFU1NFRF9OQVZfVElNSU5HX01BUktTID0gWydmcycsICdscycsICdsZScsICdjcycsICdjZScsICdxcycsICdycycsICdyZScsICdkbCcsICdkaScsICdkcycsICdkZScsICdkYycsICdlcycsICdlZSddO1xuXG5mdW5jdGlvbiBnZXRQYWdlTG9hZE1hcmtzKHRpbWluZykge1xuICB2YXIgbWFya3MgPSBnZXROYXZpZ2F0aW9uVGltaW5nTWFya3ModGltaW5nKTtcblxuICBpZiAobWFya3MgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYXZpZ2F0aW9uVGltaW5nOiBtYXJrcyxcbiAgICBhZ2VudDoge1xuICAgICAgdGltZVRvRmlyc3RCeXRlOiBtYXJrcy5yZXNwb25zZVN0YXJ0LFxuICAgICAgZG9tSW50ZXJhY3RpdmU6IG1hcmtzLmRvbUludGVyYWN0aXZlLFxuICAgICAgZG9tQ29tcGxldGU6IG1hcmtzLmRvbUNvbXBsZXRlXG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uVGltaW5nTWFya3ModGltaW5nKSB7XG4gIHZhciByZWRpcmVjdFN0YXJ0ID0gdGltaW5nLnJlZGlyZWN0U3RhcnQsXG4gICAgICBmZXRjaFN0YXJ0ID0gdGltaW5nLmZldGNoU3RhcnQsXG4gICAgICBuYXZpZ2F0aW9uU3RhcnQgPSB0aW1pbmcubmF2aWdhdGlvblN0YXJ0LFxuICAgICAgcmVzcG9uc2VTdGFydCA9IHRpbWluZy5yZXNwb25zZVN0YXJ0LFxuICAgICAgcmVzcG9uc2VFbmQgPSB0aW1pbmcucmVzcG9uc2VFbmQ7XG5cbiAgaWYgKGZldGNoU3RhcnQgPj0gbmF2aWdhdGlvblN0YXJ0ICYmIHJlc3BvbnNlU3RhcnQgPj0gZmV0Y2hTdGFydCAmJiByZXNwb25zZUVuZCA+PSByZXNwb25zZVN0YXJ0KSB7XG4gICAgdmFyIG1hcmtzID0ge307XG4gICAgTkFWSUdBVElPTl9USU1JTkdfTUFSS1MuZm9yRWFjaChmdW5jdGlvbiAodGltaW5nS2V5KSB7XG4gICAgICB2YXIgbSA9IHRpbWluZ1t0aW1pbmdLZXldO1xuXG4gICAgICBpZiAobSAmJiBtID49IGZldGNoU3RhcnQpIHtcbiAgICAgICAgaWYgKGlzUmVkaXJlY3RJbmZvQXZhaWxhYmxlKHRpbWluZykpIHtcbiAgICAgICAgICBtYXJrc1t0aW1pbmdLZXldID0gcGFyc2VJbnQobSAtIHJlZGlyZWN0U3RhcnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hcmtzW3RpbWluZ0tleV0gPSBwYXJzZUludChtIC0gZmV0Y2hTdGFydCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWFya3M7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IHsgZ2V0UGFnZUxvYWRNYXJrcywgTkFWSUdBVElPTl9USU1JTkdfTUFSS1MsIENPTVBSRVNTRURfTkFWX1RJTUlOR19NQVJLUyB9OyIsImltcG9ydCB7IHNob3VsZENyZWF0ZVNwYW4gfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBTcGFuIGZyb20gJy4uL3NwYW4nO1xudmFyIGV2ZW50UGFpcnMgPSBbWydyZWRpcmVjdFN0YXJ0JywgJ3JlZGlyZWN0RW5kJywgJ1JlZGlyZWN0J10sIFsnZG9tYWluTG9va3VwU3RhcnQnLCAnZG9tYWluTG9va3VwRW5kJywgJ0RvbWFpbiBsb29rdXAnXSwgWydjb25uZWN0U3RhcnQnLCAnY29ubmVjdEVuZCcsICdNYWtpbmcgYSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXInXSwgWydyZXF1ZXN0U3RhcnQnLCAncmVzcG9uc2VFbmQnLCAnUmVxdWVzdGluZyBhbmQgcmVjZWl2aW5nIHRoZSBkb2N1bWVudCddLCBbJ2RvbUxvYWRpbmcnLCAnZG9tSW50ZXJhY3RpdmUnLCAnUGFyc2luZyB0aGUgZG9jdW1lbnQsIGV4ZWN1dGluZyBzeW5jLiBzY3JpcHRzJ10sIFsnZG9tQ29udGVudExvYWRlZEV2ZW50U3RhcnQnLCAnZG9tQ29udGVudExvYWRlZEV2ZW50RW5kJywgJ0ZpcmUgXCJET01Db250ZW50TG9hZGVkXCIgZXZlbnQnXSwgWydsb2FkRXZlbnRTdGFydCcsICdsb2FkRXZlbnRFbmQnLCAnRmlyZSBcImxvYWRcIiBldmVudCddXTtcblxuZnVuY3Rpb24gY3JlYXRlTmF2aWdhdGlvblRpbWluZ1NwYW5zKHRpbWluZ3MsIGJhc2VUaW1lLCB0clN0YXJ0LCB0ckVuZCkge1xuICB2YXIgc3BhbnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50UGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc3RhcnQgPSB0aW1pbmdzW2V2ZW50UGFpcnNbaV1bMF1dO1xuICAgIHZhciBlbmQgPSB0aW1pbmdzW2V2ZW50UGFpcnNbaV1bMV1dO1xuXG4gICAgaWYgKCFzaG91bGRDcmVhdGVTcGFuKHN0YXJ0LCBlbmQsIHRyU3RhcnQsIHRyRW5kLCBiYXNlVGltZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBzcGFuID0gbmV3IFNwYW4oZXZlbnRQYWlyc1tpXVsyXSwgJ2hhcmQtbmF2aWdhdGlvbi5icm93c2VyLXRpbWluZycpO1xuICAgIHZhciBkYXRhID0gbnVsbDtcblxuICAgIGlmIChldmVudFBhaXJzW2ldWzBdID09PSAncmVxdWVzdFN0YXJ0Jykge1xuICAgICAgc3Bhbi5wYWdlUmVzcG9uc2UgPSB0cnVlO1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgdXJsOiBsb2NhdGlvbi5vcmlnaW5cbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3Bhbi5fc3RhcnQgPSBzdGFydCAtIGJhc2VUaW1lO1xuICAgIHNwYW4uZW5kKGVuZCAtIGJhc2VUaW1lLCBkYXRhKTtcbiAgICBzcGFucy5wdXNoKHNwYW4pO1xuICB9XG5cbiAgcmV0dXJuIHNwYW5zO1xufVxuXG5leHBvcnQgeyBjcmVhdGVOYXZpZ2F0aW9uVGltaW5nU3BhbnMgfTsiLCJpbXBvcnQgeyBzdHJpcFF1ZXJ5U3RyaW5nRnJvbVVybCB9IGZyb20gJy4uLy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBzaG91bGRDcmVhdGVTcGFuIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBSRVNPVVJDRV9JTklUSUFUT1JfVFlQRVMgfSBmcm9tICcuLi8uLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCBTcGFuIGZyb20gJy4uL3NwYW4nO1xuXG5mdW5jdGlvbiBjcmVhdGVSZXNvdXJjZVRpbWluZ1NwYW4ocmVzb3VyY2VUaW1pbmdFbnRyeSkge1xuICB2YXIgbmFtZSA9IHJlc291cmNlVGltaW5nRW50cnkubmFtZSxcbiAgICAgIGluaXRpYXRvclR5cGUgPSByZXNvdXJjZVRpbWluZ0VudHJ5LmluaXRpYXRvclR5cGUsXG4gICAgICBzdGFydFRpbWUgPSByZXNvdXJjZVRpbWluZ0VudHJ5LnN0YXJ0VGltZSxcbiAgICAgIHJlc3BvbnNlRW5kID0gcmVzb3VyY2VUaW1pbmdFbnRyeS5yZXNwb25zZUVuZDtcbiAgdmFyIGtpbmQgPSAncmVzb3VyY2UnO1xuXG4gIGlmIChpbml0aWF0b3JUeXBlKSB7XG4gICAga2luZCArPSAnLicgKyBpbml0aWF0b3JUeXBlO1xuICB9XG5cbiAgdmFyIHNwYW5OYW1lID0gc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwobmFtZSk7XG4gIHZhciBzcGFuID0gbmV3IFNwYW4oc3Bhbk5hbWUsIGtpbmQpO1xuICBzcGFuLl9zdGFydCA9IHN0YXJ0VGltZTtcbiAgc3Bhbi5lbmQocmVzcG9uc2VFbmQsIHtcbiAgICB1cmw6IG5hbWUsXG4gICAgZW50cnk6IHJlc291cmNlVGltaW5nRW50cnlcbiAgfSk7XG4gIHJldHVybiBzcGFuO1xufVxuXG5mdW5jdGlvbiBpc0NhcHR1cmVkQnlQYXRjaGluZyhyZXNvdXJjZVN0YXJ0VGltZSwgcmVxdWVzdFBhdGNoVGltZSkge1xuICByZXR1cm4gcmVxdWVzdFBhdGNoVGltZSAhPSBudWxsICYmIHJlc291cmNlU3RhcnRUaW1lID4gcmVxdWVzdFBhdGNoVGltZTtcbn1cblxuZnVuY3Rpb24gaXNJbnRha2VBUElFbmRwb2ludCh1cmwpIHtcbiAgcmV0dXJuIC9pbnRha2VcXC92XFxkK1xcL3J1bVxcL2V2ZW50cy8udGVzdCh1cmwpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSZXNvdXJjZVRpbWluZ1NwYW5zKGVudHJpZXMsIHJlcXVlc3RQYXRjaFRpbWUsIHRyU3RhcnQsIHRyRW5kKSB7XG4gIHZhciBzcGFucyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBfZW50cmllcyRpID0gZW50cmllc1tpXSxcbiAgICAgICAgaW5pdGlhdG9yVHlwZSA9IF9lbnRyaWVzJGkuaW5pdGlhdG9yVHlwZSxcbiAgICAgICAgbmFtZSA9IF9lbnRyaWVzJGkubmFtZSxcbiAgICAgICAgc3RhcnRUaW1lID0gX2VudHJpZXMkaS5zdGFydFRpbWUsXG4gICAgICAgIHJlc3BvbnNlRW5kID0gX2VudHJpZXMkaS5yZXNwb25zZUVuZDtcblxuICAgIGlmIChSRVNPVVJDRV9JTklUSUFUT1JfVFlQRVMuaW5kZXhPZihpbml0aWF0b3JUeXBlKSA9PT0gLTEgfHwgbmFtZSA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoKGluaXRpYXRvclR5cGUgPT09ICd4bWxodHRwcmVxdWVzdCcgfHwgaW5pdGlhdG9yVHlwZSA9PT0gJ2ZldGNoJykgJiYgKGlzSW50YWtlQVBJRW5kcG9pbnQobmFtZSkgfHwgaXNDYXB0dXJlZEJ5UGF0Y2hpbmcoc3RhcnRUaW1lLCByZXF1ZXN0UGF0Y2hUaW1lKSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRDcmVhdGVTcGFuKHN0YXJ0VGltZSwgcmVzcG9uc2VFbmQsIHRyU3RhcnQsIHRyRW5kKSkge1xuICAgICAgc3BhbnMucHVzaChjcmVhdGVSZXNvdXJjZVRpbWluZ1NwYW4oZW50cmllc1tpXSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzcGFucztcbn1cblxuZXhwb3J0IHsgY3JlYXRlUmVzb3VyY2VUaW1pbmdTcGFucyB9OyIsImltcG9ydCB7IFVTRVJfVElNSU5HX1RIUkVTSE9MRCB9IGZyb20gJy4uLy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgc2hvdWxkQ3JlYXRlU3BhbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IFNwYW4gZnJvbSAnLi4vc3Bhbic7XG5cbmZ1bmN0aW9uIGNyZWF0ZVVzZXJUaW1pbmdTcGFucyhlbnRyaWVzLCB0clN0YXJ0LCB0ckVuZCkge1xuICB2YXIgdXNlclRpbWluZ1NwYW5zID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIF9lbnRyaWVzJGkgPSBlbnRyaWVzW2ldLFxuICAgICAgICBuYW1lID0gX2VudHJpZXMkaS5uYW1lLFxuICAgICAgICBzdGFydFRpbWUgPSBfZW50cmllcyRpLnN0YXJ0VGltZSxcbiAgICAgICAgZHVyYXRpb24gPSBfZW50cmllcyRpLmR1cmF0aW9uO1xuICAgIHZhciBlbmQgPSBzdGFydFRpbWUgKyBkdXJhdGlvbjtcblxuICAgIGlmIChkdXJhdGlvbiA8PSBVU0VSX1RJTUlOR19USFJFU0hPTEQgfHwgIXNob3VsZENyZWF0ZVNwYW4oc3RhcnRUaW1lLCBlbmQsIHRyU3RhcnQsIHRyRW5kKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIGtpbmQgPSAnYXBwJztcbiAgICB2YXIgc3BhbiA9IG5ldyBTcGFuKG5hbWUsIGtpbmQpO1xuICAgIHNwYW4uX3N0YXJ0ID0gc3RhcnRUaW1lO1xuICAgIHNwYW4uZW5kKGVuZCk7XG4gICAgdXNlclRpbWluZ1NwYW5zLnB1c2goc3Bhbik7XG4gIH1cblxuICByZXR1cm4gdXNlclRpbWluZ1NwYW5zO1xufVxuXG5leHBvcnQgeyBjcmVhdGVVc2VyVGltaW5nU3BhbnMgfTsiLCJpbXBvcnQgeyBNQVhfU1BBTl9EVVJBVElPTiB9IGZyb20gJy4uLy4uL2NvbW1vbi9jb25zdGFudHMnO1xuXG5mdW5jdGlvbiBzaG91bGRDcmVhdGVTcGFuKHN0YXJ0LCBlbmQsIHRyU3RhcnQsIHRyRW5kLCBiYXNlVGltZSkge1xuICBpZiAoYmFzZVRpbWUgPT09IHZvaWQgMCkge1xuICAgIGJhc2VUaW1lID0gMDtcbiAgfVxuXG4gIHJldHVybiB0eXBlb2Ygc3RhcnQgPT09ICdudW1iZXInICYmIHR5cGVvZiBlbmQgPT09ICdudW1iZXInICYmIHN0YXJ0ID49IGJhc2VUaW1lICYmIGVuZCA+IHN0YXJ0ICYmIHN0YXJ0IC0gYmFzZVRpbWUgPj0gdHJTdGFydCAmJiBlbmQgLSBiYXNlVGltZSA8PSB0ckVuZCAmJiBlbmQgLSBzdGFydCA8IE1BWF9TUEFOX0RVUkFUSU9OICYmIHN0YXJ0IC0gYmFzZVRpbWUgPCBNQVhfU1BBTl9EVVJBVElPTiAmJiBlbmQgLSBiYXNlVGltZSA8IE1BWF9TUEFOX0RVUkFUSU9OO1xufVxuXG5leHBvcnQgeyBzaG91bGRDcmVhdGVTcGFuIH07IiwiaW1wb3J0IHsgY2hlY2tTYW1lT3JpZ2luLCBpc0R0SGVhZGVyVmFsaWQsIHBhcnNlRHRIZWFkZXJWYWx1ZSwgZ2V0RHRIZWFkZXJWYWx1ZSwgZ2V0VFNIZWFkZXJWYWx1ZSwgc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwsIHNldFJlcXVlc3RIZWFkZXIgfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSAnLi4vY29tbW9uL3VybCc7XG5pbXBvcnQgeyBwYXRjaEV2ZW50SGFuZGxlciB9IGZyb20gJy4uL2NvbW1vbi9wYXRjaGluZyc7XG5pbXBvcnQgeyBnbG9iYWxTdGF0ZSB9IGZyb20gJy4uL2NvbW1vbi9wYXRjaGluZy9wYXRjaC11dGlscyc7XG5pbXBvcnQgeyBTQ0hFRFVMRSwgSU5WT0tFLCBUUkFOU0FDVElPTl9FTkQsIEFGVEVSX0VWRU5ULCBGRVRDSCwgSElTVE9SWSwgWE1MSFRUUFJFUVVFU1QsIEhUVFBfUkVRVUVTVF9UWVBFLCBPVVRDT01FX0ZBSUxVUkUsIE9VVENPTUVfU1VDQ0VTUywgT1VUQ09NRV9VTktOT1dOLCBRVUVVRV9BRERfVFJBTlNBQ1RJT04sIFRSQU5TQUNUSU9OX0lHTk9SRSB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgdHJ1bmNhdGVNb2RlbCwgU1BBTl9NT0RFTCwgVFJBTlNBQ1RJT05fTU9ERUwgfSBmcm9tICcuLi9jb21tb24vdHJ1bmNhdGUnO1xuaW1wb3J0IHsgX19ERVZfXyB9IGZyb20gJy4uL3N0YXRlJztcbnZhciBTSU1JTEFSX1NQQU5fVE9fVFJBTlNBQ1RJT05fUkFUSU8gPSAwLjA1O1xudmFyIFRSQU5TQUNUSU9OX0RVUkFUSU9OX1RIUkVTSE9MRCA9IDYwMDAwO1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwU21hbGxDb250aW51b3VzbHlTaW1pbGFyU3BhbnMob3JpZ2luYWxTcGFucywgdHJhbnNEdXJhdGlvbiwgdGhyZXNob2xkKSB7XG4gIG9yaWdpbmFsU3BhbnMuc29ydChmdW5jdGlvbiAoc3BhbkEsIHNwYW5CKSB7XG4gICAgcmV0dXJuIHNwYW5BLl9zdGFydCAtIHNwYW5CLl9zdGFydDtcbiAgfSk7XG4gIHZhciBzcGFucyA9IFtdO1xuICB2YXIgbGFzdENvdW50ID0gMTtcbiAgb3JpZ2luYWxTcGFucy5mb3JFYWNoKGZ1bmN0aW9uIChzcGFuLCBpbmRleCkge1xuICAgIGlmIChzcGFucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHNwYW5zLnB1c2goc3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsYXN0U3BhbiA9IHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdO1xuICAgICAgdmFyIGlzQ29udGludW91c2x5U2ltaWxhciA9IGxhc3RTcGFuLnR5cGUgPT09IHNwYW4udHlwZSAmJiBsYXN0U3Bhbi5zdWJ0eXBlID09PSBzcGFuLnN1YnR5cGUgJiYgbGFzdFNwYW4uYWN0aW9uID09PSBzcGFuLmFjdGlvbiAmJiBsYXN0U3Bhbi5uYW1lID09PSBzcGFuLm5hbWUgJiYgc3Bhbi5kdXJhdGlvbigpIC8gdHJhbnNEdXJhdGlvbiA8IHRocmVzaG9sZCAmJiAoc3Bhbi5fc3RhcnQgLSBsYXN0U3Bhbi5fZW5kKSAvIHRyYW5zRHVyYXRpb24gPCB0aHJlc2hvbGQ7XG4gICAgICB2YXIgaXNMYXN0U3BhbiA9IG9yaWdpbmFsU3BhbnMubGVuZ3RoID09PSBpbmRleCArIDE7XG5cbiAgICAgIGlmIChpc0NvbnRpbnVvdXNseVNpbWlsYXIpIHtcbiAgICAgICAgbGFzdENvdW50Kys7XG4gICAgICAgIGxhc3RTcGFuLl9lbmQgPSBzcGFuLl9lbmQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXN0Q291bnQgPiAxICYmICghaXNDb250aW51b3VzbHlTaW1pbGFyIHx8IGlzTGFzdFNwYW4pKSB7XG4gICAgICAgIGxhc3RTcGFuLm5hbWUgPSBsYXN0Q291bnQgKyAneCAnICsgbGFzdFNwYW4ubmFtZTtcbiAgICAgICAgbGFzdENvdW50ID0gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0NvbnRpbnVvdXNseVNpbWlsYXIpIHtcbiAgICAgICAgc3BhbnMucHVzaChzcGFuKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3BhbnM7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRqdXN0VHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pIHtcbiAgaWYgKHRyYW5zYWN0aW9uLnNhbXBsZWQpIHtcbiAgICB2YXIgZmlsdGVyZFNwYW5zID0gdHJhbnNhY3Rpb24uc3BhbnMuZmlsdGVyKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICByZXR1cm4gc3Bhbi5kdXJhdGlvbigpID4gMCAmJiBzcGFuLl9zdGFydCA+PSB0cmFuc2FjdGlvbi5fc3RhcnQgJiYgc3Bhbi5fZW5kIDw9IHRyYW5zYWN0aW9uLl9lbmQ7XG4gICAgfSk7XG5cbiAgICBpZiAodHJhbnNhY3Rpb24uaXNNYW5hZ2VkKCkpIHtcbiAgICAgIHZhciBkdXJhdGlvbiA9IHRyYW5zYWN0aW9uLmR1cmF0aW9uKCk7XG4gICAgICB2YXIgc2ltaWxhclNwYW5zID0gZ3JvdXBTbWFsbENvbnRpbnVvdXNseVNpbWlsYXJTcGFucyhmaWx0ZXJkU3BhbnMsIGR1cmF0aW9uLCBTSU1JTEFSX1NQQU5fVE9fVFJBTlNBQ1RJT05fUkFUSU8pO1xuICAgICAgdHJhbnNhY3Rpb24uc3BhbnMgPSBzaW1pbGFyU3BhbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYW5zYWN0aW9uLnNwYW5zID0gZmlsdGVyZFNwYW5zO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0cmFuc2FjdGlvbi5yZXNldEZpZWxkcygpO1xuICB9XG5cbiAgcmV0dXJuIHRyYW5zYWN0aW9uO1xufVxuXG52YXIgUGVyZm9ybWFuY2VNb25pdG9yaW5nID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQZXJmb3JtYW5jZU1vbml0b3JpbmcoYXBtU2VydmVyLCBjb25maWdTZXJ2aWNlLCBsb2dnaW5nU2VydmljZSwgdHJhbnNhY3Rpb25TZXJ2aWNlKSB7XG4gICAgdGhpcy5fYXBtU2VydmVyID0gYXBtU2VydmVyO1xuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2UgPSBjb25maWdTZXJ2aWNlO1xuICAgIHRoaXMuX2xvZ2dpblNlcnZpY2UgPSBsb2dnaW5nU2VydmljZTtcbiAgICB0aGlzLl90cmFuc2FjdGlvblNlcnZpY2UgPSB0cmFuc2FjdGlvblNlcnZpY2U7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gUGVyZm9ybWFuY2VNb25pdG9yaW5nLnByb3RvdHlwZTtcblxuICBfcHJvdG8uaW5pdCA9IGZ1bmN0aW9uIGluaXQoZmxhZ3MpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKGZsYWdzID09PSB2b2lkIDApIHtcbiAgICAgIGZsYWdzID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5fY29uZmlnU2VydmljZS5ldmVudHMub2JzZXJ2ZShUUkFOU0FDVElPTl9FTkQgKyBBRlRFUl9FVkVOVCwgZnVuY3Rpb24gKHRyKSB7XG4gICAgICB2YXIgcGF5bG9hZCA9IF90aGlzLmNyZWF0ZVRyYW5zYWN0aW9uUGF5bG9hZCh0cik7XG5cbiAgICAgIGlmIChwYXlsb2FkKSB7XG4gICAgICAgIF90aGlzLl9hcG1TZXJ2ZXIuYWRkVHJhbnNhY3Rpb24ocGF5bG9hZCk7XG5cbiAgICAgICAgX3RoaXMuX2NvbmZpZ1NlcnZpY2UuZGlzcGF0Y2hFdmVudChRVUVVRV9BRERfVFJBTlNBQ1RJT04pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGZsYWdzW0hJU1RPUlldKSB7XG4gICAgICBwYXRjaEV2ZW50SGFuZGxlci5vYnNlcnZlKEhJU1RPUlksIHRoaXMuZ2V0SGlzdG9yeVN1YigpKTtcbiAgICB9XG5cbiAgICBpZiAoZmxhZ3NbWE1MSFRUUFJFUVVFU1RdKSB7XG4gICAgICBwYXRjaEV2ZW50SGFuZGxlci5vYnNlcnZlKFhNTEhUVFBSRVFVRVNULCB0aGlzLmdldFhIUlN1YigpKTtcbiAgICB9XG5cbiAgICBpZiAoZmxhZ3NbRkVUQ0hdKSB7XG4gICAgICBwYXRjaEV2ZW50SGFuZGxlci5vYnNlcnZlKEZFVENILCB0aGlzLmdldEZldGNoU3ViKCkpO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uZ2V0SGlzdG9yeVN1YiA9IGZ1bmN0aW9uIGdldEhpc3RvcnlTdWIoKSB7XG4gICAgdmFyIHRyYW5zYWN0aW9uU2VydmljZSA9IHRoaXMuX3RyYW5zYWN0aW9uU2VydmljZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50LCB0YXNrKSB7XG4gICAgICBpZiAodGFzay5zb3VyY2UgPT09IEhJU1RPUlkgJiYgZXZlbnQgPT09IElOVk9LRSkge1xuICAgICAgICB0cmFuc2FjdGlvblNlcnZpY2Uuc3RhcnRUcmFuc2FjdGlvbih0YXNrLmRhdGEudGl0bGUsICdyb3V0ZS1jaGFuZ2UnLCB7XG4gICAgICAgICAgbWFuYWdlZDogdHJ1ZSxcbiAgICAgICAgICBjYW5SZXVzZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIF9wcm90by5nZXRYSFJTdWIgPSBmdW5jdGlvbiBnZXRYSFJTdWIoKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50LCB0YXNrKSB7XG4gICAgICBpZiAodGFzay5zb3VyY2UgPT09IFhNTEhUVFBSRVFVRVNUICYmICFnbG9iYWxTdGF0ZS5mZXRjaEluUHJvZ3Jlc3MpIHtcbiAgICAgICAgX3RoaXMyLnByb2Nlc3NBUElDYWxscyhldmVudCwgdGFzayk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBfcHJvdG8uZ2V0RmV0Y2hTdWIgPSBmdW5jdGlvbiBnZXRGZXRjaFN1YigpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQsIHRhc2spIHtcbiAgICAgIGlmICh0YXNrLnNvdXJjZSA9PT0gRkVUQ0gpIHtcbiAgICAgICAgX3RoaXMzLnByb2Nlc3NBUElDYWxscyhldmVudCwgdGFzayk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBfcHJvdG8ucHJvY2Vzc0FQSUNhbGxzID0gZnVuY3Rpb24gcHJvY2Vzc0FQSUNhbGxzKGV2ZW50LCB0YXNrKSB7XG4gICAgdmFyIGNvbmZpZ1NlcnZpY2UgPSB0aGlzLl9jb25maWdTZXJ2aWNlO1xuICAgIHZhciB0cmFuc2FjdGlvblNlcnZpY2UgPSB0aGlzLl90cmFuc2FjdGlvblNlcnZpY2U7XG5cbiAgICBpZiAodGFzay5kYXRhICYmIHRhc2suZGF0YS51cmwpIHtcbiAgICAgIHZhciBlbmRwb2ludHMgPSB0aGlzLl9hcG1TZXJ2ZXIuZ2V0RW5kcG9pbnRzKCk7XG5cbiAgICAgIHZhciBpc093bkVuZHBvaW50ID0gT2JqZWN0LmtleXMoZW5kcG9pbnRzKS5zb21lKGZ1bmN0aW9uIChlbmRwb2ludCkge1xuICAgICAgICByZXR1cm4gdGFzay5kYXRhLnVybC5pbmRleE9mKGVuZHBvaW50c1tlbmRwb2ludF0pICE9PSAtMTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaXNPd25FbmRwb2ludCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50ID09PSBTQ0hFRFVMRSAmJiB0YXNrLmRhdGEpIHtcbiAgICAgIHZhciBkYXRhID0gdGFzay5kYXRhO1xuICAgICAgdmFyIHJlcXVlc3RVcmwgPSBuZXcgVXJsKGRhdGEudXJsKTtcbiAgICAgIHZhciBzcGFuTmFtZSA9IGRhdGEubWV0aG9kICsgJyAnICsgKHJlcXVlc3RVcmwucmVsYXRpdmUgPyByZXF1ZXN0VXJsLnBhdGggOiBzdHJpcFF1ZXJ5U3RyaW5nRnJvbVVybChyZXF1ZXN0VXJsLmhyZWYpKTtcblxuICAgICAgaWYgKCF0cmFuc2FjdGlvblNlcnZpY2UuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCkpIHtcbiAgICAgICAgdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0VHJhbnNhY3Rpb24oc3Bhbk5hbWUsIEhUVFBfUkVRVUVTVF9UWVBFLCB7XG4gICAgICAgICAgbWFuYWdlZDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNwYW4gPSB0cmFuc2FjdGlvblNlcnZpY2Uuc3RhcnRTcGFuKHNwYW5OYW1lLCAnZXh0ZXJuYWwuaHR0cCcsIHtcbiAgICAgICAgYmxvY2tpbmc6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXNwYW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNEdEVuYWJsZWQgPSBjb25maWdTZXJ2aWNlLmdldCgnZGlzdHJpYnV0ZWRUcmFjaW5nJyk7XG4gICAgICB2YXIgZHRPcmlnaW5zID0gY29uZmlnU2VydmljZS5nZXQoJ2Rpc3RyaWJ1dGVkVHJhY2luZ09yaWdpbnMnKTtcbiAgICAgIHZhciBjdXJyZW50VXJsID0gbmV3IFVybCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICB2YXIgaXNTYW1lT3JpZ2luID0gY2hlY2tTYW1lT3JpZ2luKHJlcXVlc3RVcmwub3JpZ2luLCBjdXJyZW50VXJsLm9yaWdpbikgfHwgY2hlY2tTYW1lT3JpZ2luKHJlcXVlc3RVcmwub3JpZ2luLCBkdE9yaWdpbnMpO1xuICAgICAgdmFyIHRhcmdldCA9IGRhdGEudGFyZ2V0O1xuXG4gICAgICBpZiAoaXNEdEVuYWJsZWQgJiYgaXNTYW1lT3JpZ2luICYmIHRhcmdldCkge1xuICAgICAgICB0aGlzLmluamVjdER0SGVhZGVyKHNwYW4sIHRhcmdldCk7XG4gICAgICAgIHZhciBwcm9wYWdhdGVUcmFjZXN0YXRlID0gY29uZmlnU2VydmljZS5nZXQoJ3Byb3BhZ2F0ZVRyYWNlc3RhdGUnKTtcblxuICAgICAgICBpZiAocHJvcGFnYXRlVHJhY2VzdGF0ZSkge1xuICAgICAgICAgIHRoaXMuaW5qZWN0VFNIZWFkZXIoc3BhbiwgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIHRoaXMuX2xvZ2dpblNlcnZpY2UuZGVidWcoXCJDb3VsZCBub3QgaW5qZWN0IGRpc3RyaWJ1dGVkIHRyYWNpbmcgaGVhZGVyIHRvIHRoZSByZXF1ZXN0IG9yaWdpbiAoJ1wiICsgcmVxdWVzdFVybC5vcmlnaW4gKyBcIicpIGZyb20gdGhlIGN1cnJlbnQgb3JpZ2luICgnXCIgKyBjdXJyZW50VXJsLm9yaWdpbiArIFwiJylcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLnN5bmMpIHtcbiAgICAgICAgc3Bhbi5zeW5jID0gZGF0YS5zeW5jO1xuICAgICAgfVxuXG4gICAgICBkYXRhLnNwYW4gPSBzcGFuO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQgPT09IElOVk9LRSkge1xuICAgICAgdmFyIF9kYXRhID0gdGFzay5kYXRhO1xuXG4gICAgICBpZiAoX2RhdGEgJiYgX2RhdGEuc3Bhbikge1xuICAgICAgICB2YXIgX3NwYW4gPSBfZGF0YS5zcGFuLFxuICAgICAgICAgICAgcmVzcG9uc2UgPSBfZGF0YS5yZXNwb25zZSxcbiAgICAgICAgICAgIF90YXJnZXQgPSBfZGF0YS50YXJnZXQ7XG4gICAgICAgIHZhciBzdGF0dXM7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgICAgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXR1cyA9IF90YXJnZXQuc3RhdHVzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG91dGNvbWU7XG5cbiAgICAgICAgaWYgKF9kYXRhLnN0YXR1cyAhPSAnYWJvcnQnICYmICFfZGF0YS5hYm9ydGVkKSB7XG4gICAgICAgICAgaWYgKHN0YXR1cyA+PSA0MDAgfHwgc3RhdHVzID09IDApIHtcbiAgICAgICAgICAgIG91dGNvbWUgPSBPVVRDT01FX0ZBSUxVUkU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dGNvbWUgPSBPVVRDT01FX1NVQ0NFU1M7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dGNvbWUgPSBPVVRDT01FX1VOS05PV047XG4gICAgICAgIH1cblxuICAgICAgICBfc3Bhbi5vdXRjb21lID0gb3V0Y29tZTtcbiAgICAgICAgdmFyIHRyID0gdHJhbnNhY3Rpb25TZXJ2aWNlLmdldEN1cnJlbnRUcmFuc2FjdGlvbigpO1xuXG4gICAgICAgIGlmICh0ciAmJiB0ci50eXBlID09PSBIVFRQX1JFUVVFU1RfVFlQRSkge1xuICAgICAgICAgIHRyLm91dGNvbWUgPSBvdXRjb21lO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJhbnNhY3Rpb25TZXJ2aWNlLmVuZFNwYW4oX3NwYW4sIF9kYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmluamVjdER0SGVhZGVyID0gZnVuY3Rpb24gaW5qZWN0RHRIZWFkZXIoc3BhbiwgdGFyZ2V0KSB7XG4gICAgdmFyIGhlYWRlck5hbWUgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnZGlzdHJpYnV0ZWRUcmFjaW5nSGVhZGVyTmFtZScpO1xuXG4gICAgdmFyIGhlYWRlclZhbHVlID0gZ2V0RHRIZWFkZXJWYWx1ZShzcGFuKTtcbiAgICB2YXIgaXNIZWFkZXJWYWxpZCA9IGlzRHRIZWFkZXJWYWxpZChoZWFkZXJWYWx1ZSk7XG5cbiAgICBpZiAoaXNIZWFkZXJWYWxpZCAmJiBoZWFkZXJWYWx1ZSAmJiBoZWFkZXJOYW1lKSB7XG4gICAgICBzZXRSZXF1ZXN0SGVhZGVyKHRhcmdldCwgaGVhZGVyTmFtZSwgaGVhZGVyVmFsdWUpO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uaW5qZWN0VFNIZWFkZXIgPSBmdW5jdGlvbiBpbmplY3RUU0hlYWRlcihzcGFuLCB0YXJnZXQpIHtcbiAgICB2YXIgaGVhZGVyVmFsdWUgPSBnZXRUU0hlYWRlclZhbHVlKHNwYW4pO1xuXG4gICAgaWYgKGhlYWRlclZhbHVlKSB7XG4gICAgICBzZXRSZXF1ZXN0SGVhZGVyKHRhcmdldCwgJ3RyYWNlc3RhdGUnLCBoZWFkZXJWYWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5leHRyYWN0RHRIZWFkZXIgPSBmdW5jdGlvbiBleHRyYWN0RHRIZWFkZXIodGFyZ2V0KSB7XG4gICAgdmFyIGNvbmZpZ1NlcnZpY2UgPSB0aGlzLl9jb25maWdTZXJ2aWNlO1xuICAgIHZhciBoZWFkZXJOYW1lID0gY29uZmlnU2VydmljZS5nZXQoJ2Rpc3RyaWJ1dGVkVHJhY2luZ0hlYWRlck5hbWUnKTtcblxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHJldHVybiBwYXJzZUR0SGVhZGVyVmFsdWUodGFyZ2V0W2hlYWRlck5hbWVdKTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmZpbHRlclRyYW5zYWN0aW9uID0gZnVuY3Rpb24gZmlsdGVyVHJhbnNhY3Rpb24odHIpIHtcbiAgICB2YXIgZHVyYXRpb24gPSB0ci5kdXJhdGlvbigpO1xuXG4gICAgaWYgKCFkdXJhdGlvbikge1xuICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBcInRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIpIHdhcyBkaXNjYXJkZWQhIFwiO1xuXG4gICAgICAgIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgICAgICAgIG1lc3NhZ2UgKz0gXCJUcmFuc2FjdGlvbiBkdXJhdGlvbiBpcyAwXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZSArPSBcIlRyYW5zYWN0aW9uIHdhc24ndCBlbmRlZFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9nZ2luU2VydmljZS5kZWJ1ZyhtZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0ci5pc01hbmFnZWQoKSkge1xuICAgICAgaWYgKGR1cmF0aW9uID4gVFJBTlNBQ1RJT05fRFVSQVRJT05fVEhSRVNIT0xEKSB7XG4gICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgdGhpcy5fbG9nZ2luU2VydmljZS5kZWJ1ZyhcInRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIpIHdhcyBkaXNjYXJkZWQhIFRyYW5zYWN0aW9uIGR1cmF0aW9uIChcIiArIGR1cmF0aW9uICsgXCIpIGlzIGdyZWF0ZXIgdGhhbiBtYW5hZ2VkIHRyYW5zYWN0aW9uIHRocmVzaG9sZCAoXCIgKyBUUkFOU0FDVElPTl9EVVJBVElPTl9USFJFU0hPTEQgKyBcIilcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICh0ci5zYW1wbGVkICYmIHRyLnNwYW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICAgIHRoaXMuX2xvZ2dpblNlcnZpY2UuZGVidWcoXCJ0cmFuc2FjdGlvbihcIiArIHRyLmlkICsgXCIsIFwiICsgdHIubmFtZSArIFwiKSB3YXMgZGlzY2FyZGVkISBUcmFuc2FjdGlvbiBkb2VzIG5vdCBoYXZlIGFueSBzcGFuc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfcHJvdG8uY3JlYXRlVHJhbnNhY3Rpb25EYXRhTW9kZWwgPSBmdW5jdGlvbiBjcmVhdGVUcmFuc2FjdGlvbkRhdGFNb2RlbCh0cmFuc2FjdGlvbikge1xuICAgIHZhciB0cmFuc2FjdGlvblN0YXJ0ID0gdHJhbnNhY3Rpb24uX3N0YXJ0O1xuICAgIHZhciBzcGFucyA9IHRyYW5zYWN0aW9uLnNwYW5zLm1hcChmdW5jdGlvbiAoc3Bhbikge1xuICAgICAgdmFyIHNwYW5EYXRhID0ge1xuICAgICAgICBpZDogc3Bhbi5pZCxcbiAgICAgICAgdHJhbnNhY3Rpb25faWQ6IHRyYW5zYWN0aW9uLmlkLFxuICAgICAgICBwYXJlbnRfaWQ6IHNwYW4ucGFyZW50SWQgfHwgdHJhbnNhY3Rpb24uaWQsXG4gICAgICAgIHRyYWNlX2lkOiB0cmFuc2FjdGlvbi50cmFjZUlkLFxuICAgICAgICBuYW1lOiBzcGFuLm5hbWUsXG4gICAgICAgIHR5cGU6IHNwYW4udHlwZSxcbiAgICAgICAgc3VidHlwZTogc3Bhbi5zdWJ0eXBlLFxuICAgICAgICBhY3Rpb246IHNwYW4uYWN0aW9uLFxuICAgICAgICBzeW5jOiBzcGFuLnN5bmMsXG4gICAgICAgIHN0YXJ0OiBwYXJzZUludChzcGFuLl9zdGFydCAtIHRyYW5zYWN0aW9uU3RhcnQpLFxuICAgICAgICBkdXJhdGlvbjogc3Bhbi5kdXJhdGlvbigpLFxuICAgICAgICBjb250ZXh0OiBzcGFuLmNvbnRleHQsXG4gICAgICAgIG91dGNvbWU6IHNwYW4ub3V0Y29tZSxcbiAgICAgICAgc2FtcGxlX3JhdGU6IHNwYW4uc2FtcGxlUmF0ZVxuICAgICAgfTtcbiAgICAgIHJldHVybiB0cnVuY2F0ZU1vZGVsKFNQQU5fTU9ERUwsIHNwYW5EYXRhKTtcbiAgICB9KTtcbiAgICB2YXIgdHJhbnNhY3Rpb25EYXRhID0ge1xuICAgICAgaWQ6IHRyYW5zYWN0aW9uLmlkLFxuICAgICAgdHJhY2VfaWQ6IHRyYW5zYWN0aW9uLnRyYWNlSWQsXG4gICAgICBzZXNzaW9uOiB0cmFuc2FjdGlvbi5zZXNzaW9uLFxuICAgICAgbmFtZTogdHJhbnNhY3Rpb24ubmFtZSxcbiAgICAgIHR5cGU6IHRyYW5zYWN0aW9uLnR5cGUsXG4gICAgICBkdXJhdGlvbjogdHJhbnNhY3Rpb24uZHVyYXRpb24oKSxcbiAgICAgIHNwYW5zOiBzcGFucyxcbiAgICAgIGNvbnRleHQ6IHRyYW5zYWN0aW9uLmNvbnRleHQsXG4gICAgICBtYXJrczogdHJhbnNhY3Rpb24ubWFya3MsXG4gICAgICBicmVha2Rvd246IHRyYW5zYWN0aW9uLmJyZWFrZG93blRpbWluZ3MsXG4gICAgICBzcGFuX2NvdW50OiB7XG4gICAgICAgIHN0YXJ0ZWQ6IHNwYW5zLmxlbmd0aFxuICAgICAgfSxcbiAgICAgIHNhbXBsZWQ6IHRyYW5zYWN0aW9uLnNhbXBsZWQsXG4gICAgICBzYW1wbGVfcmF0ZTogdHJhbnNhY3Rpb24uc2FtcGxlUmF0ZSxcbiAgICAgIGV4cGVyaWVuY2U6IHRyYW5zYWN0aW9uLmV4cGVyaWVuY2UsXG4gICAgICBvdXRjb21lOiB0cmFuc2FjdGlvbi5vdXRjb21lXG4gICAgfTtcbiAgICByZXR1cm4gdHJ1bmNhdGVNb2RlbChUUkFOU0FDVElPTl9NT0RFTCwgdHJhbnNhY3Rpb25EYXRhKTtcbiAgfTtcblxuICBfcHJvdG8uY3JlYXRlVHJhbnNhY3Rpb25QYXlsb2FkID0gZnVuY3Rpb24gY3JlYXRlVHJhbnNhY3Rpb25QYXlsb2FkKHRyYW5zYWN0aW9uKSB7XG4gICAgdmFyIGFkanVzdGVkVHJhbnNhY3Rpb24gPSBhZGp1c3RUcmFuc2FjdGlvbih0cmFuc2FjdGlvbik7XG4gICAgdmFyIGZpbHRlcmVkID0gdGhpcy5maWx0ZXJUcmFuc2FjdGlvbihhZGp1c3RlZFRyYW5zYWN0aW9uKTtcblxuICAgIGlmIChmaWx0ZXJlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVHJhbnNhY3Rpb25EYXRhTW9kZWwodHJhbnNhY3Rpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2UuZGlzcGF0Y2hFdmVudChUUkFOU0FDVElPTl9JR05PUkUpO1xuICB9O1xuXG4gIHJldHVybiBQZXJmb3JtYW5jZU1vbml0b3Jpbmc7XG59KCk7XG5cbmV4cG9ydCB7IFBlcmZvcm1hbmNlTW9uaXRvcmluZyBhcyBkZWZhdWx0IH07IiwiaW1wb3J0IHsgZ2VuZXJhdGVSYW5kb21JZCwgc2V0TGFiZWwsIG1lcmdlLCBnZXREdXJhdGlvbiwgZ2V0VGltZSB9IGZyb20gJy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBOQU1FX1VOS05PV04sIFRZUEVfQ1VTVE9NIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbnZhciBTcGFuQmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3BhbkJhc2UobmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIG5hbWUgPSBOQU1FX1VOS05PV047XG4gICAgfVxuXG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0eXBlID0gVFlQRV9DVVNUT007XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgZ2VuZXJhdGVSYW5kb21JZCgxNik7XG4gICAgdGhpcy50cmFjZUlkID0gb3B0aW9ucy50cmFjZUlkO1xuICAgIHRoaXMuc2FtcGxlZCA9IG9wdGlvbnMuc2FtcGxlZDtcbiAgICB0aGlzLnNhbXBsZVJhdGUgPSBvcHRpb25zLnNhbXBsZVJhdGU7XG4gICAgdGhpcy50aW1lc3RhbXAgPSBvcHRpb25zLnRpbWVzdGFtcDtcbiAgICB0aGlzLl9zdGFydCA9IGdldFRpbWUob3B0aW9ucy5zdGFydFRpbWUpO1xuICAgIHRoaXMuX2VuZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5vdXRjb21lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMub25FbmQgPSBvcHRpb25zLm9uRW5kO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFNwYW5CYXNlLnByb3RvdHlwZTtcblxuICBfcHJvdG8uZW5zdXJlQ29udGV4dCA9IGZ1bmN0aW9uIGVuc3VyZUNvbnRleHQoKSB7XG4gICAgaWYgKCF0aGlzLmNvbnRleHQpIHtcbiAgICAgIHRoaXMuY29udGV4dCA9IHt9O1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uYWRkTGFiZWxzID0gZnVuY3Rpb24gYWRkTGFiZWxzKHRhZ3MpIHtcbiAgICB0aGlzLmVuc3VyZUNvbnRleHQoKTtcbiAgICB2YXIgY3R4ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgaWYgKCFjdHgudGFncykge1xuICAgICAgY3R4LnRhZ3MgPSB7fTtcbiAgICB9XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIHNldExhYmVsKGssIHRhZ3Nba10sIGN0eC50YWdzKTtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uYWRkQ29udGV4dCA9IGZ1bmN0aW9uIGFkZENvbnRleHQoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGNvbnRleHQgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBjb250ZXh0W19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIHRoaXMuZW5zdXJlQ29udGV4dCgpO1xuICAgIG1lcmdlLmFwcGx5KHZvaWQgMCwgW3RoaXMuY29udGV4dF0uY29uY2F0KGNvbnRleHQpKTtcbiAgfTtcblxuICBfcHJvdG8uZW5kID0gZnVuY3Rpb24gZW5kKGVuZFRpbWUpIHtcbiAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgIHRoaXMuX2VuZCA9IGdldFRpbWUoZW5kVGltZSk7XG4gICAgdGhpcy5jYWxsT25FbmQoKTtcbiAgfTtcblxuICBfcHJvdG8uY2FsbE9uRW5kID0gZnVuY3Rpb24gY2FsbE9uRW5kKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vbkVuZCh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmR1cmF0aW9uID0gZnVuY3Rpb24gZHVyYXRpb24oKSB7XG4gICAgcmV0dXJuIGdldER1cmF0aW9uKHRoaXMuX3N0YXJ0LCB0aGlzLl9lbmQpO1xuICB9O1xuXG4gIHJldHVybiBTcGFuQmFzZTtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhbkJhc2U7IiwiZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmltcG9ydCBTcGFuQmFzZSBmcm9tICcuL3NwYW4tYmFzZSc7XG5pbXBvcnQgeyBhZGRTcGFuQ29udGV4dCB9IGZyb20gJy4uL2NvbW1vbi9jb250ZXh0JztcblxudmFyIFNwYW4gPSBmdW5jdGlvbiAoX1NwYW5CYXNlKSB7XG4gIF9pbmhlcml0c0xvb3NlKFNwYW4sIF9TcGFuQmFzZSk7XG5cbiAgZnVuY3Rpb24gU3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgX3RoaXMgPSBfU3BhbkJhc2UuY2FsbCh0aGlzLCBuYW1lLCB0eXBlLCBvcHRpb25zKSB8fCB0aGlzO1xuICAgIF90aGlzLnBhcmVudElkID0gX3RoaXMub3B0aW9ucy5wYXJlbnRJZDtcbiAgICBfdGhpcy5zdWJ0eXBlID0gdW5kZWZpbmVkO1xuICAgIF90aGlzLmFjdGlvbiA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChfdGhpcy50eXBlLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgIHZhciBmaWVsZHMgPSBfdGhpcy50eXBlLnNwbGl0KCcuJywgMyk7XG5cbiAgICAgIF90aGlzLnR5cGUgPSBmaWVsZHNbMF07XG4gICAgICBfdGhpcy5zdWJ0eXBlID0gZmllbGRzWzFdO1xuICAgICAgX3RoaXMuYWN0aW9uID0gZmllbGRzWzJdO1xuICAgIH1cblxuICAgIF90aGlzLnN5bmMgPSBfdGhpcy5vcHRpb25zLnN5bmM7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFNwYW4ucHJvdG90eXBlO1xuXG4gIF9wcm90by5lbmQgPSBmdW5jdGlvbiBlbmQoZW5kVGltZSwgZGF0YSkge1xuICAgIF9TcGFuQmFzZS5wcm90b3R5cGUuZW5kLmNhbGwodGhpcywgZW5kVGltZSk7XG5cbiAgICBhZGRTcGFuQ29udGV4dCh0aGlzLCBkYXRhKTtcbiAgfTtcblxuICByZXR1cm4gU3Bhbjtcbn0oU3BhbkJhc2UpO1xuXG5leHBvcnQgZGVmYXVsdCBTcGFuOyIsImltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuLi9jb21tb24vcG9seWZpbGxzJztcbmltcG9ydCBUcmFuc2FjdGlvbiBmcm9tICcuL3RyYW5zYWN0aW9uJztcbmltcG9ydCB7IFBlcmZFbnRyeVJlY29yZGVyLCBjYXB0dXJlT2JzZXJ2ZXJFbnRyaWVzLCBtZXRyaWNzLCBjcmVhdGVUb3RhbEJsb2NraW5nVGltZVNwYW4gfSBmcm9tICcuL21ldHJpY3MvbWV0cmljcyc7XG5pbXBvcnQgeyBleHRlbmQsIGdldEVhcmxpZXN0U3BhbiwgZ2V0TGF0ZXN0Tm9uWEhSU3BhbiwgZ2V0TGF0ZXN0WEhSU3BhbiwgaXNQZXJmVHlwZVN1cHBvcnRlZCwgZ2VuZXJhdGVSYW5kb21JZCB9IGZyb20gJy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBjYXB0dXJlTmF2aWdhdGlvbiB9IGZyb20gJy4vbmF2aWdhdGlvbi9jYXB0dXJlLW5hdmlnYXRpb24nO1xuaW1wb3J0IHsgUEFHRV9MT0FELCBOQU1FX1VOS05PV04sIFRSQU5TQUNUSU9OX1NUQVJULCBUUkFOU0FDVElPTl9FTkQsIFRSQU5TQUNUSU9OX0lHTk9SRSwgVEVNUE9SQVJZX1RZUEUsIFRSQU5TQUNUSU9OX1RZUEVfT1JERVIsIExBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVCwgTE9OR19UQVNLLCBQQUlOVCwgVFJVTkNBVEVEX1RZUEUsIEZJUlNUX0lOUFVULCBMQVlPVVRfU0hJRlQsIFNFU1NJT05fVElNRU9VVCwgUEFHRV9MT0FEX0RFTEFZIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBhZGRUcmFuc2FjdGlvbkNvbnRleHQgfSBmcm9tICcuLi9jb21tb24vY29udGV4dCc7XG5pbXBvcnQgeyBfX0RFVl9fLCBzdGF0ZSB9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7IHNsdWdpZnlVcmwgfSBmcm9tICcuLi9jb21tb24vdXJsJztcblxudmFyIFRyYW5zYWN0aW9uU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gVHJhbnNhY3Rpb25TZXJ2aWNlKGxvZ2dlciwgY29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9sb2dnZXIgPSBsb2dnZXI7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5yZXNwSW50ZXJ2YWxJZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnJlY29yZGVyID0gbmV3IFBlcmZFbnRyeVJlY29yZGVyKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICB2YXIgdHIgPSBfdGhpcy5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKTtcblxuICAgICAgaWYgKHRyICYmIHRyLmNhcHR1cmVUaW1pbmdzKSB7XG4gICAgICAgIHZhciBfdHIkc3BhbnM7XG5cbiAgICAgICAgdmFyIGlzSGFyZE5hdmlnYXRpb24gPSB0ci50eXBlID09PSBQQUdFX0xPQUQ7XG5cbiAgICAgICAgdmFyIF9jYXB0dXJlT2JzZXJ2ZXJFbnRyaSA9IGNhcHR1cmVPYnNlcnZlckVudHJpZXMobGlzdCwge1xuICAgICAgICAgIGlzSGFyZE5hdmlnYXRpb246IGlzSGFyZE5hdmlnYXRpb24sXG4gICAgICAgICAgdHJTdGFydDogaXNIYXJkTmF2aWdhdGlvbiA/IDAgOiB0ci5fc3RhcnRcbiAgICAgICAgfSksXG4gICAgICAgICAgICBzcGFucyA9IF9jYXB0dXJlT2JzZXJ2ZXJFbnRyaS5zcGFucyxcbiAgICAgICAgICAgIG1hcmtzID0gX2NhcHR1cmVPYnNlcnZlckVudHJpLm1hcmtzO1xuXG4gICAgICAgIChfdHIkc3BhbnMgPSB0ci5zcGFucykucHVzaC5hcHBseShfdHIkc3BhbnMsIHNwYW5zKTtcblxuICAgICAgICB0ci5hZGRNYXJrcyh7XG4gICAgICAgICAgYWdlbnQ6IG1hcmtzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFRyYW5zYWN0aW9uU2VydmljZS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmNyZWF0ZUN1cnJlbnRUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIGNyZWF0ZUN1cnJlbnRUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIHRyID0gbmV3IFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIG9wdGlvbnMpO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9uID0gdHI7XG4gICAgcmV0dXJuIHRyO1xuICB9O1xuXG4gIF9wcm90by5nZXRDdXJyZW50VHJhbnNhY3Rpb24gPSBmdW5jdGlvbiBnZXRDdXJyZW50VHJhbnNhY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFRyYW5zYWN0aW9uICYmICF0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbi5lbmRlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRyYW5zYWN0aW9uO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uY3JlYXRlT3B0aW9ucyA9IGZ1bmN0aW9uIGNyZWF0ZU9wdGlvbnMob3B0aW9ucykge1xuICAgIHZhciBjb25maWcgPSB0aGlzLl9jb25maWcuY29uZmlnO1xuICAgIHZhciBwcmVzZXRPcHRpb25zID0ge1xuICAgICAgdHJhbnNhY3Rpb25TYW1wbGVSYXRlOiBjb25maWcudHJhbnNhY3Rpb25TYW1wbGVSYXRlXG4gICAgfTtcbiAgICB2YXIgcGVyZk9wdGlvbnMgPSBleHRlbmQocHJlc2V0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICBpZiAocGVyZk9wdGlvbnMubWFuYWdlZCkge1xuICAgICAgcGVyZk9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgICBwYWdlTG9hZFRyYWNlSWQ6IGNvbmZpZy5wYWdlTG9hZFRyYWNlSWQsXG4gICAgICAgIHBhZ2VMb2FkU2FtcGxlZDogY29uZmlnLnBhZ2VMb2FkU2FtcGxlZCxcbiAgICAgICAgcGFnZUxvYWRTcGFuSWQ6IGNvbmZpZy5wYWdlTG9hZFNwYW5JZCxcbiAgICAgICAgcGFnZUxvYWRUcmFuc2FjdGlvbk5hbWU6IGNvbmZpZy5wYWdlTG9hZFRyYW5zYWN0aW9uTmFtZVxuICAgICAgfSwgcGVyZk9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBwZXJmT3B0aW9ucztcbiAgfTtcblxuICBfcHJvdG8uc3RhcnRNYW5hZ2VkVHJhbnNhY3Rpb24gPSBmdW5jdGlvbiBzdGFydE1hbmFnZWRUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBwZXJmT3B0aW9ucykge1xuICAgIHZhciB0ciA9IHRoaXMuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG4gICAgdmFyIGlzUmVkZWZpbmVkID0gZmFsc2U7XG5cbiAgICBpZiAoIXRyKSB7XG4gICAgICB0ciA9IHRoaXMuY3JlYXRlQ3VycmVudFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHRyLmNhblJldXNlKCkgJiYgcGVyZk9wdGlvbnMuY2FuUmV1c2UpIHtcbiAgICAgIHZhciByZWRlZmluZVR5cGUgPSB0ci50eXBlO1xuICAgICAgdmFyIGN1cnJlbnRUeXBlT3JkZXIgPSBUUkFOU0FDVElPTl9UWVBFX09SREVSLmluZGV4T2YodHIudHlwZSk7XG4gICAgICB2YXIgcmVkZWZpbmVUeXBlT3JkZXIgPSBUUkFOU0FDVElPTl9UWVBFX09SREVSLmluZGV4T2YodHlwZSk7XG5cbiAgICAgIGlmIChjdXJyZW50VHlwZU9yZGVyID49IDAgJiYgcmVkZWZpbmVUeXBlT3JkZXIgPCBjdXJyZW50VHlwZU9yZGVyKSB7XG4gICAgICAgIHJlZGVmaW5lVHlwZSA9IHR5cGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhcInJlZGVmaW5pbmcgdHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIiwgXCIgKyB0ci50eXBlICsgXCIpXCIsICd0bycsIFwiKFwiICsgKG5hbWUgfHwgdHIubmFtZSkgKyBcIiwgXCIgKyByZWRlZmluZVR5cGUgKyBcIilcIiwgdHIpO1xuICAgICAgfVxuXG4gICAgICB0ci5yZWRlZmluZShuYW1lLCByZWRlZmluZVR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICAgIGlzUmVkZWZpbmVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFwiZW5kaW5nIHByZXZpb3VzIHRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIpXCIsIHRyKTtcbiAgICAgIH1cblxuICAgICAgdHIuZW5kKCk7XG4gICAgICB0ciA9IHRoaXMuY3JlYXRlQ3VycmVudFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAodHIudHlwZSA9PT0gUEFHRV9MT0FEKSB7XG4gICAgICBpZiAoIWlzUmVkZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVjb3JkZXIuc3RhcnQoTEFSR0VTVF9DT05URU5URlVMX1BBSU5UKTtcbiAgICAgICAgdGhpcy5yZWNvcmRlci5zdGFydChQQUlOVCk7XG4gICAgICAgIHRoaXMucmVjb3JkZXIuc3RhcnQoRklSU1RfSU5QVVQpO1xuICAgICAgICB0aGlzLnJlY29yZGVyLnN0YXJ0KExBWU9VVF9TSElGVCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwZXJmT3B0aW9ucy5wYWdlTG9hZFRyYWNlSWQpIHtcbiAgICAgICAgdHIudHJhY2VJZCA9IHBlcmZPcHRpb25zLnBhZ2VMb2FkVHJhY2VJZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBlcmZPcHRpb25zLnBhZ2VMb2FkU2FtcGxlZCkge1xuICAgICAgICB0ci5zYW1wbGVkID0gcGVyZk9wdGlvbnMucGFnZUxvYWRTYW1wbGVkO1xuICAgICAgfVxuXG4gICAgICBpZiAodHIubmFtZSA9PT0gTkFNRV9VTktOT1dOICYmIHBlcmZPcHRpb25zLnBhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lKSB7XG4gICAgICAgIHRyLm5hbWUgPSBwZXJmT3B0aW9ucy5wYWdlTG9hZFRyYW5zYWN0aW9uTmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzUmVkZWZpbmVkICYmIHRoaXMuX2NvbmZpZy5nZXQoJ21vbml0b3JMb25ndGFza3MnKSkge1xuICAgICAgdGhpcy5yZWNvcmRlci5zdGFydChMT05HX1RBU0spO1xuICAgIH1cblxuICAgIGlmICh0ci5zYW1wbGVkKSB7XG4gICAgICB0ci5jYXB0dXJlVGltaW5ncyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyO1xuICB9O1xuXG4gIF9wcm90by5zdGFydFRyYW5zYWN0aW9uID0gZnVuY3Rpb24gc3RhcnRUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICB2YXIgcGVyZk9wdGlvbnMgPSB0aGlzLmNyZWF0ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgdmFyIHRyO1xuICAgIHZhciBmaXJlT25zdGFydEhvb2sgPSB0cnVlO1xuXG4gICAgaWYgKHBlcmZPcHRpb25zLm1hbmFnZWQpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50VHJhbnNhY3Rpb247XG4gICAgICB0ciA9IHRoaXMuc3RhcnRNYW5hZ2VkVHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgcGVyZk9wdGlvbnMpO1xuXG4gICAgICBpZiAoY3VycmVudCA9PT0gdHIpIHtcbiAgICAgICAgZmlyZU9uc3RhcnRIb29rID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyID0gbmV3IFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICB9XG5cbiAgICB0ci5vbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpczIuaGFuZGxlVHJhbnNhY3Rpb25FbmQodHIpO1xuICAgIH07XG5cbiAgICBpZiAoZmlyZU9uc3RhcnRIb29rKSB7XG4gICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoXCJzdGFydFRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIsIFwiICsgdHIudHlwZSArIFwiKVwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY29uZmlnLmV2ZW50cy5zZW5kKFRSQU5TQUNUSU9OX1NUQVJULCBbdHJdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHI7XG4gIH07XG5cbiAgX3Byb3RvLmhhbmRsZVRyYW5zYWN0aW9uRW5kID0gZnVuY3Rpb24gaGFuZGxlVHJhbnNhY3Rpb25FbmQodHIpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHRoaXMucmVjb3JkZXIuc3RvcCgpO1xuICAgIHZhciBjdXJyZW50VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5hbWUgPSB0ci5uYW1lLFxuICAgICAgICAgIHR5cGUgPSB0ci50eXBlO1xuICAgICAgdmFyIGxhc3RIaWRkZW5TdGFydCA9IHN0YXRlLmxhc3RIaWRkZW5TdGFydDtcblxuICAgICAgaWYgKGxhc3RIaWRkZW5TdGFydCA+PSB0ci5fc3RhcnQpIHtcbiAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICBfdGhpczMuX2xvZ2dlci5kZWJ1ZyhcInRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyBuYW1lICsgXCIsIFwiICsgdHlwZSArIFwiKSB3YXMgZGlzY2FyZGVkISBUaGUgcGFnZSB3YXMgaGlkZGVuIGR1cmluZyB0aGUgdHJhbnNhY3Rpb24hXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMzLl9jb25maWcuZGlzcGF0Y2hFdmVudChUUkFOU0FDVElPTl9JR05PUkUpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKF90aGlzMy5zaG91bGRJZ25vcmVUcmFuc2FjdGlvbihuYW1lKSB8fCB0eXBlID09PSBURU1QT1JBUllfVFlQRSkge1xuICAgICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICAgIF90aGlzMy5fbG9nZ2VyLmRlYnVnKFwidHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIG5hbWUgKyBcIiwgXCIgKyB0eXBlICsgXCIpIGlzIGlnbm9yZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpczMuX2NvbmZpZy5kaXNwYXRjaEV2ZW50KFRSQU5TQUNUSU9OX0lHTk9SRSk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PT0gUEFHRV9MT0FEKSB7XG4gICAgICAgIHZhciBwYWdlTG9hZFRyYW5zYWN0aW9uTmFtZSA9IF90aGlzMy5fY29uZmlnLmdldCgncGFnZUxvYWRUcmFuc2FjdGlvbk5hbWUnKTtcblxuICAgICAgICBpZiAobmFtZSA9PT0gTkFNRV9VTktOT1dOICYmIHBhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lKSB7XG4gICAgICAgICAgdHIubmFtZSA9IHBhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyLmNhcHR1cmVUaW1pbmdzKSB7XG4gICAgICAgICAgdmFyIGNscyA9IG1ldHJpY3MuY2xzLFxuICAgICAgICAgICAgICBmaWQgPSBtZXRyaWNzLmZpZCxcbiAgICAgICAgICAgICAgdGJ0ID0gbWV0cmljcy50YnQsXG4gICAgICAgICAgICAgIGxvbmd0YXNrID0gbWV0cmljcy5sb25ndGFzaztcblxuICAgICAgICAgIGlmICh0YnQuZHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICB0ci5zcGFucy5wdXNoKGNyZWF0ZVRvdGFsQmxvY2tpbmdUaW1lU3Bhbih0YnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0ci5leHBlcmllbmNlID0ge307XG5cbiAgICAgICAgICBpZiAoaXNQZXJmVHlwZVN1cHBvcnRlZChMT05HX1RBU0spKSB7XG4gICAgICAgICAgICB0ci5leHBlcmllbmNlLnRidCA9IHRidC5kdXJhdGlvbjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNQZXJmVHlwZVN1cHBvcnRlZChMQVlPVVRfU0hJRlQpKSB7XG4gICAgICAgICAgICB0ci5leHBlcmllbmNlLmNscyA9IGNscy5zY29yZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlkID4gMCkge1xuICAgICAgICAgICAgdHIuZXhwZXJpZW5jZS5maWQgPSBmaWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvbmd0YXNrLmNvdW50ID4gMCkge1xuICAgICAgICAgICAgdHIuZXhwZXJpZW5jZS5sb25ndGFzayA9IHtcbiAgICAgICAgICAgICAgY291bnQ6IGxvbmd0YXNrLmNvdW50LFxuICAgICAgICAgICAgICBzdW06IGxvbmd0YXNrLmR1cmF0aW9uLFxuICAgICAgICAgICAgICBtYXg6IGxvbmd0YXNrLm1heFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpczMuc2V0U2Vzc2lvbih0cik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0ci5uYW1lID09PSBOQU1FX1VOS05PV04pIHtcbiAgICAgICAgdHIubmFtZSA9IHNsdWdpZnlVcmwoY3VycmVudFVybCk7XG4gICAgICB9XG5cbiAgICAgIGNhcHR1cmVOYXZpZ2F0aW9uKHRyKTtcblxuICAgICAgX3RoaXMzLmFkanVzdFRyYW5zYWN0aW9uVGltZSh0cik7XG5cbiAgICAgIHZhciBicmVha2Rvd25NZXRyaWNzID0gX3RoaXMzLl9jb25maWcuZ2V0KCdicmVha2Rvd25NZXRyaWNzJyk7XG5cbiAgICAgIGlmIChicmVha2Rvd25NZXRyaWNzKSB7XG4gICAgICAgIHRyLmNhcHR1cmVCcmVha2Rvd24oKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbmZpZ0NvbnRleHQgPSBfdGhpczMuX2NvbmZpZy5nZXQoJ2NvbnRleHQnKTtcblxuICAgICAgYWRkVHJhbnNhY3Rpb25Db250ZXh0KHRyLCBjb25maWdDb250ZXh0KTtcblxuICAgICAgX3RoaXMzLl9jb25maWcuZXZlbnRzLnNlbmQoVFJBTlNBQ1RJT05fRU5ELCBbdHJdKTtcblxuICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgX3RoaXMzLl9sb2dnZXIuZGVidWcoXCJlbmQgdHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIiwgXCIgKyB0ci50eXBlICsgXCIpXCIsIHRyKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICBfdGhpczMuX2xvZ2dlci5kZWJ1ZyhcImVycm9yIGVuZGluZyB0cmFuc2FjdGlvbihcIiArIHRyLmlkICsgXCIsIFwiICsgdHIubmFtZSArIFwiKVwiLCBlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIF9wcm90by5zZXRTZXNzaW9uID0gZnVuY3Rpb24gc2V0U2Vzc2lvbih0cikge1xuICAgIHZhciBzZXNzaW9uID0gdGhpcy5fY29uZmlnLmdldCgnc2Vzc2lvbicpO1xuXG4gICAgaWYgKHNlc3Npb24pIHtcbiAgICAgIGlmICh0eXBlb2Ygc2Vzc2lvbiA9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdHIuc2Vzc2lvbiA9IHtcbiAgICAgICAgICBpZDogZ2VuZXJhdGVSYW5kb21JZCgxNiksXG4gICAgICAgICAgc2VxdWVuY2U6IDFcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZXNzaW9uLnRpbWVzdGFtcCAmJiBEYXRlLm5vdygpIC0gc2Vzc2lvbi50aW1lc3RhbXAgPiBTRVNTSU9OX1RJTUVPVVQpIHtcbiAgICAgICAgICB0ci5zZXNzaW9uID0ge1xuICAgICAgICAgICAgaWQ6IGdlbmVyYXRlUmFuZG9tSWQoMTYpLFxuICAgICAgICAgICAgc2VxdWVuY2U6IDFcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyLnNlc3Npb24gPSB7XG4gICAgICAgICAgICBpZDogc2Vzc2lvbi5pZCxcbiAgICAgICAgICAgIHNlcXVlbmNlOiBzZXNzaW9uLnNlcXVlbmNlID8gc2Vzc2lvbi5zZXF1ZW5jZSArIDEgOiAxXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgc2Vzc2lvbkNvbmZpZyA9IHtcbiAgICAgICAgc2Vzc2lvbjoge1xuICAgICAgICAgIGlkOiB0ci5zZXNzaW9uLmlkLFxuICAgICAgICAgIHNlcXVlbmNlOiB0ci5zZXNzaW9uLnNlcXVlbmNlLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9jb25maWcuc2V0Q29uZmlnKHNlc3Npb25Db25maWcpO1xuXG4gICAgICB0aGlzLl9jb25maWcuc2V0TG9jYWxDb25maWcoc2Vzc2lvbkNvbmZpZywgdHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5hZGp1c3RUcmFuc2FjdGlvblRpbWUgPSBmdW5jdGlvbiBhZGp1c3RUcmFuc2FjdGlvblRpbWUodHJhbnNhY3Rpb24pIHtcbiAgICB2YXIgc3BhbnMgPSB0cmFuc2FjdGlvbi5zcGFucztcbiAgICB2YXIgZWFybGllc3RTcGFuID0gZ2V0RWFybGllc3RTcGFuKHNwYW5zKTtcblxuICAgIGlmIChlYXJsaWVzdFNwYW4gJiYgZWFybGllc3RTcGFuLl9zdGFydCA8IHRyYW5zYWN0aW9uLl9zdGFydCkge1xuICAgICAgdHJhbnNhY3Rpb24uX3N0YXJ0ID0gZWFybGllc3RTcGFuLl9zdGFydDtcbiAgICB9XG5cbiAgICB2YXIgbGF0ZXN0U3BhbiA9IGdldExhdGVzdE5vblhIUlNwYW4oc3BhbnMpIHx8IHt9O1xuICAgIHZhciBsYXRlc3RTcGFuRW5kID0gbGF0ZXN0U3Bhbi5fZW5kIHx8IDA7XG5cbiAgICBpZiAodHJhbnNhY3Rpb24udHlwZSA9PT0gUEFHRV9MT0FEKSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25FbmRXaXRob3V0RGVsYXkgPSB0cmFuc2FjdGlvbi5fZW5kIC0gUEFHRV9MT0FEX0RFTEFZO1xuICAgICAgdmFyIGxjcCA9IG1ldHJpY3MubGNwIHx8IDA7XG4gICAgICB2YXIgbGF0ZXN0WEhSU3BhbiA9IGdldExhdGVzdFhIUlNwYW4oc3BhbnMpIHx8IHt9O1xuICAgICAgdmFyIGxhdGVzdFhIUlNwYW5FbmQgPSBsYXRlc3RYSFJTcGFuLl9lbmQgfHwgMDtcbiAgICAgIHRyYW5zYWN0aW9uLl9lbmQgPSBNYXRoLm1heChsYXRlc3RTcGFuRW5kLCBsYXRlc3RYSFJTcGFuRW5kLCBsY3AsIHRyYW5zYWN0aW9uRW5kV2l0aG91dERlbGF5KTtcbiAgICB9IGVsc2UgaWYgKGxhdGVzdFNwYW5FbmQgPiB0cmFuc2FjdGlvbi5fZW5kKSB7XG4gICAgICB0cmFuc2FjdGlvbi5fZW5kID0gbGF0ZXN0U3BhbkVuZDtcbiAgICB9XG5cbiAgICB0aGlzLnRydW5jYXRlU3BhbnMoc3BhbnMsIHRyYW5zYWN0aW9uLl9lbmQpO1xuICB9O1xuXG4gIF9wcm90by50cnVuY2F0ZVNwYW5zID0gZnVuY3Rpb24gdHJ1bmNhdGVTcGFucyhzcGFucywgdHJhbnNhY3Rpb25FbmQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc3BhbiA9IHNwYW5zW2ldO1xuXG4gICAgICBpZiAoc3Bhbi5fZW5kID4gdHJhbnNhY3Rpb25FbmQpIHtcbiAgICAgICAgc3Bhbi5fZW5kID0gdHJhbnNhY3Rpb25FbmQ7XG4gICAgICAgIHNwYW4udHlwZSArPSBUUlVOQ0FURURfVFlQRTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNwYW4uX3N0YXJ0ID4gdHJhbnNhY3Rpb25FbmQpIHtcbiAgICAgICAgc3Bhbi5fc3RhcnQgPSB0cmFuc2FjdGlvbkVuZDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLnNob3VsZElnbm9yZVRyYW5zYWN0aW9uID0gZnVuY3Rpb24gc2hvdWxkSWdub3JlVHJhbnNhY3Rpb24odHJhbnNhY3Rpb25OYW1lKSB7XG4gICAgdmFyIGlnbm9yZUxpc3QgPSB0aGlzLl9jb25maWcuZ2V0KCdpZ25vcmVUcmFuc2FjdGlvbnMnKTtcblxuICAgIGlmIChpZ25vcmVMaXN0ICYmIGlnbm9yZUxpc3QubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlnbm9yZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpZ25vcmVMaXN0W2ldO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudC50ZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaWYgKGVsZW1lbnQudGVzdCh0cmFuc2FjdGlvbk5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudCA9PT0gdHJhbnNhY3Rpb25OYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgX3Byb3RvLnN0YXJ0U3BhbiA9IGZ1bmN0aW9uIHN0YXJ0U3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIHRyID0gdGhpcy5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKTtcblxuICAgIGlmICghdHIpIHtcbiAgICAgIHRyID0gdGhpcy5jcmVhdGVDdXJyZW50VHJhbnNhY3Rpb24odW5kZWZpbmVkLCBURU1QT1JBUllfVFlQRSwgdGhpcy5jcmVhdGVPcHRpb25zKHtcbiAgICAgICAgY2FuUmV1c2U6IHRydWUsXG4gICAgICAgIG1hbmFnZWQ6IHRydWVcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICB2YXIgc3BhbiA9IHRyLnN0YXJ0U3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKTtcblxuICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICB0aGlzLl9sb2dnZXIuZGVidWcoXCJzdGFydFNwYW4oXCIgKyBuYW1lICsgXCIsIFwiICsgc3Bhbi50eXBlICsgXCIpXCIsIFwib24gdHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIilcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNwYW47XG4gIH07XG5cbiAgX3Byb3RvLmVuZFNwYW4gPSBmdW5jdGlvbiBlbmRTcGFuKHNwYW4sIGNvbnRleHQpIHtcbiAgICBpZiAoIXNwYW4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgdmFyIHRyID0gdGhpcy5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKTtcbiAgICAgIHRyICYmIHRoaXMuX2xvZ2dlci5kZWJ1ZyhcImVuZFNwYW4oXCIgKyBzcGFuLm5hbWUgKyBcIiwgXCIgKyBzcGFuLnR5cGUgKyBcIilcIiwgXCJvbiB0cmFuc2FjdGlvbihcIiArIHRyLmlkICsgXCIsIFwiICsgdHIubmFtZSArIFwiKVwiKTtcbiAgICB9XG5cbiAgICBzcGFuLmVuZChudWxsLCBjb250ZXh0KTtcbiAgfTtcblxuICByZXR1cm4gVHJhbnNhY3Rpb25TZXJ2aWNlO1xufSgpO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2FjdGlvblNlcnZpY2U7IiwiZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmltcG9ydCBTcGFuIGZyb20gJy4vc3Bhbic7XG5pbXBvcnQgU3BhbkJhc2UgZnJvbSAnLi9zcGFuLWJhc2UnO1xuaW1wb3J0IHsgZ2VuZXJhdGVSYW5kb21JZCwgbWVyZ2UsIG5vdywgZ2V0VGltZSwgZXh0ZW5kLCByZW1vdmVJbnZhbGlkQ2hhcnMgfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgUkVVU0FCSUxJVFlfVEhSRVNIT0xELCBUUlVOQ0FURURfVFlQRSB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgY2FwdHVyZUJyZWFrZG93biBhcyBfY2FwdHVyZUJyZWFrZG93biB9IGZyb20gJy4vYnJlYWtkb3duJztcblxudmFyIFRyYW5zYWN0aW9uID0gZnVuY3Rpb24gKF9TcGFuQmFzZSkge1xuICBfaW5oZXJpdHNMb29zZShUcmFuc2FjdGlvbiwgX1NwYW5CYXNlKTtcblxuICBmdW5jdGlvbiBUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgX3RoaXMgPSBfU3BhbkJhc2UuY2FsbCh0aGlzLCBuYW1lLCB0eXBlLCBvcHRpb25zKSB8fCB0aGlzO1xuICAgIF90aGlzLnRyYWNlSWQgPSBnZW5lcmF0ZVJhbmRvbUlkKCk7XG4gICAgX3RoaXMubWFya3MgPSB1bmRlZmluZWQ7XG4gICAgX3RoaXMuc3BhbnMgPSBbXTtcbiAgICBfdGhpcy5fYWN0aXZlU3BhbnMgPSB7fTtcbiAgICBfdGhpcy5fYWN0aXZlVGFza3MgPSBuZXcgU2V0KCk7XG4gICAgX3RoaXMuYmxvY2tlZCA9IGZhbHNlO1xuICAgIF90aGlzLmNhcHR1cmVUaW1pbmdzID0gZmFsc2U7XG4gICAgX3RoaXMuYnJlYWtkb3duVGltaW5ncyA9IFtdO1xuICAgIF90aGlzLnNhbXBsZVJhdGUgPSBfdGhpcy5vcHRpb25zLnRyYW5zYWN0aW9uU2FtcGxlUmF0ZTtcbiAgICBfdGhpcy5zYW1wbGVkID0gTWF0aC5yYW5kb20oKSA8PSBfdGhpcy5zYW1wbGVSYXRlO1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBUcmFuc2FjdGlvbi5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmFkZE1hcmtzID0gZnVuY3Rpb24gYWRkTWFya3Mob2JqKSB7XG4gICAgdGhpcy5tYXJrcyA9IG1lcmdlKHRoaXMubWFya3MgfHwge30sIG9iaik7XG4gIH07XG5cbiAgX3Byb3RvLm1hcmsgPSBmdW5jdGlvbiBtYXJrKGtleSkge1xuICAgIHZhciBza2V5ID0gcmVtb3ZlSW52YWxpZENoYXJzKGtleSk7XG5cbiAgICB2YXIgbWFya1RpbWUgPSBub3coKSAtIHRoaXMuX3N0YXJ0O1xuXG4gICAgdmFyIGN1c3RvbSA9IHt9O1xuICAgIGN1c3RvbVtza2V5XSA9IG1hcmtUaW1lO1xuICAgIHRoaXMuYWRkTWFya3Moe1xuICAgICAgY3VzdG9tOiBjdXN0b21cbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uY2FuUmV1c2UgPSBmdW5jdGlvbiBjYW5SZXVzZSgpIHtcbiAgICB2YXIgdGhyZXNob2xkID0gdGhpcy5vcHRpb25zLnJldXNlVGhyZXNob2xkIHx8IFJFVVNBQklMSVRZX1RIUkVTSE9MRDtcbiAgICByZXR1cm4gISF0aGlzLm9wdGlvbnMuY2FuUmV1c2UgJiYgIXRoaXMuZW5kZWQgJiYgbm93KCkgLSB0aGlzLl9zdGFydCA8IHRocmVzaG9sZDtcbiAgfTtcblxuICBfcHJvdG8ucmVkZWZpbmUgPSBmdW5jdGlvbiByZWRlZmluZShuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yZXVzZVRocmVzaG9sZCA9IG9wdGlvbnMucmV1c2VUaHJlc2hvbGQ7XG4gICAgICBleHRlbmQodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLnN0YXJ0U3BhbiA9IGZ1bmN0aW9uIHN0YXJ0U3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBvcHRzID0gZXh0ZW5kKHt9LCBvcHRpb25zKTtcblxuICAgIG9wdHMub25FbmQgPSBmdW5jdGlvbiAodHJjKSB7XG4gICAgICBfdGhpczIuX29uU3BhbkVuZCh0cmMpO1xuICAgIH07XG5cbiAgICBvcHRzLnRyYWNlSWQgPSB0aGlzLnRyYWNlSWQ7XG4gICAgb3B0cy5zYW1wbGVkID0gdGhpcy5zYW1wbGVkO1xuICAgIG9wdHMuc2FtcGxlUmF0ZSA9IHRoaXMuc2FtcGxlUmF0ZTtcblxuICAgIGlmICghb3B0cy5wYXJlbnRJZCkge1xuICAgICAgb3B0cy5wYXJlbnRJZCA9IHRoaXMuaWQ7XG4gICAgfVxuXG4gICAgdmFyIHNwYW4gPSBuZXcgU3BhbihuYW1lLCB0eXBlLCBvcHRzKTtcbiAgICB0aGlzLl9hY3RpdmVTcGFuc1tzcGFuLmlkXSA9IHNwYW47XG5cbiAgICBpZiAob3B0cy5ibG9ja2luZykge1xuICAgICAgdGhpcy5hZGRUYXNrKHNwYW4uaWQpO1xuICAgIH1cblxuICAgIHJldHVybiBzcGFuO1xuICB9O1xuXG4gIF9wcm90by5pc0ZpbmlzaGVkID0gZnVuY3Rpb24gaXNGaW5pc2hlZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuYmxvY2tlZCAmJiB0aGlzLl9hY3RpdmVUYXNrcy5zaXplID09PSAwO1xuICB9O1xuXG4gIF9wcm90by5kZXRlY3RGaW5pc2ggPSBmdW5jdGlvbiBkZXRlY3RGaW5pc2goKSB7XG4gICAgaWYgKHRoaXMuaXNGaW5pc2hlZCgpKSB0aGlzLmVuZCgpO1xuICB9O1xuXG4gIF9wcm90by5lbmQgPSBmdW5jdGlvbiBlbmQoZW5kVGltZSkge1xuICAgIGlmICh0aGlzLmVuZGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lbmRlZCA9IHRydWU7XG4gICAgdGhpcy5fZW5kID0gZ2V0VGltZShlbmRUaW1lKTtcblxuICAgIGZvciAodmFyIHNpZCBpbiB0aGlzLl9hY3RpdmVTcGFucykge1xuICAgICAgdmFyIHNwYW4gPSB0aGlzLl9hY3RpdmVTcGFuc1tzaWRdO1xuICAgICAgc3Bhbi50eXBlID0gc3Bhbi50eXBlICsgVFJVTkNBVEVEX1RZUEU7XG4gICAgICBzcGFuLmVuZChlbmRUaW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLmNhbGxPbkVuZCgpO1xuICB9O1xuXG4gIF9wcm90by5jYXB0dXJlQnJlYWtkb3duID0gZnVuY3Rpb24gY2FwdHVyZUJyZWFrZG93bigpIHtcbiAgICB0aGlzLmJyZWFrZG93blRpbWluZ3MgPSBfY2FwdHVyZUJyZWFrZG93bih0aGlzKTtcbiAgfTtcblxuICBfcHJvdG8uYmxvY2sgPSBmdW5jdGlvbiBibG9jayhmbGFnKSB7XG4gICAgdGhpcy5ibG9ja2VkID0gZmxhZztcblxuICAgIGlmICghdGhpcy5ibG9ja2VkKSB7XG4gICAgICB0aGlzLmRldGVjdEZpbmlzaCgpO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uYWRkVGFzayA9IGZ1bmN0aW9uIGFkZFRhc2sodGFza0lkKSB7XG4gICAgaWYgKCF0YXNrSWQpIHtcbiAgICAgIHRhc2tJZCA9ICd0YXNrLScgKyBnZW5lcmF0ZVJhbmRvbUlkKDE2KTtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVUYXNrcy5hZGQodGFza0lkKTtcblxuICAgIHJldHVybiB0YXNrSWQ7XG4gIH07XG5cbiAgX3Byb3RvLnJlbW92ZVRhc2sgPSBmdW5jdGlvbiByZW1vdmVUYXNrKHRhc2tJZCkge1xuICAgIHZhciBkZWxldGVkID0gdGhpcy5fYWN0aXZlVGFza3MuZGVsZXRlKHRhc2tJZCk7XG5cbiAgICBkZWxldGVkICYmIHRoaXMuZGV0ZWN0RmluaXNoKCk7XG4gIH07XG5cbiAgX3Byb3RvLnJlc2V0RmllbGRzID0gZnVuY3Rpb24gcmVzZXRGaWVsZHMoKSB7XG4gICAgdGhpcy5zcGFucyA9IFtdO1xuICAgIHRoaXMuc2FtcGxlUmF0ZSA9IDA7XG4gIH07XG5cbiAgX3Byb3RvLl9vblNwYW5FbmQgPSBmdW5jdGlvbiBfb25TcGFuRW5kKHNwYW4pIHtcbiAgICB0aGlzLnNwYW5zLnB1c2goc3Bhbik7XG4gICAgZGVsZXRlIHRoaXMuX2FjdGl2ZVNwYW5zW3NwYW4uaWRdO1xuICAgIHRoaXMucmVtb3ZlVGFzayhzcGFuLmlkKTtcbiAgfTtcblxuICBfcHJvdG8uaXNNYW5hZ2VkID0gZnVuY3Rpb24gaXNNYW5hZ2VkKCkge1xuICAgIHJldHVybiAhIXRoaXMub3B0aW9ucy5tYW5hZ2VkO1xuICB9O1xuXG4gIHJldHVybiBUcmFuc2FjdGlvbjtcbn0oU3BhbkJhc2UpO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2FjdGlvbjsiLCJ2YXIgX19ERVZfXyA9IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbic7XG5cbnZhciBzdGF0ZSA9IHtcbiAgYm9vdHN0cmFwVGltZTogbnVsbCxcbiAgbGFzdEhpZGRlblN0YXJ0OiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlxufTtcbmV4cG9ydCB7IF9fREVWX18sIHN0YXRlIH07IiwiLyoqXG4gKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNy1wcmVzZW50LCBFbGFzdGljc2VhcmNoIEJWXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqXG4gKi9cblxuaW1wb3J0IHtcbiAgZ2V0SW5zdHJ1bWVudGF0aW9uRmxhZ3MsXG4gIFBBR0VfTE9BRF9ERUxBWSxcbiAgUEFHRV9MT0FELFxuICBFUlJPUixcbiAgQ09ORklHX1NFUlZJQ0UsXG4gIExPR0dJTkdfU0VSVklDRSxcbiAgVFJBTlNBQ1RJT05fU0VSVklDRSxcbiAgUEVSRk9STUFOQ0VfTU9OSVRPUklORyxcbiAgRVJST1JfTE9HR0lORyxcbiAgQVBNX1NFUlZFUixcbiAgRVZFTlRfVEFSR0VULFxuICBDTElDSyxcbiAgb2JzZXJ2ZVBhZ2VWaXNpYmlsaXR5LFxuICBvYnNlcnZlUGFnZUNsaWNrcyxcbiAgb2JzZXJ2ZVVzZXJJbnRlcmFjdGlvbnNcbn0gZnJvbSAnQGVsYXN0aWMvYXBtLXJ1bS1jb3JlJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcG1CYXNlIHtcbiAgY29uc3RydWN0b3Ioc2VydmljZUZhY3RvcnksIGRpc2FibGUpIHtcbiAgICB0aGlzLl9kaXNhYmxlID0gZGlzYWJsZVxuICAgIHRoaXMuc2VydmljZUZhY3RvcnkgPSBzZXJ2aWNlRmFjdG9yeVxuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2VcbiAgfVxuXG4gIGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuX2Rpc2FibGVcbiAgfVxuXG4gIGlzQWN0aXZlKCkge1xuICAgIGNvbnN0IGNvbmZpZ1NlcnZpY2UgPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoQ09ORklHX1NFUlZJQ0UpXG4gICAgcmV0dXJuIHRoaXMuaXNFbmFibGVkKCkgJiYgdGhpcy5faW5pdGlhbGl6ZWQgJiYgY29uZmlnU2VydmljZS5nZXQoJ2FjdGl2ZScpXG4gIH1cblxuICBpbml0KGNvbmZpZykge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpICYmICF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICBjb25zdCBbXG4gICAgICAgIGNvbmZpZ1NlcnZpY2UsXG4gICAgICAgIGxvZ2dpbmdTZXJ2aWNlLFxuICAgICAgICB0cmFuc2FjdGlvblNlcnZpY2VcbiAgICAgIF0gPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoW1xuICAgICAgICBDT05GSUdfU0VSVklDRSxcbiAgICAgICAgTE9HR0lOR19TRVJWSUNFLFxuICAgICAgICBUUkFOU0FDVElPTl9TRVJWSUNFXG4gICAgICBdKVxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgQWdlbnQgdmVyc2lvbiB0byBiZSBzZW50IGFzIHBhcnQgb2YgbWV0YWRhdGEgdG8gdGhlIEFQTSBTZXJ2ZXJcbiAgICAgICAqL1xuICAgICAgY29uZmlnU2VydmljZS5zZXRWZXJzaW9uKCc1LjE2LjAnKVxuICAgICAgdGhpcy5jb25maWcoY29uZmlnKVxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgbGV2ZWwgaGVyZSB0byBhY2NvdW50IGZvciBib3RoIGFjdGl2ZSBhbmQgaW5hY3RpdmUgY2FzZXNcbiAgICAgICAqL1xuICAgICAgY29uc3QgbG9nTGV2ZWwgPSBjb25maWdTZXJ2aWNlLmdldCgnbG9nTGV2ZWwnKVxuICAgICAgbG9nZ2luZ1NlcnZpY2Uuc2V0TGV2ZWwobG9nTGV2ZWwpXG4gICAgICAvKipcbiAgICAgICAqIERlYWN0aXZlIGFnZW50IHdoZW4gdGhlIGFjdGl2ZSBjb25maWcgZmxhZyBpcyBzZXQgdG8gZmFsc2VcbiAgICAgICAqL1xuICAgICAgY29uc3QgaXNDb25maWdBY3RpdmUgPSBjb25maWdTZXJ2aWNlLmdldCgnYWN0aXZlJylcbiAgICAgIGlmIChpc0NvbmZpZ0FjdGl2ZSkge1xuICAgICAgICB0aGlzLnNlcnZpY2VGYWN0b3J5LmluaXQoKVxuXG4gICAgICAgIGNvbnN0IGZsYWdzID0gZ2V0SW5zdHJ1bWVudGF0aW9uRmxhZ3MoXG4gICAgICAgICAgY29uZmlnU2VydmljZS5nZXQoJ2luc3RydW1lbnQnKSxcbiAgICAgICAgICBjb25maWdTZXJ2aWNlLmdldCgnZGlzYWJsZUluc3RydW1lbnRhdGlvbnMnKVxuICAgICAgICApXG5cbiAgICAgICAgY29uc3QgcGVyZm9ybWFuY2VNb25pdG9yaW5nID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFxuICAgICAgICAgIFBFUkZPUk1BTkNFX01PTklUT1JJTkdcbiAgICAgICAgKVxuICAgICAgICBwZXJmb3JtYW5jZU1vbml0b3JpbmcuaW5pdChmbGFncylcblxuICAgICAgICBpZiAoZmxhZ3NbRVJST1JdKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JMb2dnaW5nID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKEVSUk9SX0xPR0dJTkcpXG4gICAgICAgICAgZXJyb3JMb2dnaW5nLnJlZ2lzdGVyTGlzdGVuZXJzKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWdTZXJ2aWNlLmdldCgnc2Vzc2lvbicpKSB7XG4gICAgICAgICAgbGV0IGxvY2FsQ29uZmlnID0gY29uZmlnU2VydmljZS5nZXRMb2NhbENvbmZpZygpXG4gICAgICAgICAgaWYgKGxvY2FsQ29uZmlnICYmIGxvY2FsQ29uZmlnLnNlc3Npb24pIHtcbiAgICAgICAgICAgIGNvbmZpZ1NlcnZpY2Uuc2V0Q29uZmlnKHtcbiAgICAgICAgICAgICAgc2Vzc2lvbjogbG9jYWxDb25maWcuc2Vzc2lvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZW5kUGFnZUxvYWQgPSAoKSA9PlxuICAgICAgICAgIGZsYWdzW1BBR0VfTE9BRF0gJiYgdGhpcy5fc2VuZFBhZ2VMb2FkTWV0cmljcygpXG5cbiAgICAgICAgaWYgKGNvbmZpZ1NlcnZpY2UuZ2V0KCdjZW50cmFsQ29uZmlnJykpIHtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBXYWl0aW5nIGZvciB0aGUgcmVtb3RlIGNvbmZpZyBiZWZvcmUgc2VuZGluZyB0aGUgcGFnZSBsb2FkIHRyYW5zYWN0aW9uXG4gICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy5mZXRjaENlbnRyYWxDb25maWcoKS50aGVuKHNlbmRQYWdlTG9hZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kUGFnZUxvYWQoKVxuICAgICAgICB9XG5cbiAgICAgICAgb2JzZXJ2ZVBhZ2VWaXNpYmlsaXR5KGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSlcbiAgICAgICAgaWYgKGZsYWdzW0VWRU5UX1RBUkdFVF0gJiYgZmxhZ3NbQ0xJQ0tdKSB7XG4gICAgICAgICAgb2JzZXJ2ZVBhZ2VDbGlja3ModHJhbnNhY3Rpb25TZXJ2aWNlKVxuICAgICAgICB9XG4gICAgICAgIG9ic2VydmVVc2VySW50ZXJhY3Rpb25zKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2Rpc2FibGUgPSB0cnVlXG4gICAgICAgIGxvZ2dpbmdTZXJ2aWNlLndhcm4oJ1JVTSBhZ2VudCBpcyBpbmFjdGl2ZScpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogYGZldGNoQ2VudHJhbENvbmZpZ2AgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGFsd2F5cyByZXNvbHZlXG4gICAqIGlmIHRoZSBpbnRlcm5hbCBjb25maWcgZmV0Y2ggZmFpbHMgdGhlIHRoZSBwcm9taXNlIHJlc29sdmVzIHRvIGB1bmRlZmluZWRgIG90aGVyd2lzZVxuICAgKiBpdCByZXNvbHZlcyB0byB0aGUgZmV0Y2hlZCBjb25maWcuXG4gICAqL1xuICBmZXRjaENlbnRyYWxDb25maWcoKSB7XG4gICAgY29uc3QgW1xuICAgICAgYXBtU2VydmVyLFxuICAgICAgbG9nZ2luZ1NlcnZpY2UsXG4gICAgICBjb25maWdTZXJ2aWNlXG4gICAgXSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShbXG4gICAgICBBUE1fU0VSVkVSLFxuICAgICAgTE9HR0lOR19TRVJWSUNFLFxuICAgICAgQ09ORklHX1NFUlZJQ0VcbiAgICBdKVxuXG4gICAgcmV0dXJuIGFwbVNlcnZlclxuICAgICAgLmZldGNoQ29uZmlnKFxuICAgICAgICBjb25maWdTZXJ2aWNlLmdldCgnc2VydmljZU5hbWUnKSxcbiAgICAgICAgY29uZmlnU2VydmljZS5nZXQoJ2Vudmlyb25tZW50JylcbiAgICAgIClcbiAgICAgIC50aGVuKGNvbmZpZyA9PiB7XG4gICAgICAgIHZhciB0cmFuc2FjdGlvblNhbXBsZVJhdGUgPSBjb25maWdbJ3RyYW5zYWN0aW9uX3NhbXBsZV9yYXRlJ11cbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uU2FtcGxlUmF0ZSkge1xuICAgICAgICAgIHRyYW5zYWN0aW9uU2FtcGxlUmF0ZSA9IE51bWJlcih0cmFuc2FjdGlvblNhbXBsZVJhdGUpXG4gICAgICAgICAgY29uc3QgY29uZmlnID0geyB0cmFuc2FjdGlvblNhbXBsZVJhdGUgfVxuICAgICAgICAgIGNvbnN0IHsgaW52YWxpZCB9ID0gY29uZmlnU2VydmljZS52YWxpZGF0ZShjb25maWcpXG4gICAgICAgICAgaWYgKGludmFsaWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb25maWdTZXJ2aWNlLnNldENvbmZpZyhjb25maWcpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHsga2V5LCB2YWx1ZSwgYWxsb3dlZCB9ID0gaW52YWxpZFswXVxuICAgICAgICAgICAgbG9nZ2luZ1NlcnZpY2Uud2FybihcbiAgICAgICAgICAgICAgYGludmFsaWQgdmFsdWUgXCIke3ZhbHVlfVwiIGZvciAke2tleX0uIEFsbG93ZWQ6ICR7YWxsb3dlZH0uYFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlnXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgbG9nZ2luZ1NlcnZpY2Uud2FybignZmFpbGVkIGZldGNoaW5nIGNvbmZpZzonLCBlcnJvcilcbiAgICAgIH0pXG4gIH1cblxuICBfc2VuZFBhZ2VMb2FkTWV0cmljcygpIHtcbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSB0cmFuc2FjdGlvbiBpcyBzZXQgaW4gdHJhbnNhY3Rpb24gc2VydmljZSB0b1xuICAgICAqIGF2b2lkIGR1cGxpY2F0aW5nIHRoZSBsb2dpYyBhdCBtdWx0aXBsZSBwbGFjZXNcbiAgICAgKi9cbiAgICBjb25zdCB0ciA9IHRoaXMuc3RhcnRUcmFuc2FjdGlvbih1bmRlZmluZWQsIFBBR0VfTE9BRCwge1xuICAgICAgbWFuYWdlZDogdHJ1ZSxcbiAgICAgIGNhblJldXNlOiB0cnVlXG4gICAgfSlcblxuICAgIGlmICghdHIpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRyLmFkZFRhc2soUEFHRV9MT0FEKVxuICAgIGNvbnN0IHNlbmRQYWdlTG9hZE1ldHJpY3MgPSAoKSA9PiB7XG4gICAgICAvLyBUaGUgcmVhc29ucyBvZiB0aGlzIHRpbWVvdXQgYXJlOlxuICAgICAgLy8gMS4gdG8gbWFrZSBzdXJlIFBlcmZvcm1hbmNlVGltaW5nLmxvYWRFdmVudEVuZCBoYXMgYSB2YWx1ZS5cbiAgICAgIC8vIDIuIHRvIG1ha2Ugc3VyZSB0aGUgYWdlbnQgaW50ZXJjZXB0cyBhbGwgdGhlIExDUCBlbnRyaWVzIHRyaWdnZXJlZCBieSB0aGUgYnJvd3NlciAoYWRkaW5nIGEgZGVsYXkgaW4gdGhlIHRpbWVvdXQpLlxuICAgICAgLy8gVGhlIGJyb3dzZXIgbWlnaHQgbmVlZCBtb3JlIHRpbWUgYWZ0ZXIgdGhlIHBhZ2Vsb2FkIGV2ZW50IHRvIHJlbmRlciBvdGhlciBlbGVtZW50cyAoZS5nLiBpbWFnZXMpLlxuICAgICAgLy8gVGhhdCdzIGltcG9ydGFudCBiZWNhdXNlIGEgTENQIGlzIG9ubHkgdHJpZ2dlcmVkIHdoZW4gdGhlIHJlbGF0ZWQgZWxlbWVudCBpcyBjb21wbGV0ZWx5IHJlbmRlcmVkLlxuICAgICAgLy8gaHR0cHM6Ly93M2MuZ2l0aHViLmlvL2xhcmdlc3QtY29udGVudGZ1bC1wYWludC8jc2VjLWFkZC1sY3AtZW50cnlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdHIucmVtb3ZlVGFzayhQQUdFX0xPQUQpLCBQQUdFX0xPQURfREVMQVkpXG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgIHNlbmRQYWdlTG9hZE1ldHJpY3MoKVxuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHNlbmRQYWdlTG9hZE1ldHJpY3MpXG4gICAgfVxuICB9XG5cbiAgb2JzZXJ2ZShuYW1lLCBmbikge1xuICAgIGNvbnN0IGNvbmZpZ1NlcnZpY2UgPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoQ09ORklHX1NFUlZJQ0UpXG4gICAgY29uZmlnU2VydmljZS5ldmVudHMub2JzZXJ2ZShuYW1lLCBmbilcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSByZXF1aXJlZCBjb25maWcga2V5cyBhcmUgaW52YWxpZCwgdGhlIGFnZW50IGlzIGRlYWN0aXZhdGVkIHdpdGhcbiAgICogbG9nZ2luZyBlcnJvciB0byB0aGUgY29uc29sZVxuICAgKlxuICAgKiB2YWxpZGF0aW9uIGVycm9yIGZvcm1hdFxuICAgKiB7XG4gICAqICBtaXNzaW5nOiBbICdrZXkxJywgJ2tleTInXSxcbiAgICogIGludmFsaWQ6IFt7XG4gICAqICAgIGtleTogJ2EnLFxuICAgKiAgICB2YWx1ZTogJ2FiY2QnLFxuICAgKiAgICBhbGxvd2VkOiAnc3RyaW5nJ1xuICAgKiAgfV0sXG4gICAqICB1bmtub3duOiBbJ2tleTMnLCAna2V5NCddXG4gICAqIH1cbiAgICovXG4gIGNvbmZpZyhjb25maWcpIHtcbiAgICBjb25zdCBbY29uZmlnU2VydmljZSwgbG9nZ2luZ1NlcnZpY2VdID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFtcbiAgICAgIENPTkZJR19TRVJWSUNFLFxuICAgICAgTE9HR0lOR19TRVJWSUNFXG4gICAgXSlcbiAgICBjb25zdCB7IG1pc3NpbmcsIGludmFsaWQsIHVua25vd24gfSA9IGNvbmZpZ1NlcnZpY2UudmFsaWRhdGUoY29uZmlnKVxuICAgIGlmICh1bmtub3duLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgICAnVW5rbm93biBjb25maWcgb3B0aW9ucyBhcmUgc3BlY2lmaWVkIGZvciBSVU0gYWdlbnQ6ICcgK1xuICAgICAgICB1bmtub3duLmpvaW4oJywgJylcbiAgICAgIGxvZ2dpbmdTZXJ2aWNlLndhcm4obWVzc2FnZSlcbiAgICB9XG5cbiAgICBpZiAobWlzc2luZy5sZW5ndGggPT09IDAgJiYgaW52YWxpZC5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbmZpZ1NlcnZpY2Uuc2V0Q29uZmlnKGNvbmZpZylcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VwYXJhdG9yID0gJywgJ1xuICAgICAgbGV0IG1lc3NhZ2UgPSBcIlJVTSBhZ2VudCBpc24ndCBjb3JyZWN0bHkgY29uZmlndXJlZC4gXCJcblxuICAgICAgaWYgKG1pc3NpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBtZXNzYWdlICs9IG1pc3Npbmcuam9pbihzZXBhcmF0b3IpICsgJyBpcyBtaXNzaW5nJ1xuICAgICAgICBpZiAoaW52YWxpZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbWVzc2FnZSArPSBzZXBhcmF0b3JcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbnZhbGlkLmZvckVhY2goKHsga2V5LCB2YWx1ZSwgYWxsb3dlZCB9LCBpbmRleCkgPT4ge1xuICAgICAgICBtZXNzYWdlICs9XG4gICAgICAgICAgYCR7a2V5fSBcIiR7dmFsdWV9XCIgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzISAoYWxsb3dlZDogJHthbGxvd2VkfSlgICtcbiAgICAgICAgICAoaW5kZXggIT09IGludmFsaWQubGVuZ3RoIC0gMSA/IHNlcGFyYXRvciA6ICcnKVxuICAgICAgfSlcbiAgICAgIGxvZ2dpbmdTZXJ2aWNlLmVycm9yKG1lc3NhZ2UpXG4gICAgICBjb25maWdTZXJ2aWNlLnNldENvbmZpZyh7IGFjdGl2ZTogZmFsc2UgfSlcbiAgICB9XG4gIH1cblxuICBzZXRVc2VyQ29udGV4dCh1c2VyQ29udGV4dCkge1xuICAgIHZhciBjb25maWdTZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKENPTkZJR19TRVJWSUNFKVxuICAgIGNvbmZpZ1NlcnZpY2Uuc2V0VXNlckNvbnRleHQodXNlckNvbnRleHQpXG4gIH1cblxuICBzZXRDdXN0b21Db250ZXh0KGN1c3RvbUNvbnRleHQpIHtcbiAgICB2YXIgY29uZmlnU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShDT05GSUdfU0VSVklDRSlcbiAgICBjb25maWdTZXJ2aWNlLnNldEN1c3RvbUNvbnRleHQoY3VzdG9tQ29udGV4dClcbiAgfVxuXG4gIGFkZExhYmVscyhsYWJlbHMpIHtcbiAgICB2YXIgY29uZmlnU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShDT05GSUdfU0VSVklDRSlcbiAgICBjb25maWdTZXJ2aWNlLmFkZExhYmVscyhsYWJlbHMpXG4gIH1cblxuICAvLyBTaG91bGQgY2FsbCB0aGlzIG1ldGhvZCBiZWZvcmUgJ2xvYWQnIGV2ZW50IG9uIHdpbmRvdyBpcyBmaXJlZFxuICBzZXRJbml0aWFsUGFnZUxvYWROYW1lKG5hbWUpIHtcbiAgICBjb25zdCBjb25maWdTZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKENPTkZJR19TRVJWSUNFKVxuICAgIGNvbmZpZ1NlcnZpY2Uuc2V0Q29uZmlnKHtcbiAgICAgIHBhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lOiBuYW1lXG4gICAgfSlcbiAgfVxuXG4gIHN0YXJ0VHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25TZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFxuICAgICAgICBUUkFOU0FDVElPTl9TRVJWSUNFXG4gICAgICApXG4gICAgICByZXR1cm4gdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0VHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICBzdGFydFNwYW4obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25TZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFxuICAgICAgICBUUkFOU0FDVElPTl9TRVJWSUNFXG4gICAgICApXG4gICAgICByZXR1cm4gdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0U3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIGdldEN1cnJlbnRUcmFuc2FjdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc0VuYWJsZWQoKSkge1xuICAgICAgdmFyIHRyYW5zYWN0aW9uU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShcbiAgICAgICAgVFJBTlNBQ1RJT05fU0VSVklDRVxuICAgICAgKVxuICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uU2VydmljZS5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKVxuICAgIH1cbiAgfVxuXG4gIGNhcHR1cmVFcnJvcihlcnJvcikge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB2YXIgZXJyb3JMb2dnaW5nID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKEVSUk9SX0xPR0dJTkcpXG4gICAgICByZXR1cm4gZXJyb3JMb2dnaW5nLmxvZ0Vycm9yKGVycm9yKVxuICAgIH1cbiAgfVxuXG4gIGFkZEZpbHRlcihmbikge1xuICAgIHZhciBjb25maWdTZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKENPTkZJR19TRVJWSUNFKVxuICAgIGNvbmZpZ1NlcnZpY2UuYWRkRmlsdGVyKGZuKVxuICB9XG59XG4iLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24gKFVNRCkgdG8gc3VwcG9ydCBBTUQsIENvbW1vbkpTL05vZGUuanMsIFJoaW5vLCBhbmQgYnJvd3NlcnMuXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKCdlcnJvci1zdGFjay1wYXJzZXInLCBbJ3N0YWNrZnJhbWUnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3N0YWNrZnJhbWUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5FcnJvclN0YWNrUGFyc2VyID0gZmFjdG9yeShyb290LlN0YWNrRnJhbWUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlcihTdGFja0ZyYW1lKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEZJUkVGT1hfU0FGQVJJX1NUQUNLX1JFR0VYUCA9IC8oXnxAKVxcUytcXDpcXGQrLztcbiAgICB2YXIgQ0hST01FX0lFX1NUQUNLX1JFR0VYUCA9IC9eXFxzKmF0IC4qKFxcUytcXDpcXGQrfFxcKG5hdGl2ZVxcKSkvbTtcbiAgICB2YXIgU0FGQVJJX05BVElWRV9DT0RFX1JFR0VYUCA9IC9eKGV2YWxAKT8oXFxbbmF0aXZlIGNvZGVcXF0pPyQvO1xuXG4gICAgZnVuY3Rpb24gX21hcChhcnJheSwgZm4sIHRoaXNBcmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUubWFwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkubWFwKGZuLCB0aGlzQXJnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgQXJyYXkoYXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRbaV0gPSBmbi5jYWxsKHRoaXNBcmcsIGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGFycmF5LCBmbiwgdGhpc0FyZykge1xuICAgICAgICBpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZS5maWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5maWx0ZXIoZm4sIHRoaXNBcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChmbi5jYWxsKHRoaXNBcmcsIGFycmF5W2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFycmF5LCB0YXJnZXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YodGFyZ2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyYXlbaV0gPT09IHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2l2ZW4gYW4gRXJyb3Igb2JqZWN0LCBleHRyYWN0IHRoZSBtb3N0IGluZm9ybWF0aW9uIGZyb20gaXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gb2YgU3RhY2tGcmFtZXNcbiAgICAgICAgICovXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZShlcnJvcikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnJvci5zdGFja3RyYWNlICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXJyb3JbJ29wZXJhI3NvdXJjZWxvYyddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmEoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGFjayAmJiBlcnJvci5zdGFjay5tYXRjaChDSFJPTUVfSUVfU1RBQ0tfUkVHRVhQKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlVjhPcklFKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUZGT3JTYWZhcmkoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBwYXJzZSBnaXZlbiBFcnJvciBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBTZXBhcmF0ZSBsaW5lIGFuZCBjb2x1bW4gbnVtYmVycyBmcm9tIGEgc3RyaW5nIG9mIHRoZSBmb3JtOiAoVVJJOkxpbmU6Q29sdW1uKVxuICAgICAgICBleHRyYWN0TG9jYXRpb246IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJGV4dHJhY3RMb2NhdGlvbih1cmxMaWtlKSB7XG4gICAgICAgICAgICAvLyBGYWlsLWZhc3QgYnV0IHJldHVybiBsb2NhdGlvbnMgbGlrZSBcIihuYXRpdmUpXCJcbiAgICAgICAgICAgIGlmICh1cmxMaWtlLmluZGV4T2YoJzonKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3VybExpa2VdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVnRXhwID0gLyguKz8pKD86XFw6KFxcZCspKT8oPzpcXDooXFxkKykpPyQvO1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gcmVnRXhwLmV4ZWModXJsTGlrZS5yZXBsYWNlKC9bXFwoXFwpXS9nLCAnJykpO1xuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMl0gfHwgdW5kZWZpbmVkLCBwYXJ0c1szXSB8fCB1bmRlZmluZWRdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlVjhPcklFOiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZVY4T3JJRShlcnJvcikge1xuICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gX2ZpbHRlcihlcnJvci5zdGFjay5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFsaW5lLm1hdGNoKENIUk9NRV9JRV9TVEFDS19SRUdFWFApO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfbWFwKGZpbHRlcmVkLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmUuaW5kZXhPZignKGV2YWwgJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaHJvdyBhd2F5IGV2YWwgaW5mb3JtYXRpb24gdW50aWwgd2UgaW1wbGVtZW50IHN0YWNrdHJhY2UuanMvc3RhY2tmcmFtZSM4XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoL2V2YWwgY29kZS9nLCAnZXZhbCcpLnJlcGxhY2UoLyhcXChldmFsIGF0IFteXFwoKV0qKXwoXFwpXFwsLiokKS9nLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnJlcGxhY2UoL15cXHMrLywgJycpLnJlcGxhY2UoL1xcKGV2YWwgY29kZS9nLCAnKCcpLnNwbGl0KC9cXHMrLykuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uUGFydHMgPSB0aGlzLmV4dHJhY3RMb2NhdGlvbih0b2tlbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSB0b2tlbnMuam9pbignICcpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSBfaW5kZXhPZihbJ2V2YWwnLCAnPGFub255bW91cz4nXSwgbG9jYXRpb25QYXJ0c1swXSkgPiAtMSA/IHVuZGVmaW5lZCA6IGxvY2F0aW9uUGFydHNbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFN0YWNrRnJhbWUoZnVuY3Rpb25OYW1lLCB1bmRlZmluZWQsIGZpbGVOYW1lLCBsb2NhdGlvblBhcnRzWzFdLCBsb2NhdGlvblBhcnRzWzJdLCBsaW5lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlRkZPclNhZmFyaTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VGRk9yU2FmYXJpKGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfZmlsdGVyKGVycm9yLnN0YWNrLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhbGluZS5tYXRjaChTQUZBUklfTkFUSVZFX0NPREVfUkVHRVhQKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gX21hcChmaWx0ZXJlZCwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIC8vIFRocm93IGF3YXkgZXZhbCBpbmZvcm1hdGlvbiB1bnRpbCB3ZSBpbXBsZW1lbnQgc3RhY2t0cmFjZS5qcy9zdGFja2ZyYW1lIzhcbiAgICAgICAgICAgICAgICBpZiAobGluZS5pbmRleE9mKCcgPiBldmFsJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC8gbGluZSAoXFxkKykoPzogPiBldmFsIGxpbmUgXFxkKykqID4gZXZhbFxcOlxcZCtcXDpcXGQrL2csICc6JDEnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZS5pbmRleE9mKCdAJykgPT09IC0xICYmIGxpbmUuaW5kZXhPZignOicpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZXZhbCBmcmFtZXMgb25seSBoYXZlIGZ1bmN0aW9uIG5hbWVzIGFuZCBub3RoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGFja0ZyYW1lKGxpbmUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnNwbGl0KCdAJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvblBhcnRzID0gdGhpcy5leHRyYWN0TG9jYXRpb24odG9rZW5zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IHRva2Vucy5qb2luKCdAJykgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFN0YWNrRnJhbWUoZnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25QYXJ0c1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBhcnRzWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VPcGVyYTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VPcGVyYShlKSB7XG4gICAgICAgICAgICBpZiAoIWUuc3RhY2t0cmFjZSB8fCAoZS5tZXNzYWdlLmluZGV4T2YoJ1xcbicpID4gLTEgJiZcbiAgICAgICAgICAgICAgICBlLm1lc3NhZ2Uuc3BsaXQoJ1xcbicpLmxlbmd0aCA+IGUuc3RhY2t0cmFjZS5zcGxpdCgnXFxuJykubGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmE5KGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghZS5zdGFjaykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmExMChlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VPcGVyYTExKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlT3BlcmE5OiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZU9wZXJhOShlKSB7XG4gICAgICAgICAgICB2YXIgbGluZVJFID0gL0xpbmUgKFxcZCspLipzY3JpcHQgKD86aW4gKT8oXFxTKykvaTtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IGUubWVzc2FnZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAyLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGxpbmVSRS5leGVjKGxpbmVzW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFN0YWNrRnJhbWUodW5kZWZpbmVkLCB1bmRlZmluZWQsIG1hdGNoWzJdLCBtYXRjaFsxXSwgdW5kZWZpbmVkLCBsaW5lc1tpXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZU9wZXJhMTA6IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJHBhcnNlT3BlcmExMChlKSB7XG4gICAgICAgICAgICB2YXIgbGluZVJFID0gL0xpbmUgKFxcZCspLipzY3JpcHQgKD86aW4gKT8oXFxTKykoPzo6IEluIGZ1bmN0aW9uIChcXFMrKSk/JC9pO1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFja3RyYWNlLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gbGluZVJFLmV4ZWMobGluZXNbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTdGFja0ZyYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzNdIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE9wZXJhIDEwLjY1KyBFcnJvci5zdGFjayB2ZXJ5IHNpbWlsYXIgdG8gRkYvU2FmYXJpXG4gICAgICAgIHBhcnNlT3BlcmExMTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VPcGVyYTExKGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfZmlsdGVyKGVycm9yLnN0YWNrLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIWxpbmUubWF0Y2goRklSRUZPWF9TQUZBUklfU1RBQ0tfUkVHRVhQKSAmJiAhbGluZS5tYXRjaCgvXkVycm9yIGNyZWF0ZWQgYXQvKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gX21hcChmaWx0ZXJlZCwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnNwbGl0KCdAJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uUGFydHMgPSB0aGlzLmV4dHJhY3RMb2NhdGlvbih0b2tlbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbkNhbGwgPSAodG9rZW5zLnNoaWZ0KCkgfHwgJycpO1xuICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88YW5vbnltb3VzIGZ1bmN0aW9uKDogKFxcdyspKT8+LywgJyQyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXChbXlxcKV0qXFwpL2csICcnKSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3NSYXc7XG4gICAgICAgICAgICAgICAgaWYgKGZ1bmN0aW9uQ2FsbC5tYXRjaCgvXFwoKFteXFwpXSopXFwpLykpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1JhdyA9IGZ1bmN0aW9uQ2FsbC5yZXBsYWNlKC9eW15cXChdK1xcKChbXlxcKV0qKVxcKSQvLCAnJDEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSAoYXJnc1JhdyA9PT0gdW5kZWZpbmVkIHx8IGFyZ3NSYXcgPT09ICdbYXJndW1lbnRzIG5vdCBhdmFpbGFibGVdJykgP1xuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQgOiBhcmdzUmF3LnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGFja0ZyYW1lKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMF0sXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMV0sXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMl0sXG4gICAgICAgICAgICAgICAgICAgIGxpbmUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xufSkpO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogVGhlIEZPUk1BVF9CSU5BUlkgZm9ybWF0IHJlcHJlc2VudHMgU3BhbkNvbnRleHRzIGluIGFuIG9wYXF1ZSBiaW5hcnlcbiAqIGNhcnJpZXIuXG4gKlxuICogVHJhY2VyLmluamVjdCgpIHdpbGwgc2V0IHRoZSBidWZmZXIgZmllbGQgdG8gYW4gQXJyYXktbGlrZSAoQXJyYXksXG4gKiBBcnJheUJ1ZmZlciwgb3IgVHlwZWRCdWZmZXIpIG9iamVjdCBjb250YWluaW5nIHRoZSBpbmplY3RlZCBiaW5hcnkgZGF0YS5cbiAqIEFueSB2YWxpZCBPYmplY3QgY2FuIGJlIHVzZWQgYXMgbG9uZyBhcyB0aGUgYnVmZmVyIGZpZWxkIG9mIHRoZSBvYmplY3RcbiAqIGNhbiBiZSBzZXQuXG4gKlxuICogVHJhY2VyLmV4dHJhY3QoKSB3aWxsIGxvb2sgZm9yIGBjYXJyaWVyLmJ1ZmZlcmAsIGFuZCB0aGF0IGZpZWxkIGlzXG4gKiBleHBlY3RlZCB0byBiZSBhbiBBcnJheS1saWtlIG9iamVjdCAoQXJyYXksIEFycmF5QnVmZmVyLCBvclxuICogVHlwZWRCdWZmZXIpLlxuICovXG5leHBvcnRzLkZPUk1BVF9CSU5BUlkgPSAnYmluYXJ5Jztcbi8qKlxuICogVGhlIEZPUk1BVF9URVhUX01BUCBmb3JtYXQgcmVwcmVzZW50cyBTcGFuQ29udGV4dHMgdXNpbmcgYVxuICogc3RyaW5nLT5zdHJpbmcgbWFwIChiYWNrZWQgYnkgYSBKYXZhc2NyaXB0IE9iamVjdCkgYXMgYSBjYXJyaWVyLlxuICpcbiAqIE5PVEU6IFVubGlrZSBGT1JNQVRfSFRUUF9IRUFERVJTLCBGT1JNQVRfVEVYVF9NQVAgcGxhY2VzIG5vIHJlc3RyaWN0aW9uc1xuICogb24gdGhlIGNoYXJhY3RlcnMgdXNlZCBpbiBlaXRoZXIgdGhlIGtleXMgb3IgdGhlIHZhbHVlcyBvZiB0aGUgbWFwXG4gKiBlbnRyaWVzLlxuICpcbiAqIFRoZSBGT1JNQVRfVEVYVF9NQVAgY2FycmllciBtYXAgbWF5IGNvbnRhaW4gdW5yZWxhdGVkIGRhdGEgKGUuZy4sXG4gKiBhcmJpdHJhcnkgZ1JQQyBtZXRhZGF0YSk7IGFzIHN1Y2gsIHRoZSBUcmFjZXIgaW1wbGVtZW50YXRpb24gc2hvdWxkIHVzZVxuICogYSBwcmVmaXggb3Igb3RoZXIgY29udmVudGlvbiB0byBkaXN0aW5ndWlzaCBUcmFjZXItc3BlY2lmaWMga2V5OnZhbHVlXG4gKiBwYWlycy5cbiAqL1xuZXhwb3J0cy5GT1JNQVRfVEVYVF9NQVAgPSAndGV4dF9tYXAnO1xuLyoqXG4gKiBUaGUgRk9STUFUX0hUVFBfSEVBREVSUyBmb3JtYXQgcmVwcmVzZW50cyBTcGFuQ29udGV4dHMgdXNpbmcgYVxuICogY2hhcmFjdGVyLXJlc3RyaWN0ZWQgc3RyaW5nLT5zdHJpbmcgbWFwIChiYWNrZWQgYnkgYSBKYXZhc2NyaXB0IE9iamVjdClcbiAqIGFzIGEgY2Fycmllci5cbiAqXG4gKiBLZXlzIGFuZCB2YWx1ZXMgaW4gdGhlIEZPUk1BVF9IVFRQX0hFQURFUlMgY2FycmllciBtdXN0IGJlIHN1aXRhYmxlIGZvclxuICogdXNlIGFzIEhUVFAgaGVhZGVycyAod2l0aG91dCBtb2RpZmljYXRpb24gb3IgZnVydGhlciBlc2NhcGluZykuIFRoYXQgaXMsXG4gKiB0aGUga2V5cyBoYXZlIGEgZ3JlYXRseSByZXN0cmljdGVkIGNoYXJhY3RlciBzZXQsIGNhc2luZyBmb3IgdGhlIGtleXNcbiAqIG1heSBub3QgYmUgcHJlc2VydmVkIGJ5IHZhcmlvdXMgaW50ZXJtZWRpYXJpZXMsIGFuZCB0aGUgdmFsdWVzIHNob3VsZCBiZVxuICogVVJMLWVzY2FwZWQuXG4gKlxuICogVGhlIEZPUk1BVF9IVFRQX0hFQURFUlMgY2FycmllciBtYXAgbWF5IGNvbnRhaW4gdW5yZWxhdGVkIGRhdGEgKGUuZy4sXG4gKiBhcmJpdHJhcnkgSFRUUCBoZWFkZXJzKTsgYXMgc3VjaCwgdGhlIFRyYWNlciBpbXBsZW1lbnRhdGlvbiBzaG91bGQgdXNlIGFcbiAqIHByZWZpeCBvciBvdGhlciBjb252ZW50aW9uIHRvIGRpc3Rpbmd1aXNoIFRyYWNlci1zcGVjaWZpYyBrZXk6dmFsdWVcbiAqIHBhaXJzLlxuICovXG5leHBvcnRzLkZPUk1BVF9IVFRQX0hFQURFUlMgPSAnaHR0cF9oZWFkZXJzJztcbi8qKlxuICogQSBTcGFuIG1heSBiZSB0aGUgXCJjaGlsZCBvZlwiIGEgcGFyZW50IFNwYW4uIEluIGEg4oCcY2hpbGQgb2bigJ0gcmVmZXJlbmNlLFxuICogdGhlIHBhcmVudCBTcGFuIGRlcGVuZHMgb24gdGhlIGNoaWxkIFNwYW4gaW4gc29tZSBjYXBhY2l0eS5cbiAqXG4gKiBTZWUgbW9yZSBhYm91dCByZWZlcmVuY2UgdHlwZXMgYXQgaHR0cHM6Ly9naXRodWIuY29tL29wZW50cmFjaW5nL3NwZWNpZmljYXRpb25cbiAqL1xuZXhwb3J0cy5SRUZFUkVOQ0VfQ0hJTERfT0YgPSAnY2hpbGRfb2YnO1xuLyoqXG4gKiBTb21lIHBhcmVudCBTcGFucyBkbyBub3QgZGVwZW5kIGluIGFueSB3YXkgb24gdGhlIHJlc3VsdCBvZiB0aGVpciBjaGlsZFxuICogU3BhbnMuIEluIHRoZXNlIGNhc2VzLCB3ZSBzYXkgbWVyZWx5IHRoYXQgdGhlIGNoaWxkIFNwYW4g4oCcZm9sbG93cyBmcm9t4oCdXG4gKiB0aGUgcGFyZW50IFNwYW4gaW4gYSBjYXVzYWwgc2Vuc2UuXG4gKlxuICogU2VlIG1vcmUgYWJvdXQgcmVmZXJlbmNlIHR5cGVzIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVudHJhY2luZy9zcGVjaWZpY2F0aW9uXG4gKi9cbmV4cG9ydHMuUkVGRVJFTkNFX0ZPTExPV1NfRlJPTSA9ICdmb2xsb3dzX2Zyb20nO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uc3RhbnRzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbnZhciByZWZlcmVuY2VfMSA9IHJlcXVpcmUoXCIuL3JlZmVyZW5jZVwiKTtcbnZhciBzcGFuXzEgPSByZXF1aXJlKFwiLi9zcGFuXCIpO1xuLyoqXG4gKiBSZXR1cm4gYSBuZXcgUkVGRVJFTkNFX0NISUxEX09GIHJlZmVyZW5jZS5cbiAqXG4gKiBAcGFyYW0ge1NwYW5Db250ZXh0fSBzcGFuQ29udGV4dCAtIHRoZSBwYXJlbnQgU3BhbkNvbnRleHQgaW5zdGFuY2UgdG9cbiAqICAgICAgICByZWZlcmVuY2UuXG4gKiBAcmV0dXJuIGEgUkVGRVJFTkNFX0NISUxEX09GIHJlZmVyZW5jZSBwb2ludGluZyB0byBgc3BhbkNvbnRleHRgXG4gKi9cbmZ1bmN0aW9uIGNoaWxkT2Yoc3BhbkNvbnRleHQpIHtcbiAgICAvLyBBbGxvdyB0aGUgdXNlciB0byBwYXNzIGEgU3BhbiBpbnN0ZWFkIG9mIGEgU3BhbkNvbnRleHRcbiAgICBpZiAoc3BhbkNvbnRleHQgaW5zdGFuY2VvZiBzcGFuXzEuZGVmYXVsdCkge1xuICAgICAgICBzcGFuQ29udGV4dCA9IHNwYW5Db250ZXh0LmNvbnRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyByZWZlcmVuY2VfMS5kZWZhdWx0KENvbnN0YW50cy5SRUZFUkVOQ0VfQ0hJTERfT0YsIHNwYW5Db250ZXh0KTtcbn1cbmV4cG9ydHMuY2hpbGRPZiA9IGNoaWxkT2Y7XG4vKipcbiAqIFJldHVybiBhIG5ldyBSRUZFUkVOQ0VfRk9MTE9XU19GUk9NIHJlZmVyZW5jZS5cbiAqXG4gKiBAcGFyYW0ge1NwYW5Db250ZXh0fSBzcGFuQ29udGV4dCAtIHRoZSBwYXJlbnQgU3BhbkNvbnRleHQgaW5zdGFuY2UgdG9cbiAqICAgICAgICByZWZlcmVuY2UuXG4gKiBAcmV0dXJuIGEgUkVGRVJFTkNFX0ZPTExPV1NfRlJPTSByZWZlcmVuY2UgcG9pbnRpbmcgdG8gYHNwYW5Db250ZXh0YFxuICovXG5mdW5jdGlvbiBmb2xsb3dzRnJvbShzcGFuQ29udGV4dCkge1xuICAgIC8vIEFsbG93IHRoZSB1c2VyIHRvIHBhc3MgYSBTcGFuIGluc3RlYWQgb2YgYSBTcGFuQ29udGV4dFxuICAgIGlmIChzcGFuQ29udGV4dCBpbnN0YW5jZW9mIHNwYW5fMS5kZWZhdWx0KSB7XG4gICAgICAgIHNwYW5Db250ZXh0ID0gc3BhbkNvbnRleHQuY29udGV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IHJlZmVyZW5jZV8xLmRlZmF1bHQoQ29uc3RhbnRzLlJFRkVSRU5DRV9GT0xMT1dTX0ZST00sIHNwYW5Db250ZXh0KTtcbn1cbmV4cG9ydHMuZm9sbG93c0Zyb20gPSBmb2xsb3dzRnJvbTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZ1bmN0aW9ucy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBzcGFuXzEgPSByZXF1aXJlKFwiLi9zcGFuXCIpO1xudmFyIHNwYW5fY29udGV4dF8xID0gcmVxdWlyZShcIi4vc3Bhbl9jb250ZXh0XCIpO1xudmFyIHRyYWNlcl8xID0gcmVxdWlyZShcIi4vdHJhY2VyXCIpO1xuZXhwb3J0cy50cmFjZXIgPSBudWxsO1xuZXhwb3J0cy5zcGFuQ29udGV4dCA9IG51bGw7XG5leHBvcnRzLnNwYW4gPSBudWxsO1xuLy8gRGVmZXJyZWQgaW5pdGlhbGl6YXRpb24gdG8gYXZvaWQgYSBkZXBlbmRlbmN5IGN5Y2xlIHdoZXJlIFRyYWNlciBkZXBlbmRzIG9uXG4vLyBTcGFuIHdoaWNoIGRlcGVuZHMgb24gdGhlIG5vb3AgdHJhY2VyLlxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBleHBvcnRzLnRyYWNlciA9IG5ldyB0cmFjZXJfMS5kZWZhdWx0KCk7XG4gICAgZXhwb3J0cy5zcGFuID0gbmV3IHNwYW5fMS5kZWZhdWx0KCk7XG4gICAgZXhwb3J0cy5zcGFuQ29udGV4dCA9IG5ldyBzcGFuX2NvbnRleHRfMS5kZWZhdWx0KCk7XG59XG5leHBvcnRzLmluaXRpYWxpemUgPSBpbml0aWFsaXplO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bm9vcC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBzcGFuXzEgPSByZXF1aXJlKFwiLi9zcGFuXCIpO1xuLyoqXG4gKiBSZWZlcmVuY2UgcGFpcnMgYSByZWZlcmVuY2UgdHlwZSBjb25zdGFudCAoZS5nLiwgUkVGRVJFTkNFX0NISUxEX09GIG9yXG4gKiBSRUZFUkVOQ0VfRk9MTE9XU19GUk9NKSB3aXRoIHRoZSBTcGFuQ29udGV4dCBpdCBwb2ludHMgdG8uXG4gKlxuICogU2VlIHRoZSBleHBvcnRlZCBjaGlsZE9mKCkgYW5kIGZvbGxvd3NGcm9tKCkgZnVuY3Rpb25zIGF0IHRoZSBwYWNrYWdlIGxldmVsLlxuICovXG52YXIgUmVmZXJlbmNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgYSBuZXcgUmVmZXJlbmNlIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgUmVmZXJlbmNlIHR5cGUgY29uc3RhbnQgKGUuZy4sXG4gICAgICogICAgICAgIFJFRkVSRU5DRV9DSElMRF9PRiBvciBSRUZFUkVOQ0VfRk9MTE9XU19GUk9NKS5cbiAgICAgKiBAcGFyYW0ge1NwYW5Db250ZXh0fSByZWZlcmVuY2VkQ29udGV4dCAtIHRoZSBTcGFuQ29udGV4dCBiZWluZyByZWZlcnJlZFxuICAgICAqICAgICAgICB0by4gQXMgYSBjb252ZW5pZW5jZSwgYSBTcGFuIGluc3RhbmNlIG1heSBiZSBwYXNzZWQgaW4gaW5zdGVhZFxuICAgICAqICAgICAgICAoaW4gd2hpY2ggY2FzZSBpdHMgLmNvbnRleHQoKSBpcyB1c2VkIGhlcmUpLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFJlZmVyZW5jZSh0eXBlLCByZWZlcmVuY2VkQ29udGV4dCkge1xuICAgICAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5fcmVmZXJlbmNlZENvbnRleHQgPSAocmVmZXJlbmNlZENvbnRleHQgaW5zdGFuY2VvZiBzcGFuXzEuZGVmYXVsdCA/XG4gICAgICAgICAgICByZWZlcmVuY2VkQ29udGV4dC5jb250ZXh0KCkgOlxuICAgICAgICAgICAgcmVmZXJlbmNlZENvbnRleHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBSZWZlcmVuY2UgdHlwZSAoZS5nLiwgUkVGRVJFTkNFX0NISUxEX09GIG9yXG4gICAgICogICAgICAgICBSRUZFUkVOQ0VfRk9MTE9XU19GUk9NKS5cbiAgICAgKi9cbiAgICBSZWZlcmVuY2UucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90eXBlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiB7U3BhbkNvbnRleHR9IFRoZSBTcGFuQ29udGV4dCBiZWluZyByZWZlcnJlZCB0byAoZS5nLiwgdGhlXG4gICAgICogICAgICAgICBwYXJlbnQgaW4gYSBSRUZFUkVOQ0VfQ0hJTERfT0YgUmVmZXJlbmNlKS5cbiAgICAgKi9cbiAgICBSZWZlcmVuY2UucHJvdG90eXBlLnJlZmVyZW5jZWRDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlZENvbnRleHQ7XG4gICAgfTtcbiAgICByZXR1cm4gUmVmZXJlbmNlO1xufSgpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFJlZmVyZW5jZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZmVyZW5jZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBub29wID0gcmVxdWlyZShcIi4vbm9vcFwiKTtcbi8qKlxuICogU3BhbiByZXByZXNlbnRzIGEgbG9naWNhbCB1bml0IG9mIHdvcmsgYXMgcGFydCBvZiBhIGJyb2FkZXIgVHJhY2UuIEV4YW1wbGVzXG4gKiBvZiBzcGFuIG1pZ2h0IGluY2x1ZGUgcmVtb3RlIHByb2NlZHVyZSBjYWxscyBvciBhIGluLXByb2Nlc3MgZnVuY3Rpb24gY2FsbHNcbiAqIHRvIHN1Yi1jb21wb25lbnRzLiBBIFRyYWNlIGhhcyBhIHNpbmdsZSwgdG9wLWxldmVsIFwicm9vdFwiIFNwYW4gdGhhdCBpbiB0dXJuXG4gKiBtYXkgaGF2ZSB6ZXJvIG9yIG1vcmUgY2hpbGQgU3BhbnMsIHdoaWNoIGluIHR1cm4gbWF5IGhhdmUgY2hpbGRyZW4uXG4gKi9cbnZhciBTcGFuID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNwYW4oKSB7XG4gICAgfVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvLyBPcGVuVHJhY2luZyBBUEkgbWV0aG9kc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBTcGFuQ29udGV4dCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoaXMgU3Bhbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1NwYW5Db250ZXh0fVxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLmNvbnRleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBUcmFjZXIgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoaXMgU3Bhbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1RyYWNlcn1cbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS50cmFjZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFjZXIoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN0cmluZyBuYW1lIGZvciB0aGUgbG9naWNhbCBvcGVyYXRpb24gdGhpcyBzcGFuIHJlcHJlc2VudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLnNldE9wZXJhdGlvbk5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB0aGlzLl9zZXRPcGVyYXRpb25OYW1lKG5hbWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNldHMgYSBrZXk6dmFsdWUgcGFpciBvbiB0aGlzIFNwYW4gdGhhdCBhbHNvIHByb3BhZ2F0ZXMgdG8gZnV0dXJlXG4gICAgICogY2hpbGRyZW4gb2YgdGhlIGFzc29jaWF0ZWQgU3Bhbi5cbiAgICAgKlxuICAgICAqIHNldEJhZ2dhZ2VJdGVtKCkgZW5hYmxlcyBwb3dlcmZ1bCBmdW5jdGlvbmFsaXR5IGdpdmVuIGEgZnVsbC1zdGFja1xuICAgICAqIG9wZW50cmFjaW5nIGludGVncmF0aW9uIChlLmcuLCBhcmJpdHJhcnkgYXBwbGljYXRpb24gZGF0YSBmcm9tIGEgd2ViXG4gICAgICogY2xpZW50IGNhbiBtYWtlIGl0LCB0cmFuc3BhcmVudGx5LCBhbGwgdGhlIHdheSBpbnRvIHRoZSBkZXB0aHMgb2YgYVxuICAgICAqIHN0b3JhZ2Ugc3lzdGVtKSwgYW5kIHdpdGggaXQgc29tZSBwb3dlcmZ1bCBjb3N0czogdXNlIHRoaXMgZmVhdHVyZSB3aXRoXG4gICAgICogY2FyZS5cbiAgICAgKlxuICAgICAqIElNUE9SVEFOVCBOT1RFICMxOiBzZXRCYWdnYWdlSXRlbSgpIHdpbGwgb25seSBwcm9wYWdhdGUgYmFnZ2FnZSBpdGVtcyB0b1xuICAgICAqICpmdXR1cmUqIGNhdXNhbCBkZXNjZW5kYW50cyBvZiB0aGUgYXNzb2NpYXRlZCBTcGFuLlxuICAgICAqXG4gICAgICogSU1QT1JUQU5UIE5PVEUgIzI6IFVzZSB0aGlzIHRob3VnaHRmdWxseSBhbmQgd2l0aCBjYXJlLiBFdmVyeSBrZXkgYW5kXG4gICAgICogdmFsdWUgaXMgY29waWVkIGludG8gZXZlcnkgbG9jYWwgKmFuZCByZW1vdGUqIGNoaWxkIG9mIHRoZSBhc3NvY2lhdGVkXG4gICAgICogU3BhbiwgYW5kIHRoYXQgY2FuIGFkZCB1cCB0byBhIGxvdCBvZiBuZXR3b3JrIGFuZCBjcHUgb3ZlcmhlYWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgU3Bhbi5wcm90b3R5cGUuc2V0QmFnZ2FnZUl0ZW0gPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zZXRCYWdnYWdlSXRlbShrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBmb3IgYSBiYWdnYWdlIGl0ZW0gZ2l2ZW4gaXRzIGtleS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30ga2V5XG4gICAgICogICAgICAgICBUaGUga2V5IGZvciB0aGUgZ2l2ZW4gdHJhY2UgYXR0cmlidXRlLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKiAgICAgICAgIFN0cmluZyB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSwgb3IgdW5kZWZpbmVkIGlmIHRoZSBrZXkgZG9lcyBub3RcbiAgICAgKiAgICAgICAgIGNvcnJlc3BvbmQgdG8gYSBzZXQgdHJhY2UgYXR0cmlidXRlLlxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLmdldEJhZ2dhZ2VJdGVtID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0QmFnZ2FnZUl0ZW0oa2V5KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZHMgYSBzaW5nbGUgdGFnIHRvIHRoZSBzcGFuLiAgU2VlIGBhZGRUYWdzKClgIGZvciBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLnNldFRhZyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIC8vIE5PVEU6IHRoZSBjYWxsIGlzIG5vcm1hbGl6ZWQgdG8gYSBjYWxsIHRvIF9hZGRUYWdzKClcbiAgICAgICAgdGhpcy5fYWRkVGFncygoX2EgPSB7fSwgX2Fba2V5XSA9IHZhbHVlLCBfYSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgdmFyIF9hO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4ga2V5IHZhbHVlIHBhaXJzIHRvIHRoZSBzZXQgb2Ygc3BhbiB0YWdzLlxuICAgICAqXG4gICAgICogTXVsdGlwbGUgY2FsbHMgdG8gYWRkVGFncygpIHJlc3VsdHMgaW4gdGhlIHRhZ3MgYmVpbmcgdGhlIHN1cGVyc2V0IG9mXG4gICAgICogYWxsIGNhbGxzLlxuICAgICAqXG4gICAgICogVGhlIGJlaGF2aW9yIG9mIHNldHRpbmcgdGhlIHNhbWUga2V5IG11bHRpcGxlIHRpbWVzIG9uIHRoZSBzYW1lIHNwYW5cbiAgICAgKiBpcyB1bmRlZmluZWQuXG4gICAgICpcbiAgICAgKiBUaGUgc3VwcG9ydGVkIHR5cGUgb2YgdGhlIHZhbHVlcyBpcyBpbXBsZW1lbnRhdGlvbi1kZXBlbmRlbnQuXG4gICAgICogSW1wbGVtZW50YXRpb25zIGFyZSBleHBlY3RlZCB0byBzYWZlbHkgaGFuZGxlIGFsbCB0eXBlcyBvZiB2YWx1ZXMgYnV0XG4gICAgICogbWF5IGNob29zZSB0byBpZ25vcmUgdW5yZWNvZ25pemVkIC8gdW5oYW5kbGUtYWJsZSB2YWx1ZXMgKGUuZy4gb2JqZWN0c1xuICAgICAqIHdpdGggY3ljbGljIHJlZmVyZW5jZXMsIGZ1bmN0aW9uIG9iamVjdHMpLlxuICAgICAqXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gICAgICovXG4gICAgU3Bhbi5wcm90b3R5cGUuYWRkVGFncyA9IGZ1bmN0aW9uIChrZXlWYWx1ZU1hcCkge1xuICAgICAgICB0aGlzLl9hZGRUYWdzKGtleVZhbHVlTWFwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBZGQgYSBsb2cgcmVjb3JkIHRvIHRoaXMgU3Bhbiwgb3B0aW9uYWxseSBhdCBhIHVzZXItcHJvdmlkZWQgdGltZXN0YW1wLlxuICAgICAqXG4gICAgICogRm9yIGV4YW1wbGU6XG4gICAgICpcbiAgICAgKiAgICAgc3Bhbi5sb2coe1xuICAgICAqICAgICAgICAgc2l6ZTogcnBjLnNpemUoKSwgIC8vIG51bWVyaWMgdmFsdWVcbiAgICAgKiAgICAgICAgIFVSSTogcnBjLlVSSSgpLCAgLy8gc3RyaW5nIHZhbHVlXG4gICAgICogICAgICAgICBwYXlsb2FkOiBycGMucGF5bG9hZCgpLCAgLy8gT2JqZWN0IHZhbHVlXG4gICAgICogICAgICAgICBcImtleXMgY2FuIGJlIGFyYml0cmFyeSBzdHJpbmdzXCI6IHJwYy5mb28oKSxcbiAgICAgKiAgICAgfSk7XG4gICAgICpcbiAgICAgKiAgICAgc3Bhbi5sb2coe1xuICAgICAqICAgICAgICAgXCJlcnJvci5kZXNjcmlwdGlvblwiOiBzb21lRXJyb3IuZGVzY3JpcHRpb24oKSxcbiAgICAgKiAgICAgfSwgc29tZUVycm9yLnRpbWVzdGFtcE1pbGxpcygpKTtcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBrZXlWYWx1ZVBhaXJzXG4gICAgICogICAgICAgIEFuIG9iamVjdCBtYXBwaW5nIHN0cmluZyBrZXlzIHRvIGFyYml0cmFyeSB2YWx1ZSB0eXBlcy4gQWxsXG4gICAgICogICAgICAgIFRyYWNlciBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIHN1cHBvcnQgYm9vbCwgc3RyaW5nLCBhbmQgbnVtZXJpY1xuICAgICAqICAgICAgICB2YWx1ZSB0eXBlcywgYW5kIHNvbWUgbWF5IGFsc28gc3VwcG9ydCBPYmplY3QgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lc3RhbXBcbiAgICAgKiAgICAgICAgQW4gb3B0aW9uYWwgcGFyYW1ldGVyIHNwZWNpZnlpbmcgdGhlIHRpbWVzdGFtcCBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiAgICAgICAgc2luY2UgdGhlIFVuaXggZXBvY2guIEZyYWN0aW9uYWwgdmFsdWVzIGFyZSBhbGxvd2VkIHNvIHRoYXRcbiAgICAgKiAgICAgICAgdGltZXN0YW1wcyB3aXRoIHN1Yi1taWxsaXNlY29uZCBhY2N1cmFjeSBjYW4gYmUgcmVwcmVzZW50ZWQuIElmXG4gICAgICogICAgICAgIG5vdCBzcGVjaWZpZWQsIHRoZSBpbXBsZW1lbnRhdGlvbiBpcyBleHBlY3RlZCB0byB1c2UgaXRzIG5vdGlvblxuICAgICAqICAgICAgICBvZiB0aGUgY3VycmVudCB0aW1lIG9mIHRoZSBjYWxsLlxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uIChrZXlWYWx1ZVBhaXJzLCB0aW1lc3RhbXApIHtcbiAgICAgICAgdGhpcy5fbG9nKGtleVZhbHVlUGFpcnMsIHRpbWVzdGFtcCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogREVQUkVDQVRFRFxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLmxvZ0V2ZW50ID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgcGF5bG9hZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbG9nKHsgZXZlbnQ6IGV2ZW50TmFtZSwgcGF5bG9hZDogcGF5bG9hZCB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGVuZCB0aW1lc3RhbXAgYW5kIGZpbmFsaXplcyBTcGFuIHN0YXRlLlxuICAgICAqXG4gICAgICogV2l0aCB0aGUgZXhjZXB0aW9uIG9mIGNhbGxzIHRvIFNwYW4uY29udGV4dCgpICh3aGljaCBhcmUgYWx3YXlzIGFsbG93ZWQpLFxuICAgICAqIGZpbmlzaCgpIG11c3QgYmUgdGhlIGxhc3QgY2FsbCBtYWRlIHRvIGFueSBzcGFuIGluc3RhbmNlLCBhbmQgdG8gZG9cbiAgICAgKiBvdGhlcndpc2UgbGVhZHMgdG8gdW5kZWZpbmVkIGJlaGF2aW9yLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBmaW5pc2hUaW1lXG4gICAgICogICAgICAgICBPcHRpb25hbCBmaW5pc2ggdGltZSBpbiBtaWxsaXNlY29uZHMgYXMgYSBVbml4IHRpbWVzdGFtcC4gRGVjaW1hbFxuICAgICAqICAgICAgICAgdmFsdWVzIGFyZSBzdXBwb3J0ZWQgZm9yIHRpbWVzdGFtcHMgd2l0aCBzdWItbWlsbGlzZWNvbmQgYWNjdXJhY3kuXG4gICAgICogICAgICAgICBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgY3VycmVudCB0aW1lIChhcyBkZWZpbmVkIGJ5IHRoZVxuICAgICAqICAgICAgICAgaW1wbGVtZW50YXRpb24pIHdpbGwgYmUgdXNlZC5cbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbiAoZmluaXNoVGltZSkge1xuICAgICAgICB0aGlzLl9maW5pc2goZmluaXNoVGltZSk7XG4gICAgICAgIC8vIERvIG5vdCByZXR1cm4gYHRoaXNgLiBUaGUgU3BhbiBnZW5lcmFsbHkgc2hvdWxkIG5vdCBiZSB1c2VkIGFmdGVyIGl0XG4gICAgICAgIC8vIGlzIGZpbmlzaGVkIHNvIGNoYWluaW5nIGlzIG5vdCBkZXNpcmVkIGluIHRoaXMgY29udGV4dC5cbiAgICB9O1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvLyBEZXJpdmVkIGNsYXNzZXMgY2FuIGNob29zZSB0byBpbXBsZW1lbnQgdGhlIGJlbG93XG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICAgIC8vIEJ5IGRlZmF1bHQgcmV0dXJucyBhIG5vLW9wIFNwYW5Db250ZXh0LlxuICAgIFNwYW4ucHJvdG90eXBlLl9jb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbm9vcC5zcGFuQ29udGV4dDtcbiAgICB9O1xuICAgIC8vIEJ5IGRlZmF1bHQgcmV0dXJucyBhIG5vLW9wIHRyYWNlci5cbiAgICAvL1xuICAgIC8vIFRoZSBiYXNlIGNsYXNzIGNvdWxkIHN0b3JlIHRoZSB0cmFjZXIgdGhhdCBjcmVhdGVkIGl0LCBidXQgaXQgZG9lcyBub3RcbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgdGhlIG5vLW9wIHNwYW4gaW1wbGVtZW50YXRpb24gaGFzIHplcm8gbWVtYmVycyxcbiAgICAvLyB3aGljaCBhbGxvd3MgVjggdG8gYWdncmVzc2l2ZWx5IG9wdGltaXplIGNhbGxzIHRvIHN1Y2ggb2JqZWN0cy5cbiAgICBTcGFuLnByb3RvdHlwZS5fdHJhY2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbm9vcC50cmFjZXI7XG4gICAgfTtcbiAgICAvLyBCeSBkZWZhdWx0IGRvZXMgbm90aGluZ1xuICAgIFNwYW4ucHJvdG90eXBlLl9zZXRPcGVyYXRpb25OYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB9O1xuICAgIC8vIEJ5IGRlZmF1bHQgZG9lcyBub3RoaW5nXG4gICAgU3Bhbi5wcm90b3R5cGUuX3NldEJhZ2dhZ2VJdGVtID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB9O1xuICAgIC8vIEJ5IGRlZmF1bHQgZG9lcyBub3RoaW5nXG4gICAgU3Bhbi5wcm90b3R5cGUuX2dldEJhZ2dhZ2VJdGVtID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgLy8gQnkgZGVmYXVsdCBkb2VzIG5vdGhpbmdcbiAgICAvL1xuICAgIC8vIE5PVEU6IGJvdGggc2V0VGFnKCkgYW5kIGFkZFRhZ3MoKSBtYXAgdG8gdGhpcyBmdW5jdGlvbi4ga2V5VmFsdWVQYWlyc1xuICAgIC8vIHdpbGwgYWx3YXlzIGJlIGFuIGFzc29jaWF0aXZlIGFycmF5LlxuICAgIFNwYW4ucHJvdG90eXBlLl9hZGRUYWdzID0gZnVuY3Rpb24gKGtleVZhbHVlUGFpcnMpIHtcbiAgICB9O1xuICAgIC8vIEJ5IGRlZmF1bHQgZG9lcyBub3RoaW5nXG4gICAgU3Bhbi5wcm90b3R5cGUuX2xvZyA9IGZ1bmN0aW9uIChrZXlWYWx1ZVBhaXJzLCB0aW1lc3RhbXApIHtcbiAgICB9O1xuICAgIC8vIEJ5IGRlZmF1bHQgZG9lcyBub3RoaW5nXG4gICAgLy9cbiAgICAvLyBmaW5pc2hUaW1lIGlzIGV4cGVjdGVkIHRvIGJlIGVpdGhlciBhIG51bWJlciBvciB1bmRlZmluZWQuXG4gICAgU3Bhbi5wcm90b3R5cGUuX2ZpbmlzaCA9IGZ1bmN0aW9uIChmaW5pc2hUaW1lKSB7XG4gICAgfTtcbiAgICByZXR1cm4gU3Bhbjtcbn0oKSk7XG5leHBvcnRzLlNwYW4gPSBTcGFuO1xuZXhwb3J0cy5kZWZhdWx0ID0gU3Bhbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNwYW4uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIFNwYW5Db250ZXh0IHJlcHJlc2VudHMgU3BhbiBzdGF0ZSB0aGF0IG11c3QgcHJvcGFnYXRlIHRvIGRlc2NlbmRhbnQgU3BhbnNcbiAqIGFuZCBhY3Jvc3MgcHJvY2VzcyBib3VuZGFyaWVzLlxuICpcbiAqIFNwYW5Db250ZXh0IGlzIGxvZ2ljYWxseSBkaXZpZGVkIGludG8gdHdvIHBpZWNlczogdGhlIHVzZXItbGV2ZWwgXCJCYWdnYWdlXCJcbiAqIChzZWUgc2V0QmFnZ2FnZUl0ZW0gYW5kIGdldEJhZ2dhZ2VJdGVtKSB0aGF0IHByb3BhZ2F0ZXMgYWNyb3NzIFNwYW5cbiAqIGJvdW5kYXJpZXMgYW5kIGFueSBUcmFjZXItaW1wbGVtZW50YXRpb24tc3BlY2lmaWMgZmllbGRzIHRoYXQgYXJlIG5lZWRlZCB0b1xuICogaWRlbnRpZnkgb3Igb3RoZXJ3aXNlIGNvbnRleHR1YWxpemUgdGhlIGFzc29jaWF0ZWQgU3BhbiBpbnN0YW5jZSAoZS5nLiwgYVxuICogPHRyYWNlX2lkLCBzcGFuX2lkLCBzYW1wbGVkPiB0dXBsZSkuXG4gKi9cbnZhciBTcGFuQ29udGV4dCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFuQ29udGV4dCgpIHtcbiAgICB9XG4gICAgcmV0dXJuIFNwYW5Db250ZXh0O1xufSgpKTtcbmV4cG9ydHMuU3BhbkNvbnRleHQgPSBTcGFuQ29udGV4dDtcbmV4cG9ydHMuZGVmYXVsdCA9IFNwYW5Db250ZXh0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3Bhbl9jb250ZXh0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEZ1bmN0aW9ucyA9IHJlcXVpcmUoXCIuL2Z1bmN0aW9uc1wiKTtcbnZhciBOb29wID0gcmVxdWlyZShcIi4vbm9vcFwiKTtcbnZhciBzcGFuXzEgPSByZXF1aXJlKFwiLi9zcGFuXCIpO1xuLyoqXG4gKiBUcmFjZXIgaXMgdGhlIGVudHJ5LXBvaW50IGJldHdlZW4gdGhlIGluc3RydW1lbnRhdGlvbiBBUEkgYW5kIHRoZSB0cmFjaW5nXG4gKiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBUaGUgZGVmYXVsdCBvYmplY3QgYWN0cyBhcyBhIG5vLW9wIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIE5vdGUgdG8gaW1wbGVtZW50YXRvcnM6IGRlcml2ZWQgY2xhc3NlcyBjYW4gY2hvb3NlIHRvIGRpcmVjdGx5IGltcGxlbWVudCB0aGVcbiAqIG1ldGhvZHMgaW4gdGhlIFwiT3BlblRyYWNpbmcgQVBJIG1ldGhvZHNcIiBzZWN0aW9uLCBvciBvcHRpb25hbGx5IHRoZSBzdWJzZXQgb2ZcbiAqIHVuZGVyc2NvcmUtcHJlZml4ZWQgbWV0aG9kcyB0byBwaWNrIHVwIHRoZSBhcmd1bWVudCBjaGVja2luZyBhbmQgaGFuZGxpbmdcbiAqIGF1dG9tYXRpY2FsbHkgZnJvbSB0aGUgYmFzZSBjbGFzcy5cbiAqL1xudmFyIFRyYWNlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBUcmFjZXIoKSB7XG4gICAgfVxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvLyBPcGVuVHJhY2luZyBBUEkgbWV0aG9kc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYW5kIHJldHVybnMgYSBuZXcgU3BhbiByZXByZXNlbnRpbmcgYSBsb2dpY2FsIHVuaXQgb2Ygd29yay5cbiAgICAgKlxuICAgICAqIEZvciBleGFtcGxlOlxuICAgICAqXG4gICAgICogICAgIC8vIFN0YXJ0IGEgbmV3IChwYXJlbnRsZXNzKSByb290IFNwYW46XG4gICAgICogICAgIHZhciBwYXJlbnQgPSBUcmFjZXIuc3RhcnRTcGFuKCdEb1dvcmsnKTtcbiAgICAgKlxuICAgICAqICAgICAvLyBTdGFydCBhIG5ldyAoY2hpbGQpIFNwYW46XG4gICAgICogICAgIHZhciBjaGlsZCA9IFRyYWNlci5zdGFydFNwYW4oJ2xvYWQtZnJvbS1kYicsIHtcbiAgICAgKiAgICAgICAgIGNoaWxkT2Y6IHBhcmVudC5jb250ZXh0KCksXG4gICAgICogICAgIH0pO1xuICAgICAqXG4gICAgICogICAgIC8vIFN0YXJ0IGEgbmV3IGFzeW5jIChGb2xsb3dzRnJvbSkgU3BhbjpcbiAgICAgKiAgICAgdmFyIGNoaWxkID0gVHJhY2VyLnN0YXJ0U3BhbignYXN5bmMtY2FjaGUtd3JpdGUnLCB7XG4gICAgICogICAgICAgICByZWZlcmVuY2VzOiBbXG4gICAgICogICAgICAgICAgICAgb3BlbnRyYWNpbmcuZm9sbG93c0Zyb20ocGFyZW50LmNvbnRleHQoKSlcbiAgICAgKiAgICAgICAgIF0sXG4gICAgICogICAgIH0pO1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgb3BlcmF0aW9uIChSRVFVSVJFRCkuXG4gICAgICogQHBhcmFtIHtTcGFuT3B0aW9uc30gW29wdGlvbnNdIC0gb3B0aW9ucyBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgc3Bhbi5cbiAgICAgKiBAcmV0dXJuIHtTcGFufSAtIGEgbmV3IFNwYW4gb2JqZWN0LlxuICAgICAqL1xuICAgIFRyYWNlci5wcm90b3R5cGUuc3RhcnRTcGFuID0gZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICAgICAgLy8gQ29udmVydCBvcHRpb25zLmNoaWxkT2YgdG8gZmllbGRzLnJlZmVyZW5jZXMgYXMgbmVlZGVkLlxuICAgICAgICBpZiAob3B0aW9ucy5jaGlsZE9mKSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IGZyb20gYSBTcGFuIG9yIGEgU3BhbkNvbnRleHQgaW50byBhIFJlZmVyZW5jZS5cbiAgICAgICAgICAgIHZhciBjaGlsZE9mID0gRnVuY3Rpb25zLmNoaWxkT2Yob3B0aW9ucy5jaGlsZE9mKTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJlZmVyZW5jZXMpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnJlZmVyZW5jZXMucHVzaChjaGlsZE9mKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucmVmZXJlbmNlcyA9IFtjaGlsZE9mXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSAob3B0aW9ucy5jaGlsZE9mKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnRTcGFuKG5hbWUsIG9wdGlvbnMpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogSW5qZWN0cyB0aGUgZ2l2ZW4gU3BhbkNvbnRleHQgaW5zdGFuY2UgZm9yIGNyb3NzLXByb2Nlc3MgcHJvcGFnYXRpb25cbiAgICAgKiB3aXRoaW4gYGNhcnJpZXJgLiBUaGUgZXhwZWN0ZWQgdHlwZSBvZiBgY2FycmllcmAgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2ZcbiAgICAgKiBgZm9ybWF0LlxuICAgICAqXG4gICAgICogT3BlblRyYWNpbmcgZGVmaW5lcyBhIGNvbW1vbiBzZXQgb2YgYGZvcm1hdGAgdmFsdWVzIChzZWVcbiAgICAgKiBGT1JNQVRfVEVYVF9NQVAsIEZPUk1BVF9IVFRQX0hFQURFUlMsIGFuZCBGT1JNQVRfQklOQVJZKSwgYW5kIGVhY2ggaGFzXG4gICAgICogYW4gZXhwZWN0ZWQgY2FycmllciB0eXBlLlxuICAgICAqXG4gICAgICogQ29uc2lkZXIgdGhpcyBwc2V1ZG9jb2RlIGV4YW1wbGU6XG4gICAgICpcbiAgICAgKiAgICAgdmFyIGNsaWVudFNwYW4gPSAuLi47XG4gICAgICogICAgIC4uLlxuICAgICAqICAgICAvLyBJbmplY3QgY2xpZW50U3BhbiBpbnRvIGEgdGV4dCBjYXJyaWVyLlxuICAgICAqICAgICB2YXIgaGVhZGVyc0NhcnJpZXIgPSB7fTtcbiAgICAgKiAgICAgVHJhY2VyLmluamVjdChjbGllbnRTcGFuLmNvbnRleHQoKSwgVHJhY2VyLkZPUk1BVF9IVFRQX0hFQURFUlMsIGhlYWRlcnNDYXJyaWVyKTtcbiAgICAgKiAgICAgLy8gSW5jb3Jwb3JhdGUgdGhlIHRleHRDYXJyaWVyIGludG8gdGhlIG91dGJvdW5kIEhUVFAgcmVxdWVzdCBoZWFkZXJcbiAgICAgKiAgICAgLy8gbWFwLlxuICAgICAqICAgICBPYmplY3QuYXNzaWduKG91dGJvdW5kSFRUUFJlcS5oZWFkZXJzLCBoZWFkZXJzQ2Fycmllcik7XG4gICAgICogICAgIC8vIC4uLiBzZW5kIHRoZSBodHRwUmVxXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTcGFuQ29udGV4dH0gc3BhbkNvbnRleHQgLSB0aGUgU3BhbkNvbnRleHQgdG8gaW5qZWN0IGludG8gdGhlXG4gICAgICogICAgICAgICBjYXJyaWVyIG9iamVjdC4gQXMgYSBjb252ZW5pZW5jZSwgYSBTcGFuIGluc3RhbmNlIG1heSBiZSBwYXNzZWRcbiAgICAgKiAgICAgICAgIGluIGluc3RlYWQgKGluIHdoaWNoIGNhc2UgaXRzIC5jb250ZXh0KCkgaXMgdXNlZCBmb3IgdGhlXG4gICAgICogICAgICAgICBpbmplY3QoKSkuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBmb3JtYXQgLSB0aGUgZm9ybWF0IG9mIHRoZSBjYXJyaWVyLlxuICAgICAqIEBwYXJhbSAge2FueX0gY2FycmllciAtIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGNob3NlbiBgZm9ybWF0YFxuICAgICAqICAgICAgICAgZm9yIGEgZGVzY3JpcHRpb24gb2YgdGhlIGNhcnJpZXIgb2JqZWN0LlxuICAgICAqL1xuICAgIFRyYWNlci5wcm90b3R5cGUuaW5qZWN0ID0gZnVuY3Rpb24gKHNwYW5Db250ZXh0LCBmb3JtYXQsIGNhcnJpZXIpIHtcbiAgICAgICAgLy8gQWxsb3cgdGhlIHVzZXIgdG8gcGFzcyBhIFNwYW4gaW5zdGVhZCBvZiBhIFNwYW5Db250ZXh0XG4gICAgICAgIGlmIChzcGFuQ29udGV4dCBpbnN0YW5jZW9mIHNwYW5fMS5kZWZhdWx0KSB7XG4gICAgICAgICAgICBzcGFuQ29udGV4dCA9IHNwYW5Db250ZXh0LmNvbnRleHQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5faW5qZWN0KHNwYW5Db250ZXh0LCBmb3JtYXQsIGNhcnJpZXIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIFNwYW5Db250ZXh0IGluc3RhbmNlIGV4dHJhY3RlZCBmcm9tIGBjYXJyaWVyYCBpbiB0aGUgZ2l2ZW5cbiAgICAgKiBgZm9ybWF0YC5cbiAgICAgKlxuICAgICAqIE9wZW5UcmFjaW5nIGRlZmluZXMgYSBjb21tb24gc2V0IG9mIGBmb3JtYXRgIHZhbHVlcyAoc2VlXG4gICAgICogRk9STUFUX1RFWFRfTUFQLCBGT1JNQVRfSFRUUF9IRUFERVJTLCBhbmQgRk9STUFUX0JJTkFSWSksIGFuZCBlYWNoIGhhc1xuICAgICAqIGFuIGV4cGVjdGVkIGNhcnJpZXIgdHlwZS5cbiAgICAgKlxuICAgICAqIENvbnNpZGVyIHRoaXMgcHNldWRvY29kZSBleGFtcGxlOlxuICAgICAqXG4gICAgICogICAgIC8vIFVzZSB0aGUgaW5ib3VuZCBIVFRQIHJlcXVlc3QncyBoZWFkZXJzIGFzIGEgdGV4dCBtYXAgY2Fycmllci5cbiAgICAgKiAgICAgdmFyIGhlYWRlcnNDYXJyaWVyID0gaW5ib3VuZEhUVFBSZXEuaGVhZGVycztcbiAgICAgKiAgICAgdmFyIHdpcmVDdHggPSBUcmFjZXIuZXh0cmFjdChUcmFjZXIuRk9STUFUX0hUVFBfSEVBREVSUywgaGVhZGVyc0NhcnJpZXIpO1xuICAgICAqICAgICB2YXIgc2VydmVyU3BhbiA9IFRyYWNlci5zdGFydFNwYW4oJy4uLicsIHsgY2hpbGRPZiA6IHdpcmVDdHggfSk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGZvcm1hdCAtIHRoZSBmb3JtYXQgb2YgdGhlIGNhcnJpZXIuXG4gICAgICogQHBhcmFtICB7YW55fSBjYXJyaWVyIC0gdGhlIHR5cGUgb2YgdGhlIGNhcnJpZXIgb2JqZWN0IGlzIGRldGVybWluZWQgYnlcbiAgICAgKiAgICAgICAgIHRoZSBmb3JtYXQuXG4gICAgICogQHJldHVybiB7U3BhbkNvbnRleHR9XG4gICAgICogICAgICAgICBUaGUgZXh0cmFjdGVkIFNwYW5Db250ZXh0LCBvciBudWxsIGlmIG5vIHN1Y2ggU3BhbkNvbnRleHQgY291bGRcbiAgICAgKiAgICAgICAgIGJlIGZvdW5kIGluIGBjYXJyaWVyYFxuICAgICAqL1xuICAgIFRyYWNlci5wcm90b3R5cGUuZXh0cmFjdCA9IGZ1bmN0aW9uIChmb3JtYXQsIGNhcnJpZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V4dHJhY3QoZm9ybWF0LCBjYXJyaWVyKTtcbiAgICB9O1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvLyBEZXJpdmVkIGNsYXNzZXMgY2FuIGNob29zZSB0byBpbXBsZW1lbnQgdGhlIGJlbG93XG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICAgIC8vIE5PVEU6IHRoZSBpbnB1dCB0byB0aGlzIG1ldGhvZCBpcyAqYWx3YXlzKiBhbiBhc3NvY2lhdGl2ZSBhcnJheS4gVGhlXG4gICAgLy8gcHVibGljLWZhY2luZyBzdGFydFNwYW4oKSBtZXRob2Qgbm9ybWFsaXplcyB0aGUgYXJndW1lbnRzIHNvIHRoYXRcbiAgICAvLyBhbGwgTiBpbXBsZW1lbnRhdGlvbnMgZG8gbm90IG5lZWQgdG8gd29ycnkgYWJvdXQgdmFyaWF0aW9ucyBpbiB0aGUgY2FsbFxuICAgIC8vIHNpZ25hdHVyZS5cbiAgICAvL1xuICAgIC8vIFRoZSBkZWZhdWx0IGJlaGF2aW9yIHJldHVybnMgYSBuby1vcCBzcGFuLlxuICAgIFRyYWNlci5wcm90b3R5cGUuX3N0YXJ0U3BhbiA9IGZ1bmN0aW9uIChuYW1lLCBmaWVsZHMpIHtcbiAgICAgICAgcmV0dXJuIE5vb3Auc3BhbjtcbiAgICB9O1xuICAgIC8vIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIGEgbm8tb3AuXG4gICAgVHJhY2VyLnByb3RvdHlwZS5faW5qZWN0ID0gZnVuY3Rpb24gKHNwYW5Db250ZXh0LCBmb3JtYXQsIGNhcnJpZXIpIHtcbiAgICB9O1xuICAgIC8vIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJldHVybiBhIG5vLW9wIFNwYW5Db250ZXh0LlxuICAgIFRyYWNlci5wcm90b3R5cGUuX2V4dHJhY3QgPSBmdW5jdGlvbiAoZm9ybWF0LCBjYXJyaWVyKSB7XG4gICAgICAgIHJldHVybiBOb29wLnNwYW5Db250ZXh0O1xuICAgIH07XG4gICAgcmV0dXJuIFRyYWNlcjtcbn0oKSk7XG5leHBvcnRzLlRyYWNlciA9IFRyYWNlcjtcbmV4cG9ydHMuZGVmYXVsdCA9IFRyYWNlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRyYWNlci5qcy5tYXAiLCIvKipcbiAqIEB0aGlzIHtQcm9taXNlfVxuICovXG5mdW5jdGlvbiBmaW5hbGx5Q29uc3RydWN0b3IoY2FsbGJhY2spIHtcbiAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHRoaXMudGhlbihcbiAgICBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmaW5hbGx5Q29uc3RydWN0b3I7XG4iLCJpbXBvcnQgcHJvbWlzZUZpbmFsbHkgZnJvbSAnLi9maW5hbGx5JztcblxuLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbi8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxudmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblxuZnVuY3Rpb24gaXNBcnJheSh4KSB7XG4gIHJldHVybiBCb29sZWFuKHggJiYgdHlwZW9mIHgubGVuZ3RoICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbmZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5mdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKTtcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLl9zdGF0ZSA9IDA7XG4gIC8qKiBAdHlwZSB7IWJvb2xlYW59ICovXG4gIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtQcm9taXNlfHVuZGVmaW5lZH0gKi9cbiAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gIC8qKiBAdHlwZSB7IUFycmF5PCFGdW5jdGlvbj59ICovXG4gIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICBzZWxmID0gc2VsZi5fdmFsdWU7XG4gIH1cbiAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgc2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAoc2VsZi5fc3RhdGUgPT09IDEgPyByZXNvbHZlIDogcmVqZWN0KShkZWZlcnJlZC5wcm9taXNlLCBzZWxmLl92YWx1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZXQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgdHJ5IHtcbiAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZilcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgaWYgKFxuICAgICAgbmV3VmFsdWUgJiZcbiAgICAgICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICApIHtcbiAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgc2VsZi5fc3RhdGUgPSAzO1xuICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLl9zdGF0ZSA9IDE7XG4gICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmaW5hbGUoc2VsZik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3Qoc2VsZiwgZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gIHNlbGYuX3N0YXRlID0gMjtcbiAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgZmluYWxlKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBmaW5hbGUoc2VsZikge1xuICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLl9oYW5kbGVkKSB7XG4gICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBoYW5kbGUoc2VsZiwgc2VsZi5fZGVmZXJyZWRzW2ldKTtcbiAgfVxuICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gIHRoaXMub25SZWplY3RlZCA9IHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nID8gb25SZWplY3RlZCA6IG51bGw7XG4gIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG59XG5cbi8qKlxuICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAqL1xuZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBzZWxmKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oXG4gICAgICBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChleCkge1xuICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgZG9uZSA9IHRydWU7XG4gICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgfVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpIHtcbiAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAvLyBAdHMtaWdub3JlXG4gIHZhciBwcm9tID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gIHJldHVybiBwcm9tO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSA9IHByb21pc2VGaW5hbGx5O1xuXG5Qcm9taXNlLmFsbCA9IGZ1bmN0aW9uKGFycikge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcignUHJvbWlzZS5hbGwgYWNjZXB0cyBhbiBhcnJheScpKTtcbiAgICB9XG5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSk7XG4gICAgdmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXG4gICAgZnVuY3Rpb24gcmVzKGksIHZhbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHZhbCAmJiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICB2YXIgdGhlbiA9IHZhbC50aGVuO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhlbi5jYWxsKFxuICAgICAgICAgICAgICB2YWwsXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHJlcyhpLCB2YWwpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICByZWplY3RcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFyZ3NbaV0gPSB2YWw7XG4gICAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHJlamVjdChleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXMoaSwgYXJnc1tpXSk7XG4gICAgfVxuICB9KTtcbn07XG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBQcm9taXNlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZWplY3QodmFsdWUpO1xuICB9KTtcbn07XG5cblByb21pc2UucmFjZSA9IGZ1bmN0aW9uKGFycikge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcignUHJvbWlzZS5yYWNlIGFjY2VwdHMgYW4gYXJyYXknKSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKGFycltpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBVc2UgcG9seWZpbGwgZm9yIHNldEltbWVkaWF0ZSBmb3IgcGVyZm9ybWFuY2UgZ2FpbnNcblByb21pc2UuX2ltbWVkaWF0ZUZuID1cbiAgLy8gQHRzLWlnbm9yZVxuICAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGZ1bmN0aW9uKGZuKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0pIHx8XG4gIGZ1bmN0aW9uKGZuKSB7XG4gICAgc2V0VGltZW91dEZ1bmMoZm4sIDApO1xuICB9O1xuXG5Qcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF91bmhhbmRsZWRSZWplY3Rpb25GbihlcnIpIHtcbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlKSB7XG4gICAgY29uc29sZS53YXJuKCdQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246JywgZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFByb21pc2U7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uIChVTUQpIHRvIHN1cHBvcnQgQU1ELCBDb21tb25KUy9Ob2RlLmpzLCBSaGlubywgYW5kIGJyb3dzZXJzLlxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnc3RhY2tmcmFtZScsIFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlN0YWNrRnJhbWUgPSBmYWN0b3J5KCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIF9pc051bWJlcihuKSB7XG4gICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3RhY2tGcmFtZShmdW5jdGlvbk5hbWUsIGFyZ3MsIGZpbGVOYW1lLCBsaW5lTnVtYmVyLCBjb2x1bW5OdW1iZXIsIHNvdXJjZSkge1xuICAgICAgICBpZiAoZnVuY3Rpb25OYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RnVuY3Rpb25OYW1lKGZ1bmN0aW9uTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRBcmdzKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWxlTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldEZpbGVOYW1lKGZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZU51bWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldExpbmVOdW1iZXIobGluZU51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbHVtbk51bWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldENvbHVtbk51bWJlcihjb2x1bW5OdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3VyY2Uoc291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFN0YWNrRnJhbWUucHJvdG90eXBlID0ge1xuICAgICAgICBnZXRGdW5jdGlvbk5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0RnVuY3Rpb25OYW1lOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbk5hbWUgPSBTdHJpbmcodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0QXJnczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXJncztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0QXJnczogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodikgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmdzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXJncyA9IHY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gTk9URTogUHJvcGVydHkgbmFtZSBtYXkgYmUgbWlzbGVhZGluZyBhcyBpdCBpbmNsdWRlcyB0aGUgcGF0aCxcbiAgICAgICAgLy8gYnV0IGl0IHNvbWV3aGF0IG1pcnJvcnMgVjgncyBKYXZhU2NyaXB0U3RhY2tUcmFjZUFwaVxuICAgICAgICAvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L3dpa2kvSmF2YVNjcmlwdFN0YWNrVHJhY2VBcGkgYW5kIEdlY2tvJ3NcbiAgICAgICAgLy8gaHR0cDovL214ci5tb3ppbGxhLm9yZy9tb3ppbGxhLWNlbnRyYWwvc291cmNlL3hwY29tL2Jhc2UvbnNJRXhjZXB0aW9uLmlkbCMxNFxuICAgICAgICBnZXRGaWxlTmFtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZU5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEZpbGVOYW1lOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5maWxlTmFtZSA9IFN0cmluZyh2KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaW5lTnVtYmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5lTnVtYmVyO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMaW5lTnVtYmVyOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKCFfaXNOdW1iZXIodikpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdMaW5lIE51bWJlciBtdXN0IGJlIGEgTnVtYmVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxpbmVOdW1iZXIgPSBOdW1iZXIodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29sdW1uTnVtYmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2x1bW5OdW1iZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHNldENvbHVtbk51bWJlcjogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICghX2lzTnVtYmVyKHYpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29sdW1uIE51bWJlciBtdXN0IGJlIGEgTnVtYmVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNvbHVtbk51bWJlciA9IE51bWJlcih2KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTb3VyY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0U291cmNlOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBTdHJpbmcodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IHRoaXMuZ2V0RnVuY3Rpb25OYW1lKCkgfHwgJ3thbm9ueW1vdXN9JztcbiAgICAgICAgICAgIHZhciBhcmdzID0gJygnICsgKHRoaXMuZ2V0QXJncygpIHx8IFtdKS5qb2luKCcsJykgKyAnKSc7XG4gICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSB0aGlzLmdldEZpbGVOYW1lKCkgPyAoJ0AnICsgdGhpcy5nZXRGaWxlTmFtZSgpKSA6ICcnO1xuICAgICAgICAgICAgdmFyIGxpbmVOdW1iZXIgPSBfaXNOdW1iZXIodGhpcy5nZXRMaW5lTnVtYmVyKCkpID8gKCc6JyArIHRoaXMuZ2V0TGluZU51bWJlcigpKSA6ICcnO1xuICAgICAgICAgICAgdmFyIGNvbHVtbk51bWJlciA9IF9pc051bWJlcih0aGlzLmdldENvbHVtbk51bWJlcigpKSA/ICgnOicgKyB0aGlzLmdldENvbHVtbk51bWJlcigpKSA6ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uTmFtZSArIGFyZ3MgKyBmaWxlTmFtZSArIGxpbmVOdW1iZXIgKyBjb2x1bW5OdW1iZXI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFN0YWNrRnJhbWU7XG59KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcblx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZTsgfTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLyoqXG4gKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNy1wcmVzZW50LCBFbGFzdGljc2VhcmNoIEJWXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqXG4gKi9cblxuaW1wb3J0IHtcbiAgY3JlYXRlU2VydmljZUZhY3RvcnksXG4gIGJvb3RzdHJhcCxcbiAgaXNCcm93c2VyXG59IGZyb20gJ0BlbGFzdGljL2FwbS1ydW0tY29yZSdcbmltcG9ydCBBcG1CYXNlIGZyb20gJy4vYXBtLWJhc2UnXG5cbi8qKlxuICogVXNlIGEgc2luZ2xlIGluc3RhbmNlIG9mIEFwbUJhc2UgYWNyb3NzIGFsbCBpbnN0YW5jZSBvZiB0aGUgYWdlbnRcbiAqIGluY2x1ZGluZyB0aGUgaW5zdGFuY2VzIHVzZWQgaW4gZnJhbWV3b3JrIHNwZWNpZmljIGludGVncmF0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRBcG1CYXNlKCkge1xuICBpZiAoaXNCcm93c2VyICYmIHdpbmRvdy5lbGFzdGljQXBtKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5lbGFzdGljQXBtXG4gIH1cbiAgY29uc3QgZW5hYmxlZCA9IGJvb3RzdHJhcCgpXG4gIGNvbnN0IHNlcnZpY2VGYWN0b3J5ID0gY3JlYXRlU2VydmljZUZhY3RvcnkoKVxuICBjb25zdCBhcG1CYXNlID0gbmV3IEFwbUJhc2Uoc2VydmljZUZhY3RvcnksICFlbmFibGVkKVxuXG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICB3aW5kb3cuZWxhc3RpY0FwbSA9IGFwbUJhc2VcbiAgfVxuXG4gIHJldHVybiBhcG1CYXNlXG59XG5cbmNvbnN0IGFwbUJhc2UgPSBnZXRBcG1CYXNlKClcblxuY29uc3QgaW5pdCA9IGFwbUJhc2UuaW5pdC5iaW5kKGFwbUJhc2UpXG5cbmV4cG9ydCBkZWZhdWx0IGluaXRcbmV4cG9ydCB7IGluaXQsIGFwbUJhc2UsIEFwbUJhc2UsIGFwbUJhc2UgYXMgYXBtIH1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==