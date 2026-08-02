import { useState } from 'react'
import { Modal } from '../Modal'
import styles from './Card.module.scss'

interface CardProps {
  title: string
  description: string
}

export function Card({ title, description }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={styles.card}
      >
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      >
        <p>{description}</p>
      </Modal>
    </>
  )
}
