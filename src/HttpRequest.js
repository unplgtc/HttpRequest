'use strict';

const Request = require('./Request');
const StandardError = require('./StandardError');
const _ = require('./StandardPromise');

const HttpRequest = {
	get payload() {
		var payload = {
			url: this.url
		}
		if (this.headers) {
			payload.headers = this.headers;
		}
		if (this.body) {
			payload.body = this.body;
		}
		if (this.json) {
			payload.json = this.json;
		}

		return payload;
	},

	init: function (data) {
		if (data.url) {
			this.url = data.url;
		}
		if (data.headers) {
			this.headers = data.headers;
		}
		if (data.body) {
			this.body = data.body;
		}
		if (data.json) {
			this.json = data.json;
		}
		return this;
	},

	setUrl(url) {
		this.url = url;
	},

	setHeader(key, value) {
		this.headers[key] = value;
	},

	setHeaders(headers) {
		this.headers = headers;
	},

	setBody(body) {
		this.body = body;
	},

	setJson(json) {
		this.json = json;
	}
}

const HttpRequestExecutor = {
	get: async function(payload = this.payload) {
		return new Promise(async(resolve, reject) => {
			if (!payload) {
				reject(StandardError[700]);
			}
			var res = await _(Request.get(payload));

			resolve(res);
		});
	},

	post: async function(payload = this.payload) {
		return new Promise(async(resolve, reject) => {
			if (!payload) {
				reject(StandardError[700]);
			}
			var res = await _(Request.post(payload));

			resolve(res);
		});
	},

	put: async function(payload = this.payload) {
		return new Promise(async(resolve, reject) => {
			if (!payload) {
				reject(StandardError[700]);
			}
			var res = await _(Request.put(payload));

			resolve(res);
		});
	},

	delete: async function(payload = this.payload) {
		return new Promise(async(resolve, reject) => {
			if (!payload) {
				reject(StandardError[700]);
			}
			var res = await _(Request.delete(payload));

			resolve(res);
		});
	}
}

// Delegate from HttpRequest to HttpRequestExecutor
Object.setPrototypeOf(HttpRequest, HttpRequestExecutor);

module.exports = HttpRequest;
