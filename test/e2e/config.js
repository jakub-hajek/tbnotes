exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	capabilities: {
	'browserName': 'chrome'
 	},

	specs: ['specs/testLanguage.js'],
	baseUrl: 'http://localhost:9000',
	onPrepare: function(){
       browser.driver.get('http://localhost:9000');
    },
	jasmineNodeOpts: {
	    onComplete: function () {},
	    // If true, display spec names.
	    isVerbose: true,
	    // If true, print colors to the terminal.
	    showColors: true,
	    // If true, include stack traces in failures.
	    includeStackTrace: true,
	    // Default time to wait in ms before a test fails.
	    defaultTimeoutInterval: 30000

	}
};