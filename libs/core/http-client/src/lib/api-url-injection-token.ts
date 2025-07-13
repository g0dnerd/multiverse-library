import { InjectionToken } from '@angular/core';

export interface EnvironmentModel {
  production: boolean;
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<EnvironmentModel>(
  'Application Config'
);
