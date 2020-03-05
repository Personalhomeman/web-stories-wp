/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import { CSSTransition } from 'react-transition-group';
import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { rgba } from 'polished';

/**
 * Internal dependencies
 */
import { PatternPropType } from '../../types';
import { useKeyDownEffect } from '../keyboard';
import CurrentColorPicker from './currentColorPicker';
import GradientPicker from './gradientPicker';
import Header from './header';
import useColor from './useColor';

const CONTAINER_PADDING = 15;

const Container = styled.div`
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bg.v7};
  color: ${({ theme }) => theme.colors.fg.v1};
  width: 240px;
  font-family: ${({ theme }) => theme.fonts.body1.family};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.picker-appear {
    opacity: 0.01;
    margin-top: -10px;

    &.picker-appear-active {
      opacity: 1;
      margin-top: 0;
      transition: 300ms ease-out;
      transition-property: opacity, margin-top;
    }
  }
`;

const Body = styled.div`
  border-top: 1px solid ${({ theme }) => rgba(theme.colors.fg.v2, 0.2)};
  padding: ${CONTAINER_PADDING}px;
`;

function ColorPicker({ color, onChange, onClose }) {
  const {
    state: { type, stops, currentStopIndex, currentColor, generatedColor },
    actions: {
      load,
      updateCurrentColor,
      reverseStops,
      selectStop,
      addStopAt,
      removeCurrentStop,
      rotateClockwise,
      moveCurrentStopTo,
      setToSolid,
      setToGradient,
    },
  } = useColor();

  useEffect(() => {
    if (generatedColor) {
      onChange(generatedColor);
    }
  }, [color, generatedColor, onChange]);

  useEffect(() => {
    if (color) {
      load(color);
    }
  }, [color, load]);

  const ref = useRef();

  // Record this to be able to restore focus on close
  const previousFocus = useRef(window.activeElement);
  const handleClose = useCallback(() => {
    // If possible, restore focus to previously selected element
    if (previousFocus.current) {
      previousFocus.current.focus();
    }
    onClose();
  }, [onClose]);

  useKeyDownEffect(ref, 'esc', handleClose);

  return (
    <CSSTransition in appear={true} classNames="picker" timeout={300}>
      <Container ref={ref}>
        <Header
          type={type}
          setToSolid={setToSolid}
          setToGradient={setToGradient}
          onClose={handleClose}
        />
        {type !== 'solid' && (
          <Body>
            <GradientPicker
              stops={stops}
              currentStopIndex={currentStopIndex}
              onSelect={selectStop}
              onReverse={reverseStops}
              onAdd={addStopAt}
              onDelete={removeCurrentStop}
              onRotate={rotateClockwise}
              onMove={moveCurrentStopTo}
            />
          </Body>
        )}
        <Body>
          <CurrentColorPicker
            color={currentColor}
            onChange={updateCurrentColor}
          />
        </Body>
      </Container>
    </CSSTransition>
  );
}

ColorPicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  color: PatternPropType,
};

ColorPicker.defaultProps = {
  color: null,
  onClose: () => {},
};

export default ColorPicker;
