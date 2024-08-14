import { ApiProperty } from '@nestjs/swagger'
import { Provider, Role, User } from '@prisma/client'
import { Exclude } from 'class-transformer'

export class UserResponse implements User {
    @ApiProperty({ description: 'ID of the user' })
    id: string;
    email: string;

    @Exclude()
    password: string;

    @Exclude()
    createdAt: Date;

    @Exclude()
    provider: Provider;

    @Exclude()
    isBlocked: boolean;

    @ApiProperty({ description: 'Date last updated' })
    updatedAt: Date;
    
    @ApiProperty({ description: 'Roles assigned to the user' })
    roles: Role[];

    constructor(user: User) {
        Object.assign(this, user);
    }
}
