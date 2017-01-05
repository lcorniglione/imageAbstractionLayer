var express = require("express");
var req = require("request");

var app = express();

app.get('/api/imagesearch/:query', function(request, response) {
    var query = request.params.query;
    var url = 'https://www.googleapis.com/customsearch/v1?q=' + query + '&searchType=image&cx=016394767303026535170:tiofy6wflbk&key=AIzaSyDEKgzuEk7zh0a6nsRYtJ1EEDQn3KwHT3g';
    var size = request.query.offset;
    req(url, function(error, res, body) {
        if (!error && response.statusCode == 200) {
            var history = {term : query, when : Date.now()};
            var bod = JSON.parse(body);
            var list = makeList(bod);
            response.send(list);
        }
        else {
            response.send(error);
        }
    })

});

function makeList(body) {
    var list = [];
    for (var i = 0; i < body.items.length; i++) {
        var obj = new Object();
        obj.url = body.items[i].link;
        obj.snippet = body.items[i].title;
        obj.thumbnail = body.items[i].image.thumbnailLink;
        obj.context = body.items[i].image.contextLink;
        list.push(obj);
    }
    return list;
}

app.listen(process.env.PORT || 5000);