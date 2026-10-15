import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// Importa la interfaz ContextSelectorProps además del componente
import { HeroContextSelector, type ContextSelectorProps } from './HeroContextSelector';
describe('HeroContextSelector', () => {
  // Se tipa explícitamente mockProps con ContextSelectorProps para validar los tipos exactos
  const mockProps: ContextSelectorProps = {
    careers: [{ id: 1, name: 'Software Development' }],
    subjects: [{ id: 1, name: 'Databases' }],
    topics: [{ id: 1, name: 'JOIN' }],
    selectedCareer: 1,
    selectedSubject: '',
    selectedTopic: '',
    onCareerChange: vi.fn(),
    onSubjectChange: vi.fn(),
    onTopicChange: vi.fn(),
    isLoading: false
  };

  it('renders correctly and displays greetings', () => {
    render(<HeroContextSelector {...mockProps} />);
    expect(screen.getByText(/Estudiante Demo/i)).toBeDefined();
  });

  it('disables subject select if no career is selected', () => {
    render(<HeroContextSelector {...mockProps} selectedCareer={''} />);
    const subjectSelect = screen.getByLabelText(/2\. Asignatura/i);
    expect((subjectSelect as HTMLSelectElement).disabled).toBe(true);
  });

  it('calls onCareerChange when a new career is selected', () => {
    render(<HeroContextSelector {...mockProps} selectedCareer={''} />);
    const careerSelect = screen.getByLabelText(/1\. Carrera/i);
    fireEvent.change(careerSelect, { target: { value: '1' } });
    expect(mockProps.onCareerChange).toHaveBeenCalledWith(1);
  });
});