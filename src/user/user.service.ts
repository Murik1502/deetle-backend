import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { AuthDTO } from '../auth/dto/auth.dto'
import { hash } from 'argon2'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getById(id: string) {
    return this.prisma.user.findUnique({
      where:{
        id
      },
      include:{
        tasks: true
      }
    })
  }

  getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where:{
        email
      }
    })
  }

  async create(dto:AuthDTO) {
    const user={
      email:dto.email,
      name:'',
      password: await hash(dto.password)
    }

    return this.prisma.user.create({


      data:user
    })
  }
}
