import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { RegularUser } from './regularU.entity';
import { PDFDoc } from 'src/pdfDocument/document.entity';
import { PDFDocumentService } from 'src/pdfDocument/document.service';
import { DocumentPdfDto } from 'src/pdfDocument/dto/document-pdf.dto';
import { Question } from 'src/questions/questions.entity';
import { WordDoc } from 'src/wordDocument/wordDocu.entity';
import { DocuDto, UpdateDocuDto } from 'src/wordDocument/dto/wordDocu.dto';
import { WordService } from 'src/wordDocument/wordDocu.service';
import { WordService2 } from 'src/wordDocument/wordDocu2.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(RegularUser)
    private regularUserRepository: Repository<RegularUser>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(WordDoc)
    private wordRepository: Repository<WordDoc>,

    private pdfService: PDFDocumentService,

    private wordService: WordService,

    private wordService2: WordService2,
  ) { }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.regularUserRepository.create(createUserDto);
    return await this.regularUserRepository.save(newUser);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.regularUserRepository.find();
  }

  async createUser(username: string, email: string, password: string): Promise<User> {
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
    await this.regularUserRepository.remove(user);
  }

  async updateUser(id: number, updatedFields: UpdateUserDto): Promise<User> {
    // Buscar el usuario en la base de datos por su ID
    const user = await this.regularUserRepository.findOne({ where: { id } });

    // Si el usuario no se encuentra, lanzar una excepción NotFoundException
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verificar si se proporcionan las contraseñas actual (actualPassword) y nueva (newPassword) en los campos actualizados
    if (updatedFields.actualPassword && updatedFields.newPassword) {
      // Comparar la contraseña actual proporcionada con la contraseña almacenada en la base de datos
      const passwordMatches = await bcrypt.compare(updatedFields.actualPassword, user.password);

      // Si las contraseñas no coinciden, lanzar una excepción BadRequestException
      if (!passwordMatches) {
        throw new BadRequestException('Actual password is incorrect');
      }

      // Hashear la nueva contraseña
      const hashedNewPassword = await bcrypt.hash(updatedFields.newPassword, await bcrypt.genSalt());

      // Asignar la nueva contraseña hasheada al campo de contraseña del usuario
      user.password = hashedNewPassword;

      // Eliminar las contraseñas del objeto updatedFields para evitar sobrescribir la contraseña hasheada más adelante
      delete updatedFields.newPassword;
      delete updatedFields.actualPassword;
    }

    // Asignar los campos actualizados restantes al usuario
    Object.assign(user, updatedFields);

    // Guardar el usuario actualizado en la base de datos y devolver el usuario actualizado
    return await this.regularUserRepository.save(user);
  }





  async getUserById(id: number): Promise<User> {
    const user = await this.regularUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
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

  async getQuestionsByUserId(userId: number) {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['questions']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.questions;
  }

  async getUserPdfs(userId: number): Promise<PDFDoc[]> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['documents']
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user.documents;
  }

  async newUserPdf(userId: number, dto: DocumentPdfDto): Promise<PDFDoc> {

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
      generated_p: dto.generated_p,
      recommended_p: dto.recommended_p,
      risk_recomenmended: dto.risk_recomenmended

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
      generated_p: dto.generated_p,
      recommended_p: dto.recommended_p,
      risk_recomenmended: dto.risk_recomenmended

    };


    return this.pdfService.updatePdf(pdfId, documentPdfDto);
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


  async getUserDocuments(userId: number): Promise<{ id: number, type: number }[]> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['wordDocuments']
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user.wordDocuments.map(doc => ({
      id: doc.id,
      type: doc.type
    }));
  }

  async newUserDocument(userId: number, dto: DocuDto, type: number): Promise<WordDoc> {

    if (!userId) {
      throw new Error('UserID cannot be null or undefined');
    }

    const user = await this.regularUserRepository.findOne({ where: { id: userId }, relations: ['wordDocuments'] });
    if (!user) {
      throw new Error('User not found');
    }

    const documentDto: DocuDto = {
      userId: user.id,
      nombreEmpresa: dto.nombreEmpresa,
      realizadoPor: dto.realizadoPor,
      revisadoPor: dto.revisadoPor,
      aprobadoPor: dto.aprobadoPor,
      textIA: dto.textIA,
      estado: dto.estado,

    };

    var word: WordDoc;
    switch (type) {
      case 1:
        word = await this.wordService.generateWordDocumentPSI(documentDto)
        break;
      case 2:
        word = await this.wordService2.generateWordDocumentSGSI(documentDto)
        break;
      default:
        throw new Error('Invalid route')

    }

    if (word && word.content && word.content.length > 0) {
      user.wordDocuments.push(word);
      await this.regularUserRepository.save(user);
    } else {
      throw new Error('Failed to create PDF');
    }

    return word;
  }

  async updateUserDocument(userId: number, documentId: number, dto: UpdateDocuDto): Promise<WordDoc> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['wordDocuments']
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const document = user.wordDocuments.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    switch (document.type) {
      case 1:
        return await this.wordService.updateUserDocument(userId, documentId, dto)
      case 2:
        return await this.wordService2.updateUserDocument(userId, documentId, dto)
      default:
        throw new Error('Word not found')

    }

  }

  async deleteUserWord(userId: number, wordId: number): Promise<void> {

    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['wordDocuments']
    });

    if (!user) {

      throw new Error('User not found');
    }
    const word = user.wordDocuments.find(doc => doc.id === Number(wordId));

    if (!word) {

      throw new Error('Word not found or not owned by user');
    }

    switch (word.type) {
      case 1:
        await this.wordService.deleteWord(wordId)
        break;
      case 2:
        await this.wordService2.deleteWord(wordId)
        break;
      default:
        throw new Error('Word not found')

    }

  }

  async downloadUserWord(userId: number, wordId: number): Promise<any> {
    const user = await this.regularUserRepository.findOne({
      where: { id: userId },
      relations: ['wordDocuments']
    });

    const word = user.wordDocuments.find(doc => doc.id === Number(wordId));

    if (!word) {
      throw new Error('Word not found or not owned by user');
    }
    var download
    switch (word.type) {
      case 1:
        return await this.wordService.downloadWord(wordId)
        break;
      case 2:
        return await this.wordService2.downloadWord(wordId)
        break;
      default:
        throw new Error('Word not found')

    }


    return download;

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



  

