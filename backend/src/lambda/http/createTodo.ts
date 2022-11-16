import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todos'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

	const item = await createTodo(newTodo, getUserId(event))

    return {
		statusCode: 201,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			item
		})
	}
}