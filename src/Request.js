'use strict';

/*
 * Simple wrapper file to Promisify the `request` package
 *
 * TODO: Should probably just switch to an async request package to avoid having to do this
 */

const request = require('request');

const Request = {
	get: async function(data) {
		return new Promise((resolve, reject) => {
			request.get(data, (err, rsp, body) => {
				if (!err && rsp.statusCode === 200) {
					resolve({err: err, rsp: rsp, body: body});
				} else {
					reject({err: err, rsp: rsp, body: body});
				}
			});
		});
	},

	post: async function(data) {
		return new Promise((resolve, reject) => {
			request.post(data, (err, rsp, body) => {
				if (!err && rsp.statusCode === 200) {
					resolve({err: err, rsp: rsp, body: body});
				} else {
					reject({err: err, rsp: rsp, body: body});
				}
			});
		});
	},

	put: async function(data) {
		return new Promise((resolve, reject) => {
			request.put(data, (err, rsp, body) => {
				if (!err && rsp.statusCode === 200) {
					resolve({err: err, rsp: rsp, body: body});
				} else {
					reject({err: err, rsp: rsp, body: body});
				}
			});
		});
	},

	delete: async function(data) {
		return new Promise((resolve, reject) => {
			request.delete(data, (err, rsp, body) => {
				if (!err && rsp.statusCode === 200) {
					resolve({err: err, rsp: rsp, body: body});
				} else {
					reject({err: err, rsp: rsp, body: body});
				}
			});
		});
	}
}

module.exports = Request;
