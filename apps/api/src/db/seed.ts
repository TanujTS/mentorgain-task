import { drizzle } from 'drizzle-orm/neon-http';
import 'dotenv/config';
import * as schema from './schema';
import { v4 as uuidv4 } from 'uuid';
import { scryptSync, randomBytes } from 'crypto';

if (!process.env.DB_URL) {
  throw new Error('DB_URL not found in environment variables');
}

const db = drizzle(process.env.DB_URL, { schema });

// Helper to hash passwords (compatible with better-auth's scrypt format)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Seed data
async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await db.delete(schema.formResponse);
    await db.delete(schema.enrollment);
    await db.delete(schema.formField);
    await db.delete(schema.mentorshipProgram);
    await db.delete(schema.verification);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.user);
    console.log('✅ Existing data cleared\n');

    // Create Users
    console.log('👥 Creating users...');
    const hashedPassword = hashPassword('password123');

    const superadminId = uuidv4();
    const admin1Id = uuidv4();
    const admin2Id = uuidv4();
    const user1Id = uuidv4();
    const user2Id = uuidv4();
    const user3Id = uuidv4();
    const user4Id = uuidv4();
    const user5Id = uuidv4();

    const users = [
      {
        id: superadminId,
        name: 'Super Admin',
        email: 'superadmin@mentorgain.com',
        role: 'superadmin' as const,
        emailVerified: true,
      },
      {
        id: admin1Id,
        name: 'Alice Johnson',
        email: 'alice@mentorgain.com',
        role: 'admin' as const,
        emailVerified: true,
      },
      {
        id: admin2Id,
        name: 'Bob Smith',
        email: 'bob@mentorgain.com',
        role: 'admin' as const,
        emailVerified: true,
      },
      {
        id: user1Id,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'user' as const,
        emailVerified: true,
      },
      {
        id: user2Id,
        name: 'Diana Prince',
        email: 'diana@example.com',
        role: 'user' as const,
        emailVerified: true,
      },
      {
        id: user3Id,
        name: 'Edward Norton',
        email: 'edward@example.com',
        role: 'user' as const,
        emailVerified: false,
      },
      {
        id: user4Id,
        name: 'Fiona Green',
        email: 'fiona@example.com',
        role: 'user' as const,
        emailVerified: true,
      },
      {
        id: user5Id,
        name: 'George Wilson',
        email: 'george@example.com',
        role: 'user' as const,
        emailVerified: true,
      },
    ];

    await db.insert(schema.user).values(users);
    console.log(`✅ Created ${users.length} users\n`);

    // Create Accounts (for password authentication)
    console.log('🔐 Creating accounts...');
    const accounts = users.map((u) => ({
      id: uuidv4(),
      accountId: u.id,
      providerId: 'credential',
      userId: u.id,
      password: hashedPassword,
    }));

    await db.insert(schema.account).values(accounts);
    console.log(`✅ Created ${accounts.length} accounts\n`);

    // Create Mentorship Programs
    console.log('📚 Creating mentorship programs...');
    const program1Id = uuidv4();
    const program2Id = uuidv4();
    const program3Id = uuidv4();
    const program4Id = uuidv4();

    const programs = [
      {
        id: program1Id,
        name: 'Web Development Bootcamp',
        description:
          'A comprehensive 12-week program covering HTML, CSS, JavaScript, React, and Node.js. Perfect for beginners looking to start a career in web development.',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-04-30'),
        maxParticipants: 20,
        status: 'open' as const,
        createdBy: admin1Id,
      },
      {
        id: program2Id,
        name: 'Data Science Fundamentals',
        description:
          'Learn the basics of data science including Python, pandas, machine learning, and data visualization. Ideal for analysts looking to level up.',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-06-15'),
        maxParticipants: 15,
        status: 'open' as const,
        createdBy: admin1Id,
      },
      {
        id: program3Id,
        name: 'Cloud Architecture Mastery',
        description:
          'Master AWS, Azure, and GCP fundamentals. Learn to design scalable, reliable cloud infrastructure for enterprise applications.',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-03-10'),
        maxParticipants: 10,
        status: 'open' as const,
        createdBy: admin2Id,
      },
      {
        id: program4Id,
        name: 'Leadership & Management',
        description:
          'Develop essential leadership skills including communication, team management, strategic thinking, and conflict resolution.',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        maxParticipants: 25,
        status: 'closed' as const,
        createdBy: admin2Id,
      },
    ];

    await db.insert(schema.mentorshipProgram).values(programs);
    console.log(`✅ Created ${programs.length} mentorship programs\n`);

    // Create Form Fields for each program
    console.log('📝 Creating form fields...');
    const formFields = [
      // Web Development Bootcamp fields
      {
        id: uuidv4(),
        mentorshipProgramId: program1Id,
        title: 'Programming Experience',
        description: 'How many years of programming experience do you have?',
        fieldType: 'number' as const,
        options: null,
        isRequired: true,
        order: 1,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program1Id,
        title: 'Preferred Learning Style',
        description: 'Select your preferred way of learning',
        fieldType: 'select' as const,
        options: [
          'Video tutorials',
          'Reading documentation',
          'Hands-on projects',
          'Pair programming',
        ],
        isRequired: true,
        order: 2,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program1Id,
        title: 'Technologies Known',
        description: 'Select all technologies you are familiar with',
        fieldType: 'multi_select' as const,
        options: [
          'HTML',
          'CSS',
          'JavaScript',
          'TypeScript',
          'React',
          'Vue',
          'Angular',
          'Node.js',
        ],
        isRequired: false,
        order: 3,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program1Id,
        title: 'Goals',
        description: 'What do you hope to achieve from this program?',
        fieldType: 'text' as const,
        options: null,
        isRequired: true,
        order: 4,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program1Id,
        title: 'Resume',
        description: 'Upload your resume (PDF format)',
        fieldType: 'file' as const,
        options: null,
        isRequired: false,
        order: 5,
      },

      // Data Science Fundamentals fields
      {
        id: uuidv4(),
        mentorshipProgramId: program2Id,
        title: 'Current Role',
        description: 'What is your current job title?',
        fieldType: 'text' as const,
        options: null,
        isRequired: true,
        order: 1,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program2Id,
        title: 'Python Proficiency',
        description: 'How would you rate your Python skills?',
        fieldType: 'select' as const,
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        isRequired: true,
        order: 2,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program2Id,
        title: 'Areas of Interest',
        description: 'Which data science areas interest you most?',
        fieldType: 'multi_select' as const,
        options: [
          'Machine Learning',
          'Deep Learning',
          'Data Visualization',
          'NLP',
          'Computer Vision',
          'Statistics',
        ],
        isRequired: true,
        order: 3,
      },

      // Cloud Architecture Mastery fields
      {
        id: uuidv4(),
        mentorshipProgramId: program3Id,
        title: 'Cloud Experience',
        description: 'Years of experience with cloud platforms',
        fieldType: 'number' as const,
        options: null,
        isRequired: true,
        order: 1,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program3Id,
        title: 'Primary Cloud Platform',
        description: 'Which cloud platform do you primarily use?',
        fieldType: 'select' as const,
        options: ['AWS', 'Azure', 'GCP', 'None'],
        isRequired: true,
        order: 2,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program3Id,
        title: 'Certifications',
        description: 'List any cloud certifications you have',
        fieldType: 'text' as const,
        options: null,
        isRequired: false,
        order: 3,
      },

      // Leadership & Management fields
      {
        id: uuidv4(),
        mentorshipProgramId: program4Id,
        title: 'Team Size',
        description: 'How many people do you currently manage?',
        fieldType: 'number' as const,
        options: null,
        isRequired: true,
        order: 1,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program4Id,
        title: 'Management Experience',
        description: 'How many years of management experience do you have?',
        fieldType: 'select' as const,
        options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
        isRequired: true,
        order: 2,
      },
      {
        id: uuidv4(),
        mentorshipProgramId: program4Id,
        title: 'Challenges',
        description: 'What leadership challenges are you facing?',
        fieldType: 'text' as const,
        options: null,
        isRequired: true,
        order: 3,
      },
    ];

    await db.insert(schema.formField).values(formFields);
    console.log(`✅ Created ${formFields.length} form fields\n`);

    // Create Enrollments
    console.log('📋 Creating enrollments...');
    const enrollment1Id = uuidv4();
    const enrollment2Id = uuidv4();
    const enrollment3Id = uuidv4();
    const enrollment4Id = uuidv4();
    const enrollment5Id = uuidv4();
    const enrollment6Id = uuidv4();
    const enrollment7Id = uuidv4();

    const enrollments = [
      // Web Development Bootcamp enrollments
      {
        id: enrollment1Id,
        userId: user1Id,
        mentorshipProgramId: program1Id,
        status: 'accepted' as const,
      },
      {
        id: enrollment2Id,
        userId: user2Id,
        mentorshipProgramId: program1Id,
        status: 'pending' as const,
      },
      {
        id: enrollment3Id,
        userId: user3Id,
        mentorshipProgramId: program1Id,
        status: 'rejected' as const,
      },

      // Data Science Fundamentals enrollments
      {
        id: enrollment4Id,
        userId: user1Id,
        mentorshipProgramId: program2Id,
        status: 'pending' as const,
      },
      {
        id: enrollment5Id,
        userId: user4Id,
        mentorshipProgramId: program2Id,
        status: 'accepted' as const,
      },

      // Cloud Architecture Mastery enrollments
      {
        id: enrollment6Id,
        userId: user5Id,
        mentorshipProgramId: program3Id,
        status: 'accepted' as const,
      },

      // Leadership & Management enrollments (closed program)
      {
        id: enrollment7Id,
        userId: user2Id,
        mentorshipProgramId: program4Id,
        status: 'accepted' as const,
      },
    ];

    await db.insert(schema.enrollment).values(enrollments);
    console.log(`✅ Created ${enrollments.length} enrollments\n`);

    // Create Form Responses
    console.log('📄 Creating form responses...');

    // Get form field IDs for responses
    const webDevFields = formFields.filter(
      (f) => f.mentorshipProgramId === program1Id,
    );
    const dataScienceFields = formFields.filter(
      (f) => f.mentorshipProgramId === program2Id,
    );
    const cloudFields = formFields.filter(
      (f) => f.mentorshipProgramId === program3Id,
    );
    const leadershipFields = formFields.filter(
      (f) => f.mentorshipProgramId === program4Id,
    );

    const formResponses = [
      // User1's responses for Web Dev (accepted)
      {
        id: uuidv4(),
        enrollmentId: enrollment1Id,
        formFieldId: webDevFields[0].id,
        numberResponse: 2,
        textResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment1Id,
        formFieldId: webDevFields[1].id,
        selectResponse: 'Hands-on projects',
        numberResponse: null,
        textResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment1Id,
        formFieldId: webDevFields[2].id,
        multiSelectResponse: ['HTML', 'CSS', 'JavaScript'],
        numberResponse: null,
        textResponse: null,
        selectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment1Id,
        formFieldId: webDevFields[3].id,
        textResponse:
          'I want to become a full-stack developer and build my own SaaS product.',
        numberResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },

      // User2's responses for Web Dev (pending)
      {
        id: uuidv4(),
        enrollmentId: enrollment2Id,
        formFieldId: webDevFields[0].id,
        numberResponse: 0,
        textResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment2Id,
        formFieldId: webDevFields[1].id,
        selectResponse: 'Video tutorials',
        numberResponse: null,
        textResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment2Id,
        formFieldId: webDevFields[3].id,
        textResponse:
          'Career transition from marketing to software development.',
        numberResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },

      // User4's responses for Data Science (accepted)
      {
        id: uuidv4(),
        enrollmentId: enrollment5Id,
        formFieldId: dataScienceFields[0].id,
        textResponse: 'Data Analyst',
        numberResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment5Id,
        formFieldId: dataScienceFields[1].id,
        selectResponse: 'Intermediate',
        numberResponse: null,
        textResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment5Id,
        formFieldId: dataScienceFields[2].id,
        multiSelectResponse: [
          'Machine Learning',
          'Data Visualization',
          'Statistics',
        ],
        numberResponse: null,
        textResponse: null,
        selectResponse: null,
        fileResponse: null,
      },

      // User5's responses for Cloud Architecture (accepted)
      {
        id: uuidv4(),
        enrollmentId: enrollment6Id,
        formFieldId: cloudFields[0].id,
        numberResponse: 3,
        textResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment6Id,
        formFieldId: cloudFields[1].id,
        selectResponse: 'AWS',
        numberResponse: null,
        textResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment6Id,
        formFieldId: cloudFields[2].id,
        textResponse:
          'AWS Solutions Architect Associate, AWS Developer Associate',
        numberResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },

      // User2's responses for Leadership (accepted - closed program)
      {
        id: uuidv4(),
        enrollmentId: enrollment7Id,
        formFieldId: leadershipFields[0].id,
        numberResponse: 8,
        textResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment7Id,
        formFieldId: leadershipFields[1].id,
        selectResponse: '3-5 years',
        numberResponse: null,
        textResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
      {
        id: uuidv4(),
        enrollmentId: enrollment7Id,
        formFieldId: leadershipFields[2].id,
        textResponse:
          'Struggling with remote team communication and maintaining team morale during challenging projects.',
        numberResponse: null,
        selectResponse: null,
        multiSelectResponse: null,
        fileResponse: null,
      },
    ];

    await db.insert(schema.formResponse).values(formResponses);
    console.log(`✅ Created ${formResponses.length} form responses\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(
      `   - Users: ${users.length} (1 superadmin, 2 admins, 5 users)`,
    );
    console.log(`   - Accounts: ${accounts.length}`);
    console.log(`   - Mentorship Programs: ${programs.length}`);
    console.log(`   - Form Fields: ${formFields.length}`);
    console.log(`   - Enrollments: ${enrollments.length}`);
    console.log(`   - Form Responses: ${formResponses.length}`);
    console.log('\n📧 Login credentials:');
    console.log('   All users have password: password123');
    console.log('   - superadmin@mentorgain.com (superadmin)');
    console.log('   - alice@mentorgain.com (admin)');
    console.log('   - bob@mentorgain.com (admin)');
    console.log('   - charlie@example.com (user)');
    console.log('   - diana@example.com (user)');
    console.log('   - edward@example.com (user)');
    console.log('   - fiona@example.com (user)');
    console.log('   - george@example.com (user)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
