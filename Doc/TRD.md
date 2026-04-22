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

### 6. 페이지네이션 (추가)
- **페이지 단위**: 한 페이지에 최대 9개의 프로젝트 카드를 표시.
- **인덱스 내비게이션**: 하단에 `이전`, `1, 2, 3...`, `다음` 형태의 페이지 버튼을 렌더링하여 페이지 이동을 지원.
- **페이지 범위 표시**: 전체 페이지가 많을 경우 현재 페이지 기준 좌우 1페이지와 첫/마지막 페이지만 노출하고, 나머지는 `···`으로 생략.
- **스크롤 복원**: 페이지 이동 시 `scrollIntoView`를 사용해 프로젝트 섹션 상단으로 부드럽게 스크롤.

### 7. 인기 프로젝트 (추가)
- **클릭 추적**: 프로젝트 카드의 "프로젝트 살펴보기" 버튼 클릭 시 `localStorage`에 `{issueId: clickCount}` 형태로 클릭 횟수를 누적 저장.
- **인기 카드 표시**: 클릭 수 기준 상위 3개의 프로젝트를 페이지 상단 "🔥 인기 프로젝트" 섹션에 별도 그리드로 노출.
- **뱃지**: 인기 카드에는 `TOP 1`, `TOP 2`, `TOP 3` 뱃지를 썸네일 좌측 상단에 표시.
- **예외 처리**: 클릭 데이터가 아직 없는 경우(첫 방문) 인기 프로젝트 섹션을 숨김.