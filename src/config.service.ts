import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    private static readEnvString(varName: string): string {
        const value = process.env[varName];

        if (typeof value !== 'string' || value.length === 0) {
            throw new Error(`Unable to read environment variable ${varName}`);
        }

        return value;
    }

    private static readEnvList(varName: string): Set<string> {
        const value = ConfigService.readEnvString(varName);

        const result = value
            .split(',')
            .filter(key => key.length > 0)
            .reduce((set, key) => {
                set.add(key);

                return set;
            }, new Set<string>());

        return result;
    } 

    private static readEnvNumber(varName: string): number {
        const value = ConfigService.readEnvString(varName);
        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
            throw new Error(`Expecter env variable ${varName} to be a number, found ${value}`);
        }

        return numericValue;
    }

    readonly awsKey = ConfigService.readEnvString('AWS_ACCESS_KEY');
    readonly awsSecret = ConfigService.readEnvString('AWS_SECRET_ACCESS_KEY');
    readonly awsS3Bucket = ConfigService.readEnvString('AWS_S3_BUCKET_NAME');
    readonly acceptedMimeTypes = ConfigService.readEnvList('APP_ACCEPTED_CONTENT_TYPES');
    readonly maxFileSizeMb = ConfigService.readEnvNumber('APP_MAX_FILE_SIZE_MB');
    readonly supportedImageSizes: ReadonlyMap<string, { width: number, height: number }> = new Map([
        ['large', { width: 2048, height: 2048}],
        ['medium', { width: 1024, height: 1024}],
        ['thumb', { width: 300, height: 300}]
    ]);
    readonly imageMimeTypes = new Set(['image/jpeg', 'image/png']);
}
