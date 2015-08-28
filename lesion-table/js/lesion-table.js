var lesionDoc = document.currentScript.ownerDocument;
LesionTableProto = Object.create(HTMLTableElement.prototype);

LesionTableProto.createdCallback = function () {
    //Create shadow dom
    var templateLesionTable = lesionDoc.querySelector('#lesion-table-template');
    var cloneLesionTable = templateLesionTable.content.cloneNode(true);

    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(cloneLesionTable);
    var shadowEl = this.shadow;

    //Variables
    var lesionArray = [];
    var viewportID ="";
    var tblLesionBody = shadowEl.querySelector("#tblLesion tbody");

    //Get attributes
    var captionAttr ="";
    var idAttr = "";
    var attributes = this.attributes;
    var heightAttr  = "250px"; //Default height

    for(var i = 0; i< attributes.length;i++){
        var att = attributes[i];
        if(att.nodeName === 'caption'){
            //Get caption attribute & set tableCaption
            captionAttr = att.nodeValue;
            shadowEl.querySelector("#tableCaption").innerHTML = captionAttr;
        }else if(att.nodeName === 'id') {
            //Get id attribute of lesion-table
            idAttr = att.nodeValue;
        }else if(att.nodeName === 'height') {
            //Get height attribute of lesion-table
            heightAttr = att.nodeValue+"px";
            //Set table height
            $(shadowEl.querySelector(".table-container")).css("height",heightAttr);
            $(shadowEl.querySelector(".table-container")).css("max-height",heightAttr);
        }
    }

    //Link lesionLocationSelected event
    $(document).on("lesionLocationSelected",function(event,viewPortId,data ){
        viewportID = viewPortId;
        //Find which table is added
        if(viewPortId.toLowerCase() === idAttr) {

            shadowEl.addLesionLocationRow(data);
        }
    });

    //Link lesionTextChanged event
    $(document).on("lesionTextChanged",function(event,measurementData){

        //Find lesion obj which is changed
        for(var i= 0; i< lesionArray.length; i++) {
            var obj = lesionArray[i];
            if(obj.lineIndex == parseInt(measurementData.index)){
                obj.lesions = measurementData.measurementText;
                shadowEl.refreshRowContent(obj);
            }
        }
    });


    //Add lesionData Row to table
    shadowEl.addLesionLocationRow = function (lesionData){
        //Set lesionIndex of lesionData
        lesionData.lesionIndex = $(tblLesionBody).children().length + 1;

        //Create tblStr
        var tblStr = shadowEl.returnTblStr(lesionData);
        $(tblLesionBody).append(tblStr);
        //Reset style of rows
        shadowEl.resetRowsBg();
        //Change last added row bg color
        $($(tblLesionBody)[0].lastElementChild).addClass("rowSelected");
        lesionArray.push(lesionData);
    };

    //Refresh row content when lesion measurement is changed
    shadowEl.refreshRowContent = function (lesionObj) {

        if(lesionObj){
            //Find cell which is changed
            var row = $(tblLesionBody).find("tr#"+lesionObj.lineIndex);
            var cell = $(row).find('td').eq(2);
            $(cell).text(lesionObj.lesions);
        }
    };

    //Select table row
    $(tblLesionBody).on("click","tr",function(e){

        var className = $(e.target).attr("class");
        //rowId  equals to lesion object's lineIndex
        var rowId = $(this).attr("id");
        var rowIndex = $(this).index();

        //If className contains "btnRemove", remove row
        if(className.search("btnRemove") > -1) {
            shadowEl.removeRow(rowId);
            shadowEl.deleteLesion(rowId);
        }

        //Reset style of rows
        shadowEl.resetRowsBg();

        //Activate same indexed row in lesion-table
        shadowEl.getTables(rowIndex);

        var lineIndex = $(this).attr('id');
        var lesionObj = shadowEl.getLesionObj(lineIndex);

        var shadowId= idAttr.charAt(0).toUpperCase() + idAttr.slice(1);
        var viewportObj = document.querySelector("#"+shadowId).shadowRoot;
        viewportObj.lesionModify(lesionObj,"active");

        //Change bg color of selected row
        shadowEl.changeSelectedRowBg($(this));


    });

    //Return selected lesion object
    shadowEl.getLesionObj = function (lineIndex) {
        for (var i = 0; i< lesionArray.length; i++) {
            var obj = lesionArray[i];
            if(obj.lineIndex === parseInt(lineIndex)){
                return obj;
            }
        }

        return "";
    };

    //Reset background colors of table rows
    shadowEl.resetRowsBg = function (index) {

        $(tblLesionBody).find("tr").each(function() {
            var rowIndex = $(this).index();
            if(rowIndex === index) {
                $(this).addClass("rowSelected");
            }else{
                $(this).removeClass("rowSelected");
            }

        });
    };

    //Change bg color of selected row
    shadowEl.changeSelectedRowBg = function(row){
        row.addClass( "rowSelected" );
    };

    //Remove row from table
    shadowEl.removeRow = function(lineIndex){
        $($(tblLesionBody).find("tr#"+lineIndex)).remove();
    };

    //Delete lesion from lesionArray
    shadowEl.deleteLesion = function (lineIndex) {

        for(var i = 0; i < lesionArray.length; i++){
            var obj = lesionArray[i];
            if(obj.lineIndex == parseInt(lineIndex)) {

                //Find viewport object
                var shadowId= idAttr.charAt(0).toUpperCase() + idAttr.slice(1);
                var viewportObj = document.querySelector("#"+shadowId).shadowRoot;
                viewportObj.lesionModify(obj,"delete");
                lesionArray.splice(i,1);
                shadowEl.refreshTable();
                //Link lesionDeleted event
                $(document).trigger("lesionDeleted",obj);
                break;
            }

        }
    };

    //Refresh Table #s
    shadowEl.refreshTable = function(){

        var i = 0;
        $(tblLesionBody).find("tr").each(function() {
            i++;
            var cell = $(this).find('td').eq(0);
            $(cell).text(i);
        });
    }

    //Activate all lesion-table rows which has same index
    shadowEl.getTables =  function (index) {
        $(document).find("table").each(function() {
            if($(this).attr("is") === "lesion-table") {
                //Get lesion-table ids in index.html
                var tblId = $(this).attr("id");
                shadowEl.activateLinkedLesion(tblId,index);
            }
        });
    };

    //Activate linked lesion which has same index with selected lesion
    shadowEl.activateLinkedLesion = function (tblId,index) {

        //Check other lesion-table elements to activate the same indexed rows when a row is selected
        if(tblId !== idAttr){
            var tblShadow = document.querySelector("#"+tblId).shadowRoot;

            //Get cornerstone-viewport object to activate lesion
            var shadowId= tblId.charAt(0).toUpperCase() + tblId.slice(1);
            var viewportObj = document.querySelector("#"+shadowId).shadowRoot;

            $(tblShadow).find("tr").each(function() {
                var rowIndex = $(this).index();
                if(rowIndex === index) {
                    //Activate selected row
                    tblShadow.resetRowsBg(index);

                    var lIndex = $(this).attr("id");
                    var lObj = tblShadow.getLesionObj(lIndex);
                    viewportObj.lesionModify(lObj,"active");
                }
            });
        }
    };

    //Return lesionArray to use in index.html after drag&drop
    shadowEl.getLesionArray = function () {
        return lesionArray;
    };

    //Fill lesionArray while drag&drop event
    shadowEl.fillLesionArray = function (allLesionsArr) {
        lesionArray = allLesionsArr;
    };

    //Refresh lesion-table according to thumbnailId, this function is used for drag&drop event and to load lesions of the thumbnail viewport
    shadowEl.refreshTableAfterDragDrop = function (thumbnailId,captionTxt) {

        //Change table caption
        shadowEl.querySelector("#tableCaption").innerHTML = captionTxt;

        var tblStr = "";
        var lesionIndex = 1;

        for(var i=0;i<lesionArray.length;i++) {
            var obj = lesionArray[i];
            if(obj.thumbnailId == thumbnailId){
                if(obj.lesionLocationObj !== undefined && obj.lesionLocationObj.location !== undefined) {
                    obj.lesionIndex = lesionIndex;
                    tblStr += shadowEl.returnTblStr(obj);
                    lesionIndex++;
                }
            }
        }
        $(tblLesionBody).html("");
        $(tblLesionBody).append(tblStr);

    };

    //Return tblStr
    shadowEl.returnTblStr = function (obj) {
        return '<tr id="' + obj.lineIndex + '" toolType="' + obj.toolType + '"><td class="tblRow">' + obj.lesionIndex + '</td><td class="tblRow">' + obj.lesionLocationObj.location + '</td><td class="tblRow">' + obj.lesions + '</td><td id="' + obj.lineIndex + '" toolType="' + obj.toolType + '"><button  type="button" class="btnRemove fa fa-times fa-lg" title="Remove"></button></td></tr>';
    };

    //Set lesion-table height
    shadowEl.setTableHeight = function (height){
        shadowEl.querySelector("#tblLesion").style.height = height+"px";
    };


};
//createdCallback ends


var LesionTable =lesionDoc.registerElement('lesion-table',{
    prototype:LesionTableProto,
    extends: 'table'
});