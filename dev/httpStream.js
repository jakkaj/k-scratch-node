var request = require('request');
var body = '';


var requestUri = "https://functionplayground.scm.azurewebsites.net:443/logstream/application";

var username = '$functionplayground';
var password = 'xx';
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

console.log(auth);

var f = {
    on:function(e){
        console.log(e);
    },
    emit:function(e){
        console.log(e);
    }
}

var r = request.get(requestUri).auth(username, password, false);
 
//  r.on('readable', () => {
//   console.log('readable:', r.read());
// });
 
 r.on('data', (chunk)=>{
     console.log(chunk.toString('utf8'));
 })

r.on('error', (e)=>{
    console.log("Error:" + e);
})

 r.on('end', ()=>{
    console.log("end");
 });

//process.exit();

// http.get(requestUri, function(res) {
//   res.on('data', function(chunk) {
//     console.log(chunk);
//   });
//   res.on('end', function() {
//     // all data has been downloaded
//   });
// });