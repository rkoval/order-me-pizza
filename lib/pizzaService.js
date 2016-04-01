import dominos from 'dominos';
import config from 'config';
import moment from 'moment';

const dominosConfig = config.get('dominos');
const customerConfig = dominosConfig.get('customer');

const performDominosAction = (action, info) => {
  return new Promise((resolve, reject) => {
    info.order[action]((result) => {
      if (result.success && result.result.Status > 0) {
        console.log(action, JSON.stringify(result));
        resolve(info);
      } else {
        const message = `Dominos error after ${action}`;
        console.error(message, JSON.stringify(result.result, null, 2));
        reject(new Error(message));
      }
    });
  });
};

const customer = new dominos.Customer({
  address: new dominos.Address(customerConfig.get('address')),
  firstName: customerConfig.get('firstName'),
  lastName: customerConfig.get('lastName'),
  phone: customerConfig.get('phone'),
  email: customerConfig.get('email')
});
const storeID = dominosConfig.get('storeID');

const createAddress = (addressString) => {
  const address = new dominos.Address(addressString);
};

const createOrder = () => {
  const order = new dominos.Order({
    customer,
    storeID,
    deliveryMethod: 'Delivery'
  });

  return Promise.resolve({ order });
};

const addPizza = (info) => {
  const item = dominosConfig.get('item');
  info.order.addItem(item);
  return Promise.resolve(info);
};

const validateOrder = (info) => {
  return performDominosAction('validate', info);
};

const priceOrder = (info) => {
  return performDominosAction('price', info);
};

const buildCardInfo = (info) => {
  const cc = config.get('cc');
  const cardInfo = {
    Amount: info.order.Amounts.Customer,
    Number: cc.number,
    Type: 'CreditCard',
    CardType: info.order.validateCC(cc.number),
    Expiration: cc.expiry.replace(/\D/g, ''),
    SecurityCode: cc.cvc,
    PostalCode: cc.billingZipCode
  };

  info.order.Payments.push(cardInfo);

  return Promise.resolve(info);
};

const addFutureDate = (info) => {
  // move order to tomorrow if order was placed too close to order time
  const desiredOrderTime = 
    moment()
      .hours(dominosConfig.get('orderTime.hour'))
      .minutes(dominosConfig.get('orderTime.minute'))
      .seconds(0);

  const deadlineForToday = 
    desiredOrderTime.clone()
      .subtract(1, 'hour')
      .subtract(30, 'minutes');

  const dateFormat = 'YYYY-MM-DD HH:mm:ss';
  const now = moment();
  if (now.isAfter(deadlineForToday)) {
    var actualOrderTime = desiredOrderTime.add(1, 'day');
  } else {
    actualOrderTime = desiredOrderTime;
  }
  info.order.FutureOrderTime = actualOrderTime.format(dateFormat);

  console.error(info.order);

  return Promise.resolve(info);
};

const addDeliveryInstructions = (info) => {
  const deliveryInstructions = customerConfig.get('deliveryInstructions');
  info.order.Address.DeliveryInstructions = deliveryInstructions;
  return Promise.resolve(info);
};

const placeOrder = (info) => {
  return performDominosAction('place', info);
};

export default {
  createOrder,
  addPizza,
  validateOrder,
  addFutureDate,
  priceOrder,
  buildCardInfo,
  addDeliveryInstructions,
  placeOrder
};
