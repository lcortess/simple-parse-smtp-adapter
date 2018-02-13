"use strict";
const path = require('path');
const nodemailer = require("nodemailer");
const Email = require('email-templates');

let SimpleParseSmtpAdapter = (adapterOptions) => {
    if (!adapterOptions || !adapterOptions.user || !adapterOptions.password || !adapterOptions.host || !adapterOptions.fromAddress ) {
        throw 'SimpleParseSMTPAdapter requires user, password, host, and fromAddress';
    }

    /**
     * Creates trasporter for send emails
     */
    let transporter = nodemailer.createTransport({
        host: adapterOptions.host,
        port: adapterOptions.port,
        secure: adapterOptions.isSSL,
        name: adapterOptions.name || '127.0.0.1',
        auth: {
            user: adapterOptions.user,
            pass: adapterOptions.password
        },
        tls: {
            rejectUnauthorized: adapterOptions.isTlsRejectUnauthorized !== undefined ? adapterOptions.isTlsRejectUnauthorized : true
        }
    });

    /**
     * When emailField is defined in adapterOptines return that field
     * if not return the field email and if is undefined returns username
     * 
     * @param Parse Object user
     * @return String email
     */
    let getUserEmail = (user) => {
        let email = user.get('email') || user.get('username');

        if (adapterOptions.emailField) {
            email = user.get(adapterOptions.emailField);
        }

        return email;
    };

    /**
     * Return an email template with data rendered using email-templates module
     * check module docs: https://github.com/niftylettuce/node-email-templates
     *
     * @param String template path template
     * @param Object data object with data for use in template
     */
    let renderTemplate = (template, data) => {
        let templateDir = template;
        let templateFile = "html";
        
        let html = new Email({
            views: { root: templateDir }
        });
        
        return html.render(templateFile, data);
    };

    /**
     * Parse use this function by default for sends emails
     * @param mail This object contain to address, subject and email text in plain text
     * @returns {Promise}
     */
    let sendMail = (mail) => {
        let mailOptions = {
            to: mail.to,
            html: mail.text,
            subject: mail.subject,
            from: adapterOptions.fromAddress
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if(error) {
                    console.log(error)
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
            subject: 'Reset Password',
            to: getUserEmail(data.user)
        };

        if (adapterOptions.templates && adapterOptions.templates.resetPassword) {

            return renderTemplate(adapterOptions.templates.resetPassword.template, data).then((result) => {
                mail.text = result;
                mail.subject = adapterOptions.templates.resetPassword.subject;

                return sendMail(mail);
            }, (e) => {

                return new Promise((resolve, reject) => {
                    console.log(e)
                    reject(e);
                });
            });

        } else {
            mail.text = data.link;

            return sendMail(mail);
        }
    };

    /**
     * When this method is available parse use for send email for email verification
     * @param data This object contain {appName}, {link} and {user} user is an object parse of User class
     * @returns {Promise}
     */
    let sendVerificationEmail = (data) => {
        let mail = {
            subject: 'Verify Email',
            to: getUserEmail(data.user)
        };

        if (adapterOptions.templates && adapterOptions.templates.verifyEmail) {
            
            return renderTemplate(adapterOptions.templates.verifyEmail.template, data).then((result) => {
                mail.text = result;
                mail.subject = adapterOptions.templates.verifyEmail.subject;

                return sendMail(mail);
            }, (e) => {

                return new Promise((resolve, reject) => {
                    console.log(e);
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
        sendPasswordResetEmail: sendPasswordResetEmail,
        sendVerificationEmail: sendVerificationEmail
    });
};

module.exports = SimpleParseSmtpAdapter;
