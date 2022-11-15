import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccessLogger')

export class TodosAccess {
	constructor(
		private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly todosIndex = process.env.INDEX_NAME
	){}

	async getAllTodos(userId: string): Promise<TodoItem[]> {

		const result = await this.docClient.query({
			TableName: this.todosTable,
			IndexName: this.todosIndex,
			KeyConditionExpression: 'userId = :userId',
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
		await this.docClient.update({
			TableName: this.todosTable,
			Key: {
				todoId,
				userId
			},
			UpdateExpression: 'set #name = :name, dueDate, :dueDate, done = :done',
			ExpressionAttributeValues: {
				':name': todoUpdate.name,
				':dueDate': todoUpdate.dueDate,
				':done': todoUpdate.done
			},
			ExpressionAttributeNames: {
				'#name': 'name'
			}
		}).promise()

		logger.info('item updated, no errors encountered..')

		return todoUpdate

	}

	async deleteTodoItem(todoId: string, userId: string): Promise<void> {
		await this.docClient.delete({
			TableName: this.todosTable,
			Key: {
				todoId,
				userId
			}
		}).promise()
		logger.info('delete operation was a success')
	}

	async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {

		await this.docClient.update({
			TableName: this.todosTable,
			Key: {
				todoId,
				userId
			},
			UpdateExpression: 'set attachmentUrl = :attachmentUrl',
			ExpressionAttributeValues: {
				':attachmentUrl': attachmentUrl
			}
		}).promise()
		logger.info('todo-attachment-url updated')
	}
}