import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Render } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { Account } from './account/entities/account.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('transfer/:sourceid/:targetid')
  async Transfering (
    @Param('sourceid') sourceid: number,
    @Param('targetid') targetid: number,
    @Body('amount') amount: number,
  ) {
    const repo = this.dataSource.getRepository(Account);
    const source = await repo.findOneBy({id:sourceid});
    const target = await repo.findOneBy({id:targetid});
    if(!source || !target){
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    } else {
      if(source.balance<amount){
        throw new HttpException(
          'nincs elég összeg',
          HttpStatus.CONFLICT,
        )
      } else{
        await this.dataSource
        .getRepository(Account)
        .update({id:sourceid}, {balance:source.balance-amount});
        await this.dataSource
        .getRepository(Account)
        .update({id:targetid}, {balance:target.balance+amount});
      }
    }
  }
}
