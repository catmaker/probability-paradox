import { Link } from 'react-router-dom'
import './home.css'

const BRAND = {
  title: 'VEILSIDE',
  subtitle: 'PARADOX ARCHIVE',
}

const CHAPTERS = ['I', 'II', 'III']

const FEATURED_EXPERIENCE = {
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
  thumbTitle: '몬티 홀 딜레마',
  thumbDesc: '열린 문 이후, 직관은 가장 먼저 틀어집니다.',
  stats: ['KEEP 33.3%', 'SWITCH 66.7%'],
}

export const HomePage = () => (
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
              <Link className="monty-intro__visual" to="/monty-hall">
                <img src="/monty-hall-photo.jpg" alt="어둡고 미스터리한 분위기의 복도와 여러 개의 문 사진" />
                <div className="monty-intro__visual-caption">
                  <p className="font-cinzel">{FEATURED_EXPERIENCE.eyebrow}</p>
                </div>
              </Link>

              <div className="monty-intro__hero-copy">
                <p className="monty-intro__eyebrow font-cinzel">{FEATURED_EXPERIENCE.kicker}</p>
                <h2 className="monty-intro__title">{FEATURED_EXPERIENCE.title}</h2>
                <p className="monty-intro__statement">{FEATURED_EXPERIENCE.statement}</p>
                <p className="monty-intro__english font-cinzel">{FEATURED_EXPERIENCE.english}</p>
                <div className="monty-intro__description">
                  {FEATURED_EXPERIENCE.description.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="monty-intro__stats">
                  {FEATURED_EXPERIENCE.stats.map((stat) => (
                    <span key={stat} className="font-cinzel">{stat}</span>
                  ))}
                </div>

                <div className="monty-intro__actions">
                  <Link className="monty-intro__cta monty-intro__cta--primary font-cinzel" to="/monty-hall">
                    <span>PLAY</span>
                    <span className="monty-intro__cta-arrow" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="monty-intro__chapters" aria-label="체험 순서">
              {CHAPTERS.map((item, index) => (
                <span
                  key={item}
                  className={`monty-intro__chapter-tab font-cinzel ${index === 0 ? 'is-active' : ''}`}
                  aria-hidden={index !== 0}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        </main>

        <footer className="monty-intro__footer">
          <p className="font-cinzel">VEILSIDE</p>
          <p className="font-cinzel">01</p>
          <p className="font-cinzel">{FEATURED_EXPERIENCE.english.toUpperCase()}</p>
        </footer>
      </div>
    </div>
)
