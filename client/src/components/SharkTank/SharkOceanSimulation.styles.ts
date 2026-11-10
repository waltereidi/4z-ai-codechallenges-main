import styled from 'styled-components';

export const OceanSimulationContainer = styled.div.attrs({
  className: 'ocean-container'
})`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 560px;
  background: #020b18;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 229, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  position: relative;
`;
