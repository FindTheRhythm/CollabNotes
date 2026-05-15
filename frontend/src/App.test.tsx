import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders with Redux Provider', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});