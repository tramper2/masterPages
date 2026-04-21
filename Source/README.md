# 프로젝트 큐레이션 페이지

GitHub Issues를 데이터베이스로 활용한 프로젝트 큐레이션 페이지입니다. 별도의 백엔드 없이 GitHub Issue 등록만으로 프로젝트를 관리할 수 있습니다.

## 기능

- GitHub API를 통해 `project` 레이블이 있는 이슈들을 카드 형태로 표시
- Issue 본문의 첫 번째 URL을 버튼 링크로 자동 변환
- 반응형 디자인 (모바일/데스크톱 지원)
- 로딩 중 스켈레톤 UI 제공
- 에러 처리 및 빈 상태 UI
- Tailwind CSS를 활용한 모던한 카드 디자인

## 설정

### 1. CONFIG 설정

[`assets/js/app.js`](assets/js/app.js) 파일 상단의 CONFIG를 본인의 GitHub 정보로 수정하세요:

```javascript
const CONFIG = {
    owner: 'YOUR_USERNAME',    // GitHub 사용자명
    repo: 'YOUR_REPO_NAME',    // 저장소 이름
    label: 'project'           // 이슈 레이블
};
```

또는 URL 파라미터로 동적 설정 가능:

```
https://your-page.github.io/?owner=USERNAME&repo=REPO
```

### 2. 레이블 생성

GitHub 저장소의 Issues 탭에서 `project` 레이블을 생성합니다.

## 사용법

### 프로젝트 등록 (관리자)

1. GitHub 저장소의 **Issues** 탭 이동
2. **New Issue** 버튼 클릭
3. 제목에 프로젝트명 입력
4. 본문에 첫 줄은 프로젝트 URL, 다음 줄부터는 설명 작성
5. **Labels**에서 `project` 레이블 선택 후 **Submit**

**예시:**

```
https://example.com/my-project
이 프로젝트는 React와 Node.js를 사용하여 개발된 웹 애플리케이션입니다.
주요 기능: 사용자 인증, 데이터 관리, 실시간 알림
```

### 카테고리 태그 추가

이슈에 추가 레이블을 지정하면 카드 하단에 태그로 표시됩니다.

## GitHub Pages 배포

### 방법 1: Source 루트 디렉토리 배포

1. 저장소 설정 → Pages
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Source 폴더의 내용을 저장소 루트로 복사

### 방법 2: Source 폴더 배포

1. Source 폴더의 내용을 `docs` 폴더로 복사
2. 저장소 설정 → Pages
3. Source: **Deploy from a branch**
4. Branch: **main** / **/docs**

### 방법 3: GitHub Actions 사용

`.github/workflows/deploy.yml` 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v3
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./Source
```

## 파일 구조

```
Source/
├── index.html           # 메인 페이지
├── assets/
│   ├── css/            # 스타일시트 (향후 확장용)
│   └── js/
│       └── app.js      # GitHub API 연동 및 UI 로직
└── README.md           # 이 문서
```

## 기술 스택

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN)
- **Backend/DB**: GitHub REST API v3 (Issues API)
- **Hosting**: GitHub Pages

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

MIT
