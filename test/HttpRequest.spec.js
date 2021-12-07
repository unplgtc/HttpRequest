import axios from 'axios';
import Errors from '@unplgtc/standard-error';
const { MissingUrlError } = Errors;
import HttpRequest from './../src/HttpRequest.js';
import { jest } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

const url = 'test_url';

const simpleGetDeletePayload = {
	url,
	headers: {
		header1: 'test_header'
	},
	responseType: 'json',
	resolveWithFullResponse: false
};

const simplePutPostPayload = {
	url,
	headers: {
		header1: 'test_header'
	},
	body: {
		testing: true
	},
	responseType: 'json',
	resolveWithFullResponse: false
};

const resolveWithFullResponsePutPostPayload = {
	url,
	headers: {
		header1: 'test_header'
	},
	body: {
		testingFullResponse: true
	},
	responseType: 'json'
};

const payloadWithoutUrl = {
	headers: {
		header1: 'test_header'
	},
	responseType: 'json'
};

const simpleMockedResponse = {
	testing: true
};

test('Can access the payload', async() => {
	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Test
	expect(req.payload).toEqual(simpleGetDeletePayload);
});

test('Can send a GET request', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Execute
	const res = await req.get();

	// Test
	expect(mock.history.get.length).toBe(1);
	expect(mock.history.get[0].url).toBe(simpleGetDeletePayload.url);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can send a POST request', async() => {
	// Setup
	mock.reset();
	mock.onPost(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simplePutPostPayload);

	// Execute
	const res = await req.post();

	// Test
	expect(mock.history.post.length).toBe(1);
	expect(mock.history.post[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload.body));
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can send a PUT request', async() => {
	// Setup
	mock.reset();
	mock.onPut(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simplePutPostPayload);

	// Execute
	const res = await req.put();

	// Test
	expect(mock.history.put.length).toBe(1);
	expect(mock.history.put[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload.body));
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can send a DELETE request', async() => {
	// Setup
	mock.reset();
	mock.onDelete(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Execute
	const res = await req.delete();

	// Test
	expect(mock.history.delete.length).toBe(1);
	expect(mock.history.delete[0].url).toBe(simpleGetDeletePayload.url);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can build and send a request in one line', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);

	// Execute
	const res = await req.build(simpleGetDeletePayload).get();

	// Test
	expect(mock.history.get.length).toBe(1);
	expect(mock.history.get[0].url).toBe(simpleGetDeletePayload.url);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('StandardError returned when request is made with empty payload', async() => {
	// Setup
	mock.reset();

	const req = Object.create(HttpRequest);
	req.build();

	// Execute
	let resErr;
	const res = await req.get()
		.catch((err) => { resErr = err });

	// Test
	expect(mock.history.get.length).toBe(0);
	expect(resErr instanceof MissingUrlError).toBe(true);
	expect(res).toBe(undefined);
});

test('StandardError returned when request is made with empty url', async() => {
	// Setup
	mock.reset();

	const req = Object.create(HttpRequest);
	req.build(payloadWithoutUrl);

	// Execute
	let resErr;
	const res = await req.get()
		.catch((err) => { resErr = err });

	// Test
	expect(mock.history.get.length).toBe(0);
	expect(resErr instanceof MissingUrlError).toBe(true);
	expect(res).toBe(undefined);
});

test('Can execute a request directly', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Execute
	const res = await req.execute('get');

	// Test
	expect(mock.history.get.length).toBe(1);
	expect(mock.history.get[0].url).toBe(simpleGetDeletePayload.url);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can assemble a request piece by piece', async() => {
	// Setup
	mock.reset();
	mock.onPost(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.url(simplePutPostPayload.url);
	req.headers(simplePutPostPayload.headers);
	req.body(simplePutPostPayload.body);
	req.json();

	// Execute
	const res = await req.post();

	// Test
	expect(mock.history.post.length).toBe(1);
	expect(mock.history.post[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload.body));
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can chain the piece by piece assembly of a request', async() => {
	// Setup
	mock.reset();
	mock.onPost(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.url(simplePutPostPayload.url)
	   .header('header1', simplePutPostPayload.headers.header1)
	   .body(simplePutPostPayload.body)
	   .json();

	// Execute
	const res = await req.post();

	// Test
	expect(mock.history.post.length).toBe(1);
	expect(mock.history.post[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload.body));
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('resolveWithFullResponse can be set to true by not passing value', async() => {
	// Setup
	mock.reset();
	mock.onPost(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.url(resolveWithFullResponsePutPostPayload.url)
	   .header('header1', resolveWithFullResponsePutPostPayload.headers.header1)
	   .body(resolveWithFullResponsePutPostPayload.body)
	   .json()
	   .resolveWithFullResponse();

	// Execute
	const res = await req.post();

	// Test
	expect(mock.history.post.length).toBe(1);
	expect(mock.history.post[0].data).toStrictEqual(JSON.stringify(resolveWithFullResponsePutPostPayload.body));
	expect(res.status).toBe(200);
	expect(res.data).toStrictEqual(simpleMockedResponse);
});

test('Can chain creation, assembly, and execution of an HttpRequest', async() => {
	// Setup
	mock.reset();
	mock.onPost(url).reply(200, simpleMockedResponse);

	// Execute
	const res = await HttpRequest.create()
		.url(simplePutPostPayload.url)
		.headers(simplePutPostPayload.headers)
		.body(simplePutPostPayload.body)
		.json()
		.post();

	// Test
	expect(mock.history.post.length).toBe(1);
	expect(mock.history.post[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload.body));
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can send a GET request with a query string', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const params = {
		page: 4,
		query: 'some string'
	};

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		params
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.params).toStrictEqual(params);
	expect(mock.history.get.length).toBe(1);
	expect(JSON.stringify(mock.history.get[0].params)).toStrictEqual(JSON.stringify(params));
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can send a request with a timeout', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		timeout: 3000
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.timeout).toBe(3000);
	expect(mock.history.get.length).toBe(1);
	expect(mock.history.get[0].url).toBe(simpleGetDeletePayload.url);
	expect(mock.history.get[0].timeout).toBe(3000);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can send a GET request with additional option arguments', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		someTestingOption: true
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.someTestingOption).toBe(true);
	expect(mock.history.get.length).toBe(1);
	expect(mock.history.get[0].url).toBe(simpleGetDeletePayload.url);
	expect(mock.history.get[0].someTestingOption).toBe(true);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Can edit a POST request optional parameter after creation', async() => {
	// Setup
	mock.reset();
	mock.onPost(url).reply(200, simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simplePutPostPayload,
		myTestOption: 1234
	});

	req.option('myTestOption', 4321);

	// Execute
	const res = await req.post();

	// Test
	expect(req.payload.myTestOption).toBe(4321);
	expect(mock.history.post.length).toBe(1);
	expect(mock.history.post[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload.body));
	expect(mock.history.post[0].myTestOption).toBe(4321);
	expect(res).toStrictEqual(simpleMockedResponse);
});

test('Will call validation function with resolved response data', async() => {
	// Setup
	mock.reset();
	mock.onGet(url).reply(200, simpleMockedResponse);

	const validationFunction = jest.fn(data => {
		if (!data.testing) {
			throw new Error('Failed validation!');
		}
		return data;
	});

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload
	})
	.validate(validationFunction);

	// Execute
	const res = await req.get();

	// Test
	expect(mock.history.get.length).toBe(1);
	expect(mock.history.get[0].url).toBe(req.payload.url);
	expect(res).toStrictEqual(simpleMockedResponse);
	expect(validationFunction).toHaveBeenCalledWith(simpleMockedResponse);
});
