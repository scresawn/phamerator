Session.set("progressbarState", "0%");
Session.set("progressbarVisibility", false);

Template.progressbar.helpers({
  'progressbarState': function () {
    return Session.get("progressbarState");
  },
  'progressbarVisibility': function () {
    return Session.get("progressbarVisibility");
  }
});
