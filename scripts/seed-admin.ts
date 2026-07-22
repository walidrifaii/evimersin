import { closePool } from "@/server/database/connection";
import { adminRepository } from "@/server/database/repositories/admin.repository";
import { hashPassword } from "@/server/auth/password";
import { loadEnv, setupDatabase } from "./load-env";

async function seedAdmin() {
  loadEnv();
  await setupDatabase();

  const username = process.argv[2] ?? "admin";
  const password = process.argv[3] ?? "Admin123!";
  const name = process.argv[4] ?? "Super Admin";
  const email =
    process.argv[5] ??
    process.env.MAIL_ORDER_NOTIFY_TO ??
    process.env.MAIL_FROM_ADDRESS ??
    "info@evimersin.com";

  const existing = await adminRepository.findByUsername(username);
  if (existing) {
    console.log(`Admin "${username}" already exists (id: ${existing.id})`);
    await closePool();
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  const id = await adminRepository.create({
    username,
    password: passwordHash,
    name,
    email,
    status: 1,
  });

  console.log(`Admin created successfully with id: ${id}`);
  console.log(`Username: ${username}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  await closePool();
  process.exit(0);
}

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin:", error);
  await closePool();
  process.exit(1);
});
