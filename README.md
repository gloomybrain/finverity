# The task

## Functional requirements

Accept incoming HTTP requests containing one file each in the request body and upload these files to an S3 bucket.  
In case the file in the request body is an image the service is required to resize it to one of the following dimentions:  

- 2048 x 2048
- 1024 x 1024
- 300 x 300 (for thumbnails)

There should be just one endpoint in this service, e.g. `/{filename}`  
The `multipart/form-data` request header should not be supported, instead use `Content-Type`, e.g. `Content-Type: image/png`  
It is required to make acceptable file types and file extensions configurable, unsupported files should be declined  
The maximum acceptable file size should also be configurable

## Non-functional requirements

- the application RAM usage should not be related to the size of a file being processed
- the application configuration should be implemented through environment variables
