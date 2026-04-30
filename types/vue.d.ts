import type { DefineComponent } from 'vue';
import type { WidgetOptions } from './index';

export interface JampollsWidgetProps extends Pick<WidgetOptions, 'theme' | 'vars'> {
  embedKey: string;
}

export declare const JampollsWidget: DefineComponent<JampollsWidgetProps>;
