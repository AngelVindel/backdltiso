// user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private  users: User[] = [];

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.users.length + 1,
      ...createUserDto,
    };
    this.users.push(user);
    return user;
  }
    getAllUsers(){
    return this.users;
   } 

   createUser(username:string, email:string,password:string){ 
    const user = {
        id:this.users.length+1,
        username,
        email,
        password,

    }
    this.users.push(user);
    return user;

   }
   deleteUser(id: number){
    this.users=this.users.filter(user=> user.id!=id)
   }

   getUserById(id:number ): User{
    return this.users.find(user=>user.id==id)
   }

   updateUser(id: number, updateField: UpdateUserDto):User{
    const user= this.getUserById(id);

    const newUser=Object.assign(user,updateField)

    this.users=this.users.map(user=>user.id==id ? newUser: user)

    return newUser;
   }
}
