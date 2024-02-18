import { SQS } from 'aws-sdk';
import { config } from '../../config/config';
import { QueuePayload } from '../../models/queuePayload';
import { QueueURL } from '../../models/enums/queue';

const sqs = new SQS({
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsAccessKey,
  },
  region: 'us-east-1',
});

export class QueueService {
  addMessageToQueue(queueUrl: QueueURL, payload: QueuePayload) {
    this.addToQueueAsync(queueUrl, payload)
      .then((value) => {
        console.log(`>>> Queue created. Name: ${value}`);
      })
      .catch((err) => {
        console.error('>>> Error creating queue: ', err);
      });
  }

  async addToQueueAsync(
    queueUrl: QueueURL,
    payload: QueuePayload
  ): Promise<any> {
    console.log('>>> Adding to queue: ', queueUrl, payload);
    const record: SQS.Types.Message = {};
    record.Attributes;
    return sqs
      .sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(payload),
        MessageAttributes: {
          Content: {
            DataType: 'String',
            StringValue: payload.payload.content,
          },
        },
      })
      .promise();
  }

  async getMessagesInQueue(queueUrl: QueueURL): Promise<any> {
    return sqs
      .receiveMessage({
        QueueUrl: queueUrl,
      })
      .promise();
  }
}
