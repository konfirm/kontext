# Kontext API
An instance of Kontext is created in the global scope and available as `(window.)kontext`. This is done upon inclusion of the kontext script.


## `bind`
Bind a model to one or more elements. This is what is needed to establish the two way binding between the model and the configuration in the elements. There is no limit on how many models can be bound to the same element, though it is recommended to limit it as it becomes very hard to debug if models start to influence each other.

Syntax: `Object model = bind(Object model [, DOMElement element [, DOMElement element...]] [, Object options])`
The only required argument to the `bind` method is the model, if no element is provided, the model will be bound to the document.body element. The last argument may be an object containing overrides for the default settings.


### Models
Models have been kept simple purposely, all it really takes is a simple object. It is not required to create delegates upfront, but you can if you please. Upon binding all of the model properties will become delegated, this is done by setting the created delegate as both getter and setter for the properties. See the `delegate` section for more info on what a delegate does.

When models are bound, some methods are automatically added. These methods allow to (un)register events and access the delegates for the properties.
- `function <model>.on(string type, function handle)` - register a handler for given type. Available types are: `'update'`, `'access'`
- `array <model>.off([string type], [function handle])` - remove a handler by `string type` and/or by `function handle`, all handles removed are returned in an array
- `function <model>.delegation(string key)` - obtain the delegate function for given property.


## `bindings`
Sometimes it is convenient to obtain all models influencing an element, this is where the `bindings` method comes in. It accepts an options element as argument and will return an array containing all models bound on ore above the element (and therefor capable of influencing the element).

Syntax: `Array models = bindings([DOMElement element])`
The order in which the models are provided is the order in which they were bound, depending on how the binding are processed you cannot really trust the order. Note that extensions (for example `each`) can also bind models to elements.


## `delegate`
If it is desirable to create your own delegate functions, you can do so by calling `kontext.delegate`, it accepts an initial value. This is the same type of function used by Kontext as both the getter and setter for model properties, and also the same as obtained from through `model.delegation(string key)`.

Syntax: `function delegation = delegate(initial [, model, key])`
The delegation function acts as both getter and setter, invocation with an argument will set the value. The delegation function itself will always return the value (both when invoke with and without arguments).

The delegate function itself also provides some methods, mostly intended for internal use, but as they are exposed they may come in handy some time.
- `array element([DOMElement...])` - add elements (DOMText instances) which get updated whenever the delegates' value changes
- `function = on(string type, function handle)` - register an event handler (emitted types are `'update'` (on modification) and `'access'` (on read))
- `array off([string type] [, function handle])` - unregister event handlers, either by type and/or handle, and return the removed handles in an array.
- `void scope(object model, string key)` - this sets the model/key for delegates created explicitly, once set, the scope will not be changed. The model/key are used when emitting events.

## `defaults`
Even though the defaults have been carefully chosen, some flexibility must always be taken into consideration.
Syntax: `Object settings = defaults(Object settings)`

The default settings are:
- `(bool) greedy`, default `true` - add any placeholder key to the model if it is not present
- `(string) attribute`, default `'data-kontext'` - the html element attribute to process for Kontext extensions
- `(RegExp) pattern`, default `/(\{(\$?[a-z0-9_-]+)(?::([^\}]+))?\})/i` (matches: `{key}` and `{key:value}`)

Placeholder patterns consist of a single regular expression and are used for both detection and obtaining the key/value. While setting up an alternative expression does require some knowledge on regular expressions, the basic requirements for Kontext are rather simple, there need to be three so called groups:
- The full placeholder: `{key:value}` for `{key:value}` using the default pattern. This needs to be the placeholder in its entirety, including the beginning and end markers
- The key: `key` from `{key:value}` using the default pattern. This is the part of the full placeholder which refers to the key in the model. **NOTE**: When using the `each`-extension the models automatically get the `$index`, `$item` (and `$parent`) properties which can be used in templates, make sure to support these.
- The initial value (optional): `value` from `{key:value}`` using the default pattern. This is the part of the full placeholder which allows you to have a value should the model key be `false`-ish (e.g. `false`, `null`, `undefined`)


## `on`
Register a handler for `update` and `access` emissions. The `update` is triggered whenever a value changes, and `access` is triggered whenever a key is read (accessed).

Syntax: `function handle = on(string type, function handle)`

The handle function is called with the following arguments:
- `model` - the model whose key was accessed/updated
- `key` - the accessed/updated key
- `value` - the value (prior to update, in case of an update)
- `newValue` - the new value (in case of an update)

## `off`
Remove handlers by type and/or handler function. All removed handlers are returned in an array.

Syntax: `Array removed = off([string type] [, function handle])`

## `ready`
Convenience method to ensure Kontext to be ready for binding models to the HTML, it is triggered right after Kontext itself is initialized _and_ the DOM is available for interaction (DOM-ready).

Syntax: `Kontext = ready(function handler)`

The handle function is called with the following arguments:
- `(string) error` - an error message or `undefined` if no errors
- `(object) Kontext` - a reference to Kontext, or `undefined` if there was an error
