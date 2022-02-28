This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It was created to be cloned down or built upon to serve as a proxy for 3rd party API requests from Sanity to other services. It was specifically built for our Smartling integration (which is why there's some extra logic for sending and receiving files) but could be used for other purposes.

WARNING: For demonstration purposes and easy set-up, its CORS permissions are open to the world. As soon as you know where requests to this service will be coming from, you should lock those down in `utils.js` and `next.config.js`

