
var Watch = Backbone.Model.extend({

  urlRoot : '/api/watches',
  idAttribute : 'token',

  validate : function(attrs, options) {
    if (!attrs.name) {
      return "name.blank";
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
    name : 'h2.name',
    status : '.status',
    statusLabel : '.status .btn:first',
    statusButtons : '.status .btn',
    details : '.details',
    form : 'form',
    formName : 'form :input.name',
    formInterval : 'form :input.interval',
    formControls : 'form .btn'
  },

  events : {
    'click .status .edit' : 'edit',
    'click form .cancel' : 'cancelEditing',
    'click form .submit' : 'save',
    'click .status .destroy' : 'destroy',
    'click .status .btn:first' : 'toggleDetails'
  },

  onRender : function() {
    this.ui.name.text(this.model.get('name'));
    this.updateStatus();
  },

  edit : function() {

    this.ui.name.hide();
    this.ui.status.hide();

    this.ui.form.css('display', 'inline');
    this.ui.formInterval.val(this.model.get('interval'));

    this.editing = true;
    this.updateStatus();
  },

  cancelEditing : function() {
    this.stopEditing(true);
  },

  stopEditing : function(canceled) {

    this.ui.formControls.attr('disabled', false);
    
    if (!canceled) {
      this.ui.name.text(this.ui.formName.val());
    }

    this.ui.form.hide();
    this.ui.name.show();
    this.ui.status.show();

    this.editing = false;
    this.updateStatus();
  },

  save : function() {
    this.ui.formControls.attr('disabled', true);
    this.model.save({
      name : this.ui.formName.val(),
      interval : this.ui.formInterval.val()
    }, {
      wait : true,
      success : _.bind(this.stopEditing, this, false)
    });
  },

  destroy : function() {
    this.model.destroy({ wait : true });
  },

  toggleDetails : function() {
    this.ui.details.slideToggle();
  },

  updateStatus : function() {

    this.$el.removeClass('up down new editing');
    if (this.editing) {
      return this.$el.addClass('editing');
    }

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
    name : 'form :input.name',
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
      name : this.ui.name.val(),
      interval : this.ui.interval.val()
    }, {
      wait : true,
      success : _.bind(this.watchCreated, this)
    });
  },

  watchCreated : function() {
    this.ui.name.val('');
    this.updateSubmit();
  },

  updateSubmit : function() {
    this.ui.submit.attr('disabled', !this.ui.name.val());
  }
});

$(function() {
  new Backbone.Marionette.Region({ el : $('body') }).show(new AppView());
});
