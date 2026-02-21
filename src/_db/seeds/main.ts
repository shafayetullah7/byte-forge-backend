import { seedAdmin } from './admin.seed';

async function main() {
  console.log('🚀 Starting master seeding process...');
  
  try {
    await seedAdmin();
    // Add other seeders here
    
    console.log('✨ Master seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Master seeding failed:', error);
    process.exit(1);
  }
}

main();
