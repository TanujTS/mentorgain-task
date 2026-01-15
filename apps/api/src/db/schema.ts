import { relations } from 'drizzle-orm';
import { integer, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin', 'superadmin']);

// --- BETTER AUTH DEFAULTS ---
export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('user'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  createdPrograms: many(mentorshipProgram),
  enrollments: many(enrollment),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const statusEnum = pgEnum('status', ['open', 'closed']);

export const mentorshipProgram = pgTable('mentorship_program', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  maxParticipants: integer('max_participants').notNull(),
  status: statusEnum('status').notNull().default('open'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const mentorshipProgramRelations = relations(
  mentorshipProgram,
  ({ one, many }) => ({
    creator: one(user, {
      fields: [mentorshipProgram.createdBy],
      references: [user.id],
    }),
    formFields: many(formField),
    enrollments: many(enrollment),
  }),
);

export const fieldTypeEnum = pgEnum('field_type', [
  'text',
  'number',
  'select',
  'multi_select',
  'file',
]);

export const formField = pgTable('form_field', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorshipProgramId: uuid('mentorship_program_id')
    .notNull()
    .references(() => mentorshipProgram.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  fieldType: fieldTypeEnum('field_type').notNull(),
  options: text('options').array(),
  isRequired: boolean('is_required').default(false).notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const formFieldRelations = relations(formField, ({ one, many }) => ({
  mentorshipProgram: one(mentorshipProgram, {
    fields: [formField.mentorshipProgramId],
    references: [mentorshipProgram.id],
  }),
  responses: many(formResponse),
}));

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'pending',
  'accepted',
  'rejected',
]);

export const enrollment = pgTable(
  'enrollment',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    mentorshipProgramId: uuid('mentorship_program_id')
      .notNull()
      .references(() => mentorshipProgram.id, { onDelete: 'cascade' }),
    status: enrollmentStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('enrollment_user_program_unique').on(
      table.userId,
      table.mentorshipProgramId,
    ),
    index('enrollment_userId_idx').on(table.userId),
    index('enrollment_programId_idx').on(table.mentorshipProgramId),
  ],
);

export const enrollmentRelations = relations(enrollment, ({ one, many }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
  mentorshipProgram: one(mentorshipProgram, {
    fields: [enrollment.mentorshipProgramId],
    references: [mentorshipProgram.id],
  }),
  responses: many(formResponse),
}));

export const formResponse = pgTable(
  'form_response',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => enrollment.id, { onDelete: 'cascade' }),
    formFieldId: uuid('form_field_id')
      .notNull()
      .references(() => formField.id, { onDelete: 'cascade' }),
    textResponse: text('text_response'),
    numberResponse: integer('number_response'),
    selectResponse: text('select_response'),
    multiSelectResponse: text('multi_select_response').array(),
    fileResponse: text('file_response'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('form_response_enrollment_field_unique').on(
      table.enrollmentId,
      table.formFieldId,
    ),
    index('form_response_enrollmentId_idx').on(table.enrollmentId),
  ],
);

export const formResponseRelations = relations(formResponse, ({ one }) => ({
  enrollment: one(enrollment, {
    fields: [formResponse.enrollmentId],
    references: [enrollment.id],
  }),
  formField: one(formField, {
    fields: [formResponse.formFieldId],
    references: [formField.id],
  }),
}));
