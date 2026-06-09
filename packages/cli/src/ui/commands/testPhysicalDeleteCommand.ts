/**
 * @license
 * Copyright 2025 Qwen Code
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand } from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';
import {
  CompressionStatus,
  createDebugLogger,
} from '@qwen-code/qwen-code-core';

const debugLogger = createDebugLogger('TEST_PD');

export const testPhysicalDeleteInsertCommand: SlashCommand = {
  name: 'test-pd-insert',
  get description() {
    return t('Test: insert a compression marker into history');
  },
  kind: CommandKind.BUILT_IN,
  supportedModes: ['interactive'] as const,
  hidden: true,
  action: async (context) => {
    context.ui.addItem(
      {
        type: 'info',
        text: 'Test compression marker inserted.',
      },
      Date.now(),
    );

    context.ui.addItem(
      {
        type: 'compression',
        compression: {
          isPending: false,
          originalTokenCount: 0,
          newTokenCount: 0,
          compressionStatus: CompressionStatus.COMPRESSED,
        },
      },
      Date.now(),
    );
  },
};

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
    const ui = context.ui as {
      physicalDeleteBeforeCompression?: () => number;
      getHistory?: () => ReadonlyArray<{ type: string }>;
    };

    const getHistory = ui.getHistory;
    const physicalDelete = ui.physicalDeleteBeforeCompression;

    if (!physicalDelete) {
      context.ui.addItem(
        {
          type: 'error',
          text: 'physicalDeleteBeforeCompression not available',
        },
        Date.now(),
      );
      return;
    }

    if (getHistory) {
      const snapshot = getHistory();
      const types = snapshot.map((i) => i.type);
      const compressionCount = types.filter((t) => t === 'compression').length;
      context.ui.addItem(
        {
          type: 'info',
          text: `[DEBUG] items=${snapshot.length}, compression_markers=${compressionCount}, types=[${types.join(', ')}]`,
        },
        Date.now(),
      );
    }

    try {
      const deleted = physicalDelete();
      debugLogger.debug(`[TEST_PD] physicalDelete returned: ${deleted}`);
      debugLogger.debug('[TEST_PD] Action completed');
    } catch (e) {
      debugLogger.error(
        `[TEST_PD] Error in physicalDelete: ${e instanceof Error ? e.message : String(e)}`,
      );
      context.ui.addItem(
        {
          type: 'error',
          text: `Error: ${e instanceof Error ? e.message : String(e)}`,
        },
        Date.now(),
      );
    }
  },
};
