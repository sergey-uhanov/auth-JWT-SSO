import { Cookie, Public, UserAgent } from '@common/decorators'
import { handleTimeoutAndErrors } from '@common/helpers'
import { HttpService } from '@nestjs/axios'
import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserResponse } from '@user/responses'
import { Request, Response } from 'express'
import { map, mergeMap } from 'rxjs'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto } from './dto'
import { ValidationErrorResponse } from './dto/validationErrorResponse'
import { GithubGuard } from './guargs/Github.guard'
import { GoogleGuard } from './guargs/google.guard'
import { Tokens } from './interfaces'

const REFRESH_TOKEN = 'refreshtoken';
@ApiBearerAuth()
@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post('register')
    @ApiOperation({summary: 'New user registration'})
    @ApiBody({ type: RegisterDto})
    @ApiResponse({
        status: 201,
        description: 'User has been successfully registered',
        type: UserResponse,
        example: {
            "id": "f56eaa73-74c4-42ee-b800-41cb9c12550e",
            "email": "test2@mail.com",
            "updatedAt": "2024-08-14T05:09:40.451Z",
            "roles": [
                "USER"
            ]
        }
    })
    @ApiResponse({
        status: 409,
        description: 'A user with this email address has already been registered',
        example: {
            "statusCode": 409,
            "message": "A user with this email address has already been registered",
            "error": "Conflict"
        }

    })    
    @ApiResponse({
        status: 400,
        description: 'Returned in case of input data validation error',
        type: ValidationErrorResponse,
        
    })
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        if (!user) {
            throw new BadRequestException(
                `Unable to register a user with data ${JSON.stringify(dto)}`,
            );
        }
        return new UserResponse(user);
    }


    @Post('login')
    @ApiOperation({ summary: 'Аутентификация пользователя' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 201,
        description: 'Successful login. Returns tokens and sets refresh token in cookies',
        example:{
            "accessToken": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEwMDczMjE1LTljZGUtNGMxOC1iOWI2LTg4MGMwNjVkOTYwYiIsImVtYWlsIjoidGVzdEBtYWlsLmNvbSIsInJvbGVzIjpbIlVTRVIiLCJBRE1JTiJdLCJpYXQiOjE3MjM2MTU4OTQsImV4cCI6MTcyMzcwMjI5NH0.qmnKKSFTRKdAsGuHF9cD4K1GaBxElspADSvQoSpfCTM"
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Incorrect login or password',
        example:{
            "statusCode": 401,
            "message": "Incorrect login or password",
            "error": "Unauthorized"
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Incorrect data',
        example:{
            "statusCode": 400,
            "message": [
                "email should not be empty",
                "email must be an email",
                "password should not be empty",
                "password must be longer than or equal to 6 characters",
                "password must be a string"
            ],
            "error": "Bad Request"
        }
    })    
    async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
        const tokens = await this.authService.login(dto, agent);
        if (!tokens) {
            throw new BadRequestException(`Не получается войти с данными ${JSON.stringify(dto)}`);
        }
        this.setRefreshTokenToCookies(tokens, res);
    }

    @Get('logout')
    @ApiOperation({summary:'Log out of the account on this device'})
    @ApiResponse({
        status: 200,
        description: 'User has been successfully logged out',
        example: 'OK'
    })
    async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
        if (!refreshToken) {
            res.sendStatus(HttpStatus.OK);
            return;
        }
        await this.authService.deleteRefreshToken(refreshToken);
        res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() });
        res.sendStatus(HttpStatus.OK);
    }

    @Get('refresh-tokens')
    @ApiOperation({summary:'Refresh access and refresh tokens'})
    @ApiResponse({
        status: 201,
        description: 'Successful refresh. Returns new tokens and sets refresh token in cookies',
        example:{
            "accessToken": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEwMDczMjE1LTljZGUtNGMxOC1iOWI2LTg4MGMwNjVkOTYwYiIsImVtYWlsIjoidGVzdEBtYWlsLmNvb"
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Refresh token is invalid or expired',
        example:{
            "statusCode": 401,
            "message": "Unauthorized"
        }
    })
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
        
        
        if (!refreshToken) {
            throw new UnauthorizedException();
        }
        const tokens = await this.authService.refreshTokens(refreshToken, agent);
        if (!tokens) {
            throw new UnauthorizedException();
        }
        this.setRefreshTokenToCookies(tokens, res);
    }

    private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
        if (!tokens) {
            throw new UnauthorizedException();
        }
        res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: this.configService.get('NODE_ENV', 'development') === 'production',
            path: '/',
        });
        res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
    }

    @UseGuards(GoogleGuard)
    @Get('google')    
    googleAuth() {}

    @UseGuards(GoogleGuard)
    @Get('google/callback')
    googleAuthCallback(@Req() req: Request, @Res() res: Response) {
        const token = req.user['accessToken'];
        return res.redirect(`http://localhost:3000/api/auth/success-google?token=${token}`);
    }

    @Get('success-google')
    
    successGoogle(@Query('token') token: string, @UserAgent() agent: string, @Res() res: Response) {
        return this.httpService.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`).pipe(
            mergeMap(({ data: { email } }) => this.authService.providerAuth(email, agent, 'GOOGLE')),
            map((data) => this.setRefreshTokenToCookies(data, res)),
            handleTimeoutAndErrors(),
        );
    }
    @UseGuards(GithubGuard)
    @Get('github')
    githubAuth() {}
    
    @UseGuards(GithubGuard)
    @Get('github/callback')
    async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
        const token = req.user['accessToken'];
        return res.redirect(`http://localhost:3000/api/auth/success-github?token=${token}`);
    }
    
    @Get('success-github')
    successGithub(@Query('token') token: string, @UserAgent() agent: string, @Res() res: Response) {
        return this.httpService.get(`https://api.github.com/user`, {
            headers: { Authorization: `token ${token}` },
        }).pipe(
            mergeMap(({ data }) => {
                const email = data.email;
                if (!email) {
                    return this.httpService.get(`https://api.github.com/user/emails`, {
                        headers: { Authorization: `token ${token}` },
                    }).pipe(
                        map((emails) => emails.data.find(e => e.primary && e.verified)?.email || `${data.login}@github.com`),
                        mergeMap((email) => this.authService.providerAuth(email, agent, 'GITHUB'))
                    );
                }
                return this.authService.providerAuth(email, agent, 'GITHUB');
            }),
            map((data) => this.setRefreshTokenToCookies(data, res)),          
            handleTimeoutAndErrors(),
        );
    }
  

    
}
