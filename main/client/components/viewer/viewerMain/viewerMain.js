Template.viewerMain.helpers({

  tabData : function() {
    var tabData = Template.instance().data;
    console.log(tabData);
    var studies = tabData.studies;
    return tabData;
  }
});