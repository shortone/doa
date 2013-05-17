
var _ = require('underscore');

var Home = function(app) {
  this.app = app;
};

_.extend(Home.prototype, {

  index : function(req, res) {
    var config = {
      watches : {
        website : {
          title : 'My Website'
        },
        backup : {
          title : 'My Backup Script'
        }
      }
    };
    res.render('index', { title: 'DOA', config: config });
  }
});

module.exports = Home;
