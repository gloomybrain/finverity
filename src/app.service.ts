import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { ConfigService } from './config.service';

@Injectable()
export class AppService {

    static get CONTENT_DISPOSITION(): string {
        return 'inline';
    }

    static get ACL(): string {
        return 'public-read';
    }

    private readonly s3;

    constructor(private readonly config: ConfigService) {
        this.s3 = new S3({
            accessKeyId: this.config.awsKey,
            secretAccessKey: this.config.awsSecret
        });
    }

    async upload(fileName: string, file: Readable, mimeType: string): Promise<S3.ManagedUpload.SendData> {
        const s3Response = await this.s3.upload({
            Key: fileName,
            Body: file,
            ContentType: mimeType,
            Bucket: this.config.awsS3Bucket,
            ACL: AppService.ACL,
            ContentDisposition: AppService.CONTENT_DISPOSITION,
        }).promise();

        return s3Response;
    }
}
