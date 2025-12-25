import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent } from '@/components/ui'

export const Route = createLazyFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">
            🔒
          </div>
          <h1 className="text-3xl font-bold">{t('privacy.title')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('privacy.subtitle')}</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Intro */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-accent">{t('privacy.intro.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('privacy.intro.p1')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.intro.p2')}
              </p>
            </CardContent>
          </Card>

          {/* What we collect */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-cyan">{t('privacy.collect.title')}</h2>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.collect.intro')}
              </p>

              <h3 className="mt-4 mb-2 text-sm font-medium text-text-primary">{t('privacy.collect.auth.title')}</h3>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.auth.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.auth.item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.auth.item3')}</span>
                </li>
              </ul>

              <h3 className="mt-4 mb-2 text-sm font-medium text-text-primary">{t('privacy.collect.game.title')}</h3>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.game.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.game.item2')}</span>
                </li>
              </ul>

              <h3 className="mt-4 mb-2 text-sm font-medium text-text-primary">{t('privacy.collect.local.title')}</h3>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.local.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan">-</span>
                  <span>{t('privacy.collect.local.item2')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How we use it */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-green">{t('privacy.use.title')}</h2>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.use.intro')}
              </p>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">-</span>
                  <span>{t('privacy.use.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">-</span>
                  <span>{t('privacy.use.item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">-</span>
                  <span>{t('privacy.use.item3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-green">-</span>
                  <span>{t('privacy.use.item4')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Third parties */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-purple">{t('privacy.thirdParties.title')}</h2>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.thirdParties.intro')}
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple font-medium">Supabase:</span>
                  <span>{t('privacy.thirdParties.supabase')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple font-medium">Google/GitHub:</span>
                  <span>{t('privacy.thirdParties.oauth')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple font-medium">RAE API:</span>
                  <span>{t('privacy.thirdParties.rae')}</span>
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.thirdParties.noSell')}
              </p>
            </CardContent>
          </Card>

          {/* Data retention */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-yellow">{t('privacy.retention.title')}</h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-yellow">-</span>
                  <span>{t('privacy.retention.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-yellow">-</span>
                  <span>{t('privacy.retention.item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-yellow">-</span>
                  <span>{t('privacy.retention.item3')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your rights */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-neon-pink">{t('privacy.rights.title')}</h2>
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.rights.intro')}
              </p>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-pink">-</span>
                  <span>{t('privacy.rights.item1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-pink">-</span>
                  <span>{t('privacy.rights.item2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-pink">-</span>
                  <span>{t('privacy.rights.item3')}</span>
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.rights.contact')}
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card variant="glass">
            <CardContent className="py-6">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">{t('privacy.security.title')}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {t('privacy.security.p1')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('privacy.security.p2')}
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="space-y-4 pt-4 text-center">
            <p className="text-xs text-text-tertiary">{t('privacy.lastUpdated')}</p>
            <div className="flex justify-center gap-3">
              <Link to="/terms">
                <Button variant="ghost" size="sm">{t('privacy.termsLink')}</Button>
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
