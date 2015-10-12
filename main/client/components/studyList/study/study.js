//TODO: Check null/undefined fields
Template.study.events({
    'click': function (){

        var self = this;

        //Open new tab in studyList template
        Session.set('openNewTabEvent', self);

        Meteor.call('GetStudyMetadata', this.studyInstanceUid, function(error, study) {
            sortStudy(study);

            var studies = [study];
            var activeTabId = Session.get("activeTabId");
            console.log(activeTabId);
            //Save studies for each tab
            Session.set(activeTabId, studies);
            Session.set('showContentInTab', true);


        });
    }
});