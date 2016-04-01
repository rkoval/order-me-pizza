import _ from 'lodash';
import config from 'config';
import pizzaService from './pizzaService';
import paymentService from './paymentService';

const retrieveIndex = (req, res, next) => {
  return new Promise((resolve, reject) => {
    const locals = {
      message: 'hahsdfkasiodfjasdoif asdjfoiasjfdoi asfdjo ij',
      paymentAmount: config.get('paypal.priceToCharge')
    };
    res.render('index', locals);
  }).catch(next);
};

const authorizePayment = (req, res, next) => {
  const getHref = (links, rel) => {
    return links.find((link) => link.rel == rel).href;
  };

  console.log(req.body)
  if (req.body && req.body.confirm1 === 'on' && req.body.confirm2 === 'on') {
    paymentService.createPayment(config.get('paypal.priceToCharge'))
      .then((payment) => {
        const redirect = getHref(payment.links, 'approval_url');
        console.log(`redirecting to ${redirect}`);
        res.redirect(redirect);
      })
      .catch(next);
  } else {
    const locals = {
      error: 'I know you\'re excited, but you must check both of the checkboxes before submitting! Please try again.'
    }
    res.status(400).render('index', locals);
  }
};

const handleAuthorizedPayment = (req, res, next) => {
  const query = req.query;
  console.log(query);
  const locals = {};
  if (query.approved === 'true' && query.paymentId && query.token && query.PayerID) {
    pizzaService.createOrder()
      .then(pizzaService.addPizza)
      .then(pizzaService.validateOrder)
      .then(pizzaService.priceOrder)
      .then(pizzaService.addFutureDate)
      .then(pizzaService.buildCardInfo)
      .then(pizzaService.addDeliveryInstructions)
      .then(paymentService.executePayment(query))
      //.then(pizzaService.placeOrder)
      .then(handleSuccess(res))
      .catch(next);
  } else {
    locals.error = 'The payment was cancelled before it was executed or ' +
      'something else bad happened. Feel free to try again!';
    res.status(400).render('index', locals);
  }
};

const handleSuccess = (res) => {
  return (result) => {
    const amount = _.map(result.payment.transactions, 'amount')[0];
    const prettyDate = moment(order.FutureOrderTime).format('dddd, MMMM Do YYYY, h:mm a');
    console.log(`==> successfully placed order for ${prettyDate}!`)
    const locals = {
      message: `You just paid ${amount.total} ${amount.currency} for the delicious pizza. ` +
        `It is scheduled to be delivered on ${prettyDate}. Thanks!!! 🍕🍕🍕🍕`
    };
    res.render('success', locals);
  };
};

export default {
  retrieveIndex,
  authorizePayment,
  handleAuthorizedPayment
};
