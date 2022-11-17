import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';


const logger = createLogger('TodosAccessPreLogger')
const todosAccess = new TodosAccess()

async function updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {

	logger.info('preparing to update the todo item')
	return todosAccess.updateTodoItem(todoId, userId, todoUpdate)
}

async function deleteTodo(todoId: string, userId: string): Promise<void> {

	logger.info('preparing to delete item', { todoId })	
	return todosAccess.deleteTodoItem(todoId, userId) 
}

async function getTodosForUser(userId: string): Promise<TodoItem[]> {

	logger.info('preparing to get all todos for a user')
	return todosAccess.getAllTodos(userId);
}

async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {

	const todoId = uuid.v4()
	
	const newItem = {
		userId,
		todoId,
		createdAt: new Date().toISOString(),
		done: false,
		attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`,
		...newTodo
	}

	logger.info('preparing to create a todo item', { newItem })
	return todosAccess.createTodoItem(newItem) 
}

async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
	
	logger.info('about to acquire a presigned url...')

	return await todosAccess.getUploadUrl(todoId)
}

export { getTodosForUser, createTodo, updateTodo, deleteTodo, createAttachmentPresignedUrl }