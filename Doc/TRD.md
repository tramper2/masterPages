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

### 5. 이미지 렌더링 로직 (추가)
- **추출**: `issue.body` 내의 마크다운 이미지 문법(`![text](url)`)에서 첫 번째 이미지 URL을 추출하여 카드 썸네일로 사용.
- **예외 처리**: 본문에 이미지가 없는 경우, 프로젝트 이름의 첫 글자를 딴 아바타나 지정된 Placeholder 이미지를 노출.
- **최적화**: 카드 상단에 고정된 비율(예: 16:9)로 이미지가 출력되도록 CSS(Object-fit: cover) 적용.