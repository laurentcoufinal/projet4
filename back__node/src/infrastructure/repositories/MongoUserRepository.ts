import type { User } from '../../domain/entities/User';
import type { CreateUserInput, UserRepository } from '../../domain/ports/UserRepository';
import { UserModel } from '../db/schemas/UserModel';

function toUser(doc: any): User {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const created = await UserModel.create(input);
    return toUser(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    return user ? toUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).exec();
    return user ? toUser(user) : null;
  }
}
