'use strict';
// load dependencies

const morgan = require('morgan');
const express = require('express');
const carsRouter = require('./carsRouter.js');

// create the express app
const app = express();

// configure express middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use('/api/cars', carsRouter);

// start listening for HTTP requests
const port = process.env.port || 3030;
app.listen(port, () => console.log(`Server listening on port ${port} ...`));
