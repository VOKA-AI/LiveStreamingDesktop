import { CombinableCommand } from './combinable-command';
import { TObsFormData } from 'components/obs/inputs/ObsInput';
import { SourcesService } from 'services/sources';
import { Inject } from 'services/core/injector';
import { $t } from 'services/i18n';

export class EditSourcePropertiesCommand extends CombinableCommand {
  @Inject() sourcesService: SourcesService;

  description: string;

  private beforeFormData: TObsFormData;
  private afterFormData: TObsFormData;

  constructor(private sourceId: string, private formData: TObsFormData) {
    super();

    this.description = $t('Edit %{sourceName}', {
      sourceName: this.sourcesService.views.getSource(this.sourceId).name,
    });
  }

  execute() {
    const source = this.sourcesService.views.getSource(this.sourceId);

    //console.log("------------edit source properties------------------")
    this.beforeFormData = source.getPropertiesFormData();
    source.setPropertiesFormData(this.afterFormData || this.formData);
    this.afterFormData = source.getPropertiesFormData();
    //console.log("------------edit source properties------------------")
  }

  rollback() {
    this.sourcesService.views.getSource(this.sourceId).setPropertiesFormData(this.beforeFormData);
  }

  shouldCombine(other: EditSourcePropertiesCommand) {
    return this.sourceId === other.sourceId;
  }

  combine(other: EditSourcePropertiesCommand) {
    this.afterFormData = other.afterFormData;
  }
}
