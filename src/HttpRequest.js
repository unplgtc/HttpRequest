'use strict';

const BatchRequest = require('./BatchRequest'),
      HttpRequestBase = require('./HttpRequestBase'),
      rp = require('request-promise-native'),
      StandardError = require('@unplgtc/standard-error');

const batchRequests = {};

const HttpRequest = {
	get batchRequests() {
		return batchRequests;
	},

	create() {
		return Object.create(this);
	},

	batch(id) {
		const batchRequest = batchRequests[id] ||
			(batchRequests[id] = Object.create(BatchRequest));

		return batchRequest.addRequest(this.batchCleaner(id));
	},

	batchCleaner(id) {
		return () => {
			delete batchRequests[id];
		}
	},

	get(payload = this.payload) {
		return this.execute('get', payload);
	},

	post(payload = this.payload) {
		return this.execute('post', payload);
	},

	put(payload = this.payload) {
		return this.execute('put', payload);
	},

	delete(payload = this.payload) {
		return this.execute('delete', payload);
	},

	execute: async function(method, payload = this.payload) {
		if (!Object.keys(payload).length || !payload.url) {
			return Promise.reject(StandardError.HttpRequest_400());
		}
		return this.validator
		       ? this.validator(await rp[method](payload))
		       : rp[method](payload);
	}
}

StandardError.add([
	{code: 'HttpRequest_400', domain: 'HttpRequest', title: 'Bad Request', message: 'Cannot execute HttpRequest with empty payload or url'}
]);

// Delegate HttpRequest -> HttpRequestBase
Object.setPrototypeOf(HttpRequest, HttpRequestBase);

module.exports = HttpRequest;
