'use strict';

const HttpRequestBase = {
	get payload() {
		return {
			...(this._options != null && this._options),
			...(this._url != null     && { url: this._url         }),
			...(this._headers != null && { headers: this._headers }),
			...(this._body != null    && { body: this._body       }),
			...(this._json != null    && { json: this._json       }),
			...(this._qs != null      && { qs: this._qs           }),
			...(this._timeout != null && { timeout: this._timeout }),
			resolveWithFullResponse: (this._resolveWithFullResponse != null ?
				this._resolveWithFullResponse : false
			)
		}
	},

	build(data = {}) {
		const {url, headers, body, json, qs, resolveWithFullResponse, timeout, ...options} = data;

		url != null     && (this._url = url);
		headers != null && (this._headers = headers);
		body != null    && (this._body = body);
		json != null    && (this._json = json);
		qs != null      && (this._qs = qs);
		timeout != null && (this._timeout = timeout);
		resolveWithFullResponse != null && (this._resolveWithFullResponse = resolveWithFullResponse);

		Object.keys(options).length > 0 && (this._options = options);

		return this;
	},

	url(url) {
		this._url = url;
		return this;
	},

	header(key, value) {
		if (!this._headers) {
			this._headers = {};
		}
		this._headers[key] = value;
		return this;
	},

	headers(headers) {
		this._headers = Object.assign(headers, this._headers);
		return this;
	},

	body(body) {
		this._body = body;
		return this;
	},

	json(json) {
		// If nothing is passed to this function, set _json to true
		this._json = json != null ? json : true;
		return this;
	},

	resolveWithFullResponse(resolveWithFullResponse) {
		// If nothing is passed to this function, set _resolveWithFullResponse to true
		this._resolveWithFullResponse = resolveWithFullResponse != null ? resolveWithFullResponse : true;
		return this;
	},

	qs(qs) {
		this._qs = qs;
		return this;
	},

	timeout(timeout) {
		this._timeout = timeout;
		return this;
	},

	option(key, value) {
		return this.build({
			...(this._options != null && this._options), 
			[key]: value 
		});
	},

	options(options) {
		this.options = {};
		// set native fields first, then options
		return this.build(options);
	},

	validate(validator) {
		Object.defineProperty(this, 'validator', {
			value: validator,
			writable: false,
			configurable: false,
			enumerable: false
		});
		return this;
	}
}

module.exports = HttpRequestBase;
