# 확률의 역설 — Probability Paradox Visualizer

> 수학적 직관의 함정을 3D 인터랙션으로 체험하는 웹 플랫폼.  
> 첫 번째 콘텐츠: **몬티 홀 딜레마(Monty Hall Problem)**

---

## Tech Stack

| 분류 | 기술 |
|------|------|
| Core | React 19, TypeScript, Vite |
| 3D 렌더링 | Three.js, @react-three/fiber, @react-three/drei |
| 상태 관리 | Zustand |
| 라우팅 | React Router DOM |
| 애니메이션 | Framer Motion |
| 스타일링 | Tailwind CSS v4 |
| 아키텍처 | Feature-Sliced Design (FSD) |

---

## Architecture: Feature-Sliced Design

각 확률 역설을 독립적인 **feature 슬라이스**로 캡슐화하여, 새로운 역설 추가 시 기존 코드를 수정하지 않고 라우트만 추가하면 되도록 설계했습니다.

```
src/
├── app/
│   ├── index.tsx              # App 루트 진입점
│   └── router/index.tsx       # 라우트 정의 (역설 추가 시 여기만 수정)
│
├── pages/                     # 레이아웃 조합 레이어
│   ├── home/                  # 허브 페이지 (역설 목록)
│   └── monty-hall/            # 몬티 홀 페이지
│
├── features/                  # 핵심 비즈니스 로직 (역설별 독립 슬라이스)
│   └── monty-hall/
│       ├── model/store.ts     # Zustand 게임 상태 (stage, 선택, 통계)
│       ├── ui/MontyHallScene  # R3F 3D 씬
│       └── index.ts           # public API (외부 노출 인터페이스)
│
└── shared/                    # 역설 간 공유 자원
    └── three/SceneCanvas.tsx  # 공통 R3F Canvas (조명, 카메라, Environment)
```

### 확장 전략

새로운 역설(예: 생일 문제)을 추가할 때:

1. `src/features/birthday-problem/` 슬라이스 생성
2. `src/pages/birthday-problem/` 페이지 생성
3. `src/app/router/index.tsx`에 라우트 한 줄 추가

기존 코드 수정 없음. `shared/three/SceneCanvas`는 모든 역설이 공유.

---

## 몬티 홀 딜레마: UX 시나리오

```
Stage 1: 순진한 플레이
  → 3개의 문 중 하나 선택 → 진행자가 꽝 문 공개

Stage 2: 인지 부조화 유발
  → 5회 플레이 후 "직관이 50:50이라 속삭이지 않나요?" 모달

Stage 3: 시각적 해체 (핵심)
  → 선택 문: 33.3% 라벨
  → 나머지 두 문: 66.6% 파티클 테두리
  → 꽝 문 열리며 비활성화
  → 66.6% 파티클이 남은 닫힌 문으로 흡수되는 Three.js 애니메이션

Stage 4: 통계적 증명
  → 실시간 통계 대시보드
  → [100번 자동 시뮬레이션] → 대수의 법칙 수렴 시각화
```

---

## Game State (Zustand)

```ts
type GameStage = 'pick' | 'reveal' | 'decide' | 'result'

interface MontyHallState {
  stage: GameStage
  selectedDoor: number | null   // 0 | 1 | 2
  revealedDoor: number | null   // 진행자가 공개한 꽝 문
  prizeDoor: number             // 정답 문
  totalPlays: number
  switchWins: number            // 바꿔서 이긴 횟수
  stayWins: number              // 유지해서 이긴 횟수
}
```

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Roadmap

- [x] FSD 아키텍처 초기 세팅
- [x] 공통 R3F SceneCanvas
- [x] 몬티 홀 Zustand 스토어
- [x] 3D 씬 구현 (Door, 파티클 흡수 애니메이션)
- [x] HTML 오버레이 UI (모달, 통계 대시보드)
- [ ] 모바일 반응형 최적화
- [ ] 생일 문제 등 추가 역설 콘텐츠
