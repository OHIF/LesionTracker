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
