import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SimulationModel } from './SimulationModel';

const SimulationContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 20px;
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
  background-color: ${props => props.color};
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
`;

const ControlGroup = styled.div`
  margin-right: 15px;
`;

const Label = styled.label`
  font-size: 14px;
  margin-right: 5px;
`;

const Input = styled.input`
  width: 60px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const SimulationView = styled.div`
  height: 400px;
  background-color: #b3daff;
  border-radius: 8px;
  margin-bottom: 20px;
  position: relative;
`;

const ViewControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const ViewButton = styled.button`
  background-color: #34495e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  margin-left: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #2c3e50;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const StatsCard = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
`;

const StatsTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
`;

const StatItem = styled.div`
  margin-bottom: 8px;
`;

const SpeedSlider = styled.input`
  width: 100px;
`;

const ExportButton = styled.button`
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    background-color: #219a52;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ProtocolDescription = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SimulationCanvas = styled.div`
  width: 100%;
  height: 600px;
  background-color: #001e2f;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

function Simulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nodes, setNodes] = useState(5);
  const [routingProtocol, setRoutingProtocol] = useState('HHVBF');
  const [packetSize, setPacketSize] = useState(64);
  const [speed, setSpeed] = useState(50);
  const [viewMode, setViewMode] = useState('3D');
  const [currentWaterCurrent, setCurrentWaterCurrent] = useState({ x: 0, y: 0, z: 0 });

  // Statistics
  const [packetsSent, setPacketsSent] = useState(0);
  const [packetsReceived, setPacketsReceived] = useState(0);
  const [energyAvg, setEnergyAvg] = useState(0);
  const [energyMax, setEnergyMax] = useState(0);
  const [networkLifetime, setNetworkLifetime] = useState(0);

  // Store energy readings for CSV export
  const [energyReadings, setEnergyReadings] = useState([]);

  // Protocol descriptions
  const protocolDescriptions = {
    VBF: "Vector-Based Forwarding (VBF) protocol creates a virtual 'routing pipe' from source to sink. Only nodes within this pipe participate in forwarding, reducing energy consumption.",
    HHVBF: "Hop-by-Hop Vector-Based Forwarding (HHVBF) improves on VBF by defining multiple routing vectors on a hop-by-hop basis, adapting to sparse deployments better.",
    DBR: "Depth-Based Routing (DBR) protocol uses depth information for forwarding decisions, eliminating the need for full location coordinates. Packets travel from deeper to shallower nodes.",
    EEDBR: "Energy-Efficient Depth-Based Routing (EEDBR) enhances DBR by considering residual energy of sensor nodes, balancing energy consumption across the network.",
    OLSR: "Optimized Link State Routing (OLSR) is a proactive protocol that maintains routes to all destinations. It uses Multipoint Relays (MPRs) to reduce overhead in the flooding process, optimizing for underwater networks with high mobility."
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    setPacketsSent(0);
    setPacketsReceived(0);
    setEnergyAvg(0);
    setEnergyMax(0);
    setNetworkLifetime(0);
    setEnergyReadings([{
      timestamp: 0,
      avgEnergy: 0,
      maxEnergy: 0,
      nodeCount: nodes,
      protocol: routingProtocol
    }]);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setProgress(0);
    setPacketsSent(0);
    setPacketsReceived(0);
    setEnergyAvg(0);
    setEnergyMax(0);
    setNetworkLifetime(0);
    setEnergyReadings([]);
  };

  const exportCSV = () => {
    if (energyReadings.length === 0) return;

    // Create CSV content
    const headers = ['Timestamp(s)', 'AvgEnergy(J)', 'MaxEnergy(J)', 'NodeCount', 'Protocol'];
    const csvContent = [
      headers.join(','),
      ...energyReadings.map(reading =>
        [
          reading.timestamp.toFixed(1),
          reading.avgEnergy.toFixed(2),
          reading.maxEnergy.toFixed(2),
          reading.nodeCount,
          reading.protocol
        ].join(',')
      )
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `uwsn_energy_${routingProtocol}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate water currents changing over time
  useEffect(() => {
    if (isSimulating) {
      const currentInterval = setInterval(() => {
        // Generate mild random currents that change gradually
        setCurrentWaterCurrent({
          x: Math.sin(Date.now() / 10000) * 0.5,
          y: Math.cos(Date.now() / 12000) * 0.3,
          z: Math.sin(Date.now() / 15000) * 0.2
        });
      }, 1000);

      return () => clearInterval(currentInterval);
    }
  }, [isSimulating]);

  useEffect(() => {
    let interval;

    if (isSimulating) {
      let elapsedTime = 0;

      interval = setInterval(() => {
        elapsedTime += 0.2; // 200ms in seconds

        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsSimulating(false);
            return 100;
          }
          return prev + 1;
        });

        // Simulate packets being sent and received based on protocol efficiency
        const protocolEfficiency = {
          VBF: 0.65,  // Basic efficiency
          HHVBF: 0.75, // Better than VBF
          DBR: 0.70,   // Good for depth-based
          EEDBR: 0.80, // Best energy efficiency
          OLSR: 0.72   // Good for mobility but moderate overhead
        };

        const efficiency = protocolEfficiency[routingProtocol] || 0.65;
        const sentIncrement = Math.floor(Math.random() * 3 + 1);
        setPacketsSent(prev => prev + sentIncrement);
        setPacketsReceived(prev => prev + Math.floor(sentIncrement * efficiency * (0.9 + Math.random() * 0.2)));

        // Simulate energy consumption based on protocol
        const energyEfficiency = {
          VBF: 1.0,   // Base energy consumption
          HHVBF: 0.85, // 15% more efficient than VBF
          DBR: 0.90,   // 10% more efficient than VBF
          EEDBR: 0.75, // 25% more efficient than VBF (best energy efficiency)
          OLSR: 1.1    // 10% less efficient than VBF due to control overhead
        };

        const energyFactor = energyEfficiency[routingProtocol] || 1.0;
        const newAvgEnergy = energyAvg + Math.random() * 0.1 * energyFactor;
        const newMaxEnergy = energyMax + Math.random() * 0.15 * energyFactor;

        setEnergyAvg(newAvgEnergy);
        setEnergyMax(newMaxEnergy);
        setNetworkLifetime(prev => prev + 0.1);

        // Record energy reading for CSV export
        setEnergyReadings(prev => [
          ...prev,
          {
            timestamp: elapsedTime,
            avgEnergy: newAvgEnergy,
            maxEnergy: newMaxEnergy,
            nodeCount: nodes,
            protocol: routingProtocol
          }
        ]);

      }, 200);
    }

    return () => clearInterval(interval);
  }, [isSimulating, routingProtocol, nodes, energyAvg, energyMax]);

  return (
    <SimulationContainer>
      <Title>Underwater Wireless Sensor Network Simulation</Title>

      <Legend>
        <LegendItem>
          <LegendDot color="#e74c3c" />
          Sensor Nodes
        </LegendItem>
        <LegendItem>
          <LegendDot color="#2ecc71" />
          Sink Node
        </LegendItem>
        <LegendItem>
          <LegendDot color="#f1c40f" />
          Data Packets
        </LegendItem>
        <LegendItem>
          <LegendDot color="#3498db" />
          Water Current
        </LegendItem>
      </Legend>

      <ProtocolDescription>
        {protocolDescriptions[routingProtocol]}
      </ProtocolDescription>

      <Controls>
        <ControlGroup>
          <Label>Number of Nodes</Label>
          <Input
            type="number"
            value={nodes}
            onChange={e => setNodes(parseInt(e.target.value) || 1)}
            min="1"
            max="150"
          />
        </ControlGroup>

        <ControlGroup>
          <Label>Routing Protocol</Label>
          <Select value={routingProtocol} onChange={e => setRoutingProtocol(e.target.value)}>
            <option value="VBF">VBF</option>
            <option value="HHVBF">HHVBF</option>
            <option value="DBR">DBR</option>
            <option value="EEDBR">EEDBR</option>
            <option value="OLSR">OLSR</option>
          </Select>
        </ControlGroup>

        <ControlGroup>
          <Label>Packet Size</Label>
          <Input
            type="number"
            value={packetSize}
            onChange={e => setPacketSize(parseInt(e.target.value) || 16)}
            min="16"
            max="1024"
          />
        </ControlGroup>

        <ControlGroup>
          <Label>Simulation Speed</Label>
          <SpeedSlider
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={e => setSpeed(parseInt(e.target.value))}
          />
        </ControlGroup>

        <Button onClick={startSimulation} disabled={isSimulating}>
          Start Simulation
        </Button>

        <Button
          onClick={resetSimulation}
          style={{ backgroundColor: '#e74c3c' }}
        >
          Reset
        </Button>

        <ExportButton
          onClick={exportCSV}
          disabled={energyReadings.length === 0}
        >
          Export CSV
        </ExportButton>
      </Controls>

      <SimulationCanvas>
        <Canvas camera={{ position: [0, 0, 600], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enabled={viewMode === '3D'} />
          <SimulationModel
            isSimulating={isSimulating}
            progress={progress}
            nodeCount={nodes}
            viewMode={viewMode}
            routingProtocol={routingProtocol}
            simulationSpeed={speed}
            packetSize={packetSize}
            waterCurrent={currentWaterCurrent}
          />
        </Canvas>

        <ViewControls>
          <ViewButton
            onClick={() => setViewMode('3D')}
            style={{ backgroundColor: viewMode === '3D' ? '#2980b9' : '#34495e' }}
          >
            3D View
          </ViewButton>
          <ViewButton
            onClick={() => setViewMode('2D')}
            style={{ backgroundColor: viewMode === '2D' ? '#2980b9' : '#34495e' }}
          >
            Top View
          </ViewButton>
        </ViewControls>
      </SimulationCanvas>

      <StatsContainer>
        <StatsCard>
          <StatsTitle>Network Statistics</StatsTitle>
          <StatItem>Packets sent: {packetsSent}</StatItem>
          <StatItem>Packets received: {packetsReceived}</StatItem>
          <StatItem>Packet delivery ratio: {packetsSent > 0 ? Math.round((packetsReceived / packetsSent) * 100) : 0}%</StatItem>
          <StatItem>Current: X:{currentWaterCurrent.x.toFixed(2)} Y:{currentWaterCurrent.y.toFixed(2)} Z:{currentWaterCurrent.z.toFixed(2)}</StatItem>
        </StatsCard>

        <StatsCard>
          <StatsTitle>Energy Consumption</StatsTitle>
          <StatItem>Average energy used: {energyAvg.toFixed(1)} J</StatItem>
          <StatItem>Max energy used: {energyMax.toFixed(1)} J</StatItem>
          <StatItem>Network lifetime: {networkLifetime.toFixed(1)} s</StatItem>
        </StatsCard>
      </StatsContainer>
    </SimulationContainer>
  );
}

export default Simulation; 