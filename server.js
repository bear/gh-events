var config = require('getconfig');
var bucker = require('bucker').createLogger();
var redis = require("redis");
var githubhook = require('githubhook');
var client = redis.createClient(config.redis.port, config.redis.host);
var github = githubhook({ port: config.github.port, logger: bucker });

client.on('error', function (err) {
    bucker.log('redis error ' + err);
});

github.listen();

github.on('*', function (event, repo, ref, data) {
    bucker.log('sending ' + repo + ' ' + ref + ' event');
    
    client.publish('github', { 'repo': repo, 'ref': ref, 'data': data });
});