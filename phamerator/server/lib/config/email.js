Meteor.startup(function() {
 process.env.MAIL_URL = "smtp://postmaster%40mail.phamerator.org:be70d6d4f2d1ac5dce2ac4c34b7eb745@smtp.mailgun.org:587";
});


Accounts.emailTemplates.siteName = "phamerator.org";
 Accounts.emailTemplates.from = "Phamerator <info@phamerator.org>";
 Accounts.emailTemplates.resetPassword.subject = function (user) {
 return "Phamerator password reset";
 };
 Accounts.emailTemplates.resetPassword.text = function (user, url) {
 var signature = "Steve Cresawn";

 return "Please click the following link to set your new password:\n" +
 url + "\n\n" +
 "Thanks for using Phamerator!\n\n" +
 "Cheers,\n" +
 signature;
 };