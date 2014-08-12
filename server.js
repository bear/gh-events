var config = require('getconfig');
var bucker = require('bucker').createLogger();
var redis = require("redis");
var uid = require('node-uuid');
var moment = require('moment');
var githubhook = require('githubhook');
var client = redis.createClient(config.redis.port, config.redis.host);
var github = githubhook({ port: config.github.port, logger: bucker });

client.on('error', function (err) {
    bucker.log('redis error ' + err);
});

github.listen();

github.on('*', function (event, repo, ref, data) {
    bucker.log('sending ' + repo + ' ' + ref + ' event');

    event = {
        id: uuid.v1(),
        type: 'github',
        parent_id: '',
        timestamp: moment.utc().unix() * 1000;,
        payload: { 'repo': repo, 'ref': ref, 'data': data }
    };

    client.publish('github', JSON.stringify(event, null, 2));
});