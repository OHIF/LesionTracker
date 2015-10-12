Template.thumbnailContainer.helpers({
    studies: function () {

        var activeTabId = Session.get("activeTabId");
        console.log(activeTabId);
        //Get studies from activeTabId Session
        var studies = Session.get(activeTabId);
        console.log(studies);
        return studies;
    }
});

Template.thumbnailContainer.onRendered ( function () {

    //Get activeTabId and create dockingContainer uniquely.
    var activeTabId = Session.get("activeTabId");
    var splitTabId = activeTabId.split("tab");
    var contentId = "content"+splitTabId[1];
    $("#"+contentId).find(".thumbnailContainer").dockingContainer();
});

