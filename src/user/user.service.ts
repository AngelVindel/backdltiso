/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { RegularUser } from './regularU.entity';
import { PDFDoc } from 'src/pdfDocument/document.entity';
import { PDFDocumentService } from 'src/pdfDocument/document.service';
import { DocumentPdfDto } from 'src/pdfDocument/dto/document-pdf.dto';
import { AdminUser } from './adminU.entity';
import { hash } from 'bcrypt';
import { Question } from 'src/questions/questions.entity';
import { QuestionsService } from 'src/questions/questions.service';
import { questionData } from 'src/questions/dto/opQuestion.dto';


@Injectable()
export class UserService {

 
    
    constructor(
        @InjectRepository(RegularUser)
        private regularUserRepository: Repository<RegularUser>,
        
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,

        @InjectRepository(AdminUser)
        private adminRepository: Repository<AdminUser>,

        private  pdfService: PDFDocumentService,

        private questionService: QuestionsService
    ) {}


  async signup(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.regularUserRepository.create(createUserDto);
    return await this.regularUserRepository.save(newUser);
  }

  async createAdminUser(): Promise<User> {
    const adminExist = await this.adminRepository.findOne({ where: { username: 'admin' } });
    if (adminExist) {
        return null;  
    }

    const hashedPassword = await hash("admin10", 10);
    const admin = this.adminRepository.create({
        id: 1,
        username: 'admin',
        activated: true,
        email: 'admin@gmail.com',
        password: hashedPassword
    });

    await this.adminRepository.save(admin);
    console.log('Admin user created successfully');
    return admin;
}

async onModuleInit() {
  await this.createAdminUser();
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
  async getUserById(userId: number):Promise<User>{
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
    });
    if(!user){
      throw new Error('User not found');

    }
    return user;
  }


  async postNewQuestion(userId: number, text: string){

    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['questions']
    });
    if(!user){
      throw new Error('User not found');

    }
   const  questionDttt : questionData= await this.questionService.postNewQuestion(userId,text);
console.log(questionDttt.answer);
    //user.questions.push(question);
    // this.regularUserRepository.save(user);
    return questionDttt.answer;

  }
  async deleteQuestion(userId: number, questionId: number): Promise<void> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['questions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const question = user.questions.find(q => q.id === questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    user.questions = user.questions.filter(q => q.id !== questionId);
    await this.regularUserRepository.save(user);
    await this.questionRepository.delete(questionId); 
  }
  async getQuestionsByUserId(userId: number){
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['questions']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.questions; 
  }




  async getUserDocuments(userId: number): Promise<PDFDoc[]> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['documents']
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user.documents;
  }

  async newUserDocument(userId: number, dto: DocumentPdfDto): Promise<PDFDoc> {
    
    if (!userId) {
      throw new Error('UserID cannot be null or undefined');
    }
  
    const user = await this.regularUserRepository.findOne({ where: { id: userId }, relations: ['documents'] });
    if (!user) {
      throw new Error('User not found');
    }
    
    const documentPdfDto: DocumentPdfDto = {
      userId: user.id, 
      creationDate: new Date(), 
      modifyDate: new Date(),
      generated_p:dto.generated_p,
      recommended_p:dto.recommended_p,
      risk_recomenmended:dto.risk_recomenmended
      
    };
  
    const pdf = await this.pdfService.createPdf(documentPdfDto);
  
    if (pdf && pdf.content && pdf.content.length > 0) {
      user.documents.push(pdf); 
      await this.regularUserRepository.save(user); 
    } else {
      throw new Error('Failed to create PDF');
    }
  
    return pdf; 
  }

  
  async deleteUserPdf(userId: number, pdfId: number): Promise<void> {

    const user = await this.regularUserRepository.findOne({
        where: { id: userId },
        relations: ['documents']
    });

    if (!user) {

      throw new Error('User not found');
    }
    const pdf = user.documents.find(doc => doc.id === Number(pdfId));
    
    if (!pdf) {

      throw new Error('PDF not found or not owned by user');
    }

    await this.pdfService.deletePdf(pdfId);
}

  async updateUserPdf(userId: number, pdfId: number, dto: DocumentPdfDto): Promise<PDFDoc> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['documents']
    });

    if (!user) {
      throw new Error('User not found');
    }
  
    const pdf = user.documents.find(doc => doc.id === Number(pdfId));
    if (!pdf) {
      throw new Error('PDF not found or not owned by user');
    }
    
    const documentPdfDto: DocumentPdfDto = {
      userId: user.id, 
      creationDate: new Date(), 
      modifyDate: new Date(),
      generated_p:dto.generated_p,
      recommended_p:dto.recommended_p,
      risk_recomenmended:dto.risk_recomenmended
      
    };


    return this.pdfService.updatePdf(pdfId, documentPdfDto);
  }
  async downloadUserPdf(userId: number, pdfId: number): Promise<Buffer> {
    const user = await this.regularUserRepository.findOne({
        where: { id: userId },
        relations: ['documents']
    });

   const pdf = user.documents.find(doc => doc.id === Number(pdfId));

if (!pdf) {
    throw new Error('PDF not found or not owned by user');
}

    return this.pdfService.downloadPdf(Number(pdfId));

}
}

  /*

  async addAnswerToUser(userId: number, answerId: number) {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['chosenAnswers', 'chosenAnswers.question']
    });
    const answerToAdd = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question']
    });
  
    if (!user || !answerToAdd) {
      throw new Error('User or Answer not found');
    }
  
    const alreadySelected = user.chosenAnswers.some(answer => answer.id === answerId);
    if (alreadySelected) {
      throw new Error('User has already selected this answer');
    }
  
    const questionId = answerToAdd.question.id;
    const answerFromSameQuestion = user.chosenAnswers.some(answer => answer.question.id === questionId);
    if (answerFromSameQuestion) {
      throw new Error('User has already selected an answer from this question');
    }
  
    user.chosenAnswers.push(answerToAdd);
    await this.regularUserRepository.save(user);
    return answerToAdd;
  }

  async deleteAnswersToUser(userId: number){
    const user =await this.regularUserRepository.findOne({
      where: { id: userId},
      relations: [ 'chosenAnswers']
    })
    if(!user){
      throw new Error(`User with ID ${userId} not found`);
  }
  user.chosenAnswers=[];

  await this.regularUserRepository.save(user);
}



  async getAnswersToUser(userId: number):Promise<any[]> {
    const user = await this.regularUserRepository.findOne({
      where: { id:userId },
      relations: ['chosenAnswers','chosenAnswers.question']
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const results = user.chosenAnswers.reduce((acc, answer) => {
      const questionId = answer.question.id; 
      if (!acc[questionId]) {
          acc[questionId] = {
              question: answer.question.text,
              answers: []
          };
      }
      acc[questionId].answers.push(answer.text);
      return acc;
  }, {});

  return Object.values(results);
  }
  */



  

