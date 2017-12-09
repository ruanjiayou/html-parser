const IO = require('../../lib/IO');

IO.downImage('https://sfault-image.b0.upaiyun.com/419/209/4192099105-58ee02803842a_articlex','D:/')
    .then(function(result){
        console.log(result);
    })
    .catch(function(err){
        console.log(err.message);
    });