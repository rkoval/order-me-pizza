import util from 'util';
import dominos from 'dominos';
import config from 'config';
import moment from 'moment';

const dominosConfig = config.get('dominos');
const customerConfig = dominosConfig.get('customer');

const performDominosAction = async (action, info) => {
  console.log(`executing action: ${action} ...`);
  try {
    await info.order[action]();
  } catch (error) {
    console.error(
      'Error performing dominos action. order:',
      util.inspect(info.order, false, null, true)
    );
    throw error;
  }
  return info;
};

const customer = new dominos.Customer({
  address: new dominos.Address(customerConfig.get('address')),
  firstName: customerConfig.get('firstName'),
  lastName: customerConfig.get('lastName'),
  phone: customerConfig.get('phone'),
  email: customerConfig.get('email'),
});
const storeID = dominosConfig.get('storeID');

const createOrder = async () => {
  // uncomment to look at nearby stores
  // const nearbyStores = await new dominos.NearbyStores(customer.address);
  // console.log('nearbyStores', util.inspect(nearbyStores, false, null, true));

  const order = new dominos.Order(customer);
  order.storeID = storeID;
  order.customerID = customerConfig.get('id');
  order.userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0';
  order.orderTaker = null;

  return Promise.resolve({order});
};

const addPizza = (info) => {
  const item = new dominos.Item(dominosConfig.get('item'));
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
  const cardInfo = new dominos.Payment({
    amount: info.order.amountsBreakdown.customer,
    number: cc.number,
    expiration: cc.expiry,
    securityCode: cc.cvc,
    postalCode: cc.billingZipCode,
    tipAmount: 3,
  });

  info.order.payments.push(cardInfo);

  return Promise.resolve(info);
};

const addFutureDate = (info) => {
  // move order to tomorrow if order was placed too close to order time
  const desiredOrderTime = moment()
    .hours(dominosConfig.get('orderTime.hour'))
    .minutes(dominosConfig.get('orderTime.minute'))
    .seconds(0);

  const deadlineForToday = desiredOrderTime.clone().subtract(1, 'hour').subtract(30, 'minutes');

  const dateFormat = 'YYYY-MM-DD HH:mm:ss';
  const now = moment();
  if (now.isAfter(deadlineForToday)) {
    var actualOrderTime = desiredOrderTime.clone().add(1, 'day');
  } else {
    actualOrderTime = desiredOrderTime.clone();
  }

  // skip weekdays where you are usually busy or that you just don't give a fuck about
  const isoWeekdaysToSkip = dominosConfig.get('orderTime.isoWeekdaysToSkip');
  while (isoWeekdaysToSkip.indexOf(actualOrderTime.isoWeekday()) >= 0) {
    actualOrderTime.add(1, 'day');
  }

  info.order.FutureOrderTime = actualOrderTime.format(dateFormat);

  console.log('added order time:', info.order.FutureOrderTime);

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
  placeOrder,
};
