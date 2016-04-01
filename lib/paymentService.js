import config from 'config';
import paypal from 'paypal-rest-sdk';
import request from 'request';
import { _ } from 'lodash';

const paypalConfig = config.get('paypal');
const PAYPAL_APP_ID = paypalConfig.get('clientId');
const PAYPAL_APP_SECRET = paypalConfig.get('secret');

const isDev = process.env.NODE_ENV !== 'production';

paypal.configure({
  'mode': isDev ? 'sandbox' : 'live',
  'client_id': PAYPAL_APP_ID,
  'client_secret': PAYPAL_APP_SECRET
});

const redirectHost = paypalConfig.get('redirectHost');

const createPaymentJson = (amount) => {
  return {
    "intent": "authorize",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": `${redirectHost}/authorized?approved=true`,
      "cancel_url": `${redirectHost}/authorized?approved=false`
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "item",
          "sku": "item",
          "price": amount,
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": amount
      },
      "description": "4 my pizza dood! plz accept & thx"
    }]
  };
};

const createPayment = (amount) => {
  return new Promise((resolve, reject) => {
    if (!amount) {
      reject(new Error('amount was undefined!'))
    } else {
      paypal.payment.create(createPaymentJson(amount), function (error, payment) {
        if (error) {
          reject(error);
        } else {
          console.log("Create Payment Response");
          console.log(payment);
          resolve(payment)
        }
      });
    }
  });
};

const executePayment = ({ paymentId, PayerID }) => {
  return (info) => {
    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, {
        payer_id: PayerID
      }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          info.payment = response;
          console.log(info.payment);
          resolve(info);
        }
      });
    });
  }
};

export default {
  createPayment,
  executePayment
};
