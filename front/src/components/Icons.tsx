/** Icône logo DataShare : partage (un nœud relié à deux autres) */
export function IconShareLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="8" cy="22" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="24" cy="22" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M13 13 L10 19 M19 13 L22 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Icône upload : flèche vers le haut depuis une ligne de base, dans un cadre carré */
export function IconUpload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 6 v6 M12 6 l-3 3 M12 6 l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 16 h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Icône liste / Mes fichiers : trois lignes horizontales (hamburger) */
export function IconList({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M5 7 h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12 h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 17 h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Icône trois points verticaux (menu d’actions mobile) */
export function IconDotsVertical({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8.00016 8.66663C8.36835 8.66663 8.66683 8.36815 8.66683 7.99996C8.66683 7.63177 8.36835 7.33329 8.00016 7.33329C7.63197 7.33329 7.3335 7.63177 7.3335 7.99996C7.3335 8.36815 7.63197 8.66663 8.00016 8.66663Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00016 3.99996C8.36835 3.99996 8.66683 3.70148 8.66683 3.33329C8.66683 2.9651 8.36835 2.66663 8.00016 2.66663C7.63197 2.66663 7.3335 2.9651 7.3335 3.33329C7.3335 3.70148 7.63197 3.99996 8.00016 3.99996Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00016 13.3333C8.36835 13.3333 8.66683 13.0348 8.66683 12.6666C8.66683 12.2984 8.36835 12 8.00016 12C7.63197 12 7.3335 12.2984 7.3335 12.6666C7.3335 13.0348 7.63197 13.3333 8.00016 13.3333Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Icône nuage + flèche vers le haut (upload) – design Figma hero 9764-346 */
export function IconCloudUpload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Nuage */}
      <path
        d="M6 16.7a4 4 0 0 1 2-7.2 5 5 0 0 1 9-1 3.5 3.5 0 0 1 2.5 6 3 3 0 0 1-1.5 5.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Flèche vers le haut (centrée sous le nuage) */}
      <path
        d="M12 17v-6M12 11l-3 3M12 11l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Icône utilisateur / Connexion : buste avec cercle */
export function IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M5 21 a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
