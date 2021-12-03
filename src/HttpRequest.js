import axios from 'axios';
import BatchRequest from './BatchRequest.js';
import HttpRequestBase from './HttpRequestBase.js';
import StandardError from '@unplgtc/standard-error';

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

		if (batchRequest.executing) {
			throw new Error(StandardError.BatchRequest_403().message);
		}

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
		if (!payload?.url) {
			return Promise.reject(StandardError.HttpRequest_400());
		}

		if (payload.resolveWithFullResponse) {
			delete payload.resolveWithFullResponse;

			return this.validator
				? this.validator(await axios({ ...payload, method }))
				: axios({ ...payload, method });

		} else {
			let resErr;
			const res = await axios({ ...payload, method })
				.catch(err => (resErr = err));

			if (resErr) {
				return Promise.reject(resErr);

			} else {
				return this.validator
					? this.validator(res?.data)
					: res?.data;
			}
		}
	}
}

StandardError.add([
	{ code: 'HttpRequest_400', domain: 'HttpRequest', title: 'Bad Request', message: 'HTTP Request missing url' },
	{ code: 'BatchRequest_403', domain: 'BatchRequest', title: 'Forbidden', message: 'Batch is already executing' }
]);

// Delegate HttpRequest -> HttpRequestBase
Object.setPrototypeOf(HttpRequest, HttpRequestBase);

export default HttpRequest;
