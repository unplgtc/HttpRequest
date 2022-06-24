const HttpRequestBase = {
	get payload() {
		return {
			...(this._options != null      && this._options),
			...(this._url != null          && { url: this._url                   }),
			...(this._headers != null      && { headers: this._headers           }),
			...(this._body != null         && { data: this._body                 }),
			...(this._responseType != null && { responseType: this._responseType }),
			...(this._params != null       && { params: this._params             }),
			...(this._timeout != null      && { timeout: this._timeout           }),
			resolveWithFullResponse: (this._resolveWithFullResponse != null ?
				this._resolveWithFullResponse : false)
		}
	},

	build(payload = {}) {
		const { url, headers, body, data, json, responseType, params, qs, timeout, ...options } = payload;

		url != null          && (this._url = url);
		headers != null      && (this._headers = headers);
		body != null         && (this._body = body);
		data != null         && (this._body = data); // `data` overrides `body`
		json == true         && (this._responseType = 'json');
		responseType != null && (this._responseType = responseType); // `responseType` overrides `json`
		qs != null           && (this._params = qs);
		params != null       && (this._params = params); // `params` overrides `qs`
		timeout != null      && (this._timeout = timeout);

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

	data(data) {
		this._body = data;
		return this;
	},

	json() {
		this._responseType = 'json';
		return this;
	},

	responseType() {
		this._responseType = responseType;
		return this;
	},

	qs(qs) {
		this._params = qs;
		return this;
	},

	params(params) {
		this._params = params;
		return this;
	},

	timeout(timeout) {
		this._timeout = timeout;
		return this;
	},

	resolveWithFullResponse(resolveWithFullResponse) {
		// If nothing is passed to this function, set _resolveWithFullResponse to true
		this._resolveWithFullResponse = resolveWithFullResponse != null ? resolveWithFullResponse : true;
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

let rTracer;
try { rTracer = await import('cls-rtracer'); } catch (err) {}

HttpRequestBase._rTracer = rTracer;
HttpRequestBase._request_id_header = 'x-request-id';

export default HttpRequestBase;
