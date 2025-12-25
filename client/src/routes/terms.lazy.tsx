import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent } from '@/components/ui'

export const Route = createLazyFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">
            📜
          </div>
          <h1 className="text-3xl font-bold">{t('terms.title')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('terms.subtitle')}</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* What is this */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-accent">{t('terms.whatIsThis.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('terms.whatIsThis.p1')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.whatIsThis.p2')}
              </p>
            </CardContent>
          </Card>

          {/* Rules of Play */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-green">{t('terms.rules.title')}</h2>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.rules.intro')}
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">1.</span>
                  <span>{t('terms.rules.rule1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">2.</span>
                  <span>{t('terms.rules.rule2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">3.</span>
                  <span>{t('terms.rules.rule3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">4.</span>
                  <span>{t('terms.rules.rule4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">5.</span>
                  <span>{t('terms.rules.rule5')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Account */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-cyan">{t('terms.account.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('terms.account.p1')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.account.p2')}
              </p>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-purple">{t('terms.content.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('terms.content.p1')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.content.p2')}
              </p>
            </CardContent>
          </Card>

          {/* Consequences */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-pink">{t('terms.consequences.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('terms.consequences.p1')}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-pink">-</span>
                  <span>{t('terms.consequences.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-pink">-</span>
                  <span>{t('terms.consequences.item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-pink">-</span>
                  <span>{t('terms.consequences.item3')}</span>
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.consequences.p2')}
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-yellow">{t('terms.disclaimer.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('terms.disclaimer.p1')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.disclaimer.p2')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('terms.disclaimer.p3')}
              </p>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">{t('terms.changes.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('terms.changes.content')}
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="space-y-4 pt-4 text-center">
            <p className="text-xs text-text-tertiary">{t('terms.lastUpdated')}</p>
            <div className="flex justify-center gap-3">
              <Link to="/privacy">
                <Button variant="ghost" size="sm">{t('terms.privacyLink')}</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">{t('common.back')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
