'use strict';

const fs = require('fs');
const Path = require('path');

const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const Handlebars = require('handlebars');

const Guestbook = require('./guestbook');

// Absolute path to web root
const htdocs = Path.join(__dirname, 'public_html');

// Configure HTTP server
const server = new Hapi.Server({
    // Allows definition of arbitrary config variables
    app: {
        htdocs: htdocs
    },
    // Resolve all file requests relative to the web root
    connections: {
        routes: {
            files: {
                relativeTo: htdocs
            }
        }
    }
});
server.connection({ port: 8080 }); // Setup default connection

// Handler that is called prior to HTML rendering
// Allows to provide template data
const buildPageData = function (request, reply) {
    const page = Path.basename(request.url.path, '.html');
    var templateData = {};

    if (page === 'guestbook') {
        templateData.bookentries = Guestbook.loadAll();
    }

    return reply(Object.assign({}, {
        basename: Path.basename(request.url.path, '.html'),
    }, templateData));
};

// Configure routes & replies
server.register([Inert, Vision]).then(function () {
    // Documentation: https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions
    server.views({
        engines: { html: Handlebars },
        relativeTo: server.settings.app.htdocs,
        helpersPath: 'helpers',
        layoutPath: 'layouts',
        layout: 'main',
        partialsPath: 'partials'
    });

    // Configure routes
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            return reply.redirect('/index.html');
        }
    });

    server.route({
        method: 'POST',
        path: '/guestbook.html',
        config: {
            pre: [
                {
                    assign: 'data',
                    method: buildPageData
                }
            ]
        },
        handler: function (request, reply) {
            var res = Guestbook.addEntry(request.payload);

            reply.view('guestbook', Object.assign({}, {
                values: Object.keys(res[1]).length === 0 ? {} : res[0],
                validationErrors: res[1]
            }, request.pre.data));
        }
    })

    server.route({
        method: 'GET',
        path: '/{file}.html',
        config: {
            pre: [
                {
                    assign: 'data',
                    method: buildPageData
                }
            ]
        },
        handler: function (request, reply) {
            const file = Path.join(server.settings.app.htdocs, request.params.file + '.html');

            return fs.existsSync(file)
                ? reply.view(Path.basename(file), request.pre.data)
                : reply('The requested file (' + file + ') could not be found!').code(404);
        }
    });

    server.route({
        method: 'GET',
        path:'/{r*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true
            }
        }
    });
});

// Everything is setup, start the server
server.start()
    .then(function () {
        console.log('Server running at:', server.info.uri);
    })
    .catch(function (e) { console.log(e); })
