json-formatter:
	@curl -s https://raw.githubusercontent.com/rspieker/json-formatter/master/json-formatter.js \
		-o source/lib/json-formatter.js;

kontext:
	@devour kontext;

clean:
	@rm -rf build/*;

update:
	@make clean json-formatter kontext;
