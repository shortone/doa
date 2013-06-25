
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
    this.watchesCollection = new Watches($('#app').data('watches'));
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
    lastPingedAt : '.lastPingedAt',
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
    this.updateLastSeenAt();

    if (this.model.get('status') == 'new') {
      this.ui.details.show();
    }
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
      interval : parseInt(this.ui.formInterval.val(), 10)
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

    var status = Translations.status[this.model.get('status')];
    if (this.model.get('lastPingedAt')) {
      status = status.replace(/\%\{time\}/, moment(new Date(this.model.get('lastPingedAt'))).fromNow(true));
    }
    this.ui.statusLabel.text(status);

    this.ui.statusButtons.removeClass('btn-success btn-danger');
    if (this.model.get('status') == 'up') {
      this.ui.statusButtons.addClass('btn-success');
    } else if (this.model.get('status') == 'down') {
      this.ui.statusButtons.addClass('btn-danger');
    }
  },

  updateLastSeenAt : function() {
    if (!this.model.get('lastPingedAt')) {
      this.ui.lastPingedAt.text(Translations.pingInstructions);
    } else {
      this.ui.lastPingedAt.text(Translations.lastPing.replace(/\%\{time\}/, moment(new Date(this.model.get('lastPingedAt'))).format('dddd, MMMM Do YYYY, h:mm:ss a')));
    }
  }
});

var WatchesView = Backbone.Marionette.CompositeView.extend({

  template : '#template-watches',
  ui : {
    name : 'form :input.name',
    interval : 'form :input.interval',
    submit : 'form .submit',
    info : '.info'
  },

  events : {
    'submit form' : 'createWatch',
    'keyup form :input' : 'updateSubmit',
    'change form :input' : 'updateSubmit'
  },

  collectionEvents : {
    'destroy' : 'updateInfo'
  },

  itemView : WatchView,
  itemViewContainer : '.watches',

  onRender : function() {
    this.updateInfo();
  },

  createWatch : function(e) {
    e.preventDefault();
    this.collection.create({
      name : this.ui.name.val(),
      interval : parseInt(this.ui.interval.val(), 10)
    }, {
      wait : true,
      success : _.bind(this.watchCreated, this)
    });
  },

  watchCreated : function() {
    this.ui.name.val('');
    this.updateSubmit();
    this.updateInfo();
  },

  updateSubmit : function() {
    this.ui.submit.attr('disabled', !this.ui.name.val());
  },

  updateInfo : function() {

    var climateStatus = 'allNew',
        allDown = true,
        upCount = 0,
        downCount = 0,
        newCount = 0;

    this.collection.forEach(function(watch) {
      if (watch.get('status') == 'up') {
        upCount++;
      } else if (watch.get('status') == 'new') {
        newCount ++;
      } else if (watch.get('status') == 'down') {
        downCount++;
        climateStatus = 'someDown';
        return;
      }
      allDown = false;
      if (watch.get('status') != 'new' && climateStatus == 'allNew') {
        climateStatus = 'noneDown';
      }
    });

    if (allDown) {
      climateStatus = 'allDown';
    }

    if (!this.collection.length) {
      climateStatus = 'nothing';
    }

    var textClass = 'text-info';
    if (climateStatus == 'noneDown') {
      textClass = 'text-success';
    } else if (climateStatus == 'someDown') {
      textClass = 'text-warning';
    } else if (climateStatus == 'allDown') {
      textClass = 'text-error';
    } else if (climateStatus == 'nothing') {
      textClass = 'muted';
    }

    var text = $('<span />');
    text.append($('<strong />').text(Translations.climate[climateStatus]));

    if (downCount || upCount || newCount) {
      text.append(' &mdash; ');
    }

    var countText = [];
    if (downCount) {
      countText.push(this.translateCount('down', downCount));
    }
    if (upCount) {
      countText.push(this.translateCount('up', upCount));
    }
    if (newCount) {
      countText.push(this.translateCount('new', newCount));
    }
    text.append(countText.join(', '));

    this.ui.info.html(text);
    this.ui.info.removeClass('text-info text-success text-warning text-error');
    this.ui.info.addClass(textClass);
  },

  translateCount : function(type, n) {
    
    var translations = Translations.climate[type + 'Count'];
    var translation = translations.more;
    if (n == 1 && translations.one) {
      translation = translations.one;
    } else if (!n && translations.zero) {
      translation = translations.zero;
    }

    return translation.replace(/\%\{n\}/, n);
  }
});

$(function() {
  new Backbone.Marionette.Region({ el : $('#app') }).show(new AppView());
});
