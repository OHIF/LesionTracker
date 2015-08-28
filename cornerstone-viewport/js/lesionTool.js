var lineIndex = 0; //This holds drawn line index
var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "lesion";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        var element = mouseEventData.element;
        var lesionCounter = "";

        //setting name of lesion
        $(element).on("LesionNameSet", function(e,counter){
            lesionCounter = counter;
        });

        //Listens LesionToolModified event and calls measurementModified function when lesion measurement is changed or updated.
        $(element).on("LesionToolModified", measurementModified);
        $(element).trigger("LesionMeasurementCreated");

        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            handles : {
                start : {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            },
            index: lineIndex,
            measurementText: "",
            linkedTextCoords: {
                start : {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                },
                init: false
            },
            lesionName: "Target "+lesionCounter,
            isDeleted: false,
            lineNumber:"" //Indicates line number of line on image
        };
        lineIndex++;
        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    function pointNearTool(data, coords)
    {
        var lineSegment = {
            start: data.handles.start,
            end: data.handles.end
        };
        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 25);
    }

    function pointNearToolForText(data,coords) {
        var lineSegment = {
            start: data.linkedTextCoords.start,
            end: data.linkedTextCoords.end
        };
        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 15);
    }

    ///////// BEGIN IMAGE RENDERING ///////
    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
        var color=cornerstoneTools.activeToolcoordinate.getToolColor();
        for(var i=0; i < toolData.data.length; i++) {

            context.save();
            var data = toolData.data[i];
            var colorLinkedLine;
            var isActiveLine = pointNearTool(data,cornerstoneTools.activeToolcoordinate.getCoords());
            var isTextActive =  pointNearToolForText(data,cornerstoneTools.activeToolcoordinate.getCoords());

            //Set coordinates of text
            if(!data.linkedTextCoords.init){

                //Find suitable position for text
                var canvasHeight = eventData.canvasContext.canvas.height;
                if(data.handles.start.x > 0) {
                    data.linkedTextCoords.start.x = data.handles.start.x - 50;
                    if(data.handles.start.y < canvasHeight/3 ){
                        data.linkedTextCoords.start.y = data.handles.start.y + 50;

                    }else if(data.handles.start.y > canvasHeight * 2 /3 ){
                        data.linkedTextCoords.start.y = data.handles.start.y - 50;
                    }else{
                        data.linkedTextCoords.start.y = data.handles.start.y + 50;
                    }
                }else{
                    data.linkedTextCoords.start.x = data.handles.start.x + 50;
                    if(data.handles.start.y < canvasHeight/3 ){
                        data.linkedTextCoords.start.y = data.handles.start.y + 50;

                    }else if(data.handles.start.y > canvasHeight * 2 /3 ){
                        data.linkedTextCoords.start.y = data.handles.start.y - 50;
                    }else{
                        data.linkedTextCoords.start.y = data.handles.start.y - 50;
                    }
                }

                //Set end point of linkedTextCoords
                data.linkedTextCoords.end.x = data.linkedTextCoords.start.x;
                data.linkedTextCoords.end.y = data.linkedTextCoords.start.y + 75;
                //initialized coordinates of text
                data.linkedTextCoords.init = true;
            }

            if (isActiveLine || isTextActive) {
                color=cornerstoneTools.activeToolcoordinate.getActiveColor();
                colorLinkedLine = "yellow";
            } else {
                color=cornerstoneTools.activeToolcoordinate.getToolColor();
                colorLinkedLine = color;
            }

            //When click a row of table measurements, measurement will be active and color will be green
            if(eventData.type === "active" && (data.index === eventData.lineIndex) ){
                color=cornerstoneTools.activeToolcoordinate.getActiveColor();
            }else{
                //This line will make invisible the deleted measurement
                if((data.index === eventData.lineIndex) || !data.visible){
                    data.visible = false;
                    continue;
                }
            }

            // draw the line
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = 1 / eventData.viewport.scale;
            context.moveTo(data.handles.start.x, data.handles.start.y);
            context.lineTo(data.handles.end.x, data.handles.end.y);
            context.stroke();

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, eventData, data.handles,color);
            context.stroke();

            //Draw linked line as dashed
            context.setLineDash([2,3]);
            context.beginPath();
            context.strokeStyle = colorLinkedLine;
            context.lineWidth = 1 / eventData.viewport.scale;
            var dx = (data.handles.start.x - data.handles.end.x) * eventData.image.columnPixelSpacing;
            var dy = (data.handles.start.y - data.handles.end.y) * eventData.image.rowPixelSpacing;
            var length = Math.sqrt(dx * dx + dy * dy);
            context.moveTo((data.handles.start.x + data.handles.end.x)/2, (data.handles.start.y + data.handles.end.y)/2);
            context.lineTo(data.linkedTextCoords.start.x + 10, data.linkedTextCoords.start.y - 5);
            context.stroke();

            // Draw the text
            context.fillStyle = color;
            var text = "" + length.toFixed(1) + " mm ";
            data.measurementText = length.toFixed(1);

            if(isActiveLine){
                $(eventData.enabledElement.element).trigger("LesionTextChanged",data);
            }

            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(eventData.enabledElement, eventData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            //var textX = ((data.handles.start.x + data.handles.end.x) / 2 + length) / fontParameters.fontScale;
            //var textY = (data.handles.start.y + data.handles.end.y) / 2 / fontParameters.fontScale;

            var textX = data.linkedTextCoords.start.x / fontParameters.fontScale;
            var textY = data.linkedTextCoords.start.y / fontParameters.fontScale;

            context.fillText(data.lesionName, textX, textY);
            context.fillText(text, textX, textY + fontParameters.fontSize);

            //Set end points of text according to text width
            var lesionNameWidth = context.measureText(data.lesionName).width  * eventData.image.columnPixelSpacing;
            var measurementTextWidth = context.measureText(text).width  * eventData.image.columnPixelSpacing;
            if(lesionNameWidth > measurementTextWidth) {
                data.linkedTextCoords.end.x = data.linkedTextCoords.end.x + lesionNameWidth;
            }else{
                data.linkedTextCoords.end.x = data.linkedTextCoords.end.x + measurementTextWidth;
            }

            context.restore();
        }

    }
    ///////// END IMAGE RENDERING ///////

    //This function is called from cornerstone-viewport.html and updates lesion measurement and makes the lesion active
    function measurementModified(e, eventObject){
        var start = new Date();

        var enabledElement = eventObject.enabledElement;
        var lineIndex = eventObject.lineIndex;
        var type = eventObject.type;

        enabledElement.image.render(enabledElement, true);

        var context = enabledElement.canvas.getContext('2d');

        var end = new Date();
        var diff = end - start;
        //console.log(diff + ' ms');

        var eventData = {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            canvasContext: context,
            measurementText: "",
            renderTimeInMs : diff,
            lineIndex : lineIndex,
            type : type //Holds image will be deleted or active
        };

        enabledElement.invalid = false;

        onImageRendered(e, eventData);
    }

    // module exports
    cornerstoneTools.lesion = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool : pointNearTool,
        pointNearToolForText: pointNearToolForText,
        toolType : toolType
    });
    cornerstoneTools.lesionTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        pointNearToolForText: pointNearToolForText,
        toolType: toolType
    });
    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));