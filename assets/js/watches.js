
var Watch = Backbone.Model.extend({

  urlRoot : '/api/watches',
  idAttribute : 'token',

  validate : function(attrs, options) {
    if (!attrs.title) {
      return "title.blank";
    }
  }
});

var Watches = Backbone.Collection.extend({

  url : '/api/watches',
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
    status : '.status',
    statusLabel : '.status .btn:first',
    statusButtons : '.status .btn'
  },

  events : {
    'click .delete' : 'deleteWatch'
  },

  onRender : function() {
    this.ui.title.text(this.model.get('title'));
    this.updateStatus();
  },

  deleteWatch : function() {
    this.model.destroy({ wait : true });
  },

  updateStatus : function() {

    this.$el.removeClass('up down new');
    this.$el.addClass(this.model.get('status'));

    this.ui.statusLabel.text(Translations.status[this.model.get('status')]);

    this.ui.statusButtons.removeClass('btn-success btn-danger');
    if (this.model.get('status') == 'up') {
      this.ui.statusButtons.addClass('btn-success');
    } else if (this.model.get('status') == 'down') {
      this.ui.statusButtons.addClass('btn-danger');
    }
  }
});

var WatchesView = Backbone.Marionette.CompositeView.extend({

  template : '#template-watches',
  ui : {
    title : 'form :input.name',
    interval : 'form :input.interval',
    submit : 'form .submit'
  },

  events : {
    'submit form' : 'createWatch',
    'keyup form :input' : 'updateSubmit',
    'change form :input' : 'updateSubmit'
  },

  itemView : WatchView,
  itemViewContainer : '.watches',

  createWatch : function(e) {
    e.preventDefault();
    this.collection.create({
      title : this.ui.title.val(),
      interval : this.ui.interval.val()
    }, {
      wait : true,
      success : _.bind(this.watchCreated, this)
    });
  },

  watchCreated : function() {
    this.ui.title.val('');
    this.updateSubmit();
  },

  updateSubmit : function() {
    this.ui.submit.attr('disabled', !this.ui.title.val());
  }
});

$(function() {
  new Backbone.Marionette.Region({ el : $('body') }).show(new AppView());
});
