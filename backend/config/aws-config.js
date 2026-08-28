import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const S3_BUCKET = process.env.S3_BUCKET || 'nasir499';

export { s3, S3_BUCKET, PutObjectCommand, GetObjectCommand, ListObjectsV2Command };