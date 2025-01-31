import { Command } from './command';
import { TSourceType } from 'services/sources';
import { ScenesService, ISceneNodeAddOptions } from 'services/scenes';
import { Inject } from 'services/core/injector';
import { $t } from 'services/i18n';

export class CreateNewItemCommand extends Command {
  @Inject() private scenesService: ScenesService;

  private sourceId: string;
  private sceneItemId: string;

  description: string;

  constructor(
    private sceneId: string,
    private name: string,
    private type: TSourceType,
    private settings?: Dictionary<any>,
    private options: ISceneNodeAddOptions = {},
    private realType: TSourceType = type,
  ) {
    super();
    this.description = $t('Create %{sourceName}', { sourceName: name });
  }

  execute() {
    this.options.id = this.options.id || this.sceneItemId;
    this.options.sourceAddOptions.sourceId =
      this.options.sourceAddOptions.sourceId || this.sourceId;

    const item = this.scenesService.views
      .getScene(this.sceneId)
      .createAndAddSource(this.name, this.type, this.settings, this.options, this.realType);

    this.sourceId = item.sourceId;
    this.sceneItemId = item.id;
    return item;
  }

  rollback() {
    this.scenesService.views.getScene(this.sceneId).removeItem(this.sceneItemId);
  }
}
