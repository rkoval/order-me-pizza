# order-me-pizza

A dumb website originally published on April 1st, 2016 that enables your friends/enemies to buy you a pizza delivery without you having to give them anything in return. It uses the Dominos API for ordering.

## Prerequisites

1. A working [PayPal developer account](https://developer.paypal.com/). You'll need the client/secret keys to put into the configuration.
1. The proper JSON for what items you want to order www.dominos.com. See [the dominos node API documentation](https://github.com/RIAEvangelist/node-dominos-pizza-api#item) for more details. You'll need this in the config.
1. A properly filled out [config file](config/default.json). You shouldn't need to make any actual code/logic changes for the app to work properly; as long as the config conforms to what Dominos and PayPal expect, the transaction will go through and you will get your pizza 🍕

## Install

```sh
$ npm install
```

## Run in Dev mode

```
$ npm run dev
```

By default, you should be able to hit the app at http://localhost:3003.

## Run in Prod mode

```sh
$ npm start
```

If actually running on a production server, you will need to make sure that your `NODE_ENV` environment variables is set to `production` so that the live PayPal transactions will kick in.

See the scripts portion of [package.json](package.json) for more details on what these commands are actually doing.

## TODO

[ ] Add more detail to this README when it's not 2am in the morning
