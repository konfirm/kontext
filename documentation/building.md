# Installation and building
Getting up and running is fairly straight forward, there are some (somewhat time consuming) initial steps to be taken

## Clone the repo
```
git clone https://github.com/konfirm/kontext ./kontext
```

(If you want to contribute, fork the kontext repository to your account and clone from there)

## Install the dependencies
```
npm install
```

This will take a while, as several packages (among which two headless browsers) will be installed.


## Build
```
devour
```

Yes, the [**devour**](https://github.com/konfirm/devour-gulp) build tool is used.


## Unit testing
```
karma start
```

## Pull requests
We expect changes in code to be reflected in unit tests, while currently not at 100% (mostly due to browser specific flows), we sure don't want to see the coverage numbers decline

## Feature requests
Besides creating pull requests, requests for new features are also want.
So if you know of a feature that must be added, [create an issue describing your feature](https://kon.fm/kontext/request-extension).
