import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

	const items = await getTodosForUser(getUserId(event))

    return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			items
		})
	}
}