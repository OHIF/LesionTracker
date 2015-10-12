Studies = new Mongo.Collection(null);

Template.studyListResult.helpers({
    studies : function() {
        return Studies.find();
    }
});