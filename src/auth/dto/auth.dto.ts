import { IsEmail, IsString, MinLength } from 'class-validator'


export class AuthDTO {
  @IsEmail()
  email: string;

  @IsString()
  name?:string

  @MinLength(6,{ message: 'Password must be at least 6 characters' })
  @IsString()
  password: string;
}