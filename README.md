# Simple Parse Server SMTP Email Adapter

With this adapter you can send email for reset pasword in parse with SMTP access and custom templates, I am doing methods for support email verification, and templates for reset pasword pages :)

### Installation

Install npm module in your parse server project

```sh
$ npm install --save simple-parse-smtp-adapter
```

### Use

In the configuration of your parse server you must pass `simple-parse-smtp-adapter` as email adapter and set your SMTP access for send emails also the path to your jade template and its less file.

This is an example using parse server as express module:

```js
"use strict";

const Express = require('express');
const ParseServer = require('parse-server').ParseServer;

const app = Express();
const APP_PORT = 1337;

let api = new ParseServer({
	appName: "Parse Test",
	appId: "12345",
	masterKey: "abcde12345",
	serverURL: "http://localhost:1337/parse",
	publicServerURL: "http://localhost:1337/parse",
	databaseURI: "mongodb://user:pass@host:27017/parse",
	port: APP_PORT,
	//This is the config for email adapter
	emailAdapter: {
		module: "simple-parse-smtp-adapter",
		options: {
			fromAddress: 'your@sender.address',
			user: 'email@email.com',
			password: 'AwesomePassword',
			host: 'your.smtp.host',
			isSSL: true, //True or false if you are using ssl
			port: 465, //SSL port or another port
			//Somtimes the user email is not in the 'email' field, the email is search first in
			//email field, then in username field, if you have the user email in another field
			//You can specify here
			emailField: 'username', 
			templates: {
			    //This template is used only for reset password email
				resetPassword: {
				    //Path to your template
					template: __dirname + '/views/email/reset-password',
					//Subject for this email
					subject: 'Reset your password'
				}
			}
		}
	}
});

/**
 * Parse Server endpoint
 */
app.use('/parse', api);

app.listen(APP_PORT, function () {
	console.log(`Parse Server Ready and listening on port ${APP_PORT}`);
});
```

### Template
The path you pass to the email adapter must be a directory and not a file, this path must contain 2 mandatory files `html.jade` and `style.less` you can do your template as you like with the [CSS rules that emails supports](https://www.campaignmonitor.com/css/) in the template you can use 3 variables:

- appName //This is the name of your parse app
- link //This is the link for reset the password
- user //This is a Parse object with the current user, so you can use any field in your User class of parse for example the user name `#{user.get('username')}`

### Contributing
This module is pull request friendly in the develop branch feel free of send new features or bug fixes.

If you find a bug please open an issue.

### License MIT
