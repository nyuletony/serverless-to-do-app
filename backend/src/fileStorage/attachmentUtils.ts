import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


function getUploadUrl(todoId: string): string {
	
	// const XAWS = AWSXRay.captureAWS(AWS)
	const s3 = new AWS.S3({ signatureVersion: 'v4' })

	return s3.getSignedUrl('PutObject', {
		Bucket: bucketName,
		Key: todoId,
		Expires: urlExpiration
	})
}


export { getUploadUrl }