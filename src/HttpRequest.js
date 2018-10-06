'use strict';

const _ = require('@unplgtc/standard-promise');
const rp = require('request-promise-native');
const StandardError = require('@unplgtc/standard-error');

const HttpRequest = {
	get payload() {
		return {
			...this.url != null     ? { url: this.url         } : null,
			...this.headers != null ? { headers: this.headers } : null,
			...this.body != null    ? { body: this.body       } : null,
			...this.json != null    ? { json: this.json       } : null
		}
	},

	create() {
		return Object.create(this);
	},

	build(data = {}) {
		data.url != null ? this.url = data.url : null;
		data.headers != null ? this.headers = data.headers : null;
		data.body != null ? this.body = data.body : null;
		data.json != null ? this.json = data.json : null;
		return this;
	},

	setUrl(url) {
		this.url = url;
		return this;
	},

	setHeader(key, value) {
		if (!this.headers) {
			this.headers = {};
		}
		this.headers[key] = value;
		return this;
	},

	setHeaders(headers) {
		this.headers = headers;
		return this;
	},

	setBody(body) {
		this.body = body;
		return this;
	},

	setJson(json) {
		this.json = json;
		return this;
	}
}

const HttpRequestExecutor = {
	get(payload = this.payload) {
		return Promise.resolve(_(this.execute('get', payload)));
	},

	post(payload = this.payload) {
		return Promise.resolve(_(this.execute('post', payload)));
	},

	put(payload = this.payload) {
		return Promise.resolve(_(this.execute('put', payload)));
	},

	delete(payload = this.payload) {
		return Promise.resolve(_(this.execute('delete', payload)));
	},

	execute: async function(method, payload = this.payload) {
		return new Promise(async(resolve, reject) => {
			if (!Object.keys(payload).length || !payload.url) {
				reject(StandardError.HttpRequestExecutor_400);
			} else {
				resolve(rp[method](payload));
			}
		});
	}
}

StandardError.add([
	{code: 'HttpRequestExecutor_400', domain: 'HttpRequest', title: 'Bad Request', message: 'Cannot execute HttpRequest with empty payload or url'}
]);

// Delegate from HttpRequest to HttpRequestExecutor
Object.setPrototypeOf(HttpRequest, HttpRequestExecutor);

module.exports = HttpRequest;
