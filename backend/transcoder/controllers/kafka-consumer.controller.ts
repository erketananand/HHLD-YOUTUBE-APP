import KafkaConfig from "../utils/kafka.utils"

export const sendMessageToKafka = async () => {
    try {
        const kafkaconfig = new KafkaConfig()
        kafkaconfig.consume("transcode", (value: any)=>{
            console.log("got data from kafka : " , value)
        });
    } catch (error) {
        console.log(error)
    }
 }