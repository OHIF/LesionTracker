//Params of dragged images
var draggedSrc = "";
var draggedSeriesNumber = "";
var draggedTitle = "";
var draggedId = null;
var draggedShadow = null;
var draggedObjToLeft = {shadowObj:null,thumbnailId:"",imgTitle:""}; //Holds dragged thumbnail to left viewer
var draggedObjToRight = {shadowObj:null,thumbnailId:"",imgTitle:""}; //Holds dragged thumbnail to right viewer

//Params of dropped module
var droppedEl = null;
var droppedElShadow = null;

var clickedCornerstoneEl = null;

//Toolbar Parameters
var btnWWWCActive = false;
var btnInvertActive = false;
var btnZoomActive = false;
var btnPanActive = false;
var btnStackScrollActive = false;
var btnLengthMeasurement = false;
var btnPixelProbeActive = false;
var btnElliROIActive = false;
var btnRectROIActive = false;
var btnPlayClipActive = false;
var btnStopClipActive = false;
var btnLesion = false;

//Resize cornerstone elements
var cornerstoneEls = null;

//Lesions in table
var lesionArr = [];

//All lesions stored in lesion-table element, this variable is necessary to load previous lesions to lesion-table after drag&drop
var lesionTableLesions= [];

//Drag&Drop Functions
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    draggedShadow = ev.target.childNodes[1].shadowRoot;
    draggedId = ev.target.childNodes[1].getAttribute('id');
    draggedTitle = ev.target.childNodes[1].getAttribute('imgTitle');
    draggedSrc = ev.target.childNodes[1].getAttribute('imgSrc');
    draggedSeriesNumber = ev.target.childNodes[1].getAttribute('sNumber');
    ev.dataTransfer.setData("text", ev.target.id);

}

function drop(ev) {
    droppedEl = ev.target;
    var _id = ev.target.getAttribute('id');

    //Push lesions of dropped lesion-table
    var lesionTableId = _id.toLowerCase();
    var lesionTableShadow = document.querySelector("table#"+lesionTableId).shadowRoot;
    // lesionTableShadow.fillLesionArray(lesionTableLesions);

    //Refresh lesion-table rows according to thumbnailId
    lesionTableShadow.refreshTableAfterDragDrop(draggedId,draggedTitle);

    //Draw thumbnail borders
    if(_id === "Left"){

        if(draggedObjToLeft.shadowObj!== null){
            //Remove previous active thumbnail border
            draggedObjToLeft.shadowObj.removeBorder();
        }
        //Draw border to new one
        draggedObjToLeft.shadowObj = draggedShadow;
        draggedObjToLeft.thumbnailId = draggedId;
        draggedObjToLeft.imgTitle = draggedTitle;
        draggedObjToLeft.shadowObj.drawBorder();
        //If left and right is same thumbnail
        if(draggedObjToRight.shadowObj!==null){
            draggedObjToRight.shadowObj.drawBorder();
        }

    }else if(_id === "Right"){

        if(draggedObjToRight.shadowObj!==null){
            //Remove previous active thumbnail border
            draggedObjToRight.shadowObj.removeBorder();
        }
        //Draw border to new one
        draggedObjToRight.shadowObj = draggedShadow;
        draggedObjToRight.thumbnailId = draggedId;
        draggedObjToRight.imgTitle = draggedTitle;
        draggedObjToRight.shadowObj.drawBorder();
        //If left and right is same thumbnail
        if(draggedObjToLeft.shadowObj!==null){
            draggedObjToLeft.shadowObj.drawBorder();
        }
    }

    droppedElShadow = droppedEl.shadowRoot;
    droppedElShadow.setThumbnailId(draggedId);
    droppedElShadow.loadDraggedStudy(draggedSrc,draggedSeriesNumber);
}

//Drag&Drop events end

//Link lesionLocationSelected event, update lesionTableLesions array
$(document).on("lesionLocationSelected",function(event,viewPortId,data ){
    lesionTableLesions.push(data);
});

//Link lesionTextChanged event, update lesionTableLesions array
$(document).on("lesionTextChanged",function(event,measurementData){

    //Find lesion obj which is changed
    for(var i= 0; i< lesionTableLesions.length; i++) {
        var obj = lesionTableLesions[i];
        if(obj.lineIndex == parseInt(measurementData.index)){
            obj.lesions = measurementData.measurementText;
        }
    }
});

//Link lesionDeleted event, update lesionTableLesions array
$(document).on("lesionDeleted",function(event,lesionObj){

    //Find lesion obj which is changed
    for(var i= 0; i< lesionTableLesions.length; i++) {
        var obj = lesionTableLesions[i];
        if(obj.lineIndex === lesionObj.lineIndex){
            lesionTableLesions.splice(i,1);
        }
    }
});

//Window load
$(window).load(function () {


    var leftViewer = document.getElementById("Left").shadowRoot;
    var rightViewer = document.getElementById("Right").shadowRoot;
    var h = parseFloat(leftViewer.querySelector("#containerView").style.height);

    //Set thumbnail ids
    leftViewer.setThumbnailId("thumbnailCurrent");
    rightViewer.setThumbnailId("thumbnailPrior");


    //Load Current to Left
    draggedObjToLeft.shadowObj = document.getElementById("thumbnailCurrent").shadowRoot;
    draggedObjToLeft.thumbnailId = "thumbnailCurrent";
    draggedObjToLeft.imgTitle = document.getElementById("thumbnailCurrent").getAttribute("imgTitle");
    //document.getElementById("captionDivLeft").innerHTML = draggedObjToLeft.imgTitle;
    draggedObjToLeft.shadowObj.drawBorder();

    //Load Prior to Right
    draggedObjToRight.shadowObj = document.getElementById("thumbnailPrior").shadowRoot;
    draggedObjToRight.thumbnailId = "thumbnailPrior";
    draggedObjToRight.imgTitle = document.getElementById("thumbnailPrior").getAttribute("imgTitle");
    //document.getElementById("captionDivRight").innerHTML = draggedObjToRight.imgTitle;
    draggedObjToRight.shadowObj.drawBorder();

    //Set lesion-table height
    setLesionTableHeight();

});

//Catch cornerstone-module mouseover event to handle toolbar functions
$("cornerstone-viewport").mouseover(function(event){
    var _id = event.target.getAttribute('id');
    var _type = event.target.getAttribute('type');
    if(_type == "viewer") {
        clickedCornerstoneEl = document.getElementById(_id).shadowRoot;
        checkActiveTool();
    }
});

//Check active tool button
function checkActiveTool(){
    if(btnWWWCActive){
        clickedCornerstoneEl.setWWWCActive();
    }else if(btnInvertActive){
        clickedCornerstoneEl.setInvertActive();
    }else if(btnZoomActive){
        clickedCornerstoneEl.setZoomActive();
    }else if(btnPanActive){
        clickedCornerstoneEl.setPanActive();
    }else if(btnStackScrollActive){
        clickedCornerstoneEl.setStackScrollActive();
    }else if(btnLengthMeasurement){
        clickedCornerstoneEl.setLengthMeasurementActive();
    }else if(btnPixelProbeActive){
        clickedCornerstoneEl.setPixelProbeActive();
    }else if(btnElliROIActive){
        clickedCornerstoneEl.setElliROIActive();
    }else if(btnRectROIActive){
        clickedCornerstoneEl.setRectROIActive();
    }else if(btnPlayClipActive){
        clickedCornerstoneEl.setPlayClipActive();
    }else if(btnStopClipActive){
        clickedCornerstoneEl.setStopClipActive();
    }else if(btnLesion){
        clickedCornerstoneEl.setLesionActive();
    }
}
$('.btnToolbar').click(function() {
    deactivateAllToolbarButtons();
    $(this).css('border-width','5px');
    $(this).removeClass('btnToolbarHover');
});


//Deactivate AllToolbarButtons
function deactivateAllToolbarButtons(){
    //Toolbar buttons style
    var toolbuttons = document.querySelectorAll(".btnToolbar");
    for(var i=0; i< toolbuttons.length;i++){
        var btn = toolbuttons[i];
        $(btn).css('border-width','1px');
        $(btn).addClass('btnToolbarHover');
    }
    btnWWWCActive = false;
    btnInvertActive = false;
    btnZoomActive = false;
    btnPanActive = false;
    btnStackScrollActive = false;
    btnLengthMeasurement = false;
    btnPixelProbeActive = false;
    btnElliROIActive = false;
    btnRectROIActive = false;
    btnPlayClipActive = false;
    btnStopClipActive = false;
    btnLesion = false;
    deactivateCornerstoneTools();
}

//Click btnWWWC
$("#btnWWWC").click(function(event){
    btnWWWCActive = true;
});
//Click btnInvert
$("#btnInvert").click(function(event){
    btnInvertActive = true;
});
//Click btnZoom
$("#btnZoom").click(function(event){
    btnZoomActive = true;
});
//Click btnPan
$("#btnPan").click(function(event){
    btnPanActive = true;
});

//Click btnStackScroll
$("#btnStackScroll").click(function(event){
    btnStackScrollActive = true;
});
//Click btnLengthMeasurement
$("#btnLengthMeasurement").click(function(event){
    btnLengthMeasurement = true;
});
//Click btnPixelProbe
$("#btnPixelProbe").click(function(event){
    btnPixelProbeActive = true;
});
//Click btnElliROI
$("#btnElliROI").click(function(event){
    btnElliROIActive = true;
});
//Click btnRectROI
$("#btnRectROI").click(function(event){
    btnRectROIActive = true;
});
//Click btnPlayClip
$("#btnPlayClip").click(function(event){
    btnPlayClipActive = true;
});
//Click btnStopClip
$("#btnStopClip").click(function(event){
    btnStopClipActive = true;
});
//Click btnLesion
$("#btnLesion").click(function(event){
    btnLesion = true;
});

//Toolbar events end

//Resizing window and elements

///Set lesion-table height
function setLesionTableHeight () {
    var viewerHeight = $(".viewer-container").height();
    $("table").each(function(){
        if($(this).attr("is") === "lesion-table"){
            var id = $(this).attr("id");
            var el = document.querySelector("#"+id).shadowRoot;
            el.setTableHeight(viewerHeight/2);
        }
    });
}


//Resize viewport elements
resizeCornerstoneEls();


//Detect window resize event
$(window).resize(function() {
    resizeCornerstoneEls();
});

function resizeCornerstoneEls(){
    cornerstoneEls = document.getElementsByTagName('cornerstone-viewport');
    for(var i=0;i<cornerstoneEls.length;i++){
        var _id = cornerstoneEls[i].getAttribute('id');
        var _type = cornerstoneEls[i].getAttribute('type');
        var el = document.getElementById(_id);
        var shadowEl = el.shadowRoot;
        shadowEl.resizeStudyViewer();
        if(_type === "viewer") {
            shadowEl.resizeViewport($("#wrapper").width()/2,$("#wrapper").innerHeight());
        }
    }
    //Set lesion-table height
    setLesionTableHeight();
}

//Deactivate cornerstone-viewport tools
function deactivateCornerstoneTools () {
    cornerstoneEls = document.getElementsByTagName('cornerstone-viewport');
    if(cornerstoneEls.length >0 ) {
        for(var i=0;i<cornerstoneEls.length;i++){
            var _id = cornerstoneEls[i].getAttribute('id');
            var _type = cornerstoneEls[i].getAttribute('type');
            var el = document.getElementById(_id);
            var shadowEl = el.shadowRoot;
            shadowEl.deactivateAllTools();
        }
    }
}


