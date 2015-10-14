json-formatter:
	@curl -s https://raw.githubusercontent.com/rspieker/json-formatter/master/json-formatter.js \
		-o src/lib/json-formatter.js;

knot:
	@devour knot;

clean:
	@rm -rf build/*;

update:
	@make clean json-formatter knot;
