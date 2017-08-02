Accounts.emailTemplates.siteName = "mail.phamerator.org";
Accounts.emailTemplates.from = "Phamerator <info@mail.phamerator.org>";
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