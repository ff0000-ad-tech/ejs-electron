# ejs-electron

A mega lightweight, completely flexible module that allows ejs templating in an electronJS app.

Makes use of the electronJS `protocol` module to supply a custom handle for the `file://` protocol.  This handler intercepts all file requests, compiles any requested `.ejs` files, and serves the result.

## Installation

To install using `npm`:

```
$ npm install ejs-electron
```

## Usage

```
var ejse = require('ejs-electron');
```

This will initialize the module and return an instance of EJSE.  This object's methods are as follows:

### Methods

(All methods return the same EJSE instance for chaining.  The EJSE instance will also be made available in the scope of your `.ejs` files via the variable `ejse`, allowing you to `setOptions()` and `stopListening()` there as well).

- config(*conf*)
- setOptions(*options*)
- listen()
- stopListening()

```
config(conf)
```

Supply custom config for `ejs-electron`.

- conf -- *object* -- The config options to override and their new values.

Currently the only config option is:

- verbose -- *bool* -- Whether or not `ejs-electron` should generate console messages if it intercepts a request for a non-existent file.  By default, `ejs-electron` will fail silently, which may not be ideal for development environments.  *default: **false***

```
setOptions(options)
```

Set the options to be passed in to `ejs.render()`.

- options -- *object* -- A list of key-value pairs to be made available in all `.ejs` files.

```
listen()
```

Start listening to/intercepting file requests.  By default, `ejs-electron` starts listening as soon as it's loaded.  Use `listen()` to start listening again after calling `stopListening()`

```
stopListening()
```

Stop listening to/intercepting file requests.

## Examples

A simple electron app with `ejs-electron` could look like this:

##### main.js

```
var electron = require('electron'),
    app = electron.app,
    ejse = require('ejs-electron');

ejse.setOptions({
    opt: 'value'
});

app.on('ready', function() {
    mainWindow = new electron.BrowserWindow();
    mainWindow.loadURL('file://' + __dirname + '/index.ejs');
});
```

You can, of course, chain `setOptions()` to the `require()` call:

```
var ejse = require('ejs-electron').setOptions(opts);
```

An example setting config:

```
var ejse = require('ejs-electron')
    .config({ verbose: true })
    .setOptions({ opt: 'val' });
```

##### index.ejs

```
<h1>Hello, World!</hz>
<% ejse.stopListening(); %>
```

## License
