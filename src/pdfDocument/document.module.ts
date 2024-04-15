import { Controller, Module } from "@nestjs/common";
import { PDFDoc } from "./document.entity";
import { PDFDocumentService } from "./document.service";
import { PDFDocumentCotroller } from "./document.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegularUser } from "src/user/regularU.entity";

@Module({
    imports: [TypeOrmModule.forFeature([PDFDoc,RegularUser])],
    controllers: [PDFDocumentCotroller],
    providers: [PDFDocumentService]

})
export class DocumentModule{}