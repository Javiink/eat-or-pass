import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramService } from './telegram/telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { DishesService } from './dishes/dishes.service';
import { UserModule } from './user/user.module';
import { AiService } from './ai/ai.service';
import { ImagesService } from './images/images.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRoot({
      token: process.env.TG_BOT_API,
    }),
    AuthModule,
    UserModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TelegramService,
    DishesService,
    AiService,
    ImagesService,
  ],
})
export class AppModule {}
