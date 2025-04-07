# Underwater Wireless Sensor Network Simulator

A web-based visualization tool for simulating underwater wireless sensor networks based on NS-3 simulation code.

## Features

- 3D visualization of underwater sensor nodes and sink nodes
- Interactive visualization of packet transmission between nodes
- Support for different routing protocols (VBF, HHVBF, DBR, EEDBR)
- Configurable simulation parameters
- Real-time statistics during simulation
- Responsive web interface

## Installation

1. Clone this repository
2. Install dependencies
   ```
   npm install
   ```
3. Start the development server
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Configure your simulation parameters in the Settings page
2. Navigate to the Simulation page
3. Click Start Simulation to begin the visualization
4. Use your mouse to rotate, zoom, and pan the 3D view
5. Monitor packet transmission and network statistics in real-time

## Simulation Parameters

- **Number of Sensor Nodes**: The number of underwater sensor nodes in the network
- **Number of Sink Nodes**: The number of sink nodes (currently fixed at 1)
- **Simulation Time**: The duration of the simulation in seconds
- **Data Rate**: The data rate for packet transmission
- **Packet Size**: The size of data packets in bytes
- **Routing Protocol**: The algorithm used for routing packets (VBF, HHVBF, DBR, EEDBR)
- **Number of Packets**: The total number of packets to send during the simulation
- **Packet Interval**: The time interval between packet transmissions
- **Node Movement Speed**: The speed at which nodes move in the underwater environment

## Technologies Used

- React
- Three.js (via React Three Fiber)
- Styled Components

## Original NS-3 Simulation Code

This web simulator is based on the following NS-3 simulation code:

```cpp
#include "ns3/netanim-module.h"
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
double interval = 1.0;
```

## License

MIT 