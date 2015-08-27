/**
 * Created by ayselafsar on 10/06/15.
 */

var hidingPanelDoc = document.currentScript.ownerDocument;
HidingPanelProto = Object.create(HTMLElement.prototype);

HidingPanelProto.createdCallback = function () {
    //Create shadow dom
    var templateHidingPanel = hidingPanelDoc.querySelector('#hiding-panel-template');
    var cloneHidingPanel = templateHidingPanel.content.cloneNode(true);

    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(cloneHidingPanel);

    shadowEl = this.shadow;
    var nav = shadowEl.querySelector('#verticalPanel');
    var wrapper = null;
    var btnCollapse = shadowEl.querySelector('#btnCollapse');

    //TODO: Get wrapper dynamically

    //Get Type
    var typeAttr = "";
    var widthAttr = "";
    var heightAttr = "";
    var resizingAttr;
    var wrapperCollapse = true;

    //hiding-panel attributes: if w or h attribute is not defined, it gets 100% size

    for(var i=0;i< this.attributes.length;i++){
        var att = this.attributes[i];
        if(att.nodeName === 'type'){

            //Get type att: bottom,right,left
            typeAttr = att.nodeValue;


        }else if(att.nodeName === 'w'){

            //Get width attr
            widthAttr = att.nodeValue;

            //Set panel width attribute
            //Set same css style for each attribute because we does not know which attribute is set
            if(typeAttr === "left"){

                $(btnCollapse).css("left","0px");
                $(nav).addClass("verticalPanel");
                $(nav).css("width",widthAttr+"px");
                $(btnCollapse).addClass("btnCollapse");

            }else if(typeAttr === "right"){

                $(btnCollapse).css("right","0px");
                $(nav).addClass("verticalPanelRight");
                $(nav).css("width",widthAttr+"px");
                $(btnCollapse).addClass("btnCollapse");

            }else if(typeAttr === "bottom"){
                $(nav).addClass("verticalPanelBottom");
                $(btnCollapse).addClass("btnCollapseBottom");

            }

        }else if(att.nodeName === 'h'){

            //Get height attribute: percentage or px
            heightAttr = att.nodeValue;

            //Check height attr is percentage or px
            var n = heightAttr.search("%");

            if(n>=0){

                //If height is percentage, set panel height attributes
                //Set same css style for each attribute because we does not know which attribute is set
                if(typeAttr === "left"){

                    $(btnCollapse).css("left","0px");
                    $(nav).addClass("verticalPanel");
                    $(btnCollapse).addClass("btnCollapse");

                }else if(typeAttr === "right"){

                    $(btnCollapse).css("right","0px");
                    $(nav).addClass("verticalPanelRight");
                    $(btnCollapse).addClass("btnCollapse");

                }else if(typeAttr === "bottom"){

                    $(nav).addClass("verticalPanelBottom");
                    $(btnCollapse).addClass("btnCollapseBottom");
                }
                $(nav).css("height",heightAttr);

            }else{

                //If height is px, set panel height attributes
                //Set same css style for each attribute because we does not know which attribute is set

                if(typeAttr === "left"){

                    $(btnCollapse).css("left","0px");
                    $(nav).addClass("verticalPanel");
                    $(btnCollapse).addClass("btnCollapse");

                }else if(typeAttr === "right"){

                    $(btnCollapse).css("right","0px");
                    $(nav).addClass("verticalPanelRight");
                    $(btnCollapse).addClass("btnCollapse");

                }else if(typeAttr === "bottom"){

                    $(nav).addClass("verticalPanelBottom");
                    $(btnCollapse).addClass("btnCollapseBottom");

                }
                $(nav).css("height",heightAttr+"px");
            }

        }else if(att.nodeName === 'title'){

            //Get title attribute: gives a title to collapse button
            shadowEl.querySelector("#btnCollapse").title = att.nodeValue;

        }else if(att.nodeName === 'resizing'){

            //Gets resizing attribute: gives information in HidingPanelCollapseEvent
            $(nav).css("z-index","10");

            if(att.nodeValue === "true"){
                resizingAttr = true;
            }else{
                resizingAttr = false;
            }
        }
    }

    // Minify panel
    shadowEl.querySelector('#btnCollapse').addEventListener("click",function(e){

        if(typeAttr === "bottom") {

            //Set collapse button as disabled, so user cannot hide/show in series
            $(btnCollapse).attr("disabled", true);

            //Add/Remove collapse class
            nav.classList.toggle('panelCollapseBottom');
            btnCollapse.classList.toggle('btnBottom');

            $(btnCollapse).attr("disabled", false);

            //Set panel height
            wrapperCollapse? $(nav).css("height", "0%") : $(nav).css("height",heightAttr);

            $(nav).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
                //Call HidingPanelCollapseEvent after css transition is end
                var eventParams = {type: typeAttr,height:$(nav).height(),width:widthAttr,wWidth:wWidth,collapse: wrapperCollapse,resizing: resizingAttr};
                $(document).trigger("HidingPanelCollapseEvent",eventParams);
            });

        }else{

            //Add/Remove collapse class for right and left hiding-panel
            nav.classList.toggle('panelCollapse');

            //Set width attributes
            if(typeAttr === "left"){

                if(wrapperCollapse){
                    $(nav).css("width","0px");
                }else{
                    $(nav).css("width", widthAttr+"px");
                }

            }else if(typeAttr === "right"){

                if(wrapperCollapse){
                    $(nav).css("width","0px");
                }else{
                    $(nav).css("width", widthAttr+"px");
                }
            }

            //Resize children of parent for new dimensions, calculate width attribute
            var wWidth = 0;
            if(wrapperCollapse){
                wWidth = $(window).width();
            }else{
                wWidth = $(window).width()- widthAttr;
            }
            var eventParams = {type: typeAttr,height:$(nav).height(),width:widthAttr,wWidth:wWidth,collapse: wrapperCollapse,resizing: resizingAttr};
            $(document).trigger("HidingPanelCollapseEvent",eventParams);

        }

        //wrapperCollapse is true when panel is open, set it reverse
        wrapperCollapse = !wrapperCollapse;

    });

};

var HidingPanel =hidingPanelDoc.registerElement('hiding-panel',{
    prototype:HidingPanelProto
});
