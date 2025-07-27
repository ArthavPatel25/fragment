// If the environment sets an AWS Region, use AWS backend services (S3, DynamoDB)
module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');
