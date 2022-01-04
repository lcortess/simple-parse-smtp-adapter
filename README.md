# Simple Parse Server SMTP Email Adapter

With this adapter you can send email for reset password and email verification in parse with SMTP access and custom templates, I am doing methods for support email verification, and templates for reset password pages :)

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

const Express = require("express");
const ParseServer = require("parse-server").ParseServer;

const app = Express();
const APP_PORT = 1337;

let options = {};

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
      service: "Gmail", // required
      clientId: "your_clientid_get_from_console_google_developers",
      clientSecret: "your_clientsecret_get_from_console_google_developers",
      refreshToken: "your_refresh_token_get_from_console_google_developers",
      accessToken: "your_access_token_get_from_console_google_developers",
      fromAddress: "your@sender.address",
      user: "email@email.com", //#"required for service SMTP"
      //password: 'AwesomePassword',  //#"required for service SMTP"
      //host: 'your.smtp.host',  //#"required for service SMTP"
      //isSSL: true, //True or false if you are using ssl  //#"required for service SMTP"
      //port: 465, //SSL port or another port //#"required for service SMTP"
      name: "your domain name", //  optional, used for identifying to the server
      //Somtimes the user email is not in the 'email' field, the email is search first in
      //email field, then in username field, if you have the user email in another field
      //You can specify here
      emailField: "username",
      // Define the extension of your template files, by default handlebars is used.
      extension: "handlebars",
      templates: {
        //This template is used only for reset password email
        resetPassword: {
          //Path to your template
          template: __dirname + "/views/email/reset-password",
          //Subject for this email
          subject: "Reset your password",
        },
        verifyEmail: {
          template: __dirname + "/views/email/verify-email",
          subject: "Verify Email",
        },
      },
    },
  },
});

/**
 * Parse Server endpoint
 */
app.use("/parse", api);

app.listen(APP_PORT, function () {
  console.log(`Parse Server Ready and listening on port ${APP_PORT}`);
});
```

### Template

The path you pass to the email adapter must be a directory and not a file, this path must contain a file named `index.handlebars`. If you use another template engine, define the adapter option `extension`. For engine sources visit [consolidate.js](https://github.com/tj/consolidate.js/#supported-template-engines) which is the used template engine.
Inside templates, you can use the following variables:

- appName //This is the name of your parse app
- link //This is the link for reset the password
- user //This is a Parse object with the current user, so you can use any field in your User class of parse for example the user name `#{user.get('username')}`

### Contributing

This module is a private fork and not a maintained public module, however this repo is pull request friendly and all backwards compatible contributions are welcome.
Free to [open an issue](https://github.com/music-bat/mbat/issues/new) in our main repo. Please also read through the [Code of Conduct](https://github.com/music-bat/mbat/blob/main/CODE_OF_CONDUCT.md) of our [main repo](https://github.com/music-bat/mbat/blob/main/CODE_OF_CONDUCT.md).

### License MIT
