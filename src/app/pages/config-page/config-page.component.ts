import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GlobalConfigService } from '../../features/config/global-config.service';
import {
  GLOBAL_CONFIG_FORM_CONFIG,
  GLOBAL_PRODUCTIVITY_FORM_CONFIG,
  GLOBAL_SYNC_FORM_CONFIG,
} from '../../features/config/global-config-form-config.const';
import {
  ConfigFormConfig,
  ConfigFormSection,
  GlobalConfigSectionKey,
  GlobalConfigState,
  GlobalSectionConfig,
} from '../../features/config/global-config.model';
import { Subscription } from 'rxjs';
import { ProjectCfgFormKey } from '../../features/project/project.model';
import { environment } from '../../../environments/environment';
import { T } from '../../t.const';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { versions } from '../../../environments/versions';

@Component({
  selector: 'config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigPageComponent implements OnInit, OnDestroy {
  T: typeof T = T;
  globalConfigFormCfg: ConfigFormConfig;
  globalSyncProviderFormCfg: ConfigFormConfig;
  globalProductivityConfigFormCfg: ConfigFormConfig;

  globalCfg?: GlobalConfigState;

  appVersion: string = environment.version;
  versions?: any = versions;

  private _subs: Subscription = new Subscription();

  constructor(
    private readonly _cd: ChangeDetectorRef,
    public readonly configService: GlobalConfigService,
  ) {
    // somehow they are only unproblematic if assigned here
    this.globalConfigFormCfg = GLOBAL_CONFIG_FORM_CONFIG;
    this.globalSyncProviderFormCfg = GLOBAL_SYNC_FORM_CONFIG;
    this.globalProductivityConfigFormCfg = GLOBAL_PRODUCTIVITY_FORM_CONFIG;
  }

  ngOnInit(): void {
    this._subs.add(
      this.configService.cfg$.subscribe((cfg) => {
        this.globalCfg = cfg;
        this._cd.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  trackBySectionKey(
    i: number,
    section: ConfigFormSection<{ [key: string]: any }>,
  ): string {
    return section.key;
  }

  saveGlobalCfg($event: {
    sectionKey: GlobalConfigSectionKey | ProjectCfgFormKey;
    config: any;
  }): void {
    const config = $event.config;
    const sectionKey = $event.sectionKey as GlobalConfigSectionKey;

    if (!sectionKey || !config) {
      throw new Error('Not enough data');
    } else {
      this.configService.updateSection(sectionKey, config);
    }
  }

  toggleDarkMode(change: MatSlideToggleChange): void {
    this.configService.updateSection('misc', { isDarkMode: change.checked });
  }

  getGlobalCfgSection(
    sectionKey: GlobalConfigSectionKey | ProjectCfgFormKey,
  ): GlobalSectionConfig {
    return (this.globalCfg as any)[sectionKey];
  }
}
