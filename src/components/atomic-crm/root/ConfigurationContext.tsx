import { useMemo } from "react";
import { useStore, useTranslate } from "ra-core";

import type { DealStage, LabeledValue, NoteStatus } from "../types";
import {
  defaultConfiguration,
  defaultDealStages,
  defaultNoteStatuses,
  defaultTaskTypes,
} from "./defaultConfiguration";

export const CONFIGURATION_STORE_KEY = "app.configuration";

export interface ConfigurationContextValue {
  companySectors: LabeledValue[];
  currency: string;
  dealCategories: LabeledValue[];
  dealPipelineStatuses: string[];
  dealStages: DealStage[];
  noteStatuses: NoteStatus[];
  taskTypes: LabeledValue[];
  title: string;
  darkModeLogo: string;
  lightModeLogo: string;
}

/**
 * The stored configuration, exactly as saved. Use it where the configuration
 * is edited (settings pages); everywhere else use `useConfigurationContext`.
 */
export const useRawConfigurationContext = () => {
  const [config] = useStore<ConfigurationContextValue>(
    CONFIGURATION_STORE_KEY,
    defaultConfiguration,
  );
  // Merge with defaults so that missing fields in stored config
  // fall back to default values (e.g. when new settings are added)
  return useMemo(() => ({ ...defaultConfiguration, ...config }), [config]);
};

/**
 * The configuration for display: default labels of deal stages, task types and
 * note statuses are translated into the interface language (labels a user
 * customised in the settings are shown as typed).
 */
export const useConfigurationContext = () => {
  const config = useRawConfigurationContext();
  const translate = useTranslate();
  return useMemo(() => {
    const translateLabels = <T extends LabeledValue>(
      items: T[],
      defaults: LabeledValue[],
      group: string,
    ): T[] =>
      items.map((item) =>
        defaults.some((d) => d.value === item.value && d.label === item.label)
          ? {
              ...item,
              label: translate(`tawlity.config.${group}.${item.value}`, {
                _: item.label,
              }),
            }
          : item,
      );
    return {
      ...config,
      dealStages: translateLabels(
        config.dealStages,
        defaultDealStages,
        "deal_stages",
      ),
      taskTypes: translateLabels(
        config.taskTypes,
        defaultTaskTypes,
        "task_types",
      ),
      noteStatuses: translateLabels(
        config.noteStatuses,
        defaultNoteStatuses,
        "note_statuses",
      ),
    };
  }, [config, translate]);
};

export const useConfigurationUpdater = () => {
  const [, setConfig] = useStore<ConfigurationContextValue>(
    CONFIGURATION_STORE_KEY,
  );
  return setConfig;
};
