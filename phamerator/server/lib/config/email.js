 Accounts.emailTemplates.siteName = "Phamerator.org";
 Accounts.emailTemplates.from = "Phamerator <info@phagesdb.org>";
 Accounts.emailTemplates.resetPassword.subject = function (user) {
 return "Phamerator password reset for " + user.profile.displayName;
 };
 Accounts.emailTemplates.resetPassword.text = function (user, url) {
 var signature = "Steve Cresawn";
 //var president = President.findOne();
 //if (president)
 //    president = Meteor.users.findOne(president.presidentId);
 //    signature = president.profile.displayName + ", the MySite President.";
 return "Dear " + user.profile.displayName + ",\n\n" +
 "Click the following link to set your new password:\n" +
 url + "\n\n" +
 "Thanks for using Phamerator!\n\n\n" +
 "Cheers,\n" +
 signature;
 };