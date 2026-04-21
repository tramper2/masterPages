# TRD: 기술 아키텍처 및 구현 가이드

## 1. 기술 스택
- **Frontend**: HTML5, JavaScript (Vanilla JS), Tailwind CSS (CDN).
- **Backend/DB**: GitHub REST API v3 (Issues API).
- **Hosting**: GitHub Pages.

## 2. API 설계 및 데이터 매핑
- **Endpoint**: `GET /repos/{owner}/{repo}/issues?labels=project&state=open`
- **데이터 매핑 규약**:
    - `issue.title` -> 프로젝트 이름
    - `issue.body` -> 프로젝트 상세 설명 및 URL (파싱 규칙 필요)
    - `issue.created_at` -> 등록 날짜
    - `issue.labels` -> 프로젝트 카테고리 태그로 활용

## 3. 주요 로직
1. **Data Fetching**: 페이지 로드 시 `fetch()`를 사용하여 GitHub API 호출.
2. **Parsing**: Issue 본문의 첫 줄을 프로젝트 연결 URL로 인식하고, 나머지를 설명으로 분리하는 로직 구현.
3. **Error Handling**: 
    - API 호출 제한(Rate Limit) 초과 시 안내 메시지 출력.
    - 데이터가 없을 경우 "등록된 프로젝트가 없습니다" 표시.

## 4. 보안 및 제약사항
- 클라이언트 사이드 호출이므로 API Token 노출 없이 Public API를 사용함.
- Public Repo의 Issue는 읽기 권한이 공개되어 있으므로 민감한 정보는 담지 않음.