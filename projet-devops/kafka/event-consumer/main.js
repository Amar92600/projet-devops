import { Kafka } from 'kafkajs'
const BROKER_1 = process.env.BROKER_1 || 'localhost:9092'
const BROKER_2 = process.env.BROKER_2 || 'localhost:9092'
const BROKER_3 = process.env.BROKER_3 || 'localhost:9092'
const TOKEN = process.env.STRAPI_TOKEN || '848ea6f520d01907dba57ffe9ce6eb90a7d41400bc6e1dc422ab9e33508f937c8283392ad5f4b8f353cd4777e023a38c2c8fe925b0660f2c232f77a55bf406769a58c255f3c8f84ce68186d1629ec892d49c3c74d254be650b3e1aecc9bf6462343c208a10baa028d06d53b42bb6b38a8eeb43ad76985021c6846b525eed7030'
const STRAPI_URL = process.env.STRAPI_URL || 'http://strapi:1337'
const TOPIC = process.env.TOPIC || 'event'
const BEGINNING = process.env.BEGINNING == 'true' || 'false'
const ERROR_TOPIC = process.env.ERROR_TOPIC || 'errors'

const log = (...str) => console.log(`${new Date().toUTCString()}: `, ...str)

const kafka = new Kafka({
  clientId: 'event-consumer',
  brokers: [BROKER_1, BROKER_2, BROKER_3],
})

const consumer = kafka.consumer({ groupId: 'event-creator' })
const producer = kafka.producer()

const consume = async () => {
  await Promise.all([consumer.connect(), producer.connect()])
  await consumer.subscribe({ topic: TOPIC, fromBeginning: BEGINNING })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const strProduct = message.value.toString()
        const event = JSON.parse(strProduct)
        log('creating', strProduct)
        log(event.name, await createEvent(event))
        log('created', strProduct)
      } catch (error) {
        if (ERROR_TOPIC)
          producer.send({
            topic: ERROR_TOPIC,
            messages: [{ value: { error, message } }],
          })
      }
    },
  })
}

const createEvent = async (event) => {
  const res = await fetch(STRAPI_URL + '/api/events', {
    method: 'POST',
    body: JSON.stringify({
      data: event,
    }),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
  })
  if (res.status === 200) {
    const response = await res.json()
    return response
  }
  return 'error'
}

await consume()
