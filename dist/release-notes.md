# Release notes

## _CURRENT MASTER_ (represented by `kontext-latest(.min).js` in the dist folder!)
- Added `conditional`-extension (don't worry, abbreviations still work)
- Fourth argument to extension invocation is now an options object, not kontext itself
- `each`-extension now properly populates the `$parent` with the actual array instead of the delegate function (which could not be resolved in HTML)
- `each`-extension now adds a `$model` property to the (magic) bindings, so access to model properties/methods is now supported
- `update`-events now properly provide the previous value
- Models now have a `define(name, initial)` method, allowing to create getter/setter properties which operate the same as all other bound properties (including model `update` emissions)
- Introduced `providers`, which can be registered separately and are responsible for finding all DOMNodes which need to be bound to an extension. Moved the internal Attribute and Text iterators to separate (external) providers.
- The declarations in attributes are now more relaxed about whitespace


### Extension: Options object
The fourth argument to extensions is no longer `kontext`, but instead an object with the following properties:
	- (string) `extension`: The name of the extension as it was used in the `data-kontext` attribute
	- (function) `stopDescend`: A method to invoke if Kontext should not apply the model to any children of the element (e.g. the extension will handle this itself, or nothing will be bound at all)

The impact of this change is considered to be minimal, as it was a rather pointless argument since `kontext` must have been already known at that point in order to register the extension. This change is not considered to be _breaking_ and might not cause a major version bump, although a minor version _jump_ (from 1.5 to 1.7) is considered.

### Providers
By unifying the way `kontext.bind` finds the actual targets it needs to deal with, a lot of flexibility is introduced. Not only does this allow for smaller builds, it will also provide a very simple way to add other ways of binding models. For example, a provider to implement a mechanism using comments is now very easy and does no longer involve understanding all/most of Kontext.

### JSON-Declaration in attributes
Previously the `data-kontext` attributes would trip over whitespace like newlines and tabs, this has now been resolved. There are some things to note about the new behavior:
- Any none-space whitespace (`\n\r\t\v`) following a meaningful token (`'\'":,{}[] '`) will be truncated, e.g. `foo:      bar,    baz:    true`, will be parsed into `{foo: 'bar', baz: true}`
- Any none-space whitespace (`\n\r\t\v`) preceding a meaningful token which in itself it not used as object key will be added to the value, e.g. `foo:   bar\n\n\t,  baz:   true` (notice the dangling comma), will be parsed into `{foo: 'bar\n\n\t', baz: true}`

### Fixes
- Fixed [issue #8: `update` events do not provide the correct previous value](https://github.com/konfirm/kontext/issues/8)
- Fixed issue with the binding of children of conditional elements

### Statistics
- Full size: 84.9K (+19.9K), gzipped: 21.7K (+4.8K)
- Minified size: 18.7K (+3.6K), gzipped: 6.8K (+1.3K)


## 1.5.0
- `event` can now fall back onto a global event handler if the provided handler is not in the model.
- `each` can now use the defining node as template, reducing the nesting of dom elements slightly (note: this does not decrease the total amount of DOMNodes),
useful for creating sibling nodes (e.g. `<dt>` and `<dd>`).
**NOTE**, when using `each: {self: true, target: X}`, the `data-kontext` attribute will be removed from the element, which means that pretty much only the `each`-extension will be functional and the others are discarded ([see issue #4](https://github.com/konfirm/kontext/issues/4)).

### Fixes
- Fixed [issue #5: traversing over an Array with the `each` extension and `$item` for text is broken](https://github.com/konfirm/kontext/issues/5)
- Fixed [issue #7: `model.delegation(..)` throws an error if a nested property is not found](https://github.com/konfirm/kontext/issues/7)
- Fixed [issue #6: Placeholders cannot refer to nested values](https://github.com/konfirm/kontext/issues/6)
- Prevent potential crash when the `options` argument for `kontext.bind` is `null`
- Prevent potential crash when the kontext attribute is empty (e.g. `<span data-kontext="">`)
- Improved code coverage in unit tests for the built kontext.js

### Statistics
- Full size: 65K (+1.4K), gzipped: 16.9K
- Minified size: 15K (+0.42K), gzipped: 5.5K


## 1.4.0
Focused maintenance release, performance improvements.

### Statistics
- Full size: 63.2K (+1.6K), gzipped: 16.5K
- Minified size: 14.5K (+61 bytes), gzipped: 5.4K

### Fixes
- Changed the way Arrays are ensured, as `.concat` allows any type and takes care of casting faster than we can
- Removed references to `Knot` (the previous name of `Kontext`)
- Templates are now bound to a `documentFragment` instead of a `NodeList` and received more inline comments


## 1.3.2
Bugfix

### Fixes
- [`<delegation>.element` method throws error](//github.com/konfirm/kontext/issues/3)


## 1.3.1
Bugfixes

### Fixes
- fixed issue where the default value could no longer be a string value instead of a model property reference
- added `default` to the update list so changing the value also updates the option label

### Statistics
- Full size: 61.6K (+0.2K)
- Minified size: 14.5K (+0.1K)


## 1.3.0
The main focus of this release was to provide a more consistent approach to allow for variable scoping for all extensions.

### Fixes
- `attribute`-extension
	- added support for variable scoping
	- reduced internal overhead (performance improvement)
- `css`-extension
	- fixed potential issue with removal of className
	- added support for variable scoping
	- reduced internal overhead (performance improvement)
- `each`-extension
	- added support for variable scoping
	- added internal documentation (docblocks/flow)
	- reduced internal overhead and complexity (performance improvement)
- `html`-extension
	- simplified even further, making it the perfect example of extension simplicity
- `input`-extensions
	- full module refactoring
	- added support for variable scoping
	- added internal documentation (docblocks/flow)
	- checkbox/radio inputs now support values from the model (including updates initiated by the model)
	- options for `<select>`-elements now also respond to model updates *if provided by the model*
	- fixed complexity issues (reported by Codacy)
	- performance improvement
- `template`-extension
	- added support for variable scoping

### What is "variable scoping"?
Models can contain other models, referring to those in javascript is simple, for example; `model.some.deeper.property = 'value'`. In most extensions this was not implemented properly, so this needed to be corrected.

#### Example usage
All extensions using values from models to control behavior and/or content, the syntax is the same

```html
<h2 data-kontext="text: model.some.deeper.property">..</h2>
<ul data-kontext="each: some.deeper.list">
	<li>...</li>
</ul>
```

### Statistics
- Full size: 61.4K (+3.6K)
- Minified size: 14.4K (**-0.3K**)


## 1.2.0
Fixed issue with `NodeList` as last argument to `kontext.bind`, added the option to use dynamic templates.


### Fixes
- Fixed issue where a `NodeList` as last argument to `kontext.bind` would be used as `options`-object
- Internally the `NodeList` approach is now consistently used in favor of the previous Array approach


### Dynamic template
The `template`-extension now supports dynamic template names by using the object configuration with a `value` key refering to the model property to respond to.

#### Example usage
Using a model like `{myTemplate: '#test'}`, the following example would update the contents to another template if the `myTemplate` property is changed.

```html
<div data-kontext="template: {value: myTemplate}">replaced</div>
```

### Statistics
- Full size: 57.7K (+0.7K)
- Minified size: 14.7K (+0.2K)



## 1.1.0
Added the option to abbreviate extension names, allow for NodeLists to be used for binding and added the `Template`-extension.


### Fixes
none


### Abbreviated extension names
Using extensions now has a slightly more convenient syntax, as all extension names can be used with a shorter notation.
The logic behind it is simple;
- first look if the exact name matches a registered extension name, if an extension matches it is returned
- if the exact name is not an extension, create an internal list of all extension names which start with the provided name
- if the list of matched extensions contains just one extension, it is returned
- if the list of matched extensions exceeds one, an error is provided mentioning the names of the matching extensions
- if there are no matching extensions, an error is provided mentioning the extension is unknown

#### Example usage
```html
<div data-kontext="attribute: {data-foo: bar}">...</div>
```

Can now be written as
```html
<div data-kontext="attr: {data-foo: bar}">...</div>
```

Or even
```html
<div data-kontext="a: {data-foo: bar}">...</div>
```
Although this would lead to errors as soon as another extension is added whose name starts with an `a`. A safe minimum amount of characters would be around 4 (e.g. `attr`), but this is not enforced by Kontext.

#### Controlling this behavior
The abbreviation can be turned on/off by setting the `abbreviateExtensions` to `true` (this is the default) or `false` if you don't want to allow extension names to be abbreviated.


### NodeList binding
Since the initial launch of Kontext, it has been possble to provide a list of elements to be bound to a model using `kontext.bind(model, elementA, elementB)`. As of this release it is possible to provide `NodeList` objects, such as `element.childNodes`, `document.querySelectorAll` and `document.getElementsByTagName`.
This should reduce the need to mangle arrays (which are supported too) and invoke `kontext.bind` using `apply`.


### `Template`-extension
Added the `template`-extension, allowing to replace the contents of the element from both internal and external sources.

#### Example usage
In its most basic use, the template to be used is configured by providing a string value consisting or a path, an id or both.

```html
//  load foo.html into the element
<div data-kontext="template: foo.html">replaced</div>

//  load the contents of an element with the id 'bar' from the foo.html template
<div data-kontext="template: foo.html#bar">replaced</div>

//  load the contents of an element with id 'bar' from the current document
<div data-kontext="template: #bar">replaced</div>
```

For more elaborate configuration, an object syntax is also supported, this provides the option to specify selectors other than `#id`-selectors.

```html
//  load the contents of an element with the attribute data-template matching 'bar'
//  from the /path/to/template template
<div data-kontext="template: {path: /path/to/template, selector: '[data-template=bar]'}">replaced</div>
```

### Statistics
- Full size: 49.7K (+7.6K)
- Minified size: 14.5K (+2.3K)
