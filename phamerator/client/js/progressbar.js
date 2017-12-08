Session.set("progressbarState", "0%");
Session.set("progressbarVisibility", false);

Template.progressbar.helpers({
  'progressbarState': function () {
    console.log(Session.get("progressbarState"));
    return Session.get("progressbarState");
  },
  'progressbarVisibility': function () {
    console.log("progressbarVisibility: ", Session.get("progressbarVisibility"));
    return Session.get("progressbarVisibility");
  }
});