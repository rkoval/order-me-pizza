import config from 'config';
import paypal from 'paypal-rest-sdk';

const paypalConfig = config.get('paypal');
const PAYPAL_APP_ID = paypalConfig.get('clientId');
const PAYPAL_APP_SECRET = paypalConfig.get('secret');

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  var paypalMode = 'sandbox';
  console.log('using paypal sandbox mode ...');
} else {
  paypalMode = 'live';
  console.log('$$$$$$$$$ USING PAYPAL LIVE MODE $$$$$$$$$');
}

paypal.configure({
  mode: paypalMode,
  client_id: PAYPAL_APP_ID,
  client_secret: PAYPAL_APP_SECRET,
});

const redirectHost = paypalConfig.get('redirectHost');

const createPaymentJson = (amount) => {
  return {
    intent: 'authorize',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: `${redirectHost}/authorized?approved=true`,
      cancel_url: `${redirectHost}/authorized?approved=false`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'item',
              sku: 'item',
              price: amount,
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: amount,
        },
        description: '4 my pizza dood! plz accept & thx',
      },
    ],
  };
};

const createPayment = (amount) => {
  return new Promise((resolve, reject) => {
    if (!amount) {
      reject(new Error('amount was undefined!'));
    } else {
      paypal.payment.create(createPaymentJson(`${amount}`), function (error, payment) {
        if (error) {
          reject(error);
        } else {
          console.log('payment created');
          resolve(payment);
        }
      });
    }
  });
};

const executePayment = ({paymentId, PayerID}) => {
  return (info) => {
    return new Promise((resolve, reject) => {
      paypal.payment.execute(
        paymentId,
        {
          payer_id: PayerID,
        },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            info.payment = response;
            console.log('payment executed!', info);
            resolve(info);
          }
        }
      );
    });
  };
};

export default {
  createPayment,
  executePayment,
};
