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
	@$(MAKE) credits > AUTHORS.md;

#  clean up the build target (if exists)
clean:
	@rm -rf ./build/* || mkdir -p ./build;

#  build only kontext itself
kontext-only:
	@devour kontext;

#  build only the kontext extensions
kontext-extensions:
	@devour kontext:extensions;

#  build only the kontext providers
kontext-providers:
	@devour kontext:providers;

#  build Kontext and all extensions/providers
kontext:
	@devour kontext kontext:extensions kontext:providers;

#  run the automated tests using npm (once)
npm-test:
	@npm test;

#  do some linting (in case of editing without a built-in one)
lint:
	@eslint -c .eslintrc {test,source}

#  create a fresh distribution in the dist folder
distribution:
	@make clean authors lint npm-test && \
		mkdir -p dist && \
		cat build/kontext.js `ls -1 build/{provider,extension}/*.js | grep -v min` > \
		dist/kontext-$(VERSION).js && \
		cp dist/kontext-$(VERSION).js dist/kontext-latest.js && \
		cat build/kontext.min.js build/{provider,extension}/*.min.js > \
		dist/kontext-$(VERSION).min.js && \
		cp dist/kontext-$(VERSION).min.js dist/kontext-latest.min.js;

distribution-size-report:
	@make distribution && \
		echo "Build sizes:" && \
		ls -l build/{kontext,extension/*,provider/*}.js | grep -v ".min." && \
		echo "Distribution sizes:" && \
		ls -l dist | grep latest && \
		gzip dist/*latest*js && ls -l dist | grep latest && gunzip dist/*latest*gz;
