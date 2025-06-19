import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MaterialUIControllerProvider } from 'context';
import AuthProvider from 'context/AuthContext';
import App from './App';

test('shows loading message on startup', () => {
  render(
    <MemoryRouter>
      <MaterialUIControllerProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MaterialUIControllerProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Loading user information\.{3}/i)).toBeInTheDocument();
});