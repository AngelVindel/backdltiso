/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { RegularUser } from './regularU.entity';
import { Answer } from 'src/answers/answers.entity';
import { Question } from 'src/questions/questions.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(RegularUser)
    private regularUserRepository: Repository<RegularUser>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.regularUserRepository.create(createUserDto);
    return await this.regularUserRepository.save(newUser);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.regularUserRepository.find();
  }

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const newUser = this.regularUserRepository.create({
      username,
      email,
      password,
    });
    return await this.regularUserRepository.save(newUser);
  }
  async getEmailUsers(email: string) {
    return await this.regularUserRepository.find({ where: { email } });
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.regularUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.regularUserRepository.delete(id);
  }

  async updateUser(id: number, updateField: UpdateUserDto): Promise<User> {
    const user = await this.regularUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.regularUserRepository.merge(user, updateField);
    return await this.regularUserRepository.save(user);
  }

  async addAnswerToUser(userId: number, answerId: number): Promise<User> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['chosenAnswers', 'chosenAnswers.question'],
    });
    const answerToAdd = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question'],
    });

    if (!user || !answerToAdd) {
      throw new Error('User or Answer not found');
    }

    const alreadySelected = user.chosenAnswers.some(
      (answer) => answer.id === answerId,
    );
    if (alreadySelected) {
      throw new Error('User has already selected this answer');
    }

    const questionId = answerToAdd.question.id;
    const answerFromSameQuestion = user.chosenAnswers.some(
      (answer) => answer.question.id === questionId,
    );
    if (answerFromSameQuestion) {
      throw new Error('User has already selected an answer from this question');
    }

    user.chosenAnswers.push(answerToAdd);
    await this.regularUserRepository.save(user);
    return user;
  }

  async deleteAnswersToUser(userId: number) {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['chosenAnswers'],
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    user.chosenAnswers = [];

    await this.regularUserRepository.save(user);
  }

  async getAnswersToUser(userId: number): Promise<any[]> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['chosenAnswers', 'chosenAnswers.question'],
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const results = user.chosenAnswers.reduce((acc, answer) => {
      const questionId = answer.question.id;
      if (!acc[questionId]) {
        acc[questionId] = {
          question: answer.question.text,
          answers: [],
        };
      }
      acc[questionId].answers.push(answer.text);
      return acc;
    }, {});

    return Object.values(results);
  }
}
