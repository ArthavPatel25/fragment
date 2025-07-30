#!/bin/sh

# Setup steps for working with LocalStack and DynamoDB local instead of AWS.
# Assumes aws cli is installed and LocalStack and DynamoDB local are running.

echo "Setting AWS environment variables for LocalStack"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
echo "AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN"
echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"

# Wait for LocalStack to be ready
echo 'Waiting for LocalStack S3...'
until (curl --silent http://localhost:4566/_localstack/health | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
    sleep 5
done
echo 'LocalStack S3 Ready'

# Create the S3 bucket (ignore if exists)
echo "Creating LocalStack S3 bucket: fragments"
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments 2>/dev/null || echo "S3 bucket already exists"

# Delete existing DynamoDB table if it exists
echo "Checking if DynamoDB table exists..."
if aws --endpoint-url=http://localhost:8000 dynamodb describe-table --table-name fragments > /dev/null 2>&1; then
    echo "Table exists, deleting it..."
    aws --endpoint-url=http://localhost:8000 dynamodb delete-table --table-name fragments
    aws --endpoint-url=http://localhost:8000 dynamodb wait table-not-exists --table-name fragments
    echo "Table deleted"
fi

# Create the DynamoDB table
echo "Creating DynamoDB table: fragments"
aws --endpoint-url=http://localhost:8000 \
dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

# Wait until the table exists
aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments

echo "AWS resources setup complete!"