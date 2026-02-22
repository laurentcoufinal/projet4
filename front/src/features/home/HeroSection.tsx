import styles from './HeroSection.module.css'

/**
 * Hero page d'accueil – Figma 9764-346 : titre + zone circulaire upload.
 */
export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className={styles.title}>
        Tu veux partager un fichier ?
      </h1>
      <button type="button" className={styles.pill} aria-label="Partager un fichier">
        <div className={styles.pillInner}>
          <div className={styles.iconWrap} data-svg-wrapper data-size="48">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <g clipPath="url(#heroUploadClip)">
                <path
                  d="M32 32L24 24M24 24L16 32M24 24V42M40.78 36.78C42.7307 35.7165 44.2717 34.0337 45.1597 31.9972C46.0478 29.9607 46.2324 27.6864 45.6844 25.5333C45.1364 23.3803 43.887 21.471 42.1333 20.1069C40.3797 18.7427 38.2217 18.0014 36 18H33.48C32.8746 15.6585 31.7463 13.4846 30.1799 11.642C28.6135 9.79927 26.6497 8.33567 24.4362 7.36118C22.2227 6.3867 19.8171 5.92669 17.4002 6.01573C14.9834 6.10478 12.6181 6.74057 10.4824 7.8753C8.34657 9.01003 6.49582 10.6142 5.06924 12.5671C3.64266 14.5201 2.67738 16.771 2.24596 19.1508C1.81454 21.5305 1.92821 23.977 2.57842 26.3065C3.22864 28.6359 4.39848 30.7877 6 32.6"
                  stroke="#FFEEEC"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="heroUploadClip">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </button>
    </section>
  )
}
