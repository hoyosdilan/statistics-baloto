import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { ScraperService } from './scraper/scraper.service';
import { ConfigModule } from '@nestjs/config';
import { DataManagerService } from './data-manager/data-manager.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot()],
  providers: [TasksService, ScraperService, DataManagerService],
  controllers: [],
})
export class AppModule {}
