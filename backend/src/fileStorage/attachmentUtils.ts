import { S3Client, PutObjectCommand} from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function getUploadUrl(todoId: string): Promise<string> {

    const client = new S3Client({ region: 'us-east-1' })
    const command = new PutObjectCommand({
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: todoId
    });

    const url = await getSignedUrl(client, command, { expiresIn: 300 });

    return url
}

