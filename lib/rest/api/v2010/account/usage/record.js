'use strict';

var _ = require('lodash');
var Q = require('q');
var AllTimeList = require('./record/allTime').AllTimeList;
var DailyList = require('./record/daily').DailyList;
var LastMonthList = require('./record/lastMonth').LastMonthList;
var MonthlyList = require('./record/monthly').MonthlyList;
var Page = require('../../../../../base/Page');
var ThisMonthList = require('./record/thisMonth').ThisMonthList;
var TodayList = require('./record/today').TodayList;
var YearlyList = require('./record/yearly').YearlyList;
var YesterdayList = require('./record/yesterday').YesterdayList;
var deserialize = require('../../../../../base/deserialize');
var serialize = require('../../../../../base/serialize');
var values = require('../../../../../base/values');

var RecordPage;
var RecordList;
var RecordInstance;
var RecordContext;

/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.UsageContext.RecordPage
 * @augments Page
 * @description Initialize the RecordPage
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {object} response - Response from the API
 * @param {string} accountSid -
 *          A 34 character string that uniquely identifies this resource.
 *
 * @returns RecordPage
 */
/* jshint ignore:end */
function RecordPage(version, response, accountSid) {
  Page.prototype.constructor.call(this, version, response);

  // Path Solution
  this._solution = {
    accountSid: accountSid
  };
}

_.extend(RecordPage.prototype, Page.prototype);
RecordPage.prototype.constructor = RecordPage;

/* jshint ignore:start */
/**
 * Build an instance of RecordInstance
 *
 * @function getInstance
 * @memberof Twilio.Api.V2010.AccountContext.UsageContext.RecordPage
 * @instance
 *
 * @param {object} payload - Payload response from the API
 *
 * @returns RecordInstance
 */
/* jshint ignore:end */
RecordPage.prototype.getInstance = function getInstance(payload) {
  return new RecordInstance(
    this._version,
    payload,
    this._solution.accountSid
  );
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.UsageContext.RecordList
 * @description Initialize the RecordList
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {string} accountSid -
 *          A 34 character string that uniquely identifies this resource.
 */
/* jshint ignore:end */
function RecordList(version, accountSid) {
  /* jshint ignore:start */
  /**
   * @function records
   * @memberof Twilio.Api.V2010.AccountContext.UsageContext
   * @instance
   *
   * @param {string} sid - sid of instance
   *
   * @returns {Twilio.Api.V2010.AccountContext.UsageContext.RecordContext}
   */
  /* jshint ignore:end */
  function RecordListInstance(sid) {
    return RecordListInstance.get(sid);
  }

  RecordListInstance._version = version;
  // Path Solution
  RecordListInstance._solution = {
    accountSid: accountSid
  };
  RecordListInstance._uri = _.template(
    '/Accounts/<%= accountSid %>/Usage/Records.json' // jshint ignore:line
  )(RecordListInstance._solution);

  // Components
  RecordListInstance._allTime = undefined;
  RecordListInstance._daily = undefined;
  RecordListInstance._lastMonth = undefined;
  RecordListInstance._monthly = undefined;
  RecordListInstance._thisMonth = undefined;
  RecordListInstance._today = undefined;
  RecordListInstance._yearly = undefined;
  RecordListInstance._yesterday = undefined;

  /* jshint ignore:start */
  /**
   * Streams RecordInstance records from the API.
   *
   * This operation lazily loads records as efficiently as possible until the limit
   * is reached.
   *
   * The results are passed into the callback function, so this operation is memory efficient.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function each
   * @memberof Twilio.Api.V2010.AccountContext.UsageContext.RecordList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {record.category} [opts.category] -
   *          Only include usage of a given category
   * @param {Date} [opts.startDateBefore] - Filter by start date
   * @param {Date} [opts.startDate] - Filter by start date
   * @param {Date} [opts.startDateAfter] - Filter by start date
   * @param {Date} [opts.endDateBefore] - Filter by end date
   * @param {Date} [opts.endDate] - Filter by end date
   * @param {Date} [opts.endDateAfter] - Filter by end date
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize=50] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no pageSize is defined but a limit is defined,
   *         list() will attempt to read the limit with the most efficient
   *         page size, i.e. min(limit, 1000)
   * @param {Function} [opts.callback] -
   *         Function to process each record. If this and a positional
   * callback are passed, this one will be used
   * @param {Function} [opts.done] -
   *          Function to be called upon completion of streaming
   * @param {Function} [callback] - Function to process each record
   */
  /* jshint ignore:end */
  RecordListInstance.each = function each(opts, callback) {
    opts = opts || {};
    if (_.isFunction(opts)) {
      opts = { callback: opts };
    } else if (_.isFunction(callback) && !_.isFunction(opts.callback)) {
      opts.callback = callback;
    }

    if (_.isUndefined(opts.callback)) {
      throw new Error('Callback function must be provided');
    }

    var done = false;
    var currentPage = 1;
    var limits = this._version.readLimits({
      limit: opts.limit,
      pageSize: opts.pageSize
    });

    function onComplete(error) {
      done = true;
      if (_.isFunction(opts.done)) {
        opts.done(error);
      }
    }

    function fetchNextPage(fn) {
      var promise = fn();
      if (_.isUndefined(promise)) {
        onComplete();
        return;
      }

      promise.then(function(page) {
        _.each(page.instances, function(instance) {
          if (done) {
            return false;
          }

          opts.callback(instance, onComplete);
        });

        if ((limits.pageLimit && limits.pageLimit <= currentPage)) {
          onComplete();
        } else if (!done) {
          currentPage++;
          fetchNextPage(_.bind(page.nextPage, page));
        }
      });

      promise.catch(onComplete);
    }

    fetchNextPage(_.bind(this.page, this, opts));
  };

  /* jshint ignore:start */
  /**
   * @description Lists RecordInstance records from the API as a list.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function list
   * @memberof Twilio.Api.V2010.AccountContext.UsageContext.RecordList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {record.category} [opts.category] -
   *          Only include usage of a given category
   * @param {Date} [opts.startDateBefore] - Filter by start date
   * @param {Date} [opts.startDate] - Filter by start date
   * @param {Date} [opts.startDateAfter] - Filter by start date
   * @param {Date} [opts.endDateBefore] - Filter by end date
   * @param {Date} [opts.endDate] - Filter by end date
   * @param {Date} [opts.endDateAfter] - Filter by end date
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no page_size is defined but a limit is defined,
   *         list() will attempt to read the limit with the most
   *         efficient page size, i.e. min(limit, 1000)
   * @param {function} [callback] - Callback to handle list of records
   *
   * @returns {Promise} Resolves to a list of records
   */
  /* jshint ignore:end */
  RecordListInstance.list = function list(opts, callback) {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    var deferred = Q.defer();
    var allResources = [];
    opts.callback = function(resource) {
      allResources.push(resource);
    };

    opts.done = function(error) {
      if (_.isUndefined(error)) {
        deferred.resolve(allResources);
      } else {
        deferred.reject(error);
      }
    };

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    this.each(opts);
    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * Retrieve a single page of RecordInstance records from the API.
   * Request is executed immediately
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function page
   * @memberof Twilio.Api.V2010.AccountContext.UsageContext.RecordList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {record.category} [opts.category] -
   *          Only include usage of a given category
   * @param {Date} [opts.startDateBefore] - Filter by start date
   * @param {Date} [opts.startDate] - Filter by start date
   * @param {Date} [opts.startDateAfter] - Filter by start date
   * @param {Date} [opts.endDateBefore] - Filter by end date
   * @param {Date} [opts.endDate] - Filter by end date
   * @param {Date} [opts.endDateAfter] - Filter by end date
   * @param {string} [opts.pageToken] - PageToken provided by the API
   * @param {number} [opts.pageNumber] -
   *          Page Number, this value is simply for client state
   * @param {number} [opts.pageSize] - Number of records to return, defaults to 50
   * @param {function} [callback] - Callback to handle list of records
   *
   * @returns {Promise} Resolves to a list of records
   */
  /* jshint ignore:end */
  RecordListInstance.page = function page(opts, callback) {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }
    opts = opts || {};

    var deferred = Q.defer();
    var data = values.of({
      'Category': opts.category,
      'StartDate<': serialize.iso8601Date(opts.startDateBefore),
      'StartDate': serialize.iso8601Date(opts.startDate),
      'StartDate>': serialize.iso8601Date(opts.startDateAfter),
      'EndDate<': serialize.iso8601Date(opts.endDateBefore),
      'EndDate': serialize.iso8601Date(opts.endDate),
      'EndDate>': serialize.iso8601Date(opts.endDateAfter),
      'PageToken': opts.pageToken,
      'Page': opts.pageNumber,
      'PageSize': opts.pageSize
    });

    var promise = this._version.page({
      uri: this._uri,
      method: 'GET',
      params: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new RecordPage(
        this._version,
        payload
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  Object.defineProperty(RecordListInstance,
    'allTime', {
    get: function allTime() {
      if (!this._allTime) {
        this._allTime = new AllTimeList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._allTime;
    },
  });

  Object.defineProperty(RecordListInstance,
    'daily', {
    get: function daily() {
      if (!this._daily) {
        this._daily = new DailyList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._daily;
    },
  });

  Object.defineProperty(RecordListInstance,
    'lastMonth', {
    get: function lastMonth() {
      if (!this._lastMonth) {
        this._lastMonth = new LastMonthList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._lastMonth;
    },
  });

  Object.defineProperty(RecordListInstance,
    'monthly', {
    get: function monthly() {
      if (!this._monthly) {
        this._monthly = new MonthlyList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._monthly;
    },
  });

  Object.defineProperty(RecordListInstance,
    'thisMonth', {
    get: function thisMonth() {
      if (!this._thisMonth) {
        this._thisMonth = new ThisMonthList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._thisMonth;
    },
  });

  Object.defineProperty(RecordListInstance,
    'today', {
    get: function today() {
      if (!this._today) {
        this._today = new TodayList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._today;
    },
  });

  Object.defineProperty(RecordListInstance,
    'yearly', {
    get: function yearly() {
      if (!this._yearly) {
        this._yearly = new YearlyList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._yearly;
    },
  });

  Object.defineProperty(RecordListInstance,
    'yesterday', {
    get: function yesterday() {
      if (!this._yesterday) {
        this._yesterday = new YesterdayList(
          this._version,
          this._solution.accountSid
        );
      }

      return this._yesterday;
    },
  });

  return RecordListInstance;
}


/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.UsageContext.RecordInstance
 * @description Initialize the RecordContext
 *
 * @property {string} accountSid - The Account that accrued the usage
 * @property {string} apiVersion - The api_version
 * @property {record.category} category - The category of usage
 * @property {string} count -
 *          The number of usage events (e.g. the number of calls).
 * @property {string} countUnit - The unit in which `Count` is measured
 * @property {string} description -
 *          A human-readable description of the usage category.
 * @property {Date} endDate - The last date usage is included in this record
 * @property {number} price - The total price of the usage
 * @property {string} priceUnit - The currency in which `Price` is measured
 * @property {Date} startDate - The first date usage is included in this record
 * @property {string} subresourceUris - Subresources Uris for this UsageRecord
 * @property {string} uri - The URI for this resource
 * @property {string} usage - The amount of usage
 * @property {string} usageUnit - The units in which `Usage` is measured
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {object} payload - The instance payload
 */
/* jshint ignore:end */
function RecordInstance(version, payload, accountSid) {
  this._version = version;

  // Marshaled Properties
  this.accountSid = payload.account_sid; // jshint ignore:line
  this.apiVersion = payload.api_version; // jshint ignore:line
  this.category = payload.category; // jshint ignore:line
  this.count = payload.count; // jshint ignore:line
  this.countUnit = payload.count_unit; // jshint ignore:line
  this.description = payload.description; // jshint ignore:line
  this.endDate = deserialize.rfc2822DateTime(payload.end_date); // jshint ignore:line
  this.price = deserialize.decimal(payload.price); // jshint ignore:line
  this.priceUnit = payload.price_unit; // jshint ignore:line
  this.startDate = deserialize.rfc2822DateTime(payload.start_date); // jshint ignore:line
  this.subresourceUris = payload.subresource_uris; // jshint ignore:line
  this.uri = payload.uri; // jshint ignore:line
  this.usage = payload.usage; // jshint ignore:line
  this.usageUnit = payload.usage_unit; // jshint ignore:line

  // Context
  this._context = undefined;
  this._solution = {
    accountSid: accountSid,
  };
}

module.exports = {
  RecordPage: RecordPage,
  RecordList: RecordList,
  RecordInstance: RecordInstance,
  RecordContext: RecordContext
};