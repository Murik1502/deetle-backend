import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { AuthDTO } from './dto/auth.dto'
import { verify } from 'argon2'
import { Response} from 'express'
import * as process from 'node:process'

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN= 1
  REFRESH_TOKEN_NAME='refreshToken'
  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {
  }

  async login(dto:AuthDTO){
    const {password, ...user} = await this.validateUser(dto)
    const tokens = this.issueTokens(user.id)

    return{
      user,
      ...tokens,
    }
  }

  async register(dto:AuthDTO){

    const oldUser = await this.userService.getByEmail(dto.email)
    if(oldUser) throw new BadRequestException('User already exists')

    const {password, ...user} = await this.userService.create(dto)

    const tokens = this.issueTokens(user.id)

    return{
      user,
      ...tokens,
    }
  }

  private issueTokens(userId:string){
    const data = {id:userId};
    const accessToken = this.jwt.sign(data,{
      expiresIn: '1h',
    })

    const refreshToken = this.jwt.sign(data,{
      expiresIn: '7d',
    })
    return {accessToken, refreshToken}
  }
  private async validateUser(dto:AuthDTO){
    const user = await this.userService.getByEmail(dto.email);

    if(!user) throw new NotFoundException('User Not Found');

    const isValid = await verify(user.password, dto.password)

    if(!isValid) throw new UnauthorizedException('User Not Found');

    return user;
  }

  addRefreshTokenToResponse(res:Response,refreshToken: string){
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken,{
      httpOnly: true,
      domain: process.env.DOMAIN || 'localhost',
      expires: expiresIn,
      secure:true,
      sameSite: 'none',
    })
  }
  removeRefreshTokenFromResponse(res:Response){
    res.cookie(this.REFRESH_TOKEN_NAME, '',{
      httpOnly: true,
      domain: process.env.DOMAIN || 'localhost',
      expires: new Date(0),
      secure:true,
      sameSite: 'none',
    })
  }

  async getNewTokens(refreshToken:string){
    const result = await this.jwt.verifyAsync(refreshToken)
    if(!result) throw new NotFoundException('Refresh token not found')

    const {password, ...user} = await this.userService.getById(result.id)

    const tokens = this.issueTokens(user.id)

    return{
      user,
      ...tokens,
    }
  }
}

