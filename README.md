# 프로젝트 큐레이션 페이지

GitHub Issues를 데이터베이스로 활용한 프로젝트 큐레이션 페이지입니다.

## 🚀 배포 주소

**https://tramper2.github.io/masterPages/**

## ✨ 기능

- GitHub Issues를 DB로 활용한 무료 호스팅
- `project` 레이블이 있는 이슈들을 카드 형태로 자동 표시
- Issue 본문의 첫 번째 URL을 버튼 링크로 자동 변환
- 반응형 디자인 (모바일/데스크톱 지원)
- 로딩 중 스켈레톤 UI 제공
- 에러 처리 및 빈 상태 UI
- Tailwind CSS 기반 모던한 디자인

## 📁 프로젝트 구조

```
MasterPage/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions 자동 배포 설정
├── Doc/                    # 문서 폴더
│   ├── PRD.md              # 제품 요구사항 문서
│   ├── TRD.md              # 기술 아키텍처 문서
│   ├── USERFLOW.md         # 사용자 흐름 문서
│   └── 개발안내.md          # 개발 가이드
└── Source/                 # 소스 코드 (배포 대상)
    ├── index.html          # 메인 페이지
    ├── assets/
    │   └── js/
    │       └── app.js      # GitHub API 연동 및 UI 로직
    └── README.md           # 상세 가이드
```

## 🛠️ 기술 스택

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN)
- **Backend/DB**: GitHub REST API v3 (Issues API)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📝 사용법

### 프로젝트 등록하기

1. GitHub 저장소의 **Issues** 탭으로 이동
2. **New Issue** 버튼 클릭
3. 제목에 프로젝트명 입력
4. 본문에 첫 줄은 **프로젝트 URL**, 다음 줄부터는 **설명** 작성
5. **Labels**에서 `project` 레이블 선택 후 **Submit**

**예시:**

```
https://example.com/my-project
이 프로젝트는 React와 Node.js를 사용하여 개발된 웹 애플리케이션입니다.
주요 기능: 사용자 인증, 데이터 관리, 실시간 알림
```

### 카테고리 태그 추가

이슈에 추가 레이블을 지정하면 카드 하단에 태그로 표시됩니다.

## ⚙️ 설정 변경

[`Source/assets/js/app.js`](Source/assets/js/app.js) 파일에서 CONFIG를 수정하세요:

```javascript
const CONFIG = {
    owner: 'tramper2',       // GitHub 사용자명
    repo: 'masterPages',     // 저장소 이름
    label: 'project'         // 이슈 레이블
};
```

## 📦 배포

GitHub Actions를 통한 자동 배포가 설정되어 있습니다. main 브랜치에 푸시하면 자동으로 배포됩니다.

## 📄 라이선스

MIT
