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
}

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
}

const simpleMockedResponse = {
	testing: true
}

const simpleMockedResponse2 = {
	testing2: true
}

test('Can create and execute a batch request with one request', async() => {
	// Setup
	const id = 'id_1';
	rp.post.mockResolvedValue(simpleMockedResponse);

	const req = HttpRequest.batch(id)
		.url(simplePutPostPayload.url)
		.header('header1', simplePutPostPayload.headers.header1)
		.body(simplePutPostPayload.body)
		.json(simplePutPostPayload.json);

	// Execute
	const res = await req.post();

	// Test
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res).toBe(simpleMockedResponse);
});

test('Can create and execute a batch request with multiple requests', async() => {
	// Setup
	const id = 'id_2';
	rp.get.mockResolvedValue(simpleMockedResponse);
	rp.post.mockResolvedValue(simpleMockedResponse2);

	const req1 = HttpRequest.batch(id)
		.url(simpleGetDeletePayload.url)
		.header('header1', simpleGetDeletePayload.headers.header1)
		.json(simpleGetDeletePayload.json)
		.get();

	const req2 = HttpRequest.batch(id)
		.url(simplePutPostPayload.url)
		.header('header1', simplePutPostPayload.headers.header1)
		.body(simplePutPostPayload.body)
		.json(simplePutPostPayload.json)
		.post();

	// Execute
	const res1 = await req1;
	const res2 = await req2;

	// Test
	expect(rp.get).toHaveBeenCalledWith(simpleGetDeletePayload);
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res1).toBe(simpleMockedResponse);
	expect(res2).toBe(simpleMockedResponse2);
});

test('Can create and execute a batch request with throttled requests', async() => {
	// Setup
	const id = 'id_3';
	rp.get.mockResolvedValue(simpleMockedResponse);
	rp.post.mockResolvedValue(simpleMockedResponse2);

	// Test
	expect(HttpRequest.batchRequests[id]).toBe(undefined);

	// Setup
	const req1 = HttpRequest.batch(id)
		.throttle(50)
		.url(simpleGetDeletePayload.url)
		.header('header1', simpleGetDeletePayload.headers.header1)
		.json(simpleGetDeletePayload.json)
		.get();

	const req2 = HttpRequest.batch(id)
		.throttle(50)
		.url(simplePutPostPayload.url)
		.header('header1', simplePutPostPayload.headers.header1)
		.body(simplePutPostPayload.body)
		.json(simplePutPostPayload.json)
		.post();

	// Test
	expect(HttpRequest.batchRequests[id]).not.toBe(undefined);

	// Execute
	const res1 = await req1;
	const res2 = await req2;

	// Test
	expect(rp.get).toHaveBeenCalledWith(simpleGetDeletePayload);
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res1).toBe(simpleMockedResponse);
	expect(res2).toBe(simpleMockedResponse2);

	// Delay by one clock cycle to allow HttpRequest to clean up the executed batch
	await new Promise((resolve, reject) => {
		setTimeout(() => { resolve() }, 1);
	});
	expect(HttpRequest.batchRequests[id]).toBe(undefined);
});

test('StandardError returned when batch request is made without method', async() => {
	// Setup
	const id = 'id_4';
	rp.get.mockResolvedValue(simpleMockedResponse);
	rp.post.mockResolvedValue(simpleMockedResponse2);

	const req1 = HttpRequest.batch(id)
		.url(simpleGetDeletePayload.url)
		.header('header1', simpleGetDeletePayload.headers.header1)
		.json(simpleGetDeletePayload.json)
		.get();

	const req2 = HttpRequest.batch(id)
		.url(simplePutPostPayload.url)
		.header('header1', simplePutPostPayload.headers.header1)
		.body(simplePutPostPayload.body)
		.json(simplePutPostPayload.json)

	// Execute
	const res1 = await req1;

	let resErr;
	const res2 = await req2.result
		.catch((err) => { resErr = err });

	// Test
	expect(rp.get).toHaveBeenCalledWith(simpleGetDeletePayload);
	expect(res1).toBe(simpleMockedResponse);
	expect(resErr).toEqual(StandardError.BatchRequest_400());
	expect(res2).toBe(undefined);
});

test('StandardError returned when batch request is made without url', async() => {
	// Setup
	const id = 'id_5';

	const req = HttpRequest.batch(id).get();

	// Execute
	let resErr;
	const res = await req
		.catch((err) => { resErr = err });

	// Test
	expect(resErr).toEqual(StandardError.BatchRequest_400());
	expect(res).toBe(undefined);
});

test('Can immediately execute a batch request', async() => {
	// Setup
	const id = 'id_6';
	rp.get.mockResolvedValue(simpleMockedResponse);
	rp.post.mockResolvedValue(simpleMockedResponse2);

	const req1 = HttpRequest.batch(id)
		.url(simpleGetDeletePayload.url)
		.header('header1', simpleGetDeletePayload.headers.header1)
		.json(simpleGetDeletePayload.json)
		.get();

	const req2 = HttpRequest.batch(id)
		.url(simplePutPostPayload.url)
		.header('header1', simplePutPostPayload.headers.header1)
		.body(simplePutPostPayload.body)
		.json(simplePutPostPayload.json)
		.post(true);

	// Execute
	const res1 = await req1;
	const res2 = await req2;

	// Test
	expect(rp.get).toHaveBeenCalledWith(simpleGetDeletePayload);
	expect(rp.post).toHaveBeenCalledWith(simplePutPostPayload);
	expect(res1).toBe(simpleMockedResponse);
	expect(res2).toBe(simpleMockedResponse2);
});
