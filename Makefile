json-formatter:
	@curl -s https://raw.githubusercontent.com/rspieker/json-formatter/master/json-formatter.js \
		-o source/lib/json-formatter.js;

kontext:
	@devour kontext kontext:extensions;

clean:
	@rm -rf build/*;

dist:
	@make clean kontext && \
		cat build/kontext.min.js build/extension/*.min.js > \
		build/kontext-`node -pe "require('./package.json').version;"`.min.js;

update:
	@make clean json-formatter kontext;
