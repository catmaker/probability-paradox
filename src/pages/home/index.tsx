import { useState } from 'react'
import { Link } from 'react-router-dom'
import './home.css'

interface ExperienceCard {
  chapter: string
  kicker: string
  title: string
  statement: string
  english: string
  description: string[]
  eyebrow: string
  stats: string[]
  actionLabel: string
  imageSrc: string
  imageAlt: string
  imageClassName: string
  path: string
  available: boolean
}

const BRAND = {
  title: 'VEILSIDE',
  subtitle: 'PARADOX ARCHIVE',
}

const EXPERIENCES: ExperienceCard[] = [
  {
    chapter: 'I',
    kicker: 'Monty Hall Problem',
    title: '몬티 홀 딜레마',
    statement: '열린 문 이후에도 확률은 반반이 아니다',
    english: 'The Odds Do Not Split Evenly',
    description: [
      '세 개의 문 중 하나를 고르고 나면, 진행자는 정답을 피해서 꽝 문 하나만 엽니다.',
      '그래서 마지막에 남은 두 문은 같은 얼굴로 서 있어 보여도, 같은 확률로 남지 않습니다.',
      '몬티홀은 장면보다 규칙이 더 중요하다는 사실을 가장 조용하게 드러내는 역설입니다.',
    ],
    eyebrow: 'The host already knows which door must stay closed',
    stats: ['KEEP 33.3%', 'SWITCH 66.7%'],
    actionLabel: 'PLAY',
    imageSrc: '/monty-hall-photo.jpg',
    imageAlt: '어둡고 미스터리한 분위기의 복도와 여러 개의 문 사진',
    imageClassName: 'monty-intro__visual--monty',
    path: '/monty-hall',
    available: true,
  },
  {
    chapter: 'II',
    kicker: 'Birthday Problem',
    title: '생일 문제',
    statement: '같은 생일은 생각보다 훨씬 이른 순간 모습을 드러낸다',
    english: 'A Match Hides In A Smaller Room',
    description: [
      '생일이 겹치려면 훨씬 많은 사람이 필요할 것처럼 느껴지지만, 실제 장면은 그 감각보다 먼저 우리를 멈춰 세웁니다.',
      '이 기록은 드문 날짜를 찾는 문제가 아니라, 보이지 않는 충돌 기회가 얼마나 빠르게 늘어나는지를 체험하게 만듭니다.',
      '몇 명쯤 모여야 직관이 흔들리기 시작하는지, 방 안에서 직접 확인하게 됩니다.',
    ],
    eyebrow: 'The room becomes crowded long before it looks full',
    stats: ['QUIET COLLISION', 'UNKNOWN THRESHOLD'],
    actionLabel: 'PLAY',
    imageSrc: '/birthday-problem-photo.jpg',
    imageAlt: '생일 파티를 연상시키는 사람들이 모인 분위기의 사진',
    imageClassName: 'monty-intro__visual--birthday',
    path: '/birthday-problem',
    available: true,
  },
  {
    chapter: 'III',
    kicker: 'Next Archive',
    title: '다음 기록',
    statement: 'VEILSIDE의 세 번째 역설은 아직 열리지 않았다',
    english: 'Another Quiet Betrayal Is Waiting',
    description: [
      '세 번째 장은 아직 비어 있지만, 다음 역설이 들어올 자리는 미리 준비되어 있습니다.',
      '지금은 첫 번째와 두 번째 기록만 열려 있고, 다음 주제는 같은 구조 안에서 이어질 예정입니다.',
      '추가될 콘텐츠는 지금의 톤을 유지하면서도 전혀 다른 방식으로 직관을 배반하게 될 것입니다.',
    ],
    eyebrow: 'The next chapter has not chosen its shape yet',
    stats: ['CHAPTER III', 'IN PREPARATION'],
    actionLabel: 'SOON',
    imageSrc: '',
    imageAlt: '',
    imageClassName: 'monty-intro__visual--placeholder',
    path: '',
    available: false,
  },
]

export const HomePage = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeExperience = EXPERIENCES[activeIndex]

  return (
    <div className="monty-intro">
      <div className="monty-intro__noise" aria-hidden />
      <div className="monty-intro__grid" aria-hidden />
      <div className="monty-intro__glow monty-intro__glow--left" aria-hidden />
      <div className="monty-intro__glow monty-intro__glow--right" aria-hidden />
      <div className="monty-intro__orbit monty-intro__orbit--one" aria-hidden />
      <div className="monty-intro__orbit monty-intro__orbit--two" aria-hidden />
      <div className="monty-intro__dot monty-intro__dot--left" aria-hidden />
      <div className="monty-intro__dot monty-intro__dot--right" aria-hidden />

      <div className="monty-intro__shell">
        <header className="monty-intro__header">
          <div className="monty-intro__brand">
            <span className="monty-intro__brand-mark" aria-hidden="true">
              <span className="monty-intro__brand-mark-ring" />
              <span className="monty-intro__brand-mark-slit" />
            </span>
            <div className="monty-intro__brand-copy">
              <p className="monty-intro__logo">{BRAND.title}</p>
              <p className="monty-intro__logo-sub font-cinzel">{BRAND.subtitle}</p>
            </div>
          </div>
        </header>

        <main className="monty-intro__main">
          <section className="monty-intro__feature">
            <div className="monty-intro__hero">
              {activeExperience.available ? (
                <Link className={`monty-intro__visual ${activeExperience.imageClassName}`} to={activeExperience.path}>
                  <img src={activeExperience.imageSrc} alt={activeExperience.imageAlt} />
                  <div className="monty-intro__visual-caption">
                    <p className="font-cinzel">{activeExperience.eyebrow}</p>
                  </div>
                </Link>
              ) : (
                <div className={`monty-intro__visual ${activeExperience.imageClassName}`}>
                  {activeExperience.imageSrc ? (
                    <img src={activeExperience.imageSrc} alt={activeExperience.imageAlt} />
                  ) : (
                    <div className="monty-intro__visual-placeholder">
                      <span className="font-cinzel">III</span>
                      <p>COMING SOON</p>
                    </div>
                  )}
                  <div className="monty-intro__visual-caption">
                    <p className="font-cinzel">{activeExperience.eyebrow}</p>
                  </div>
                </div>
              )}

              <div className="monty-intro__hero-copy">
                <p className="monty-intro__eyebrow font-cinzel">{activeExperience.kicker}</p>
                <h2 className="monty-intro__title">{activeExperience.title}</h2>
                <p className="monty-intro__statement">{activeExperience.statement}</p>
                <p className="monty-intro__english font-cinzel">{activeExperience.english}</p>
                <div className="monty-intro__description">
                  {activeExperience.description.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="monty-intro__stats">
                  {activeExperience.stats.map((stat) => (
                    <span key={stat} className="font-cinzel">{stat}</span>
                  ))}
                </div>

                <div className="monty-intro__actions">
                  {activeExperience.available ? (
                    <Link className="monty-intro__cta monty-intro__cta--primary font-cinzel" to={activeExperience.path}>
                      <span>{activeExperience.actionLabel}</span>
                      <span className="monty-intro__cta-arrow" aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="monty-intro__cta monty-intro__cta--disabled font-cinzel" aria-disabled="true">
                      <span>{activeExperience.actionLabel}</span>
                      <span className="monty-intro__cta-arrow" aria-hidden="true">→</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="monty-intro__chapters" aria-label="체험 순서">
              {EXPERIENCES.map((item, index) => (
                <button
                  key={item.chapter}
                  type="button"
                  className={`monty-intro__chapter-tab font-cinzel ${index === activeIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                >
                  {item.chapter}
                </button>
              ))}
            </div>
          </section>
        </main>

        <footer className="monty-intro__footer">
          <p className="font-cinzel">VEILSIDE</p>
          <p className="font-cinzel">{String(activeIndex + 1).padStart(2, '0')}</p>
          <p className="font-cinzel">{activeExperience.english.toUpperCase()}</p>
        </footer>
      </div>
    </div>
  )
}
