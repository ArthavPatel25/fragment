const ddbDocClient = require('./ddbDocClient');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

// Save metadata to DynamoDB
async function writeFragment(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  const command = new PutCommand(params);

  try {
    const result = await ddbDocClient.send(command);
    logger.debug({ result, fragment }, 'Successfully wrote fragment to DynamoDB');
    return result;
  } catch (err) {
    logger.warn({ err, params, fragment }, 'Error writing fragment to DynamoDB');
    throw err;
  }
}

// Read metadata from DynamoDB
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'Error reading fragment from DynamoDB');
    throw err;
  }
}

// Save fragment data to S3
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Read fragment data from S3
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// List fragments for a user (from DynamoDB)
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  const command = new QueryCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return !expand ? data?.Items.map((item) => item.id) : data?.Items;
  } catch (err) {
    logger.error({ err, params }, 'Error listing fragments from DynamoDB');
    throw err;
  }
}

// Delete metadata from DynamoDB and data from S3
async function deleteFragment(ownerId, id) {
  const deleteS3Data = async () => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${ownerId}/${id}`,
    };
    const command = new DeleteObjectCommand(params);
    try {
      await s3Client.send(command);
    } catch (err) {
      logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error deleting fragment data from S3');
      throw new Error('unable to delete fragment data');
    }
  };

  const deleteMetadata = async () => {
    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Key: { ownerId, id },
    };
    const command = new DeleteCommand(params);
    try {
      await ddbDocClient.send(command);
    } catch (err) {
      logger.error({ err, params }, 'Error deleting metadata from DynamoDB');
      throw new Error('unable to delete fragment metadata');
    }
  };

  return Promise.all([deleteMetadata(), deleteS3Data()]);
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
