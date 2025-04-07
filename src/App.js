import React from 'react';
import styled from 'styled-components';
import Simulation from './components/Simulation';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

function App() {
  return (
    <AppContainer>
      <Simulation />
    </AppContainer>
  );
}

export default App; 