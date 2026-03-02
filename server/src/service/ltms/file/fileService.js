/**
 * 파일명 : fileService.js
 * 용도 : 파일 비즈니스 로직 처리
 * 최초등록 : 2026-02-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { getPool } from '../../../repository/connection.js';
import * as fileQuery from '../../../repository/sql/ltms/file/fileQuery.js';
import * as utils from '../../../common/utils.js';