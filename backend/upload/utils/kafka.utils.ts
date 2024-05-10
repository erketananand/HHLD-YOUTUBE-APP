import {Consumer, Kafka, Message, Producer, KafkaMessage} from "kafkajs"
import fs from "fs"
import path from "path"

class KafkaConfig {
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;
   constructor(){
       this.kafka = new Kafka({
           clientId: process.env.KAFKA_CLIENT_ID as string,
           brokers: [process.env.KAFKA_BROKER as string],
           ssl: {
               ca: [fs.readFileSync(path.resolve("./ca.cer"), "utf-8")]
           },
           sasl: {
               username: process.env.KAFKA_USERNAME as string,
               password: process.env.KAFKA_PASSWORD as string,
               mechanism: "plain"
           }
       })
       this.producer = this.kafka.producer()
       this.consumer = this.kafka.consumer({groupId: process.env.KAFKA_GROUP_ID as string})
   }

   async produce(topic: string, messages: Message[]){
       try {
           await this.producer.connect();
           await this.producer.send({
               topic: topic,
               messages: messages
           })     
       } catch (error) {
           console.log(error)
       }finally{
           await this.producer.disconnect()
       }  }

   async consume(topic: string, callback: Function){
       try {
           await this.consumer.connect()
           await this.consumer.subscribe({topic: topic, fromBeginning: true})
           await this.consumer.run({
               eachMessage: async({
                   topic, partition, message
               }) =>{
                   const value = (message.value as Buffer).toString()
                   callback(value)
               }
           })
       } catch (error) {
           console.log(error)
       }
   }
}
export default KafkaConfig;