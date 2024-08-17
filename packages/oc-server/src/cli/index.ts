#!/usr/bin/env node
process.env.VITE_CJS_IGNORE_WARNING = 'true';

import { cli } from './cli';

cli();
