
exports.index = function(req, res){
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
};
