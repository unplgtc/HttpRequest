[![CircleCI master build status](https://img.shields.io/circleci/project/github/unplgtc/HttpRequest/master.svg?label=master&logo=circleci)](https://circleci.com/gh/unplgtc/HttpRequest/tree/master)
[![npm version](https://img.shields.io/npm/v/@unplgtc/http-request.svg)](https://www.npmjs.com/package/@unplgtc/http-request)

# HttpRequest

### Fluent HTTP request executor for Node applications

HttpRequest is a simple Node HTTP client which implements a [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface) to build and send requests. HttpRequest objects can be built in a number of different ways, including building and sending them immediately or building them over time and sending after all required pieces have been assembled. HttpRequest encourages thinking of requests as objects rather than actions: an HttpRequest object holds its payload internally and can send it at any time — immediately or later on. This is a subtle but important distinction from other HTTP clients which expect a completed payload to be passed into a function call for instant execution.

HttpRequest objects can be reused to fire the same request multiple time in a row, or to tweak a few request fields for different requests while persisting common values. They can be passed between functions and triggered by any of them without needing a particular function to deal with execution details. The fluid interface allows building HttpRequests with a chained syntax that is clear and concise.

HttpRequest also supports batching requests via the `HttpRequest.batch()` function, which will return a new BatchRequest object. BatchRequests are slightly different than standard HttpRequest objects, and are explained in detail below.

## Usage

Install HttpRequest from npm:

```
$ npm i @unplgtc/http-request
```

Import HttpRequest into your Node project (only ES Module import is support as of version 4.0.0):

```js
import HttpRequest from '@unplgtc/http-request';
```

Spawn new HttpRequest objects either with `Object.create(HttpRequest)` or with `HttpRequest.create()`:

```js
const req = Object.create(HttpRequest);

const anotherReq = HttpRequest.create();
```

`HttpRequest.create()` is just a shortcut for `Object.create(HttpRequest)`, so they can be used entirely interchangeably based on your code style preferences.

HttpRequests currently support seven **Native Fields**: `url`, `headers`, `body` (alias `data`), `responseType` (alias `json` as a shortcut for `responseType: 'json'`), `params` (alias `qs`), `timeout`, and `resolveWithFullResponse`. All additional fields supported by the [axios package](https://www.npmjs.com/package/axios) are still supported as **Option Fields**. All fields, both optional and native, can be set with a single payload using the `build()` function.

```js
const req = HttpRequest.create();

req.build({
	url: 'some_url',
	headers: {
		Authorization: 'some_token'
	},
	body: {
		someKey: 'some_value'
	},
	timeout: 5000,
	responseType: 'json'
});
```

### Native Fields

Each native field can be set individually using its eponymous setter, and can be referenced from the HttpRequest object's `payload` field. Boolean fields (`resolveWithFullResponse`) can be set to true by not passing any value to the setter (e.g., `.resolveWithFullResponse()` is equivalent to `.resolveWithFullResponse(true)`). An extra `header()` setter exists to set individual values in the `headers` field.

| Field Name                | Setter                         |
| ------------------------- | ------------------------------ |
| `url`                     | `url()`                        |
| `headers`                 | `headers()`                    |
| `body`                    | `body()` or `data()`           |
| `responseType`            | `responseType()` or `json()`   |
| `params`                  | `params()` or `qs()`           |
| `timeout`                 | `timeout()`                    |
| `resolveWithFullResponse` | `resolveWithFullResponse()`    |

```js
const req = HttpRequest.create()
	.url('some_url')
	.headers({
		Authorization: 'some_token'
	})
	.header('headerTitle', 'header_value')
	.body({
		someKey: 'some_value'
	})
	.timeout(3000)
	.resolveWithFullResponse()
	.json(); // Or `.responseType('json');`
```

### Option Fields

All option fields can be set using the `options()` or `option()` functions and referenced as children of the `options` field of the HttpRequest object's `payload`.

```js
const req = HttpRequest.create()
	.build({
		url: 'some_url',
		optionalField: 'data'
	});

// Get the optional field's data
const optionalData = req.payload.options.optionalField;

// Set an optional field to a new value
req.option('optionalField', 'other_data');
```

#### `.options(options)`

A function that sets all options to the specified payload. Any existing option fields will be overwritten.

#### `.option(key, value)`

The first argument is the name of the option to update. The second argument is the value to store for the specified option.

The option field with the specified key will be updated to the provided value.

### Response Validation

HttpRequest supports the passage of a validation function (a "validator") which will be executed on a successfully returned response. Validators are passed in via the `.validate()` function. When an HttpRequest with a validator is executed, it will automatically `await` the response and (if successful) pass it to the validator. Note that the validator will then be returned by HttpRequest, so validator functions will need to return the data after completion if it is required for further logic. If a response is unsuccessful then the promise will be rejected as usual and the validator will not be called.

```js
const res = HttpRequest.create()
	.url('some_url')
	.header('Authorization', 'some_token')
	.json()
	.validate(data => {
		if (data.verificationToken !== 'your_verification_token') {
			throw new Error('Invalid Verification Token in Response');
		}
		return data;
	})
	.get();
```

HttpRequest is unopinionated about your validation functions. Internally it calls (essentially) `return validator(await axios(payload))` instead of its normal `return axios(payload)`. If the call to `axios` fails then that failure is returned as a rejected promise just like in the normal case. If it succeeds then you get to validate your returned data in any way you please.

A common use case for this pattern is to verify objects against a JSON schema through a library like [`ajv`](https://github.com/epoberezkin/ajv). This way you can know immediately that a successfully returned result from HttpRequest is a valid object with expected parameters, which can significantly reduce the amount of safety checks that you may otherwise need scattered throughout your code.

```js
import Ajv from 'ajv';
import UserSchema from './path/to/some/UserSchema';
import HttpRequest from '@unplgtc/HttpRequest';

const ajv = new Ajv();

const res = HttpRequest.create()
	.url('some_url')
	.header('Authorization', 'some_token')
	.json()
	.validate(data => {
		if (!ajv.validate(UserSchema, data)) {
			throw new Error('Invalid User object returned in Response');
		}
		return data;
	})
	.get();
```

---

Send a request using the `.get()`, `.post()`, `.put()`, and `.delete()` methods.

```js
const res = req.put();
```

These can of course be chained along with the other functions to immediately build and send a request.

```js
const res = HttpRequest.create()
	.url('some_url')
	.header('Authorization', 'some_token')
	.body({ someKey: 'some_value' })
	.post();
```

The `build()` function can be chained as well.

```js
var res = HttpRequest.create()
	.build({ url: 'some_url' })
	.get();
```

Finally, if you have an existing HttpRequest object and want to review its payload, just pull it with the `payload` getter.

```js
const req = HttpRequest.create()
	.url('some_url');

console.log(req.payload);
// { url: 'some_url' }
```

## Batching and Throttling Requests

Requests can be grouped together into a batch using the `HttpRequest.batch('some_id')` function. Batches are automatically created when a new ID is used, and further requests can be added to the same batch by using the same ID in their creation call. A batch remains open for a default of 50 milliseconds before being automatically executed, a process which fires off all requests in the batch and then deletes the batch.

Batched requests support throttling via a `.throttle(<milliseconds>)` function. Whatever millisecond value is given will be used as a delay between the execution of each request in the batch. This functionality can help when dealing with an API that has strict rate limits. In the example below, two requests are created in a batch, and throttled so that they are executed 1 second apart from each other.

```js
const req1 = HttpRequest.batch('some_id')
	.throttle(1000)
	.build({url: 'some_url', json: true})
	.get();

const req2 = HttpRequest.batch('some_id')
	.throttle(1000)
	.build({url: 'some_url', json: true})
	.get();

const res1 = await req1,
      res2 = await req2;
```

It's worth noting that the throttle value is global for a batch. Technically you only need to call `throttle()` on one of the requests in your batch for it to be set for all of them. Calling throttle on different requests and passing different values will result in the last value being used for all requests.

If you don't call `throttle()` on any requests in a batch then all requests will be executed concurrently via `Promise.all()` when the batch is executed.

```js
const req1 = HttpRequest.batch('some_id')
	.build({ url: 'some_url' })
	.get();

const req2 = HttpRequest.batch('some_id')
	.build({ url: 'some_other_url' })
	.get();

const res1 = await req1, // Executed concurrently
      res2 = await req2; // Executed concurrently
```

For batched requests the `.get()`, `.post()`, `.put()`, and `.delete()` functions do *not* immediately invoke the request. Instead, those functions simply set the method option for their request. When the batch is executed, the specified method will be used for each request. Batch execution occurs automatically 50 milliseconds after the last request is added. If you don't want to or can't easily determine which request is the last one, HttpRequest will do it for you based on no more requests being added. Each time a request is added, the 50 millisecond clock resets.

The `stall()` function can be used to set the amount of time before a batch is automatically executed. If 50 milliseconds is too little time or too much time then you can chain a `.stall()` command to raise or lower the value for that batch.

```js
const req1 = HttpRequest.batch('some_id')
	.stall(5000)
	.throttle(1000)
	.build({ url: 'some_url' })
	.get();

const req2 = HttpRequest.batch('some_id')
	.build({ url: 'some_other_url' })
	.get();

const res1 = await req1, // Will execute after 5 seconds
      res2 = await req2; // Will execute after 6 seconds (1 second throttle after the 5 second stall)
```

If you know when your batch is ready to execute and wish to invoke all requests immediately after adding the final one, you can do so by passing `true` to the method command of your final request.

```js
const req1 = HttpRequest.batch('some_id')
	.throttle(1000)
	.build({url: 'some_url', json: true})
	.get();

const req2 = HttpRequest.batch('some_id')
	.build({url: 'some_url', json: true})
	.get(true); // Immediately executes the batch

const res1 = await req1,
      res2 = await req2;
```

Under the hood, `HttpRequest.batch()` returns a `BatchRequest` object rather than an `HttpRequest` object. That said, both `BatchRequest` and `HttpRequest` are prototype-chained to the same `HttpRequestBase` object. In other words, `BatchRequest` has an identical interface to `HttpRequest` for adding values to the request object. The only differences are the presence of `.batch()` on `HttpRequest`, the addition of `.throttle()` and `.stall()` on `BatchRequest`, and the altered behavior of `.get()`, `.post()`, `.put()`, and `.delete()` in that they do not immediately execute `BatchRequest`s (unless `true` is passed to any of them).

## Further Documentation

Please refer to the [`axios` documentation](https://www.npmjs.com/package/axios) for further specifications such as the response data format and additional optional fields. Everything with the response and options will be the same except the following:

- `HttpRequest` sets `resolveWithFullResponse` to `false` by default, which means successful responses have only their bodies returned in the resolved Promise. Similarly, unsuccessful responses have only their error bodies returned in the rejected Promise. If you need to examine the entire response, including status codes and headers (as you must do when using the [standard `axios` package](https://www.npmjs.com/package/axios)), then call `.resolveWithFullResponse()` on your `HttpRequest` object before executing it.
