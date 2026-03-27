'use strict';

const db = require('../../../../../models');

function toDto(row) {
  if (!row) return null;
  const c = row.toJSON ? row.toJSON() : row;
  return {
    id: c.id,
    name: c.name,
  };
}

class SequelizeCategoryRepository {
  async findAll() {
    const rows = await db.categorys.findAll({ order: [['id', 'ASC']] });
    return rows.map(toDto);
  }

  async findById(id) {
    const row = await db.categorys.findByPk(id);
    return toDto(row);
  }

  async create(data) {
    const row = await db.categorys.create({ name: data.name });
    return toDto(row);
  }

  async delete(id) {
    return db.categorys.destroy({ where: { id } });
  }
}

module.exports = { SequelizeCategoryRepository };
