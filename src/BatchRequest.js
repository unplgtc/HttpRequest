'use strict'

const HttpRequestBase = require('./HttpRequestBase'),
      rp = require('request-promise-native'),
      StandardError = require('@unplgtc/standard-error');

let executionTimer;

const BatchRequest = {
	requests: [], // How do we clean these once they've executed?

	stallMs: 50,
	
	stall(milliseconds) {
		this.parent
		? (this.parent.stallMs = milliseconds)
		: (this.stallMs = milliseconds);

		return this;
	},

	throttle(milliseconds) {
		this.parent
		? (this.parent.throttleMs = milliseconds)
		: (this.throttleMs = milliseconds);

		return this;
	},

	addRequest(cleanup) {
		const child = this.spawnChild();
		child.result = new Promise((resolve, reject) => {
			child.resolve = resolve;
			child.reject = reject;
		});

		this.requests.push(child);
		this.cleanup = cleanup;

		return child;
	},

	spawnChild() {
		return Object.create(this)
			.setParent(this);
	},

	setParent(parent) {
		Object.defineProperty(this, 'parent', {
			value: parent,
			writable: false,
			configurable: false,
			enumerable: false
		});

		return this;
	},

	set executionTimer(executor) {
		executionTimer && clearTimeout(executionTimer);

		executor && (executionTimer = setTimeout(executor, this.stallMs));
	},

	get(shouldExecute) {
		return shouldExecute
		? this.execute('get')
		: this.executeDelayed('get');
	},

	post(shouldExecute) {
		return shouldExecute
		? this.execute('post')
		: this.executeDelayed('post');
	},

	put(shouldExecute) {
		return shouldExecute
		? this.execute('put')
		: this.executeDelayed('put');
	},

	delete(shouldExecute) {
		return shouldExecute
		? this.execute('delete')
		: this.executeDelayed('delete');
	},

	execute(method) {
		if (this.parent) {
			this.method = method;
			this.parent.clearExecutionTimer();
			this.parent.executeAll(this.parent.requests)();
		}

		return this.result;
	},

	executeDelayed(method) {
		if (this.parent) {
			this.method = method;
			this.parent.setExecutionTimer();
		}

		return this.result;
	},

	setExecutionTimer() {
		this.executionTimer = this.executeAll(this.requests);
	},

	clearExecutionTimer() {
		this.executionTimer = undefined;
	},

	executeAll(requests) {
		return async () => {
			this.throttle && this.throttle < 10
			? await this.executeConcurrently(requests)
			: await this.executeThrottled(requests);

			this.cleanup();
		}
	},

	executeConcurrently(requests) {
		return Promise.all(
			requests.map(request => this.executeOne(request))
		);
	},

	executeThrottled: async function(requests) {
		for (const request of requests) {
			await (this.throttledRequest(request));
		}
	},

	throttledRequest(request) {
		return new Promise((resolve) => {
			return setTimeout(() => {
				resolve(this.executeOne(request));
			}, this.throttleMs);
		});
	},

	executeOne: async function(request) {
		if (!Object.keys(request.payload).length || !request.payload.url || !request.method) {
			return request.reject(StandardError.BatchRequest_400());
		}
		return request.resolve(
			request.validator
			? request.validator(await rp[request.method](request.payload))
			: rp[request.method](request.payload)
		);
	}
}

StandardError.add([
	{code: 'BatchRequest_400', domain: 'HttpRequest', title: 'Bad Request', message: 'Cannot execute batched HttpRequest with empty payload, url, or method'}
]);

// Delegate BatchRequest -> HttpRequestBase
Object.setPrototypeOf(BatchRequest, HttpRequestBase);

module.exports = BatchRequest;
