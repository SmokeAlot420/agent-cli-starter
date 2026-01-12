/**
 * UltrathinkText Component
 *
 * Renders "ULTRATHINK" with a terminal phosphor gradient effect.
 * Colors flow from forest green -> bright green -> cyan
 * mimicking old-school CRT monitor glow aesthetics.
 */

import React from 'react';
import { Text } from 'ink';

/** Props for UltrathinkText component */
export interface UltrathinkTextProps {
  /** Whether to render in bold */
  bold?: boolean;
}

/**
 * Phosphor gradient colors for each letter position
 * Creates a dark green -> bright green -> cyan glow effect
 */
const PHOSPHOR_COLORS: string[] = [
  'green',       // U
  'green',       // L
  'green',       // T
  'greenBright', // R
  'greenBright', // A
  'greenBright', // T
  'cyan',        // H
  'cyan',        // I
  'cyan',        // N
  'cyan',        // K
];

const ULTRATHINK_LETTERS = 'ULTRATHINK'.split('');

/**
 * Renders "ULTRATHINK" with terminal phosphor gradient
 *
 * @example
 * ```tsx
 * <UltrathinkText />
 * // Renders: ULTRATHINK with green->cyan gradient
 *
 * <UltrathinkText bold />
 * // Renders: ULTRATHINK bold with gradient
 * ```
 */
export function UltrathinkText({ bold = false }: UltrathinkTextProps): React.ReactElement {
  return (
    <>
      {ULTRATHINK_LETTERS.map((letter, index) => (
        <Text key={index} color={PHOSPHOR_COLORS[index]} bold={bold}>
          {letter}
        </Text>
      ))}
    </>
  );
}

export default UltrathinkText;
