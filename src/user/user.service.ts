/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { RegularUser } from './regularU.entity';

@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(RegularUser)
        private regularUserRepository: Repository<RegularUser>
    ) {}

      async signup(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.regularUserRepository.create(createUserDto);
        return await this.regularUserRepository.save(newUser);
      }

      async getAllUsers(): Promise<User[]> {
        return await this.regularUserRepository.find();
      }

      async createUser(username: string, email: string, password: string): Promise<User> {
        const newUser = this.regularUserRepository.create({ username, email, password });
        return await this.regularUserRepository.save(newUser);
      }
      async getEmailUsers(email:string) {       
        return await this.regularUserRepository.find({where: {email}})
      }

  async deleteUser(id: number): Promise<void> {
    const user = await this.regularUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    await this.regularUserRepository.delete(id);
  }

  async updateUser(id: number, updateField: UpdateUserDto): Promise<User> {
    const user = await this.regularUserRepository.findOne({where: { id }});
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    this.regularUserRepository.merge(user, updateField);
    return await this.regularUserRepository.save(user);
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
   getEmailUsers(email:string){
    return this.users.filter(user=>user.email==email)
   } 
}
