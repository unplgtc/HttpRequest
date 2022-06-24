import axios from 'axios';
import Errors from '@unplgtc/standard-error';
const { MissingUrlOrMethodError } = Errors.HttpRequest;
import HttpRequest from './../src/HttpRequest.js';
import { jest } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

const url = (id) => `test_url_${id}`;

const simpleGetDeletePayload = (id) => ({
	url: url(id),
	headers: {
		header1: `test_header_${id}`
	},
	responseType: 'json',
	resolveWithFullResponse: false
});

const simplePutPostPayload = (id) => ({
	url: url(id),
	headers: {
		header1: `test_header_${id}`
	},
	body: {
		testing: id
	},
	responseType: 'json',
	resolveWithFullResponse: false
});

const simpleMockedResponse = (id, seed) => ({
	testing: (seed ? `${id}_${seed}` : id)
})

test('Can create and execute a batch request with one request', async() => {
	// Setup
	const id = 'id_1',
	      payload = simplePutPostPayload(id);

	mock.reset();
	mock.onPost(url(id)).reply(200, simpleMockedResponse(id));

	const req = HttpRequest.batch(id)
		.url(payload.url)
		.header('header1', payload.headers.header1)
		.body(payload.body)
		.json();

	// Execute
	const res = await req.post(true);

	// Test
	const mockedPosts = mock.history.post.filter(it => it.url === url(id));

	expect(mockedPosts.length).toBe(1);
	expect(mockedPosts[0].data).toStrictEqual(JSON.stringify(payload.body));
	expect(res).toStrictEqual(simpleMockedResponse(id));
});

test('Can create and execute a batch request with multiple requests', async() => {
	// Setup
	const id = 'id_2',
	      payload1 = simpleGetDeletePayload(id),
	      payload2 = simplePutPostPayload(id);

	mock.reset();
	mock.onGet(url(id)).reply(200, simpleMockedResponse(id, 'get'));
	mock.onPost(url(id)).reply(200, simpleMockedResponse(id, 'post'));

	const req1 = HttpRequest.batch(id)
		.url(payload1.url)
		.header('header1', payload1.headers.header1)
		.json()
		.get();

	const req2 = HttpRequest.batch(id)
		.url(payload2.url)
		.header('header1', payload2.headers.header1)
		.body(payload2.body)
		.json()
		.post();

	// Execute
	const res1 = await req1;
	const res2 = await req2;

	// Test
	const mockedGets = mock.history.get.filter(it => it.url === url(id));
	expect(mockedGets.length).toBe(1);
	expect(mockedGets[0].url).toBe(payload1.url);
	expect(res1).toStrictEqual(simpleMockedResponse(id, 'get'));

	const mockedPosts = mock.history.post.filter(it => it.url === url(id));
	expect(mockedPosts.length).toBe(1);
	expect(mockedPosts[0].data).toStrictEqual(JSON.stringify(payload2.body));
	expect(res2).toStrictEqual(simpleMockedResponse(id, 'post'));
});

test('Can create and execute a batch request with throttled requests', async() => {
	// Setup
	const id = 'id_3';
	mock.reset();
	mock.onGet(url(id)).reply(200, simpleMockedResponse(id, 'get'));
	mock.onPost(url(id)).reply(200, simpleMockedResponse(id, 'post'));

	// Test
	expect(HttpRequest.batchRequests[id]).toBe(undefined);

	// Setup
	const req1 = HttpRequest.batch(id)
		.throttle(50)
		.url(simpleGetDeletePayload(id).url)
		.header('header1', simpleGetDeletePayload(id).headers.header1)
		.json()
		.get();

	const req2 = HttpRequest.batch(id)
		.throttle(50)
		.url(simplePutPostPayload(id).url)
		.header('header1', simplePutPostPayload(id).headers.header1)
		.body(simplePutPostPayload(id).body)
		.json()
		.post();

	// Test
	expect(HttpRequest.batchRequests[id]).not.toBe(undefined);

	// Execute
	const res1 = await req1;
	const res2 = await req2;

	// Test
	const mockedGets = mock.history.get.filter(it => it.url === url(id));
	expect(mockedGets.length).toBe(1);
	expect(mockedGets[0].url).toBe(simpleGetDeletePayload(id).url);
	expect(res1).toStrictEqual(simpleMockedResponse(id, 'get'));

	const mockedPosts = mock.history.post.filter(it => it.url === url(id));
	expect(mockedPosts.length).toBe(1);
	expect(mockedPosts[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload(id).body));
	expect(res2).toStrictEqual(simpleMockedResponse(id, 'post'));

	// Delay by one clock cycle to allow HttpRequest to clean up the executed batch
	await new Promise((resolve, reject) => {
		setTimeout(() => { resolve() }, 1);
	});
	expect(HttpRequest.batchRequests[id]).toBe(undefined);
});

test('StandardError returned when batch request is made without method', async() => {
	// Setup
	const id = 'id_4';
	mock.reset();
	mock.onGet(url(id)).reply(200, simpleMockedResponse(id, 'get'));
	mock.onPost(url(id)).reply(200, simpleMockedResponse(id, 'post'));

	const req1 = HttpRequest.batch(id)
		.url(simpleGetDeletePayload(id).url)
		.header('header1', simpleGetDeletePayload(id).headers.header1)
		.get();

	const req2 = HttpRequest.batch(id)
		.url(simplePutPostPayload(id).url)
		.header('header1', simplePutPostPayload(id).headers.header1)
		.body(simplePutPostPayload(id).body);

	// Execute
	let resErr;
	const res1 = await req1;

	const res2 = await req2.result
		.catch((err) => { resErr = err });

	// Test
	const mockedGets = mock.history.get.filter(it => it.url === url(id));
	expect(mockedGets.length).toBe(1);
	expect(mockedGets[0].url).toBe(simpleGetDeletePayload(id).url);
	expect(res1).toStrictEqual(simpleMockedResponse(id, 'get'));

	expect(resErr instanceof MissingUrlOrMethodError).toBe(true);
	expect(res2).toBe(undefined);
});

test('StandardError returned when batch request is made without url', async() => {
	// Setup
	const id = 'id_5';
	mock.reset();

	const req = HttpRequest.batch(id).get();

	// Execute
	let resErr;
	const res = await req
		.catch((err) => { resErr = err });

	// Test
	expect(resErr instanceof MissingUrlOrMethodError).toBe(true);
	expect(res).toBe(undefined);
});

test('Can immediately execute a batch request', async() => {
	// Setup
	const id = 'id_6';
	mock.reset();
	mock.onGet(url(id)).reply(200, simpleMockedResponse(id, 'get'));
	mock.onPost(url(id)).reply(200, simpleMockedResponse(id, 'post'));

	const req1 = HttpRequest.batch(id)
		.url(simpleGetDeletePayload(id).url)
		.header('header1', simpleGetDeletePayload(id).headers.header1)
		.get();

	const req2 = HttpRequest.batch(id)
		.url(simplePutPostPayload(id).url)
		.header('header1', simplePutPostPayload(id).headers.header1)
		.body(simplePutPostPayload(id).body)
		.post(true);

	// Execute
	const res1 = await req1;
	const res2 = await req2;

	// Test
	const mockedGets = mock.history.get.filter(it => it.url === url(id));
	expect(mockedGets.length).toBe(1);
	expect(mockedGets[0].url).toBe(simpleGetDeletePayload(id).url);
	expect(res1).toStrictEqual(simpleMockedResponse(id, 'get'));

	const mockedPosts = mock.history.post.filter(it => it.url === url(id));
	expect(mockedPosts.length).toBe(1);
	expect(mockedPosts[0].data).toStrictEqual(JSON.stringify(simplePutPostPayload(id).body));
	expect(res2).toStrictEqual(simpleMockedResponse(id, 'post'));
});
