# Kontext
Simple and extensible two-way binding library.


## Why yet-another-two-way-binding-library?
I could humorously say something like "because I can", which actually is among the true reasons on why I started this project. The primary reason to look into two-way binding - or to be more precise, the configuration of it - was to figure out if it is absolutely required to be using `eval` and/or `new Function` contraptions.
These are very powerful features of the javascript language, too powerful. In fact these features are actively abused by malicious people to circumvent security precautions in the browser. Luckily there are now countermeasures in modern webbrowsers to disable (or at least discourage) these features, for example CSP ([Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Introducing_Content_Security_Policy)) headers.
Without going into much detail on CSP headers, most two-way binding libraries require you to send the `script-src: 'unsafe-eval'`. That does not make you feel very safe now does it?

### Why does the competition use `eval`/`new Function`?
As said, these features are very, very powerful. They are what makes it possible to have bindings like: `text: 'hello ' + myWorld`. In short, using these features helps implement powerful features that allow the users to write complex statements in HTML attributes.

### Who is the competition?
Honestly, Kontext does not really compete with the proven libraries below, as they all have a plethora of use-cases, and a friendly, active and - most important - a helpful community. All of them offer a far more feature-rich library.
I know this does not seem to plead in favor of Kontext, I try to manage expectations early on.

So, here's are couple of competitors:
- [Knockout](http://knockoutjs.com)
- [Ractive](http://www.ractivejs.org)

## Usage
Now that you know the why, lets get on with the _how_.
In its most basic use you load the kontext script into you page, add a couple of placeholders in you html and bind a few models. That sounded simple, right?

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
With Kontext, you are not required to create an explicit model, simply provide an object and it will become the model. As we are in to a very basic example, the html above would work with the following binding:

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

By default Kontext will bind to the `document.body` (`<body>`) element and will search for placeholders inside this (or provided) element. In the example above we would not have any reference to the model itself, which makes little sense in most cases.
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
As sometimes a placeholder does not suffice, you can also register extension which are configured using the `data-kontext` attribute. For your convenience, there are a couple of useful extension available.

#### text
Works similar to the placeholders, but now from an attribute, the html aboven re-written to make use of the `text` extension would look like this:

```html
<article id=example>
	<h1 data-kontext="text:title"></h1>
	<p data-kontext="text:body"></p>
</acticle>
```

Note that - unlike other binding libraries - Kontext is rather tolerant with the `text`-extension, if the first node inside the element with the `data-kontext` attribute is text, that text will be used for changes. If that first node is not text, Kontext will insert a new text node as first element and use that.

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

#### attribute

#### each

#### event

#### input