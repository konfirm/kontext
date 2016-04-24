# Installation and building
Getting up and running is fairly straight forward, there are some (somewhat time consuming) initial steps to be taken

## Clone the repo
```
git clone https://github.com/konfirm/kontext ./kontext
```

(If you want to contribute, fork the kontext repository to your account and clone your fork)


## Install the dependencies
```
npm install
```

This will take a while, as several packages (among which two headless browsers) will be installed.


## Build
```
devour
```

or, alternatively

```
./node_modules/.bin/devour
```

Yes, the [**devour**](https://github.com/konfirm/devour-gulp) build tool is used. This is a wrapper around the popular [**Gulp**](http://gulpjs.com) build tool, so it should feel familiar if you already use Gulp.


## Unit testing
For unit testing [Karma](http://karma-runner.github.io) takes care of running the [Jasmine](http://jasmine.github.io) tests and [Istanbul](https://github.com/gotwarlost/istanbul) code coverage analyzer.

```
karma start
```

or, alternatively

```
./node_modules/.bin/karma start
```

This will use the [PhantomJS](http://phantomjs.org) browser to run all the tests every time a file changes.


## Building a distribution
A distribution are the files you find in the `dist` folder, there are two files there:
- kontext-`<version>`.js - kontext and all extensions, full source
- kontext-`<version>`.min.js - kontext and all extensions, minified

There should be no need to build these files other than running your own distribution, we always have the current builds in the `dist` folder.

The command to build a distribution is:

```
make distribution
```

It will take the version in the `package.json` file for the file name, create a fresh build so all sources are 'compiled' and contributors are added.


## Pull requests
Help is always appreciated, just make sure to please ESLint as much as possible (try to avoid disabling it). There is an .eslintrc file, so your favorite editor (e.g. [Atom](https://atom.io)) can help you out with writing code.
As we trust our editor blindly and already have a rather exhaustive output from the `devour` (`gulp`) process, there is no additional linting done from there.

We do expect changes in code to be reflected in unit tests. While currently not at 100% (97.95% for statements in PhantomJS, mostly due to browser specific flows), we sure don't want to see the coverage numbers decline when the pull request is merged.
For inspiration, you can always look at the existing tests for [kontext](../test/kontext) and [extensions](../test/kontext/extension).


## Feature requests
Besides creating pull requests, requests for new features are also welcome.
So if you know of a feature that must be added, [create an issue describing your feature](https://kon.fm/kontext/request-extension).
