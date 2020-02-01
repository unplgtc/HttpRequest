'use strict';

const HttpRequest = require('./../src/HttpRequest');
const rp = require('request-promise-native');
const StandardError = require('@unplgtc/standard-error');

jest.mock('request-promise-native');

const simpleGetDeletePayload = {
	url: 'test_url',
	headers: {
		header1: 'test_header'
	},
	json: true,
	resolveWithFullResponse: false
};

const simplePutPostPayload = {
	url: 'test_url',
	headers: {
		header1: 'test_header'
	},
	body: {
		testing: true
	},
	json: true,
	resolveWithFullResponse: false
};

const resolveWithFullResponsePutPostPayload = {
	url: 'test_url',
	headers: {
		header1: 'test_header'
	},
	body: {
		testing: true
	},
	json: true,
	resolveWithFullResponse: true
};

const payloadWithoutUrl = {
	headers: {
		header1: 'test_header'
	},
	json: true
};

const simpleMockedResponse = {
	testing: true
};

test('Can access the payload', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Test
	expect(req.payload).toEqual(simpleGetDeletePayload);
});

test('Can send a GET request', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Execute
	const res = await req.get();

	// Test
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a POST request', async() => {
	// Setup
	rp.post.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simplePutPostPayload);

	// Execute
	const res = await req.post();

	// Test
	expect(rp.post).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a PUT request', async() => {
	// Setup
	rp.put.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simplePutPostPayload);

	// Execute
	const res = await req.put();

	// Test
	expect(rp.put).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a DELETE request', async() => {
	// Setup
	rp.delete.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Execute
	const res = await req.delete();

	// Test
	expect(rp.delete).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can build and send a request in one line', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);

	// Execute
	const res = await req.build(simpleGetDeletePayload).get();

	// Test
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('StandardError returned when request is made with empty payload', async() => {
	// Setup
	const req = Object.create(HttpRequest);
	req.build();

	// Execute
	let resErr;
	const res = await req.get()
		.catch((err) => { resErr = err });

	// Test
	expect(rp.get).not.toHaveBeenCalled();
	expect(resErr).toEqual(StandardError.HttpRequest_400());
	expect(res).toBe(undefined);
});

test('StandardError returned when request is made with empty url', async() => {
	// Setup
	const req = Object.create(HttpRequest);
	req.build(payloadWithoutUrl);

	// Execute
	let resErr;
	const res = await req.get()
		.catch((err) => { resErr = err });

	// Test
	expect(rp.get).not.toHaveBeenCalled();
	expect(resErr).toEqual(StandardError.HttpRequest_400());
	expect(res).toBe(undefined);
});

test('Can execute a request directly', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build(simpleGetDeletePayload);

	// Execute
	const res = await req.execute('get');

	// Test
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can assemble a request piece by piece', async() => {
	// Setup
	rp.post.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.url(simplePutPostPayload.url);
	req.headers(simplePutPostPayload.headers);
	req.body(simplePutPostPayload.body);
	req.json(simplePutPostPayload.json);

	// Execute
	const res = await req.post();

	// Test
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can chain the piece by piece assembly of a request', async() => {
	// Setup
	rp.post.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.url(simplePutPostPayload.url)
	   .header('header1', simplePutPostPayload.headers.header1)
	   .body(simplePutPostPayload.body)
	   .json(simplePutPostPayload.json);

	// Execute
	const res = await req.post();

	// Test
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res).toBe(simpleMockedResponse);
});

test('resolveWithFullResponse and json can be set to true by not passing values', async() => {
	// Setup
	rp.post.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.url(simplePutPostPayload.url)
	   .header('header1', simplePutPostPayload.headers.header1)
	   .body(simplePutPostPayload.body)
	   .resolveWithFullResponse()
	   .json();

	// Execute
	const res = await req.post();

	// Test
	expect(rp.post).toHaveBeenCalledWith(resolveWithFullResponsePutPostPayload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can chain creation, assembly, and execution of an HttpRequest', async() => {
	// Setup
	rp.post.mockResolvedValue(simpleMockedResponse);

	// Execute
	const res = await HttpRequest.create()
	                           .url(simplePutPostPayload.url)
	                           .headers(simplePutPostPayload.headers)
	                           .body(simplePutPostPayload.body)
	                           .json(simplePutPostPayload.json)
	                           .post();

	// Test
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a GET request with a query string', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		qs: {
			query: 'some string',
			page: 4
		}
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.qs).toEqual({
		query: 'some string',
		page: 4
	});
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Has a proper default payload value for "resolveWithFullResponse"', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);
	
	const {resolveWithFullResponse, ...reqPayload} = simpleGetDeletePayload;

	const req = Object.create(HttpRequest);
	req.build(reqPayload);

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.resolveWithFullResponse).toBe(false);
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a request with a timeout', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		timeout: 3000
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.timeout).toBe(3000);
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a request with "resolveWithFullResponse" flag', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		resolveWithFullResponse: false
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.resolveWithFullResponse).toBe(false);
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can send a GET request with additional option arguments', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

	const req = Object.create(HttpRequest);
	req.build({
		...simpleGetDeletePayload,
		someTestingOption: true
	});

	// Execute
	const res = await req.get();

	// Test
	expect(req.payload.someTestingOption).toBe(true);
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can edit a POST request optional parameter after creation', async() => {
	// Setup
	rp.post.mockResolvedValue(simpleMockedResponse);

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
	expect(rp.post).toHaveBeenCalledWith(req.payload);
	expect(res).toBe(simpleMockedResponse);
});

test('Will call validation function with resolved response data', async() => {
	// Setup
	rp.get.mockResolvedValue(simpleMockedResponse);

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
	expect(rp.get).toHaveBeenCalledWith(req.payload);
	expect(validationFunction).toHaveBeenCalledWith(simpleMockedResponse);
	expect(res).toBe(simpleMockedResponse);
});
