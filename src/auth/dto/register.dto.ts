import { IsPasswordsMatchingConstraint } from '@common/decorators'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator'

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'user@example.com',
        description: "User's email. Must be unique and conform to the email format.",
        format: 'email',
        uniqueItems: true, 
        type: String,
    })
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    @ApiProperty({
        example: 'P@ssw0rd!',
        description: 'User password. The minimum length is 6 characters. It is recommended to use a combination of letters, numbers and special characters to increase security.',
        minLength: 6,
        type: String,
        required: true
    })
    password: string;

    @IsString()
    @MinLength(6)
    @Validate(IsPasswordsMatchingConstraint)
    @IsNotEmpty()
    @ApiProperty({
        example: 'P@ssw0rd!',
        description: 'Password confirmation. Must match the "password" field.',
        minLength: 6,
        type: String,
        required: true
    })
    passwordRepeat: string;
}
