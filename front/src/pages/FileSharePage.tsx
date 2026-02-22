import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/features/home/HeroSection'
import styles from './FileSharePage.module.css'

/** Page hero uniquement – Figma 9764-346 : DataShare + Se connecter, titre, cercle upload, copyright. */
export function FileSharePage() {
  return (
    <div className={`${styles.page} ${styles.pageHero}`}>
      <Header variant="hero" />
      <main className={styles.mainHero}>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
