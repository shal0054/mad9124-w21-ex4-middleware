'use strict'
// load dependencies
const {cars} = require('./cars.js')
const express = require('express')

// create the express app
const app = express()

// configure express middleware
app.use(express.json())

/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object} resource An instance object from that collection
 * @returns
 */
function formatResponseData(type, resource) {
  const {id, ...attributes} = resource
  return {type, id, attributes}
}

// define routes
app.get('/api/cars', (req, res) => {
  res.json({data: cars.map(car => formatResponseData('cars', car))})
})

app.get('/api/cars/:carId', (req, res) => {
  const id = parseInt(req.params.carId)
  const car = cars.find(car => car.id === id)
  if (!car) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`
        }
      ]
    })
  }
  res.json({data: formatResponseData('cars', car)})
})

app.post('/api/cars', (req, res) => {
  const {data} = req.body
  if (data?.type === 'cars') {
    const newCar = {
      ...data.attributes,
      id: Date.now()
    }
    cars.push(newCar)
    res.status(201).json({data: formatResponseData('cars', newCar)})
  } else {
    res.status(400).json({
      errors: [
        {
          status: '400',
          title: 'schema validation error',
          detail: `Expected resource type to be 'Car', got '${data?.type}'`,
          source: {
            pointer: '/data/type'
          }
        }
      ]
    })
  }
})

app.put('/api/cars/:carId', (req, res) => {
  const id = parseInt(req.params.carId)
  const index = cars.findIndex(car => car.id === id)
  if (index < 0) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`
        }
      ]
    })
  }
  // process request
  const updatedCar = {
    ...req.body?.data?.attributes,
    id
  }
  cars[index] = updatedCar
  res.json({data: formatResponseData('cars', updatedCar)})
})

app.patch('/api/cars/:carId', (req, res) => {
  const id = parseInt(req.params.carId)
  const index = cars.findIndex(car => car.id === id)
  if (index < 0) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`
        }
      ]
    })
  }
  // process request
  const updatedCar = Object.assign(
    {},
    cars[index],
    req.body?.data?.attributes,
    {id}
  )
  cars[index] = updatedCar
  res.json({data: formatResponseData('cars', updatedCar)})
})

app.delete('/api/cars/:carId', (req, res) => {
  const id = parseInt(req.params.carId)
  const index = cars.findIndex(car => car.id === id)
  if (index < 0) {
    res.status(404).send({
      errors: [
        {
          status: '404',
          title: 'Resource does not exist',
          description: `We could not find a car with id: ${id}`
        }
      ]
    })
  }
  const deletedCar = cars.splice(index, 1)[0]
  res.json({
    data: formatResponseData('cars', deletedCar),
    meta: {message: `Car with id: ${id} successfully deleted.`}
  })
})

// start listening for HTTP requests
const port = process.env.port || 3030
app.listen(port, () => console.log(`Server listening on port ${port} ...`))
