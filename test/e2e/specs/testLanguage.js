// example-spec.js
describe('language switch', function() {
  it('should display selected languege in bold', function() {
    browser.get('/');
	element.all( by.id('languageEn')).get(0).getCssValue('font-weight').then(function(val) {
		expect(val).toBe('normal');
	});
    element.all( by.id('languageEn')).get(0).click();
	element.all( by.id('languageEn')).get(0).getCssValue('font-weight').then(function(val) {
		expect(val).toBe('bold');
	});

  });
});


