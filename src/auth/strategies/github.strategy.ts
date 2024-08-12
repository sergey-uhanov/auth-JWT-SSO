import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get('GITHUB_CLIENT_ID'), // Получите это из GitHub Developer Settings
            clientSecret: configService.get('GITHUB_CLIENT_SECRET'), // Получите это из GitHub Developer Settings
            callbackURL: 'http://localhost:3000/api/auth/github/callback', // Измените на свой callback URL
            scope: ['user:email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile, done: (err: any, user: any, info?: any) => void): Promise<any> {
        const { id, username, emails, avatar_url } = profile;
        
        const user = {
            email: emails[0].value,
            firstName: username,            
            picture: avatar_url,
            accessToken,
        };
        done(null, user);
    }
}
