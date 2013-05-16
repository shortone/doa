
/*
 * GET home page.
 */
require('js-yaml');

exports.index = function(req, res){
  var config = require('../config.yml');
  res.render('index', { title: 'DOA', config: config });
};
