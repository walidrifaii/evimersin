import { closePool, execute } from "@/server/database/connection";
import { adminRepository } from "@/server/database/repositories/admin.repository";
import { roleRepository } from "@/server/database/repositories/role.repository";
import { hashPassword } from "@/server/auth/password";
import { loadEnv, setupDatabase } from "./load-env";

async function seedAdmin() {
  loadEnv();
  await setupDatabase();

  const username = process.argv[2] ?? "admin";
  const password = process.argv[3] ?? "Admin123!";
  const name = process.argv[4] ?? "Super Admin";
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "Super";
  const lastName = nameParts.slice(1).join(" ") || "Admin";
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
  await roleRepository.ensureReady();
  const fullName = `${firstName} ${lastName}`.trim();
  const result = await execute(
    `INSERT INTO admin (username, password, name, first_name, last_name, email, status, role_id, custom_permissions)
     VALUES (:username, :password, :name, :first_name, :last_name, :email, 1, 1, NULL)`,
    {
      username,
      password: passwordHash,
      name: fullName,
      first_name: firstName,
      last_name: lastName,
      email,
    },
  );
  const id = result.insertId;

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
