'use strict';

const db = require('../../../../../models');

function toPublicDto(row) {
  if (!row) return null;
  const u = row.toJSON ? row.toJSON() : row;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    roleId: Number(u.roleId),
    status: Boolean(u.status),
  };
}

class SequelizeUserRepository {
  async findByEmailWithPasswordHash(email) {
    const row = await db.users.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'roleId', 'status'],
    });
    return row;
  }

  async findByIdPublic(id) {
    const row = await db.users.findByPk(id, {
      attributes: ['id', 'name', 'email', 'roleId', 'status'],
    });
    return toPublicDto(row);
  }

  async findAllPublic() {
    const rows = await db.users.findAll({
      attributes: ['id', 'name', 'email', 'roleId', 'status'],
      order: [['id', 'ASC']],
    });
    return rows.map((r) => toPublicDto(r));
  }
}

module.exports = { SequelizeUserRepository };
