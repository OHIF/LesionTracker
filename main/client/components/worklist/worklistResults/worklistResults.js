Studies = new Mongo.Collection(null);
Stacks = new Mongo.Collection(null);

search();

function getFilter(name) {
  var filter = Session.get(name);
  if(filter && filter.length && filter.substr(filter.length - 1) !== '*') {
    filter += '*';
  }
  return filter;
}

function search() {
  var filter = {
    patientName: getFilter('worklistPatientNameFilter'),
    patientId: getFilter('worklistPatientIdFilter'),
    accessionNumber: getFilter('worklistAccessionNumberFilter'),
    //studyDate:
  };
  Studies.remove({});
  Meteor.call('WorklistSearch', filter, function(error, studies) {
    studies.forEach(function(study) {
      Studies.insert(study);
    })
  });

}
