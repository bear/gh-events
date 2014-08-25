var config = require('getconfig');
var bucker = require('bucker').createLogger();
var redis = require("redis");
var uuid = require('uuid');
var moment = require('moment');
var githubhook = require('githubhook');
var github = githubhook({ port: config.github.port, logger: bucker });

if config.redis {
    var client = redis.createClient(config.redis.port, config.redis.host);

    client.on('error', function (err) {
        bucker.log('redis error ' + err);
    });
};

if config.webhook {
    var wreck = require('wreck');
};

github.listen();

github.on('*', function cbEvent(event, repo, ref, data) {
    bucker.log('sending ' + repo + ' ' + ref + ' event');

    eventData = {
        id: uuid.v1(),
        type: 'github',
        parent_id: '',
        timestamp: moment.utc().unix() * 1000,
        payload: { 'event': event, 'repo': repo, 'ref': ref, 'data': data }
    };

    if config.redis {
        client.publish('github', JSON.stringify(eventData, null, 2));
    };

    if config.wreck {
        wreck.post(config.webhook.uri, options={'payload': JSON.stringify(eventData, null, 2)},
            function cbWreck(error, resp, payload) {
                if err {
                    bucker.error(err);
                } else {
                    bucker.log('webhook called');
                };
            };
        );
    };
});