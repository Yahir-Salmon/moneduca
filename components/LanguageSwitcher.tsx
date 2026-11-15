'use client'
import { useLanguage } from '@/lib/language'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  return (
    <div className="language-switcher" role="group" aria-label={language === 'es' ? 'Idioma del sitio' : 'Website language'}>
      <button type="button" aria-label="Español" aria-pressed={language === 'es'} className={language === 'es' ? 'selected' : ''} onClick={() => setLanguage('es')}>ES</button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-label="English" aria-pressed={language === 'en'} className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>EN</button>
    </div>
  )
}
