import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  findAll() {
    return { message: 'Users module is operational' };
  }
}
