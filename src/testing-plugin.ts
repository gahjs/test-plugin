import { GahPlugin, GahPluginConfig } from '@gah/shared';
import { X_OK } from 'constants';

import { TestingConfig } from './testing-config';
export class TestingPlugin extends GahPlugin {
  constructor() {
    super('TestingPlugin');
  }

  public async onInstall(existingCfg: TestingConfig): Promise<GahPluginConfig> {
    const newCfg = new TestingConfig();

    this.loggerService.log('TestPlugin 1.0.0 configuration started');

    newCfg.someSetting = await this.promptService.input({
      msg: 'Please enter a string configuration property',
      default: 'default value',
      enabled: () => !(existingCfg?.someSetting),
      validator: (val: string) => val.endsWith('.json')
    }) ?? existingCfg.someSetting; // Defaults back to the old value in case undefined gets returned

    newCfg.somePathSetting = await this.promptService.fuzzyPath({
      msg: 'Please enter a (fuzzy)path configuration property',
      default: 'test/directory',
      enabled: () => !(existingCfg?.somePathSetting),
      itemType: 'file'
    }) ?? existingCfg.somePathSetting; // Defaults back to the old value in case undefined gets returned

    newCfg.someArraySetting = await this.promptService.checkbox({
      msg: 'Please select options',
      default: 'test/directory',
      enabled: () => !(existingCfg?.someArraySetting),
      choices: () => ['Option1', 'Option2', 'Option3', 'Option4', 'Option5']
    }) ?? existingCfg.someArraySetting; // Defaults back to the old value in case undefined gets returned

    return newCfg;
  }

  public onInit() {
    // Register a handler that gets called synchronously if the corresponding event occured. Some events can be called multiple times!
    this.registerEventListener('AFTER_INSTALL', (event) => {
      this.loggerService.log(`AFTER_INSTALL has been called for configured modules ${event.gahFile?.modules.map(m => m.moduleName).filter(x => !!x).join(', ')}`);
      this.loggerService.log(`PluginConfig -> someSetting : ${this.cfg.someSetting}`);
    });

    this.registerEventListener('BEFORE_ADJUST_ANGULAR_JSON', (event) => {
      this.loggerService.log(`BEFORE_ADJUST_ANGULAR_JSON has been called. ProjectType from ngJson is: ${event.ngJson.projects['gah-host'].projectType}`);
    });


    this.registerEventListener('AFTER_ADJUST_GITIGNORE', async () => {
      this.loggerService.log('AFTER_ADJUST_GITIGNORE has beeen called');
      await this.fileSystemService.saveFile('test.txt', 'AFTER_ADJUST_GITIGNORE was here');
      this.loggerService.log('AFTER_ADJUST_GITIGNORE ran an async operation');
    });

    this.registerCommandHandler('testing', (args) => {
      this.loggerService.log('Test command works! ¯\\_(ツ)_/¯');
      this.loggerService.log(args.join(', '));
      return true;
    });
  }

  /**
   * For convenience the correctly casted configuration
   */
  private get cfg() {
    return this.config as TestingConfig;
  }
}
