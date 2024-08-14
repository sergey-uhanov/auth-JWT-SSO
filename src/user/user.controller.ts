import { JwtPayload } from '@auth/interfaces'
import { CurrentUser } from '@common/decorators'
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Put,
    UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { UserResponse } from './responses'
import { UserService } from './user.service'

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    @ApiOperation({ summary: 'Get a user by ID or Email' })
    @ApiParam({
        name: 'idOrEmail',
        description: 'User ID or email to search',
        example: 'user@example.com',
    })
    
    @ApiOkResponse({
        status: 200,
        description: 'User successfully found',
        type: UserResponse,
        example: { "id": "a0073215-9cde-4c18-b9b6-880c065d960b",
            "email": "test@mail.com",
            "updatedAt": "2024-08-12T05:54:18.847Z",
            "roles": [
                "USER"
            ]}
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async findOneUser(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.userService.findOne(idOrEmail);
        if (!user) {
            throw new NotFoundException(`User with ID or Email "${idOrEmail}" not found`);
        }
        return new UserResponse(user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User UUID to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string',
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully deleted',
    })
    @ApiResponse({
        status: 403,
        description: 'Insufficient rights to delete the user',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
        return this.userService.delete(id, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get information about the current user' })
    @ApiResponse({
        status: 200,
        description: 'Current user information',
        
    })
    me(@CurrentUser() user: JwtPayload) {
        return user;
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Put()
    @ApiOperation({ summary: 'Update user information' })
    @ApiResponse({
        status: 200,
        description: 'User information has been successfully updated',
        type: UserResponse,
    })
    @ApiResponse({
        status: 400,
        description: 'Incorrect data',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async updateUser(@Body() body: Partial<User>) {
        const user = await this.userService.save(body);
        return new UserResponse(user);
    }
}
