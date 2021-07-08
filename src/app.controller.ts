import { BadRequestException, Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { Readable } from 'stream';
import { S3 } from 'aws-sdk';
import { AppService } from './app.service';
import { ConfigService } from './config.service';

@Controller('upload')
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly config: ConfigService
    ) {}

    @Post(':fileName')
    async uploadFile(
        @Headers('Content-Type') mimeType: string,
        @Headers('Content-Length') fileSize: string,
        @Param('fileName') fileName: string,
        @Body() file: Readable
    ): Promise<S3.ManagedUpload.SendData | null> {
        this.checkMimeType(mimeType);
        this.checkFileSize(fileSize);

        return this.appService.upload(fileName, file, mimeType);
    }

    private checkMimeType(mimeType: string) {
        const acceptableMimeTypes = this.config.acceptedContentTypes;
        if (!acceptableMimeTypes.includes(mimeType)) {
            const errorMessage = `${mimeType} is not an acceptable MIME type: [${acceptableMimeTypes.toString()}]`;

            throw new BadRequestException({ error: errorMessage });
        }
    }

    private checkFileSize(fileSizeHeader: string) {
        const fileSize = Number(fileSizeHeader);
        if (!Number.isFinite(fileSize)) {
            const errorMessage = `Expected file size to be a valid number, got ${fileSizeHeader} instead`;

            throw new BadRequestException({ error: errorMessage });
        }

        const maxFileSize = this.config.maxFileSizeMb * 1024;
        if (fileSize > maxFileSize) {
            const errorMessage = `File size exceeds the limit of ${maxFileSize}mb`;

            throw new BadRequestException({ error: errorMessage });
        }
    }
}
