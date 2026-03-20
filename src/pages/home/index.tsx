import { Link } from 'react-router-dom'

const PARADOXES = [
  { id: 'monty-hall', title: '몬티 홀 딜레마', desc: '당신의 직관은 틀렸다', path: '/monty-hall' },
  // 새 역설은 여기에 추가
]

export const HomePage = () => (
  <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center gap-8 p-6">
    <h1 className="text-3xl font-bold text-cyan-400 tracking-widest">확률의 역설</h1>
    <div className="flex flex-col gap-4 w-full max-w-sm">
      {PARADOXES.map((p) => (
        <Link
          key={p.id}
          to={p.path}
          className="border border-cyan-900 rounded-xl p-6 text-center hover:border-cyan-400 hover:bg-cyan-950/30 transition-all"
        >
          <div className="text-cyan-300 text-lg font-semibold">{p.title}</div>
          <div className="text-cyan-700 text-sm mt-1">{p.desc}</div>
        </Link>
      ))}
    </div>
  </div>
)
