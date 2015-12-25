# Kontext
Simple and extensible two-way binding library.
[![Build Status](https://travis-ci.org/konfirm/kontext.svg?branch=v1.0.0)](https://travis-ci.org/konfirm/kontext)[![Coverage Status](https://coveralls.io/repos/konfirm/kontext/badge.svg?branch=master&service=github)](https://coveralls.io/github/konfirm/kontext?branch=master)[![Codacy Badge](https://api.codacy.com/project/badge/grade/f3d42467d2ee4f1f895e26d63d0587ea)](https://www.codacy.com/app/rogier/kontext)


## Why yet-another-two-way-binding-library?
I could humorously say something like "because I can", which actually is among the true reasons on why I started this project. The primary reason to look into two-way binding - or to be more precise, the configuration of it - was to figure out if it is absolutely required to be using `eval` and/or `new Function` contraptions.
These are very powerful features of the javascript language, too powerful. In fact these features are actively abused by malicious people to circumvent security precautions in the browser. Luckily there are now countermeasures in modern webbrowsers to disable (or at least discourage) these features, for example CSP ([Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Introducing_Content_Security_Policy)) headers.
Without going into much detail on CSP-headers on itself, most two-way binding libraries require you to send `script-src: 'unsafe-eval'`, which kind of defies the purpose of the CSP-headers.

### Why does the competition use `eval`/`new Function`?
As said, these features are very, very powerful. They are what makes it possible to have bindings like: `text: 'hello ' + myWorld`. In short, using these features helps implement powerful features that allow the users to write complex statements in HTML attributes.

### Who is the competition?
Honestly, Kontext does not really compete with the proven libraries below, as they all have a plethora of use-cases, and a friendly, active and - most important - a helpful community. All of them offer a far more feature-rich library.
I know this does not seem to plead in favor of Kontext, I try to manage expectations early on.

So, here's are couple of competitors:
- [Knockout](http://knockoutjs.com)
- [Ractive](http://www.ractivejs.org)


## Dowload
You can download the latest version directly from the [dist folder](/dist) or from the [releases](https://github.com/konfirm/kontext/releases), which also contains previous releases.


## Building instructions
Building Kontext and its extensions is [quite simple](documentation/building.md). You usually only need this when you plan on contributing to Kontext or if you are just curious what our build-flow does.


## Usage
Now that you have gained some insight in the _why_, lets get on with the _how_.
In its most basic use you load the Kontext script into you page, add a couple of placeholders in the html and bind one or more models. That sounded simple, right?

### Placeholders
Kontext searches for placeholders in the textual parts of your markup, this means you can add something like the following to your page:

```html
<article id=example>
	<h1>{title}</h1>
	<p>{body}</p>
</acticle>
```

That should be either a familiar syntax, or at least comprehensible.

### Models
With Kontext you cannot create an explicit model, it does suffice to simply provide an object and it will become the model. As we are in to a very basic example, the html above would work with the following binding:

```js
kontext.bind({title: 'Hello', body: 'My first article'});
```

Which produces:

```html
<article id=example>
	<h1>Hello</h1>
	<p>My first article</p>
</acticle>
```

The `bind` method will return the model provided, this enabled you to define the model while binding it.
By default Kontext will bind models to the `document.body` (`<body>`) element and will search for placeholders inside this (or the provided) element. In the example above we would not have any reference to the model itself, which makes little sense in most cases.
Therefor a more common example would be:

```js
var model = kontext.bind({title: 'Hello', body: 'My first article'}, document.querySelector('#example'));
```

or, if you are more into defining the model first:

```js
var model = {title: 'Hello', body: 'My first article'};

kontext.bind(model, document.querySelector('#example'));
```

Either way, the model will remain more or less the same. Given the example above you can still change the title property using `model.title = 'Another title';`, doing so after the `bind` has taken place, this change will be reflected in the html.
This behavior is achieved by re-defining the basic-type properties of the model and add getter/setter functions for them. This ensures the model to be working as you created it, while still being able to perform the binding.

### Extensions
As sometimes a placeholder does not suffice, you can also register extensions which are configured using the `data-kontext` attribute.

As of *version 1.1.0* of Kontext you can abbreviate the extension names in the `data-kontext` attribute. This allows for a more compact definition.
NOTE: if the short hand extension name leads to multiple matching extension, an error will be logged to the console, for example `data-kontext="e: {..}"` will lead to an Error `Kontext: Multiple extensions match "e": each,event`.

For your convenience, there are a couple of useful extensions available.

#### text
Works similar to the placeholders, but now from an attribute, the html above re-written to make use of the `text` extension would look like this:

```html
<article id=example>
	<h1 data-kontext="text:title"></h1>
	<p data-kontext="text:body"></p>
</acticle>
```

Note that Kontext is rather tolerant with the `text`-extension, if the first node inside the element with the `data-kontext` attribute is a text-node, that text-node will be used for changes. If that first node is not a text-node, Kontext will insert a new text-node as first element and use that, leaving the other nodes intact.

```html
<article id=example>
	<h1 data-kontext="text:title">My Title</h1>
	<p data-kontext="text:body"><strong>.</strong></p>
</acticle>
```

After applying the model from the example, the html will look like:

```html
<article id=example>
	<h1 data-kontext="text:title">Hello</h1>
	<p data-kontext="text:body">My first article<strong>.</strong></p>
</acticle>
```

#### css
Control element classes from your models, using the simple syntax: `data-kontext="css: {<classname>: <key>, ...}"`.
Where `<classname>` represents the class name to apply when the `<key>` property becomes `true`-ish.

```html
<span data-kontext="css: {awesome: cool}">cool</span>
```

with some controlling code:

```js
var model = kontext.bind({cool: false});

setInterval(function() {
	model.cool = !model.cool;
}, 1000);
```

This would toggle the 'awesome'-class every second.
**NOTE** you can provide pretty much any variable type to control the classes, most will result in a `true`-ish value (therefor applying the class), the following will result in a `false`-ish value: `false`, `null`, `undefined`, `''` (empty string), `0` (number zero).


#### attribute
Control attributes and their values from your models, using the syntax: `data-kontext="attribute: {data-foo: foo, ...}"`.
Given this example, a `data-foo` attribute will be made available on the element with the value of `foo`. If the attribute has no value, the attribute will be removed entirely.

#### each
Iterate over each value in an array and apply the template for every item in the array.
There are two notations for the `each`-extension:

```html
<ul data-kontext="each: list">
	<li>...</li>
</ul>

<ul data-kontext="each: {target: list}">
	<li>...</li>
</ul>
```

In this setup, both will do the same thing. The latter is more flexible, as it also accepts a `map` and `filter` property, both of which can contain the name of a model method or global function, or an array of these.
**NOTE** the execution order is: `map` and then `filter`, so it is not possible to map filtered results.

```html
<ul data-kontext="each: {target: list, filter: [filterA, filterB]}">
	<li>...</li>
</ul>
```

#### event
Trigger events directly on your models, any event can be bound (as long as the browser supports it) and the syntax allows for a huge variety in options.

```html
<div data-kontext="event: {mouseover: hover}">...</div>
```

Will invoke the models hover method on mouseover.

```html
<div data-kontext="event: {mouseover: [hover, focus]}">...</div>
```

Will invoke the models hover method followed by the models focus method on mouseover.

Besides function invocation, it may be useful to have properties change automatically, for example when a state flag is needed. This is can be done using predefined values.

```html
<div data-kontext="event: {mouseover: {state: over},
							mouseout: {state: none},
							mousedown: {state: press},
							mouseup: {state: release}}">
	...
</div>
```

The values (`'over'`, `'none'`, `'press'` and `'release'`) will be applied to the `state` property when the corresponding events take place.

#### input
Bind any type of form element, these come in three major flavors:

##### Textual inputs
The most common of inputs, bind them using the syntax `data-kontext="input: {value: <key>}"`. This works on any form element which works with a value property, such as `<input>` with type: `'text'`, `'password'`, etc. Also works great with `<textarea>` elements.

##### `Checked` inputs
Checkboxes and radio inputs, Kontext handles these by setting a boolean state per option.

```html
<input type=checkbox data-bind="input: {checked: mystate}">
```

This will reflect the state (boolean value) of the model `mystate` property and keep the value in sync with the checked state.

##### Select boxes
Keeping selections (both single and multiple) in sync with your models was never easier, simply provide both the destination key of the selection and optionally a key from where to obtain the options and you're set.

```html
<select data-kontext="input: {value: selection}">
	<option>A</option>
	<option>B</option>
</select>
```

If there is no `options` set in the configuration, you can (and must) provide these in the html source or add some other means to populate it.

```html
<select data-kontext="input: {value: selection, options: optionList, default: choose}"></select>
```

Note that the `multiple` attribute is set/removed automatically by Kontext depending on whether the property reference in `value` (here `selection`) in the model allows for multiple values (an array).

#### template
Set the contents of elements to the configured template. Templates can be loaded externally by providing a path (default is the current document) and a selection (optional for external templates).

```html
//  load foo.html into the element
<div data-kontext="template: foo.html">replaced</div>

//  load the contents of an element with the id 'bar' from the foo.html template
<div data-kontext="template: foo.html#bar">replaced</div>

//  load the contents of an element with id 'bar' from the current document
<div data-kontext="template: #bar">replaced</div>

//  load /path/to/template into the element
<div data-kontext="template: {path: /path/to/template}">replaced</div>

//  load the contents of an element with the id 'bar' from the /path/to/template template
<div data-kontext="template: {path: /path/to/template, selector: #bar}">replaced</div>

//  load the contents of an element with id 'bar' from the current document
<div data-kontext="template: {selector: #bar}">replaced</div>
```



## License
GPLv2 © [Konfirm](//kon.fm/site)
