import { ApiProperty } from '@nestjs/swagger'

export class ValidationErrorResponse {
    @ApiProperty({ example: 400,  })
    statusCode: number;

    @ApiProperty({
        example: [
            'passwordRepeat should not be empty',
            "The passwords don't match",
            'passwordRepeat must be longer than or equal to 6 characters',
            'passwordRepeat must be a string',
        ],
        description: 'Массив сообщений об ошибках',
        type: [String],
    })
    message: string[];

    @ApiProperty({ example: 'Bad Request', description: 'Тип ошибки' })
    error: string;
}
