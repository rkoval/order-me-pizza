import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import serveStatic from 'serve-static';
import logger from 'morgan';
import bodyParser from 'body-parser';
import compression from 'compression';
import routes from './routes.js';
import {fileURLToPath} from 'url';

const app = express();
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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
app.use(bodyParser.urlencoded({extended: true}));
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
    error: 'Uh oh! Something went unexpectedly wrong. I guess that means no pizza ... 😞',
  };
  res.status(500).render('index', locals);
});
