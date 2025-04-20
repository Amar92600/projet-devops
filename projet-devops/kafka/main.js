import { Kafka } from 'kafkajs'
import mqtt from 'mqtt'

const BROKER_1 = process.env.BROKER_1 || 'kafka:9092'
const BROKER_2 = process.env.BROKER_2 || 'kafka:9092'
const BROKER_3 = process.env.BROKER_3 || 'kafka:9092'
const KAFKA_TOPIC = process.env.TOPIC || 'stock'

const MQTT_TOPIC = process.env.TOPIC || 'topic'
const MQTT_ADDRESS = process.env.MQTT_ENDPOINT || 'ws://localhost:1883'

const log = (...str) => console.log(`${new Date().toUTCString()}: `, ...str)
const error = (...str) => console.error(`${new Date().toUTCString()}: `, ...str)

log('connecting to ', MQTT_ADDRESS)
log('connecting to ', BROKER_1, BROKER_2, BROKER_3)

const kafka = new Kafka({
  clientId: 'stock-producer',
  brokers: [BROKER_1, BROKER_2, BROKER_3],
})

const producer = kafka.producer()
const client = mqtt.connect(MQTT_ADDRESS)
await producer.connect()
log('connected to ' + BROKER_1)

client.subscribe(MQTT_TOPIC, (err) => {
  if (!err) log('connected to ', MQTT_ADDRESS, 'at topic ', MQTT_TOPIC)
  else error(err)
})

async function sendToKafka(topic, key, value) {
  return new Promise((resolve, reject) => {
    producer
      .send({
        topic,
        messages: [{ key, value }],
      })
      .then((result) => {
        log(`Message sent successfully: ${key}`)
        resolve(result)
      })
      .catch((err) => {
        log(`Error sending message: ${err}`)
        reject(err)
      })
  })
}

client.on('message', async (topic, message) => {
  log(`message from ${topic}: ${message.toString()}`)
  await sendToKafka(KAFKA_TOPIC, '1', message.toString())
  log('send to kafka')
})
