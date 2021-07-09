import { BadRequestException, Controller, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { Readable } from 'stream';
import { S3 } from 'aws-sdk';
import { AppService } from './app.service';
import { ConfigService } from './config.service';
import { Request } from 'express';
import sharp = require('sharp');

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
        @Query('size') imageSize: string | undefined,
        @Req() request: Request
    ): Promise<S3.ManagedUpload.SendData | null> {
        this.checkFileSize(fileSize);
        this.checkMimeType(mimeType);
        this.checkImageSize(imageSize);

        const fileStream = this.getFileStream(mimeType, imageSize, request);

        return this.appService.upload(fileName, fileStream, mimeType);
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

    private checkMimeType(mimeType: string) {
        const acceptableMimeTypes = this.config.acceptedMimeTypes;
        if (!acceptableMimeTypes.has(mimeType)) {
            const errorMessage = `${mimeType} is not an acceptable MIME type: [${acceptableMimeTypes.toString()}]`;

            throw new BadRequestException({ error: errorMessage });
        }
    }

    private checkImageSize(imageSize: string | undefined) {
        if (typeof imageSize === 'undefined') {
            return;
        }

        const supportedImageSizes = this.config.supportedImageSizes;
        if (supportedImageSizes.has(imageSize)) {
            return;
        }

        const errorMessage = `Unsupported image size: ${imageSize}`;

        throw new BadRequestException({ error: errorMessage });
    }

    private getFileStream(mimeType: string, imageSize: string | undefined, request: Request): Readable {
        if (typeof imageSize === 'undefined') {
            return request;
        }

        const imageMimeTypes = this.config.imageMimeTypes;
        if (!imageMimeTypes.has(mimeType)) {
            return request;
        }

        const supportedImageSizes = this.config.supportedImageSizes;
        const dimensions = supportedImageSizes.get(imageSize) as { width: number, height: number };
        const transformer = sharp().resize({fit: sharp.fit.contain, ...dimensions});

        return request.pipe(transformer);
    }
}
