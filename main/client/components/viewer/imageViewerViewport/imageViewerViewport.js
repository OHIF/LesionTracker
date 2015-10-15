/**
 * This function enables stack prefetching for a specified element (viewport)
 * It first disables any prefetching currently occurring on any other viewports.
 * Prefetching will not be enabled if the series is a clip.
 *
 * @param element
 */

var lesionData = {};
Session.set("lesionLocationSelected", false);

function enablePrefetchOnElement(element) {
    console.log('Enabling prefetch on new element');

    // Loop through all viewports and disable stackPrefetch
    $('.imageViewerViewport').each(function() {
        if (!$(this).find('canvas').length) {
            return;
        }
        cornerstoneTools.stackPrefetch.disable(this);
    });

    // Make sure there is a stack to fetch
    var stack = cornerstoneTools.getToolState(element, 'stack');
    if (stack && stack.data.length && stack.data[0].imageIds.length > 1) {
        cornerstoneTools.stackPrefetch.enable(element);
    }
}

function loadSeriesIntoViewport(data) {
    if (!data.series || !data.viewport) {
        return;
    }

    var study = data.study;
    var series = data.series;
    var element = data.viewport;
    var viewportIndex = $(".imageViewerViewport").index(data.viewport);

    var allEvents = 'CornerstoneToolsMouseDown CornerstoneToolsMouseDownActivate ' +
        'CornerstoneToolsTap CornerstoneToolsTouchPress ' +
        'CornerstoneToolsDragStartActive CornerstoneToolsMultiTouchDragStart';

    var imageIds = [];
    var numImages = series.instances.length;
    series.instances.forEach(function(instance, imageIndex) {
        var imageId = getImageId(instance);
        imageIds.push(imageId);
        var data = {
            instance: instance,
            series: series,
            study: study,
            numImages: numImages,
            imageIndex: imageIndex + 1
        };
        addMetaData(imageId, data);
    });

    var stack = {
        currentImageIdIndex: 0,
        imageIds: imageIds
    };

    var imageId = imageIds[stack.currentImageIdIndex];

    var templateData = Template.currentData();
    templateData.imageId = imageId;

    // NOTE: This uses the experimental WebGL renderer for Cornerstone!
    cornerstone.enable(element, cornerstone.webGL.renderer.render);


    // If you have problems, replace it with this line instead:
    // cornerstone.enable(element);

    cornerstone.loadAndCacheImage(imageId).then(function(image) {
        cornerstone.displayImage(element, image);
        element.classList.remove('empty');
        $(element).siblings('.viewportInstructions').hide();
        $(element).siblings('.imageViewerViewportOverlay').show();
        
        cornerstone.resize(element, true);

        var imagePlane = cornerstoneTools.metaData.get('imagePlane', image.imageId);

        cornerstoneTools.addStackStateManager(element, [ 'stack', 'playClip', 'referenceLines' ]);

        // Enable orientation markers, if applicable
        var viewport = cornerstone.getViewport(element);
        updateOrientationMarkers(element, viewport);

        // Clear any old stack data
        cornerstoneTools.clearToolState(element, 'stack');
        cornerstoneTools.addToolState(element, 'stack', stack);

        // Enable mouse input
        cornerstoneTools.mouseInput.enable(element);
        cornerstoneTools.touchInput.enable(element);
        cornerstoneTools.mouseWheelInput.enable(element);

        var activeTool = toolManager.getActiveTool();
        toolManager.setActiveTool(activeTool);

        cornerstoneTools.magnify.enable(element);

        function onImageRendered(e, eventData) {
            Session.set('CornerstoneImageRendered' + viewportIndex, Random.id());
        }

        $(element).off('CornerstoneImageRendered', onImageRendered);
        $(element).on('CornerstoneImageRendered', onImageRendered);
        Session.set('CornerstoneImageRendered' + viewportIndex, Random.id());

        function onNewImage(e, eventData) {
            // Update the templateData with the new imageId
            // This allows the template helpers to update reactively
            templateData.imageId = eventData.enabledElement.image.imageId;
            Session.set('CornerstoneNewImage' + viewportIndex, Random.id());
        }

        $(element).off('CornerstoneNewImage', onNewImage);
        $(element).on('CornerstoneNewImage', onNewImage);

        function sendActivationTrigger(e, eventData) {
            var activeViewportIndex = Session.get('ActiveViewport');
            var viewportIndex = $(".imageViewerViewport").index(eventData.element);
            if (viewportIndex === activeViewportIndex) {
                return;
            }
            eventData.viewportIndex = viewportIndex;
            var customEvent = jQuery.Event('ActivateViewport', eventData);
            customEvent.type = 'ActivateViewport'; // Need to overwrite the type set in the touch tools
            $(e.target).trigger(customEvent, eventData);
        }

        $(element).off(allEvents, sendActivationTrigger);
        $(element).on(allEvents, sendActivationTrigger);

        Session.set('CornerstoneNewImage' + viewportIndex, Random.id());


        // LesionTool Events

        $(element).on("LesionMeasurementCreated",function(e){
            //Set lesion name after lesion created
            // TODO: Set counter variable in here with rectiveVar
            $(element).trigger("LesionNameSet", "1");
            Session.set("lesionLocationSelected", false);

        });

        $(element).on("LesionTextChanged", function (e, measurementData) {
            lesionData.text = measurementData.measurementText;
            lesionData.index = measurementData.index;

            $(document).trigger("lesionTextChanged", measurementData);
        });



    });
}

Template.imageViewerViewport.onRendered(function() {

    // Get tabData and get imageViewer element for each tab by tabId
    var tabData = Template.instance().data;
    var tabId = tabData.tabId;
    var studies = tabData.studies;

    var viewport = this.find(".imageViewerViewport");
    var tabs = $("#content"+tabId).find(".imageViewerViewport");
    var viewportIndex = $(tabs).index($(viewport));

    this.data.viewportIndex = viewportIndex;

    var data = {
        viewport: viewport
    };

    if (this.data.seriesInstanceUid !== undefined && this.data.studyInstanceUid !== undefined) {
        var studyInstanceUid = this.data.studyInstanceUid;
        var seriesInstanceUid = this.data.seriesInstanceUid;

        studies.every(function(study) {
            if (study.studyInstanceUid === studyInstanceUid) {
                data.study = study;
                study.seriesList.every(function(series) {
                    if (series.seriesInstanceUid === seriesInstanceUid) {
                        data.series = series;
                        return false;
                    }
                    return true;
                });
                return false;
            }
            return true;
        });
    } else {
        var stacks = [];
        studies.forEach(function(study) {
            study.seriesList.forEach(function(series) {
                var stack = {
                    series: series,
                    study: study
                };
                stacks.push(stack);
            });
        });
      
        if (viewportIndex >= stacks.length) {
            viewport.classList.add('empty');
            $(viewport).siblings('.viewportInstructions').show();
            return;
        }
        data.series = stacks[viewportIndex].series;
        data.study = stacks[viewportIndex].study;
    }
    loadSeriesIntoViewport(data);

});

Template.imageViewerViewport.events({
    'ActivateViewport .imageViewerViewport': function(e) {
        Session.set('ActiveViewport', e.viewportIndex);
        enablePrefetchOnElement(e.currentTarget);
    },

    'mouseup .imageViewerViewport': function (e, template) {

        // if tool type is lesion, oepn lesion location dialog
        var activeTool = toolManager.getActiveTool();
        if(activeTool === "lesion") {
            // TODO: Create lesion obj: Get thumbnailId, imageId, toolType, lineIndex, lesions
            var lesionObj = {
                imageId: 0,
                toolType: activeTool,
                lineIndex: lesionData.index,
                lesions: lesionData.text,
                element: e.currentTarget,
                tabId: template.data.tabId
            };

            //Trigger lesionMeasurementCreated event
            $(document).trigger("lesionMeasurementCreated", [e, lesionObj]);
            // TODO: Call lesionMeasurementCreated event to call lesion-location dialog modal view
        }
    }

});

Template.imageViewerViewport.helpers({
    tabData: function () {
        var data = Template.instance().data;
        return data;
    },

    lesionCounter: function () {
        return Template.instance().lesionCounter.get();
    }
});

Template.imageViewerViewport.onCreated(function() {
    this.tabData = new ReactiveVar();
    this.lesionCounter =  new ReactiveVar(0);
});