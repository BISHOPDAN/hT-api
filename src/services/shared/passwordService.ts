import { IPassword, Password } from '../../models/password';
import { compareSync, hashSync } from 'bcryptjs';
import { getUpdateOptions } from '../../utils/utils';
import { createError } from '../../utils/response';

export class PasswordService {
  public async addPassword(
    userId: string,
    password: string,
    temporary = false
  ): Promise<IPassword> {
    return await Password.findOneAndUpdate(
      { userId },
      {
        password: hashSync(password, 8),
        temporary,
        rawPassword: temporary ? password : null,
      },
      getUpdateOptions()
    )
      .lean<IPassword>()
      .exec();
  }

  public async changePassword(
    userId: string,
    password: string
  ): Promise<IPassword> {
    return await Password.findOneAndUpdate(
      { userId },
      { password: hashSync(password, 8) },
      getUpdateOptions()
    )
      .lean<IPassword>()
      .exec();
  }

  public async getPassword(userId: string): Promise<string> {
    const password: IPassword = await Password.findOne({ userId })
      .lean<IPassword>()
      .exec();
    return password ? password.password : null;
  }

  public async getPasswordObject(userId: string): Promise<IPassword> {
    return await Password.findOne({ userId }).lean<IPassword>().exec();
  }

  public async getPasswordByRawPassword(
    passwordString: string
  ): Promise<IPassword> {
    const password: IPassword = await Password.findOne({
      rawPassword: passwordString,
    })
      .lean<IPassword>()
      .exec();
    if (!password) throw createError('Password not found', 400);
    return password;
  }

  public async checkPassword(
    userId: string,
    passwordAttempt
  ): Promise<boolean> {
    const password: string = await this.getPassword(userId);
    return password && compareSync(passwordAttempt, password);
  }
}
