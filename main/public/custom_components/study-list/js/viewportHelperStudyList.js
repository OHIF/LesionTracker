//Params of dragged images
var draggedSrc = "";
var draggedSeriesNumber = "";
var draggedTitle = "";
var draggedId = null;
var draggedShadow = null;
var draggedObjToLeft = {shadowObj:null,thumbnailId:"",imgTitle:""}; //Holds dragged thumbnail to left viewer
var draggedObjToRight = {shadowObj:null,thumbnailId:"",imgTitle:""}; //Holds dragged thumbnail to right viewer
var stackIndex;

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


//Draw/Remove borders after drag&drop
function drawBorderToThumbnail(cornerstoneElId){

    var parentThumbnail = $("#"+cornerstoneElId).closest(".thumbnail");
    parentThumbnail.css("border","5px solid #009ACD");
}

function removeBorderFromThumbnail (cornerstoneElId){

    var parentThumbnail = $("#"+cornerstoneElId).closest(".thumbnail");
    parentThumbnail.css("border","1px solid gray");
}

function drag(ev) {
    stackIndex = $(ev.target).attr("stackIndex");
    draggedShadow = ev.target.childNodes[0].shadowRoot;
    draggedId = ev.target.childNodes[0].getAttribute('id');
    draggedTitle = ev.target.childNodes[0].getAttribute('imgTitle');
    draggedSrc = ev.target.childNodes[0].getAttribute('imgSrc');
    draggedSeriesNumber = ev.target.childNodes[0].getAttribute('sNumber');
    ev.dataTransfer.setData("text", ev.target.id);

}

function drop(ev) {
    droppedEl = ev.target;
    var _id = ev.target.getAttribute('id');
    //Push lesions of dropped lesion-table
    var lesionTableId = _id.toLowerCase();
    var lesionTableShadow = document.querySelector("table#"+lesionTableId).shadowRoot;

    //Refresh lesion-table rows according to thumbnailId
    lesionTableShadow.refreshTableAfterDragDrop(draggedId,draggedTitle);

    //Draw thumbnail borders
    if(_id === "Left"){
        if(draggedObjToLeft.shadowObj!== null){

            //Remove previous active thumbnail border
            removeBorderFromThumbnail(draggedObjToLeft.thumbnailId);
        }
        //Draw border to new one
        draggedObjToLeft.shadowObj = draggedShadow;
        draggedObjToLeft.thumbnailId = draggedId;
        draggedObjToLeft.imgTitle = draggedTitle;
        //Draw border
        drawBorderToThumbnail(draggedId);
        //If left and right is same thumbnail
        if(draggedObjToRight.shadowObj!==null){
            drawBorderToThumbnail(draggedObjToRight.thumbnailId);
        }

    }else if(_id === "Right"){

        if(draggedObjToRight.shadowObj!==null){

            //Remove previous active thumbnail border
            removeBorderFromThumbnail(draggedObjToRight.thumbnailId);
        }

        var parentRemovedThumbnail_Right = $("#"+draggedObjToRight.thumbnailId).closest(".thumbnail");
        parentRemovedThumbnail_Right.css("border","1px solid gray");

        var parentAddedThumbnail_Right = $("#"+draggedId).closest(".thumbnail");
        parentAddedThumbnail_Right.css("border","solid 5px #009ACD");
        //Draw border to new one
        draggedObjToRight.shadowObj = draggedShadow;
        draggedObjToRight.thumbnailId = draggedId;
        draggedObjToRight.imgTitle = draggedTitle;
        //Draw border
        drawBorderToThumbnail(draggedId);
        //If left and right is same thumbnail
        if(draggedObjToLeft.shadowObj!==null){
            drawBorderToThumbnail(draggedObjToLeft.thumbnailId);
        }
    }

    droppedElShadow = droppedEl.shadowRoot;
    droppedElShadow.setThumbnailId(draggedId);
    droppedElShadow.LoadStudyFromServer(stacks[stackIndex]);
   // droppedElShadow.loadDraggedStudy(draggedSrc,draggedSeriesNumber);
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

//Enable/Disable annotations when user pressed key A
$(window.parent.document).keydown(function (e) {
    if(e.keyCode == 65) {
        cornerstoneEls = document.getElementsByTagName('cornerstone-viewport');
        if(cornerstoneEls.length >0 ) {
            for(var i=0;i<cornerstoneEls.length;i++){
                var _id = cornerstoneEls[i].getAttribute('id');
                var _type = cornerstoneEls[i].getAttribute('type');
                var el = document.getElementById(_id);
                var shadowEl = el.shadowRoot;
                if(_type === "viewer") {
                    shadowEl.setAnnotations ();
                }

            }
        }
    }
});

//Catch cornerstone-module mouseover event to handle toolbar functions
$(document).mouseover(function(event){

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
    activateTool(this.id);
    checkActiveTool();
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

//Which tool is active
function activateTool(btnToolId){
    if(btnToolId === "btnWWWC"){
        btnWWWCActive = true;
    }else if(btnToolId === "btnInvert"){
        btnInvertActive = true;

    }else if(btnToolId === "btnZoom"){
        btnZoomActive = true;

    }else if(btnToolId === "btnPan"){
        btnPanActive = true;

    }else if(btnToolId === "btnStackScroll"){
        btnStackScrollActive = true;

    }else if(btnToolId === "btnLengthMeasurement"){
        btnLengthMeasurement = true;

    }else if(btnToolId === "btnPixelProbe"){
        btnPixelProbeActive = true;

    }else if(btnToolId === "btnElliROI"){
        btnElliROIActive = true;

    }else if(btnToolId === "btnRectROI"){
        btnRectROIActive = true;

    }else if(btnToolId === "btnPlayClip"){
        btnPlayClipActive = true;

    }else if(btnToolId === "btnStopClip"){
        btnStopClipActive = true;

    }else if(btnToolId === "btnLesion"){
        btnLesion = true;

    }
}

//Toolbar events end

//Resizing window and elements

///Set lesion-table height
function setLesionTableHeight () {
    var topContainerHeight = $("#topContainer").height();
    var lesionTablePanelShadow = document.querySelector("#lesionTablePanel").shadowRoot;
    var lesionTablePanelWidth = lesionTablePanelShadow.getPanelWidth();
    $("table").each(function(){
        if($(this).attr("is") === "lesion-table"){
            var id = $(this).attr("id");
            var el = document.querySelector("#"+id).shadowRoot;
            el.setTableHeight(lesionTablePanelWidth-5, topContainerHeight / 2);
        }
    });
}

setLesionTableHeight();
//Detect window resize event
$(window).resize(function() {
    //Set elements size when dom is ready
    resizeCornerstoneEls();
});

//Resizing cornerstone-viewport elements that has viewer attribute
function resizeCornerstoneEls(){

    //Set lesion-table height
    setLesionTableHeight();

    cornerstoneEls = document.getElementsByTagName('cornerstone-viewport');
    for(var i=0;i<cornerstoneEls.length;i++){
        var _id = cornerstoneEls[i].getAttribute('id');
        var _type = cornerstoneEls[i].getAttribute('type');
        var el = document.getElementById(_id);
        var shadowEl = el.shadowRoot;
        shadowEl.resizeStudyViewer();
        if(_type === "viewer") {

            shadowEl.resizeViewport($("#wrapper").width()/2,$("#viewport-container").height());
        }
    }

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

