import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty(
        {
            description: "User's email. Must be conform to the email format.",
            example: 'john.doe@example.com',
            required: true,
            type: 'string',
            format: 'email',
            
        }
    )
    email: string;


    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    @ApiProperty({
        description: "User's password. Must be at least 6 characters long.",
        example: 'StrongPassword123',
        required: true,
        type: 'string',
        minLength: 6,
        format: 'password',
    })
    password: string;
}
