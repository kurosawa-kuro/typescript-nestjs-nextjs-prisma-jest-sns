// import { main } from '../../../backend/database/resetDatabase';

// let isResetComplete = false;

// export async function resetDatabase(): Promise<void> {
//   if (isResetComplete) {
//     console.log('Database already reset, skipping...');
//     return;
//   }

//   try {
//     await main();
//     isResetComplete = true;
//     console.log('Database reset completed successfully');
//   } catch (error) {
//     console.error('Failed to reset database:', error);
//     throw error;
//   }
// }