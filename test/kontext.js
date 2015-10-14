/*global Emission, describe, beforeEach, it, expect*/
describe('Kontext', function() {
	var model = kontext.bind({
			foo: 'bar',
			pie: Math.PI,
			boo: false
		});

	it('notifies change', function(done) {
		model.on('change', function(model, key, old) {
			console.log(model, key, model[key], old);

			done();
		});

		model.foo = 'baz';
	});
});
