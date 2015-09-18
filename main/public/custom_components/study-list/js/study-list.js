var NewStudyDoc = document.currentScript.ownerDocument;
NewStudyProto = Object.create(HTMLElement.prototype);
//It is called when <cornerstone-module></cornerstone-module> is created
NewStudyProto.createdCallback = function (){

    //Create shadow dom
    var template = NewStudyDoc.querySelector('#study-list-template');
    if(template == null) {
        return;
    }

    var clone = template.content.cloneNode(true);

    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(clone);
    var shadowEl = this.shadow;
    var tblStudyList = this.shadow.querySelector("#tblStudyList");
    var studyList = [];
    var previousTab;

    //Get studies
    var cursor = Studies.find();
    if (cursor == null) {
        return;
    }

    //Observe changes for studies
    var studies = cursor.fetch();
    cursor.observeChanges(  //Observe the change of cursor and update a field
    {
        added: function(id, study) {
            var i = studyList.length + 1;
            studyList.push(study);
            (function(){
                shadowEl.addStudy(study, i);
            })();
        },
        removed: function(id, fields) {
            studyList = cursor.fetch();
            //Empty table
            $(shadowEl.querySelector("#tblStudyList")).empty();
            for(var j=0; j< studyList.length; j++){
                var i = j+1;
                var study = studyList[j];
                (function(){
                    shadowEl.addStudy(study, i);
                })();
            }
        }
    });

    //Replace object is undefined
    shadowEl.replaceUndefinedColumnValue =  function(text) {
        if (text == undefined || text === "undefined") {
            return "";
        } else {
            return text;
        }
    };

    //Add study to table
    shadowEl.addStudy = function(study,i) {
        var rowContent = "<tr id=" +
            i +
            "><td>" +
            shadowEl.replaceUndefinedColumnValue(study.patientName) +
            "</td><td>" +
            shadowEl.replaceUndefinedColumnValue(study.patientId) +
            "</td><td>" +
            shadowEl.replaceUndefinedColumnValue(study.accessionNumber) +
            "</td><td>" +
            shadowEl.replaceUndefinedColumnValue(study.studyDate) +
            "</td><td>" +
            shadowEl.replaceUndefinedColumnValue(study.modalities) +
            "</td><td>" +
            shadowEl.replaceUndefinedColumnValue(study.studyInstanceUid) +
            "</td><td>" +
            shadowEl.replaceUndefinedColumnValue(study.imageCount) +
            "</td></tr>";
        $(tblStudyList).append(rowContent);
    };

    //Table row click event, add new tab
    $(shadowEl.querySelector("#tblStudyList")).on("click", "tr", function(e) {
        var rowId = $(this).attr("id");
        var study = studyList[rowId - 1];
        shadowEl.addNewTab(study);
    });

    shadowEl.setPreviousTab = function() {
        //Get previous active tab
        var previousActiveLi =shadowEl.querySelector(".nav > li.active");
        previousTab = $(previousActiveLi).children("a").attr("id");
        if(previousTab == undefined || previousTab == "undefined") {
            previousTab = "tabList";
        }
    };

    //Activate Tab
    shadowEl.activateTab = function (tabId) {
        var splitId = tabId.split("tab");
        var contentId = "content"+splitId[1];
        $(shadowEl.querySelectorAll(".nav > li")).removeClass("active");
        $(tabId).parent("li").addClass("active");

        //Activate content
        $(shadowEl.querySelectorAll(".tab-content  > div")).removeClass("active");
        $(shadowEl.querySelector(".tab-content > div#"+contentId)).addClass("active");
    };

    //Add New Tab
    shadowEl.addNewTab = function(study) {

        shadowEl.setPreviousTab();
        //Make inactive all tabs
        $(shadowEl.querySelectorAll(".nav > li")).removeClass("active");
        $(shadowEl.querySelectorAll(".tab-content  > div")).removeClass("active");

        //Create new li element for tab
        var tabli = document.createElement("li");
        $(tabli).addClass("active");
        shadowEl.querySelector("#tabs").appendChild(tabli);

        //a element inside li
        var taba = document.createElement("a");
        var uuid = shadowEl.generateUUID();
        var tabId = "tab"+uuid;
        taba.setAttribute("data-toggle","tab");
        taba.setAttribute("id",tabId);
        taba.innerHTML = study.patientName;
        tabli.appendChild(taba);

        //Create close button
        var btnClose = document.createElement('button');
        $(btnClose).addClass("btnClose");
        btnClose.innerHTML = "x";
        btnClose.onclick = function() { // Note this is a function
            shadowEl.removeTab(uuid);
        };
        taba.appendChild(btnClose);

        //Create div content
        var tabContent = document.createElement("div");
        var contentId = "content"+uuid;
        tabContent.setAttribute("id",contentId);
        $(tabContent).addClass("tab-pane");
        $(tabContent).addClass("active");
        shadowEl.querySelector("#tabs-content").appendChild(tabContent);

        //Create viewport
        shadowEl.createViewport(contentId, study);

    };

    //Remove tab
    shadowEl.removeTab = function(uuid) {
        var removedTabIndex = $(shadowEl.querySelectorAll("#tab"+uuid)).index();
        //Remove tab
        $(shadowEl.querySelector("#tab"+uuid)).remove();
        //Remove Content
        $(shadowEl.querySelector("#content"+uuid)).remove();

        //Activate Tab
        if(previousTab == undefined || previousTab == "undefined") {
            shadowEl.activateTab("tabList");

        }else{
            shadowEl.activateTab(previousTab);

        }

    };

    //When a tab is clicked, make it active and deactive the other tabs
    $(shadowEl.querySelector("#tabs")).on( "click", function(e) {
        shadowEl.setPreviousTab();

        ///Get the clicked tab id
        if(e.target.nodeName === "A"){
            var tabId = e.target.id;
            var splitId = tabId.split("tab");
            var contentId = "content"+splitId[1];
            $(shadowEl.querySelectorAll(".nav > li")).removeClass("active");
            $(e.target).parent("li").addClass("active");

            //Activate content
            $(shadowEl.querySelectorAll(".tab-content  > div")).removeClass("active");
            $(shadowEl.querySelector(".tab-content > div#"+contentId)).addClass("active");
        }
    });


    //Generate UUID to create unique tabs
    shadowEl.generateUUID = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    //Clean all cookies
    shadowEl.cleanCookie = function() {
        var c = document.cookie.split("; ");
        for (var i in c)
            document.cookie =/^[^=]+/.exec(c[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    };

    //Create study cookie
    shadowEl.createCookie = function(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    //Create cornerstone-viewport content inside tab content
    shadowEl.createViewport = function(contentId, study) {
        if(document.cookie)
            shadowEl.cleanCookie();

        shadowEl.createCookie('study',JSON.stringify(study), '1');
        //Set tab content
        var viewportContent = '<iframe src="custom_components/study-list/studyListIndex.html" width="100%" height="100%" ></iframe>';
        shadowEl.querySelector("#"+contentId).innerHTML = viewportContent;

    };

    //Search Panel events

    //Filter
    shadowEl.getFilter = function(filter){
        if(filter && filter.length && filter.substr(filter.length - 1) !== '*') {
            filter += '*';
        }
        return filter;
    };


    //Convert string to date
    shadowEl.convertStringToDate =function (dateStr) {
        var y = dateStr.substring(0,4);
        var m = dateStr.substring(4,6);
        var d = dateStr.substring(6,8);
        var newDateStr = y+"/"+m+"/"+d;
        var date_ = new Date(newDateStr);
        return date_;
    };

    //Saarch value
    shadowEl.isIndexOf = function(mainVal, searchVal) {
        if(mainVal === undefined || mainVal === '' || mainVal.indexOf(searchVal) > -1){
            return true;
        }

        return false;
    };

    //Search
    $(shadowEl.querySelector("#btnSearch")).click(function(e){

        //Get study date & study to
        var checkFrom = shadowEl.querySelector("#checkFrom").checked;
        var checkTo = shadowEl.querySelector("#checkTo").checked;
        //get checkFrom
        var studyDateFrom = shadowEl.querySelector("#studyDateFrom").value;
        var studyDateTo = shadowEl.querySelector("#studyDateTo").value;

        if(studyDateFrom === "dd/mm/yyyy" && checkFrom) {
            studyDateFrom = new Date();
        }

        if(studyDateTo === "dd/mm/yyyy" && checkTo) {
            studyDateTo = new Date();
        }

        var modality = shadowEl.querySelector("#modality").value;

        var filter = {
            patientName: shadowEl.getFilter($(shadowEl.querySelector("#patientName")).val()),
            patientId: shadowEl.getFilter($(shadowEl.querySelector("#patientId")).val()),
            accessionNumber: shadowEl.getFilter($(shadowEl.querySelector("#patientAccessionNumber")).val())
        };

        Studies.remove({});
        studyList = [];

        Meteor.call('WorklistSearch', filter, function(error, studies) {
            if (studies != undefined && studies.length) {
                studies.forEach(function(study) {
                    //Filter according to modality and date from and to
                    (function(){

                        if(shadowEl.isIndexOf(study.modalities.toLowerCase(), modality.toLowerCase()) &&
                            (new Date(studyDateFrom).setHours(0,0,0,0) <= shadowEl.convertStringToDate(study.studyDate) || !checkFrom) &&
                            (shadowEl.convertStringToDate(study.studyDate) <= new Date(studyDateTo).setHours(0,0,0,0) || !checkTo)){
                            Studies.insert(study);
                        }

                    })();

                });
            }

        });

    });


    //Check undefined data
    shadowEl.checkUndefinedData = function(data) {
      if(data === undefined || data === "undefined"){
          return "";
      }else{
          return data;
      }
    };

    //Today
    $(shadowEl.querySelector("#btnToday")).click(function(e){
        var today = new Date().setHours(0,0,0,0);

        var modality = shadowEl.querySelector("#modality").value;

        var filter = {
            patientName: shadowEl.getFilter($(shadowEl.querySelector("#patientName")).val()),
            patientId: shadowEl.getFilter($(shadowEl.querySelector("#patientId")).val()),
            accessionNumber: shadowEl.getFilter($(shadowEl.querySelector("#patientAccessionNumber")).val())
        };

        Studies.remove({});
        studyList = [];

        Meteor.call('WorklistSearch', filter, function(error, studies) {
            if (studies != undefined && studies.length) {
                studies.forEach(function(study) {
                    //Filter according to modality and date from and to
                    (function(){


                        if(shadowEl.isIndexOf(study.modality, modality) &&
                            (shadowEl.convertStringToDate(study.studyDate) == new Date(today).setHours(0,0,0,0))){
                            Studies.insert(study);
                        }

                    })();

                });
            }

        });


    });

    //Clear
    $(shadowEl.querySelector("#btnClear")).click(function(e){
        shadowEl.querySelector("#patientId").value = "";
        shadowEl.querySelector("#patientName").value = "";
        shadowEl.querySelector("#patientAccessionNumber").value = "";
        shadowEl.querySelector("#studyDescription").value = "";
        shadowEl.querySelector("#referringPhysician").value = "";
        shadowEl.querySelector("#studyDateFrom").value = "";
        shadowEl.querySelector("#studyDateTo").value = "";
        shadowEl.querySelector("#modality").value = "";
        shadowEl.querySelector("#checkFrom").checked = false;
        shadowEl.querySelector("#checkTo").checked = false;

    });

    //Last 7 Days
    $(shadowEl.querySelector("#btnLastSevenDays")).click(function(e){
        var today = new Date();
        var sevenDay =  new Date();
        sevenDay.setDate(sevenDay.getDate()-7);

        var modality = shadowEl.querySelector("#modality").value;

        var filter = {
            patientName: shadowEl.getFilter($(shadowEl.querySelector("#patientName")).val()),
            patientId: shadowEl.getFilter($(shadowEl.querySelector("#patientId")).val()),
            accessionNumber: shadowEl.getFilter($(shadowEl.querySelector("#patientAccessionNumber")).val())
        };

        Studies.remove({});
        studyList = [];

        Meteor.call('WorklistSearch', filter, function(error, studies) {
            if (studies != undefined && studies.length) {
                studies.forEach(function(study) {
                    //Filter according to modality and date from and to
                    (function(){
                        if(isIndexOf.isIndexOf(study.modality, modality) &&
                            (sevenDay.setHours(0,0,0,0) <= shadowEl.convertStringToDate(study.studyDate)) &&
                            (shadowEl.convertStringToDate(study.studyDate) <= new Date(today).setHours(0,0,0,0))){
                            Studies.insert(study);
                        }

                    })();

                });
            }

        });

    });

    //Datepickers


};
//createdCallback ends


var NewStudy =NewStudyDoc.registerElement('study-list',{
    prototype:NewStudyProto
});
