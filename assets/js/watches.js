
var Watch = Backbone.Model.extend({
  urlRoot : '/api/watches'
});

var Watches = Backbone.Collection.extend({

  url : '/api/watches',
  idAttribute : 'token',
  model : Watch
});

var WatchView = Backbone.Marionette.ItemView.extend({

  className : 'watch new',
  template : _.template('<div class="title"><%- title %></div><div class="status"><%- status %></div><br />'),
  ui : {
    title : '.title',
    status : '.status'
  },

  onRender : function() {
    this.ui.title.text(this.model.get('title'));
    this.ui.status.text(this.model.get('status'));
  }
});

$(function() {

  $('#watches form.new input.name').keyup(function() {
    $('#watches form.new .submit').attr('disabled', false);
  });

  $('#watches form.new').on('submit', function(e) {
    e.preventDefault();

    new Watch({
      title : $(this).find('input.name').val()
    }).save({}, {
      success : function(model) {
        console.log(model);
        new WatchView({ model : model }).render().$el.appendTo($('#watches'));
      }
    });
  });
});
