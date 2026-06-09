/**
 * @license
 * Copyright 2025 Qwen Code
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand } from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';

export const testPhysicalDeleteCommand: SlashCommand = {
  name: 'test-physical-delete',
  altNames: ['test-pd'],
  get description() {
    return t('Test: physically delete history before first compression marker');
  },
  kind: CommandKind.BUILT_IN,
  supportedModes: ['interactive'] as const,
  hidden: true,
  action: async (context) => {
    const { ui } = context;
    const physicalDelete = (
      ui as { physicalDeleteBeforeCompression?: () => void }
    ).physicalDeleteBeforeCompression;

    if (!physicalDelete) {
      ui.addItem(
        {
          type: 'error',
          text: 'physicalDeleteBeforeCompression not available in UI context',
        },
        Date.now(),
      );
      return;
    }

    physicalDelete();

    ui.addItem(
      { type: 'info', text: 'Physical delete executed. Check history length.' },
      Date.now(),
    );
  },
};
