# 프로젝트 실행 가이드

## 환경 설정

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

Windows에서는:

```bash
copy .env.example .env
```

### 3. API 키 설정

`.env` 파일을 열고 `GOOGLE_MAPS_API_KEY`에 Google Maps API 키를 입력하세요.

**API 키 발급 방법:**

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. API 및 서비스 > 라이브러리 > Maps SDK for Android 활성화
4. API 및 서비스 > 사용자 인증 정보 > API 키 생성
5. 생성된 API 키를 `.env` 파일에 입력

**팀원에게 공유:**
프로젝트 팀원이라면 별도로 전달받은 API 키를 `.env` 파일에 입력하세요.

### 4. 앱 실행

**Android:**

```bash
npm run android
```

**iOS:**

```bash
cd ios && pod install && cd ..
npm run ios
```

## 주의사항

- `.env` 파일은 git에 포함되지 않습니다 (보안상 이유)
- API 키를 절대 공개 저장소에 올리지 마세요
