import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DevelopService } from '../features/develop/develop.service';

async function resetDatabase() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const developService = app.get(DevelopService);

    console.log('Resetting database...');
    await developService.resetDb();
    console.log('Database reset completed successfully.');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
}

resetDatabase();
