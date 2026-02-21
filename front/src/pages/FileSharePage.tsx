import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ShareFilesSection } from '@/features/files/ShareFilesSection'
import { MyFilesSection } from '@/features/files/MyFilesSection'
import styles from './FileSharePage.module.css'

export function FileSharePage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <ShareFilesSection />
        <MyFilesSection />
      </main>
      <Footer />
    </div>
  )
}
