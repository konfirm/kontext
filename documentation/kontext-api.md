# Kontext API
An instance of Kontext is created in the global scope and available as `(window.)kontext`. This is done upon inclusion of the kontext script.


## bind
Bind a model to one or more elements. This is what is needed to establish the two way binding between the model and the configuration in the elements. There is no limit on how many models can be bound to the same element, though it is recommended to limit it as it becomes very hard to debug if models start to influence each other.

Syntax: `Object model = bind(Object model [, DOMElement element [, DOMElement element...]] [, Object options])`
The only required argument to the `bind` method is the model, if no element is provided, the model will be bound to the document.body element. The last argument may be an object containing overrides for the default settings.

### Models
Models have been kept simple purposely, all it really takes is a simple object. It is not required to create delegates upfront, but you can if you please. Upon binding all of the model properties will become delegated, this is done by setting the created delegate as both getter and setter for the properties. See the `delegate` section for more info on what a delegate does.

When models are bound, some methods are automatically added. These methods allow to (un)register events and access the delegates for the properties.
- `function <model>.on(string type, function handle)` - register a handler for given type. Available types are: `'update'`, `'access'`
- `array <model>.off([string type], [function handle])` - remove a handler by `string type` and/or by `function handle`, all handles removed are returned in an array
- `function <model>.delegation(string key)` - obtain the delegate function for given property.


## bindings
Sometimes it is conventient to obtain all models influencing an element, this is where the `bindings` method comes in. It accepts an options element as argument and will return an array containing all models bound on ore above the element (and therefor capable of influencing the element).

Syntax: `Array models = bindings([DOMElement element])`
The order in which the models are provided is the order in which they were bound, depending on how the binding are processed you cannot really trust the order.


## delegate
`function delegation = delegate(initial [, model, key])`

## `Object settings = defaults(Object settings)`

## `function handle = on(string type, function handle)`

## `Array removed = off([string type] [, function handle])`

## `Kontext = ready(function handler)`
