Template.thumbnails.helpers({
  thumbnails: function() {
    console.log(this);
    var stacks = createStacks(this);
    console.log(stacks);
    return stacks;
  }
});

Template.thumbnails.onRendered(function() {
  var thumbnails = this.find(".thumbnails");
});