const express = require('express');
const router = express.Router();
const { cars } = require('./cars.js');

/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object} resource An instance object from that collection
 * @returns
 */
function formatResponseData(type, resource) {
  const { id, ...attributes } = resource;
  return { type, id, attributes };
}

// define routes
app.get('/', (req, res) => {
  res.json({ data: cars.map((car) => formatResponseData('cars', car)) });
});

app.get('/:carId', (req, res) => {
  const id = parseInt(req.params.carId);
  const car = cars.find((car) => car.id === id);
  if (!car) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`,
        },
      ],
    });
  }
  res.json({ data: formatResponseData('cars', car) });
});

app.post('/', (req, res) => {
  const { data } = req.body;
  if (data?.type === 'cars') {
    const newCar = {
      ...data.attributes,
      id: Date.now(),
    };
    cars.push(newCar);
    res.status(201).json({ data: formatResponseData('cars', newCar) });
  } else {
    res.status(400).json({
      errors: [
        {
          status: '400',
          title: 'schema validation error',
          detail: `Expected resource type to be 'cars', got '${data?.type}'`,
          source: {
            pointer: '/data/type',
          },
        },
      ],
    });
  }
});

app.put('/:carId', (req, res) => {
  const id = parseInt(req.params.carId);
  const index = cars.findIndex((car) => car.id === id);
  if (index < 0) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`,
        },
      ],
    });
  }
  // process request
  const updatedCar = {
    ...req.body?.data?.attributes,
    id,
  };
  cars[index] = updatedCar;
  res.json({ data: formatResponseData('cars', updatedCar) });
});

app.patch('/:carId', (req, res) => {
  const id = parseInt(req.params.carId);
  const index = cars.findIndex((car) => car.id === id);
  if (index < 0) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`,
        },
      ],
    });
  }
  // process request
  const updatedCar = Object.assign(
    {},
    cars[index],
    req.body?.data?.attributes,
    { id }
  );
  cars[index] = updatedCar;
  res.json({ data: formatResponseData('cars', updatedCar) });
});

app.delete('/:carId', (req, res) => {
  const id = parseInt(req.params.carId);
  const index = cars.findIndex((car) => car.id === id);
  if (index < 0) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`,
        },
      ],
    });
  }
  const deletedCar = cars.splice(index, 1)[0];
  res.json({
    data: formatResponseData('cars', deletedCar),
    meta: { message: `Car with id: ${id} successfully deleted.` },
  });
});

module.exports = router;
