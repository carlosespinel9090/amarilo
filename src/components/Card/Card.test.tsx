import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from './Card'

describe('Card', () => {
  it('muestra el título y la descripción', () => {
    render(<Card title="Título" description="Descripción" />)

    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descripción')).toBeInTheDocument()
  })

  it('abre la modal al hacer click', async () => {
    const user = userEvent.setup()
    render(<Card title="Título" description="Descripción" />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
