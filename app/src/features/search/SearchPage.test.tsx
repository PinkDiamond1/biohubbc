import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import SearchPage from './SearchPage';

const history = createMemoryHistory();

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('SearchPage', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Router history={history}>
        <SearchPage />
      </Router>
    );

    expect(getByText('Map')).toBeInTheDocument();
  });
});
