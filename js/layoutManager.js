/**
 * Created by ayselafsar on 24/06/15.
 */

$(document).ready(function(){

    //Set elements size when dom is ready
    setElementsSize();

    //Resize viewport
    resizeCornerstoneEls();
});

var wrapperPercentageRight;
var topContainerHeightPercentage;
var rightPanelIsOpen = true;

function setElementsSize(){

    var hidingPanels = document.getElementsByTagName('hiding-panel');
    for(var i=0;i<hidingPanels.length;i++){
        var _type = hidingPanels[i].getAttribute('type');
        var _resizing = hidingPanels[i].getAttribute('resizing');
        var _height = hidingPanels[i].getAttribute('h');
        var _width = hidingPanels[i].getAttribute('w');

        if(_type === "bottom") {

            //Check height includes %
            var n = _height.search("%");
            if(n > 0){
                var splitHeight = _height.split("%");
                var h = splitHeight[0];

                if(_resizing === "true") {

                    var topContainerH = 100 - parseInt(h);
                    topContainerHeightPercentage = topContainerH+"%";
                    $("#topContainer").css("height", topContainerH+"%");

                }else{

                    $("#topContainer").css("height", "100%");

                }

            }else{

                var topContainerH = $(window).height() - _height;
                $("#topContainer").css("height", topContainerH+"px");
            }

        }else if(_type === "right") {

            var topContainerWidth = $("#topContainer").width();
            if(_resizing === "true"){

                var wrapperWidth =  topContainerWidth - _width;
                var wrapperPercentage = (wrapperWidth / topContainerWidth) * 100;
                wrapperPercentageRight = wrapperPercentage;
                $("#wrapper").css("width", Math.floor(wrapperPercentage)+"%");
                $("#wrapper").css("margin-right", Math.floor(100 - wrapperPercentage)+"%");

            }else{

                $("#wrapper").css("width", "100%");
                $("#wrapper").css("margin-right", "0px");
            }
        }
    }
}

//Listens collapse event of <hiding-panel>
$(document).on("HidingPanelCollapseEvent",function(e,data){

    var w; //Holds viewport width: responsive viewport elements while hiding-panel is shown/hide
    var h; //Holds viewport height

    //data.type indicates hiding-panel alignment direction: bottom,right,left
    if(data.type === "bottom"){

        //Bottom hiding-panel and responsive with other window elements: if resizing = "true" for bottom hiding panel
        if(data.resizing){

            //Resize other elements
            if(!data.collapse){

                $("#topContainer").css("height","100%");
                h = $(window).height();
            }else{

                var topContainerHeight = $(window).height() - data.height;
                $("#topContainer").css("height",topContainerHeightPercentage+"%");
                h = topContainerHeight;
            }

            w = $("#wrapper").width()/2;
        }

    }else if(data.type === "right"){

        //Right hiding-panel and responsive with other window elements: if resizing = "true" for right hiding panel

        if(data.resizing){

            var topContainerWidth = $("#topContainer").width();
            h = $("#wrapper").innerHeight();

            rightPanelIsOpen = !data.collapse;

            if(data.collapse){
                var wrapperWidth =  topContainerWidth;
                w = wrapperWidth / 2;
                $("#wrapper").css("margin-right","0%");
                $("#wrapper").css("width", "100%");

            }else{
                var wrapperWidth =  topContainerWidth - data.width;
                var wrapperPercentage = Math.floor(wrapperWidth / topContainerWidth * 100);

                w = wrapperWidth / 2;
                $("#wrapper").css("margin-right",Math.floor(100 - wrapperPercentage)+"%");
                $("#wrapper").css("width", Math.ceil(wrapperPercentage)+"%");

            }
        }

    }else if(data.type === "left"){

        //Left hiding-panel and responsive with other window elements: if resizing = "true" for left hiding panel
        if(data.resizing){
            var topContainerWidth = $("#topContainer").width();
            h = $("#wrapper").innerHeight();

            if(data.collapse){
                var wrapperWidth =  topContainerWidth;
                var wrapperPercentage = wrapperWidth / topContainerWidth * 100;

                $("#wrapper").css("margin-left","0%");
                $("#wrapper").css("width", wrapperPercentage+"%");
                w = $("#wrapper").width() / 2;

            }else{
                var wrapperWidth =  topContainerWidth - data.width;
                var wrapperPercentage = wrapperWidth / topContainerWidth * 100;
                $("#wrapper").css("margin-left",(100 - wrapperPercentage)+"%");
                $("#wrapper").css("width", wrapperPercentage+"%");
                w = $("#wrapper").width() / 2;
            }
        }
    }


    //Resize viewport elements if their size are changed
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