import { createApp } from './main'

export default context => {
  return new Promise((resolve, reject) => {
    debugger
    const { app, router, store } = createApp(context.req)
    let { url } = context
    const { fullPath } = router.resolve(url).route

    if (fullPath !== url) {
      return reject({ url: fullPath })
    }
    router.push(url)

    router.onReady(() => {
      debugger
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      Promise.all(matchedComponents.map(({ asyncData }) => {
        let state = Object.assign({}, store.state, context.state || {});
        store.replaceState(state);
        return asyncData && asyncData(
          {
            req: context.req,
            res: context.res
          },
          store,
          context,
          router.currentRoute
        )
      })).then(() => {
        context.state = Object.assign({}, store.state, context.state || {});
        resolve(app)
      }).catch((err) => {
        reject(err)
      })
    }, reject)
  })
}

