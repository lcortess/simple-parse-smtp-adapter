"use strict";
const path = require('path');
const nodemailer = require("nodemailer");
const EmailTemplate = require('email-templates').EmailTemplate;

let SimpleParseSmtpAdapter = (adapterOptions) => {
    if (!adapterOptions || !adapterOptions.user || !adapterOptions.password || !adapterOptions.host || !adapterOptions.fromAddress ) {
        throw 'SimpleParseSMTPAdapter requires user, password, host, and fromAddress';
    }

    let transporter = nodemailer.createTransport({
        host: adapterOptions.host,
        port: adapterOptions.port,
        secure: adapterOptions.isSSL || true,
        auth: {
            user: adapterOptions.user,
            pass: adapterOptions.password
        }
    });

    /**
     * Return an email template with data rendered using email-templates module
     * check module docs: https://github.com/niftylettuce/node-email-templates
     *
     * @param String template path template
     * @param Object data object with data for use in template
     */
    let renderTemplate = (template, data) => {
        let templateDir = template;
        let html = new EmailTemplate(templateDir);

        return new Promise(function(resolve, reject) {
            html.render(data, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };

    /**
     * Parse use this function by default for sends emails
     * @param mail This object contain to address, subject and email text in plain text
     * @returns {Promise}
     */
    let sendMail = (mail) => {
        let mailOptions = {
            from: adapterOptions.fromAddress,
            to: mail.to,
            subject: mail.subject,
            html: mail.text,
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    };

    /**
     * When this method is available parse use for send email for reset password
     * @param data This object contain {appName}, {link} and {user} user is an object parse of User class
     * @returns {Promise}
     */
    let sendPasswordResetEmail = (data) => {
        let mail = {
            to: data.user.get('email'),
            subject: 'Reset Password'
        };

        if (adapterOptions.templates && adapterOptions.templates.resetPassword) {

            return renderTemplate(adapterOptions.templates.resetPassword.template, data).then(function(result) {
                mail.text = result.html;
                mail.subject = adapterOptions.templates.resetPassword.subject;

                return sendMail(mail);
            }, function(e) {
                return new Promise(function(resolve, reject) {
                    reject(e);
                });
            });

        } else {
            mail.text = data.link;

            return sendMail(mail);
        }
    };

    return Object.freeze({
        sendMail: sendMail,
        sendPasswordResetEmail: sendPasswordResetEmail
    });
};

module.exports = SimpleParseSmtpAdapter;