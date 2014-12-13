module.exports = require('objectjs').extend({

	defOpts: {
    config: null,
    configDir: 'angularify.json'
  },

	compile: function(strFileData, config) {
		return {
			isValid: true,
			content: strFileData
		};
	}

});