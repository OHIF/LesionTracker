Template.thumbnails.helpers({
  thumbnails: function() {
    var stacks = createStacks(this);
    return stacks;
  }
});

Template.thumbnails.onRendered(function() {
  var thumbnails = this.find(".thumbnails");
});