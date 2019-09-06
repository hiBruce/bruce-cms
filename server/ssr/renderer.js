const config = require("../../conf/base.config");
const logger = require("../middleware/logger")
let isProd = require("../middleware/getEnv").isProd();
const path = require("path");
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')
const LRU = require('lru-cache')
const fs = require("fs")

module.exports = (app) => {
    function createRenderer(bundle, options) {
        return createBundleRenderer(bundle, Object.assign(options, {
            // for component caching
            cache: LRU({
                max: 1000,
                maxAge: 1000 * 60 * 15
            }),
            // this is only needed when vue-server-renderer is npm-linked
            basedir: resolve(config.deploy['real-path']),
            // recommended for performance
            runInNewContext: false,

        }))
    }

    //createRender()

    const serverInfo =
        `express/${require('express/package.json').version} ` +
        `vue-server-renderer/${require('vue-server-renderer/package.json').version}`;

    let renderer
    let temRenderer
    let readyPromise
    const templatePath = resolve(resolve('../../web/_layout_/index.html'))
    if (isProd) {
        const template = fs.readFileSync(templatePath, 'utf-8')
        const bundle = require(`${resolve("../../dist")}/vue-ssr-server-bundle.json`)
        const clientManifest = require(`${resolve("../../dist")}/vue-ssr-client-manifest.json`)
        renderer = createRenderer(bundle, {
            template,
            clientManifest
        })
    } else {
        // In development: setup the dev server with watch and hot-reload,
        // and create a new renderer on bundle / index template update.
        readyPromise = require('../../web/build/build.js')(
            app,
            templatePath,
            (bundle, options) => {
                let temOptions = JSON.parse(JSON.stringify(options));
                temOptions['template'] = null;
                temOptions.inject = false
                renderer = createRenderer(bundle, options)
                temRenderer = createRenderer(bundle, temOptions)
            }
        );
    }


    return (req, res, data) => {
        createRender(req, res, data)
    }

    function createRender(req, res, data) {
        if (!data) {
            data = {}
        }
        if (isProd) {
            render(req, res, data)
        } else {
            readyPromise.then(() => render(req, res, data))
        }
    }

    function render(req, res, context) {
        const s = Date.now()
        res.setHeader("Server", serverInfo)
        let needHandResolve = true;
        realRender = renderer;
        if (context.inject) {
            realRender = temRenderer;
            needHandResolve = true;
        }
        const handleError = err => {
            if (err.url) {
                res.redirect(err.url)
            } else if (err.code === 404) {
                res.status(404).send('404 | Page Not Found')
            } else {
                // Render Error Page or Redirect
                res.status(500).send('500 | Internal Server Error')
                logger.error(`error during render : ${req.url}`)
                logger.error(err.stack)
            }
        }
        let configState = {};
        try {
            config.setRenderDataFromSession.forEach((ele, i) => {
                configState[ele] = req.session[ele];
            })
        } catch (err) {
            console.log("=======setRenderDataFromSession error:" + err)
        }
        context.state = Object.assign(context.state || {}, configState)
        context.res = res;
        context.req = req;
        realRender.renderToString(context, (err, html) => {
            if (err) {
                return handleError(err)
            }
            if (needHandResolve) {
                try {
                    let preLoad = context.renderResourceHints();
                    let sty = context.renderStyles();
                    let src = context.renderScripts();
                    html = html + preLoad || '' + sty || '' + src || '';
                } catch (err) { }
            }
            if (!html) {
                res.status(404).end();
            } else {
                res.send(html)
            }
            logger.info(`whole request:${context.url}请求共耗时： ${Date.now() - s}ms`)
        })
    }
}
