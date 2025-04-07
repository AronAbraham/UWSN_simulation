import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  margin-top: 0;
  font-size: 18px;
  color: #1a73e8;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: #1a73e8;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  &:hover {
    background-color: #1557b0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 15px;
`;

const StatItem = styled.div`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1a73e8;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #757575;
`;

const WelcomeSection = styled.div`
  grid-column: 1 / -1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`;

const Title = styled.h1`
  margin-top: 0;
  color: #1a73e8;
`;

function Dashboard() {
  return (
    <>
      <WelcomeSection>
        <Title>Underwater Wireless Sensor Network Simulator</Title>
        <p>Welcome to the UWSN Simulator! This web application allows you to simulate and visualize underwater wireless sensor networks based on the NS-3 simulation code.</p>
        <Button to="/simulation">Start Simulation</Button>
      </WelcomeSection>

      <DashboardContainer>
        <Card>
          <CardTitle>Simulation Parameters</CardTitle>
          <p>Configure and adjust parameters for your UWSN simulation.</p>
          <ul>
            <li>Nodes: 150</li>
            <li>Sink Nodes: 1</li>
            <li>Simulation Time: 100s</li>
            <li>Data Rate: 100</li>
          </ul>
          <Button to="/settings">Adjust Parameters</Button>
        </Card>

        <Card>
          <CardTitle>Quick Start</CardTitle>
          <p>Run a simulation with default parameters to get started quickly.</p>
          <Button to="/simulation">Run Simulation</Button>
        </Card>

        <Card>
          <CardTitle>Simulation Statistics</CardTitle>
          <StatsGrid>
            <StatItem>
              <StatValue>150</StatValue>
              <StatLabel>Sensor Nodes</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>1</StatValue>
              <StatLabel>Sink Nodes</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>100s</StatValue>
              <StatLabel>Simulation Time</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>64B</StatValue>
              <StatLabel>Packet Size</StatLabel>
            </StatItem>
          </StatsGrid>
        </Card>
      </DashboardContainer>
    </>
  );
}

export default Dashboard; 