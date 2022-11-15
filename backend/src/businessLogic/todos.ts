import { TodosAccess } from './todosAccess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';


const logger = createLogger('TodosAccessPreLogger')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

async function updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<void> {

	logger.info('preparing to update the todo item')
	await todosAccess.updateTodoItem(todoId, userId, todoUpdate)
	logger.info('todo item updated')
}

async function deleteTodo(todoId: string, userId: string): Promise<void> {

	logger.info('preparing to delete item', { todoId })	
	await todosAccess.deleteTodoItem(todoId, userId) 
	logger.info('item deleted')
}

async function getTodosForUser(userId: string): Promise<TodoItem[]> {

	logger.info('preparing to get all todos for a user')
	return await todosAccess.getAllTodos(userId);
}

async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {

	const todoId = uuid.v4()
	
	const newItem = {
		userId,
		todoId,
		createdAt: new Date().toISOString(),
		done: false,
		attachmentUrl: attachmentUtils.getAttachmentUrl(todoId),
		...newTodo
	}

	logger.info('preparing to create a todo item', { newItem })
	return await todosAccess.createTodoItem(newItem) 
}

async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
	
	logger.info('about to acquire a presigned url...')
	return await attachmentUtils.getUploadUrl(todoId)	
}

export { getTodosForUser, createTodo, updateTodo, deleteTodo, createAttachmentPresignedUrl }