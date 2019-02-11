[![CircleCI master build status](https://img.shields.io/circleci/project/github/unplgtc/HttpRequest/master.svg?label=master&logo=circleci)](https://circleci.com/gh/unplgtc/HttpRequest/tree/master)
[![npm version](https://img.shields.io/npm/v/@unplgtc/http-request.svg)](https://www.npmjs.com/package/@unplgtc/http-request)

# HttpRequest

### Builder-style HTTP request executor for Node applications

HttpRequest is a simple Node HTTP client which implements a [fluid interface](https://en.wikipedia.org/wiki/Fluent_interface) to build and send requests. HttpRequest Objects can be built in a number of different ways, including building and sending them immediately or building them over time and sending after all requires pieces have been assembled. HttpRequest encourages thinking of requests as Objects rather than actions: an HttpRequest Object holds its payload internally and can send it at any time — immediately or later on. This is a subtle but important distinction from other HTTP clients which expect a completed payload to be passed into a function call for instant execution.

HttpRequest Objects can be reused to fire the same request multiple time in a row, or to tweak a few request fields for different requests while persisting common values. They can be passed between functions and triggered by any of them without needing a particular function to deal with execution details. The fluid interface allows building HttpRequests with a chained syntax that is clear and concise.

## Usage

Install HttpRequest from npm:

```
$ npm install @unplgtc/http-request --save
```

Import HttpRequest into your Node project:

```js
const HttpRequest = require('@unplgtc/http-request');
```

Spawn new HttpRequest Objects either with `Object.create(HttpRequest)` or with `HttpRequest.create()`:

```js
var req = Object.create(HttpRequest);

var anotherReq = HttpRequest.create();
```

`HttpRequest.create()` is just a shortcut for `Object.create(HttpRequest)`, so they can be used entirely interchangeably based on your code style preferences.

HttpRequests currently support seven **Native Fields**: `url`, `headers`, `body`, `json`, `qs`, `timeout`, and `resolveWithFullResponse`. All additional fields supported by the [request package](https://www.npmjs.com/package/request) are still supported as **Option Fields**. All fields, both optional and native, can be set with a single payload using the `build()` function.

```js
var req = HttpRequest.create();
req.build({
	url: 'some_url',
	headers: {
		Authorization: 'some_token'
	},
	body: {
		someKey: 'some_value'
	},
	timeout: 5000,
	json: true
});
```

### Native Fields

Each native field can be set individually, using the specified setter below, or referenced as a direct child of the HttpRequest object instance.

| Field Name                | Setter                         |
| ------------------------- | ------------------------------ |
| `url`                     | `setUrl()`                     |
| `headers`                 | `setHeaders()`                 |
| `body`                    | `setBody()`                    |
| `json`                    | `setJson()`                    |
| `qs`                      | `setQs()`                      |
| `timeout`                 | `setTimeout()`                 |
| `resolveWithFullResponse` | `setResolveWithFullResponse()` |

```js
var req = HttpRequest.create()
	.setUrl('some_url')
	.setHeaders({
		Authorization: 'some_token'
	})
	.setHeader('headerTitle', 'header_value')
	.setBody({
		someKey: 'some_value'
	})
	.setJson(true)
	.setTimeout(3000)
	.setResolveWithFullResponse(true);
```

### Option Fields

All option fields can be set using the `setOptions()` or `setOption()` methods and directly referenced as a child of the `options` field of the HttpRequest object instance.

```js
var req = HttpRequest.create();
req.build({
	url: 'some_url',
	optionalField: 'data'
});

// get the optional field's data
var optionalData = req.options.optionalField;

// set an optional field to a new value
req.setOption('optionalField', 'other_data');
```

#### setOptions(options)

A function that sets all options to the specified payload. Any existing option fields will be overwritten.

#### setOption(key, value)

The first argument is the name of the option to update. The second argument is the value to store for the specified option.

The option field with the specified key will be updated to the provided value.

---

Send a request using the `.get()`, `.post()`, `.put()`, and `.delete()` methods.

```js
var res = req.put();
```

These can of course be chained along with the other functions to immediately build and send a request.

```js
var res = HttpRequest.create()
	.setUrl('some_url')
	.setHeader('Authorization', 'some_token')
	.setBody({ someKey: 'some_value' })
	.setJson(true)
	.post();
```

The `build()` function is chainable as well.

```js
var res = HttpRequest.create()
	.build({url: 'some_url', json: true})
	.get();
```

Finally, if you have an existing HttpRequest Object and want to review its payload, just pull it with the `.payload` getter.

```js
var req = HttpRequest.create()
	.setUrl('some_url');

console.log(req.payload);
// { url: 'some_url' }
```

## Further Documentation

Please refer to the [`request-promise` documentation](https://www.npmjs.com/package/request-promise) for further specifications such as the response data format and additional optional fields. Everything with the response and options will be the same except the following:

- This implementation uses [`request-promise-native`](https://www.npmjs.com/package/request-promise-native) that uses native ES6 promises instead of Bluebird promises.
- Mind that native ES6 promises have fewer features than Bluebird promises do. In particular, the .finally(...) method is not available.
- `resolveWithFullResponse` is set to `true` by default, meaning the response data is much closer to the [`request` library](https://www.npmjs.com/package/request) format and `statusCode` and `headers` will be included in each response.
    - Setting `resolveWithFullResponse` to `false` will return only the body of the response once the Promise is resolved. 
