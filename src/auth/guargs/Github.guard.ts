import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class GithubGuard extends AuthGuard('github') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        return super.canActivate(context) as boolean;
    }
}
