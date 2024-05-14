/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './adminU.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserInitService {
  constructor(
    @InjectRepository(AdminUser) private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  

  // En UserInitService
  async createAdminUser() {
    const adminUsername = 'admin';
    const adminUser = await this.adminUserRepository.findOne({
      where: { username: adminUsername },
    });
  
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('nextjs', 10);
      const newAdmin: AdminUser = {
        id: 1,
        username: adminUsername,
        password: hashedPassword,  
        email: 'next@next',
        activation_token: null,
        activated: true,
        tickets: null,
      };
  
      await this.adminUserRepository.save(newAdmin); 
      console.log('Usuario admin creado');
    } else {
      console.log('Usuario admin ya existe');
    }
  }
  
}
 