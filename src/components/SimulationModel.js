import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';

// Water current visualization
const WaterCurrentIndicator = ({ current }) => {
  const arrowRef = useRef();
  const strength = Math.sqrt(current.x * current.x + current.y * current.y + current.z * current.z);

  useEffect(() => {
    if (arrowRef.current) {
      // Point the arrow in the direction of the current
      if (strength > 0) {
        const direction = new THREE.Vector3(current.x, current.y, current.z).normalize();
        const upVector = new THREE.Vector3(0, 1, 0);

        if (Math.abs(direction.dot(upVector)) < 0.99) {
          arrowRef.current.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
          );
        }
      }
    }
  }, [current, strength]);

  // Don't render indicator if current is zero
  if (strength < 0.01) return null;

  return (
    <group position={[150, 30, 150]} ref={arrowRef}>
      <mesh>
        <cylinderGeometry args={[2, 2, 30 * strength, 8]} />
        <meshStandardMaterial color="#00A6ED" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 15 * strength + 5, 0]}>
        <coneGeometry args={[5, 10, 8]} />
        <meshStandardMaterial color="#00A6ED" transparent opacity={0.7} />
      </mesh>
      <Text
        position={[0, 30 * strength, 0]}
        color="#FFFFFF"
        fontSize={12}
        anchorX="center"
        anchorY="middle"
      >
        {strength.toFixed(2)} m/s
      </Text>
    </group>
  );
};

// Generate random positions for sensor nodes with stratified distribution
const generateNodes = (count) => {
  const nodes = [];

  // Create a more realistic 3D grid distribution for underwater sensors
  const xSpread = 300;
  const ySpread = 300;
  const zMin = -250;
  const zMax = -30;

  for (let i = 0; i < count; i++) {
    // Use a more stratified distribution for realistic underwater deployment
    const depth = zMin + (Math.random() * 0.7 + 0.3) * (zMax - zMin); // Bias toward deeper positions

    nodes.push({
      id: i,
      position: [
        (Math.random() * xSpread - xSpread / 2),
        (Math.random() * ySpread - ySpread / 2),
        depth
      ],
      isActive: false,
      lastActive: 0,
      color: '#e74c3c',
      energy: 100, // Initial energy level (100%)
      depth: 0, // Will be calculated based on position
      velocity: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.05
      },
      // OLSR specific properties
      mprs: [], // Multipoint relays for OLSR
      neighbors: [], // 1-hop neighbors
      twoHopNeighbors: [] // 2-hop neighbors
    });
  }
  return nodes;
};

// Define the sink node position
const sinkPosition = [0, 0, 0];

// Calculate distance between two points
const calculateDistance = (pos1, pos2) => {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) +
    Math.pow(pos1[1] - pos2[1], 2) +
    Math.pow(pos1[2] - pos2[2], 2)
  );
};

// Calculate vector from pos1 to pos2
const calculateVector = (pos1, pos2) => {
  return [
    pos2[0] - pos1[0],
    pos2[1] - pos1[1],
    pos2[2] - pos1[2]
  ];
};

// Calculate dot product of two vectors
const dotProduct = (vec1, vec2) => {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
};

// Normalize a vector
const normalizeVector = (vec) => {
  const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  return [vec[0] / length, vec[1] / length, vec[2] / length];
};

// Calculate node depth (distance from water surface)
const calculateNodeDepth = (position) => {
  // Position[1] is the y-coordinate (depth in 3D space)
  return Math.abs(position[1]);
};

// SensorNode component
const SensorNode = React.forwardRef(({ nodeId, position, color, isActive, isSimulating, energy, waterCurrent, isMPR, viewMode }, ref) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const [pos, setPos] = useState(position);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [prevTime, setPrevTime] = useState(Date.now());

  // Effect to update parent ref with position
  useEffect(() => {
    if (ref && typeof ref === 'object') {
      ref.current = groupRef.current;
    }
  }, [ref]);

  // Apply random movement and water current to the node
  useFrame(() => {
    if (!isSimulating || !groupRef.current) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - prevTime) / 1000; // Convert to seconds
    setPrevTime(currentTime);

    // Apply water current and random movement
    const randomFactor = 0.02;
    const newVelocity = {
      x: (velocity.x + (Math.random() - 0.5) * randomFactor) * 0.95 + waterCurrent.x * 0.05,
      y: (velocity.y + (Math.random() - 0.5) * randomFactor) * 0.95 + waterCurrent.y * 0.05,
      z: (velocity.z + (Math.random() - 0.5) * randomFactor) * 0.95 + waterCurrent.z * 0.05
    };

    setVelocity(newVelocity);

    // Update position based on velocity
    const newPos = [
      pos[0] + newVelocity.x * deltaTime * 10,
      pos[1] + newVelocity.y * deltaTime * 10,
      pos[2] + newVelocity.z * deltaTime * 10
    ];
    setPos(newPos);

    // Ensure nodes stay within bounds
    const boundaryRadius = 200;
    if (Math.sqrt(newPos[0] * newPos[0] + newPos[2] * newPos[2]) > boundaryRadius) {
      // Apply a force towards the center
      const angle = Math.atan2(newPos[2], newPos[0]);
      setVelocity(prev => ({
        x: prev.x - Math.cos(angle) * 0.1,
        y: prev.y,
        z: prev.z - Math.sin(angle) * 0.1
      }));
    }

    // Keep nodes underwater but not too deep
    if (newPos[1] > -5) {
      setVelocity(prev => ({ ...prev, y: -0.1 }));
    } else if (newPos[1] < -100) {
      setVelocity(prev => ({ ...prev, y: 0.1 }));
    }

    // Update the group position (moves everything together)
    groupRef.current.position.set(newPos[0], newPos[1], newPos[2]);
  });

  // Calculate node color based on energy level
  const nodeColor = isActive
    ? "#ff9800" // Orange for active nodes
    : energy > 60
      ? color // Original color for high energy
      : energy > 30
        ? "#ffeb3b" // Yellow for medium energy
        : "#f44336"; // Red for low energy

  const nodeMaterial = isActive
    ? <meshStandardMaterial color={nodeColor} emissive={nodeColor} emissiveIntensity={0.5} />
    : <meshStandardMaterial color={nodeColor} />;

  return (
    <group position={[0, 0, 0]} ref={ref}>
      {/* Use a nested group to handle movement */}
      <group ref={groupRef} position={pos}>
        {/* Main node sphere */}
        <mesh ref={meshRef} userData={{ nodeId }}>
          <sphereGeometry args={[4, 16, 16]} />
          {nodeMaterial}
        </mesh>

        {/* Energy indicator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6, 0.6, 16, 32, Math.PI * 2 * (energy / 100)]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>

        {/* MPR indicator for OLSR */}
        {isMPR && (
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial color="#E91E63" />
          </mesh>
        )}

        {/* Node energy text */}
        <Text
          position={[0, -8, 0]}
          color="white"
          fontSize={4}
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(energy)}%
        </Text>
      </group>
    </group>
  );
});

// SinkNode component
const SinkNode = ({ position }) => {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[7, 10, 15, 16]} />
        <meshStandardMaterial color="#2196f3" emissive="#2196f3" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 10, 0]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshStandardMaterial color="#2196f3" emissive="#2196f3" emissiveIntensity={0.5} />
      </mesh>
      <Text
        position={[0, 20, 0]}
        color="white"
        fontSize={7}
        anchorX="center"
        anchorY="middle"
      >
        SINK
      </Text>
    </group>
  );
};

// Communication path visualization
const CommunicationPath = ({ startPos, endPos, protocol }) => {
  // Different protocols have different visualization styles
  const getPathColor = () => {
    switch (protocol) {
      case 'VBF': return '#f44336'; // Red
      case 'HHVBF': return '#9c27b0'; // Purple
      case 'DBR': return '#4caf50'; // Green
      case 'EEDBR': return '#ff9800'; // Orange
      case 'OLSR': return '#00bcd4'; // Cyan
      default: return '#bbbbbb'; // Gray
    }
  };

  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={2}
          array={new Float32Array([...startPos, ...endPos])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color={getPathColor()} opacity={0.3} transparent />
    </line>
  );
};

// Packet visualization
const Packet = ({ startPos, endPos, progress, protocol, isControl, sourceNodeId, targetNodeId, nodeRefs }) => {
  // Use a bright, highly visible color to make packets easy to see
  const packetColor = isControl
    ? '#FF5722' // Control packets (OLSR)
    : '#FFEB3B'; // Yellow for high visibility

  // Make packets larger for better visibility
  const size = 3.5;

  // Directly calculate position from start to end
  const position = [
    startPos[0] + (endPos[0] - startPos[0]) * progress,
    startPos[1] + (endPos[1] - startPos[1]) * progress,
    startPos[2] + (endPos[2] - startPos[2]) * progress
  ];

  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={packetColor} />
    </mesh>
  );
};

// Water surface visualization
const WaterSurface = () => {
  const meshRef = useRef();

  // Use basic material with color instead of shaderMaterial for stability
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} ref={meshRef}>
      <planeGeometry args={[400, 400, 32, 32]} />
      <meshStandardMaterial
        color="#2196f3"
        transparent
        opacity={0.4}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
};

// Calculate which nodes are neighbors of each node (for OLSR)
const calculateNeighbors = (nodes, range = 100) => {
  const nodesWithNeighbors = [...nodes];

  // Calculate 1-hop neighbors for each node
  for (let i = 0; i < nodesWithNeighbors.length; i++) {
    const neighbors = [];

    for (let j = 0; j < nodesWithNeighbors.length; j++) {
      if (i !== j) {
        const distance = calculateDistance(
          nodesWithNeighbors[i].position,
          nodesWithNeighbors[j].position
        );

        if (distance <= range) {
          neighbors.push(j); // Store node index as neighbor
        }
      }
    }

    nodesWithNeighbors[i].neighbors = neighbors;
  }

  // Calculate 2-hop neighbors for each node
  for (let i = 0; i < nodesWithNeighbors.length; i++) {
    const twoHopNeighbors = new Set();

    // For each 1-hop neighbor, get their neighbors (excluding the current node and already known 1-hop neighbors)
    nodesWithNeighbors[i].neighbors.forEach(neighborIdx => {
      const neighborNode = nodesWithNeighbors[neighborIdx];

      neighborNode.neighbors.forEach(twoHopIdx => {
        if (twoHopIdx !== i && !nodesWithNeighbors[i].neighbors.includes(twoHopIdx)) {
          twoHopNeighbors.add(twoHopIdx);
        }
      });
    });

    nodesWithNeighbors[i].twoHopNeighbors = Array.from(twoHopNeighbors);
  }

  return nodesWithNeighbors;
};

// Select MPRs for OLSR
const selectMPRs = (nodes) => {
  const nodesWithMPRs = [...nodes];

  // For each node, select MPRs
  for (let i = 0; i < nodesWithMPRs.length; i++) {
    const node = nodesWithMPRs[i];
    const mprs = []; // Selected MPRs

    // If node has 2-hop neighbors that need to be covered
    if (node.twoHopNeighbors.length > 0) {
      const uncoveredTwoHopNeighbors = new Set(node.twoHopNeighbors);

      // First, find 1-hop neighbors that are the only ones reaching some 2-hop neighbors
      const uniqueReachMap = new Map(); // Maps 2-hop neighbor to 1-hop neighbors that reach it

      node.neighbors.forEach(neighborIdx => {
        const neighbor = nodesWithMPRs[neighborIdx];

        neighbor.neighbors.forEach(potentialTwoHopIdx => {
          if (!node.neighbors.includes(potentialTwoHopIdx) && potentialTwoHopIdx !== i) {
            if (!uniqueReachMap.has(potentialTwoHopIdx)) {
              uniqueReachMap.set(potentialTwoHopIdx, []);
            }
            uniqueReachMap.get(potentialTwoHopIdx).push(neighborIdx);
          }
        });
      });

      // Select 1-hop neighbors that are the only ones to reach certain 2-hop neighbors
      uniqueReachMap.forEach((reachingNeighbors, twoHopIdx) => {
        if (reachingNeighbors.length === 1) {
          mprs.push(reachingNeighbors[0]);
          uncoveredTwoHopNeighbors.delete(twoHopIdx);
        }
      });

      // While there are still uncovered 2-hop neighbors
      while (uncoveredTwoHopNeighbors.size > 0) {
        let bestNeighbor = -1;
        let maxCoverage = 0;

        // Find the neighbor that covers the most uncovered 2-hop neighbors
        node.neighbors.forEach(neighborIdx => {
          if (!mprs.includes(neighborIdx)) {
            const neighbor = nodesWithMPRs[neighborIdx];
            let coverage = 0;

            neighbor.neighbors.forEach(potentialTwoHopIdx => {
              if (uncoveredTwoHopNeighbors.has(potentialTwoHopIdx)) {
                coverage++;
              }
            });

            if (coverage > maxCoverage) {
              maxCoverage = coverage;
              bestNeighbor = neighborIdx;
            }
          }
        });

        if (bestNeighbor !== -1) {
          mprs.push(bestNeighbor);

          // Remove newly covered 2-hop neighbors
          const bestNeighborNode = nodesWithMPRs[bestNeighbor];
          bestNeighborNode.neighbors.forEach(potentialTwoHopIdx => {
            uncoveredTwoHopNeighbors.delete(potentialTwoHopIdx);
          });
        } else {
          // No more neighbors can cover remaining 2-hop neighbors
          break;
        }
      }
    }

    nodesWithMPRs[i].mprs = mprs;
  }

  return nodesWithMPRs;
};

// Choose next hop nodes based on routing protocol
const selectNextHopNodes = (sourceNode, nodes, routingProtocol) => {
  switch (routingProtocol) {
    case 'VBF': {
      // In VBF, nodes within a virtual pipeline toward sink are selected
      const pipeRadius = 50; // The radius of virtual pipeline
      const sourceToSinkVector = calculateVector(sourceNode.position, sinkPosition);
      const normalizedVector = normalizeVector(sourceToSinkVector);

      return nodes.filter(node => {
        // Don't select self or nodes with very low energy
        if (node.id === sourceNode.id || node.energy < 10) return false;

        // Calculate node's distance to the virtual pipe
        const sourceToCandidateVector = calculateVector(sourceNode.position, node.position);
        const projectionLength = dotProduct(sourceToCandidateVector, normalizedVector);

        // Only select nodes closer to sink than source
        if (projectionLength <= 0) return false;

        // Create projection point on the vector
        const projectionPoint = [
          sourceNode.position[0] + normalizedVector[0] * projectionLength,
          sourceNode.position[1] + normalizedVector[1] * projectionLength,
          sourceNode.position[2] + normalizedVector[2] * projectionLength
        ];

        // Calculate distance to the projection point (distance to pipe)
        const distanceToPipe = calculateDistance(node.position, projectionPoint);

        // Node must be within pipe radius
        return distanceToPipe <= pipeRadius;
      });
    }

    case 'HHVBF': {
      // In HHVBF, we calculate the vector for each hop
      const pipeRadius = 70; // Larger radius for HHVBF
      return nodes.filter(node => {
        // Don't select self or nodes with very low energy
        if (node.id === sourceNode.id || node.energy < 10) return false;

        // Calculate distance between nodes
        const distance = calculateDistance(sourceNode.position, node.position);

        // Only consider nodes within certain range but not too close
        if (distance < 20 || distance > 150) return false;

        // Calculate if this node is closer to sink
        const distanceToSink = calculateDistance(node.position, sinkPosition);
        const sourceDistanceToSink = calculateDistance(sourceNode.position, sinkPosition);

        return distanceToSink < sourceDistanceToSink;
      });
    }

    case 'DBR': {
      // In DBR, packets move from higher depth to lower depth
      return nodes.filter(node => {
        // Don't select self or nodes with very low energy
        if (node.id === sourceNode.id || node.energy < 10) return false;

        // In DBR, we only care about depth (nodes closer to surface)
        return node.depth < sourceNode.depth;
      });
    }

    case 'EEDBR': {
      // EEDBR considers both depth and energy
      return nodes.filter(node => {
        // Don't select self or nodes with very low energy
        if (node.id === sourceNode.id || node.energy < 10) return false;

        // In EEDBR, we prefer nodes with less depth and more energy
        return node.depth < sourceNode.depth;
      }).sort((a, b) => {
        // Sort based on a weighted combination of depth and energy
        const weightA = (100 - a.depth) * 0.7 + a.energy * 0.3;
        const weightB = (100 - b.depth) * 0.7 + b.energy * 0.3;
        return weightB - weightA; // Higher weight is better
      });
    }

    case 'OLSR': {
      // In OLSR, packets are routed through MPRs for efficient flooding

      // First, check if the sink is directly reachable
      const distanceToSink = calculateDistance(sourceNode.position, sinkPosition);
      if (distanceToSink < 100) {
        // Direct transmission to sink
        return [];
      }

      // If source is an MPR selector, use MPRs for routing
      if (sourceNode.mprs && sourceNode.mprs.length > 0) {
        // Filter to only MPRs with enough energy
        const mprNodes = sourceNode.mprs
          .map(mprId => nodes.find(node => node.id === mprId))
          .filter(node => node && node.energy > 20);

        if (mprNodes.length > 0) {
          // Sort MPRs by distance to sink and energy
          return mprNodes.sort((a, b) => {
            const distA = calculateDistance(a.position, sinkPosition);
            const distB = calculateDistance(b.position, sinkPosition);
            // Consider both distance to sink and energy
            const scoreA = distA * 0.7 - a.energy * 0.3;
            const scoreB = distB * 0.7 - b.energy * 0.3;
            return scoreA - scoreB; // Lower score is better
          });
        }
      }

      // Fallback: use greedy forwarding based on neighbors
      // Filter to only neighbors with enough energy
      const neighbors = (sourceNode.neighbors || [])
        .map(neighborId => nodes.find(node => node.id === neighborId))
        .filter(node => node && node.energy > 10);

      // Sort neighbors by distance to sink
      return neighbors.sort((a, b) => {
        const distA = calculateDistance(a.position, sinkPosition);
        const distB = calculateDistance(b.position, sinkPosition);
        return distA - distB; // Lower distance is better
      });
    }

    default:
      // Default: select random nodes
      return nodes.filter(node =>
        node.id !== sourceNode.id && node.energy > 10
      );
  }
};

// Create a dedicated debug packet visualization that's guaranteed to show up
const DebugPacket = ({ position, size = 7, color = '#FF0000' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} />
      <directionalLight position={[0, 0, 5]} intensity={1} />
    </mesh>
  );
};

// Update the Simulation model to include some debug packets
export const SimulationModel = ({
  isSimulating,
  progress,
  nodeCount = 5,
  viewMode = '3D',
  routingProtocol = 'HHVBF',
  simulationSpeed = 50,
  packetSize = 64,
  waterCurrent = { x: 0, y: 0, z: 0 }
}) => {
  const [nodes, setNodes] = useState([]);
  const [activeNodes, setActiveNodes] = useState([]);
  const [packets, setPackets] = useState([]);
  const [olsrInterval, setOlsrInterval] = useState(null);
  const [nodeRefs, setNodeRefs] = useState({});
  const [nodePositions, setNodePositions] = useState({});

  // Initialize nodes when count changes
  useEffect(() => {
    const newNodes = generateNodes(nodeCount);

    // Calculate depth for each node
    newNodes.forEach(node => {
      node.depth = calculateNodeDepth(node.position);
    });

    setNodes(newNodes);

    // Initialize refs for each node
    const refs = {};
    newNodes.forEach(node => {
      refs[node.id] = {
        ref: React.createRef(),
        currentPos: [...node.position]
      };
    });
    setNodeRefs(refs);
  }, [nodeCount]);

  // Set camera and positions for different view modes
  useEffect(() => {
    if (viewMode === '2D') {
      // Update node positions for 2D view
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          position: [node.position[0], node.position[1], -20], // Fixed depth
          depth: 20 // Fixed depth for 2D view
        }))
      );
    }
  }, [viewMode]);

  // Activate nodes during simulation
  useEffect(() => {
    if (isSimulating) {
      const speedFactor = simulationSpeed / 50; // Normalize speed (50 is default)
      const interval = setInterval(() => {
        // Adjust node energy based on activity
        setNodes(prevNodes => {
          return prevNodes.map(node => {
            // Reduce energy for all nodes slightly
            let newEnergy = node.energy - (0.01 * speedFactor);

            // Activate more nodes to increase packet generation
            if (Math.random() < 0.3 * speedFactor && !node.isActive && newEnergy > 20) {
              return {
                ...node,
                isActive: true,
                lastActive: Date.now(),
                energy: Math.max(0, newEnergy)
              };
            }

            return {
              ...node,
              energy: Math.max(0, newEnergy)
            };
          });
        });

        // Update active nodes list
        const active = nodes.filter(node => node.energy > 10);
        // Force at least half the nodes to be active for better visualization
        const forcedActive = [...active];
        while (forcedActive.length < Math.max(2, Math.floor(nodes.length / 2))) {
          const inactiveNodes = nodes.filter(n => !forcedActive.includes(n));
          if (inactiveNodes.length === 0) break;
          forcedActive.push(inactiveNodes[0]);
        }
        setActiveNodes(forcedActive);

      }, 300 / speedFactor);

      return () => clearInterval(interval);
    }
  }, [isSimulating, nodes, simulationSpeed]);

  // Track node positions and create packets
  useFrame(() => {
    // Update node references
    nodes.forEach(node => {
      if (nodeRefs[node.id]?.ref?.current) {
        // Store current node positions in a local state for use by packets
        setNodePositions(prev => ({
          ...prev,
          [node.id]: [
            nodeRefs[node.id].ref.current.position.x,
            nodeRefs[node.id].ref.current.position.y,
            nodeRefs[node.id].ref.current.position.z
          ]
        }));
      }
    });

    // Only process if simulation is running
    if (!isSimulating) return;

    // Create dynamic packets between nodes
    if (packets.length < 10 && Math.random() < 0.05) {
      // Find two random nodes for packet transmission
      if (nodes.length >= 2) {
        const sourceIdx = Math.floor(Math.random() * nodes.length);
        let targetIdx;
        do {
          targetIdx = Math.floor(Math.random() * nodes.length);
        } while (targetIdx === sourceIdx);

        const sourceNode = nodes[sourceIdx];
        const targetNode = nodes[targetIdx];

        // Get current positions from refs if available
        let startPos = [...sourceNode.position];
        let endPos = [...targetNode.position];

        const sourceRef = nodeRefs[sourceNode.id]?.ref.current;
        const targetRef = nodeRefs[targetNode.id]?.ref.current;

        if (sourceRef && sourceRef.position) {
          startPos = [sourceRef.position.x, sourceRef.position.y, sourceRef.position.z];
        }

        if (targetRef && targetRef.position) {
          endPos = [targetRef.position.x, targetRef.position.y, targetRef.position.z];
        }

        // Create a packet between these nodes with smaller size
        const colors = ['#FF0000', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        setPackets(prev => [...prev, {
          id: `packet-${Date.now()}`,
          startPos: startPos,
          endPos: endPos,
          progress: 0,
          color: color,
          size: 3, // Smaller packet size
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          createdAt: Date.now() // Add timestamp for consistent movement speed
        }]);
      }
    }

    // Occasionally send packets to sink
    if (Math.random() < 0.03 && nodes.length > 0 && packets.length < 15) {
      const sourceIdx = Math.floor(Math.random() * nodes.length);
      const sourceNode = nodes[sourceIdx];

      // Get current position from ref if available
      let startPos = [...sourceNode.position];
      const sourceRef = nodeRefs[sourceNode.id]?.ref.current;

      if (sourceRef && sourceRef.position) {
        startPos = [sourceRef.position.x, sourceRef.position.y, sourceRef.position.z];
      }

      setPackets(prev => [...prev, {
        id: `sink-packet-${Date.now()}`,
        startPos: startPos,
        endPos: [...sinkPosition],
        progress: 0,
        color: '#FF00FF', // Magenta for sink packets
        size: 3, // Smaller packet size
        sourceId: sourceNode.id,
        createdAt: Date.now() // Add timestamp for consistent movement speed
      }]);
    }

    // Update packet progress
    const now = Date.now();
    setPackets(prev => {
      return prev
        .map(packet => {
          // Calculate progress based on time elapsed for consistent speed
          const elapsed = now - (packet.createdAt || now);
          const duration = 3000; // 3 seconds to complete journey
          const newProgress = Math.min(elapsed / duration, 1);

          return {
            ...packet,
            progress: newProgress
          };
        })
        .filter(packet => packet.progress < 1);
    });
  });

  return (
    <group>
      {/* Water current visualization */}
      <WaterCurrentIndicator current={waterCurrent} />

      {/* Render sensor nodes */}
      {nodes.map((node) => (
        <SensorNode
          key={`node-${node.id}`}
          nodeId={node.id}
          position={node.position}
          color={node.color}
          isActive={node.isActive}
          isSimulating={isSimulating}
          viewMode={viewMode}
          energy={node.energy}
          waterCurrent={waterCurrent}
          isMPR={routingProtocol === 'OLSR' && node.mprs && node.mprs.length > 0}
          ref={nodeRefs[node.id]?.ref}
        />
      ))}

      {/* Render sink node */}
      <SinkNode position={sinkPosition} />

      {/* Render packets with smaller size */}
      {packets.map((packet) => {
        // Get current positions of source and target nodes if they exist
        let startPos = packet.startPos;
        let endPos = packet.endPos;

        // For packets between nodes (not to sink), use current node positions
        if (packet.sourceId !== undefined) {
          // First check nodePositions state which is updated each frame
          if (nodePositions[packet.sourceId]) {
            startPos = nodePositions[packet.sourceId];
          } else if (nodeRefs[packet.sourceId]?.ref?.current) {
            // Fallback to direct ref access
            const sourceRef = nodeRefs[packet.sourceId].ref.current;
            startPos = [sourceRef.position.x, sourceRef.position.y, sourceRef.position.z];
          }
        }

        if (packet.targetId !== undefined) {
          // First check nodePositions state which is updated each frame
          if (nodePositions[packet.targetId]) {
            endPos = nodePositions[packet.targetId];
          } else if (nodeRefs[packet.targetId]?.ref?.current) {
            // Fallback to direct ref access
            const targetRef = nodeRefs[packet.targetId].ref.current;
            endPos = [targetRef.position.x, targetRef.position.y, targetRef.position.z];
          }
        }

        // Calculate current position along the path
        const position = [
          startPos[0] + (endPos[0] - startPos[0]) * packet.progress,
          startPos[1] + (endPos[1] - startPos[1]) * packet.progress,
          startPos[2] + (endPos[2] - startPos[2]) * packet.progress
        ];

        // Render a small sphere for each packet
        return (
          <mesh key={packet.id} position={position}>
            <sphereGeometry args={[packet.size || 3, 16, 16]} />
            <meshBasicMaterial color={packet.color || '#FFFF00'} />
          </mesh>
        );
      })}

      {/* Water surface representation */}
      <WaterSurface />

      {/* Grid helper for orientation - much larger for better scale */}
      <gridHelper args={[800, 40, '#666666', '#444444']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}; 