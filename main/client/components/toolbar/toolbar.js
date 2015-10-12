Meteor.startup(function() {
    var OHIF = window.OHIF || {};
    OHIF.viewer.functionList = {
        invert: function(element) {
            var viewport = cornerstone.getViewport(element);
            viewport.invert = !viewport.invert;
            cornerstone.setViewport(element, viewport);
        },
        playClip: function(element) {
            cornerstoneTools.playClip(element);
        },
        stopClip: function(element) {
            cornerstoneTools.stopClip(element);
        }
    };

    OHIF.viewer.tooltipConfig = {
        trigger: 'hover'
    };
});

Template.toolbar.helpers({
    studies : function() {
        var activeTabId = Session.get("activeTabId");
        var studies = Session.get('studies');
        return studies;
    }
});

Template.toolbar.events({

    'click .imageViewerTool': function(e) {
        var tool = e.currentTarget.id;
        console.log('Setting active tool to: ' + tool);
        toolManager.setActiveTool(tool);
    },
    'click .imageViewerCommand': function(e) {
        var command = e.currentTarget.id;
        if (!OHIF.viewer.functionList.hasOwnProperty(command)) {
            return;
        }

        // TODO = Add support for active viewports
        //var element = getActiveViewportElement();
        $('.imageViewer').each(function() {
            var element = this;
            OHIF.viewer.functionList[command](element);
        });
    }
});

Template.toolbar.onRendered(function() {
    var tooltipButtons = $('[data-toggle="tooltip"]');
    tooltipButtons.tooltip(OHIF.viewer.tooltipConfig);

    // Enable tooltips for the layout button
    var extraTooltipButtons = $('[rel="tooltip"]');
    extraTooltipButtons.tooltip(OHIF.viewer.tooltipConfig);
});