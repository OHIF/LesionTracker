
//Listens collapse event of <hiding-panel>
$(document).on("HidingPanelCollapseEvent",function(e,data){

    if(data.type === "bottom" && data.resizing){
        var topContainer = $("#topContainer");
        if(data.panelIsOpen){
            var dif = 100 - parseFloat(data.height);
            //panel is opened
            topContainer.css("height",dif+"%");

        }else{
            //panel is closed
            topContainer.css("height","100%");

        }

        topContainer.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
            function(event) {
                // Resize images when the transition ends

                var w = $("#wrapper").width()/2;
                var h = $("#topContainer").height();

                for(var i=0;i<cornerstoneEls.length;i++){
                    var _id = cornerstoneEls[i].getAttribute('id');
                    var _type = cornerstoneEls[i].getAttribute('type');
                    var el = document.getElementById(_id);
                    var shadowEl = el.shadowRoot;
                    shadowEl.resizeStudyViewer();
                    if(_type === "viewer") {

                        shadowEl.resizeViewport(w,h);
                    }
                }
            });

    }else if(data.type === "right" && data.resizing){

        var wrapper = $("#wrapper");
        if(data.panelIsOpen){
            var dif = 100 - parseFloat(data.width);

            //panel is opened
            wrapper.css("margin-right",data.width+"%");
            wrapper.css("width", (dif-1)+"%");

        }else{
            //panel is closed
            wrapper.css("margin-right","0%");
            wrapper.css("width", "100%");

        }

        wrapper.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
            function(event) {
                // Resize images when the transition ends

                var w = $("#wrapper").width()/2;
                var h = $("#topContainer").height();

                for(var i=0;i<cornerstoneEls.length;i++){
                    var _id = cornerstoneEls[i].getAttribute('id');
                    var _type = cornerstoneEls[i].getAttribute('type');
                    var el = document.getElementById(_id);
                    var shadowEl = el.shadowRoot;
                    shadowEl.resizeStudyViewer();
                    if(_type === "viewer") {

                        shadowEl.resizeViewport(w,h);
                    }
                }
            });
    }

});

$(document).ready(function(){

    //Set elements size when dom is ready
    setElementsSize();
});

function setElementsSize(){

    var hidingPanels = document.getElementsByTagName('hiding-panel');
    for(var i=0;i<hidingPanels.length;i++){
        var _type = hidingPanels[i].getAttribute('type');
        var _resizing = hidingPanels[i].getAttribute('resizing');
        var _height = hidingPanels[i].getAttribute('height');
        var _width = hidingPanels[i].getAttribute('width');

        if(_type === "bottom") {

            if(_resizing === "true") {

                var topContainerH = 100 - parseFloat(_height);
                $("#topContainer").css("height", topContainerH+"%");
            }else{

                $("#topContainer").css("height", "100%");
            }
        }else if(_type === "right") {

            var topContainerWidth = $("#topContainer").width();
            var wrapper = $("#wrapper");

            if(_resizing === "true"){

                var wrapperWidth =  100 - parseFloat(_width);
                var wrapperMargin =  parseFloat(_width);
                wrapper.css("width", (wrapperWidth-1)+"%"); //-1: space bw wrapper and panel
                wrapper.css("margin-right", wrapperMargin+"%");
            }else{

                wrapper.css("width", "100%");
                wrapper.css("margin-right", "0px");
            }
        }

        resizeCornerstoneEls();

    }
}