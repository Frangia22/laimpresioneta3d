#!/usr/bin/env node
'use strict';

/**
 * Crea o actualiza el primer usuario administrador (roleId = 1).
 *
 * Variables de entorno (obligatorias):
 *   BOOTSTRAP_ADMIN_EMAIL
 *   BOOTSTRAP_ADMIN_PASSWORD
 * Opcional:
 *   BOOTSTRAP_ADMIN_NAME   (default: "Administrador")
 *   BOOTSTRAP_ADMIN_FORCE=1  si el email ya existe: actualiza contraseña y fuerza roleId=1
 *
 * Uso (desde app/):  node ./scripts/seed-admin.js
 * O:                 npm run seed:admin
 */

const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const db = require('../models');

const BCRYPT_ROUNDS = 10;

async function ensureRoles() {
  const dialect = db.sequelize.getDialect();
  if (dialect === 'postgres') {
    await db.sequelize.query(
      `INSERT INTO roles (id, name) VALUES (1, 'admin'), (2, 'user')
       ON CONFLICT (id) DO NOTHING`,
      { raw: true }
    );
    return;
  }

  await db.roles.findOrCreate({
    where: { id: 1 },
    defaults: { name: 'admin' },
  });
  await db.roles.findOrCreate({
    where: { id: 2 },
    defaults: { name: 'user' },
  });
}

async function main() {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
  const name = (process.env.BOOTSTRAP_ADMIN_NAME || 'Administrador').trim();
  const force =
    process.env.BOOTSTRAP_ADMIN_FORCE === '1' || process.env.BOOTSTRAP_ADMIN_FORCE === 'true';

  if (!email || !password) {
    console.error(
      'Definí BOOTSTRAP_ADMIN_EMAIL y BOOTSTRAP_ADMIN_PASSWORD (p. ej. en app/.env o en la shell).'
    );
    process.exit(1);
  }

  await db.sequelize.authenticate();
  await ensureRoles();

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await db.users.findOne({ where: { email } });

  if (existing) {
    if (!force) {
      console.log(
        'Ya existe un usuario con ese email. No se modificó nada. ' +
          'Para forzar contraseña y rol admin: BOOTSTRAP_ADMIN_FORCE=1'
      );
      await db.sequelize.close();
      process.exit(0);
    }
    await existing.update({
      password: hash,
      roleId: 1,
      name: name || existing.name,
    });
    console.log('Usuario existente actualizado: rol admin y contraseña renovada (FORCE).');
    await db.sequelize.close();
    process.exit(0);
  }

  await db.users.create({
    name,
    email,
    password: hash,
    roleId: 1,
    status: false,
  });

  console.log('Usuario administrador creado. Iniciá sesión con POST /api/v1/auth/login.');
  await db.sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
