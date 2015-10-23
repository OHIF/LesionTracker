Template.studyBrowser.helpers({
  studies : function() {
    var activeTabId = Session.get("activeTabId");
    var studies = Session.get(activeTabId);
    return studies;
  }
});

Template.studyBrowser.onRendered(function (){
  var studyBrowser = this.find(".studyBrowser");
  $(studyBrowser).dockingContainer();
});