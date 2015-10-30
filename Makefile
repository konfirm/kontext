VERSION=$(shell node -pe "require('./package.json').version")

#  Generate the list of authors with the number of occurences in the git log
#  (representing the amount of commits)
commit-count:
	@git log --format='%aN <%aE>' | sort | uniq -c | sort -r;

#  The list of authors, with the commit-count itself removed
credits:
	@$(MAKE) commit-count | sed 's/^ *[0-9]* //';

#  The list of authors piped into AUTHORS file
authors:
	@$(MAKE) credits > AUTHORS;

#  clean up the build target (if exists)
clean:
	@rm -rf ./build/* || mkdir -p ./build;

#  build Kontext and all extensions
kontext:
	@devour kontext kontext:extensions;

#  create a fresh distribution in the dist folder
distribution:
	@make clean authors kontext && \
		mkdir -p dist && \
		cat build/kontext.js `ls -1 build/extension/*.js | grep -v min` > \
		dist/kontext-$(VERSION).js && \
		cat build/kontext.min.js build/extension/*.min.js > \
		dist/kontext-$(VERSION).min.js;
