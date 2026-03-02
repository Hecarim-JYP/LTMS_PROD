# 문서 유형 관리 테이블 사용 가이드

## 📋 개요

`approval_document_type` 테이블은 결재 시스템에서 사용되는 모든 문서 유형을 중앙에서 관리하는 마스터 테이블입니다.

## 🗂️ 테이블 구조

### 주요 컬럼

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `document_type_code` | VARCHAR(20) | 문서 유형 코드 (PK) |
| `company_id` | INT | 회사 ID (PK) |
| `module_name` | VARCHAR(50) | 모듈명 (CT, InternalTest 등) |
| `document_type_name` | VARCHAR(100) | 문서 유형명 |
| `document_category` | VARCHAR(20) | 문서 분류 (REQUEST, TEST, REPORT) |
| `requires_approval` | TINYINT(1) | 결재 필요 여부 |
| `default_template_id` | INT | 기본 결재 양식 ID |
| `icon` | VARCHAR(50) | 아이콘 클래스명 (UI용) |
| `color` | VARCHAR(20) | 색상 코드 (UI용) |

## 📦 기본 제공 문서 유형

### CT 모듈
- `CT_REQ`: CT 의뢰
- `CT_TEST`: CT 시험성적서

### 내부시험 모듈
- `INTERNAL_REQ`: 내부시험 의뢰
- `INTERNAL_TEST`: 내부시험 시험성적서

### 외부시험 모듈
- `EXTERNAL_REQ`: 외부시험 의뢰
- `EXTERNAL_TEST`: 외부시험 시험성적서

### 방부력 모듈
- `PRESERVATIVE_REQ`: 방부력 시험 의뢰
- `PRESERVATIVE_TEST`: 방부력 시험성적서

## 🚀 사용 방법

### 1. 테이블 생성
```bash
mysql -u username -p database_name < approval_document_type.sql
```

### 2. 샘플 데이터 삽입
```bash
mysql -u username -p database_name < INSERT_approval_document_type_sample.sql
```

### 3. 기존 테이블과 연동

#### approval_template과 연동
```sql
-- 기본 템플릿 설정
UPDATE approval_document_type 
SET default_template_id = (
  SELECT approval_template_id 
  FROM approval_template 
  WHERE document_type = 'CT_REQ' AND is_default = 1 
  LIMIT 1
)
WHERE document_type_code = 'CT_REQ';
```

#### approval_document에서 참조
```sql
-- 문서 생성 시 유형 검증
SELECT * FROM approval_document_type
WHERE document_type_code = ? 
  AND company_id = ? 
  AND is_active = 1;
```

## 💻 API 구현 예시

### 백엔드 (Node.js/Express)

```javascript
// routes/approval/documentTypes.js
router.get('/document-types', async (req, res) => {
  const { module, category } = req.query;
  const companyId = req.user.company_id;
  
  let query = `
    SELECT 
      document_type_code,
      module_name,
      document_type_name,
      document_category,
      description,
      requires_approval,
      icon,
      color,
      sort_order
    FROM approval_document_type
    WHERE company_id = ? AND is_active = 1
  `;
  const params = [companyId];
  
  if (module) {
    query += ` AND module_name = ?`;
    params.push(module);
  }
  
  if (category) {
    query += ` AND document_category = ?`;
    params.push(category);
  }
  
  query += ` ORDER BY sort_order`;
  
  const types = await db.query(query, params);
  res.json(types);
});

// 문서 유형 상세 조회
router.get('/document-types/:code', async (req, res) => {
  const { code } = req.params;
  const companyId = req.user.company_id;
  
  const query = `
    SELECT 
      dt.*,
      t.template_name as default_template_name
    FROM approval_document_type dt
    LEFT JOIN approval_template t 
      ON dt.default_template_id = t.approval_template_id
    WHERE dt.document_type_code = ? 
      AND dt.company_id = ?
  `;
  
  const results = await db.query(query, [code, companyId]);
  if (results.length === 0) {
    return res.status(404).json({ error: 'Document type not found' });
  }
  
  res.json(results[0]);
});
```

### 프론트엔드 (React)

```javascript
// hooks/useDocumentTypes.js
import { useState, useEffect } from 'react';
import api from '../api';

export function useDocumentTypes(moduleName = null) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTypes() {
      try {
        const params = moduleName ? { module: moduleName } : {};
        const response = await api.get('/approval/document-types', { params });
        setTypes(response.data);
      } catch (error) {
        console.error('Failed to fetch document types:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTypes();
  }, [moduleName]);
  
  return { types, loading };
}

// components/DocumentTypeSelector.jsx
import React from 'react';
import { useDocumentTypes } from '../hooks/useDocumentTypes';

export function DocumentTypeSelector({ 
  moduleName, 
  value, 
  onChange,
  filterCategory = null 
}) {
  const { types, loading } = useDocumentTypes(moduleName);
  
  const filteredTypes = filterCategory
    ? types.filter(t => t.document_category === filterCategory)
    : types;
  
  if (loading) return <div>로딩 중...</div>;
  
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="form-select"
    >
      <option value="">문서 유형 선택</option>
      {filteredTypes.map(type => (
        <option 
          key={type.document_type_code} 
          value={type.document_type_code}
        >
          {type.document_type_name}
          {type.requires_approval && ' 🔒'}
        </option>
      ))}
    </select>
  );
}

// 사용 예시
function CreateApprovalForm() {
  const [documentType, setDocumentType] = useState('');
  
  return (
    <div>
      <DocumentTypeSelector
        moduleName="CT"
        value={documentType}
        onChange={setDocumentType}
        filterCategory="REQUEST"
      />
    </div>
  );
}
```

## 🎨 UI 컴포넌트 예시

### 문서 유형 카드 (Material-UI)

```javascript
import { Card, CardContent, Typography, Chip } from '@mui/material';
import { useDocumentTypes } from '../hooks/useDocumentTypes';

function DocumentTypeCards({ moduleName, onSelect }) {
  const { types } = useDocumentTypes(moduleName);
  
  return (
    <div className="document-type-grid">
      {types.map(type => (
        <Card 
          key={type.document_type_code}
          onClick={() => onSelect(type.document_type_code)}
          sx={{ 
            cursor: 'pointer',
            borderLeft: `4px solid ${type.color}`,
            '&:hover': { boxShadow: 3 }
          }}
        >
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className={type.icon} style={{ color: type.color }} />
              <Typography variant="h6">
                {type.document_type_name}
              </Typography>
            </div>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {type.description}
            </Typography>
            
            <div style={{ marginTop: 12 }}>
              <Chip 
                label={type.document_category} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              {type.requires_approval && (
                <Chip 
                  label="결재 필요" 
                  size="small" 
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 🔧 관리 기능

### 새로운 문서 유형 추가

```sql
INSERT INTO approval_document_type 
(document_type_code, company_id, module_name, document_type_name, 
 document_category, description, requires_approval, icon, color, 
 is_active, sort_order, created_by) 
VALUES 
('NEW_TYPE', 1, 'NewModule', '새로운 문서 유형', 'REQUEST', 
 '새로운 문서 유형에 대한 설명입니다.', 1, 'icon-new', '#3498DB', 
 1, 99, 1);
```

### 문서 유형 비활성화

```sql
UPDATE approval_document_type 
SET is_active = 0, 
    updated_at = NOW(), 
    updated_by = ? 
WHERE document_type_code = 'OLD_TYPE' 
  AND company_id = 1;
```

### 정렬 순서 변경

```sql
UPDATE approval_document_type 
SET sort_order = CASE document_type_code
  WHEN 'CT_REQ' THEN 1
  WHEN 'CT_TEST' THEN 2
  WHEN 'INTERNAL_REQ' THEN 3
  -- ... 나머지
END
WHERE company_id = 1;
```

## 📊 유용한 조회 쿼리

### 모듈별 통계
```sql
SELECT 
  module_name,
  COUNT(*) as total_types,
  SUM(CASE WHEN requires_approval = 1 THEN 1 ELSE 0 END) as approval_required,
  SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_types
FROM approval_document_type
WHERE company_id = 1
GROUP BY module_name;
```

### 기본 템플릿 미설정 문서 유형 확인
```sql
SELECT 
  document_type_code,
  document_type_name,
  requires_approval
FROM approval_document_type
WHERE company_id = 1 
  AND requires_approval = 1
  AND default_template_id IS NULL
  AND is_active = 1;
```

### 분류별 문서 유형 목록
```sql
SELECT 
  document_category,
  GROUP_CONCAT(document_type_name ORDER BY sort_order) as types
FROM approval_document_type
WHERE company_id = 1 AND is_active = 1
GROUP BY document_category;
```

## ✅ 체크리스트

- [ ] 테이블 생성 완료
- [ ] 샘플 데이터 삽입 완료
- [ ] 기본 템플릿 연결 완료
- [ ] API 엔드포인트 구현
- [ ] 프론트엔드 컴포넌트 구현
- [ ] 문서 생성 시 유형 검증 로직 추가
- [ ] 관리자 페이지에서 문서 유형 관리 기능 구현

## 🔗 관련 테이블

- `approval_template`: 기본 결재 양식 설정
- `approval_document`: 실제 결재 문서에서 참조
- `approval_line_template`: 문서 유형별 결재선 템플릿

## 💡 팁

1. **모듈별 색상 테마**: 같은 모듈의 문서 유형은 유사한 색상 사용
2. **아이콘 통일**: Font Awesome, Material Icons 등 일관된 아이콘 라이브러리 사용
3. **정렬 순서**: 자주 사용하는 문서 유형을 상위에 배치
4. **캐싱**: 자주 조회되는 데이터이므로 Redis 등으로 캐싱 권장
5. **다국어 지원**: 필요 시 `document_type_name_en`, `document_type_name_ko` 등 컬럼 추가

## 🚨 주의사항

1. **document_type_code 변경 금지**: 기존 문서와 연결되어 있으므로 코드 변경 시 데이터 일관성 문제 발생
2. **삭제 금지**: `is_active = 0`으로 비활성화만 수행 (소프트 삭제)
3. **company_id 확인**: 멀티테넌시 환경에서 회사 ID 필터링 필수
4. **권한 체크**: 관리자만 문서 유형 추가/수정/삭제 가능하도록 권한 설정
