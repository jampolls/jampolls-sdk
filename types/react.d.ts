import type { FC, CSSProperties } from 'react';
import type { WidgetOptions } from './index';

export interface JampollsWidgetProps extends WidgetOptions {
  embedKey: string;
  className?: string;
  style?: CSSProperties;
}

export declare const JampollsWidget: FC<JampollsWidgetProps>;
