// Load Dependencies
var electron = require( 'electron' ),
	ejs = require( 'ejs' ),
	fs = require( 'fs' ),
	url = require( 'url' ),
	mime = require( 'mime' )

// Private variables
var protocol, // will be set to the protocol module, which is only available inside `electron.app.on('ready', ...`
	config = { verbose: false },
	userOpts = {}

	
// Initialize module.
var EJSE = function() {
	var self = this
	electron.app.on( 'ready', function() {
		protocol = require( 'protocol' )
		self.listen()
	})
}
EJSE.prototype = {
	
	// Supply config
	config: function(conf) {
		// A simple `object.extend` function
		Object.keys(conf).forEach(function(key) {
			config[key] = conf[key]
		})
		return this
	},
	
	// Start intercepting requests, looking for '.ejs' files.
	listen: function() {
		if (!protocol) return this
		var self = this
		
		protocol.interceptBufferProtocol( 'file', function( request, callback ) {
			var fileName = decodeURI( url.parse( request.url ).pathname );
			var data = fs.readFileSync( fileName );
			try {
				var extension = fileName.match( /\.([^\.]*)$/ )[ 1 ];
				var mimeType = mime.lookup( extension );
				if( extension == 'ejs' ) {
					var fileContents = data.toString( 'utf-8' );
					userOpts.filename = fileName;
					userOpts.ejse = self;
					var ejsCompiled = ejs.render( fileContents, userOpts );
					data = new Buffer( ejsCompiled, 'utf-8' );
					mimeType = 'text/html';
				}
				return callback({ 
					data: data,
					mimeType: mimeType
				});
			} 
			catch( error ) {
				console.log( 'ejs-electron cannot parse:', fileName );
				console.log( error );
				// See here for error numbers:
				// https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
				if( e.code === 'ENOENT' ) {
					// NET_ERROR(FILE_NOT_FOUND, -6)
					return callback(6);
				}
			}
		});
		return this
	},
	
	// Set the options to be passed in to `ejs.render()`.
	setOptions: function(optsIn) {
		userOpts = optsIn || {}
		return this
	},
	
	// Stop intercepting requests, restoring the original `file://` protocol handler.
	stopListening: function() {
		if (!protocol) return this
		
		protocol.uninterceptProtocol('file')
		return this
	}
}


// Expose stuff
module.exports = new EJSE()
