var rowCount = 1;
var columnCount = 2;

function getNumViewers() {
    return rowCount * columnCount;
}

Template.imageViewerContainer.helpers ({
    height: function () {
        return 100 / rowCount;
    },

    width: function () {
        return 100 / columnCount;
    },

    viewerArr: function () {
        var numViewers = getNumViewers();

        var array = [];
        for (var i=0; i < numViewers; ++i) {
            var data = {
                viewerIndex: i
            };
            array.push(data);
        }
        return array;

    }
});