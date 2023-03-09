import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import * as remote from '@electron/remote';
import cx from 'classnames';
import { TSourceType, ISourceApi, ISourceAddOptions } from 'services/sources';
import { WidgetDisplayData } from 'services/widgets';
import { $t } from 'services/i18n';
import { ModalLayout } from 'components-react/shared/ModalLayout';
import Display from 'components-react/shared/Display';
import { Services } from 'components-react/service-provider';
import { useVuex } from 'components-react/hooks';
import styles from './AddSource.m.less';
import { TextInput, SwitchInput } from 'components-react/shared/inputs';
import Form, { useForm } from 'components-react/shared/inputs/Form';
import Scrollable from 'components-react/shared/Scrollable';
import Utils from 'services/utils';
import uuid from 'uuid';

export default function AddSource() {
  let cameraWinId: string = "";
  const {
    SourcesService,
    ScenesService,
    WindowsService,
    WidgetsService,
    PlatformAppsService,
    EditorCommandsService,
    UserService,
    AudioService,
  } = Services;

  const sourceType = WindowsService.getChildWindowQueryParams().sourceType as TSourceType;
  const sourceAddOptions = (WindowsService.getChildWindowQueryParams().sourceAddOptions || {
    propertiesManagerSettings: {},
  }) as ISourceAddOptions;
  const widgetType = sourceAddOptions.propertiesManagerSettings?.widgetType;

  const { platform, activeScene, sources } = useVuex(() => ({
    platform: UserService.views.platform?.type,
    activeScene: ScenesService.views.activeScene,
    sources: SourcesService.views.getSources().filter(source => {
      if (!sourceAddOptions.propertiesManager) return false;
      const comparison = {
        type: sourceType,
        propertiesManager: sourceAddOptions.propertiesManager,
        appId: sourceAddOptions.propertiesManagerSettings?.appId,
        appSourceId: sourceAddOptions.propertiesManagerSettings?.appSourceId,
        isStreamlabel: sourceAddOptions.propertiesManager === 'streamlabels' || undefined,
        widgetType,
      };
      const isSameType = source.isSameType(comparison);
      return isSameType && source.sourceId !== ScenesService.views.activeSceneId;
    }),
  }));

  const [name, setName] = useState('');
  const [overrideExistingSource, setOverrideExistingSource] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.sourceId || '');
  const form = useForm();

  const existingSources = sources.map(source => ({ name: source.name, value: source.sourceId }));

  useEffect(() => {
    const suggestName = (name: string) => SourcesService.views.suggestName(name);
    let name;
    if (sourceAddOptions.propertiesManager === 'replay') {
      name = $t('Instant Replay');
    } else if (sourceAddOptions.propertiesManager === 'streamlabels') {
      name = $t('Stream Label');
    } else if (sourceAddOptions.propertiesManager === 'iconLibrary') {
      name = $t('Custom Icon');
    } else if (sourceAddOptions.propertiesManager === 'widget') {
      name = suggestName(WidgetDisplayData(platform)[widgetType].name);
    } else if (sourceAddOptions.propertiesManager === 'platformApp') {
      const app = PlatformAppsService.views.getApp(
        sourceAddOptions.propertiesManagerSettings?.appId,
      );
      const sourceName = app?.manifest.sources.find(
        source => source.id === sourceAddOptions.propertiesManagerSettings?.appSourceId,
      )?.name;

      name = suggestName(sourceName || '');
    } else {
      const sourceDescription =
        sourceType &&
        SourcesService.getAvailableSourcesTypesList().find(
          sourceTypeDef => sourceTypeDef.value === sourceType,
        )?.description;

      name = suggestName(sourceDescription || '');
    }
    setName(name);
  }, []);

  function close() {
    WindowsService.actions.closeChildWindow();
  }

  function isNewSource() {
    if (sourceType === 'scene') return false;
    return overrideExistingSource || !existingSources.length;
  }

  const canCreateNew = existingSources.length > 0 && !['scene'].includes(sourceType);

  function addExisting() {
    if (!selectedSourceId || !activeScene) return;
    if (!activeScene.canAddSource(selectedSourceId)) {
      // for now only a scene-source can be a problem
      remote.dialog.showErrorBox(
        $t('Error'),
        $t(
          'Unable to add a source: the scene you are trying to add already contains your current scene',
        ),
      );
      return;
    }
    EditorCommandsService.actions.executeCommand(
      'CreateExistingItemCommand',
      activeScene.id,
      selectedSourceId,
    );
    close();
  }

  function showCameraPage() {
    const id = uuid()
    const tmpWintowTitle = 'camera' + id
    // createOneOffWindow中winID部分会决定是否显示titleBar
    cameraWinId = WindowsService.createOneOffWindow(
      {
        componentName: 'CameraWindows',
        size: {
          width: 900,
          height: 700,
        },
        isFullScreen: true
      },
      'camera',
      tmpWintowTitle,
      true
    );
    close(); // 关闭source创建window
    const mainWindow = Utils.getMainWindow();
    mainWindow.moveTop()
    return tmpWintowTitle
  }

  function setFaceMaskSourceWindow(source: ISourceApi, winTitle: string) {
    // 正则表达式：以winTitle开头 & 以electron.exe结尾
    //const reg: RegExp = new RegExp("^(" + winTitle + ').*(electron.exe)$')
    const reg: RegExp = new RegExp("^(" + winTitle + ').*')
    const beforeFormData = source.getPropertiesFormData();
    beforeFormData.forEach((property:any) => {
      property.options?.forEach((op:any) => {
        if(reg.test(op.value)) {
          // 对于facemask，需要将捕获window默认设置为刚刚创建的AR头套窗口，同时不捕获鼠标
          source.setPropertiesFormData([
            {
              name: 'cursor',
              description: 'Capture Cursor',
              type: 'OBS_PROPERTY_BOOL',
              value: false,
              enabled:true,
              visible: true
            },
            {
              name: 'window',
              value: op.value,
              description: 'Window',
              type: 'OBS_PROPERTY_LIST',
              enabled: true,
              visible: true,
              options: property.options
            }
          ]);
          // 修改属性，将捕获窗口设置为新建的AR头套窗口，同时设置不捕获鼠标
          const afterFormData = source.getPropertiesFormData();
        }
      })
    })
    WindowsService.windows[cameraWinId].minimize();
  }

  async function addNewFaceMaskSource(settings: Dictionary<any>) {
    if(!activeScene) {
      return;
    }
    // TODO: 如果打开APP时已经有了FaceMask，需要自动打开Face Mask窗口
    const newWinTitle = showCameraPage()
        // 如果时face mask，当成windows capture处理
      const item = await EditorCommandsService.actions.return.executeCommand(
        'CreateNewItemCommand',
        activeScene.id,
        name,
        'window_capture',
        settings,
        {
          sourceAddOptions: {
            propertiesManager: sourceAddOptions.propertiesManager,
            propertiesManagerSettings: sourceAddOptions.propertiesManagerSettings,
            guestCamStreamId: sourceAddOptions.guestCamStreamId,
          },
        },
        'ar_face_mask',
      );
    const source = item?.source;
    /*
    WindowsService.windows[newWinTitle]?.on("show",() => {
      setFaceMaskSourceWindow(source, newWinTitle);
    });
    */
   // TODO 利用延时来保证Face Mask窗口已经显示，不够准确，应该使用回调
    setTimeout(setFaceMaskSourceWindow, 1000, source, newWinTitle);
  }

  async function addNew() {
    if (!activeScene) return;
    try {
      await form.validateFields();
    } catch (e: unknown) {
      return;
    }
    let source: ISourceApi;
    if (sourceAddOptions.propertiesManager === 'widget') {
      const widget = await WidgetsService.actions.return.createWidget(widgetType, name);
      source = widget.getSource();
    } else {
      const settings: Dictionary<any> = {};
      if (sourceAddOptions.propertiesManager === 'platformApp') {
        const { width, height } = await PlatformAppsService.actions.return.getAppSourceSize(
          sourceAddOptions.propertiesManagerSettings?.appId,
          sourceAddOptions.propertiesManagerSettings?.appSourceId,
        );
        settings.width = width;
        settings.height = height;
      }
      if (sourceType === "ar_face_mask") {
        addNewFaceMaskSource(settings);
        return;
      }
      const item = await EditorCommandsService.actions.return.executeCommand(
        'CreateNewItemCommand',
        activeScene.id,
        name,
        sourceType,
        settings,
        {
          sourceAddOptions: {
            propertiesManager: sourceAddOptions.propertiesManager,
            propertiesManagerSettings: sourceAddOptions.propertiesManagerSettings,
            guestCamStreamId: sourceAddOptions.guestCamStreamId,
          },
        },
        sourceType,
      );
      source = item?.source;
    }
    if (!source?.video && source?.hasProps()) {
      AudioService.actions.showAdvancedSettings(source.sourceId);
    } else if (source?.hasProps()) {
      // 显示新增source的设置页面
      SourcesService.actions.showSourceProperties(source.sourceId);
    } else {
      close();
    }
  }

  // 增加source按钮对应的点击事件
  function handleSubmit() {
    isNewSource() ? addNew() : addExisting();
  }

  function Footer() {
    return (
      <>
        <div className={styles.newSourceToggle}>
          {canCreateNew && (
            <SwitchInput
              value={overrideExistingSource}
              onChange={setOverrideExistingSource}
              label={$t('Add a new source instead')}
            />
          )}
        </div>
        <button className="button button--default" onClick={close} style={{ marginRight: '6px' }}>
          {$t('Cancel')}
        </button>
        <button className="button button--action" onClick={handleSubmit}>
          {$t('Add Source')}
        </button>
      </>
    );
  }

  return (
    <ModalLayout footer={<Footer />}>
      <div className={styles.container}>
        {!isNewSource() && (
          <>
            <div>
              <h4>
                {$t('Add Existing Source')}
                {sourceAddOptions.propertiesManager === 'widget' && existingSources.length > 0 && (
                  <span className={styles.recommendedLabel}>{$t('Recommended')}</span>
                )}
              </h4>
              <Scrollable className={styles.menuContainer}>
                <Menu
                  mode="vertical"
                  selectedKeys={[selectedSourceId]}
                  onClick={({ key }: { key: string }) => {
                    console.log('firing', key);
                    setSelectedSourceId(key);
                  }}
                  className={styles.menu}
                >
                  {existingSources.map(source => (
                    <Menu.Item key={source.value}>{source.name}</Menu.Item>
                  ))}
                </Menu>
              </Scrollable>
            </div>
            {selectedSourceId && (
              <Display sourceId={selectedSourceId} style={{ width: '200px', height: '200px' }} />
            )}
          </>
        )}
        {isNewSource() && (
          <Form form={form} name="addNewSourceForm" onFinish={addNew}>
            <h4>{$t('Add New Source')}</h4>
            <TextInput
              label={$t('Please enter the name of the source')}
              value={name}
              onInput={setName}
              name="newSourceName"
              autoFocus
              required
              uncontrolled={false}
              layout="vertical"
            />
          </Form>
        )}
      </div>
    </ModalLayout>
  );
}
