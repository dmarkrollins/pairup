/* global WebApp Assets */
import { Meteor } from 'meteor/meteor'
import crypto from 'crypto'
import connectRoute from 'connect-route'

if (!Meteor.isTest) {
    WebApp.connectHandlers.use(connectRoute(function (router) {
        router.get('/', function (req, res, next) {
            const buf = Assets.getText('index.html')

            if (buf.length > 0) {
                const eTag = crypto.createHash('md5').update(buf).digest('hex')

                if (req.headers['if-none-match'] === eTag) {
                    res.writeHead(304, 'Not Modified')
                    return res.end()
                }

                res.writeHead(200, {
                    ETag: eTag,
                    'Content-Type': 'text/html'
                })

                return res.end(buf);
            }

            return res.end('<html><body>Pairity index page not found!</body></html>')
        })
    }))
}
