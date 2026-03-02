/**
 * ======================================================================
 * 📁 services/ltms/externalService.js
 * ======================================================================
 */

import * as externalQuery from '../../../repository/sql/ltms/external/externalQuery.js';

export const getExternalDataList = async (filters) => {
  const data = await externalQuery.getExternalData(filters);
  return { data, count: data.length };
};

export const getExternalDataDetail = async (id) => {
  const data = await externalQuery.getExternalDataById(id);
  if (!data) throw new Error('해당 데이터를 찾을 수 없습니다');
  return data;
};

export const createExternalData = async (data) => {
  return await externalQuery.createExternalData(data);
};

export const updateExternalData = async (id, data) => {
  return await externalQuery.updateExternalData(id, data);
};

export const deleteExternalData = async (id) => {
  return await externalQuery.deleteExternalData(id);
};
