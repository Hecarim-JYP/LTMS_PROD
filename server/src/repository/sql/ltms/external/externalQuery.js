/**
 * ======================================================================
 * 📁 db/queries/ltms/externalQuery.js
 * ======================================================================
 */

import { getPool } from '../../../connection.js';

export const getExternalData = async (filters) => {
  const conn = await getPool().getConnection();
  try {
    const result = await conn.query("SELECT * FROM external_data");
    return result;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  } finally {
    conn.release();
  }
};

export const getExternalDataById = async (id) => {
  const conn = await getPool().getConnection();
  try {
    const result = await conn.query("SELECT * FROM external_data WHERE id = ?", [id]);
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  } finally {
    conn.release();
  }
};

export const createExternalData = async (data) => {
  const conn = await getPool().getConnection();
  try {
    const result = await conn.query("INSERT INTO external_data SET ?", [data]);
    return { id: result.insertId, ...data };
  } catch (err) {
    throw new Error(`Database insert failed: ${err.message}`);
  } finally {
    conn.release();
  }
};

export const updateExternalData = async (id, data) => {
  const conn = await getPool().getConnection();
  try {
    await conn.query("UPDATE external_data SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
  } catch (err) {
    throw new Error(`Database update failed: ${err.message}`);
  } finally {
    conn.release();
  }
};

export const deleteExternalData = async (id) => {
  const conn = await getPool().getConnection();
  try {
    const result = await conn.query("DELETE FROM external_data WHERE id = ?", [id]);
    return { success: result.affectedRows > 0 };
  } catch (err) {
    throw new Error(`Database delete failed: ${err.message}`);
  } finally {
    conn.release();
  }
};
