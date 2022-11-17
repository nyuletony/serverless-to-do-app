import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { S3Client, PutObjectCommand} from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('TodosAccessLogger')

export class TodosAccess {
	constructor(
		private readonly docClient: DocumentClient = new (AWSXRay.captureAWS(AWS)).DynamoDB.DocumentClient(),
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
		private readonly s3Bucket = process.env.ATTACHMENT_S3_BUCKET
	){}

	async getAllTodos(userId: string): Promise<TodoItem[]> {

		const result = await this.docClient.query({
			TableName: this.todosTable,
			IndexName: this.todosIndex,
			KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
			ExpressionAttributeValues: {
				':userId': userId
			}
		}).promise()
		
		const items = result.Items
		logger.info('items have been retrieved: ', { items })

		return items as TodoItem[]
	}

	async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
		
		await this.docClient.put({
			TableName: this.todosTable,
			Item: todoItem
		}).promise()

		logger.info('a todo item was created successfully', { todoItem })

		return todoItem
	}

	async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
		
		const result = await this.docClient.update({
			TableName: this.todosTable,
			Key: {
				userId,
				todoId
			},
			UpdateExpression: 'set #name=:name, #dueDate=:dueDate, #done=:done',
			ExpressionAttributeNames: {
				'#name': 'name',
				'#dueDate': 'dueDate',
				'#done': 'done'
			},
			ExpressionAttributeValues: {
				':name': todoUpdate.name,
				':dueDate': todoUpdate.dueDate,
				':done': todoUpdate.done
			},
			ReturnValues: 'ALL_NEW'
		}).promise()

		const attr = result.Attributes

		logger.info('item updated, here\'s the new item', { attr })

		return attr as TodoUpdate

	}

	async deleteTodoItem(todoId: string, userId: string): Promise<void> {
		
		await this.docClient.delete({
			TableName: this.todosTable,
			Key: {
				userId,
				todoId
			}
		}).promise()

		logger.info('delete operation was a success')
	}

	async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {

		await this.docClient.update({
			TableName: this.todosTable,
			Key: {
				userId,
				todoId
			},
			UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: {
                "#attachmentUrl": "attachmentUrl"
            },
			ExpressionAttributeValues: {
				':attachmentUrl': attachmentUrl
			}
		}).promise()
		logger.info('todo-attachment-url updated')
	}

	async getUploadUrl(todoId: string): Promise<string> {

		const client = new S3Client({ region: 'us-east-1' })
		const command = new PutObjectCommand({
			Bucket: this.s3Bucket,
			Key: todoId
		});

		const url = await getSignedUrl(client, command, { expiresIn: 300 });

		return url
	}
}