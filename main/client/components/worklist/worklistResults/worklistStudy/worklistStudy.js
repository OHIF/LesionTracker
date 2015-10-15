// Generate UUID to create unique tabs
function generateUUID () {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*8)%8 | 0;
    d = Math.floor(d/8);
    return (c=='x' ? r : (r&0x3|0x8)).toString(8);
  });
  return uuid;
}

// Remove tab
function removeTab (uuid) {
  var removedTabIndex = $("#tab"+uuid).index();
  //Remove tab
  $("#tab"+uuid).remove();
  //Remove Content
  $("#content"+uuid).remove();

  //TODO:Activate previous tab

}
function newTab(data) {
  Meteor.call('GetStudyMetadata', data.studyInstanceUid, function(error, study) {
    sortStudy(study);

    var studies = [study];

    // Creat an id for tab
    var uuid = generateUUID();

    // Create Tabs collection data
    Tabs._collection.insert({tabId:uuid,data:data,studies: studies});

  });
}

// Add new tab
function addNewTab (data) {
  //Make inactive all tabs
  $("#tabs > li").removeClass("active");
  $("#tabs-content  > div").removeClass("active");

  //Create new li element for tab
  var tabli = document.createElement("li");
  $(tabli).addClass("active");
  $("#tabs").append(tabli);

  //a element inside li
  var taba = document.createElement("a");
  var uuid = generateUUID();
  var tabId = "tab"+uuid;


  //activeTabId provides unique tabs content and encapsulates templates in tabs
  Session.set("activeTabId", tabId);

  //Create tab
  taba.setAttribute("data-toggle","tab");
  taba.setAttribute("id",tabId);
  taba.innerHTML = data.patientName;
  tabli.appendChild(taba);

  //Create close button
  var btnClose = document.createElement('button');
  $(btnClose).addClass("btnClose");
  btnClose.innerHTML = "x";
  btnClose.onclick = function() { // Note this is a function
    removeTab(uuid);
  };
  taba.appendChild(btnClose);

  //Create div content
  var tabContent = document.createElement("div");
  var contentId = "content"+uuid;
  tabContent.setAttribute("id",contentId);
  $(tabContent).css("background-color", "black");
  $(tabContent).addClass("tab-pane");
  $(tabContent).addClass("active");
  $("#tabs-content").append(tabContent);

  var self = this;
  self.tabId = tabId;
  Meteor.call('GetStudyMetadata', data.studyInstanceUid, function(error, study) {
    sortStudy(study);

    var studies = [study];
    Session.set(self.tabId, studies);
    UI.render(Template.viewer, $("#"+contentId).get(0));


  });

}
Template.worklistStudy.events({
  'click' : function() {
    // Add new tab
   // addNewTab(this);
    newTab(this);
  }

});

