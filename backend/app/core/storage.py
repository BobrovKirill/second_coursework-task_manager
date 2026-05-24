import boto3
from botocore.client import Config
from app.core.config import settings

s3 = boto3.client(
    "s3",
    endpoint_url=settings.MINIO_ENDPOINT,
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="us-east-1"
)


def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    s3.put_object(
        Bucket=settings.MINIO_BUCKET,
        Key=filename,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{filename}"


def delete_file(filename: str) -> None:
    s3.delete_object(Bucket=settings.MINIO_BUCKET, Key=filename)