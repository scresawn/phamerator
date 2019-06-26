Template.mapSettingsModal.helpers({
    'blastSwitchState': function () {
      console.log('blastSwitchState running')
        return Session.get("showhspGroups");
    },
    'phamLabelsSwitchState': function () {
        return Session.get("showPhamLabels");
    },
    'functionLabelsSwitchState': function () {
        return Session.get("showFunctionLabels");
    },
    'phamAbundanceState': function () {
        return Session.get("colorByPhamAbundance");
    },
    'conservedDomainState': function () {
        return Session.get ("colorByConservedDomains");
    },
    'phamColorState': function () {
        return Session.get ("colorByPhams");
    }
});
