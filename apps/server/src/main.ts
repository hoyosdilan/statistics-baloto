import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ServerModule } from './server.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ServerModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3000,
      },
    },
  );
  await app.listen();
}
bootstrap();
