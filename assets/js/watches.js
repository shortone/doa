
var Watch = Backbone.Model.extend({
});

var Watches = Backbone.Collection.extend({

  url : '/api/watches',
  idAttribute : 'token',
  model : Watch
});

var AppView = Backbone.Marionette.Layout.extend({

  template : '#template-app',
  regions : {
    watches : '#watches'
  },

  initialize : function() {
    this.watchesCollection = new Watches($('body').data('watches'));
  },

  onRender : function() {
    this.watches.show(new WatchesView({ collection : this.watchesCollection }));
  }
});

var WatchView = Backbone.Marionette.ItemView.extend({

  className : 'watch',
  template : '#template-watch',
  ui : {
    title : '.title',
    status : '.status'
  },

  onRender : function() {
    this.$el.addClass(this.model.get('status'));
    this.ui.title.text(this.model.get('title'));
    this.ui.status.text(this.model.get('status'));
  }
});

var WatchesView = Backbone.Marionette.CompositeView.extend({

  template : '#template-watches',
  ui : {
    title : 'form input.name',
    submit : 'form .submit'
  },

  events : {
    'submit form' : 'createWatch',
    'keyup form :input' : 'updateSubmit'
  },

  itemView : WatchView,
  itemViewContainer : '.watches',

  createWatch : function(e) {
    e.preventDefault();
    this.collection.create({
      title : this.ui.title.val()
    }, { wait : true });
  },

  updateSubmit : function() {
    this.ui.submit.attr('disabled', !this.ui.title.val());
  }
});

$(function() {
  new Backbone.Marionette.Region({ el : $('body') }).show(new AppView());
});
