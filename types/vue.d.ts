import type { DefineComponent } from 'vue';
import type { WidgetOptions } from './index';

export interface JampollsWidgetProps extends Pick<WidgetOptions, 'theme' | 'layout' | 'vars' | 'apiUrl'> {
  embedKey: string;
}

export declare const JampollsWidget: DefineComponent<JampollsWidgetProps>;
