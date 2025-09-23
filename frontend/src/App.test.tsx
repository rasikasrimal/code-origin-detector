import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the header title', () => {
    render(<App />);
    const matches = screen.getAllByText(/code origin detector/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});

