'use strict';

const db = require('../../../../../models');

function toDto(row) {
  if (!row) return null;
  const p = row.toJSON ? row.toJSON() : row;
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    details: p.details,
    linkPago: p.linkPago,
    otherDetails: p.otherDetails,
    idCategory: p.idCategory,
  };
}

class SequelizeProductRepository {
  async findAll() {
    const rows = await db.products.findAll({ order: [['id', 'DESC']] });
    return rows.map(toDto);
  }

  async findById(id) {
    const row = await db.products.findByPk(id);
    return toDto(row);
  }

  async create(data) {
    const row = await db.products.create({
      name: data.name,
      price: data.price,
      image: data.image,
      details: data.details,
      linkPago: data.linkPago ?? null,
      otherDetails: data.otherDetails ?? null,
      idCategory: data.idCategory,
    });
    return toDto(row);
  }

  async update(id, data) {
    const [affected] = await db.products.update(
      {
        name: data.name,
        price: data.price,
        image: data.image,
        details: data.details,
        linkPago: data.linkPago ?? null,
        otherDetails: data.otherDetails ?? null,
        idCategory: data.idCategory,
      },
      { where: { id } }
    );
    return affected;
  }

  async delete(id) {
    return db.products.destroy({ where: { id } });
  }
}

module.exports = { SequelizeProductRepository };
