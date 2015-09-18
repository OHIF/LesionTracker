//Load stack object from json file
function loadStudyFromJSON(jsonFileName,seriesNumber,shadowEl){
    var stack = null;
    $.getJSON(jsonFileName, function(data) {

        stack =  null;
        data.seriesList.forEach(function(series) {
            if(series.seriesNumber == seriesNumber){
                stack = {
                    seriesDescription: series.seriesDescription,
                    stackId : series.seriesNumber,
                    imageIds: [],
                    seriesIndex : 0,
                    currentImageIdIndex: 0,
                    frameRate: series.frameRate
                }

                if(series.numberOfFrames !== undefined) {
                    var numberOfFrames = series.numberOfFrames;
                    for(var i=0; i < numberOfFrames; i++) {
                        var imageId = series.instanceList[0].imageId + "?frame=" + i;
                        if(imageId.substr(0, 4) !== 'http') {
                            imageId = "dicomweb://cornerstonetech.org/images/ClearCanvas/" + imageId;
                        }
                        stack.imageIds.push(imageId);
                    }
                } else {
                    series.instanceList.forEach(function(image) {
                        var imageId = image.imageId;
                        if(image.imageId.substr(0, 4) !== 'http') {
                            imageId = "dicomweb://cornerstonetech.org/images/ClearCanvas/" + image.imageId;
                        }
                        stack.imageIds.push(imageId);
                    });

                }
            }

        });
        //Call cornerstone-module shadow function to set global variable stack
        shadowEl.setStackObject(stack);


    });
}

/*function LoadStudyFromServer(shadowEl){
    var stack = {
        seriesDescription: "Sample Description",
        stackId : "1",
        imageIds: ["dicomweb:http://vna.hackathon.siim.org/dcm4chee-arc/wado/DCM4CHEE?requestType=WADO&studyUID=1.3.6.1.4.1.14519.5.2.1.7777.9002.695251996732711525695705170858&seriesUID=1.3.6.1.4.1.14519.5.2.1.7777.9002.605176515924083114740918850709&objectUID=1.3.6.1.4.1.14519.5.2.1.7777.9002.263022771968489960789052432845&contentType=application%2Fdicom",
            "dicomweb:http://vna.hackathon.siim.org/dcm4chee-arc/wado/DCM4CHEE?requestType=WADO&studyUID=1.3.6.1.4.1.14519.5.2.1.7777.9002.230343245760929624980341715570&seriesUID=1.3.6.1.4.1.14519.5.2.1.7777.9002.270755510288481703289127192748&objectUID=1.3.6.1.4.1.14519.5.2.1.7777.9002.341446584652036747700707084633&contentType=application%2Fdicom"],
        seriesIndex : 0,
        currentImageIdIndex: 0,
        frameRate: "1"
    }
    shadowEl.setStackObject(stack);

}*/

//Disable All Toolbar Buttons
function disableAllTools(element){

    cornerstoneTools.wwwc.disable(element);
    cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
    cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(element, 1);
    cornerstoneTools.length.deactivate(element, 1);
    cornerstoneTools.ellipticalRoi.deactivate(element, 1);
    cornerstoneTools.rectangleRoi.deactivate(element, 1);
    cornerstoneTools.stackScroll.deactivate(element, 1);
    cornerstoneTools.wwwcTouchDrag.deactivate(element);
    cornerstoneTools.zoomTouchDrag.deactivate(element);
    cornerstoneTools.panTouchDrag.deactivate(element);
    cornerstoneTools.stackScrollTouchDrag.deactivate(element);
    cornerstoneTools.lesion.deactivate(element, 1);
}
