import React from 'react';
import styled from 'styled-components';
import { NavLink as RouterNavLink } from 'react-router-dom';

const SidebarContainer = styled.aside`
  width: 220px;
  background-color: #fff;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
`;

const NavLink = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #333;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  &.active {
    font-weight: bold;
    background-color: #e3f2fd;
    color: #1a73e8;
  }
`;

const NavSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  padding: 10px 20px;
  font-size: 14px;
  text-transform: uppercase;
  color: #757575;
  font-weight: 500;
`;

function Sidebar() {
  return (
    <SidebarContainer>
      <NavSection>
        <SectionTitle>Simulation</SectionTitle>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/simulation">Run Simulation</NavLink>
      </NavSection>

      <NavSection>
        <SectionTitle>Configuration</SectionTitle>
        <NavLink to="/settings">Settings</NavLink>
      </NavSection>

      <NavSection>
        <SectionTitle>Help</SectionTitle>
        <NavLink to="/about">About</NavLink>
      </NavSection>
    </SidebarContainer>
  );
}

export default Sidebar; 