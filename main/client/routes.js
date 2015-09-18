if (Meteor.isClient) {

  Router.map(function() {
    this.route('worklist', { template: 'worklist', path: '/' });
  });

  Router.route('/custom_components/study-list/studyListIndex.html', function () {
    this.stop();
  });

}