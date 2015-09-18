//Set document title
Meteor.startup(function() {
    Deps.autorun(function() {
        document.title = "Lesion Tracker";
    });
});