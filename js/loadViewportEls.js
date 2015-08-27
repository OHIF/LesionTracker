/**
 * Created by ayselafsar on 06/08/15.
 */
//Load viewport elements
var data = document.cookie;
var jsonData = JSON.parse(data);
for(var i=0; i< jsonData.seriesList.length; i++) {
    if(i=== 0) {
        //Add Left viewport
        var content = '<cornerstone-viewport id="Left" imgSrc="data/studies/'+jsonData.studyData+'" sNumber = "'+jsonData.seriesList[0].seriesNumber+'" w="512" h="512" type="viewer" patientName="'+jsonData.patientName+'" patientId="'+jsonData.patientID+'" studyDesc="'+jsonData.studyDescription+'" studyDate="'+jsonData.studyDate+'"></cornerstone-viewport>';
        $("#leftContainer").append(content);

        //Add thumbnail of viewport
        var thumbnailStr = '<div class="thumbnail" draggable="true" ondragstart="drag(event)"><cornerstone-viewport id="thumbnail'+i+'" imgTitle="'+jsonData.seriesList[0].seriesDescription+'"  imgSrc="data/studies/'+jsonData.studyData+'" sNumber = "'+jsonData.seriesList[0].seriesNumber+'" type="thumbnail"></cornerstone-viewport></div>';
        $("#bottomContainer").append(thumbnailStr);

        //Update left table title
        var lesionTableShadow = document.querySelector("table#left").shadowRoot;
        lesionTableShadow.refreshTableAfterDragDrop("thumbnail0",jsonData.seriesList[0].seriesDescription);

    } else if(i === 1) {
        //Add Right viewport
        var content2 ='<cornerstone-viewport id="Right"  imgSrc="data/studies/'+jsonData.studyData+'" sNumber = "'+jsonData.seriesList[1].seriesNumber+'"  w="512" h="512" type="viewer"  patientName="'+jsonData.patientName+'" patientId="'+jsonData.patientID+'" studyDesc="'+jsonData.studyDescription+'" studyDate="'+jsonData.studyDate+'"></cornerstone-viewport>';
        $("#rightContainer").append(content2);

        //Add thumbnail of viewport
        var thumbnailStr = '<div class="thumbnail" draggable="true" ondragstart="drag(event)"><cornerstone-viewport id="thumbnail'+i+'" imgTitle="'+jsonData.seriesList[1].seriesDescription+'"  imgSrc="data/studies/'+jsonData.studyData+'" sNumber = "'+jsonData.seriesList[1].seriesNumber+'" type="thumbnail"></cornerstone-viewport></div>';
        $("#bottomContainer").append(thumbnailStr);

        //Update right table title
        var lesionTableShadow = document.querySelector("table#right").shadowRoot;
        lesionTableShadow.refreshTableAfterDragDrop("thumbnail1",jsonData.seriesList[1].seriesDescription);

    } else{
        //Add thumbnails
        var thumbnailStr = '<div class="thumbnail" draggable="true" ondragstart="drag(event)"><cornerstone-viewport id="thumbnail'+i+'" imgTitle="'+jsonData.seriesList[i].seriesDescription+'"  imgSrc="data/studies/'+jsonData.studyData+'" sNumber = "'+jsonData.seriesList[i].seriesNumber+'" type="thumbnail"></cornerstone-viewport></div>';
        $("#bottomContainer").append(thumbnailStr);
    }
}
