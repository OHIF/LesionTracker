/**
 * Created by ayselafsar on 29/05/15.
 */
var lesionLocationDoc = document.currentScript.ownerDocument;
LesionLocationProto = Object.create(HTMLElement.prototype);

LesionLocationProto.createdCallback = function () {
    //Create shadow dom
    var templateLesionLocation = lesionLocationDoc.querySelector('#lesion-location-template');
    var cloneLesionLocation = templateLesionLocation.content.cloneNode(true);

    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(cloneLesionLocation);
    var shadowEl = this.shadow;

    //Variables
    var shadowObj = null;
    var lesionData = null;
    var viewPortId = "";
    var dialog = shadowEl.querySelector("#lesionDialog");
    var dialogWrapper = shadowEl.querySelector("#lesionDialogWrapper");

    //Listen lesionMeaurementCreated Event and when this event is triggered, show lesionLocationDiaog Box
    $(document).on("lesionMeasurementCreated",function(event,eventCaller,data){
        lesionData = data;
        var eventCallerPath = eventCaller.path;
        shadowEl.showLesionLocationDialog(eventCaller);
        viewPortId = shadowEl.returnViewportId(eventCallerPath);
        if(viewPortId !== ""){
            shadowObj = document.querySelector("#"+viewPortId).shadowRoot;
        }
    });

    //Returns id of viewport that mouse is up on it
    shadowEl.returnViewportId = function(pathArray){
        //If web component name is changed, change this  search value
        for (var i=0; i<pathArray.length; i++) {
            if(pathArray[i].tagName !== undefined){
                var el = pathArray[i];
                var elTagName =(el.tagName).toLowerCase();
                if(elTagName === "cornerstone-viewport"){
                    return el.getAttribute("id");
                }
            }
        }

        return "";
    };

    //Show dialog box
    shadowEl.showLesionLocationDialog = function(event){
        dialogWrapper.style.left = event.pageX +"px";
        dialogWrapper.style.top = (event.pageY + 20)+"px";

        shadowEl.fillSelectLesionLocation(shadowEl.querySelector("#selectLesionLocation"));
        dialog.show();
    };

    //Close lesionLocationDialog
    $(shadowEl.querySelector("#btnCloseLesionPopup")).click(function(event){
        //Remove lesion from image
        shadowObj.lesionModify(lesionData,"delete");
        dialog.close();
    });

    //Change event lesionLocation select box
    $(shadowEl.querySelector("#selectLesionLocation")).change(function(event){
        var selectedLocationIndex = $(this).val();
        if(selectedLocationIndex !== "-1"){

            var locationObj = lesionLocationsArray[selectedLocationIndex];
            lesionData.lesionLocationObj = locationObj;

            //Trigger location selected event
            $(document).trigger("lesionLocationSelected",[viewPortId,lesionData]);
            //Set activeModule parameters in index.html
            dialog.close();
        }
    });

    //fill selectLesionLocation element
    var lesionLocationsArray = [
        {location:"Brain Brainstem",hasDescription:false, description:""},
        {location:"Brain Cerebellum Left",hasDescription:false, description:""},
        {location:"Brain Cerebrum Left",hasDescription:false, description:""},
        {location:"Brain Cerebrum Right",hasDescription:false, description:""},
        {location:"Brain Multiple Sites",hasDescription:false, description:""}
    ];

    shadowEl.fillSelectLesionLocation = function(el){
        $(el).find('option:not(:first)').remove();
        $.each(lesionLocationsArray, function(key, value) {
            $(el).append("<option value='" + key+ "'>" + value.location + "</option>");
        });

    }
};

var LesionLocation =lesionLocationDoc.registerElement('lesion-location-dialog',{
    prototype:LesionLocationProto
});
