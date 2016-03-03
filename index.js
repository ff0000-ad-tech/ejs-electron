// Load Dependencies
var app = require('electron').app,
    ejs = require('ejs')
    fs = require('fs'),
    url = require('url')

// Private variables
var protocol, // will be set to the protocol module, which is only available inside `app.on('ready', ...`
    config = { verbose: false },
    userOpts = {}

    
// Initialize module.
var EJSE = function() {
    var self = this
    app.on('ready', function() {
        protocol = require('protocol')
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
        if (!protocol) return
        var self = this
        
        protocol.interceptStringProtocol('file', function(request, callback) {
            var fileName = url.parse(request.url).pathname
            
            fs.readFile(fileName, function(err, data) {
                if (err) {
                    if (config.verbose) console.error('\033[91m EJS-Electron Warning:\033[0m\n  File "' + fileName + '" not found.\n')
                    return callback()
                }
                
                var fileContents = '' + data // turn the buffer into a string
                if (fileName.slice(-4) !== '.ejs') return callback(fileContents)
                
                // If it's a '.ejs' file, compile the contents and return the result
                userOpts.filename = fileName
                userOpts.ejse = self
                var compiledFile = ejs.render(fileContents, userOpts)
                
                return callback(compiledFile) // 'return' it, just to be consistent
            })
        })
        return this
    },
    
    // Set the options to be passed in to `ejs.render()`.
    setOptions: function(optsIn) {
        userOpts = optsIn || {}
        return this
    },
    
    // Stop intercepting requests, restoring the original `file://` protocol handler.
    stopListening: function() {
        if (!protocol) return
        
        protocol.uninterceptProtocol('file')
        return this
    }
}


// Expose stuff
module.exports = new EJSE()
