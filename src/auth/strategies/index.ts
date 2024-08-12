import { GithubStrategy } from './github.strategy'
import { GoogleStrategy } from './google.strategy'
import { JwtStrategy } from './jwt.strategy'


export const STRTAGIES = [JwtStrategy, GoogleStrategy, GithubStrategy];
