// user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.users.length + 1,
      ...createUserDto,
    };
    this.users.push(user);
    return user;
  }
}
