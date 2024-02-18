import { IUserMessage, UserMessage } from '../../models/userMessage';
import { createError } from '../../utils/response';
import { FilterQuery } from 'mongoose';

export class UserMessageService {
  public async sendMessage(
    user: string,
    body: IUserMessage
  ): Promise<IUserMessage> {
    if (!body.user) throw createError('User is required', 400);
    if (!body.content) throw createError('Content is required', 400);
    body.sentBy = user;
    const userMessage = await new UserMessage(body).save();
    return await this.getUserMessage(userMessage._id.toString());
  }

  public async getUserMessage(id: string): Promise<IUserMessage> {
    const userMessage = await UserMessage.findById(id)
      .populate('user sentBy')
      .lean<IUserMessage>()
      .exec();
    if (!userMessage) throw createError('User message not found', 404);
    return userMessage;
  }

  public async getUserMessages(query: any): Promise<IUserMessage[]> {
    const filter: FilterQuery<IUserMessage> = {};
    if (query.user) {
      filter.user = query.user;
    }
    return await UserMessage.find(filter)
      .populate('user sentBy')
      .lean<IUserMessage[]>()
      .exec();
  }
}
