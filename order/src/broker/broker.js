const amqplib = require('amqplib')

let channel,  connection 
//connection -> server aur amqp ke bhich jo connection build ho rha hai vo hai 
// channel -> jo rabbit mq and notification service hai inn dono  ke bich jo connection hai uss pr multiple channel create kr skte hai aur use kr skte hai lkin ideally abhi toh ek channel hai baki ek se jyda bhi hoskte hai

async function connect(){
    if(connection) return connection;

    try{
        connection = await amqplib.connect(process.env.RABBIT_URL);
        console.log("Connected to RABBIT MQ")
        channel = await connection.createChannel();

    }catch(err){
        console.error("Error connecting to RabbitMQ",err)

    }

}


async function publishToQueue(queueName, data = {}){
    // queue mei data daalna hai 

    //connection  nahi hai toh connnect kroo server to rabbitmq
    if(!channel ||  !connection) await connect();

    //queue exists krta hai toh mssge daal degi aur nahi krta exists toh create krke daal degi mssge 
    //yahan yh hai ki channel ke through bta rhe hai ki kis queue mei daalna hai data ya queue  create kr rhe hai
    await channel.assertQueue(queueName,{
        durable: true
    })

    // buffer ya binary foramte mei data chiye rabbitmq ko aur data daal rha hai queue mei 
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
    console.log("Message sent to queue:",queueName,data)


}

async function subscribeToQueue(queueName, callback){
    //read krwana mssges ko koi se bhi queue se 


    if(!channel || !connection) await connect();

    await channel.assertQueue(queueName,{
        durable:true
    })

    channel.consume(queueName,async (msg)=>{
        if(msg !== null){
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg)
        }
    })
}

module.exports = {
    connect,channel,connection,publishToQueue,subscribeToQueue
}