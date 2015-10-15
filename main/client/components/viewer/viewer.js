function resizeViewer() {
    console.log('Resizing viewer');
    var height = window.height;
    var width = window.width;

    Session.set('viewerHeight', height);
    Session.set('viewerWidth', width);

    $("#viewer").css({
        height: height,
        width: width
    });
}

function resizeViewports() {
    // Handle resizing of image viewer viewports
    // For some reason, this seems to need to be on
    // another delay, or the resizing won't work properly
    viewportResizeTimer = setTimeout(function() {
        var elements = $('.imageViewerViewport');
        elements.each(function(index) {
            var element = this;
            if (element) {
                cornerstone.resize(element, true);
            }
        });
    }, 1);
}

Session.setDefault('viewportRows', 1);
Session.setDefault('viewportColumns', 2);

height = window.height;
width = window.width;
Session.setDefault('viewerHeight', height);
Session.setDefault('viewerWidth', width);

// Avoid doing DOM manipulation during the resize handler
// because it is fired very often.
// Resizing is therefore performed 100 ms after the resize event stops.
var resizeTimer;
$(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        resizeViewer();
        resizeViewports();
    }, 100);
});

Template.viewer.onRendered(function() {
    var height = Session.get('viewerHeight');
    var width = Session.get('viewerWidth');

    var imageViewer = $("#viewer");
    imageViewer.css({
        height: height,
        width: width
    });

    document.body.style.overflow = "hidden";
    document.body.style.minWidth = 0;

    if (imageViewer) {
        $('.navbar-default').css({
            'background-color': '#000000',
            'border-color': '#101010'
        });
    }

    //Set bottomContainer as a dockingContainer
    var bottomContainer = this.find("#bottomContainer");
    $(bottomContainer).dockingContainer();
});

Template.viewer.onDestroyed(function() {
    $('.navbar-default').css({
        'background-color': '#f8f8f8',
        'border-color': '#e7e7e7'
    });
});

Meteor.startup(function () {
    $(window).trigger('resize');
});