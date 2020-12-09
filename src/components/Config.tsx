import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'src/components/shared/Select';
import { ClashGeneralConfig, DispatchFn, State } from 'src/store/types';
import { ClashAPIConfig } from 'src/types';

import {
  getClashAPIConfig,
  getLatencyTestUrl,
  getSelectedChartStyleIndex,
} from '../store/app';
import {
  fetchConfigs,
  getConfigs,
  reloadConfigs,
  updateConfigs,
} from '../store/configs';
import { openModal } from '../store/modals';
import Button from './Button';
import s0 from './Config.module.css';
import ContentHeader from './ContentHeader';
import Input, { SelfControlledInput } from './Input';
import { Selection2 } from './Selection';
import { connect, useStoreActions } from './StateProvider';
import Switch from './SwitchThemed';
import ToggleSwitch from './ToggleSwitch';
import TrafficChartSample from './TrafficChartSample';

const { useEffect, useState, useCallback, useRef, useMemo } = React;

const propsList = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];

const optionsRule = [
  {
    label: 'Global',
    value: 'Global',
  },
  {
    label: 'Rule',
    value: 'Rule',
  },
  {
    label: 'Direct',
    value: 'Direct',
  },
];

const optionsLogLevel = [
  {
    label: 'Debug',
    value: 'debug',
  },
  {
    label: 'Warning',
    value: 'warning',
  },
  {
    label: 'Info',
    value: 'info',
  },
  {
    label: 'Error',
    value: 'error',
  },
  {
    label: 'Silent',
    value: 'silent',
  },
];

const portFields = [
  { key: 'port', label: 'HTTP Proxy Port' },
  { key: 'socks-port', label: 'SOCKS5 Proxy Port' },
  { key: 'mixed-port', label: 'Mixed Port' },
  { key: 'redir-port', label: 'Redir Port' },
];

const langOptions = [
  ['zh', '中文'],
  ['en', 'English'],
];

const mapState = (s: State) => ({
  configs: getConfigs(s),
  apiConfig: getClashAPIConfig(s),
});

const mapState2 = (s: State) => ({
  selectedChartStyleIndex: getSelectedChartStyleIndex(s),
  latencyTestUrl: getLatencyTestUrl(s),
  apiConfig: getClashAPIConfig(s),
});

const ConfigPath = '/root/.config/clash/config.yaml';

const Config = connect(mapState2)(ConfigImpl);
export default connect(mapState)(ConfigContainer);

function ConfigContainer({ dispatch, configs, apiConfig }) {
  useEffect(() => {
    dispatch(fetchConfigs(apiConfig));
  }, [dispatch, apiConfig]);
  return <Config configs={configs} />;
}

type ConfigImplProps = {
  dispatch: DispatchFn;
  configs: ClashGeneralConfig;
  selectedChartStyleIndex: number;
  latencyTestUrl: string;
  apiConfig: ClashAPIConfig;
};

function ConfigImpl({
  dispatch,
  configs,
  selectedChartStyleIndex,
  latencyTestUrl,
  apiConfig,
}: ConfigImplProps) {
  const [configState, setConfigStateInternal] = useState(configs);
  const refConfigs = useRef(configs);
  useEffect(() => {
    if (refConfigs.current !== configs) {
      setConfigStateInternal(configs);
    }
    refConfigs.current = configs;
  }, [configs]);

  const openAPIConfigModal = useCallback(() => {
    dispatch(openModal('apiConfig'));
  }, [dispatch]);

  const setConfigState = useCallback(
    (name, val) => {
      setConfigStateInternal({
        ...configState,
        [name]: val,
      });
    },
    [configState]
  );

  const handleSwitchOnChange = useCallback(
    (checked: boolean) => {
      const name = 'allow-lan';
      const value = checked;
      setConfigState(name, value);
      dispatch(updateConfigs(apiConfig, { 'allow-lan': value }));
    },
    [apiConfig, dispatch, setConfigState]
  );

  const handleReloadBtn = () => {
    dispatch(reloadConfigs(apiConfig, ConfigPath));
  };

  const handleInputOnChange = useCallback(
    (e) => {
      const target = e.target;
      const { name } = target;
      const { value } = target;
      switch (target.name) {
        case 'mode':
        case 'log-level':
          setConfigState(name, value);
          dispatch(updateConfigs(apiConfig, { [name]: value }));
          break;
        case 'redir-port':
        case 'socks-port':
        case 'mixed-port':
        case 'port':
          if (target.value !== '') {
            const num = parseInt(target.value, 10);
            if (num < 0 || num > 65535) return;
          }
          setConfigState(name, value);
          break;
        default:
          return;
      }
    },
    [apiConfig, dispatch, setConfigState]
  );

  const { selectChartStyleIndex, updateAppConfig } = useStoreActions();

  const handleInputOnBlur = useCallback(
    (e) => {
      const target = e.target;
      const { name, value } = target;
      switch (name) {
        case 'port':
        case 'socks-port':
        case 'mixed-port':
        case 'redir-port': {
          const num = parseInt(value, 10);
          if (num < 0 || num > 65535) return;
          dispatch(updateConfigs(apiConfig, { [name]: num }));
          break;
        }
        case 'latencyTestUrl': {
          updateAppConfig(name, value);
          break;
        }
        default:
          throw new Error(`unknown input name ${name}`);
      }
    },
    [apiConfig, dispatch, updateAppConfig]
  );

  const mode = useMemo(() => {
    const m = configState.mode;
    return typeof m === 'string' && m[0].toUpperCase() + m.slice(1);
  }, [configState.mode]);

  const { t, i18n } = useTranslation();

  return (
    <div>
      <ContentHeader title={t('Config')} />
      <div className={s0.root}>
        {portFields.map((f) =>
          configState[f.key] !== undefined ? (
            <div key={f.key}>
              <div className={s0.label}>{f.label}</div>
              <Input
                name={f.key}
                value={configState[f.key]}
                onChange={handleInputOnChange}
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ name: string; value: any; onChange: (e: an... Remove this comment to see the full error message
                onBlur={handleInputOnBlur}
              />
            </div>
          ) : null
        )}
        <div>
          <div className={s0.label}>Allow LAN</div>
          <Switch
            name="allow-lan"
            checked={configState['allow-lan']}
            onChange={handleSwitchOnChange}
          />
        </div>

        <div>
          <div className={s0.label}>Mode</div>
          <ToggleSwitch
            options={optionsRule}
            name="mode"
            value={mode}
            onChange={handleInputOnChange}
          />
        </div>

        <div>
          <div className={s0.label}>Log Level</div>
          <ToggleSwitch
            options={optionsLogLevel}
            name="log-level"
            value={configState['log-level']}
            onChange={handleInputOnChange}
          />
        </div>
      </div>

      <div className={s0.sep}>
        <div />
      </div>

      <div className={s0.section}>
        <div>
          <div className={s0.label}>{t('chart_style')}</div>
          <Selection2
            OptionComponent={TrafficChartSample}
            optionPropsList={propsList}
            selectedIndex={selectedChartStyleIndex}
            onChange={selectChartStyleIndex}
          />
        </div>
        <div className={s0.narrow}>
          <div className={s0.label}>{t('latency_test_url')}</div>
          <SelfControlledInput
            name="latencyTestUrl"
            type="text"
            value={latencyTestUrl}
            onBlur={handleInputOnBlur}
          />
        </div>
        <div style={{ maxWidth: 360 }}>
          <div className={s0.label}>Reload Config</div>
          <SelfControlledInput
            name="reloadConfigBtn"
            type="text"
            value={ConfigPath}
            onBlur={handleInputOnBlur}
          />
          <div className={s0.label}>
            <Button label="Reload" onClick={handleReloadBtn} />
          </div>
        </div>
        <div>
          <div className={s0.label}>Action</div>
          <Button label="Switch backend" onClick={openAPIConfigModal} />
        </div>
        <div>
          <div className={s0.label}>{t('lang')}</div>
          <div className={s0.narrow}>
            <Select
              options={langOptions}
              selected={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
