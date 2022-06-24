import axios from 'axios';
import { createError } from '@unplgtc/standard-error';
import HttpRequestBase from './HttpRequestBase.js';

const MissingUrlOrMethodError = createError({
	name: 'MissingUrlOrMethodError',
	message: 'Cannot execute a BatchRequest with no URL or method'
});

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
		if (!milliseconds || milliseconds < 50) {
			milliseconds = 50;
		}

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
		this.method = method;

		if (this.parent && !this.parent.executing) {
			this.parent.clearExecutionTimer();
			this.parent.executeAll(this.parent.requests)();
		}

		return this.result;
	},

	executeDelayed(method) {
		this.method = method;

		if (this.parent && !this.parent.executing) {
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
			this.executing = true;

			this.throttleMs
				? await this.executeThrottled(requests)
				: await this.executeConcurrently(requests);

			this.cleanup();

			this.executing = false;
		}
	},

	executeConcurrently(requests) {
		return Promise.allSettled(
			requests.map(request => this.executeOne(request))
		);
	},

	executeThrottled: async function(requests) {
		for (const request of requests) {
			await (this.throttleRequest(request));
		}
	},

	throttleRequest(request) {
		return new Promise((resolve) => {
			return setTimeout(() => {
				resolve(this.executeOne(request));
			}, this.throttleMs);
		});
	},

	executeOne: async function(request) {
		if (!request?.payload?.url || !request.method) {
			return request.reject(new MissingUrlOrMethodError());
		}

		if (request.payload.resolveWithFullResponse) {
			delete request.payload.resolveWithFullResponse;

			return request.resolve(
				request.validator
					? request.validator(await axios({ ...request.payload, method: request.method }))
					: axios({ ...request.payload, method: request.method })
			);

		} else {
			let resErr;
			const res = await axios({ ...request.payload, method: request.method })
				.catch(err => (resErr = err));

			if (resErr) {
				return request.reject(resErr);

			} else {
				return request.resolve(
					this.validator
						? request.validator(res?.data)
						: res?.data
				);
			}
		}
	}
}

// Delegate BatchRequest -> HttpRequestBase
Object.setPrototypeOf(BatchRequest, HttpRequestBase);

export default BatchRequest;
