
var hidingPanelDoc = document.currentScript.ownerDocument;
HidingPanelProto = Object.create(HTMLElement.prototype);

HidingPanelProto.createdCallback = function () {
    //Create shadow dom
    var templateHidingPanel = hidingPanelDoc.querySelector('#hiding-panel-template');
    if(templateHidingPanel == null) {
        return;
    }

    var cloneHidingPanel = templateHidingPanel.content.cloneNode(true);

    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(cloneHidingPanel);

    var shadowEl = this.shadow;
    var panel = shadowEl.querySelector('#panel');
    var content = shadowEl.querySelector('#content');
    var btnCollapse = shadowEl.querySelector('#btnCollapse');
    var btnCollapseIcon = shadowEl.querySelector('#btnCollapseIcon');
    var panelIsOpen = true;

    //Get Type
    var typeAttr = "left";
    var widthAttr = "100";
    var heightAttr = "100";
    var resizingAttr = false;

    //hiding-panel attributes: if w or h attribute is not defined, it gets 100% siz
    for (var i = 0; i < this.attributes.length; i++) {
        var att = this.attributes[i];
        if (att.nodeName === 'type') {
            //Get type att: bottom,right,left
            typeAttr = att.nodeValue;
        } else if (att.nodeName === 'width') {
            //Get width
            widthAttr = att.nodeValue;
            //Get height
        } else if (att.nodeName === 'height') {
            heightAttr = att.nodeValue;
        } else if (att.nodeName === 'resizing') {
            resizingAttr = (att.nodeValue === 'true');
        }
    }


    //Set panel first width/height
    panel.style.width = widthAttr + "%";
    panel.style.height = heightAttr + "%";

    //Set elements position according to type
    if (typeAttr === "top") {

        //Set panel position
        panel.style.top = "0";
        panel.style.left = "0";

        content.style.float = "none";

        //Set btnCollapse position
        btnCollapse.style.top = "0";
        btnCollapse.style.left = "0";

        //Set btnCollapseIcon
        btnCollapseIcon.classList.add("fa-angle-up");

    } else if (typeAttr === "right") {
        //Set panel position
        panel.style.right = "0";
        panel.style.top = "0";

        content.style.float = "right";

        //Set btnCollapse position
        btnCollapse.style.right = "0";
        btnCollapse.style.top = "0";

        //Set btnCollapseIcon
        btnCollapseIcon.classList.add("fa-angle-right");


    } else if (typeAttr === "bottom") {
        //Set panel position
        panel.style.bottom = "0";
        panel.style.left = "0";

        content.style.float = "bottom";

        //Set btnCollapse position
        btnCollapse.style.bottom = "0";
        btnCollapse.style.left = "0";

        //Set btnCollapseIcon
        btnCollapseIcon.classList.add("fa-angle-down");

    } else if (typeAttr === "left") {
        //Set panel position
        panel.style.left = "0";
        panel.style.top = "0";

        content.style.float = "left";

        //Set btnCollapse position
        btnCollapse.style.left = "0";
        btnCollapse.style.top = "0";

        //Set btnCollapseIcon
        btnCollapseIcon.classList.add("fa-angle-left");

    }

    // Minify panel
    shadowEl.querySelector('#btnCollapse').addEventListener("click", function (e) {

        if (panelIsOpen) {
            //Close
            if (typeAttr === "left" || typeAttr === "right") {
                panel.style.width = "0";

            } else if (typeAttr === "top" || typeAttr === "bottom") {
                panel.style.height = "0";
            }

        } else {
            //Open

            if (typeAttr === "left" || typeAttr === "right") {

                panel.style.width = widthAttr + "%";
            } else if (typeAttr === "top" || typeAttr === "bottom") {

                panel.style.height = heightAttr + "%";
            }
        }

        if (typeAttr === "left" || typeAttr === "right") {

            content.classList.toggle('content-collapseHorizontal');
        } else if (typeAttr === "top" || typeAttr === "bottom") {

            content.classList.toggle('content-collapseVertical');
        }

        btnCollapseIcon.classList.toggle('btnCollapseIcon-collapse');
        panelIsOpen = !panelIsOpen;

        var data = {
            panelIsOpen: panelIsOpen,
            width: widthAttr,
            height: heightAttr,
            type: typeAttr,
            resizing: resizingAttr
        };
        $(document).trigger("HidingPanelCollapseEvent", data);


    });

    //Get panel width
    shadowEl.getPanelWidth = function() {
      return $(shadowEl.querySelector("#panel")).width();
    };


};

var HidingPanel =hidingPanelDoc.registerElement('hiding-panel',{
    prototype:HidingPanelProto
});
