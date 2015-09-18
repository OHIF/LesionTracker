var doc = document.currentScript.ownerDocument;
CornerstoneProto = Object.create(HTMLElement.prototype);

//It is called when <cornerstone-module></cornerstone-module> is created
CornerstoneProto.createdCallback = function (){

    //Create shadow dom
    var template = doc.querySelector('#cornerstone-viewport-template');
    if(template != null) {

        var clone = template.content.cloneNode(true);

        this.shadow = this.createShadowRoot();
        this.shadow.appendChild(clone);
        var shadowEl = this.shadow;

        //Global variables
        var containerViewElement = this.shadow.querySelector("#containerView");
        var dicomImageElement = null;
        var dicomImageJObj = null; //dicomImage element jquery object,to call Cornerstone callback functions
        var scrollViewElement = this.shadow.querySelector("#scrollView");
        var scrollerElement = this.shadow.querySelector("#scroller");
        var minStackIndex = 0; //Get first element of stack.imageIds Array
        var currentIndex = 0; // The currently visible image index
        var maxStackIndex = 0; //Stack length
        var currentImgNumber = 0;
        var scrollerHeight;
        var imageId;
        var element;
        var canvasElement;
        var thumbnailId = "";
        var annotationEnable = true;

        //Add dicom image to template
        var stack = null;


        //Get attributes of <cornerstone-viewport>

        var attLength = this.attributes.length;

        //    <cornerstone-viewport id="thumbnailCurrent" imgTitle="Current"  imgSrc="data/studies/mrstudy.json" sNumber = "3" type="thumbnail"></cornerstone-viewport>

        var moduleId = "";
        var imgSrc = "";
        var imgWidth = "";
        var imgHeight = "";
        var imgTitle = "";
        var type = "";
        var sNumber = "";
        var patientName = "";
        var patientId = "";
        var studyDesc = "";
        var studyDate = "";


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
        var btnLesionActive = false;
        var isLesionMeaurementCreated = false;


        var toolType = ""; //Holds tool type
        var lesionData = {text: "", index: ""}; //holds measurement value when length is drawn
        var lesionCounter = 1; //holds lesion number on viewport


        //Add Dialog
        dicomImageElement = this.shadow.querySelector("#dicomImage");
        dicomImageJObj = $(dicomImageElement);

        //Get attributes of cornerstone-viewport
        for (var i = 0; i < attLength; i++) {
            var att = this.attributes[i];
            if (att.nodeName === 'imgsrc') {
                //Get imagesrc attribute
                imgSrc = att.nodeValue;
            } else if (att.nodeName === 'w') {
                //Get image width attribute
                imgWidth = att.nodeValue;

            } else if (att.nodeName === 'h') {
                //Get image height attribute
                imgHeight = att.nodeValue;
            } else if (att.nodeName === 'imgtitle') {
                //Get image title attribute
                imgTitle = att.nodeValue;
            } else if (att.nodeName === 'type') {
                //Get image type attribute
                type = att.nodeValue;
            } else if (att.nodeName === 'snumber') {
                //Get snumber attribute
                sNumber = att.nodeValue;
            } else if (att.nodeName === 'id') {
                //Get id attribute
                moduleId = att.nodeValue;
            } else if (att.nodeName === 'patientname') {
                //Get patientName attribute
                patientName = att.nodeValue;
            } else if (att.nodeName === 'patientid') {
                //Get patientID attribute
                patientId = att.nodeValue;
            } else if (att.nodeName === 'studydesc') {
                //Get studyDesc attribute
                studyDesc = att.nodeValue;
            } else if (att.nodeName === 'studydate') {
                //Get studyDate attribute
                studyDate = att.nodeValue;
            }

        }


        //-----VISUAL------
        //Set ContainerView,ScrollView & Img Title width and height properties
        var hVal = imgHeight;
        var wVal = parseInt(imgWidth) - 20;
        scrollViewElement.style.height = hVal + "px";
        scrollViewElement.style.marginTop = "-34px";
        this.shadow.querySelector('#imgTitle').style.width = wVal + "px";

        //Set scroller height&position
        this.shadow.setScrollerHeight = function () {
            if (stack && stack.imageIds.length) {
                maxStackIndex = stack.imageIds.length; //Stack length
                if (maxStackIndex) {
                    //Set scroller size according to image count
                    scrollViewElement.style.height = $(containerViewElement).height() + "px";
                    scrollerHeight = parseInt(scrollViewElement.style.height, 10) / maxStackIndex;
                    scrollerElement.style.height = scrollerHeight + "px";
                    var scrollerPosition = currentImgNumber * scrollerHeight;
                    scrollerElement.style.top = scrollerPosition + "px";
                } else {
                    scrollerElement.style.height = "0px";
                    scrollerElement.style.top = "0px";
                }
            }
        };

        //Set scroller bar position when change image
        this.shadow.setScrollerPosition = function (imgIndex) {
            var scrollerTopPosition = imgIndex * scrollerHeight;
            scrollerElement.style.top = scrollerTopPosition + "px";
            if (type === "viewer") {
                shadowEl.setImgLabelTxt(imgIndex + 1);
            }
        };

        //Draw border to active thumbnail
        this.shadow.drawBorder = function () {
            shadowEl.querySelector("#containerView").style.border = "solid 5px #009ACD";
        };

        //Remove border from thumbnail
        this.shadow.removeBorder = function () {
            shadowEl.querySelector("#containerView").style.border = "solid 1px gray";
        };

        //Set imgLabelText
        this.shadow.setImgLabelTxt = function (imgIndex) {
            shadowEl.querySelector('#imgNumberLabel').textContent = imgIndex + "/" + stack.imageIds.length;
        };

        //Resize Study Viewer, to resize elements when window is resized
        this.shadow.resizeStudyViewer = function () {
            //Set scrollView and scroller height
            shadowEl.setScrollerHeight();
            //Resize dicomImage
            if (element !== undefined) {
                cornerstone.resize(element, true);

            }
        };


        //Settings elements to show images
        this.shadow.setViews = function () {

            minStackIndex = 0; //Get first element of stack.imageIds Array
            currentIndex = 0; // The currently visible image index
            maxStackIndex = stack.imageIds.length; //Stack length

            //Showing imageId
            imageId = stack.imageIds[0];

            //Set width/height of dicomImage div
            element = shadowEl.querySelector('#dicomImage');

            //Enable dicomImage div to show image
            cornerstone.enable(element);

            //Set width/height of canvas element
            canvasElement = shadowEl.querySelector('canvas');

            var containerViewH = $(shadowEl.querySelector("#containerView")).height();
            var containerViewW = $(shadowEl.querySelector("#containerView")).width();

            canvasElement.width = containerViewW;
            canvasElement.height = containerViewH;
            canvasElement.style.width = containerViewW + "px";
            canvasElement.style.height = containerViewH + "px";


            //If it is thumbnail dicom image, set image title and remove scroller& image number text
            if (type == "thumbnail") {
                shadowEl.querySelector('#containerView').style.border = "none";
                shadowEl.querySelector('#imgTitle').textContent = imgTitle;
                var overlayScroller = shadowEl.querySelector("#overlayScroller");
                overlayScroller.parentNode.removeChild(overlayScroller);
                shadowEl.querySelector('#imgNumberLabel').textContent = "";
                shadowEl.querySelector('#containerView').style.pointerEvents = "all";
                shadowEl.querySelector('#dicomImage').style.pointerEvents = "none";
                //Remove patientInfoDiv & studyInfoDiv
                $(shadowEl.querySelector("#patientInfoDiv")).remove();
                $(shadowEl.querySelector("#studyInfoDiv")).remove();

            } else if (type == "viewer") {

                //Set scroller size according to image count
                shadowEl.setScrollerHeight();
                //Set patient info & study info
                if (patientName !== "") {
                    shadowEl.querySelector('#patientName').textContent = patientName;
                }

                if (patientId !== "") {
                    shadowEl.querySelector('#patientId').textContent = patientId;
                }

                if (studyDesc !== "") {
                    shadowEl.querySelector('#studyDesc').textContent = studyDesc;
                }

                if (studyDate !== "") {
                    shadowEl.querySelector('#studyDate').textContent = studyDate;
                }

                shadowEl.setScrollerPosition(stack.currentImageIdIndex);

            }
        };


        //Show study in viewer, it is called when a new study is dragged/dropped
        this.shadow.showStudy = function (stack) {
            //Sets scrollbar position, image number label etc elements' views
            shadowEl.setViews();

            //Cornerstone function to load new stack
            cornerstone.loadAndCacheImage(stack.imageIds[0]).then(function (image) {
                cornerstone.displayImage(element, image);

                cornerstoneTools.mouseInput.enable(element);
                cornerstoneTools.mouseWheelInput.enable(element);
                cornerstoneTools.touchInput.enable(element);

                // Enable all tools we want to use with this element
                cornerstoneTools.wwwc.deactivate(element, 1); // ww/wc is the default tool for left mouse button
                cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
                cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
                cornerstoneTools.probe.enable(element);
                cornerstoneTools.length.enable(element);
                cornerstoneTools.ellipticalRoi.enable(element);


                cornerstoneTools.rectangleRoi.enable(element);
                cornerstoneTools.wwwcTouchDrag.enable(element);
                cornerstoneTools.zoomTouchPinch.enable(element);
                cornerstoneTools.lesion.enable(element);

                // stack tools
                cornerstoneTools.addStackStateManager(element, ['playClip']);
                cornerstoneTools.addToolState(element, 'stack', stack);
                cornerstoneTools.stackScrollWheel.activate(element);
                cornerstoneTools.stackPrefetch.enable(element);

            });

            //Prevent extra canvas after drag&drop
            var allCanvasEls = dicomImageElement.getElementsByTagName("canvas");
            if (allCanvasEls.length > 1) {
                for (var i = 1; i < allCanvasEls.length; i++) {
                    var canvasEl = allCanvasEls[i];
                    canvasEl.parentNode.removeChild(canvasEl);
                }
            }
            canvasElement = shadowEl.querySelector('canvas');
        };

        //-----VISUAL ENDS-----

        //----CornerstoneTools&Toolbar Events
        //It is CornerstoneTools function and called when each new image is loaded

        dicomImageJObj.on("CornerstoneNewImage",  function(e, newImageEventData) {

            console.log("CornerstoneNewImage event handled");
            //Change scroller position
            if(scrollerElement) {
                shadowEl.setScrollerPosition(stack.currentImageIdIndex);

            }
        });

        //Calls this function when length measurement is changed each time, creates lesionData to update existed length measurements and it is added to CornerstoneTools.js file
        dicomImageJObj.on("LesionTextChanged", function (e, measurementData) {
            lesionData.text = measurementData.measurementText;
            lesionData.index = measurementData.index;

            $(document).trigger("lesionTextChanged", measurementData);
        });

        //Calls this function when new measurement is crated
        dicomImageJObj.on("LesionMeasurementCreated", function (e) {
            //Set lesion name after lesion created
            dicomImageJObj.trigger("LesionNameSet", lesionCounter);
            isLesionMeaurementCreated = true;
            lesionCounter++;
        });

        //Returns moduleId, moduleId is id of cornerstone-viewport element, Eg; Left,Right,thumbnailCurrent,thumbnailPrior,thumbnailNadir etc
        this.shadow.getModuleId = function () {
            return moduleId;
        };

        //Set thumbnailId, thumbnailId is set if cornerstone-viewport type is thumbnail and this function is called from index.html
        this.shadow.setThumbnailId = function (txt) {
            thumbnailId = txt;
        };

        //Go to clicked measurement image
        this.shadow.lesionModify = function (data, type) {
            var imgIndex = data.imageId;

            if (imgIndex !== undefined) {
                cornerstone.loadAndCacheImage(stack.imageIds[imgIndex]).then(function (image) {
                    cornerstone.displayImage(element, image);
                    shadowEl.setScrollerPosition(imgIndex);

                    //If type is active, activate the selected lesion line
                    var eventObject = {
                        enabledElement: cornerstone.getEnabledElement(element),
                        lineIndex: data.lineIndex,
                        type: "active"
                    };
                    dicomImageJObj.trigger("LesionToolModified", eventObject);

                    //If type is delete, remove lesion measurement from image
                    if (type === "delete") {
                        var eventObject = {
                            enabledElement: cornerstone.getEnabledElement(element),
                            lineIndex: data.lineIndex,
                            type: "delete"
                        };
                        dicomImageJObj.trigger("LesionToolModified", eventObject);
                        lesionCounter--;
                    }
                });
            }

        };

        //-----TOOLBAR EVENTS-----
        //Disable All Toolbar Buttons
        shadowEl.disableAllTools = function(element){

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
        };

        //BtnWWWC is clicked
        this.shadow.btnWWWCClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.wwwc.activate(element, 1);
            cornerstoneTools.wwwcTouchDrag.activate(element);
        };
        this.shadow.setWWWCActive = function () {
            shadowEl.deactivateAllTools();
            btnWWWCActive = true;
        };

        //btnInvert Tool is clicked
        this.shadow.btnInvertClicked = function () {
            shadowEl.disableAllTools(element);
            var viewport = cornerstone.getViewport(element);
            if (viewport.invert === true) {
                viewport.invert = false;
            }
            else {
                viewport.invert = true;
            }
            cornerstone.setViewport(element, viewport);
        };
        this.shadow.setInvertActive = function () {
            shadowEl.deactivateAllTools();
            btnInvertActive = true;
        };

        //btnZoom Tool is clicked
        this.shadow.btnZoomClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.zoom.activate(element, 5); // 5 is right mouse button and left mouse button
            cornerstoneTools.zoomTouchDrag.activate(element);
        };
        this.shadow.setZoomActive = function () {
            shadowEl.deactivateAllTools();
            btnZoomActive = true;
        };

        //btnPan Tool is clicked
        this.shadow.btnPanClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.pan.activate(element, 3); // 3 is middle mouse button and left mouse button
            cornerstoneTools.panTouchDrag.activate(element);
        };
        this.shadow.setPanActive = function () {
            shadowEl.deactivateAllTools();
            btnPanActive = true;
        };

        //btnStackScroll is clicked
        this.shadow.btnStackScrollClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.stackScroll.activate(element, 1);
            cornerstoneTools.stackScrollTouchDrag.activate(element);
        };
        this.shadow.setStackScrollActive = function () {
            shadowEl.deactivateAllTools();
            btnStackScrollActive = true;
        };

        //btnLengthMeasurement tool is clicked
        this.shadow.btnLengthMeasurementClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.length.activate(element, 1);
        };
        this.shadow.setLengthMeasurementActive = function () {
            shadowEl.deactivateAllTools();
            btnLengthMeasurement = true;
        };

        //btnPixelProbe tool is clicked
        this.shadow.btnPixelProbeClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.probe.activate(element, 1);
        };
        this.shadow.setPixelProbeActive = function () {
            shadowEl.deactivateAllTools();
            btnPixelProbeActive = true;
        };

        //btnElliROI tool is clicked
        this.shadow.btnElliROIClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.ellipticalRoi.activate(element, 1);
        };
        this.shadow.setElliROIActive = function () {
            shadowEl.deactivateAllTools();
            btnElliROIActive = true;
        };

        //btnRectROI tool is clicked
        this.shadow.btnRectROIClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.rectangleRoi.activate(element, 1);
        };
        this.shadow.setRectROIActive = function () {
            shadowEl.deactivateAllTools();
            btnRectROIActive = true;
        };

        //btnPlayClicp tool is clicked
        this.shadow.btnPlayClipClicked = function () {
            shadowEl.disableAllTools(element);
            var frameRate = stack.frameRate;
            if (frameRate === undefined) {
                frameRate = 10;
            }
            cornerstoneTools.playClip(element, 31);
        };
        this.shadow.setPlayClipActive = function () {
            shadowEl.deactivateAllTools();
            btnPlayClipActive = true;
        };

        //btnStopClip tool is clicked
        this.shadow.btnStopClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.stopClip(element);
        };
        this.shadow.setStopClipActive = function () {
            shadowEl.deactivateAllTools();
            btnStopClipActive = true;
        };

        //btnLesion tool is clicked
        this.shadow.btnLesionClicked = function () {
            shadowEl.disableAllTools(element);
            cornerstoneTools.lesion.activate(element, 1);
        };
        this.shadow.setLesionActive = function () {
            shadowEl.deactivateAllTools();
            btnLesionActive = true;
            toolType = "lesion";
        };

        //Set all toolbar parameters to false
        this.shadow.deactivateAllTools = function () {
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
            btnLesionActive = false;
        };

        //If a tool is active, toolbar event is called when mousedown over dicomImage element
        dicomImageElement.addEventListener('mousedown', function () {
            if (btnWWWCActive) {
                shadowEl.btnWWWCClicked();
            } else if (btnInvertActive) {
                shadowEl.btnInvertClicked();
            } else if (btnZoomActive) {
                shadowEl.btnZoomClicked();
            } else if (btnPanActive) {
                shadowEl.btnPanClicked();
            } else if (btnStackScrollActive) {
                shadowEl.btnStackScrollClicked();
            } else if (btnLengthMeasurement) {
                shadowEl.btnLengthMeasurementClicked();
            } else if (btnPixelProbeActive) {
                shadowEl.btnPixelProbeClicked();
            } else if (btnElliROIActive) {
                shadowEl.btnElliROIClicked();
            } else if (btnRectROIActive) {
                shadowEl.btnRectROIClicked();
            } else if (btnPlayClipActive) {
                shadowEl.btnPlayClipClicked();
            } else if (btnStopClipActive) {
                shadowEl.btnStopClicked();
            } else if (btnLesionActive) {
                shadowEl.btnLesionClicked();
            }
        });

        //Keydown event
        window.addEventListener('keydown', function (e) {
            if (e.which == 65) {
                shadowEl.setAnnotations();
            }
        }, false);

        //Enable/Disable annotations
        this.shadow.setAnnotations = function () {
            if (type === "viewer") {
                annotationEnable = !annotationEnable;
                if (annotationEnable) {
                    //Show annotations
                    $(shadowEl.querySelector("#imgNumberDiv")).show();
                    $(shadowEl.querySelector("#patientInfoDiv")).show();
                    $(shadowEl.querySelector("#studyInfoDiv")).show();
                } else {
                    //Hide annotations
                    $(shadowEl.querySelector("#imgNumberDiv")).hide();
                    $(shadowEl.querySelector("#patientInfoDiv")).hide();
                    $(shadowEl.querySelector("#studyInfoDiv")).hide();
                }
            }

        };

        //-----TOOLBAR EVENTS END-----

        //-----SCROLLBAR EVENTS-----
        //Set parameters&functions for scrollbar
        var dragging = false;
        var minOffset = 0;
        var maxOffset = 0;

        //dicomImage mouseWheel event
        dicomImageElement.addEventListener('mousewheel', function (e) {
            //prevent page fom scrolling
            e.preventDefault();
            return false;
        });

        //Change image when click scrollView
        this.shadow.querySelector('#scrollView').addEventListener('click', function (e) {
            if ((e.toElement.id) === "scrollView") {
                //Set scroller position
                var mouseClickedPosY = parseInt(e.offsetY);
                var sectionNum = parseInt(mouseClickedPosY / scrollerHeight);
                var scrollerNewY = parseInt(sectionNum * scrollerHeight);
                //Change Image
                cornerstone.loadAndCacheImage(stack.imageIds[sectionNum]).then(function (image) {
                    cornerstone.displayImage(element, image);
                    shadowEl.querySelector('#scroller').style.top = scrollerNewY + "px";
                    //Change image number text each wheel event
                    shadowEl.setImgLabelTxt(sectionNum + 1);
                    stack.currentImageIdIndex = sectionNum;
                });
            }
        });

        //change image when scrollView mousedown
        this.shadow.querySelector('#scrollView').addEventListener('mousedown', function (e) {
            if ((e.toElement.id) === "scroller" && e.which == 1) {
                //Start to dragging
                dragging = true;
                minOffset = (currentImgNumber - 1) * scrollerHeight;
                maxOffset = minOffset + scrollerHeight;
            }
        });

        //containerView Mouseup
        this.shadow.querySelector('#containerView').addEventListener('mouseup', function (e) {
            dragging = false;
        });

        //containerView Mousemove
        this.shadow.querySelector('#containerView').addEventListener('mousemove', function (e) {
            if (dragging) {
                //Get mouse cursor position in page and get containerView top offset
                var scrollerTop = e.pageY - containerViewElement.offsetTop;
                var maxTopPosition = parseInt(scrollViewElement.style.height, 10) - parseInt(scrollerElement.style.height, 10);


                if (0 <= parseFloat(scrollerTop) && parseFloat(scrollerTop) <= parseFloat(maxTopPosition)) {
                    var sectionNum = Math.round(scrollerTop / parseInt(scrollerElement.style.height, 10));
                    cornerstone.loadAndCacheImage(stack.imageIds[sectionNum]).then(function (image) {

                        cornerstone.displayImage(element, image);

                        //Set scroller position
                        scrollerElement.style.top = scrollerTop + "px";

                        //Change image number text each wheel event
                        shadowEl.setImgLabelTxt(sectionNum + 1);
                        stack.currentImageIdIndex = sectionNum;
                    });
                }
            }
        });

        //Get mouse move event when dragging is true
        document.body.addEventListener('mousemove', function (e) {
            if (dragging) {
                //Get mouse cursor postion in page and get containerView top offset
                var scrollerTop = e.pageY - containerViewElement.offsetTop;

                var maxTopPosition = parseInt(scrollViewElement.style.height, 10) - parseInt(scrollerElement.style.height, 10);

                if (0 <= parseFloat(scrollerTop) && parseFloat(scrollerTop) <= parseFloat(maxTopPosition)) {
                    var sectionNum = Math.round(scrollerTop / parseInt(scrollerElement.style.height, 10));

                    cornerstone.loadAndCacheImage(stack.imageIds[sectionNum]).then(function (image) {

                        cornerstone.displayImage(element, image);

                        //Set scroller position
                        scrollerElement.style.top = scrollerTop + "px";
                        //Change image number text each wheel event
                        shadowEl.setImgLabelTxt(sectionNum + 1);
                        stack.currentImageIdIndex = sectionNum;
                    });
                }
            }
        });

        //Dragging is canceled if mouse is up on document
        document.body.addEventListener('mouseup', function () {
            dragging = false;
        });


        //dicomImage Mouseup
        dicomImageElement.addEventListener('mouseup', function (e) {
            if (toolType === "lesion" && btnLesionActive) {
                if (isLesionMeaurementCreated) {
                    var lesionObj = {
                        moduleId: moduleId,
                        thumbnailId: thumbnailId,
                        imageId: stack.currentImageIdIndex,
                        toolType: toolType,
                        lineIndex: lesionData.index,
                        lesions: lesionData.text
                    };
                    //Trigger lesionMeasurementCreated event
                    $(document).trigger("lesionMeasurementCreated", [e, lesionObj]);
                }
                isLesionMeaurementCreated = false;
            }
        });


        //when window is resize, vieweport width is resize
        shadowEl.resizeViewport = function (w, h) {
            //Cornerstone resizing function is used and keeps aspect ratio
            $(shadowEl.querySelector("#containerView")).css("width", w + "px");
            var bottomMargin = h * 0.1;
            $(shadowEl.querySelector("#containerView")).css("height", h + "px");
            if (element !== undefined) {
                cornerstone.resize(element, true);
                shadowEl.setScrollerHeight();
            }

        };

        //-----SCROLLBAR EVENTS END-----


        //-----LOADING IMAGES FROM JSON-----

        //is called by index.html when new stack is dragged/dropped
        this.shadow.callJson = function (imgSrc, sNumber, shadowEl) {
            loadStudyFromJSON(imgSrc, sNumber, shadowEl);
        };

        //Set global stack variable for first time and is called by cornerstone-viewport-loader.js
        this.shadow.setStackObject = function (data) {
            stack = data;
            shadowEl.showStudy(stack);
            shadowEl.resizeStudyViewer();
            shadowEl.resizeViewport();
        };

        this.shadow.setImageIds = function(data){
            var imageIds = [];
            for(var i=0; i< data.instances.length; i++){
                var instance = "dicomweb:"+data.instances[i].wadouri;
                imageIds.push(instance);
            }
            data.imageIds = imageIds;
            data.currentImageIdIndex = 0;
            data.seriesIndex = 0;
            data.frameRate = "1";

            shadowEl.setStackObject(data);
        };
        //-----LOADING IMAGES FROM JSON ENDS-----


        //-----LOADING-----
        //Load from server
        shadowEl.LoadStudyFromServer = function(serverData){
            shadowEl.setImageIds(serverData);
        };
    }//Template is not null
};
//createdCallback ends


var CornerstoneViewport =doc.registerElement('cornerstone-viewport',{
    prototype:CornerstoneProto
});
