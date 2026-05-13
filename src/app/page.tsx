export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: '🎨',
    title: 'Beautiful Slide Decks',
    description: 'Curriculum-aligned slides designed for Foundation classrooms. Visual, engaging, and classroom-ready.',
    color: 'from-amber-400 to-orange-400',
    bg: 'bg-amber-50',
  },
  {
    icon: '🖼️',
    title: 'Infographic Resources',
    description: 'Single-page visual resources your students will love. Lifecycles, seasons, living things, and more.',
    color: 'from-teal-400 to-cyan-400',
    bg: 'bg-teal-50',
  },
  {
    icon: '📋',
    title: 'Lesson Plans',
    description: 'Practical, curriculum-mapped lesson plans written in plain teacher language. Ready to use.',
    color: 'from-violet-400 to-purple-400',
    bg: 'bg-violet-50',
  },
]

const STEPS = [
  { num: '1', title: 'Choose your topic', desc: 'Pick a curriculum outcome from Australian Foundation Science or English.' },
  { num: '2', title: 'Select resource type', desc: 'Slide deck, infographic, or lesson plan — your choice.' },
  { num: '3', title: 'Review & approve', desc: 'Preview each slide or section. Regenerate anything you want changed.' },
  { num: '4', title: 'Download & teach', desc: 'Export as PDF or image pack and take it straight to class.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-sky-50" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm mb-8">
              <span>✨</span> Made for Australian Foundation teachers
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-stone-900 tracking-tight leading-none mb-6">
              Beautiful classroom<br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                resources in minutes
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-stone-600 font-medium mb-10 leading-relaxed">
              Create curriculum-aligned slides, infographics, and lesson plans designed for Foundation classrooms.
              AI-powered. Teacher-approved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? '/dashboard' : '/signup'}>
                <Button size="xl" className="w-full sm:w-auto">
                  {user ? 'Go to Dashboard' : 'Start creating for free'} →
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-3xl bg-white shadow-2xl border border-amber-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                  </div>
                  <span className="text-white font-bold text-sm">Brightboard — Butterfly Lifecycle · Foundation Science</span>
                </div>
                <div className="aspect-video bg-gradient-to-br from-sky-100 via-teal-50 to-emerald-50 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4 animate-float">🦋</div>
                      <h2 className="text-3xl font-black text-stone-800 mb-2">The Butterfly Lifecycle</h2>
                      <p className="text-stone-500 font-medium">Foundation Science · AC9SFU04</p>
                      <div className="flex gap-6 justify-center mt-6 text-4xl">
                        <span>🥚</span>
                        <span className="text-stone-300">→</span>
                        <span>🐛</span>
                        <span className="text-stone-300">→</span>
                        <span>🫘</span>
                        <span className="text-stone-300">→</span>
                        <span>🦋</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-stone-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-lg text-stone-500 font-medium">Three resource types. Infinite classroom possibilities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className={`rounded-3xl p-8 ${feature.bg} border border-white`}>
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-3xl shadow-md mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-600 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-amber-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-stone-900 mb-4">From idea to classroom in 4 steps</h2>
            <p className="text-lg text-stone-500 font-medium">No prompting. No blank canvases. Just guided clicks.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-amber-200 z-0 -translate-y-1/2" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative bg-white rounded-3xl p-6 border border-amber-100 shadow-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white font-black text-lg mb-4 shadow-md">
                    {step.num}
                  </div>
                  <h3 className="font-black text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-4xl font-black text-white mb-4">Ready to save hours of prep time?</h2>
          <p className="text-xl text-white/80 font-medium mb-10">
            Join Foundation teachers creating beautiful, curriculum-aligned resources with Brightboard.
          </p>
          <Link href={user ? '/create' : '/signup'}>
            <Button size="xl" className="bg-white text-orange-600 hover:bg-amber-50 shadow-lg">
              {user ? 'Create a new resource →' : 'Get started free →'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400">
                <span className="text-sm">✨</span>
              </div>
              <span className="font-black text-white">Brightboard</span>
            </div>
            <p className="text-stone-500 text-sm font-medium">
              Built for Australian Foundation teachers · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
