'use strict';
const fs = require('fs');
const path = require('path');
const arrify = require('arrify');
const pify = require('pify');

module.exports = (input, opts) => {
	opts = module.exports.parseOpts(opts);

	return Promise.all(arrify(input).map(x => {
		return pify(fs.stat)(x[0] === '!' ? x.substring(1) : x).then(stats => {
			if (stats.isDirectory()) {
				return path.join(x, opts.prefix + '**', opts.prefix + opts.ext);
			}

			return x;
		}).catch(err => {
			if (err.code === 'ENOENT') {
				return x;
			}

			throw err;
		});
	}));
};

module.exports.sync = function (input, opts) {
	opts = module.exports.parseOpts(opts);

	return input.map(x => {
		try {
			const stats = fs.statSync(x[0] === '!' ? x.substring(1) : x);

			if (stats.isDirectory()) {
				return path.join(x, opts.prefix + '**', opts.prefix + opts.ext);
			}

			return x;
		} catch (err) {
			if (err.code === 'ENOENT') {
				return x;
			}

			throw err;
		}
	});
};

module.exports.parseOpts = function (opts) {
	opts = opts || {};

	if (Array.isArray(opts.ext)) {
		opts.ext = `*.{${opts.ext.join(',')}}`;
	} else if (opts.ext) {
		opts.ext = `*.${opts.ext}`;
	} else {
		opts.ext = '*';
	}

	opts.prefix = opts.dot ? '{.,}' : '';

	return opts;
};
