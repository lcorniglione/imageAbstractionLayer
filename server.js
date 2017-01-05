var express = require("express");
var req = require("request");
var mongodb = require('mongodb');

var app = express();

var MongoClient = mongodb.MongoClient;
var url = "mongodb://history:history@ds155718.mlab.com:55718/history";

app.get('/api/imagesearch/:query', function(request, response) {
    var query = request.params.query;
    var urll = 'https://www.googleapis.com/customsearch/v1?q=' + query + '&searchType=image&cx=016394767303026535170:tiofy6wflbk&key=AIzaSyDEKgzuEk7zh0a6nsRYtJ1EEDQn3KwHT3g';
    var size = request.query.offset;
    req(urll, function(error, res, body) {
        if (!error && response.statusCode == 200) {
            var date = new Date(Date.now());
            date.setTime(date.getTime() - (date.getTimezoneOffset() * 60000));
            var output = date.toISOString().substring(0, date.toISOString().length - 1) + ((date.getTimezoneOffset() / 60) < 0 ? "-" : "+") + ((Math.abs(date.getTimezoneOffset() / 60) < 10) ? ("0" + Math.abs(date.getTimezoneOffset() / 60)) : test) + "00";
            var history = {
                "term": query,
                "when": output
            };
            save(history);
            var bod = JSON.parse(body);
            var list = makeList(bod);
            response.send(list);
        }
        else {
            response.send(error);
        }
    })

});


app.get('/api/latest/imagesearch', function(request, response) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var collection = db.collection("history");
        collection.find({}, {
            _id: 0,
            when: 1,
            term: 1
        }).sort({
            when: 1
        }).limit(10).toArray(function(err, result) {
            if (err) console.log(err);
            response.send(result);
        })
        db.close();
    });

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

function save(history) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var collection = db.collection('history');
        collection.insert({
            term: history.term,
            when: history.when
        });
        db.close();
    })
}

app.listen(process.env.PORT || 5000);
