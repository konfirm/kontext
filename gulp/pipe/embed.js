'use strict';

function Embed(devour, build) {
	var embed = this,
		fs = require('fs'),
		through = require('through2'),
		pattern = {
			//  declarative
			include: /([\t ]*)\/\/\s*@(include|register):?\s*([a-z0-9_\-\.\/]+)\n/g,
			depend: /@depend:?\s(.*)/g,
			modules: /([\t ]*)\/\/\s*@modules/,
			info: /([\t ]*)\/\/\s*@buildinfo/,

			//  sanitation
			header: /^;?\(function\([^\)]*\)\s*\{(?:\s*\/\/.*)?\s*(['"])use strict\1;?\n+/,
			footer: /\n+\s*\}\)\([^\)]*\);?\n+$/,
			indentation: /^(?:\n+?)?([\s]+)/,

			//  cleanup
			clean: {
				'//  strict mode (already enabled)': /(['"])use strict\1;?/g,
				'/* $1 */': /\/\/if-included (.*)/g
			},

			// convenience
			separator: /[,\s]+/,
			js: /\.js$/
		},
		list = {};

	function processBuffer(buffer) {
		var content = buffer.contents.toString(),
			start = process.hrtime(),
			dependencies;

		content = resolve(buffer.contents.toString(), buffer.path);
		dependencies = getDependencies(build);

		if (dependencies.length) {
			content = content.replace(pattern.modules, function() {
				return dependencies
					.map(function(dep) {
						return dep.content;
					}).join('\n')
				;
			});
		}

		content = buildInfo(content, start, dependencies);

		buffer.contents = new Buffer(content);
	}

	function buildInfo(content, start, dependencies) {
		return content.replace(pattern.info, function(match, indentation) {
			var result = [
					'/*',
					'BUILD INFO',
					new Array(70).join('-'),
					'  date: ' + new Date()
				],
				inc = getIncludes(),
				total = content.length;

			report(start, content.length).split(/[,\s]+/).forEach(function(unit, index) {
				result.push((index === 0 ? '  time: ' : '  size: ') + unit);
			});

			if (build && build.length) {
				result.push(
					' build: ' + build.join(', ')
				);
			}

			if (inc.length) {
				result.push(
					new Array(70).join('-'),
					' included ' + inc.length + ' files'
				);

				result = result.concat(inc.map(function(file) {
					var size = unit(file.content.length, 1024, ['bytes', 'KB', 'MB']);

					total += file.content.length;

					return new Array(10 - size.length).join(' ') + '+' + size + ' ' + file.name;
				}));
			}

			if (dependencies.length) {
				result.push(
					new Array(70).join('-'),
					' dependent ' + dependencies.length + ' files'
				);

				result = result.concat(dependencies.map(function(dep) {
					var size = unit(dep.content.length, 1024, ['bytes', 'KB', 'MB']),
						dependant = dependsOn(dep, dependencies);

					total += dep.content.length;

					return new Array(10 - size.length).join(' ') + '+' + size + ' ' + dep.name +
						(dependant.length ? ' [uses: ' + dependant.join(', ') + ']' : '');
				}));
			}

			result = result.concat([
				new Array(70).join('-'),
				' total: ' + unit(total, 1024, ['bytes', 'KB', 'MB'])
			]);

			result.push(' */');



			return result.map(function(line, index, all) {
				return indentation + (index > 0 && index < all.length - 1 ? ' *  ' : '') + line;
			}).join('\n');
		});
	}

	function dependsOn(module, dependencies) {
		var deps;

		if (!('type' in module && 'dependency' in module.type)) {
			return [];
		}

		deps = dependencies.map(function(dep) {
			return dep.name;
		});

		return module.type.dependency
			.filter(function(dep) {
				return deps.indexOf(dep) >= 0;
			})
			.map(function(dep) {
				return dep.replace(/(?:src|core)\/?/g, '');
			});
	}

	function getIncludes() {
		return Object.keys(list)
			.filter(function(key) {
				return list[key].included;
			})
			.map(function(key) {
				return list[key];
			});
	}

	function getDependencies(requires) {
		var keys = Object.keys(list),
			deps = keys.filter(function(key) {
				return !list[key].included && (requires.length <= 0 || requires.indexOf(key) >= 0);
			}),

			changes = true,
			result;

		//  resolve dependencies of dependencies
		while (changes) {
			result = [];

			deps.forEach(function(dep) {
				if ('type' in list[dep] && 'dependency' in list[dep].type) {
					result = result.concat(list[dep].type.dependency.filter(function(name) {
						return result.indexOf(name) < 0 && deps.indexOf(name) < 0;
					}));
				}
			});

			changes = result.length;
			if (changes) {
				deps = deps.concat(result);
			}
		}

		deps.forEach(function(name) {
			var deps = (list[name].type.dependency || []);

			if (deps.length) {
				result = result.concat(deps.map(function(dep) {
					return [name, dep];
				}));
			}
			else {
				result.push([name]);
			}
		});

		return result;
	}

	function resolve(content, origin, indent) {
		var base = getProjectOffset(origin),
			baseDir = base.split('/').slice(0, -1).join('/') + '/';

		//  process includes and registers
		content = content.replace(pattern.include, function(match, indentation, type, files) {
			var result = files.split(pattern.separator).map(function(file) {
					var filename = process.cwd() + '/' + baseDir + file + (pattern.js.test(file) ? '' : '.js'),
						start = process.hrtime(),
						module = include(getProjectOffset(filename).replace(pattern.js, ''), base, type),
						data;

					if (!module.content) {
						data = resolve(
							fs.readFileSync(filename).toString(),
							baseDir + file,
							indentation
						);

						data = unwrap(data, (indent || '') + indentation);

						if ('clean' in pattern) {
							Object.keys(pattern.clean).forEach(function(replacement) {
								data = data.replace(pattern.clean[replacement], replacement);
							});
						}

						module.content = [
							indentation + '//BEGIN INCLUDE: ' + file,
							data.split(/\n/).map(function(line) {
								return line ? indentation + line : '';
							}).join('\n'),
							'',
							indentation + '//END INCLUDE: ' + file + ' [' + report(start, data.length) + ']'
						].join('\n');
					}

					if (type === 'include' && !module.included) {
						module.included = true;
						return module.content;
					}

					return '';
				}).join('');

			return (result ? '\n' : '') + result;
		});

		//  extract dependencies
		content = content.replace(pattern.depend, function(match, files) {
			files.split(pattern.separator).forEach(function(file) {
				include(origin, getProjectOffset('src/core/' + file), 'dependency');
			});

			//  remove them from the output
			return '';
		});

		return content;
	}

	function unit(value, step, units, dec) {
		var list = units.slice(),
			result = +value;

		while (result > step && list.length > 1) {
			list.shift();
			result /= step;
		}

		return result.toFixed(dec || 2) + list.shift();
	}

	function report(start, size) {
		var end = process.hrtime(start);

		return [
			unit(end[0] * 1e6 + end[1] / 1e3, 1000, ['µs', 'ms', 's']),
			', ',
			unit(size, 1024, ['bytes', 'KB', 'MB'])
		].join('');
	}

	function unwrap(content) {
		var indent;

		//  remove header and footer only if both are present in the expected format
		if (pattern.header.test(content) && pattern.footer.test(content)) {
			content = content.replace(pattern.header, '').replace(pattern.footer, '').split(/\n/).map(function(line) {
				var match;

				if (typeof indent === 'undefined') {
					match = line.match(pattern.indentation);

					if (match) {
						indent = new RegExp('^' + match[1]);
					}
				}

				return line.replace(indent, '');
			}).join('\n');
		}

		return content.replace(/^\n+|\n+$/, '');
	}

	function getProjectOffset(path) {
		var self = __dirname.split('/'),
			base = path.split('/'),
			same = true;

		return base.filter(function(part, index) {
			if (same && part !== self[index]) {
				same = false;
			}

			return !same;
		}).join('/');
	}

	function include(name, module, type) {
		if (!(name in list)) {
			list[name] = {
				name: name,
				content: null,
				type: {},
				included: false
			};
		}

		if (!(type in list[name].type)) {
			list[name].type[type] = [];
		}

		list[name].type[type].push(module.replace(pattern.js, ''));

		return list[name];
	}

	embed.resolve = function() {
		return through.obj(function(chunk, enc, done) {
			if (chunk.isBuffer()) {
				processBuffer(chunk);
			}

			this.push(chunk);
			done();
		});
	};
}

module.exports = function(stream, devour, list) {
	var embed = new Embed(devour, list);

	return stream
		.pipe(embed.resolve())
	;
};
