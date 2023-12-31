import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  bigint,
  datetime,
  index,
  int,
  mysqlTable,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const projectTable = mysqlTableCreator(
  (name) => `shopping-list_${name}`,
);

export const shortLinks = mysqlTable("ShortLink", {
  id: varchar("id", { length: 191 }).primaryKey(),
  url: varchar("url", { length: 3000 }).notNull(),
  slug: varchar("slug", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  userId: varchar("userId", { length: 191 }),
});

export const posts = projectTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: datetime("createdAt", { mode: "date", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "date", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const shoppingLists = projectTable(
  "shoppingList",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: datetime("createdAt", { mode: "date", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "date", fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (shoppingList) => ({
    slugIdx: index("slug_idx").on(shoppingList.slug),
    createdByIdIdx: index("createdById_idx").on(shoppingList.createdById),
  }),
);

export const shoppingListCollaborators = projectTable(
  "shoppingListCollaborator",
  {
    shoppingListId: bigint("shoppingListId", { mode: "number" }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
  },
  (collaborator) => ({
    primaryKey: primaryKey(collaborator.userId, collaborator.shoppingListId),
  }),
);

export const shoppingListCollaboratorsRelations = relations(
  shoppingListCollaborators,
  ({ one }) => ({
    shoppingList: one(shoppingLists, {
      fields: [shoppingListCollaborators.shoppingListId],
      references: [shoppingLists.id],
    }),
    user: one(users, {
      fields: [shoppingListCollaborators.userId],
      references: [users.id],
    }),
  }),
);

export const shoppingListsRelations = relations(
  shoppingLists,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [shoppingLists.createdById],
      references: [users.id],
    }),
    items: many(shoppingListItems),
    collaborators: many(shoppingListCollaborators),
  }),
);

export const unitValues = ["kg", "g", "L", "ml", "pcs"] as const;

export const shoppingListItems = projectTable("shoppingListItem", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  shoppingListId: bigint("shoppingListId", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: int("quantity"),
  unit: varchar("unit", { length: 255, enum: unitValues }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  completedById: varchar("completedById", { length: 255 }),
  completedAt: timestamp("completedAt", { mode: "date", fsp: 3 }),
  createdAt: datetime("createdAt", { mode: "date", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime("updatedAt", { mode: "date", fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export const shoppingListItemsRelations = relations(
  shoppingListItems,
  ({ one }) => ({
    shoppingList: one(shoppingLists, {
      fields: [shoppingListItems.shoppingListId],
      references: [shoppingLists.id],
    }),
    createdBy: one(users, {
      fields: [shoppingListItems.createdById],
      references: [users.id],
    }),
    completedBy: one(users, {
      fields: [shoppingListItems.completedById],
      references: [users.id],
    }),
  }),
);

export const users = projectTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  shoppingLists: many(shoppingLists),
}));

export const accounts = projectTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = projectTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = projectTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);

export type SelectShoppingList = InferSelectModel<typeof shoppingLists>;
export type SelectShoppingListItem = InferSelectModel<typeof shoppingListItems>;
export type SelectPost = InferSelectModel<typeof posts>;
export type SelectUser = InferSelectModel<typeof users>;
export type SelectAccount = InferSelectModel<typeof accounts>;
export type SelectSession = InferSelectModel<typeof sessions>;
export type SelectVerificationToken = InferSelectModel<
  typeof verificationTokens
>;

export type SelectShoppingListWithRelations = SelectShoppingList & {
  createdBy: SelectUser;
  collaborators: SelectUser[];
};

export type SelectShoppingListItemWithRelations = SelectShoppingListItem & {
  createdBy: SelectUser;
  completedBy: SelectUser | null;
};
