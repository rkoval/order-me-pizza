const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const serveStatic = require('serve-static');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const routes = require('./routes');

const app = express();
const root = path.join(__dirname, '..');

app.set('port', process.env.PORT || 3003);
app.set('view engine', 'jade');

app.use(favicon(path.join(root, 'public', 'images', 'favicon.ico')));

const setupStatic = (...args) => {
  app.use(serveStatic(path.join(root, ...args)));
};

setupStatic('public');
setupStatic('bower_components', 'bootstrap', 'dist');
setupStatic('bower_components', 'jquery', 'dist');
setupStatic('bower_components', 'confetti.js');
setupStatic('bower_components', 'lodash', 'dist');

app.use(logger('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

const isDev = process.env.NODE_ENV !== 'production';

app.get('/', routes.retrieveIndex);
app.post('/', routes.authorizePayment);

app.get('/authorized', routes.handleAuthorizedPayment);

const port = app.get('port');
app.listen(port, function () {
  console.log(`Listening on port ${port}...`);
});

app.use(function clientErrorHandler(err, req, res, next) {
  console.error(err);
  const locals = {
    error: 'Uh oh! Something went unexpectedly wrong. I guess that means no pizza ... 😞'
  };
  res.status(500).render('index', locals);
});
