#!/bin/bash

# Wait for services and set up AWS resources for local development

echo "Setting AWS environment variables for LocalStack"
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
echo "AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN"
echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"

# Wait for LocalStack S3 to be ready
echo "Waiting for LocalStack S3..."
until aws s3 ls --endpoint-url=http://localhost:4566 --region us-east-1 2>/dev/null; do
  sleep 1
done
echo "LocalStack S3 Ready"

# Create S3 buckets
echo "Creating LocalStack S3 bucket: fragments"
aws s3 mb s3://fragments --endpoint-url=http://localhost:4566 --region us-east-1 2>/dev/null || echo "Bucket 'fragments' already exists or failed to create"

echo "Creating LocalStack S3 bucket: arthav-fragments"
aws s3 mb s3://arthav-fragments --endpoint-url=http://localhost:4566 --region us-east-1 2>/dev/null || echo "Bucket 'arthav-fragments' already exists or failed to create"

# Verify buckets were created
echo "Verifying S3 buckets:"
aws s3 ls --endpoint-url=http://localhost:4566 --region us-east-1

# Check if DynamoDB table exists
echo "Checking if DynamoDB table exists..."
aws dynamodb describe-table --table-name fragments --endpoint-url=http://localhost:8000 --region us-east-1 2>/dev/null

# If table doesn't exist, create it
if [ $? -ne 0 ]; then
  echo "Creating DynamoDB table: fragments"
  aws dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
      AttributeName=ownerId,AttributeType=S \
      AttributeName=id,AttributeType=S \
    --key-schema \
      AttributeName=ownerId,KeyType=HASH \
      AttributeName=id,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
    --endpoint-url=http://localhost:8000 \
    --region us-east-1
else
  echo "DynamoDB table 'fragments' already exists"
fi

echo "AWS resources setup complete!"
echo ""
echo "Available S3 buckets:"
aws s3 ls --endpoint-url=http://localhost:4566 --region us-east-1
echo ""
echo "DynamoDB tables:"
aws dynamodb list-tables --endpoint-url=http://localhost:8000 --region us-east-1