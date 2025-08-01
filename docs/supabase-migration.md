# Supabase 마이그레이션 가이드

이 문서는 메모 앱을 로컬 스토리지에서 Supabase 데이터베이스로 마이그레이션하는 과정을 설명합니다.

## 완료된 작업

### 1. 패키지 설치
- `@supabase/supabase-js` 설치 완료

### 2. 타입 정의
- `src/types/database.ts`: Supabase 데이터베이스 타입 정의
- 기존 `Memo` 인터페이스와 호환되는 스키마 설계

### 3. Supabase 클라이언트 설정
- `src/lib/supabase.ts`: Supabase 클라이언트 초기화
- 환경 변수를 통한 설정 관리

### 4. 데이터베이스 유틸리티
- `src/utils/supabase.ts`: CRUD 작업을 위한 유틸리티 함수들
  - `getMemos()`: 모든 메모 조회
  - `addMemo()`: 새 메모 생성
  - `updateMemo()`: 메모 수정
  - `deleteMemo()`: 메모 삭제
  - `getMemoById()`: 특정 메모 조회
  - `searchMemos()`: 메모 검색
  - `getMemosByCategory()`: 카테고리별 조회
  - `clearAllMemos()`: 모든 메모 삭제

### 5. 훅 업데이트
- `src/hooks/useMemos.ts`: localStorage 로직을 Supabase로 변경
- 모든 CRUD 함수가 async/await 패턴으로 변경

### 6. 컴포넌트 업데이트
- 모든 컴포넌트들이 새로운 async 함수 시그니처에 맞게 수정
- 에러 처리 및 사용자 피드백 추가

## 데이터베이스 스키마

```sql
CREATE TABLE memos (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_memos_category ON memos(category);
CREATE INDEX idx_memos_created_at ON memos(created_at DESC);
CREATE INDEX idx_memos_tags ON memos USING GIN(tags);

-- RLS 활성화
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (현재는 모든 접근 허용, 필요에 따라 수정)
CREATE POLICY "Allow all access to memos" ON memos
  FOR ALL USING (true);

-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memos_updated_at
    BEFORE UPDATE ON memos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 환경 변수

`.env.local` 파일에 다음 변수들을 설정해야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 주요 변경사항

### 함수 시그니처 변경

| 함수명 | 이전 | 이후 |
|--------|------|------|
| `createMemo` | `(formData: MemoFormData) => Memo` | `(formData: MemoFormData) => Promise<Memo \| null>` |
| `updateMemo` | `(id: string, formData: MemoFormData) => void` | `(id: string, formData: MemoFormData) => Promise<boolean>` |
| `deleteMemo` | `(id: string) => void` | `(id: string) => Promise<boolean>` |
| `clearAllMemos` | `() => void` | `() => Promise<boolean>` |

### 에러 처리

모든 데이터베이스 작업에 try-catch 블록과 사용자 피드백이 추가되었습니다.

## 다음 단계

1. Supabase 프로젝트 생성 및 데이터베이스 스키마 적용
2. 환경 변수 설정
3. 애플리케이션 테스트
4. 필요에 따라 RLS 정책 수정 (인증 시스템 추가 시)

## 트러블슈팅

### 환경 변수 문제
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 변수명이 `NEXT_PUBLIC_` 접두사로 시작하는지 확인

### 데이터베이스 연결 문제
- Supabase 프로젝트 URL과 API 키가 올바른지 확인
- 인터넷 연결 상태 확인

### RLS 정책 문제
- 현재는 모든 접근을 허용하는 정책이 설정되어 있음
- 인증이 필요한 경우 정책을 수정해야 함