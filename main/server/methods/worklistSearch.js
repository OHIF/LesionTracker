
Meteor.methods({
  'WorklistSearch' : function(filter) {
    console.log('WorklistSearch()');
    console.log(filter);

    var server = Meteor.settings.dicomWeb.endpoints[0];
    console.log(server);

    return Services.QIDO.Studies(server, filter);
  }
});