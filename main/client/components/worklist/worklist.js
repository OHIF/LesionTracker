Tabs = new Meteor.Collection("tabs");

Template.worklist.helpers({
    tabs: function () {
        return Tabs.find();
    },

    getTemplate: function () {
        return 'viewerMain';
    }
});

Template.worklist.events({
    'click ul#tabs>li>a': function (event){
        var tabId = $(event.target).attr("id");
        if( tabId !== undefined ) {

            var splitTabId = tabId.split("tab");
            var contentId = "content"+splitTabId[1];

            //Make inactive all tab-pane divs
            $("#tabs-content>div").removeClass("active");
            $("#"+contentId).addClass("active");
        }
    }
});

Template.worklist.onRendered( function () {
    Tabs.find().observe({
        added: function (tabData) {
            // Activate added tab
            //Make inactive all tab-pane divs
            $("#tabs>li").removeClass("active");
            $("#tabs-content>div").removeClass("active");
            var tabId = "tab"+tabData.tabId;
            var contentId = "content"+tabData.tabId;
            $("#"+tabId).parent("li").addClass("active");
            $("#"+contentId).addClass("active");
        }

    });
});