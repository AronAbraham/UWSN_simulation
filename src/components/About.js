import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
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

const Subtitle = styled.h3`
  color: #1a73e8;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const CodeBlock = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 15px 0;
  font-family: monospace;
  white-space: pre;
`;

function About() {
  return (
    <AboutContainer>
      <Card>
        <Title>About the UWSN Simulator</Title>
        <p>
          The Underwater Wireless Sensor Network (UWSN) Simulator is a web-based visualization tool
          designed to simulate underwater sensor networks based on NS-3 simulation code.
          This tool helps researchers and students understand the behavior and performance
          of underwater wireless sensor networks under various conditions.
        </p>

        <Subtitle>Simulation Features</Subtitle>
        <ul>
          <li>3D visualization of underwater sensor nodes and sink nodes</li>
          <li>Packet transmission visualization between nodes</li>
          <li>Support for different routing protocols (VBF, HHVBF, DBR, EEDBR)</li>
          <li>Configurable simulation parameters</li>
          <li>Real-time statistics during simulation</li>
        </ul>

        <Subtitle>Based on NS-3 Simulation Code</Subtitle>
        <p>
          This simulator is based on the NS-3 simulation code, which provides accurate modeling
          of underwater network environments. The web interface allows for easier visualization
          and interaction with the simulation compared to traditional command-line tools.
        </p>

        <Subtitle>Core Simulation Code</Subtitle>
        <CodeBlock>
          {`#include "ns3/netanim-module.h"
#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/mobility-module.h"
#include "ns3/energy-module.h"
#include "ns3/aqua-sim-ng-module.h"
#include "ns3/applications-module.h"
#include "ns3/internet-module.h"
#include "ns3/log.h"
#include "ns3/callback.h"

// Main simulation parameters
double simStop = 100;
int nodes = 150;
int sink = 1;
int speed = 1;
uint32_t dataRate = 100;
uint32_t packetSize = 64;
int routingoption;
uint32_t numPackets = 100;
double interval = 1.0;`}
        </CodeBlock>

        <Subtitle>How to Use</Subtitle>
        <p>
          1. Configure your simulation parameters in the Settings page<br />
          2. Navigate to the Simulation page<br />
          3. Click Start Simulation to begin the visualization<br />
          4. Use your mouse to rotate, zoom, and pan the 3D view<br />
          5. Monitor packet transmission and network statistics in real-time
        </p>

        <Subtitle>Credits</Subtitle>
        <p>
          This simulator was developed as a web-based frontend for NS-3 underwater sensor network
          simulations. It uses React for the user interface and Three.js for 3D visualization.
        </p>
      </Card>
    </AboutContainer>
  );
}

export default About; 