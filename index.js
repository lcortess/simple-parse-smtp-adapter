"use strict";
const path = require('path');
const nodemailer = require("nodemailer");
const EmailTemplate = require('email-templates').EmailTemplate;

let SimpleParseSmtpAdapter = (adapterOptions) => {

    if (!adapterOptions) {
        throw 'SimpleParseSMTPAdapter requires adapter options';
    }
    else if(adapterOptions.service=='Gmail'){
        if (!adapterOptions ||  
            !adapterOptions.service|| 
            !adapterOptions.type ||  
            !adapterOptions.user || 
            !adapterOptions.clientId || 
            !adapterOptions.clientSecret|| 
            !adapterOptions.refreshToken || 
            !adapterOptions.accessToken ) {
            throw 'SimpleParseSMTPAdapter requires service,type, user, clientId,clientSecret,refreshToken and accessToken';
        }
    }
    else if(adapterOptions.service=='SMTP'){
            if (!adapterOptions.user || !adapterOptions.password || !adapterOptions.host || !adapterOptions.fromAddress ) {
                throw 'SimpleParseSMTPAdapter requires user, password, host, and fromAddress';
            }
    }else{
            throw 'SimpleParseSMTPAdapter please choose service Gmail or SMTP';
    }

    /**
     * Creates trasporter for send emails with OAuth2 Gmail
     */
    let transporterOAuth2Gmail = nodemailer.createTransport({
        service: adapterOptions.service,
        auth: {
            type: adapterOptions.type,
            user: adapterOptions.user,
            clientId: adapterOptions.clientId,
            clientSecret: adapterOptions.clientSecret,
            refreshToken: adapterOptions.refreshToken,
            accessToken: adapterOptions.refreshToken,
            expires: adapterOptions.expires
        }
    });

    /**
     * Creates trasporter for send emails with OAuth2 Gmail
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
        let html = new EmailTemplate(templateDir);

        return new Promise((resolve, reject) => {
            html.render(data, (err, result) => {
                if (err) {
                    console.log(err)
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
            to: mail.to,
            html: mail.text,
            subject: mail.subject,
            from: adapterOptions.fromAddress
        };

        return new Promise((resolve, reject) => {

            if(adapterOptions.service=='SMTP'){
                transporter.sendMail(mailOptions, (error, info) => {
                    if(error) {
                        console.log(error)
                        reject(error);
                    } else {
                        resolve(info);
                    }
                });
            }
            else if(adapterOptions.service=='Gmail'){
                transporterOAuth2Gmail.sendMail(mailOptions, (error, info) => {
                    if(error) {
                        console.log(error)
                        reject(error);
                    } else {
                        resolve(info);
                    }
                });
            }

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
                mail.text = result.html;
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
                mail.text = result.html;
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
        renderTemplate: renderTemplate,
        sendPasswordResetEmail: sendPasswordResetEmail,
        sendVerificationEmail: sendVerificationEmail
    });
};

module.exports = SimpleParseSmtpAdapter;
