import { DocumentBuilder } from '@nestjs/swagger'

const title = 'Api auth '
const description = 'This project is a web application implementing modern authentication and authorization methods. ' +
'Key features include:\n' +
'JWT-based authentication:\n\n' +
'Use of JSON Web Tokens for secure transmission of user information\n' +
'Implementation of token issuance, refresh, and verification mechanisms\n\n' +
'Role-based authorization:\n\n' +
'Access control to resources based on user roles\n' +
'Use of JWT for storing role information\n\n' +
'OpenID Connect integration:\n\n' +
'Support for authentication through third-party providers: Google and GitHub\n' +
'Implementation of the OpenID Connect protocol for secure information exchange\n\n' +
'Single Sign-On:\n\n' +
'Ability to use a single account (Google or GitHub) to access the application\n\n' +
'Session management:\n\n' +
'Implementation of logout mechanism and token revocation';


export const config = new DocumentBuilder()
.setTitle(title)
.setDescription(description)
.setVersion('1.0')  
.addBearerAuth()  
.build();