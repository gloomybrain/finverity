import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('upload')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    uploadFile(): string {
        return this.appService.upload(file);
    }
}
