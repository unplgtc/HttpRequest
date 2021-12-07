import axios from 'axios';
import BatchRequest from './BatchRequest.js';
import HttpRequestBase from './HttpRequestBase.js';
import { createErrors } from '@unplgtc/standard-error';

const [ MissingUrlError, BatchAlreadyExecutingError ] = createErrors([
	{
		name: 'MissingUrlError',
		message: 'Cannot execute an HttpRequest with no URL'
	},
	{
		name: 'BatchAlreadyExecutingError',
		message: 'Cannot execute a BatchRequest that is already being executed (make sure you aren\'t passing `true` to the executor functions more than once for the same batch, or try increasing the `stall` timeout)'
	}
]);

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
			throw new BatchAlreadyExecutingError();
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
			return Promise.reject(new MissingUrlError());
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

// Delegate HttpRequest -> HttpRequestBase
Object.setPrototypeOf(HttpRequest, HttpRequestBase);

export default HttpRequest;
