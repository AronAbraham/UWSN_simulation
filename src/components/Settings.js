import React, { useState } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #1a73e8;
  margin-top: 0;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 16px;
  grid-column: span 2;
  
  &:hover {
    background-color: #1557b0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  grid-column: span 2;
  justify-content: flex-end;
  margin-top: 10px;
`;

const Description = styled.p`
  margin-bottom: 20px;
  color: #666;
`;

function Settings() {
  const [settings, setSettings] = useState({
    nodes: 150,
    sink: 1,
    simulationTime: 100,
    dataRate: 100,
    packetSize: 64,
    routingOption: 0,
    numPackets: 100,
    interval: 1.0,
    speed: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would save the settings, perhaps to localStorage or a context
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings({
      nodes: 150,
      sink: 1,
      simulationTime: 100,
      dataRate: 100,
      packetSize: 64,
      routingOption: 0,
      numPackets: 100,
      interval: 1.0,
      speed: 1
    });
  };

  return (
    <SettingsContainer>
      <Card>
        <Title>Simulation Settings</Title>
        <Description>
          Adjust the parameters for your underwater wireless sensor network simulation.
          These settings will be applied the next time you run a simulation.
        </Description>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="nodes">Number of Sensor Nodes</Label>
            <Input
              type="number"
              id="nodes"
              name="nodes"
              value={settings.nodes}
              onChange={handleChange}
              min="1"
              max="500"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="sink">Number of Sink Nodes</Label>
            <Input
              type="number"
              id="sink"
              name="sink"
              value={settings.sink}
              onChange={handleChange}
              min="1"
              max="10"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="simulationTime">Simulation Time (seconds)</Label>
            <Input
              type="number"
              id="simulationTime"
              name="simulationTime"
              value={settings.simulationTime}
              onChange={handleChange}
              min="10"
              max="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="dataRate">Data Rate</Label>
            <Input
              type="number"
              id="dataRate"
              name="dataRate"
              value={settings.dataRate}
              onChange={handleChange}
              min="10"
              max="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="packetSize">Packet Size (bytes)</Label>
            <Input
              type="number"
              id="packetSize"
              name="packetSize"
              value={settings.packetSize}
              onChange={handleChange}
              min="16"
              max="1024"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="routingOption">Routing Protocol</Label>
            <Select
              id="routingOption"
              name="routingOption"
              value={settings.routingOption}
              onChange={handleChange}
            >
              <option value="0">Basic (No Protocol)</option>
              <option value="1">VBF</option>
              <option value="2">HHVBF</option>
              <option value="3">DBR</option>
              <option value="4">EEDBR</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="numPackets">Number of Packets</Label>
            <Input
              type="number"
              id="numPackets"
              name="numPackets"
              value={settings.numPackets}
              onChange={handleChange}
              min="10"
              max="1000"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="interval">Packet Interval (seconds)</Label>
            <Input
              type="number"
              id="interval"
              name="interval"
              value={settings.interval}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              max="10"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="speed">Node Movement Speed</Label>
            <Input
              type="number"
              id="speed"
              name="speed"
              value={settings.speed}
              onChange={handleChange}
              min="0"
              max="10"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={handleReset} style={{ backgroundColor: '#f5f5f5', color: '#333' }}>
              Reset to Defaults
            </Button>
            <Button type="submit">Save Settings</Button>
          </ButtonGroup>
        </Form>
      </Card>
    </SettingsContainer>
  );
}

export default Settings;