//Load viewport elements
//Get studies
//Get cookie
//Remove sibling container-hack
function getCookie(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

var cookieStudy = getCookie('study');
var study = JSON.parse(cookieStudy);
var stacks = [];
//Get Study Metadata
Meteor.call('GetStudyMetadata', study.studyInstanceUid, function(error, study) {
    sortStudy(study);
    // TODO: Split by multi-frame, modality, image size, etc
    study.seriesList.forEach(function(series) {
        stacks.push(series);
    });
    //Load viewport elements
    loadViewportElements(stacks);
});

function loadViewportElements(stacks){

    var leftViewer;
    var rightViewer;
    for(var i=0; i< stacks.length; i++) {
        var stack =stacks[i];
        if(i=== 0) {
            //Add Left viewport
            var content = '<cornerstone-viewport id="Left" w="512" h="512" type="viewer" patientName="'+study.patientName+'" patientId="'+study.patientId+'" studyDesc="'+stack.seriesDescription+'" studyDate="'+study.studyDate+'"></cornerstone-viewport>';
            $("#leftContainer").append(content);
            leftViewer = document.getElementById("Left").shadowRoot;
            leftViewer.LoadStudyFromServer(stack);

            //Add thumbnail of viewport
            var thumbnailStr = '<div class="thumbnail" draggable="true" ondragstart="drag(event)" stackIndex="'+i+'" style="background-color:#000; margin-bottom: 5px;"><cornerstone-viewport id="thumbnail'+i+'" imgTitle="'+stack.seriesDescription+'" type="thumbnail"></cornerstone-viewport></div>';
            $("#bottomContainer").append(thumbnailStr);
            document.getElementById("thumbnail0").shadowRoot.LoadStudyFromServer(stack);

            //Update left table title
            var lesionTableShadow = document.querySelector("table#left").shadowRoot;
            lesionTableShadow.refreshTableAfterDragDrop("thumbnail0",stack.seriesDescription);

            //Set thumbnail ids
            leftViewer.setThumbnailId("thumbnail0");

            //Load Current to Left
            draggedObjToLeft.shadowObj = document.getElementById("thumbnail0").shadowRoot;
            draggedObjToLeft.thumbnailId = "thumbnail0";
            draggedObjToLeft.imgTitle = document.getElementById("thumbnail0").getAttribute("imgTitle");
            drawBorderToThumbnail(draggedObjToLeft.thumbnailId);

        } else if(i === 1) {
            //Add Right viewport
            var content2 ='<cornerstone-viewport id="Right" w="512" h="512" type="viewer"  patientName="'+study.patientName+'" patientId="'+study.patientId+'" studyDesc="'+stack.seriesDescription+'" studyDate="'+study.studyDate+'"></cornerstone-viewport>';
            $("#rightContainer").append(content2);

            rightViewer = document.getElementById("Right").shadowRoot;
            rightViewer.LoadStudyFromServer(stack);


            //Add thumbnail of viewport
            var thumbnailStr = '<div class="thumbnail" draggable="true" ondragstart="drag(event)" stackIndex="'+i+'" style="background-color:#000; margin-bottom:5px;"><cornerstone-viewport id="thumbnail'+i+'" imgTitle="'+stack.seriesDescription+'" type="thumbnail"></cornerstone-viewport></div>';
            $("#bottomContainer").append(thumbnailStr);
            document.getElementById("thumbnail1").shadowRoot.LoadStudyFromServer(stack);

            //Update right table title
            var lesionTableShadow = document.querySelector("table#right").shadowRoot;
            lesionTableShadow.refreshTableAfterDragDrop("thumbnail1",stack.seriesDescription);

            //Set thumbnail ids
            rightViewer.setThumbnailId("thumbnail1");

            //Load Prior to Right
            draggedObjToRight.shadowObj = document.getElementById("thumbnail1").shadowRoot;
            draggedObjToRight.thumbnailId = "thumbnail1";
            draggedObjToRight.imgTitle = document.getElementById("thumbnail1").getAttribute("imgTitle");
            drawBorderToThumbnail(draggedObjToRight.thumbnailId);

        } else{
            //Add thumbnails
            var thumbnailStr = '<div class="thumbnail" draggable="true" ondragstart="drag(event)" stackIndex="'+i+'" style="background-color:#000; margin-bottom: 5px;"><cornerstone-viewport id="thumbnail'+i+'" imgTitle="'+stack.seriesDescription+'" type="thumbnail"></cornerstone-viewport></div>';
            $("#bottomContainer").append(thumbnailStr);
            document.getElementById("thumbnail"+i).shadowRoot.LoadStudyFromServer(stack);

        }
    }


    //Set elements size when dom is ready
    setElementsSize();

    //Resize viewport elements
    resizeCornerstoneEls();
}
